export default function Quickactions({ onNavigate }) {
  const actions = [
    {
      key: "transfer",
      label: "Transfer",
      color: "#2563eb",
      hoverColor: "#1d4ed8",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
          <polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
        </svg>
      ),
    },
    {
      key: "deposit",
      label: "Deposit",
      color: "#16a34a",
      hoverColor: "#15803d",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      ),
    },
    {
      key: "withdrawal",
      label: "Withdraw",
      color: "#d97706",
      hoverColor: "#b45309",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      ),
    },
  ];

  return (
    <div className="quick-actions-card">
      <h3 className="card-heading">Quick Actions</h3>
      <div className="quick-actions-row">
        {actions.map((a) => (
          <button
            key={a.key}
            className="quick-action-btn"
            style={{ "--color": a.color, "--hover": a.hoverColor }}
            onClick={() => onNavigate?.(a.key)}
          >
            <span className="qa-icon">{a.icon}</span>
            <span className="qa-label">{a.label}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="qa-arrow">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}