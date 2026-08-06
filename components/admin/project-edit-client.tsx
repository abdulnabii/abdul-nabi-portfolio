"use client";

import { useEffect, useState } from "react";
import { ProjectForm } from "@/components/admin/project-form";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import type { Project } from "@/data/content";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

interface ProjectEditClientProps {
  id: string;
  initialProject?: Project;
}

export function ProjectEditClient({ id, initialProject }: ProjectEditClientProps) {
  const [project, setProject] = useState<Project | undefined>(initialProject);
  const [loading, setLoading] = useState(!initialProject);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (initialProject) {
      setProject(initialProject);
      setLoading(false);
      return;
    }

    const decodedId = decodeURIComponent(id);

    // Fetch from server API
    fetch(`/api/projects/${encodeURIComponent(decodedId)}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.project) {
          setProject(data.project);
          setLoading(false);
          return;
        }
        throw new Error("Not found on API");
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [id, initialProject]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-white">Project Not Found</h3>
          <p className="mt-2 text-sm text-slate-400">
            The project with ID &quot;{id}&quot; could not be located in the database.
          </p>
          <div className="mt-6">
            <Link href="/admin/projects">
              <Button variant="secondary" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to all projects
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">Edit project</h2>
        <p className="mt-1 text-sm text-slate-400">/{project.id}</p>
      </div>
      <GlassCard padding="lg" elevated>
        <ProjectForm mode="edit" initial={project} />
      </GlassCard>
    </div>
  );
}
