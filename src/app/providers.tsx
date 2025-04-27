"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import axios from "axios"; // Import axios
import supabase from "@/lib/supabase";
import { useRouter } from "next/navigation";

type User = {
  email: string;
  nickname: string;
  is_admin: boolean;
  web_token?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const isUpdating = useRef(false);

  useEffect(() => {
    const checkSession = async () => {
      if (isUpdating.current) return;
      isUpdating.current = true;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data, error } = await supabase
            .from("users")
            .select("email, nickname, is_admin")
            .eq("email", session.user.email)
            .single();

          if (!error && data) {
            setUser(data);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Error checking session:", err);
        setUser(null);
      } finally {
        setLoading(false);
        isUpdating.current = false;
      }
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (isUpdating.current) return;
        isUpdating.current = true;

        console.log("Auth event:", event, "Session user:", session?.user?.email);

        try {
          if (event === "SIGNED_IN" && session?.user) {
            const { data, error } = await supabase
              .from("users")
              .select("email, nickname, is_admin")
              .eq("email", session.user.email)
              .single();

            if (!error && data) {
              setUser(data);
            } else {
              setUser(null);
            }
          } else if (event === "SIGNED_OUT") {
            setUser(null);
            router.push("/login");
          } else {
            setUser(null);
          }
        } catch (err) {
          console.error("Error handling auth state change:", err);
          setUser(null);
        } finally {
          setLoading(false);
          isUpdating.current = false;
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);
  const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL }); // Define the api instance

  const login = async (email: string, password: string) => {
    try {
      const { data } = await api.post("/login", { email, password });
      localStorage.setItem("token", data.token);
      setUser(data.user);
      router.push("/dashboard"); // 👈 Redirigir al dashboard
    } catch (error) {
      console.error("Error en login:", error);
      throw error;
    }
  };

  const logOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};