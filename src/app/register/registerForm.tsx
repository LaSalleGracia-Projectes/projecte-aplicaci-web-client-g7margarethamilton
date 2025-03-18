"use client";
import axios, { AxiosError } from "axios";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function RegisterForm() {
  const [form, setForm] = useState({ email: "", password: "", nickname: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data } = await axios.post(
        "http://localhost:3000/api/v1/auth/register",
        form
      );
      setSuccess("Usuario registrado con éxito");
      console.log("Registro exitoso:", data);
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(axiosError.response?.data?.message || "Error en el registro");
    } finally {
      setLoading(false);
    }
  };

  return (
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-xl font-semibold">
            Registro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              value={form.email}
              onChange={handleChange}
              required
            />
            <Input
              type="password"
              name="password"
              placeholder="Contraseña"
              value={form.password}
              onChange={handleChange}
              required
            />
            <Input
              type="text"
              name="nickname"
              placeholder="Nombre de usuario"
              value={form.nickname}
              onChange={handleChange}
              required
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Registrarse"
              )}
            </Button>
          </form>

          {/* Mensajes de feedback con animación */}
          {success && (
            <motion.p
              className="text-green-500 flex items-center gap-2 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <CheckCircle size={18} /> {success}
            </motion.p>
          )}
          {error && (
            <motion.p
              className="text-red-500 flex items-center gap-2 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <XCircle size={18} /> {error}
            </motion.p>
          )}
        </CardContent>
      </Card>
  );
}