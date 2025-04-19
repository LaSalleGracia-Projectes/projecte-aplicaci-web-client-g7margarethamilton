"use client";

import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";

type User = {
  id: string;
  email: string;
  nickname: string;
  avatar_url: string;
  is_admin: boolean;
  is_banned: boolean;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  is_admin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 🔹 Creamos una instancia de axios que actualiza automáticamente el token
const api = axios.create({
  baseURL: "http://localhost:3000/api/v1/auth/web",
  headers: { "Content-Type": "application/json" },
});

// 🔹 Interceptor para agregar el token automáticamente en cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [is_admin, setIsAdmin] = useState(false);
  const router = useRouter();

  // ✅ 1️⃣ Cargar usuario si hay un token
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get("/profile"); // 👈 Reemplaza con tu endpoint de perfil
        setUser(data);
        setIsAdmin(data.is_admin || false); // 👈 Verifica si el usuario es admin
      } catch (error) {
        console.error("Token inválido o expirado:", error);
        logOut();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // ✅ 2️⃣ Función de login
  const login = async (email: string, password: string) => {
    try {
      const { data } = await api.post("/login", { email, password });
      localStorage.setItem("token", data.token);
      setUser(data.user);
      setIsAdmin(data.user?.is_admin || false);
      router.push(data.user?.is_admin ? "/admin" : "/dashboard") // 👈 Redirigir al dashboard
    } catch (error) {
      console.error("Error en login:", error);
      throw error;
    }
  };

  // ✅ 3️⃣ Función de logout
  const logOut = () => {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/login") // 👈 Redirigir al login
  };

  return (
    <AuthContext.Provider value={{ user, loading, is_admin, login, logOut }}>
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