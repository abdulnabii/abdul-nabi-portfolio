import { supabaseDbInsert, supabaseDbQuery, supabaseDbPatch, supabaseDbDelete, supabaseDbUpsert } from "./supabase";
import seedInbox from "@/data/inbox.json";

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
const memoryDeletedIds = new Set<string>();

export async function getAllInboxItems(): Promise<InboxItem[]> {
  const map = new Map<string, InboxItem>();
  const deletedSet = new Set<string>(memoryDeletedIds);

  // Load deleted IDs from Supabase DB site_settings
  const deletedRows = await supabaseDbQuery<{ key: string; value: string }>(
    "site_settings",
    "select=*&key=eq.deleted_inbox_ids"
  );
  if (deletedRows && deletedRows.length > 0 && deletedRows[0].value) {
    try {
      const parsed = JSON.parse(deletedRows[0].value) as string[];
      parsed.forEach((id) => {
        deletedSet.add(id);
        memoryDeletedIds.add(id);
      });
    } catch {}
  }

  // 1. Load static seed inbox items
  (seedInbox as InboxItem[]).forEach((item) => {
    if (!deletedSet.has(item.id)) {
      map.set(item.id, item);
    }
  });

  // 2. Overlay in-memory items (submitted during active container session)
  memoryInboxItems.forEach((item) => {
    if (!deletedSet.has(item.id)) {
      map.set(item.id, item);
    }
  });

  // 3. Overlay Supabase DB 'inbox' items
  const dbItems = await supabaseDbQuery<InboxItem>("inbox", "select=*&order=timestamp.desc");
  if (dbItems && dbItems.length > 0) {
    dbItems.forEach((item) => {
      let payload = item.payload;
      if (typeof payload === "string") {
        try {
          payload = JSON.parse(payload);
        } catch {}
      }
      const cleanItem: InboxItem = {
        ...item,
        payload: payload || {},
      };
      if (!deletedSet.has(cleanItem.id)) {
        map.set(cleanItem.id, cleanItem);
      }
    });
  }

  // 4. Overlay Supabase DB 'contact_submissions' items
  const contactSubs = await supabaseDbQuery<any>("contact_submissions", "select=*&order=created_at.desc");
  if (contactSubs && contactSubs.length > 0) {
    contactSubs.forEach((sub) => {
      if (!map.has(sub.id) && !deletedSet.has(sub.id)) {
        map.set(sub.id, {
          id: sub.id,
          type: "message",
          timestamp: sub.created_at || new Date().toISOString(),
          read: sub.read ?? false,
          archived: false,
          payload: {
            name: sub.name,
            email: sub.email,
            company: sub.company || undefined,
            subject: sub.subject,
            message: sub.message,
          },
        });
      }
    });
  }

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export async function saveAllInboxItems(items: InboxItem[]): Promise<void> {
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

  memoryInboxItems.unshift(newItem);

  await supabaseDbInsert("inbox", {
    id: newItem.id,
    type: newItem.type,
    timestamp: newItem.timestamp,
    read: newItem.read,
    archived: newItem.archived,
    payload: newItem.payload,
  });

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
  await supabaseDbPatch("inbox", `id=eq.${id}`, { read });
  return item;
}

export async function markAllAsRead(): Promise<void> {
  const items = await getAllInboxItems();
  for (const item of items) {
    item.read = true;
  }
  await saveAllInboxItems(items);
  await supabaseDbPatch("inbox", "read=eq.false", { read: true });
}

export async function archiveInboxItem(id: string, archived = true): Promise<InboxItem | null> {
  const items = await getAllInboxItems();
  const item = items.find((i) => i.id === id);
  if (!item) return null;

  item.archived = archived;
  await saveAllInboxItems(items);
  await supabaseDbPatch("inbox", `id=eq.${id}`, { archived });
  return item;
}

export async function deleteInboxItem(id: string): Promise<boolean> {
  memoryDeletedIds.add(id);

  // Load existing deleted IDs from Supabase DB site_settings first
  const deletedRows = await supabaseDbQuery<{ key: string; value: string }>(
    "site_settings",
    "select=*&key=eq.deleted_inbox_ids"
  );
  if (deletedRows && deletedRows.length > 0 && deletedRows[0].value) {
    try {
      const parsed = JSON.parse(deletedRows[0].value) as string[];
      parsed.forEach((dId) => memoryDeletedIds.add(dId));
    } catch {}
  }

  const currentDeletedList = Array.from(memoryDeletedIds);

  // Persist updated deleted IDs array to Supabase DB site_settings
  await supabaseDbUpsert("site_settings", [{
    key: "deleted_inbox_ids",
    value: JSON.stringify(currentDeletedList),
    updated_at: new Date().toISOString(),
  }]);

  // Permanently delete record from Supabase DB tables
  await supabaseDbDelete("inbox", `id=eq.${id}`);
  await supabaseDbDelete("contact_submissions", `id=eq.${id}`);

  const items = await getAllInboxItems();
  const next = items.filter((i) => i.id !== id);
  await saveAllInboxItems(next);

  return true;
}

export async function getUnreadCount(): Promise<number> {
  const items = await getAllInboxItems();
  return items.filter((i) => !i.read && !i.archived).length;
}
