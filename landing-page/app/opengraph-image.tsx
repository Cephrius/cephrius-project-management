import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "JobSyte — Construction project management software for contractors";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background:
            "linear-gradient(135deg, #0a0a0a 0%, #131a2a 55%, #1e2a4a 100%)",
          color: "#ffffff",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#3b82f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 28,
              color: "#ffffff",
              letterSpacing: -1,
            }}
          >
            JS
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: -0.5,
            }}
          >
            JobSyte
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -2,
              maxWidth: 980,
            }}
          >
            Construction project management built for sub-contractors.
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#94a3b8",
              maxWidth: 880,
              lineHeight: 1.35,
            }}
          >
            Projects, jobs, invoices, payroll, and dashboard reporting in one
            workflow.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 22,
            color: "#cbd5e1",
          }}
        >
          <div>jobsyte.co</div>
          <div
            style={{
              padding: "10px 20px",
              borderRadius: 999,
              background: "#3b82f6",
              color: "#ffffff",
              fontWeight: 600,
            }}
          >
            Request a demo →
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
