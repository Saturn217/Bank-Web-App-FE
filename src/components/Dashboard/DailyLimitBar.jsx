/**
 * DailyLimitBar
 * ─────────────────────────────────────────────────────────────────
 * Shows a live progress bar tracking the daily transaction limit.
 *
 * Props:
 *   used    – amount already transacted today (from API)
 *   pending – amount the user currently has typed (live preview)
 *   limit   – the full daily cap
 *   color   – 'blue' | 'amber' | 'green'
 *   label   – e.g. "Daily Transfer Limit"
 */

const fmt = (n) =>
  "₦" + Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const COLORS = {
  blue:  { base: "#2563eb", light: "rgba(37,99,235,0.18)",  track: "#dbeafe", text: "#1d4ed8" },
  amber: { base: "#d97706", light: "rgba(217,119,6,0.18)",  track: "#fef3c7", text: "#92400e" },
  green: { base: "#16a34a", light: "rgba(22,163,74,0.18)",  track: "#dcfce7", text: "#166534" },
};

export default function DailyLimitBar({ used = 0, pending = 0, limit = 1_000_000, color = "blue", label = "Daily Limit" }) {
  const c = COLORS[color] || COLORS.blue;

  const usedClamped    = Math.min(used, limit);
  const totalWithPending = Math.min(used + pending, limit);
  const isOverLimit    = (used + pending) > limit;
  const isNearLimit    = (used + pending) / limit >= 0.9;
  const isWarning      = (used + pending) / limit >= 0.7;

  const usedPct    = (usedClamped / limit) * 100;
  const pendingPct = Math.max(0, (totalWithPending / limit) * 100 - usedPct);

  // Bar accent colour changes by usage severity
  const barColor  = isOverLimit || isNearLimit ? "#ef4444" : isWarning ? "#f59e0b" : c.base;
  const pendingColor = isOverLimit || isNearLimit ? "rgba(239,68,68,0.35)" : isWarning ? "rgba(245,158,11,0.35)" : c.light;

  const remaining = Math.max(0, limit - used - pending);

  return (
    <div style={{
      background: "white",
      border: `1px solid ${isOverLimit ? "#fecaca" : "#e2e8f0"}`,
      borderRadius: 14,
      padding: "14px 18px",
      marginBottom: 20,
      boxShadow: "0 2px 8px rgba(0,0,0,.04)",
      transition: "border-color .2s",
    }}>
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          {/* Icon */}
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: isOverLimit ? "#fef2f2" : c.track,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke={isOverLimit ? "#ef4444" : barColor} strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M2 12h20" />
            </svg>
          </div>
          <span style={{ fontSize: ".78rem", fontWeight: 700, color: "#1e293b", letterSpacing: ".01em" }}>
            {label}
          </span>
        </div>

        {/* Used / Limit */}
        <span style={{ fontSize: ".75rem", fontWeight: 600, color: isOverLimit ? "#ef4444" : "#64748b" }}>
          {fmt(used + pending)} <span style={{ fontWeight: 400, color: "#94a3b8" }}>of</span> {fmt(limit)}
        </span>
      </div>

      {/* Progress track */}
      <div style={{
        height: 9, borderRadius: 99,
        background: "#f1f5f9",
        overflow: "hidden", position: "relative",
      }}>
        {/* Used portion */}
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0,
          width: `${usedPct}%`,
          background: barColor,
          borderRadius: 99,
          transition: "width .4s ease, background .3s",
        }} />
        {/* Pending portion (lighter) */}
        {pending > 0 && (
          <div style={{
            position: "absolute", top: 0, bottom: 0,
            left: `${usedPct}%`,
            width: `${pendingPct}%`,
            background: pendingColor,
            borderRadius: "0 99px 99px 0",
            transition: "width .25s ease",
            backdropFilter: "blur(2px)",
          }} />
        )}
      </div>

      {/* Footer row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
        {/* Left: used today label */}
        <span style={{ fontSize: ".72rem", color: "#94a3b8" }}>
          Used today:&nbsp;
          <strong style={{ color: "#64748b" }}>{fmt(used)}</strong>
          {pending > 0 && (
            <span style={{ color: isOverLimit ? "#ef4444" : isWarning ? "#f59e0b" : c.text }}>
              {" "}+ {fmt(pending)} pending
            </span>
          )}
        </span>

        {/* Right: remaining */}
        {isOverLimit ? (
          <span style={{ fontSize: ".72rem", fontWeight: 700, color: "#ef4444" }}>
            ⚠ Exceeds daily limit
          </span>
        ) : (
          <span style={{ fontSize: ".72rem", color: "#94a3b8" }}>
            <strong style={{ color: isNearLimit ? "#ef4444" : isWarning ? "#f59e0b" : "#64748b" }}>
              {fmt(remaining)}
            </strong>
            &nbsp;remaining
          </span>
        )}
      </div>
    </div>
  );
}
