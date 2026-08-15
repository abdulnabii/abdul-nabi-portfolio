"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Save, Star, Quote, ShieldCheck, Check, RotateCcw } from "lucide-react";
import type { TestimonialItem } from "@/lib/settings-store";

export function TestimonialsManager() {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state for add/edit
  const [formData, setFormData] = useState<TestimonialItem>({
    id: "",
    name: "",
    role: "",
    company: "",
    avatar: "",
    rating: 5,
    quote: "",
    project: "",
    platform: "LinkedIn",
  });

  useEffect(() => {
    fetch("/api/admin/testimonials")
      .then((r) => r.json())
      .then((d) => {
        if (d.testimonials) setTestimonials(d.testimonials);
      })
      .catch((err) => console.error("Failed to load testimonials", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveAll = async (list: TestimonialItem[]) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/testimonials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testimonials: list }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddOrUpdate = () => {
    if (!formData.name.trim() || !formData.quote.trim()) return;

    let updated: TestimonialItem[];
    if (editingId) {
      updated = testimonials.map((t) => (t.id === editingId ? { ...formData } : t));
      setEditingId(null);
    } else {
      const newId = `t-${Date.now()}`;
      const initials = formData.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "CL";

      const newItem: TestimonialItem = {
        ...formData,
        id: newId,
        avatar: formData.avatar || initials,
      };
      updated = [newItem, ...testimonials];
    }

    setTestimonials(updated);
    handleSaveAll(updated);

    // Reset form
    setFormData({
      id: "",
      name: "",
      role: "",
      company: "",
      avatar: "",
      rating: 5,
      quote: "",
      project: "",
      platform: "LinkedIn",
    });
  };

  const handleDelete = (id: string) => {
    const updated = testimonials.filter((t) => t.id !== id);
    setTestimonials(updated);
    handleSaveAll(updated);
  };

  const startEdit = (item: TestimonialItem) => {
    setEditingId(item.id);
    setFormData({ ...item });
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Testimonials & Social Proof</h2>
          <p className="mt-1 text-sm text-slate-400">
            Manage client recommendations and endorsements shown on your public homepage.
          </p>
        </div>

        <button
          onClick={() => handleSaveAll(testimonials)}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-indigo-500 disabled:opacity-50"
        >
          {saving ? "Saving..." : saved ? "✓ Changes Saved!" : "Save Changes"}
        </button>
      </div>

      {/* Add / Edit Form Card */}
      <div className="rounded-2xl border border-white/10 bg-[#090e24]/80 p-6 backdrop-blur-xl">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          {editingId ? <Edit2 className="h-4 w-4 text-indigo-400" /> : <Plus className="h-4 w-4 text-emerald-400" />}
          {editingId ? "Edit Testimonial" : "Add New Testimonial"}
        </h3>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="text-xs font-semibold uppercase text-slate-400">Client / Endorser Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Sarah Jenkins"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-slate-400">Role / Job Title</label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder="e.g. Product Lead"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-slate-400">Company / Organization</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="e.g. NextGen Health"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-slate-400">Platform Badge</label>
            <select
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#0c122e] px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="LinkedIn">LinkedIn</option>
              <option value="Fiverr Pro">Fiverr Pro</option>
              <option value="GitHub">GitHub</option>
              <option value="Direct Client">Direct Client</option>
              <option value="Academic">Academic</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-slate-400">Star Rating</label>
            <div className="mt-2 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className="p-1 text-slate-400 hover:text-amber-400 transition-colors"
                >
                  <Star
                    className={`h-5 w-5 ${
                      star <= formData.rating ? "fill-amber-400 text-amber-400" : "text-slate-600"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-slate-400">Avatar Initials / Icon</label>
            <input
              type="text"
              value={formData.avatar}
              onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
              placeholder="e.g. SJ (Auto-generated if blank)"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="text-xs font-semibold uppercase text-slate-400">Quote / Recommendation Text</label>
          <textarea
            rows={3}
            value={formData.quote}
            onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
            placeholder="What did the client or engineering lead say about your work?"
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={handleAddOrUpdate}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
          >
            {editingId ? "Update Testimonial" : "Add Testimonial"}
          </button>

          {editingId && (
            <button
              onClick={() => {
                setEditingId(null);
                setFormData({
                  id: "",
                  name: "",
                  role: "",
                  company: "",
                  avatar: "",
                  rating: 5,
                  quote: "",
                  project: "",
                  platform: "LinkedIn",
                });
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      {/* Existing Testimonials List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Live Testimonials ({testimonials.length})</h3>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-all hover:border-white/20"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: item.rating }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-slate-400">
                    {item.platform}
                  </span>
                </div>

                <p className="text-xs text-slate-300 italic mb-4 leading-relaxed line-clamp-4">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-white">{item.name}</h4>
                  <p className="text-[10px] text-slate-500">
                    {item.role} · {item.company}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => startEdit(item)}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
