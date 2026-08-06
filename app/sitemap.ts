import { getAllBlogs } from "@/lib/blog-store";
import { getAllProjects } from "@/lib/project-store";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.aiwithab.site";

  // Static core routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  // Dynamic project routes
  let projectRoutes: MetadataRoute.Sitemap = [];
  try {
    const projects = await getAllProjects();
    projectRoutes = projects.map((project) => ({
      url: `${baseUrl}/projects/${project.id}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.95,
    }));
  } catch (err) {
    console.error("[Sitemap] Error fetching projects:", err);
  }

  // Dynamic blog routes
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const blogs = await getAllBlogs();
    blogRoutes = blogs
      .filter((post) => post.published)
      .map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.date || Date.now()),
        changeFrequency: "daily",
        priority: 0.9,
      }));
  } catch (err) {
    console.error("[Sitemap] Error fetching blogs:", err);
  }

  return [...staticRoutes, ...projectRoutes, ...blogRoutes];
}
