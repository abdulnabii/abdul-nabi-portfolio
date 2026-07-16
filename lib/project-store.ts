import { promises as fs } from "fs";
import path from "path";
import { Project } from "@/data/content";

const PROJECTS_FILE = path.join(process.cwd(), "data", "projects.json");

async function ensureProjectsFile(): Promise<void> {
  try {
    await fs.access(PROJECTS_FILE);
  } catch {
    await fs.mkdir(path.dirname(PROJECTS_FILE), { recursive: true });
    await fs.writeFile(PROJECTS_FILE, "[]", "utf8");
  }
}

export async function getAllProjects(): Promise<Project[]> {
  await ensureProjectsFile();
  const raw = await fs.readFile(PROJECTS_FILE, "utf8");
  const projects = JSON.parse(raw) as Project[];
  // Sort projects: featured first, then by year descending
  return projects.sort((a, b) => {
    if (a.featured !== b.featured) {
      return a.featured ? -1 : 1;
    }
    return b.year.localeCompare(a.year);
  });
}

export async function getPublishedProjects(): Promise<Project[]> {
  const projects = await getAllProjects();
  return projects.filter((p) => p.published !== false);
}

export async function getFeaturedProjects(): Promise<Project[]> {
  const projects = await getPublishedProjects();
  return projects.filter((p) => p.featured);
}

export async function getProjectById(id: string): Promise<Project | undefined> {
  const projects = await getAllProjects();
  return projects.find((p) => p.id === id);
}

export async function saveAllProjects(projects: Project[]): Promise<void> {
  await ensureProjectsFile();
  await fs.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2), "utf8");
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
  };

  projects[index] = updated;
  await saveAllProjects(projects);
  return updated;
}

export async function deleteProject(id: string): Promise<void> {
  const projects = await getAllProjects();
  const next = projects.filter((p) => p.id !== id);
  if (next.length === projects.length) throw new Error("NOT_FOUND");
  await saveAllProjects(next);
}
