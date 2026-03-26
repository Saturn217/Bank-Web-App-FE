import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import Cookies from "universal-cookie";

const UserContext = createContext(null);

const API = "https://bank-web-app-eight.vercel.app/api/v1";
const NAME_KEY = "bos_display_name";

/** Read only the cached display name (plain string). */
function readCachedName() {
  try {
    return sessionStorage.getItem(NAME_KEY) || "";
  } catch {
    return "";
  }
}

/** Persist only the display name — nothing else is stored. */
function writeCachedName(fullName) {
  try {
    if (fullName) sessionStorage.setItem(NAME_KEY, fullName);
  } catch {
    // sessionStorage unavailable — no-op
  }
}

/** Call on logout to wipe the cached name. */
export function clearUserCache() {
  try { sessionStorage.removeItem(NAME_KEY); } catch { /* no-op */ }
}

export function UserProvider({ children }) {
  // Full API data (balance, account number, etc.) — starts null, populated by fetch.
  const [userData, setUserData] = useState(null);

  // Only the display name is seeded from cache so sidebar/topbar render instantly.
  const [cachedName, setCachedName] = useState(() => readCachedName());

  const [userLoading, setUserLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const token = new Cookies().get("token");
    if (!token) {
      clearUserCache();
      setUserData(null);
      setCachedName("");
      setUserLoading(false);
      return;
    }
    try {
      const dashResp = await axios.get(`${API}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let user = dashResp.data.data || {};

      // Fallback to /me if fullName missing from dashboard payload
      if (!user?.fullName) {
        try {
          const meResp = await axios.get(`${API}/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          user = { ...user, ...meResp.data.data };
        } catch {
          // /me not available — keep dashboard data
        }
      }

      // Cache ONLY the display name; nothing else is persisted.
      writeCachedName(user.fullName);
      setCachedName(user.fullName || "");
      setUserData(user);
    } catch {
      // Unauthorized — individual pages handle redirect
    } finally {
      setUserLoading(false);
    }
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  // Merge cachedName into userData so Sidebar/Topbar get the name instantly,
  // even before the full API response arrives.
  const mergedUserData = userData ?? (cachedName ? { fullName: cachedName } : null);

  return (
    <UserContext.Provider value={{ userData: mergedUserData, userLoading, refreshUser: fetchUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}

