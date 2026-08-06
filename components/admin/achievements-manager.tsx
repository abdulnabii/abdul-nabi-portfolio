"use client";

import { useEffect, useState } from "react";
import type { AchievementItem } from "@/lib/settings-store";
import { Trash2, Plus, Save } from "lucide-react";

const COLORS = ["indigo", "violet", "orange", "cyan", "emerald", "purple", "yellow", "blue", "red"];
const CATEGORIES = ["Dev", "Academic", "Skills", "Learning", "ML", "Design", "Other"];

const DEFAULT: AchievementItem[] = [
  { id: "1", title: "FYP Completed", description: "Delivered Blood Sugar Tracker ML system as Final Year Project using Flask & scikit-learn", icon: "🎓", date: "2024", color: "indigo", category: "Academic" },
  { id: "2", title: "First Production Deployment", description: "Shipped first full-stack Next.js + Supabase app to Vercel with live users", icon: "🚀", date: "2024", color: "violet", category: "Dev" },
  { id: "3", title: "GitHub Streak", description: "Maintained consistent GitHub contribution streak across multiple repositories", icon: "🔥", date: "2024", color: "orange", category: "Dev" },
  { id: "4", title: "Full-Stack Stack Mastered", description: "Proficient in Next.js, TypeScript, Supabase, TailwindCSS, PostgreSQL end-to-end", icon: "⚡", date: "2024", color: "cyan", category: "Skills" },
  { id: "5", title: "AppSec Learning Journey", description: "Actively studying Application Security — OWASP Top 10, authentication, and threat modeling", icon: "🛡️", date: "2025", color: "emerald", category: "Learning" },
  { id: "6", title: "ML Model Shipped", description: "Built and deployed ElasticNet regression model predicting glucose levels with real accuracy", icon: "🧠", date: "2024", color: "purple", category: "ML" },
  { id: "7", title: "Portfolio Launched", description: "Built premium portfolio with admin CMS, real-time DB, AI chatbot, and mini games", icon: "🌟", date: "2025", color: "yellow", category: "Dev" },
  { id: "8", title: "Open Source Contributor", description: "Published projects on GitHub with clean READMEs and documentation", icon: "💻", date: "2024", color: "blue", category: "Dev" },
];

export function AchievementsManager() {
  const [items, setItems] = useState<AchievementItem[]>(DEFAULT);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/achievements")
      .then((r) => r.json())
      .then((d) => { if (d.achievements?.length) setItems(d.achievements); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const update = (id: string, field: keyof AchievementItem, value: string) => {
    setItems((prev) => prev.map((it) => it.id === id ? { ...it, [field]: value } : it));
    setSaved(false);
  };

  const addNew = () => {
    setItems((prev) => [...prev, {
      id: Date.now().toString(),
      title: "New Achievement",
      description: "Describe this achievement",
      icon: "⭐",
      date: new Date().getFullYear().toString(),
      color: "indigo",
      category: "Dev",
    }]);
    setSaved(false);
  };

  const remove = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/achievements", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ achievements: items }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {}
    setSaving(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-48"><div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">Achievements</h2>
          <p className="mt-1 text-sm text-slate-400">{items.length} achievements. Changes appear on the public site.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={addNew} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 hover:bg-white/10 transition">
            <Plus className="h-4 w-4" /> Add
          </button>
          <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-500/20 px-5 py-2 text-sm font-medium text-indigo-200 hover:bg-indigo-500/30 transition disabled:opacity-50">
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : saved ? "✓ Saved!" : "Save All"}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Icon (emoji)</label>
                <input
                  value={item.icon}
                  onChange={(e) => update(item.id, "icon", e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xl text-white focus:outline-none focus:border-indigo-500/50"
                  maxLength={4}
                />
              </div>
              <div className="sm:col-span-1 lg:col-span-2">
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Title</label>
                <input
                  value={item.title}
                  onChange={(e) => update(item.id, "title", e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Year</label>
                <input
                  value={item.date}
                  onChange={(e) => update(item.id, "date", e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                  maxLength={9}
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Description</label>
              <textarea
                value={item.description}
                onChange={(e) => update(item.id, "description", e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50 resize-none"
              />
            </div>
            <div className="mt-3 flex items-center gap-3 flex-wrap">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Color</label>
                <select
                  value={item.color}
                  onChange={(e) => update(item.id, "color", e.target.value)}
                  className="rounded-lg border border-white/10 bg-[#0a0f1e] px-3 py-1.5 text-sm text-white focus:outline-none"
                >
                  {COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Category</label>
                <select
                  value={item.category}
                  onChange={(e) => update(item.id, "category", e.target.value)}
                  className="rounded-lg border border-white/10 bg-[#0a0f1e] px-3 py-1.5 text-sm text-white focus:outline-none"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex-1 flex justify-end items-end">
                <button onClick={() => remove(item.id)} className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/20 transition">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
