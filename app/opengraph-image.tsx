import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "DeskFit 2D desk setup planner";
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#f7f7f4",
          color: "#172026",
          fontFamily: "Arial, sans-serif"
        }}
      >
        <div
          style={{
            width: "46%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "72px"
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              background: "#0f766e",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 900,
              marginBottom: 36
            }}
          >
            DF
          </div>
          <div style={{ fontSize: 76, fontWeight: 900, lineHeight: 0.95 }}>DeskFit</div>
          <div style={{ marginTop: 26, fontSize: 30, lineHeight: 1.35, color: "#475569" }}>
            Plan your desk setup before buying anything.
          </div>
        </div>
        <div
          style={{
            width: "54%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div
            style={{
              width: 560,
              height: 300,
              borderRadius: 22,
              background: "#d8bd93",
              border: "6px solid #b68f61",
              boxShadow: "0 28px 70px rgba(15, 23, 42, 0.22)",
              position: "relative"
            }}
          >
            <div style={{ position: "absolute", left: 166, top: 36, width: 220, height: 58, borderRadius: 8, background: "#111827" }} />
            <div style={{ position: "absolute", left: 244, top: 92, width: 62, height: 22, borderRadius: 5, background: "#475569" }} />
            <div style={{ position: "absolute", left: 170, top: 190, width: 220, height: 48, borderRadius: 8, background: "#334155" }} />
            <div style={{ position: "absolute", left: 406, top: 162, width: 102, height: 92, borderRadius: 10, background: "#99f6e4" }} />
            <div style={{ position: "absolute", left: 438, top: 186, width: 34, height: 50, borderRadius: 999, background: "#0f766e" }} />
            <div style={{ position: "absolute", left: 52, top: 54, width: 92, height: 70, borderRadius: 10, background: "#f8fafc" }} />
            <div style={{ position: "absolute", right: 22, bottom: 18, color: "#0f766e", fontSize: 28, fontWeight: 900 }}>92/100</div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
