"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers";
import { Button } from "@/components/ui/button";
import Header from "@/components/ui/header";
import Image from "next/image";

export default function Homepage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user?.is_admin) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="relative min-h-screen flex flex-col items-center bg-background text-foreground">
      {/* Header minimalista */}
      <motion.div
        className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-white/60 border-b border-border"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Header />
      </motion.div>

      {/* Sección Hero con Ilustración alineada */}
      <section className="w-full flex flex-col md:flex-row items-center justify-center text-center md:text-left px-6 py-24 gap-10 max-w-6xl mx-auto">
        <div className="flex flex-col items-center md:items-start md:w-1/2 space-y-6">
          <motion.h1
            className="text-5xl font-bold"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            Organiza tu vida con Flow2Day
          </motion.h1>
          <motion.p
            className="text-lg max-w-md text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            Planifica tus tareas, gestiona tus proyectos y mantente productivo
            sin esfuerzo.
          </motion.p>
          <Button
            size="lg"
            onClick={() => {
              const link = document.createElement("a");
              link.href = "/downloads/flow2day-mobile.zip";
              link.download = "flow2day-mobile.zip";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Descargar App
          </Button>
        </div>
        <div className="md:w-1/2 flex justify-center">
          <Image
            src="/study.svg"
            alt="Ilustración productividad"
            width={500}
            height={500}
            priority
          />
        </div>
      </section>

      {/* Sección Características */}
      <section className="py-16 w-full max-w-4xl text-center">
        <h2 className="text-3xl font-bold mb-6">
          ¿Qué puedes hacer con Flow2Day?
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {[
            {
              title: "📅 Calendario Inteligente",
              desc: "Organiza tus eventos y compromisos de forma sencilla. Programa reuniones, recordatorios y fechas importantes sin esfuerzo.",
            },
            {
              title: "✅ Agenda de Tareas",
              desc: "Crea listas de tareas diarias y mantén el control de lo que tienes por hacer. Marca tareas completadas y sigue tu progreso.",
            },
            {
              title: "📊 Dashboard de Productividad",
              desc: "Visualiza tu rendimiento diario con estadísticas claras. Analiza cómo gestionas tu tiempo y mejora tu flujo de trabajo.",
            },
            {
              title: "👀 Seguimiento del Progreso",
              desc: "Mantén una vista general de tus avances con gráficos y métricas. Descubre patrones y optimiza tu productividad.",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="bg-card p-6 rounded-lg shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="bg-secondary py-8 text-center w-full">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Flow2Day - Hecho con ❤️ y Next.js
        </p>
      </footer>
    </div>
  );
}
