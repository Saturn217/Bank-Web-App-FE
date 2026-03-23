import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "universal-cookie";
import { useUser } from "../../context/UserContext";
import { getTokenData } from "../../auth/auth";

const API = "https://bank-web-app-eight.vercel.app/api/v1";

function getFirstName(sourceName = "") {
  if (!sourceName || typeof sourceName !== "string") return "";
  return sourceName.trim().split(" ")[0] || "";
}

export default function Topbar({ onMenuToggle, unreadCount: unreadCountProp, fullName: propFullName = "" }) {
  const { userData } = useUser();
  const navigate = useNavigate();
  const tokenData = getTokenData();
  const computedFullName =
    propFullName ||
    userData?.fullName ||
    userData?.name ||
    userData?.firstName ||
    tokenData?.fullName ||
    tokenData?.name ||
    "";

  const firstName = getFirstName(computedFullName);

  const [internalCount, setInternalCount] = useState(0);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  // Fetch unread count on mount + every 60s (used on all pages except Notifications)
  useEffect(() => {
    const token = new Cookies().get("token");
    if (!token) return;

    const fetchCount = () => {
      axios.get(`${API}/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => setInternalCount(r.data.unreadCount || 0))
        .catch(() => {});
    };

    fetchCount();
    const interval = setInterval(fetchCount, 60_000);
    return () => clearInterval(interval);
  }, []);

  // If Notifications page passes its own count, use that — otherwise use internal
  const displayCount = unreadCountProp !== undefined ? unreadCountProp : internalCount;

  const handleBellClick = () => {
    navigate("/notifications");
  };

  return (
    <header className="bos-topbar">
      <div className="topbar-left">
        <button className="topbar-hamburger" onClick={onMenuToggle} aria-label="Open menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="topbar-greeting mt-3">
          <h1 className="topbar-welcome">
            {firstName ? `Welcome Back, ${firstName}!` : "Welcome Back!"}
          </h1>
          <p className="topbar-date">{today}</p>
        </div>
      </div>

      <div className="topbar-right">
        <Link to="/notifications" className="topbar-bell" onClick={handleBellClick} aria-label="Notifications">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {displayCount > 0 && (
            <span className="bell-badge">{displayCount > 99 ? "99+" : displayCount}</span>
          )}
        </Link>
      </div>
    </header>
  );
}