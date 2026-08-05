import { supabaseDbInsert, supabaseDbQuery } from "./supabase";
import { getAllProjects } from "./project-store";

export interface AnalyticsEvent {
  id?: string;
  event_type: "page_view" | "cta_click";
  page_slug?: string | null;
  cta_label?: string | null;
  session_id?: string | null;
  created_at?: string;
}

export interface AnalyticsSummary {
  totalViews: number;
  viewsThisWeek: number;
  topBlogs: { slug: string; title: string; views: number }[];
  topProjects: { slug: string; title: string; views: number; likes: number }[];
  topCtas: { label: string; clicks: number }[];
}

// Memory fallback store for active serverless session
const memoryEvents: AnalyticsEvent[] = [];

export async function recordAnalyticsEvent(event: AnalyticsEvent): Promise<void> {
  const payload: AnalyticsEvent = {
    id: event.id || Math.random().toString(36).substring(2, 11) + "_" + Date.now(),
    event_type: event.event_type,
    page_slug: event.page_slug || null,
    cta_label: event.cta_label || null,
    session_id: event.session_id || null,
    created_at: new Date().toISOString(),
  };

  memoryEvents.unshift(payload);
  await supabaseDbInsert("analytics_events", payload);
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const eventMap = new Map<string, AnalyticsEvent>();

  // 1. Load memory events
  memoryEvents.forEach((e) => {
    if (e.id) eventMap.set(e.id, e);
  });

  // 2. Load Supabase DB events
  const dbEvents = await supabaseDbQuery<AnalyticsEvent>("analytics_events", "select=*&order=created_at.desc");
  if (dbEvents && dbEvents.length > 0) {
    dbEvents.forEach((e) => {
      if (e.id) eventMap.set(e.id, e);
    });
  }

  const events = Array.from(eventMap.values());
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const pageViews = events.filter((e) => e.event_type === "page_view");
  const viewsThisWeek = pageViews.filter((e) => {
    if (!e.created_at) return true;
    return new Date(e.created_at) >= sevenDaysAgo;
  }).length;

  // Blog views breakdown
  const blogViewsMap: Record<string, number> = {};
  pageViews.forEach((e) => {
    if (e.page_slug && e.page_slug.startsWith("/blog/")) {
      const slug = e.page_slug.replace("/blog/", "");
      blogViewsMap[slug] = (blogViewsMap[slug] || 0) + 1;
    }
  });

  const topBlogs = Object.entries(blogViewsMap)
    .map(([slug, views]) => ({ slug, title: slug, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 3);

  // Load project appreciation likes from project store
  const allProjects = await getAllProjects();

  // Project views breakdown
  const projectViewsMap: Record<string, number> = {};
  pageViews.forEach((e) => {
    if (e.page_slug && (e.page_slug.startsWith("/projects/") || e.page_slug.startsWith("/project/"))) {
      const slug = e.page_slug.replace(/^\/(projects|project)\//, "");
      projectViewsMap[slug] = (projectViewsMap[slug] || 0) + 1;
    }
  });

  const topProjects = allProjects.slice(0, 4).map((p) => ({
    slug: p.id,
    title: p.title,
    views: projectViewsMap[p.id] || 0,
    likes: p.appreciations ?? 0,
  })).sort((a, b) => (b.likes + b.views) - (a.likes + a.views));

  // CTA Clicks breakdown
  const ctaMap: Record<string, number> = {};
  events
    .filter((e) => e.event_type === "cta_click")
    .forEach((e) => {
      if (e.cta_label) {
        ctaMap[e.cta_label] = (ctaMap[e.cta_label] || 0) + 1;
      }
    });

  const topCtas = Object.entries(ctaMap)
    .map(([label, clicks]) => ({ label, clicks }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 4);

  return {
    totalViews: pageViews.length,
    viewsThisWeek: viewsThisWeek,
    topBlogs,
    topProjects,
    topCtas,
  };
}
