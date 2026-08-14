import { promises as fs } from "fs";
import path from "path";
import { Project } from "@/data/content";

const PROJECTS_FILE = path.join(process.cwd(), "data", "projects.json");

async function ensureProjectsFile(): Promise<void> {
  try {
    await fs.access(PROJECTS_FILE);
  } catch {
    try {
      await fs.mkdir(path.dirname(PROJECTS_FILE), { recursive: true });
      await fs.writeFile(PROJECTS_FILE, "[]", "utf8");
    } catch {}
  }
}

import seedProjects from "@/data/projects.json";
import { supabaseDbDelete, supabaseDbQuery, supabaseDbUpsert } from "./supabase";

const memoryProjects: Project[] = [];

const DEFAULT_PROJECT_BANNERS: Record<string, string> = {
  "aegis-appsec": "/projects/aegis.jpg",
  "aurora-dashboard": "/projects/aurora.jpg",
  "blood-sugar-tracker": "/blood_sugar_banner.jpg",
  "nova-commerce": "/projects/nova.jpg",
  "pulse-chat": "/projects/pulse.jpg",
  "signal-ops": "/projects/ops.jpg",
};

export async function getAllProjects(): Promise<Project[]> {
  const map = new Map<string, Project>();

  try {
    // 1. Static seed projects from bundled JSON
    (seedProjects as Project[]).forEach((p) => {
      map.set(p.id, {
        ...p,
        image: p.image || DEFAULT_PROJECT_BANNERS[p.id] || "/projects/ops.jpg",
      });
    });

    // 2. Read from disk if readable
    try {
      await ensureProjectsFile();
      const raw = await fs.readFile(PROJECTS_FILE, "utf8");
      const projects = JSON.parse(raw) as Project[];
      projects.forEach((p) => {
        const existing = map.get(p.id);
        map.set(p.id, {
          ...existing,
          ...p,
          image: p.image || (p as any).image_url || existing?.image || DEFAULT_PROJECT_BANNERS[p.id] || "/projects/ops.jpg",
        });
      });
    } catch {
      // Read-only filesystem fallback
    }

    // 3. Overlay Supabase DB if connected
    try {
      const dbProjects = await supabaseDbQuery<any>("projects", "select=*");
      if (dbProjects && dbProjects.length > 0) {
        dbProjects.forEach((p) => {
          const existing = map.get(p.id);
          const resolvedImage =
            p.image || p.image_url || existing?.image || DEFAULT_PROJECT_BANNERS[p.id] || "/projects/ops.jpg";
          map.set(p.id, {
            ...existing,
            ...p,
            image: resolvedImage,
            tags: Array.isArray(p.tags) ? p.tags : existing?.tags || [],
            published: p.published !== undefined ? p.published : (existing?.published !== undefined ? existing.published : true),
            featured: p.featured !== undefined ? p.featured : (existing?.featured !== undefined ? existing.featured : true),
            year: p.year || existing?.year || "2025",
            status: p.status || existing?.status || "case-study",
            statusLabel: p.statusLabel || existing?.statusLabel || "Open Source Concept Build",
          });
        });
      }
    } catch {}

    // 4. Overlay in-memory cache LAST
    memoryProjects.forEach((p) => {
      const existing = map.get(p.id);
      map.set(p.id, {
        ...existing,
        ...p,
        image: p.image || existing?.image || DEFAULT_PROJECT_BANNERS[p.id] || "/projects/ops.jpg",
      });
    });
  } catch (err) {
    console.error("[getAllProjects] Exception:", err);
  }

  return Array.from(map.values()).sort((a, b) => {
    if (a.featured !== b.featured) {
      return a.featured ? -1 : 1;
    }
    return (b.year || "").localeCompare(a.year || "");
  });
}

export async function getPublishedProjects(): Promise<Project[]> {
  try {
    const projects = await getAllProjects();
    return projects.filter((p) => p.published !== false);
  } catch {
    return [];
  }
}

export async function getFeaturedProjects(): Promise<Project[]> {
  try {
    const projects = await getPublishedProjects();
    return projects.filter((p) => p.featured);
  } catch {
    return [];
  }
}

export async function getProjectById(id: string): Promise<Project | undefined> {
  try {
    const projects = await getAllProjects();
    const decoded = decodeURIComponent(id);
    return projects.find((p) => p.id === id || p.id === decoded);
  } catch {
    return undefined;
  }
}

export async function saveAllProjects(projects: Project[]): Promise<void> {
  try {
    // 1. Update memory store for active container session
    memoryProjects.length = 0;
    memoryProjects.push(...projects);

    // 2. Upsert to Supabase DB if available
    try {
      await supabaseDbUpsert("projects", projects);
    } catch {}

    // 3. Write to local disk if filesystem is writeable
    try {
      await ensureProjectsFile();
      await fs.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2), "utf8");
    } catch (err) {
      console.warn("[project-store] Read-only filesystem detected, saved to memory & Supabase fallback.");
    }
  } catch (err) {
    console.error("[saveAllProjects] Exception:", err);
  }
}

export type ProjectInput = Omit<Project, "id"> & { id?: string };

export async function createProject(input: ProjectInput): Promise<Project> {
  const projects = await getAllProjects();
  const id = input.id || input.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
  if (!id) throw new Error("Invalid ID");

  if (projects.some((p) => p.id === id)) {
    throw new Error("PROJECT_EXISTS");
  }

  const project: Project = {
    id,
    title: input.title.trim(),
    description: input.description.trim(),
    problem: input.problem.trim(),
    role: input.role.trim(),
    outcome: input.outcome.trim(),
    tags: (input.tags ?? []).map((t) => t.trim()).filter(Boolean),
    image: input.image?.trim() || undefined,
    liveUrl: input.liveUrl?.trim() || undefined,
    githubUrl: input.githubUrl?.trim() || undefined,
    status: input.status,
    statusLabel: input.statusLabel.trim(),
    featured: input.featured ?? false,
    year: input.year || new Date().getFullYear().toString(),
    published: input.published ?? true,
    appreciations: input.appreciations ?? 0,
    architecture: input.architecture?.trim() || undefined,
    implementation: input.implementation?.trim() || undefined,
    results: input.results?.trim() || undefined,
    contribution: input.contribution?.trim() || undefined,
    challenges: input.challenges?.trim() || undefined,
    privateExplanation: input.privateExplanation?.trim() || undefined,
    screenshots: input.screenshots || undefined,
  };

  projects.push(project);
  await saveAllProjects(projects);
  return project;
}

export async function updateProject(
  id: string,
  input: Partial<ProjectInput> & { newId?: string }
): Promise<Project> {
  const projects = await getAllProjects();
  const index = projects.findIndex((p) => p.id === id);
  if (index === -1) throw new Error("NOT_FOUND");

  const current = projects[index];
  let nextId = current.id;

  if (input.newId || input.id || input.title) {
    const candidate = (input.newId || input.id || input.title || current.id)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-");
    if (candidate && candidate !== current.id) {
      if (projects.some((p) => p.id === candidate)) {
        throw new Error("PROJECT_EXISTS");
      }
      nextId = candidate;
    }
  }

  const updated: Project = {
    ...current,
    id: nextId,
    title: input.title?.trim() ?? current.title,
    description: input.description?.trim() ?? current.description,
    problem: input.problem?.trim() ?? current.problem,
    role: input.role?.trim() ?? current.role,
    outcome: input.outcome?.trim() ?? current.outcome,
    tags:
      input.tags !== undefined
        ? input.tags.map((t) => t.trim()).filter(Boolean)
        : current.tags,
    image: input.image !== undefined ? input.image.trim() || undefined : current.image,
    liveUrl: input.liveUrl !== undefined ? input.liveUrl.trim() || undefined : current.liveUrl,
    githubUrl: input.githubUrl !== undefined ? input.githubUrl.trim() || undefined : current.githubUrl,
    status: input.status ?? current.status,
    statusLabel: input.statusLabel?.trim() ?? current.statusLabel,
    featured: input.featured !== undefined ? input.featured : current.featured,
    year: input.year ?? current.year,
    published: input.published !== undefined ? input.published : current.published,
    appreciations: input.appreciations !== undefined ? input.appreciations : current.appreciations,
    architecture: input.architecture !== undefined ? input.architecture.trim() || undefined : current.architecture,
    implementation: input.implementation !== undefined ? input.implementation.trim() || undefined : current.implementation,
    results: input.results !== undefined ? input.results.trim() || undefined : current.results,
    contribution: input.contribution !== undefined ? input.contribution.trim() || undefined : current.contribution,
    challenges: input.challenges !== undefined ? input.challenges.trim() || undefined : current.challenges,
    privateExplanation: input.privateExplanation !== undefined ? input.privateExplanation.trim() || undefined : current.privateExplanation,
    screenshots: input.screenshots !== undefined ? input.screenshots : current.screenshots,
  };

  projects[index] = updated;
  await saveAllProjects(projects);
  return updated;
}

export async function deleteProject(id: string): Promise<void> {
  const decoded = decodeURIComponent(id);

  // 1. Delete from Supabase DB
  try {
    await supabaseDbDelete("projects", `id=eq.${encodeURIComponent(id)}`);
    if (decoded !== id) {
      await supabaseDbDelete("projects", `id=eq.${encodeURIComponent(decoded)}`);
    }
  } catch {}

  // 2. Filter from memory store & local file
  const projects = await getAllProjects();
  const next = projects.filter((p) => p.id !== id && p.id !== decoded);

  memoryProjects.length = 0;
  memoryProjects.push(...next);

  try {
    await ensureProjectsFile();
    await fs.writeFile(PROJECTS_FILE, JSON.stringify(next, null, 2), "utf8");
  } catch {}
}
