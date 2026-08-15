"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Save, Award, ExternalLink, Shield, Check, RotateCcw } from "lucide-react";
import type { CertificationItem } from "@/lib/settings-store";

export function CertificationsManager() {
  const [certifications, setCertifications] = useState<CertificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<CertificationItem>({
    id: "",
    title: "",
    issuer: "",
    date: "2025",
    badge: "Specialization",
    color: "indigo",
    credentialUrl: "",
    skills: [],
  });

  const [skillsInput, setSkillsInput] = useState("");

  useEffect(() => {
    fetch("/api/admin/certifications")
      .then((r) => r.json())
      .then((d) => {
        if (d.certifications) setCertifications(d.certifications);
      })
      .catch((err) => console.error("Failed to load certifications", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveAll = async (list: CertificationItem[]) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/certifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ certifications: list }),
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
    if (!formData.title.trim() || !formData.issuer.trim()) return;

    const parsedSkills = skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    let updated: CertificationItem[];
    if (editingId) {
      updated = certifications.map((c) =>
        c.id === editingId ? { ...formData, skills: parsedSkills.length ? parsedSkills : formData.skills } : c
      );
      setEditingId(null);
    } else {
      const newId = `c-${Date.now()}`;
      const newItem: CertificationItem = {
        ...formData,
        id: newId,
        skills: parsedSkills.length ? parsedSkills : ["Full-Stack", "TypeScript"],
      };
      updated = [newItem, ...certifications];
    }

    setCertifications(updated);
    handleSaveAll(updated);

    // Reset
    setFormData({
      id: "",
      title: "",
      issuer: "",
      date: "2025",
      badge: "Specialization",
      color: "indigo",
      credentialUrl: "",
      skills: [],
    });
    setSkillsInput("");
  };

  const handleDelete = (id: string) => {
    const updated = certifications.filter((c) => c.id !== id);
    setCertifications(updated);
    handleSaveAll(updated);
  };

  const startEdit = (item: CertificationItem) => {
    setEditingId(item.id);
    setFormData({ ...item });
    setSkillsInput((item.skills || []).join(", "));
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
          <h2 className="text-2xl font-bold text-white">Certifications & Coursework Wall</h2>
          <p className="mt-1 text-sm text-slate-400">
            Manage your verified certifications and course credentials.
          </p>
        </div>

        <button
          onClick={() => handleSaveAll(certifications)}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-indigo-500 disabled:opacity-50"
        >
          {saving ? "Saving..." : saved ? "✓ Changes Saved!" : "Save Changes"}
        </button>
      </div>

      {/* Form Card */}
      <div className="rounded-2xl border border-white/10 bg-[#090e24]/80 p-6 backdrop-blur-xl">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          {editingId ? <Edit2 className="h-4 w-4 text-indigo-400" /> : <Plus className="h-4 w-4 text-emerald-400" />}
          {editingId ? "Edit Certification" : "Add New Certificate"}
        </h3>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="text-xs font-semibold uppercase text-slate-400">Certification Name / Course</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Next.js & React Mastery"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-slate-400">Issuer / Organization</label>
            <input
              type="text"
              value={formData.issuer}
              onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
              placeholder="e.g. Meta / Google / freeCodeCamp"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-slate-400">Year / Date</label>
            <input
              type="text"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              placeholder="e.g. 2025"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-slate-400">Credential / Verification URL</label>
            <input
              type="text"
              value={formData.credentialUrl}
              onChange={(e) => setFormData({ ...formData, credentialUrl: e.target.value })}
              placeholder="https://..."
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-semibold uppercase text-slate-400">Skills Covered (comma separated)</label>
            <input
              type="text"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="e.g. React 18, Next.js App Router, TypeScript, REST APIs"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={handleAddOrUpdate}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
          >
            {editingId ? "Update Certificate" : "Add Certificate"}
          </button>

          {editingId && (
            <button
              onClick={() => {
                setEditingId(null);
                setFormData({
                  id: "",
                  title: "",
                  issuer: "",
                  date: "2025",
                  badge: "Specialization",
                  color: "indigo",
                  credentialUrl: "",
                  skills: [],
                });
                setSkillsInput("");
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      {/* Live List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Live Certifications ({certifications.length})</h3>

        <div className="grid gap-4 md:grid-cols-2">
          {certifications.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-all hover:border-white/20"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                      <Award className="h-4 w-4" />
                    </span>
                    <div>
                      <span className="text-[11px] font-semibold uppercase text-indigo-400">{item.issuer}</span>
                      <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                    </div>
                  </div>

                  <span className="text-xs font-mono text-slate-400 rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5">
                    {item.date}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {(item.skills || []).map((s) => (
                    <span
                      key={s}
                      className="rounded-md border border-white/5 bg-white/[0.03] px-2 py-0.5 text-[10px] text-slate-300"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 mt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  <Shield className="h-3 w-3" /> Verified Coursework
                </span>

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
