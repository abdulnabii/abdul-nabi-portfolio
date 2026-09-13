import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import seedProjects from "@/data/projects.json";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const titleParam = searchParams.get("title");

    let title = titleParam || "Featured Project · Abdul Nabi";
    let statusLabel = "Production Case Study";
    let tags = ["Next.js", "TypeScript", "Python ML"];
    let year = "2026";

    if (id) {
      const project = (seedProjects as any[]).find((p) => p.id === id);
      if (project) {
        title = project.title;
        statusLabel = project.statusLabel || statusLabel;
        if (project.tags && project.tags.length > 0) {
          tags = project.tags;
        }
        if (project.year) {
          year = project.year;
        }
      }
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "60px 80px",
            backgroundColor: "#050814",
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.28) 0%, transparent 45%), radial-gradient(circle at 80% 80%, rgba(56, 189, 248, 0.22) 0%, transparent 45%)",
            fontFamily: "sans-serif",
            color: "white",
          }}
        >
          {/* Top Brand Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "48px",
                  height: "48px",
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, #6366f1, #38bdf8)",
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "white",
                }}
              >
                AN
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "22px", fontWeight: "bold", color: "#ffffff" }}>
                  Abdul Nabi
                </span>
                <span style={{ fontSize: "14px", color: "#94a3b8" }}>
                  aiwithab.site · Full-Stack &amp; ML Engineer
                </span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 16px",
                borderRadius: "999px",
                backgroundColor: "rgba(99, 102, 241, 0.15)",
                border: "1px solid rgba(99, 102, 241, 0.3)",
                color: "#c7d2fe",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              {statusLabel} · {year}
            </div>
          </div>

          {/* Center Title & Tags */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", margin: "30px 0" }}>
            <h1
              style={{
                fontSize: title.length > 40 ? "46px" : "56px",
                fontWeight: "800",
                lineHeight: 1.15,
                color: "#ffffff",
                letterSpacing: "-0.02em",
                margin: 0,
              }}
            >
              {title}
            </h1>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {tags.slice(0, 4).map((tag, i) => (
                <div
                  key={i}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    fontSize: "14px",
                    color: "#cbd5e1",
                  }}
                >
                  {tag}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Footer Info */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              paddingTop: "24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "16px", color: "#94a3b8" }}>
                Full Architecture &amp; Case Study on aiwithab.site
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "999px",
                  backgroundColor: "#34d399",
                }}
              />
              <span style={{ fontSize: "14px", color: "#34d399", fontWeight: "600" }}>
                Open to Engineering Roles
              </span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to generate project OG image";
    return new Response(message, { status: 500 });
  }
}
