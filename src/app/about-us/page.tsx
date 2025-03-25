"use client";

// Cargar componentes de Framer Motion solo en el cliente
import Header from "@/components/ui/header";
import dynamic from "next/dynamic";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion"
import { siNextdotjs, siKotlin, siNodedotjs, siGithub, siFigma, siNotion, siSupabase, siAndroid, siReact, siTypescript } from "simple-icons/icons";


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

const Icon = ({ icon, className }: { icon: any; className?: string }) => (
    <svg
        role="img"
        viewBox="0 0 24 24"
        className={className}
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d={icon.path} />
    </svg>
);

export default function AboutUsPage() {
    return (
    <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 container mx-auto px-4 py-12 flex flex-col md:flex-row gap-8">
        {/* Columna izquierda: Contenido principal */}
        <div className="w-full md:w-1/2 space-y-8">
        <MotionH1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-4xl font-bold mb-6"
            >
                Flow2Day!
        </MotionH1>

        <MotionH2
            initial={{ opacity: 0, y: -20 }}
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
                Somos un grupo de estudiantes de La Salle con una idea de proyecto que
                ideamos entre todos. Somos cuatro personas: dos de ellas estudiantes
                de DAW (Desarrollo de Aplicaciones Web) y otras dos de DAM
                (Desarrollo de Aplicaciones Multiplataforma). El proyecto se llama
                Flow2Day!, como se puede observar en varias partes de la propia
                página.
        </MotionP>

            <hr className="my-8 border-t border-gray-200" />

        <MotionH2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-2xl font-bold mb-6"
            >
                Idea Principal 💡
        </MotionH2>
        <MotionP
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-lg text-muted-foreground"
            >
                Flow2Day es una aplicación tanto web como mobil que te ayuda a organizar tus tareas y
                alcanzar tus metas.
        </MotionP>

        <hr className="my-8 border-t border-gray-200" />

        <MotionH2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-2xl font-bold mb-6"
            >
                Tecnologias Utilizadas ⚙️
        </MotionH2>
        <MotionP
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-lg text-muted-foreground"
            >
                A continuación se muestran las tecnologías utilizadas en el proyecto:
        </MotionP>
            <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
                <AccordionTrigger>
                WEB
                </AccordionTrigger>
                <AccordionContent>
                <div className="flex items-center gap-2">
                    <Icon icon={siNextdotjs} className="w-5 h-5" />
                    Next.js
                </div>
                Next.js es un framework de React que permite la renderización del lado del servidor (SSR) y la generación de sitios estáticos (SSG).

                <hr className="my-4 border-t border-gray-200" />

                <div className="flex items-center gap-2">
                    <Icon icon={siReact} className="w-5 h-5" />
                    React.tsx
                </div>
                React es una biblioteca de JavaScript para construir interfaces de usuario interactivas y reutilizables.

                <hr className="my-4 border-t border-gray-200" />

                <div className="flex items-center gap-2">
                    <Icon icon={siTypescript} className="w-5 h-5" />
                    TypeScript
                </div>
                TypeScript es un superconjunto de JavaScript que añade tipado estático opcional y otras características avanzadas al lenguaje.
                </AccordionContent>
            </AccordionItem>
            </Accordion>

            <Accordion type="single" collapsible>
            <AccordionItem value="item-2">
                <AccordionTrigger>
                APP
                </AccordionTrigger>
                <AccordionContent>
                <div className="flex items-center gap-2">
                    <Icon icon={siKotlin} className="w-5 h-5" />
                    Kotlin
                </div>
                Kotlin es un lenguaje de programación moderno utilizado para el desarrollo de aplicaciones Android.

                <hr className="my-4 border-t border-gray-200" />

                <div className="flex items-center gap-2">
                    <Icon icon={siAndroid} className="w-5 h-5" />
                    Android
                </div>
                Android es un sistema operativo móvil desarrollado por Google utilizado en smartphones y tablets.
                </AccordionContent>

            </AccordionItem>
            </Accordion>
            <Accordion type="single" collapsible>
            <AccordionItem value="item-2">
                <AccordionTrigger>
                BACKEND
                </AccordionTrigger>
                <AccordionContent>
                <div className="flex items-center gap-2">
                    <Icon icon={siNodedotjs} className="w-5 h-5" />
                    Node.js
                </div>
                Node.js es un entorno de ejecución de JavaScript en el servidor que utilizamos para construir APIs y servicios backend.

                <hr className="my-4 border-t border-gray-200" />

                <div className="flex items-center gap-2">
                    <Icon icon={siSupabase} className="w-5 h-5" />
                    Supabase
                </div>
                Supabase es una plataforma de desarrollo de aplicaciones que proporciona una base de datos y autenticación de usuarios.
                </AccordionContent>
            </AccordionItem>
            </Accordion>

            <Accordion type="single" collapsible>
            <AccordionItem value="item-3">
                <AccordionTrigger>
                HERRAMIENTAS
                </AccordionTrigger>
                <AccordionContent>
                <div className="flex items-center gap-2">
                    <Icon icon={siGithub} className="w-5 h-5" />
                    Github
                </div>
                GitHub es nuestra plataforma de control de versiones y colaboración en código. La usamos para gestionar el repositorio del proyecto y trabajar en equipo.

                <hr className="my-4 border-t border-gray-200" />

                <div className="flex items-center gap-2">
                    <Icon icon={siFigma} className="w-5 h-5" />
                    Figma
                </div>
                Figma es la herramienta de diseño que utilizamos para crear prototipos de la interfaz de usuario y colaborar en el diseño de la aplicación.

                <hr className="my-4 border-t border-gray-200" />

                <div className="flex items-center gap-2">
                    <Icon icon={siNotion} className="w-5 h-5" />
                    Notion
                </div>
                Notion es nuestro espacio centralizado para documentación, planificación de tareas y organización del equipo.
                </AccordionContent>
            </AccordionItem>
            </Accordion>
        </div>

        {/* Columna derecha: Slider de fotos y equipo  //TODO: AÑADIR SLIDER DE FOTOS Y EQUIPO } */}
        <div className="w-full md:w-1/2 space-y-8">
            <div className="bg-gray-100 rounded-lg p-8">
            <p className="text-center text-muted-foreground">
                Slider de fotos (próximamente, crear componente de slider)
            </p>
        </div>

            <MotionH2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-2xl font-bold mb-6"
            >
            Team Flow2Day! ✨
            </MotionH2>
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