"use client";
import React, { useState, useEffect, useContext } from "react";
import type { Session, User, AuthChangeEvent } from "@supabase/supabase-js";
import { supabase } from "~/supabase";

interface AuthContext {
  user: User | null;
  session: Session | null;
  signInWithEmail: (email: string) => Promise<void>;
  signOut: () => void;
}

const Context = React.createContext<AuthContext | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, s) => {
        setSession(s);
        setUser(s?.user ?? null);
      }
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  const signInWithEmail = async (email: string) => {
    if (!supabase) return;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + "/" },
    });
    if (error) throw error;
  };

  if (!supabase) return;
  const signOut = () => {
    if (!supabase) return;
    supabase.auth.signOut();
  };

  return (
    <Context.Provider value={{ user, session, signInWithEmail, signOut }}>
      {children}
    </Context.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
