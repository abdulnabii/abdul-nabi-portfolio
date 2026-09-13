import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const disallowed = [
    "/admin/",
    "/admin/*",
    "/api/admin/",
    "/api/admin/*",
    "/api/auth/",
    "/api/auth/*",
    "/api/preview",
    "/api/exit-preview",
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: disallowed,
      },
      {
        userAgent: [
          "Googlebot",
          "Bingbot",
          "Applebot",
          "DuckDuckBot",
          "Slurp",
          "Baiduspider",
          "YandexBot",
          "GPTBot",
          "OAI-SearchBot",
          "ChatGPT-User",
          "PerplexityBot",
          "ClaudeBot",
          "anthropic-ai",
          "Google-Extended",
          "cohere-ai",
          "Bytespider",
          "CCBot",
          "FacebookBot",
          "Twitterbot",
          "LinkedInBot",
        ],
        allow: "/",
        disallow: disallowed,
      },
    ],
    sitemap: "https://www.aiwithab.site/sitemap.xml",
    host: "https://www.aiwithab.site",
  };
}


