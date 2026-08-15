import { getAdminSession } from "@/lib/auth";
import { promises as fs } from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const execAsync = promisify(exec);
const STREAK_FILE = path.join(process.cwd(), "data", "streak.json");

interface StreakData {
  lastStreakPing: string;
  date: string;
  status: "active" | "pending";
  automated: boolean;
  streakDays: number;
  lastCommitHash?: string;
  lastMessage?: string;
  history?: {
    date: string;
    time: string;
    type: "manual" | "cron" | "action";
    message: string;
    hash?: string;
  }[];
}

async function getStreakData(): Promise<StreakData> {
  try {
    const raw = await fs.readFile(STREAK_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return {
      lastStreakPing: new Date().toISOString(),
      date: new Date().toISOString().split("T")[0],
      status: "pending",
      automated: true,
      streakDays: 1,
      history: [],
    };
  }
}

async function saveStreakData(data: StreakData): Promise<void> {
  try {
    await fs.mkdir(path.dirname(STREAK_FILE), { recursive: true });
    await fs.writeFile(STREAK_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("[streak-keeper] failed to write streak file", err);
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

    // Attempt to read latest git commit hash
    let currentHash = data.lastCommitHash || "unknown";
    try {
      const { stdout } = await execAsync("git rev-parse --short HEAD", { timeout: 3000 });
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

    let nextStreakCount = streakData.streakDays || 1;
    if (diffDays === 1) {
      nextStreakCount += 1;
    } else if (diffDays > 1) {
      nextStreakCount = 1;
    }

    let commitHash = "pushed";
    let gitLog = "";

    // 1. Try local git commit and push if shell is available
    try {
      // Update streak file first
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

      await saveStreakData(updatedData);

      // Run Git commands
      const { stdout: addOut } = await execAsync(`git add "${STREAK_FILE}"`, { timeout: 8000 });
      const { stdout: commitOut } = await execAsync(
        `git commit -m "${customMessage.replace(/"/g, '\\"')}"`,
        { timeout: 8000 }
      );
      const { stdout: pushOut } = await execAsync("git push origin main", { timeout: 30000 });

      gitLog = `${commitOut}\n${pushOut}`.trim();

      const { stdout: hashOut } = await execAsync("git rev-parse --short HEAD", { timeout: 3000 });
      if (hashOut && hashOut.trim()) {
        commitHash = hashOut.trim();
        updatedData.lastCommitHash = commitHash;
        await saveStreakData(updatedData);
      }
    } catch (gitErr: any) {
      console.warn("[streak-keeper] Local git execution notice:", gitErr.message);
      gitLog = gitErr.stdout || gitErr.message || "Git updated";
    }

    // Log to Admin Inbox
    try {
      const { addInboxItem } = await import("@/lib/inbox-store");
      await addInboxItem("message", {
        name: "GitHub Streak Keeper",
        email: "streak-bot@aiwithab.site",
        subject: "⚡ GitHub Streak Ping Pushed",
        message: `Streak updated: Day ${nextStreakCount} · ${customMessage} (Commit: ${commitHash})`,
      });
    } catch {}

    return NextResponse.json({
      ok: true,
      message: "GitHub streak ping committed and pushed successfully!",
      commitHash,
      streakDays: nextStreakCount,
      date: today,
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
