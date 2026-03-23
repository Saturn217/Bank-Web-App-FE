import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const MODAL_CSS = `
  .txn-modal-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.5);
    backdrop-filter: blur(4px);
    z-index: 9999;
    display: flex; align-items: center; justify-content: center;
    padding: 16px;
    animation: txnFadeIn 0.2s ease;
  }
  @keyframes txnFadeIn { from { opacity:0; } to { opacity:1; } }
  .txn-modal {
    background: #fff;
    border-radius: 20px;
    width: 100%; max-width: 440px;
    box-shadow: 0 24px 72px rgba(0,0,0,0.22);
    overflow: hidden;
    animation: txnSlideUp 0.25s cubic-bezier(0.34,1.56,0.64,1);
  }
  @keyframes txnSlideUp {
    from { opacity:0; transform: translateY(24px) scale(0.97); }
    to   { opacity:1; transform: translateY(0) scale(1); }
  }
  .txn-modal-header {
    padding: 28px 28px 20px;
    display: flex; flex-direction: column; align-items: center; gap: 10px;
    text-align: center;
  }
  .txn-modal-icon {
    width: 64px; height: 64px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.8rem; flex-shrink: 0;
  }
  .txn-modal-icon.credit { background: #f0fdf4; }
  .txn-modal-icon.debit  { background: #fef2f2; }
  .txn-modal-status {
    font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.1em; padding: 4px 14px; border-radius: 20px;
  }
  .txn-modal-status.success { background: #dcfce7; color: #16a34a; }
  .txn-modal-status.pending { background: #fef9c3; color: #ca8a04; }
  .txn-modal-status.failed  { background: #fee2e2; color: #dc2626; }
  .txn-modal-amount {
    font-family: 'Playfair Display', serif;
    font-size: 2.2rem; font-weight: 700; line-height: 1.1;
  }
  .txn-modal-amount.credit { color: #16a34a; }
  .txn-modal-amount.debit  { color: #ef4444; }
  .txn-modal-type-label { font-size: 0.88rem; color: #64748b; }
  .txn-modal-divider { height: 1px; background: #f1f5f9; margin: 0 28px; }
  .txn-modal-body {
    padding: 20px 28px 28px;
    display: flex; flex-direction: column; gap: 0;
  }
  .txn-modal-row {
    display: flex; justify-content: space-between; align-items: flex-start;
    padding: 11px 0; border-bottom: 1px solid #f1f5f9; gap: 16px;
  }
  .txn-modal-row:last-of-type { border-bottom: none; }
  .txn-modal-row-label { font-size: 0.82rem; color: #64748b; flex-shrink: 0; }
  .txn-modal-row-value {
    font-size: 0.88rem; font-weight: 600; color: #1e293b;
    text-align: right; word-break: break-word;
  }
  .txn-modal-close {
    width: 100%; padding: 14px; margin-top: 8px;
    background: #1b3a6b; color: white;
    border: none; cursor: pointer; border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem; font-weight: 700;
    transition: background 0.18s;
  }
  .txn-modal-close:hover { background: #122850; }
`;

function injectModalStyles() {
    if (document.getElementById("txn-modal-styles")) return;
    const el = document.createElement("style");
    el.id = "txn-modal-styles";
    el.textContent = MODAL_CSS;
    document.head.appendChild(el);
}

/* ─── Helpers ────────────────────────────────────────────────────── */
function isCredit(txn) {
    const amt = Number(txn.amount);
    const type = (txn.type || "").toLowerCase();
    const desc = (txn.description || "").toLowerCase();

    // Savings interest = neutral (neither in nor out on main balance)
    if (type.includes("savings interest") || type.includes("savings_interest")) return null;

    // Savings deposit = OUT (money leaves main account)
    if (type.includes("savings deposit") || type.includes("savings_deposit")) return false;

    // Savings withdrawal = IN (money returns to main account)
    if (type.includes("savings withdrawal") || type.includes("savings_withdrawal")) return true;

    if (amt < 0) return false;
    const debitTypes = ["transfer out", "bill payment", "withdrawal"];
    if (debitTypes.some((k) => type.includes(k))) return false;
    if (type.includes("transfer")) {
        if (desc.includes(" to ")) return false;
        if (desc.includes(" from ")) return true;
    }
    const creditTypes = ["deposit", "transfer in", "bonus", "interest"];
    if (creditTypes.some((k) => type.includes(k))) return true;
    return amt >= 0;
}

const txnColors = {
    "savings interest":  { bg: "#f0fdf4", color: "#16a34a" },
    "savings deposit":   { bg: "#f0fdf4", color: "#16a34a" },
    "bill payment":      { bg: "#fef2f2", color: "#dc2626" },
    "transfer out":      { bg: "#fef2f2", color: "#dc2626" },
    "transfer in":       { bg: "#f0fdf4", color: "#16a34a" },
    "transfer":          { bg: "#eff6ff", color: "#2563eb" },
    "deposit":           { bg: "#f0fdf4", color: "#16a34a" },
    "withdrawal":        { bg: "#fff7ed", color: "#d97706" },
};

function getTypeBadge(type = "") {
    const key = type.toLowerCase();
    for (const [k, v] of Object.entries(txnColors)) {
        if (key.includes(k)) return v;
    }
    return { bg: "#f1f5f9", color: "#64748b" };
}

function formatAmount(txn) {
    const abs = Math.abs(Number(txn.amount || 0));
    const formatted = "₦" + abs.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const credit = isCredit(txn);
    if (credit === null) return formatted;   // neutral — no prefix
    return credit ? "+" + formatted : "-" + formatted;
}

function otherParty(txn) {
    return isCredit(txn)
        ? (txn.senderName || txn.sender || null)
        : (txn.receiverName || txn.receiver || null);
}

function statusClass(status = "") {
    const s = (status || "").toLowerCase();
    if (s === "completed" || s === "success") return "success";
    if (s === "pending") return "pending";
    if (s === "failed") return "failed";
    return "success";
}

/* ─── Row primary label ──────────────────────────────────────────── */
// Shows "To [name]" / "From [name]" for transfers,
// or a clean short label for other types
// Try to extract a name from description like
// "Transfer of ₦8,000 to Lola (1577344874)"
// "Received ₦52,000 from Oladele Olayinka (1419536159)"
function extractNameFromDesc(desc, credit) {
    if (!desc) return null;
    // "... to Name (acct)" or "... to Name"
    const toMatch = desc.match(/\bto\s+([^(\n]+?)(?:\s*\([^)]+\))?$/i);
    // "... from Name (acct)" or "... from Name"
    const fromMatch = desc.match(/\bfrom\s+([^(\n]+?)(?:\s*\([^)]+\))?$/i);
    if (!credit && toMatch) return toMatch[1].trim();
    if (credit && fromMatch) return fromMatch[1].trim();
    return null;
}

function rowLabel(txn) {
    const type = (txn.type || "").toLowerCase();
    const credit = isCredit(txn);

    // Try API fields first, then parse from description
    const party = otherParty(txn) || extractNameFromDesc(txn.description, credit);

    if (type.includes("transfer")) {
        if (party) return credit ? `From ${party}` : `To ${party}`;
        return credit ? "Received transfer" : "Sent transfer";
    }
    if (type.includes("bill")) return txn.billProvider || txn.provider || "Bill payment";
    if (type.includes("savings interest")) return "Interest earned";
    if (type.includes("savings deposit")) return "Moved to savings";
    if (type.includes("savings withdrawal")) return "Withdrawn from savings";
    if (type.includes("deposit")) return "Account deposit";
    if (type.includes("withdrawal")) return "Cash withdrawal";
    return txn.description || txn.type || "Transaction";
}

/* Row direction icon */
function RowIcon({ credit }) {
    const isNeutral = credit === null;
    const bg    = isNeutral ? "#f5f3ff" : credit ? "#f0fdf4" : "#fef2f2";
    const color = isNeutral ? "#7c3aed" : credit ? "#16a34a" : "#ef4444";
    return (
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {isNeutral
                    ? <><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>
                    : credit
                        ? <><line x1="17" y1="7" x2="7" y2="17" /><polyline points="17 17 7 17 7 7" /></>
                        : <><line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" /></>
                }
            </svg>
        </div>
    );
}

/* ─── Transaction Detail Modal ────────────────────────────────────── */
function TxnModal({ txn, onClose }) {
    const credit = isCredit(txn);
    const sc = statusClass(txn.status);
    const party = otherParty(txn);
    const badge = getTypeBadge(txn.type);

    useEffect(() => { injectModalStyles(); }, []);

    return (
        <div className="txn-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="txn-modal">
                <div className="txn-modal-header">
                    <div className={`txn-modal-icon ${credit ? "credit" : "debit"}`}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                            stroke={credit ? "#16a34a" : "#ef4444"}
                            strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            {credit
                                ? <><line x1="17" y1="7" x2="7" y2="17" /><polyline points="17 17 7 17 7 7" /></>
                                : <><line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" /></>
                            }
                        </svg>
                    </div>

                    <span className={`txn-modal-status ${sc}`}>
                        {sc === "success" ? "✓ Completed" : sc === "pending" ? "⏳ Pending" : "✗ Failed"}
                    </span>

                    <div className={`txn-modal-amount ${credit ? "credit" : "debit"}`}>
                        {formatAmount(txn)}
                    </div>

                    <div className="txn-modal-type-label">
                        <span style={{
                            background: badge.bg, color: badge.color,
                            padding: "3px 10px", borderRadius: 20,
                            fontSize: "0.78rem", fontWeight: 700,
                        }}>
                            {txn.type}
                        </span>
                    </div>
                </div>

                <div className="txn-modal-divider" />

                <div className="txn-modal-body">
                    {/* Date */}
                    <div className="txn-modal-row">
                        <span className="txn-modal-row-label">Date & time</span>
                        <span className="txn-modal-row-value">{txn.date}</span>
                    </div>

                    {/* Transfer party */}
                    {party && (
                        <div className="txn-modal-row">
                            <span className="txn-modal-row-label">{credit ? "Received from" : "Sent to"}</span>
                            <span className="txn-modal-row-value" style={{ color: credit ? "#16a34a" : "#1b3a6b" }}>
                                {party}
                            </span>
                        </div>
                    )}

                    {/* Account numbers for transfers */}
                    {txn.senderAccount && (
                        <div className="txn-modal-row">
                            <span className="txn-modal-row-label">From account</span>
                            <span className="txn-modal-row-value" style={{ fontFamily: "monospace", fontSize: "0.82rem" }}>
                                {txn.senderAccount}
                            </span>
                        </div>
                    )}
                    {txn.receiverAccount && (
                        <div className="txn-modal-row">
                            <span className="txn-modal-row-label">To account</span>
                            <span className="txn-modal-row-value" style={{ fontFamily: "monospace", fontSize: "0.82rem" }}>
                                {txn.receiverAccount}
                            </span>
                        </div>
                    )}

                    {/* Bill info */}
                    {txn.billType && (
                        <div className="txn-modal-row">
                            <span className="txn-modal-row-label">Bill type</span>
                            <span className="txn-modal-row-value" style={{ textTransform: "capitalize" }}>{txn.billType}</span>
                        </div>
                    )}
                    {txn.billProvider && (
                        <div className="txn-modal-row">
                            <span className="txn-modal-row-label">Provider</span>
                            <span className="txn-modal-row-value">{txn.billProvider}</span>
                        </div>
                    )}
                    {txn.billReference && (
                        <div className="txn-modal-row">
                            <span className="txn-modal-row-label">Reference</span>
                            <span className="txn-modal-row-value" style={{ fontFamily: "monospace", fontSize: "0.82rem" }}>{txn.billReference}</span>
                        </div>
                    )}

                    {/* Description */}
                    {txn.description && (
                        <div className="txn-modal-row">
                            <span className="txn-modal-row-label">Description</span>
                            <span className="txn-modal-row-value">{txn.description}</span>
                        </div>
                    )}

                    {/* Note */}
                    {txn.note?.trim() && (
                        <div className="txn-modal-row">
                            <span className="txn-modal-row-label">Note</span>
                            <span className="txn-modal-row-value" style={{ color: "#64748b", fontStyle: "italic" }}>{txn.note}</span>
                        </div>
                    )}

                    {/* Status */}
                    {txn.status && (
                        <div className="txn-modal-row">
                            <span className="txn-modal-row-label">Status</span>
                            <span className="txn-modal-row-value" style={{
                                color: sc === "success" ? "#16a34a" : sc === "pending" ? "#ca8a04" : "#dc2626",
                                textTransform: "capitalize",
                            }}>
                                {txn.status}
                            </span>
                        </div>
                    )}

                    {/* Transaction ID */}
                    {txn._id && (
                        <div className="txn-modal-row">
                            <span className="txn-modal-row-label">Transaction ID</span>
                            <span className="txn-modal-row-value" style={{ fontFamily: "monospace", fontSize: "0.72rem", color: "#94a3b8", wordBreak: "break-all" }}>
                                {txn._id}
                            </span>
                        </div>
                    )}

                    <button className="txn-modal-close" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
}

/* ─── Main Component ──────────────────────────────────────────────── */
export default function Transactionstable({ transactions = [], loading = false }) {
    const [selected, setSelected] = useState(null);

    useEffect(() => { injectModalStyles(); }, []);

    return (
        <>
            {selected && <TxnModal txn={selected} onClose={() => setSelected(null)} />}

            <div className="txn-card">
                <div className="txn-card-header">
                    <h3 className="card-heading">Recent Transactions</h3>
                    <Link className="txn-view-all" to="/transactions">View All</Link>
                </div>

                <div className="txn-table-wrap">
                    {loading ? (
                        /* ── Skeleton ── */
                        <div style={{ padding: "0 8px" }}>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 12px", borderBottom: "1px solid #f1f5f9" }}>
                                    <div className="skeleton" style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0 }} />
                                    <div style={{ flex: 1 }}>
                                        <div className="skeleton" style={{ height: 13, width: "50%", marginBottom: 6 }} />
                                        <div className="skeleton" style={{ height: 11, width: "30%" }} />
                                    </div>
                                    <div className="skeleton" style={{ height: 13, width: 70 }} />
                                </div>
                            ))}
                        </div>
                    ) : transactions && transactions.length > 0 ? (
                        /* ── Rows ── */
                        <div>
                            {transactions.map((txn, i) => {
                                const credit = isCredit(txn);
                                const label = rowLabel(txn);
                                const isLast = i === transactions.length - 1;

                                return (
                                    <div
                                        key={i}
                                        onClick={() => setSelected(txn)}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 12,
                                            padding: "12px 20px",
                                            borderBottom: isLast ? "none" : "1px solid #f1f5f9",
                                            cursor: "pointer",
                                            transition: "background 0.15s",
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
                                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                                    >
                                        {/* Direction icon */}
                                        <RowIcon credit={credit} />

                                        {/* Label + badge + date */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{
                                                fontSize: "0.88rem",
                                                fontWeight: 600,
                                                color: "#1e293b",
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                            }}>
                                                {label}
                                            </div>
                                            <div style={{ marginTop: 4 }}>
                                                <span style={{ fontSize: "0.72rem", color: "#94a3b8", whiteSpace: "nowrap" }}>
                                                    {txn.date}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Amount */}
                                        <span style={{
                                            fontSize: "0.92rem",
                                            fontWeight: 700,
                                            fontFamily: "'Playfair Display', serif",
                                            color: credit === null ? "#7c3aed" : credit ? "#16a34a" : "#ef4444",
                                            whiteSpace: "nowrap",
                                            flexShrink: 0,
                                        }}>
                                            {formatAmount(txn)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* ── Empty ── */
                        <div className="txn-empty">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                            </svg>
                            No recent transactions found.
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}