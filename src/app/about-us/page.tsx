"use client";

//cargar componentes de Framer motion solo en el cliente
import Header from "@/components/ui/header";
import dynamic from "next/dynamic";

const MotionH1 = dynamic(
    () => import("framer-motion").then((mod) => mod.motion.h1),
    { ssr: false }
    );

    const MotionH2 = dynamic(
    () => import("framer-motion").then((mod) => mod.motion.h2),
    { ssr: false }
);

    const MotionP = dynamic(
    () => import("framer-motion").then((mod) => mod.motion.p),
    { ssr: false }
);

export default function AboutUsPage() {
    return (
    <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 container mx-auto px-4 py-12 flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/2">
            <MotionH1
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.4 }} 
            className="text-4xl font-bold mb-6"
        >
            Flow2Day!
        </MotionH1>

        <MotionH2 initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6 }} 
            className="text-2xl font-bold mb-6"
        >
            Sobre nosotros
        </MotionH2>

        <MotionP
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-lg text-muted-foreground"
        >
            Flow2Day es una aplicación web que te ayuda a organizar tus tareas y alcanzar tus metas.
        </MotionP>
        </div>


        <div className="w-full md:w-1/2">
            <div className="bg-gray-100 rounded-lg p-8">
            <p className="text-center text-muted-foreground">
                Slider de fotos (próximamente jej, crear componente de slider)
            </p>
            </div>
        </div>
        </div>
        <footer className="bg-secondary py-8 text-center">
        <p className="text-sm text-muted-foreground">
            Hecho con ❤️ y Next.js | © {new Date().getFullYear()} Flow2Day
        </p>
        </footer>
    </div>
    );
}