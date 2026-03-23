import Cookies from "universal-cookie";
import { jwtDecode } from "jwt-decode";

export function getTokenData() {
  try {
    const token = new Cookies().get("token");
    if (!token) return { roles: "" };
    return jwtDecode(token);
  } catch {
    return { roles: "" };
  }
}


