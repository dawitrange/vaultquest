import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const runtime = "edge";
export const alt = `${SITE.name} — ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 64,
          background: "linear-gradient(145deg, #0b1014 0%, #122028 55%, #0f3d3a 100%)",
          color: "#e8eef2",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 999,
              border: "2px solid #2dd4bf",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#c4a574",
              fontSize: 28,
            }}
          >
            ◈
          </div>
          <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: -1 }}>{SITE.name}</div>
        </div>
        <div style={{ fontSize: 36, fontWeight: 600, maxWidth: 900, lineHeight: 1.2 }}>{SITE.tagline}</div>
        <div style={{ marginTop: 16, fontSize: 22, color: "#9aa8b5", maxWidth: 920, lineHeight: 1.35 }}>
          {SITE.promise}
        </div>
        <div style={{ marginTop: 36, fontSize: 18, color: "#2dd4bf" }}>vaultquest.io</div>
      </div>
    ),
    { ...size },
  );
}
