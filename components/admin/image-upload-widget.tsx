"use client";

import { Input } from "@/components/ui/input";
import { AlertCircle, Image as ImageIcon, UploadCloud } from "lucide-react";
import Image from "next/image";
import { useState, ChangeEvent, DragEvent } from "react";

interface ImageUploadWidgetProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  type?: "projects" | "blogs";
  slug?: string;
}

export function ImageUploadWidget({
  label,
  value,
  onChange,
  type = "projects",
  slug = "new",
}: ImageUploadWidgetProps) {
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function uploadFile(file: File) {
    if (!/\.(jpg|jpeg|png|webp)$/i.test(file.name) && !file.type.startsWith("image/")) {
      setErrorMsg("Please select a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg("Image size exceeds 2MB limit.");
      return;
    }

    setUploading(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);
      formData.append("slug", slug || "cover");

      const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      onChange(data.url);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to upload cover image");
    } finally {
      setUploading(false);
    }
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  }

  return (
    <div className="space-y-3">
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </label>

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Upload Drag & Drop Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-5 text-center transition hover:border-accent/40 hover:bg-white/[0.04]"
      >
        <UploadCloud className="h-7 w-7 text-slate-500 mb-1.5" />
        <p className="text-xs font-medium text-slate-300">
          {uploading ? "Uploading image to Supabase..." : "Drag & drop cover image file here"}
        </p>
        <p className="text-[11px] text-slate-500 mt-1">Accepted: .jpg, .png, .webp (max 2MB)</p>

        <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-white/10">
          <ImageIcon className="h-3.5 w-3.5" />
          <span>Browse File</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={onFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Thumbnail Preview */}
      {value && (
        <div className="relative h-44 w-full overflow-hidden rounded-xl border border-white/10 bg-[#050814]">
          <Image
            src={value}
            alt="Cover image preview"
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute bottom-2 right-2 rounded-md bg-black/70 px-2 py-0.5 text-[10px] text-slate-300 backdrop-blur-sm">
            Cover Preview
          </div>
        </div>
      )}

      {/* Manual URL Input Fallback */}
      <Input
        label="Or enter Image URL manually"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://..."
      />
    </div>
  );
}
