import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import type { User } from "~/types";

const API_URL = import.meta.env.VITE_API_URL as string;

interface AuthContextProps {
  user: User | null;
  isLoading: boolean;
  signInWithDiscord: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isMountedRef = useRef(true);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/auth/me`, { credentials: "include" });
      if (!res.ok) throw new Error();

      const data = await res.json();

      if (isMountedRef.current) {
        setUser({
          id: data.id,
          username: data.username,
          avatar: data.avatar,
          displayName: data.global_name || data.username,
          maps: [],
        });
      }
    } catch (error) {
      if (isMountedRef.current) {
        setUser(null);
        console.error("Error fetching user:", error);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    fetchUser();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const signInWithDiscord = () => {
    window.location.href = `${API_URL}/auth/discord/login`;
  };

  const signOut = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (isMountedRef.current) {
        setUser(null);
      }
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error(`Error signing out: ${error}`);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, signInWithDiscord, signOut }}
    >
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
