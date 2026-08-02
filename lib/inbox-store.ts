import { promises as fs } from "fs";
import path from "path";

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

async function ensureInboxFile(): Promise<void> {
  try {
    await fs.access(INBOX_FILE);
  } catch {
    await fs.mkdir(path.dirname(INBOX_FILE), { recursive: true });
    await fs.writeFile(INBOX_FILE, "[]", "utf8");
  }
}

export async function getAllInboxItems(): Promise<InboxItem[]> {
  await ensureInboxFile();
  const raw = await fs.readFile(INBOX_FILE, "utf8");
  try {
    const items = JSON.parse(raw) as InboxItem[];
    // Filter out archived items by default or sort them newest-first
    return items.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch {
    return [];
  }
}

export async function saveAllInboxItems(items: InboxItem[]): Promise<void> {
  await ensureInboxFile();
  await fs.writeFile(INBOX_FILE, JSON.stringify(items, null, 2), "utf8");
}

export async function addInboxItem(
  type: "message" | "appreciation" | "feedback",
  payload: MessagePayload | AppreciationPayload | FeedbackPayload
): Promise<InboxItem> {
  const items = await getAllInboxItems();
  const newItem: InboxItem = {
    id: Math.random().toString(36).substring(2, 11) + "_" + Date.now(),
    type,
    timestamp: new Date().toISOString(),
    read: false,
    archived: false,
    payload,
  };

  items.unshift(newItem);
  await saveAllInboxItems(items);
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
