"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

type User = {
  email: string;
  nickname: string;
  avatar_url: string;
  is_admin: boolean;
  is_banned: boolean;
  created_at: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logOut: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Configuración del cliente Axios
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Cargar sesión desde localStorage si existe
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("tokenWeb");

    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error("Error parsing stored user", e);
        clearSession();
      }
    }

    setLoading(false);
  }, []);

  // Iniciar sesión
  const login = async (email: string, password: string) => {
    try {
      const response = await api.post("/web/login", {
        email,
        password,
      });
  
      const { user: userData, tokenWeb } = response.data;
  
      if (!tokenWeb) {
        throw new Error("No se recibió un token válido");
      }
  
      localStorage.setItem("tokenWeb", tokenWeb);
      localStorage.setItem("user", JSON.stringify(userData));
  
      setUser({
        ...userData,
        is_admin: !!userData.is_admin, // Garantiza que sea booleano
      });
  
      window.location.reload();
    } catch (error: any) {
      console.error("Login error:", error.response?.data || error.message);
      throw new Error("Credenciales inválidas o servidor no disponible");
    }
  };

  // Cerrar sesión
  const logOut = () => {
    localStorage.removeItem("tokenWeb");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  };

  // Función auxiliar para limpiar sesión
  const clearSession = () => {
    localStorage.removeItem("tokenWeb");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Hook personalizado
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};