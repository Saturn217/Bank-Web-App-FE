import { Link, Links } from "react-router-dom";

const fmt = (n) =>
  "₦" + Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Savingscard({ savingsBalance = 0, interestThisMonth = 0, loading = false }) {
  return (
    <div className="savings-card">
      <div className="savings-card-header">
        <h3 className="card-heading">My Savings &amp; Interest</h3>
        <span className="savings-badge">0.5% / mo</span>
      </div>

      <div className="savings-actions">

        <Link className="savings-btn primary text-decoration-none " to="/savings">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Deposit to Savings
        </Link>
        
        <Link className="savings-btn secondary text-decoration-none" to="/savings">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Withdraw from Savings
        </Link>
      </div>

      <div className="savings-stats">
        <div className="savings-stat-row">
          <span className="savings-stat-label">Current Savings</span>
          {loading ? (
            <div className="skeleton" style={{ height: 18, width: 100, borderRadius: 5 }} />
          ) : (
            <span className="savings-stat-val navy">{fmt(savingsBalance)}</span>
          )}
        </div>
        <div className="savings-stat-row">
          <span className="savings-stat-label">Interest This Month</span>
          {loading ? (
            <div className="skeleton" style={{ height: 18, width: 80, borderRadius: 5 }} />
          ) : (
            <span className="savings-stat-val green">
              {interestThisMonth > 0 ? "+" : ""}{fmt(interestThisMonth)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}