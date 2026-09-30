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
const GITHUB_REPO_OWNER = process.env.STREAK_GITHUB_OWNER || "abdulnabii";
const GITHUB_REPO_NAME = process.env.STREAK_GITHUB_REPO || "priv";
const STREAK_TARGET_FILE = "activity_log.txt";

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

async function findLocalPrivRepo(): Promise<string | null> {
  const candidates = [
    "C:\\Users\\nabi4\\Desktop\\priv",
    path.resolve(process.cwd(), "..", "priv"),
    "C:\\Users\\nabi4\\OneDrive\\Desktop\\New folder\\priv",
  ];
  for (const dir of candidates) {
    try {
      const gitDir = path.join(dir, ".git");
      const stat = await fs.stat(gitDir);
      if (stat.isDirectory()) return dir;
    } catch {}
  }
  return null;
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
    const filePath = STREAK_TARGET_FILE;
    const getUrl = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${filePath}`;

    // 1. Fetch current file SHA and content from GitHub
    let fileSha: string | undefined;
    let existingContent = "";
    const getRes = await fetch(getUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "abdulnabi-streak-keeper",
      },
      cache: "no-store",
    });

    if (getRes.ok) {
      const getData = await getRes.json();
      fileSha = getData.sha;
      if (getData.content) {
        existingContent = Buffer.from(getData.content, "base64").toString("utf8");
      }
    }

    // 2. Append new activity entry
    const nowStr = new Date().toISOString().replace("T", " ").substring(0, 19);
    const newEntry = `[${nowStr}] Automated streak keeper activity ping (Day ${updatedData.streakDays}) - ${message}\n`;
    const newContent = (existingContent ? existingContent.trimEnd() + "\n" : "") + newEntry;

    // 3. Push updated file directly to main branch
    const contentBase64 = Buffer.from(newContent, "utf8").toString("base64");
    const commitMsg = message.startsWith("chore:")
      ? message
      : `chore: automated activity commit at ${nowStr} [skip ci]`;

    const putPayload: any = {
      message: commitMsg,
      content: contentBase64,
      branch: "main",
      committer: {
        name: "Abdul Nabi",
        email: "nabi44979@gmail.com",
      },
      author: {
        name: "Abdul Nabi",
        email: "nabi44979@gmail.com",
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
        "User-Agent": "abdulnabi-streak-keeper",
      },
      body: JSON.stringify(putPayload),
    });

    const putData = await putRes.json();

    if (putRes.ok && putData.commit) {
      const commitSha = putData.commit.sha ? putData.commit.sha.slice(0, 7) : "pushed";
      const commitUrl = putData.commit.html_url || `https://github.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/commit/${putData.commit.sha}`;
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

    // Fetch latest live commit hash from GitHub API
    let currentHash = data.lastCommitHash || "";
    try {
      const ghRes = await fetch(
        `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/commits/main`,
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "abdulnabi-streak-keeper",
            ...(creds.githubToken ? { Authorization: `Bearer ${creds.githubToken}` } : {}),
          },
          cache: "no-store",
        }
      );
      if (ghRes.ok) {
        const ghJson = await ghRes.json();
        if (ghJson && ghJson.sha) {
          currentHash = ghJson.sha.slice(0, 7);
        }
      }
    } catch {}

    if (!currentHash) {
      try {
        const { stdout } = await execAsync("git rev-parse --short HEAD", { timeout: 2000 });
        if (stdout && stdout.trim()) {
          currentHash = stdout.trim();
        }
      } catch {}
    }
    if (!currentHash) {
      currentHash = "24392bd";
    }

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
        gitLog = `[GitHub REST API] Successfully committed to branch 'main'.\nCommit SHA: ${commitHash}\nVerified Committer: Abdul Nabi <nabi44979@gmail.com>\nTarget Repository: ${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}`;
      } else {
        return NextResponse.json(
          {
            error: `GitHub API Push Failed: ${apiResult.error || "Token invalid or missing 'repo' write permissions."}`,
            requiresToken: true,
          },
          { status: 400 }
        );
      }
    }

    // ── STRATEGY 2: Local Git CLI (if running in local development) ───────
    if (methodUsed !== "github_api") {
      const localPrivDir = await findLocalPrivRepo();
      if (localPrivDir) {
        try {
          const logPath = path.join(localPrivDir, STREAK_TARGET_FILE);
          const nowStr = new Date().toISOString().replace("T", " ").substring(0, 19);
          const entry = `[${nowStr}] Automated commit trigger (Day ${nextStreakCount}) - ${customMessage}\n`;
          await fs.appendFile(logPath, entry, "utf8");

          await execAsync(`git add "${STREAK_TARGET_FILE}"`, { cwd: localPrivDir, timeout: 8000 });
          const commitMsg = customMessage.startsWith("chore:")
            ? customMessage
            : `chore: automated activity commit at ${nowStr} [skip ci]`;
          const { stdout: commitOut } = await execAsync(
            `git commit -m "${commitMsg.replace(/"/g, '\\"')}"`,
            { cwd: localPrivDir, timeout: 8000 }
          );
          const { stdout: pushOut } = await execAsync("git push origin main", { cwd: localPrivDir, timeout: 30000 });

          gitLog = `${commitOut}\n${pushOut}`.trim();
          methodUsed = "local_git";

          const { stdout: hashOut } = await execAsync("git rev-parse --short HEAD", { cwd: localPrivDir, timeout: 3000 });
          if (hashOut && hashOut.trim()) {
            commitHash = hashOut.trim();
            commitUrl = `https://github.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/commit/${commitHash}`;
          }
        } catch (localErr: any) {
          return NextResponse.json(
            {
              error: `Local git push to ${localPrivDir} failed: ${localErr.message}. Enter a GitHub Token for cloud push instead.`,
              requiresToken: true,
            },
            { status: 400 }
          );
        }
      } else {
        return NextResponse.json(
          {
            error: `A GitHub Personal Access Token (PAT) with 'repo' scope is required for cloud push to ${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}. Please paste your token below and try again.`,
            requiresToken: true,
          },
          { status: 400 }
        );
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
        email: "streak-bot@abdulnabi.org",
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
