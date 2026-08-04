import { promises as fs } from "fs";
import path from "path";
import { supabaseDbInsert, supabaseDbQuery } from "./supabase";

export interface MessagePayload {
  name: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
  repliedAt?: string;
  replySubject?: string;
  replyMessage?: string;
}

export interface AppreciationPayload {
  projectTitle: string;
  projectSlug: string;
  count: number;
}

export interface FeedbackPayload {
  blogTitle: string;
  blogSlug: string;
  action: "rate" | "helpful" | "not-helpful";
  rating?: number;
}

export interface InboxItem {
  id: string;
  type: "message" | "appreciation" | "feedback";
  timestamp: string;
  read: boolean;
  archived: boolean;
  payload: MessagePayload | AppreciationPayload | FeedbackPayload;
}

const INBOX_FILE = path.join(process.cwd(), "data", "inbox.json");
const memoryInboxItems: InboxItem[] = [];

async function ensureInboxFile(): Promise<void> {
  try {
    await fs.access(INBOX_FILE);
  } catch {
    try {
      await fs.mkdir(path.dirname(INBOX_FILE), { recursive: true });
      await fs.writeFile(INBOX_FILE, "[]", "utf8");
    } catch {
      // Ignored on read-only serverless filesystems (e.g., Vercel)
    }
  }
}

export async function getAllInboxItems(): Promise<InboxItem[]> {
  // Try Supabase first if available
  const dbItems = await supabaseDbQuery<InboxItem>("inbox", "select=*&order=timestamp.desc");
  if (dbItems && dbItems.length > 0) {
    return dbItems;
  }

  try {
    await ensureInboxFile();
    const raw = await fs.readFile(INBOX_FILE, "utf8");
    const items = JSON.parse(raw) as InboxItem[];
    const combined = [...items, ...memoryInboxItems];
    // Deduplicate by ID
    const map = new Map<string, InboxItem>();
    combined.forEach((item) => map.set(item.id, item));
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch {
    return memoryInboxItems;
  }
}

export async function saveAllInboxItems(items: InboxItem[]): Promise<void> {
  try {
    await ensureInboxFile();
    await fs.writeFile(INBOX_FILE, JSON.stringify(items, null, 2), "utf8");
  } catch (err) {
    // Read-only filesystem on Vercel — log warning and keep items in memory
    console.warn("[inbox-store] Read-only filesystem detected, saved to memory fallback.");
  }
}

export async function addInboxItem(
  type: "message" | "appreciation" | "feedback",
  payload: MessagePayload | AppreciationPayload | FeedbackPayload
): Promise<InboxItem> {
  const newItem: InboxItem = {
    id: Math.random().toString(36).substring(2, 11) + "_" + Date.now(),
    type,
    timestamp: new Date().toISOString(),
    read: false,
    archived: false,
    payload,
  };

  // Always keep in memory store first for immediate session availability
  memoryInboxItems.unshift(newItem);

  // Attempt Supabase DB Insert if configured
  await supabaseDbInsert("inbox", {
    id: newItem.id,
    type: newItem.type,
    timestamp: newItem.timestamp,
    read: newItem.read,
    archived: newItem.archived,
    payload: newItem.payload,
  });

  // Attempt local disk file sync if writeable
  try {
    const items = await getAllInboxItems();
    items.unshift(newItem);
    await saveAllInboxItems(items);
  } catch {
    // Read-only environment safe fallback
  }

  return newItem;
}

export async function markAsRead(id: string, read: boolean): Promise<InboxItem | null> {
  const items = await getAllInboxItems();
  const item = items.find((i) => i.id === id);
  if (!item) return null;

  item.read = read;
  await saveAllInboxItems(items);
  return item;
}

export async function markAllAsRead(): Promise<void> {
  const items = await getAllInboxItems();
  let updated = false;
  for (const item of items) {
    if (!item.read) {
      item.read = true;
      updated = true;
    }
  }
  if (updated) {
    await saveAllInboxItems(items);
  }
}

export async function archiveInboxItem(id: string, archived = true): Promise<InboxItem | null> {
  const items = await getAllInboxItems();
  const item = items.find((i) => i.id === id);
  if (!item) return null;

  item.archived = archived;
  await saveAllInboxItems(items);
  return item;
}

export async function deleteInboxItem(id: string): Promise<boolean> {
  const items = await getAllInboxItems();
  const next = items.filter((i) => i.id !== id);
  if (next.length === items.length) return false;

  await saveAllInboxItems(next);
  return true;
}

export async function getUnreadCount(): Promise<number> {
  const items = await getAllInboxItems();
  return items.filter((i) => !i.read && !i.archived).length;
}
