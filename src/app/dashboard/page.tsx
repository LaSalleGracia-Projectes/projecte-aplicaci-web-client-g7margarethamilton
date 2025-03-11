"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers";
// import Blocks from "./blocks";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Una vez que no se esté cargando y no haya usuario, redirige
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) return <p>Cargando...</p>;
  if (!user) return null; // Por seguridad, aunque debería redirigir

  return (
    <div>
    </div>
  );
}