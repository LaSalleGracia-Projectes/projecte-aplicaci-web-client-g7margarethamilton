"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers";
import Blocks from "./blocks";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
  }, [user, loading, router]);

  if (loading) return <p>Cargando...</p>;
  if (!user) return null; // Por seguridad, aunque debería redirigir

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 flex justify-end">Dashboard</h1>
      <Blocks />
    </div>
  );
}