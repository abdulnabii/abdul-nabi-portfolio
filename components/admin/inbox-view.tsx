"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import type { InboxItem, MessagePayload, AppreciationPayload, FeedbackPayload } from "@/lib/inbox-store";
import {
  Check,
  CheckCheck,
  Eye,
  Mail,
  MessageSquare,
  Search,
  ThumbsUp,
  Trash2,
  ExternalLink,
  ChevronRight,
  Archive,
  Star,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ReplyModal } from "./reply-modal";
import { DeleteModal } from "./delete-modal";

interface InboxViewProps {
  initialItems: InboxItem[];
}

type TabType = "all" | "message" | "appreciation" | "feedback";

export function InboxView({ initialItems }: InboxViewProps) {
  const [items, setItems] = useState<InboxItem[]>(initialItems);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [selectedItem, setSelectedItem] = useState<InboxItem | null>(null);
  const [replyModalTarget, setReplyModalTarget] = useState<InboxItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InboxItem | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function notifyUnreadCount(updatedItems: InboxItem[]) {
    const unread = updatedItems.filter((i) => !i.read && !i.archived).length;
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("inbox-updated", { detail: { unreadCount: unread } }));
    }
  }

  // Fetch latest data from API
  const refreshInbox = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/inbox");
      if (res.ok) {
        const data = (await res.json()) as { items: InboxItem[] };
        setItems(data.items);
        notifyUnreadCount(data.items);
      }
    } catch (err) {
      console.error("Failed to refresh inbox", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh when active tab or routing changes
  useEffect(() => {
    refreshInbox();
  }, [refreshInbox]);

  // Update selected item reference in state if the items list updates
  useEffect(() => {
    if (selectedItem) {
      const updated = items.find((i) => i.id === selectedItem.id);
      setSelectedItem(updated || null);
    }
  }, [items, selectedItem]);

  // Bulk operation: Mark all as read
  async function handleMarkAllRead() {
    try {
      const res = await fetch("/api/admin/inbox", { method: "PUT" });
      if (res.ok) {
        const data = (await res.json()) as { items: InboxItem[] };
        setItems(data.items);
        notifyUnreadCount(data.items);
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  }

  // Toggle read status of a specific item
  async function handleToggleRead(id: string, currentRead: boolean) {
    try {
      const res = await fetch(`/api/admin/inbox/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: !currentRead }),
      });
      if (res.ok) {
        setItems((prev) => {
          const next = prev.map((item) => (item.id === id ? { ...item, read: !currentRead } : item));
          notifyUnreadCount(next);
          return next;
        });
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to toggle read status", err);
    }
  }

  // Delete item
  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to permanently delete this event?")) return;
    try {
      const res = await fetch(`/api/admin/inbox/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => {
          const next = prev.filter((item) => item.id !== id);
          notifyUnreadCount(next);
          return next;
        });
        if (selectedItem?.id === id) {
          setSelectedItem(null);
        }
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to delete inbox item", err);
    }
  }

  // Tab calculations
  const counts = useMemo(() => {
    const unread = items.filter((i) => !i.read && !i.archived);
    return {
      all: items.filter((i) => !i.archived).length,
      message: items.filter((i) => i.type === "message" && !i.archived).length,
      appreciation: items.filter((i) => i.type === "appreciation" && !i.archived).length,
      feedback: items.filter((i) => i.type === "feedback" && !i.archived).length,
      unread: unread.length,
      unreadMessages: unread.filter((i) => i.type === "message").length,
      unreadAppreciations: unread.filter((i) => i.type === "appreciation").length,
      unreadFeedback: unread.filter((i) => i.type === "feedback").length,
    };
  }, [items]);

  // Filter and search computation
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (item.archived) return false;

      const matchesTab = activeTab === "all" || item.type === activeTab;
      if (!matchesTab) return false;

      if (!searchTerm) return true;

      const q = searchTerm.toLowerCase();
      if (item.type === "message") {
        const p = item.payload as MessagePayload;
        return (
          p.name.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          p.subject.toLowerCase().includes(q) ||
          p.message.toLowerCase().includes(q) ||
          (p.company && p.company.toLowerCase().includes(q))
        );
      } else if (item.type === "appreciation") {
        const p = item.payload as AppreciationPayload;
        return p.projectTitle.toLowerCase().includes(q);
      } else if (item.type === "feedback") {
        const p = item.payload as FeedbackPayload;
        return p.blogTitle.toLowerCase().includes(q) || p.action.toLowerCase().includes(q);
      }
      return false;
    });
  }, [items, activeTab, searchTerm]);

  // Render timestamp nicely
  function formatTime(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Inbox Activity</h2>
          <p className="mt-1 text-sm text-slate-400">
            {counts.unread > 0
              ? `You have ${counts.unread} unread ${counts.unread === 1 ? "event" : "events"} · ${counts.all} total activities recorded.`
              : `All caught up! 0 unread events · ${counts.all} total activities recorded.`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={refreshInbox}
            disabled={loading}
            title="Refresh from database"
            className="flex items-center gap-1.5 cursor-grow"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          {counts.unread > 0 && (
            <Button variant="primary" size="sm" onClick={handleMarkAllRead}>
              <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Tabs and search */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap rounded-xl bg-white/[0.04] p-1 border border-white/5">
          {(["all", "message", "appreciation", "feedback"] as TabType[]).map((tab) => {
            const labelMap = {
              all: `All (${counts.all})`,
              message: `Messages${counts.unreadMessages > 0 ? ` (${counts.unreadMessages})` : ""}`,
              appreciation: `Likes${counts.unreadAppreciations > 0 ? ` (${counts.unreadAppreciations})` : ""}`,
              feedback: `Feedback${counts.unreadFeedback > 0 ? ` (${counts.unreadFeedback})` : ""}`,
            };
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSelectedItem(null);
                }}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-medium uppercase tracking-wider transition ${
                  activeTab === tab
                    ? "bg-accent/20 text-white border border-accent/20"
                    : "text-slate-400 border border-transparent hover:text-white"
                }`}
              >
                {labelMap[tab]}
              </button>
            );
          })}
        </div>

        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search inbox..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-accent/40 focus:bg-white/[0.07]"
          />
        </div>
      </div>

      {/* Inbox core splitscreen */}
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        
        {/* Inbox Items List */}
        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-12 text-center backdrop-blur-xl">
              <p className="text-slate-400">No events found matching your filter criteria.</p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-2 text-sm text-accent-soft hover:underline"
                >
                  Clear search query
                </button>
              )}
            </div>
          ) : (
            <div className="max-h-[600px] overflow-y-auto pr-1 space-y-2">
              {filteredItems.map((item) => {
                const isSelected = selectedItem?.id === item.id;
                
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedItem(item);
                      if (!item.read) {
                        handleToggleRead(item.id, false);
                      }
                    }}
                    className={`group relative flex flex-col gap-3 rounded-2xl border p-4 cursor-pointer transition ${
                      isSelected
                        ? "border-accent/40 bg-accent/[0.06] shadow-glow-sm"
                        : item.read
                        ? "border-white/5 bg-white/[0.01] hover:border-white/10 hover:bg-white/[0.03]"
                        : "border-white/10 bg-white/[0.05] hover:border-white/15 hover:bg-white/[0.07]"
                    }`}
                  >
                    {/* Unread Indicator Dot */}
                    {!item.read && (
                      <span className="absolute left-1.5 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                    )}

                    <div className="flex items-start justify-between gap-4 pl-1">
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-xl border ${
                            item.type === "message"
                              ? "border-violet-500/25 bg-violet-500/10 text-violet-300"
                              : item.type === "appreciation"
                              ? "border-pink-500/25 bg-pink-500/10 text-pink-300"
                              : "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
                          }`}
                        >
                          {item.type === "message" ? (
                            <Mail className="h-4.5 w-4.5" />
                          ) : item.type === "appreciation" ? (
                            <ThumbsUp className="h-4.5 w-4.5" />
                          ) : (
                            <Star className="h-4.5 w-4.5" />
                          )}
                        </span>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            {item.type === "message"
                              ? "Contact Message"
                              : item.type === "appreciation"
                              ? "Project Like"
                              : "Blog Feedback"}
                          </p>
                          <p className="text-sm font-medium text-white mt-0.5">
                            {item.type === "message"
                              ? (item.payload as MessagePayload).subject
                              : item.type === "appreciation"
                              ? `Liked: ${(item.payload as AppreciationPayload).projectTitle}`
                              : `Post: ${(item.payload as FeedbackPayload).blogTitle}`}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-slate-500 whitespace-nowrap">
                        {formatTime(item.timestamp)}
                      </span>
                    </div>

                    <div className="pl-12 flex items-center justify-between gap-4">
                      <div className="text-xs text-slate-400 truncate max-w-[280px]">
                        {item.type === "message"
                          ? `From: ${(item.payload as MessagePayload).name} • ${(item.payload as MessagePayload).message.substring(0, 60)}...`
                          : item.type === "appreciation"
                          ? `Total appreciations: ${(item.payload as AppreciationPayload).count}`
                          : `Action: ${(item.payload as FeedbackPayload).action} ${
                              (item.payload as FeedbackPayload).rating
                                ? `(${(item.payload as FeedbackPayload).rating}/5 Stars)`
                                : ""
                            }`}
                      </div>
                      
                      {/* Interactive inline actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleRead(item.id, item.read);
                          }}
                          className={`rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition`}
                          title={item.read ? "Mark as unread" : "Mark as read"}
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id);
                          }}
                          className="rounded-lg p-1.5 text-red-400/80 hover:bg-red-500/10 hover:text-red-300 transition"
                          title="Delete permanently"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Event Details Panel */}
        <div>
          {selectedItem ? (
            <GlassCard elevated className="h-full min-h-[400px] flex flex-col justify-between">
              <div className="space-y-6">
                
                {/* Header details */}
                <div className="flex items-start justify-between border-b border-white/5 pb-4">
                  <div className="space-y-1">
                    <Badge
                      variant={
                        selectedItem.type === "message"
                          ? "accent"
                          : selectedItem.type === "appreciation"
                          ? "default"
                          : "muted"
                      }
                      className="uppercase tracking-wider text-[10px]"
                    >
                      {selectedItem.type}
                    </Badge>
                    <h3 className="text-lg font-semibold text-white mt-1">
                      Event Log Details
                    </h3>
                    <p className="text-xs text-slate-500">
                      Logged at: {new Date(selectedItem.timestamp).toLocaleString()}
                    </p>
                  </div>
                  
                  {/* Actions for current detail item */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleRead(selectedItem.id, selectedItem.read)}
                      className="rounded-lg p-2 border border-white/5 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition"
                      title={selectedItem.read ? "Mark unread" : "Mark read"}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(selectedItem.id)}
                      className="rounded-lg p-2 border border-red-500/10 bg-red-500/5 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition"
                      title="Delete permanently"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Body Details depending on type */}
                {selectedItem.type === "message" && (
                  <div className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2 text-sm border-b border-white/5 pb-4">
                      <div>
                        <span className="block text-xs text-slate-500">Sender Name</span>
                        <span className="font-medium text-white">{(selectedItem.payload as MessagePayload).name}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-slate-500">Sender Email</span>
                        <a
                          href={`mailto:${(selectedItem.payload as MessagePayload).email}`}
                          className="font-medium text-accent-soft hover:underline flex items-center gap-1"
                        >
                          {(selectedItem.payload as MessagePayload).email}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      {(selectedItem.payload as MessagePayload).company && (
                        <div className="col-span-2">
                          <span className="block text-xs text-slate-500">Company / Organization</span>
                          <span className="font-medium text-white">{(selectedItem.payload as MessagePayload).company}</span>
                        </div>
                      )}
                      <div className="col-span-2">
                        <span className="block text-xs text-slate-500">Subject</span>
                        <span className="font-medium text-white">{(selectedItem.payload as MessagePayload).subject}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="block text-xs text-slate-500">Message Content</span>
                      <p className="rounded-xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                        {(selectedItem.payload as MessagePayload).message}
                      </p>
                    </div>

                    {(selectedItem.payload as MessagePayload).repliedAt && (
                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-300">
                        <p className="font-semibold">✓ Replied on {new Date((selectedItem.payload as MessagePayload).repliedAt!).toLocaleString()}</p>
                        <p className="mt-1 text-slate-300 italic">&quot;{(selectedItem.payload as MessagePayload).replyMessage}&quot;</p>
                      </div>
                    )}

                    <div className="pt-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setReplyModalTarget(selectedItem)}
                        className="w-full flex items-center justify-center gap-2"
                      >
                        <MessageSquare className="h-4 w-4" />
                        {(selectedItem.payload as MessagePayload).repliedAt ? "Send another reply" : "Reply to Message"}
                      </Button>
                    </div>
                  </div>
                )}

                {selectedItem.type === "appreciation" && (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-pink-500/10 bg-pink-500/5 p-4 flex items-center gap-3">
                      <ThumbsUp className="text-pink-400 h-6 w-6 shrink-0" />
                      <div>
                        <h4 className="text-sm font-semibold text-white">
                          Appreciation Recorded
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          A visitor liked the project &quot;{(selectedItem.payload as AppreciationPayload).projectTitle}&quot;.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-slate-500">Project Reference</span>
                        <Link
                          href={`/projects/${(selectedItem.payload as AppreciationPayload).projectSlug}`}
                          target="_blank"
                          className="font-semibold text-accent-soft hover:underline flex items-center gap-1"
                        >
                          View Case Study
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-slate-500">Appreciation Milestone</span>
                        <span className="font-mono text-white">#{(selectedItem.payload as AppreciationPayload).count} Like</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Identity Status</span>
                        <span className="text-slate-500 italic">Anonymous Visitor Event</span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedItem.type === "feedback" && (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-4 flex items-center gap-3">
                      <Star className="text-emerald-400 h-6 w-6 shrink-0" />
                      <div>
                        <h4 className="text-sm font-semibold text-white">
                          Blog Feedback Registered
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Reaction type: &quot;{(selectedItem.payload as FeedbackPayload).action}&quot; on &quot;{(selectedItem.payload as FeedbackPayload).blogTitle}&quot;.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-slate-500">Post Reference</span>
                        <Link
                          href={`/blog/${(selectedItem.payload as FeedbackPayload).blogSlug}`}
                          target="_blank"
                          className="font-semibold text-accent-soft hover:underline flex items-center gap-1"
                        >
                          View Blog Post
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                      
                      {/* Display rating helper stars if action is rate */}
                      {(selectedItem.payload as FeedbackPayload).action === "rate" && (
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-slate-500">Star Rating Given</span>
                          <span className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, idx) => (
                              <Star
                                key={idx}
                                className={`h-4 w-4 ${
                                  idx < ((selectedItem.payload as FeedbackPayload).rating ?? 0)
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-slate-600"
                                }`}
                              />
                            ))}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-slate-500">Reaction Event</span>
                        <span className="font-mono uppercase text-white font-bold text-xs">
                          {(selectedItem.payload as FeedbackPayload).action}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Identity Status</span>
                        <span className="text-slate-500 italic">Anonymous Reader Event</span>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Quick contextual action */}
              {selectedItem.type === "message" && (
                <div className="mt-6 pt-4 border-t border-white/5">
                  <a
                    href={`mailto:${(selectedItem.payload as MessagePayload).email}?subject=Re: ${(selectedItem.payload as MessagePayload).subject}`}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-accent/40 bg-accent/90 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent cursor-grow"
                  >
                    <Mail className="h-4 w-4" />
                    Quick reply to sender
                  </a>
                </div>
              )}
            </GlassCard>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center h-full min-h-[400px] flex flex-col items-center justify-center text-slate-500">
              <Eye className="h-8 w-8 text-slate-600 mb-3" />
              <p className="text-sm">Select an activity from the feed to view full event context, metadata, and responses.</p>
            </div>
          )}
        </div>

      </div>

      {replyModalTarget && replyModalTarget.type === "message" && (
        <ReplyModal
          isOpen={replyModalTarget !== null}
          onClose={() => setReplyModalTarget(null)}
          onSuccess={(repliedAt) => {
            setItems((prev) =>
              prev.map((item) =>
                item.id === replyModalTarget.id
                  ? {
                      ...item,
                      read: true,
                      payload: {
                        ...(item.payload as MessagePayload),
                        repliedAt,
                      },
                    }
                  : item
              )
            );
            router.refresh();
          }}
          inboxItemId={replyModalTarget.id}
          recipientEmail={(replyModalTarget.payload as MessagePayload).email}
          recipientName={(replyModalTarget.payload as MessagePayload).name}
          originalSubject={(replyModalTarget.payload as MessagePayload).subject}
        />
      )}
    </div>
  );
}
