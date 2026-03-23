import { useState } from "react";
import BalanceValue from "../BalanceValue";

const fmt = (n) =>
  "₦" + Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function SummaryChip({ label, value, color }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, flex: 1, minWidth: 0 }}>
      <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "nowrap" }}>
        {label}
      </span>
      <span style={{ fontSize: "0.9rem", fontWeight: 700, color, fontFamily: "'Playfair Display', serif" }}>
        {value}
      </span>
    </div>
  );
}

const IconCopy = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

export default function Statscard({
  mainBalance = 0,
  savingsBalance = 0,
  interestThisMonth = 0,
  billsThisMonth = 0,
  accountNumber = "",
  loading = false,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!accountNumber) return;
    navigator.clipboard.writeText(accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="balance-hero-card">
      <div className="balance-hero-deco" />

      <div className="balance-hero-body">
        {/* Label */}
        <div className="balance-hero-label">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
            <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
          </svg>
          Main Balance
        </div>

        {/* Balance value with eye toggle */}
        {loading ? (
          <div className="skeleton" style={{ height: 52, width: 220, borderRadius: 10, marginBottom: 6 }} />
        ) : (
          <BalanceValue
            value={mainBalance}
            className="balance-hero-value"
            style={{
              fontSize: "clamp(2rem, 5vw, 3rem)",
              fontWeight: 700,
              fontFamily: "'Playfair Display', serif",
              color: "white",
              letterSpacing: "-0.01em",
              lineHeight: 1.1,
              marginBottom: 4,
            }}
          />
        )}

        {/* Account number pill */}
        {accountNumber ? (
          <button
            onClick={handleCopy}
            style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.18)",
              color: "rgba(255,255,255,0.8)",
              padding: "5px 12px", borderRadius: 20,
              fontSize: "0.78rem", fontFamily: "monospace", fontWeight: 600,
              cursor: "pointer", transition: "all 0.18s",
              marginTop: 10,
            }}
            title="Click to copy"
          >
            {copied ? "✓ Copied!" : accountNumber}
            {!copied && <IconCopy />}
          </button>
        ) : (
          <p className="balance-hero-sub" style={{ marginTop: 8 }}>
            Spendable main account balance
          </p>
        )}

        {/* Divider */}
        <div className="balance-hero-divider" />

        {/* Summary strip */}
        <div className="balance-hero-summary">
          <SummaryChip label="Savings" value={loading ? "—" : fmt(savingsBalance)} color="#4ade80" />
          <div className="balance-hero-sep" />
          <SummaryChip label="Interest (mo)" value={loading ? "—" : "+" + fmt(interestThisMonth)} color="#60a5fa" />
          <div className="balance-hero-sep" />
          <SummaryChip label="Bills (mo)" value={loading ? "—" : fmt(billsThisMonth)} color="#fbbf24" />
        </div>
      </div>
    </div>
  );
}