import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site-config";

export const alt = `${siteConfig.name}: ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Image generation cannot read the Tailwind theme, so these repeat the palette in globals.css.
const BACKGROUND = "#0f172a";
const FOREGROUND = "#ffffff";

/** The image shown when a page is shared on social media or in chat apps. */
export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 80,
        background: BACKGROUND,
        color: FOREGROUND,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <div
          style={{
            width: 96,
            height: 96,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 24,
            background: FOREGROUND,
            color: BACKGROUND,
            fontSize: 64,
            fontWeight: 800,
          }}
        >
          {siteConfig.name.charAt(0)}
        </div>
        <div style={{ fontSize: 64, fontWeight: 800 }}>{siteConfig.name}</div>
      </div>
      <div style={{ marginTop: 56, fontSize: 80, fontWeight: 800, lineHeight: 1.1 }}>
        {siteConfig.tagline}
      </div>
    </div>,
    size,
  );
}
