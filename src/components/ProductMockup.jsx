/**
 * Lightweight, static CSS/SVG product visuals — used in place of real
 * screenshots where none exist, and in place of any 3D/decorative scene.
 * No animation beyond the page's normal scroll-reveal.
 */

export function BrowserMockup({ accent = "var(--accent)", rows = 3, style }) {
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "var(--shadow-md)",
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", borderBottom: "1px solid var(--border)", background: "var(--bg-card2)" }}>
        {["var(--mock-dot)", "var(--mock-dot)", "var(--mock-dot)"].map((c, i) => (
          <span key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
        ))}
        <div style={{ flex: 1, height: 16, borderRadius: 5, background: "var(--bg-card)", border: "1px solid var(--border)", marginLeft: 8 }} />
      </div>
      <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ width: "55%", height: 12, borderRadius: 4, background: accent, opacity: 0.85 }} />
        <div style={{ width: "80%", height: 8, borderRadius: 4, background: "var(--border)" }} />
        <div style={{ width: "65%", height: 8, borderRadius: 4, background: "var(--border)" }} />
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${rows}, 1fr)`, gap: 10, marginTop: 6 }}>
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} style={{ height: 56, borderRadius: 8, background: "var(--bg-card2)", border: "1px solid var(--border)" }} />
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <div style={{ width: 72, height: 26, borderRadius: 7, background: accent, opacity: 0.9 }} />
          <div style={{ width: 72, height: 26, borderRadius: 7, background: "var(--bg-card2)", border: "1px solid var(--border)" }} />
        </div>
      </div>
    </div>
  );
}

export function PhoneMockup({ accent = "var(--accent)", style }) {
  return (
    <div
      style={{
        width: 128,
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 20,
        boxShadow: "var(--shadow-md)",
        padding: 8,
        ...style,
      }}
    >
      <div style={{ background: "var(--bg-card2)", borderRadius: 13, padding: "16px 10px", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: accent, opacity: 0.85, margin: "0 auto" }} />
        <div style={{ width: "70%", height: 7, borderRadius: 3, background: "var(--border)", margin: "4px auto 0" }} />
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ height: 30, borderRadius: 7, background: "var(--bg-card)", border: "1px solid var(--border)" }} />
        ))}
        <div style={{ height: 22, borderRadius: 7, background: accent, opacity: 0.9, marginTop: 4 }} />
      </div>
    </div>
  );
}
