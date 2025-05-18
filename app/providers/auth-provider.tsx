import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const API_URL = import.meta.env.VITE_API_URL as string;

interface User {
  discordId: string;
  username: string;
  avatar: string;
  email: string;
  displayName: string;
}

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
      const res = await fetch(`${API_URL}/me`, {
        credentials: "include",
        headers: {
          "x-auth-key": import.meta.env.VITE_AUTH_KEY || "",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const signInWithDiscord = () => {
    window.location.href = `${API_URL}/auth/callback`;
  };

  const signOut = () => {
    //!TODO: Call logout endpoint
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