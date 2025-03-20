"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";

const LoginPage = () => {
  const { login } = useAuth(); // ✅ Usamos `useAuth()` en lugar de axios
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(email, password); // ✅ Llamamos a `login()`
      router.push("/dashboard"); // Redirigir al dashboard
    } catch (error) {
      console.error("Error en inicio de sesión:", error);
      setError("Error en el inicio de sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm shadow-lg p-4 mx-auto mt-8 bg-white rounded-lg border border-gray-200 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Iniciar Sesión</h1>
      <form onSubmit={handleLogin} className="flex flex-col gap-3">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Separator />
        <Input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Iniciando..." : "Iniciar Sesión"}
        </Button>
      </form>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </Card>
  );
};

export default LoginPage;