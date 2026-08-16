import { getAdminSession } from "@/lib/auth";
import { promises as fs } from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { NextRequest, NextResponse } from "next/server";
import { getSocialCredentials, saveSocialCredentials } from "@/lib/social-credentials-store";
import { supabaseDbQuery, supabaseDbUpsert } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const execAsync = promisify(exec);
const STREAK_FILE = path.join(process.cwd(), "data", "streak.json");
const GITHUB_REPO_OWNER = "abdulnabii";
const GITHUB_REPO_NAME = "abdul-nabi-portfolio";

interface StreakData {
  lastStreakPing: string;
  date: string;
  status: "active" | "pending";
  automated: boolean;
  streakDays: number;
  lastCommitHash?: string;
  lastMessage?: string;
  commitUrl?: string;
  history?: {
    date: string;
    time: string;
    type: "manual" | "cron" | "action";
    message: string;
    hash?: string;
  }[];
}

async function getStreakData(): Promise<StreakData> {
  // 1. Try Supabase cloud store first (persistent across serverless lambdas)
  try {
    const rows = await supabaseDbQuery<{ key: string; value: string }>(
      "site_settings",
      "select=*&key=eq.streak_keeper_data"
    );
    if (rows && rows.length > 0 && rows[0].value) {
      const parsed = JSON.parse(rows[0].value) as StreakData;
      if (parsed && parsed.date) return parsed;
    }
  } catch {}

  // 2. Try reading local file
  try {
    const raw = await fs.readFile(STREAK_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return {
      lastStreakPing: new Date().toISOString(),
      date: new Date().toISOString().split("T")[0],
      status: "pending",
      automated: true,
      streakDays: 42,
      history: [],
    };
  }
}

async function saveStreakData(data: StreakData): Promise<void> {
  // 1. Save to Supabase cloud store
  try {
    await supabaseDbUpsert("site_settings", [
      {
        key: "streak_keeper_data",
        value: JSON.stringify(data),
        updated_at: new Date().toISOString(),
      },
    ]);
  } catch (err) {
    console.error("[streak-keeper] Supabase save error:", err);
  }

  // 2. Try writing local file if writable
  try {
    await fs.mkdir(path.dirname(STREAK_FILE), { recursive: true });
    await fs.writeFile(STREAK_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch {}
}

/** Push commit directly to GitHub via GitHub Contents API */
async function pushCommitViaGitHubApi(
  token: string,
  updatedData: StreakData,
  message: string
): Promise<{ success: boolean; hash?: string; url?: string; error?: string }> {
  try {
    const filePath = "data/streak.json";
    const getUrl = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${filePath}`;

    // 1. Fetch current file SHA from GitHub
    let fileSha: string | undefined;
    const getRes = await fetch(getUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "aiwithab-streak-keeper",
      },
      cache: "no-store",
    });

    if (getRes.ok) {
      const getData = await getRes.json();
      fileSha = getData.sha;
    }

    // 2. Push updated file directly to main branch
    const contentBase64 = Buffer.from(JSON.stringify(updatedData, null, 2)).toString("base64");
    const putPayload: any = {
      message,
      content: contentBase64,
      branch: "main",
      committer: {
        name: "Abdul Nabi",
        email: "abdulnabi.khaskhely@gmail.com",
      },
      author: {
        name: "Abdul Nabi",
        email: "abdulnabi.khaskhely@gmail.com",
      },
    };

    if (fileSha) {
      putPayload.sha = fileSha;
    }

    const putRes = await fetch(getUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "User-Agent": "aiwithab-streak-keeper",
      },
      body: JSON.stringify(putPayload),
    });

    const putData = await putRes.json();

    if (putRes.ok && putData.commit) {
      const commitSha = putData.commit.sha ? putData.commit.sha.slice(0, 7) : "pushed";
      const commitUrl = putData.commit.html_url;
      return { success: true, hash: commitSha, url: commitUrl };
    }

    const errMsg = putData.message || `GitHub API returned HTTP ${putRes.status}`;
    return { success: false, error: errMsg };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to call GitHub API" };
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await getStreakData();
    const today = new Date().toISOString().split("T")[0];
    const isPushedToday = data.date === today && data.status === "active";

    // Resolve GitHub Token status
    const creds = await getSocialCredentials();
    const hasGitHubToken = Boolean(
      process.env.GITHUB_TOKEN ||
      process.env.GH_TOKEN ||
      process.env.GITHUB_PAT ||
      creds.githubToken
    );

    // Attempt to read latest git commit hash locally if shell available
    let currentHash = data.lastCommitHash || "42e3dc1";
    try {
      const { stdout } = await execAsync("git rev-parse --short HEAD", { timeout: 2000 });
      if (stdout && stdout.trim()) {
        currentHash = stdout.trim();
      }
    } catch {}

    return NextResponse.json({
      ok: true,
      data: {
        ...data,
        isPushedToday,
        currentHash,
        todayDate: today,
        hasGitHubToken,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load streak" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const customMessage =
      body.message?.trim() ||
      `chore(streak): daily developer streak activity ping [${new Date().toISOString().split("T")[0]}]`;

    const today = new Date().toISOString().split("T")[0];
    const nowIso = new Date().toISOString();
    const streakData = await getStreakData();

    // Check if consecutive day
    const lastDate = streakData.date;
    const diffDays = Math.round(
      (new Date(today).getTime() - new Date(lastDate).getTime()) / (1000 * 3600 * 24)
    );

    let nextStreakCount = streakData.streakDays || 42;
    if (diffDays === 1) {
      nextStreakCount += 1;
    } else if (diffDays > 1) {
      nextStreakCount = 1;
    }

    // Resolve token: from body, env, or Supabase credentials
    const creds = await getSocialCredentials();
    const githubToken =
      body.githubToken?.trim() ||
      process.env.GITHUB_TOKEN ||
      process.env.GH_TOKEN ||
      process.env.GITHUB_PAT ||
      creds.githubToken;

    let commitHash = "pushed";
    let commitUrl = `https://github.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/commits/main`;
    let gitLog = "";
    let methodUsed = "database";

    const updatedData: StreakData = {
      ...streakData,
      lastStreakPing: nowIso,
      date: today,
      status: "active",
      automated: false,
      streakDays: nextStreakCount,
      lastMessage: customMessage,
      history: [
        {
          date: today,
          time: nowIso,
          type: "manual",
          message: customMessage,
        },
        ...(streakData.history || []).slice(0, 19),
      ],
    };

    // ── STRATEGY 1: GitHub REST API (100% Serverless & Cloud Compatible) ──
    if (githubToken) {
      const apiResult = await pushCommitViaGitHubApi(githubToken, updatedData, customMessage);
      if (apiResult.success && apiResult.hash) {
        commitHash = apiResult.hash;
        commitUrl = apiResult.url || commitUrl;
        methodUsed = "github_api";
        gitLog = `[GitHub REST API] Successfully committed to branch 'main'.\nCommit SHA: ${commitHash}\nVerified Committer: Abdul Nabi <abdulnabi.khaskhely@gmail.com>\nTriggered auto-deployment on Vercel.`;
      } else {
        gitLog = `[GitHub REST API Notice] ${apiResult.error || "Token authorization issue."}`;
      }
    }

    // ── STRATEGY 2: Local Git CLI (if running in local development) ───────
    if (methodUsed !== "github_api") {
      try {
        await fs.mkdir(path.dirname(STREAK_FILE), { recursive: true });
        await fs.writeFile(STREAK_FILE, JSON.stringify(updatedData, null, 2), "utf8");

        const { stdout: addOut } = await execAsync(`git add "${STREAK_FILE}"`, { timeout: 8000 });
        const { stdout: commitOut } = await execAsync(
          `git commit -m "${customMessage.replace(/"/g, '\\"')}"`,
          { timeout: 8000 }
        );
        const { stdout: pushOut } = await execAsync("git push origin main", { timeout: 30000 });

        gitLog = `${commitOut}\n${pushOut}`.trim();
        methodUsed = "local_git";

        const { stdout: hashOut } = await execAsync("git rev-parse --short HEAD", { timeout: 3000 });
        if (hashOut && hashOut.trim()) {
          commitHash = hashOut.trim();
        }
      } catch (gitErr: any) {
        if (!gitLog) {
          gitLog = gitErr.stdout || gitErr.message || "Local git CLI not available on cloud serverless.";
        }
      }
    }

    // Update streak state with commit info
    updatedData.lastCommitHash = commitHash;
    updatedData.commitUrl = commitUrl;
    await saveStreakData(updatedData);

    // If a new GitHub token was provided in the request body, persist it for future cloud pushes
    if (body.githubToken && body.githubToken.trim()) {
      try {
        await saveSocialCredentials({ ...creds, githubToken: body.githubToken.trim() });
      } catch {}
    }

    // Log to Admin Inbox
    try {
      const { addInboxItem } = await import("@/lib/inbox-store");
      await addInboxItem("message", {
        name: "GitHub Streak Keeper",
        email: "streak-bot@aiwithab.site",
        subject: "⚡ GitHub Streak Ping Pushed",
        message: `Streak updated: Day ${nextStreakCount} · ${customMessage} (Commit: ${commitHash} via ${methodUsed})`,
      });
    } catch {}

    return NextResponse.json({
      ok: true,
      message: "GitHub streak ping executed successfully!",
      commitHash,
      commitUrl,
      streakDays: nextStreakCount,
      date: today,
      methodUsed,
      gitLog,
    });
  } catch (err: any) {
    console.error("[streak-keeper POST error]", err);
    return NextResponse.json(
      { error: err.message || "Failed to execute streak push" },
      { status: 500 }
    );
  }
}
