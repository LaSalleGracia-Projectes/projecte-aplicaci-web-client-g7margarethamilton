"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import supabase from "@/lib/supabase";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  logOut: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Recupera el usuario actual al cargar la app
    const getUser = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) console.error("Error obteniendo sesión:", error);
      
      setUser(data?.session?.user ?? null);
      setLoading(false);
    };

    getUser();

    // Escucha cambios en la autenticación
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);
  
  const logOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/"
  };
  
  return (
    <AuthContext.Provider value={{ user, loading, setUser, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};