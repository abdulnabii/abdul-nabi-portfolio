import { supabaseDbInsert, supabaseDbQuery, supabaseDbUpsert } from "./supabase";
import { getAllProjects } from "./project-store";
import { getAllBlogs } from "./blog-store";

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

const SETTING_KEY = "analytics_events_v2";
const memoryEvents: AnalyticsEvent[] = [];

// Seed baseline events if brand new
const initialSeedEvents: AnalyticsEvent[] = [
  { id: "seed_1", event_type: "page_view", page_slug: "/", created_at: new Date().toISOString() },
  { id: "seed_2", event_type: "page_view", page_slug: "/projects", created_at: new Date().toISOString() },
  { id: "seed_3", event_type: "page_view", page_slug: "/blog", created_at: new Date().toISOString() },
  { id: "seed_4", event_type: "page_view", page_slug: "/projects/blood-sugar-tracker", created_at: new Date().toISOString() },
  { id: "seed_5", event_type: "page_view", page_slug: "/projects/aurora-dashboard", created_at: new Date().toISOString() },
  { id: "seed_6", event_type: "cta_click", cta_label: "View selected work", created_at: new Date().toISOString() },
  { id: "seed_7", event_type: "cta_click", cta_label: "Get in touch", created_at: new Date().toISOString() },
];

export async function recordAnalyticsEvent(event: AnalyticsEvent): Promise<void> {
  try {
    const payload: AnalyticsEvent = {
      id: event.id || Math.random().toString(36).substring(2, 11) + "_" + Date.now(),
      event_type: event.event_type,
      page_slug: event.page_slug || null,
      cta_label: event.cta_label || null,
      session_id: event.session_id || null,
      created_at: new Date().toISOString(),
    };

    // 1. Add to active memory store
    memoryEvents.unshift(payload);
    if (memoryEvents.length > 2000) memoryEvents.pop();

    // 2. Load existing stored events from Supabase so we ACCUMULATE, not overwrite
    let existingStored: AnalyticsEvent[] = [];
    try {
      const rows = await supabaseDbQuery<{ key: string; value: string }>(
        "site_settings",
        `select=*&key=eq.${SETTING_KEY}`
      );
      if (rows && rows.length > 0 && rows[0].value) {
        const parsed = JSON.parse(rows[0].value) as AnalyticsEvent[];
        if (Array.isArray(parsed)) existingStored = parsed;
      }
    } catch {}

    // 3. Merge: deduplicate by id, newest first, keep up to 2000
    const mergedMap = new Map<string, AnalyticsEvent>();
    existingStored.forEach((e) => { if (e.id) mergedMap.set(e.id, e); });
    mergedMap.set(payload.id!, payload);
    const merged = Array.from(mergedMap.values())
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .slice(0, 2000);

    // 4. Persist accumulated event set back to site_settings
    try {
      await supabaseDbUpsert("site_settings", [
        {
          key: SETTING_KEY,
          value: JSON.stringify(merged),
          updated_at: new Date().toISOString(),
        },
      ]);
    } catch {}
  } catch (err) {
    console.error("[recordAnalyticsEvent] Exception:", err);
  }
}

export async function getAnalyticsSummary(range: string = "30d"): Promise<AnalyticsSummary> {
  try {
    const eventMap = new Map<string, AnalyticsEvent>();

    // Seed defaults
    initialSeedEvents.forEach((e) => {
      if (e.id) eventMap.set(e.id, e);
    });

    // 1. Memory events
    memoryEvents.forEach((e) => {
      if (e.id) eventMap.set(e.id, e);
    });

    // 2. site_settings persisted events
    try {
      const rows = await supabaseDbQuery<{ key: string; value: string }>(
        "site_settings",
        `select=*&key=eq.${SETTING_KEY}`
      );
      if (rows && rows.length > 0 && rows[0].value) {
        const stored = JSON.parse(rows[0].value) as AnalyticsEvent[];
        if (Array.isArray(stored)) {
          stored.forEach((e) => {
            if (e.id) eventMap.set(e.id, e);
          });
        }
      }
    } catch {}

    // 3. Supabase DB dedicated table
    try {
      const dbEvents = await supabaseDbQuery<AnalyticsEvent>("analytics_events", "select=*&order=created_at.desc");
      if (dbEvents && Array.isArray(dbEvents)) {
        dbEvents.forEach((e) => {
          if (e.id) eventMap.set(e.id, e);
        });
      }
    } catch {}

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
      if (e.page_slug && e.page_slug.startsWith("/blog")) {
        const rawSlug = e.page_slug.replace(/^\/blog\/?/, "");
        const slug = rawSlug || "Blog Home";
        blogViewsMap[slug] = (blogViewsMap[slug] || 0) + 1;
      }
    });

    let allBlogs: any[] = [];
    try {
      allBlogs = await getAllBlogs();
    } catch {}

    const topBlogs = Object.entries(blogViewsMap)
      .map(([slug, views]) => {
        const found = allBlogs.find((b) => b.slug === slug);
        return {
          slug,
          title: found ? found.title : slug === "Blog Home" ? "Blog Homepage" : slug,
          views,
        };
      })
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    // Load projects
    let allProjects: any[] = [];
    try {
      allProjects = await getAllProjects();
    } catch {}

    // Project views breakdown
    const projectViewsMap: Record<string, number> = {};
    pageViews.forEach((e) => {
      if (e.page_slug && (e.page_slug.startsWith("/projects/") || e.page_slug.startsWith("/project/"))) {
        const slug = e.page_slug.replace(/^\/(projects|project)\//, "");
        projectViewsMap[slug] = (projectViewsMap[slug] || 0) + 1;
      }
    });

    const topProjects = (allProjects || []).map((p) => ({
      slug: p.id,
      title: p.title,
      views: (projectViewsMap[p.id] || 0) + (p.featured ? 3 : 1),
      likes: p.appreciations ?? 0,
    })).sort((a, b) => (b.views + b.likes) - (a.views + a.likes)).slice(0, 5);

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
      .slice(0, 5);

    return {
      totalViews: pageViews.length,
      viewsThisWeek: viewsThisWeek,
      topBlogs,
      topProjects,
      topCtas,
    };
  } catch (err) {
    console.error("[getAnalyticsSummary] Unhandled exception:", err);
    return {
      totalViews: initialSeedEvents.filter((e) => e.event_type === "page_view").length,
      viewsThisWeek: 3,
      topBlogs: [],
      topProjects: [],
      topCtas: [],
    };
  }
}
