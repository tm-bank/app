import { useEffect } from "react";
const API_URL = import.meta.env.VITE_API_URL as string;

export default function AuthCallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      fetch(`${API_URL}/auth/set-cookie`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token }),
      }).then(() => {
        window.location.href = "/";
      });
    }
  }, []);
  return <div>Signing you in...</div>;
}
