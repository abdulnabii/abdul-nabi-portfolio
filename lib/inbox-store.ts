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

// Memory fallback store for serverless environment lifecycles
const memoryInboxItems: InboxItem[] = [];

export async function getAllInboxItems(): Promise<InboxItem[]> {
  // 1. Fetch from Supabase DB if available
  const dbItems = await supabaseDbQuery<InboxItem>("inbox", "select=*&order=timestamp.desc");
  if (dbItems && dbItems.length > 0) {
    // Merge with any in-memory items not yet refetched
    const map = new Map<string, InboxItem>();
    dbItems.forEach((item) => map.set(item.id, item));
    memoryInboxItems.forEach((item) => map.set(item.id, item));
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  return memoryInboxItems;
}

export async function saveAllInboxItems(items: InboxItem[]): Promise<void> {
  // In serverless, saveAllInboxItems updates memory cache
  memoryInboxItems.length = 0;
  memoryInboxItems.push(...items);
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

  // 1. Always append to memory store for instant availability
  memoryInboxItems.unshift(newItem);

  // 2. Insert into Supabase 'inbox' table if configured
  await supabaseDbInsert("inbox", {
    id: newItem.id,
    type: newItem.type,
    timestamp: newItem.timestamp,
    read: newItem.read,
    archived: newItem.archived,
    payload: newItem.payload,
  });

  // 3. If payload is a message, also insert into 'contact_submissions' table (Option A)
  if (type === "message") {
    const msg = payload as MessagePayload;
    await supabaseDbInsert("contact_submissions", {
      id: newItem.id,
      name: msg.name,
      email: msg.email,
      company: msg.company || null,
      subject: msg.subject,
      message: msg.message,
      created_at: newItem.timestamp,
    });
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
  for (const item of items) {
    item.read = true;
  }
  await saveAllInboxItems(items);
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
