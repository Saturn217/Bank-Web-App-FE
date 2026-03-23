import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import Cookies from "universal-cookie";

const UserContext = createContext(null);

const API = "https://bank-web-app-eight.vercel.app/api/v1";

export function UserProvider({ children }) {
  const [userData, setUserData] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const token = new Cookies().get("token");
    if (!token) {
      setUserLoading(false);
      return;
    }
    try {
      // Primary source for dashboard data (balances etc)
      const dashResp = await axios.get(`${API}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let user = dashResp.data.data || {};

      // If fullName is missing in dashboard payload, try /me endpoint for profile info
      if (!user?.fullName) {
        try {
          const meResp = await axios.get(`${API}/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          user = { ...user, ...meResp.data.data };
        } catch {
          // /me not available; keep dashboard data
        }
      }

      setUserData(user);
    } catch {
      // If unauthorized, pages handle redirect themselves
    } finally {
      setUserLoading(false);
    }
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  return (
    <UserContext.Provider value={{ userData, userLoading, refreshUser: fetchUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
