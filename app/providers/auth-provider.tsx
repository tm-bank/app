import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "~/types";

const API_URL = import.meta.env.VITE_API_URL as string;

interface AuthContextProps {
  user: User | null;
  signInWithDiscord: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, { credentials: "include" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUser({
        id: data.id,
        username: data.username,
        avatar: data.avatar,
        displayName: data.global_name || data.username,
        maps: [],
      });
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const signInWithDiscord = () => {
    window.location.href = `${API_URL}/auth/discord/login`;
  };

  const signOut = async () => {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, signInWithDiscord, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
