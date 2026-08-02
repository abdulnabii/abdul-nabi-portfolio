"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Download, FileText, UploadCloud } from "lucide-react";
import { useState, ChangeEvent, DragEvent } from "react";

interface CvManagerProps {
  currentCvUrl: string;
}

export function CvManager({ currentCvUrl: initialUrl }: CvManagerProps) {
  const [cvUrl, setCvUrl] = useState(initialUrl);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadInfo, setUploadInfo] = useState<{
    fileName: string;
    fileSize: number;
    uploadedAt: string;
  } | null>(null);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function handleFileSelect(selectedFile: File) {
    if (selectedFile.type !== "application/pdf" && !selectedFile.name.endsWith(".pdf")) {
      setStatus("error");
      setErrorMsg("Please select a PDF file (.pdf).");
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setStatus("error");
      setErrorMsg("File size exceeds 5MB limit.");
      return;
    }

    setFile(selectedFile);
    setStatus("idle");
    setErrorMsg(null);
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }

  async function handleUpload() {
    if (!file) return;

    setUploading(true);
    setStatus("idle");
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload-cv", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setCvUrl(data.cvUrl);
      setUploadInfo({
        fileName: data.fileName,
        fileSize: data.fileSize,
        uploadedAt: data.uploadedAt,
      });
      setStatus("success");
      setFile(null);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Failed to upload CV");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          CV / Resume Manager
        </h4>
        <a
          href={cvUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-accent-soft hover:underline font-medium"
        >
          <Download className="h-3.5 w-3.5" />
          Download current CV
        </a>
      </div>

      {status === "success" && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>New CV uploaded and active across the public portfolio!</span>
        </div>
      )}

      {status === "error" && errorMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Current File Metadata Card */}
      <div className="flex items-center justify-between rounded-xl bg-white/[0.03] p-3 border border-white/5 text-xs">
        <div className="flex items-center gap-2.5">
          <FileText className="h-5 w-5 text-indigo-400 shrink-0" />
          <div>
            <p className="font-semibold text-white">
              {uploadInfo ? uploadInfo.fileName : "ab_resume.pdf"}
            </p>
            <p className="text-slate-500">
              {uploadInfo
                ? `${(uploadInfo.fileSize / 1024).toFixed(1)} KB · Uploaded ${new Date(uploadInfo.uploadedAt).toLocaleTimeString()}`
                : "Active public resume document"}
            </p>
          </div>
        </div>
        <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300 border border-emerald-500/20">
          Active
        </span>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/[0.01] p-6 text-center transition hover:border-accent/40 hover:bg-white/[0.03]"
      >
        <UploadCloud className="h-8 w-8 text-slate-500 mb-2" />
        <p className="text-sm font-medium text-slate-300">
          {file ? file.name : "Drag & drop new resume PDF here, or browse"}
        </p>
        <p className="text-xs text-slate-500 mt-1">PDF format only, maximum 5MB file size.</p>

        <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-white/10">
          <span>Browse File</span>
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={onFileChange}
            className="hidden"
          />
        </label>
      </div>

      {file && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-400">
            Selected: <span className="font-medium text-white">{file.name}</span> ({(file.size / 1024).toFixed(1)} KB)
          </span>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? "Uploading PDF..." : "Upload & Replace CV"}
          </Button>
        </div>
      )}
    </div>
  );
}
