import { useState } from "react";
import { useNavigate } from "react-router-dom";

const fmt = (n) =>
  "₦" + Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const IconElectricity = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "#f59e0b"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5" />
    <path d="M9 18h6" /><path d="M10 22h4" />
  </svg>
);
const IconInternet = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "#38bdf8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.55a11 11 0 0 1 14.08 0" />
    <path d="M1.42 9a16 16 0 0 1 21.16 0" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <circle cx="12" cy="20" r="1" fill={active ? "#fff" : "#38bdf8"} />
  </svg>
);
const IconCableTv = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "#818cf8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="13" rx="2" ry="2" />
    <polyline points="17 2 12 7 7 2" />
  </svg>
);
const IconWater = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "#34d399"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
  </svg>
);

const bills = [
  { id: "electricity", label: "Electricity", icon: IconElectricity, gradient: "linear-gradient(135deg,#f59e0b,#ea580c)", glow: "rgba(245,158,11,0.4)", bg: "rgba(245,158,11,0.06)", border: "rgba(245,158,11,0.2)" },
  { id: "internet", label: "Internet", icon: IconInternet, gradient: "linear-gradient(135deg,#38bdf8,#3b82f6)", glow: "rgba(56,189,248,0.4)", bg: "rgba(56,189,248,0.06)", border: "rgba(56,189,248,0.2)" },
  { id: "airtime", label: "Airtime", icon: IconCableTv, gradient: "linear-gradient(135deg,#818cf8,#a855f7)", glow: "rgba(129,140,248,0.4)", bg: "rgba(129,140,248,0.06)", border: "rgba(129,140,248,0.2)" },
  { id: "water", label: "Water Bill", icon: IconWater, gradient: "linear-gradient(135deg,#34d399,#0ea5e9)", glow: "rgba(52,211,153,0.4)", bg: "rgba(52,211,153,0.06)", border: "rgba(52,211,153,0.2)" },
];

export default function Billscard({ billsThisMonth = 0 }) {
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  const handlePay = () => {
    if (selected) {
      navigate('/bills', { state: { category: selected.id } });
    } else {
      navigate('/bills');
    }
  };

  return (
    <div className="bills-card-widget">
      <div className="bills-widget-header">
        <h3 className="card-heading" style={{ color: "#f1f5f9" }}>Pay Bills</h3>
        <span className="bills-badge-count">4 SERVICES</span>
      </div>

      {billsThisMonth > 0 && (
        <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginBottom: 12 }}>
          Paid this month: <strong style={{ color: "#f87171" }}>{fmt(billsThisMonth)}</strong>
        </p>
      )}

      <div className="bills-grid">
        {bills.map((b) => {
          const Icon = b.icon;
          const isActive = selected?.id === b.id;
          return (
            <button
              key={b.id}
              className={`bill-tile${isActive ? " active" : ""}`}
              style={{
                "--grad": b.gradient,
                "--glow": b.glow,
                background: isActive ? undefined : b.bg,
                border: `1.5px solid ${isActive ? "transparent" : b.border}`,
              }}
              onClick={() => setSelected(isActive ? null : b)}
            >
              <span className="bill-tile-icon"><Icon active={isActive} /></span>
              <span className="bill-tile-label">{b.label}</span>
            </button>
          );
        })}
      </div>

      <button
        className="bills-pay-btn"
        onClick={handlePay}
      >
        {selected ? `Pay ${selected.label}` : "Pay a Bill"}
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}