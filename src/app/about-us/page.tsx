"use client";

//TODO: AÑADIR SLIDER DE FOTOS Y EQUIPO
//TODO: AÑADIR LISTAS CON DESPLEGABLE EN TECNOLOGÍAS UTILIZADAS
// Cargar componentes de Framer Motion solo en el cliente
import Header from "@/components/ui/header";
import dynamic from "next/dynamic";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion"


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
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas voluptatum provident natus dolores esse velit ducimus est soluta possimus pariatur.
            </MotionP>
            <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                    <AccordionTrigger>GitHub</AccordionTrigger>
                    <AccordionContent>
                        GitHub es una erramienta to guapa maravillosa y que te revienta la cabepsa.
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger>Huevos</AccordionTrigger>
                    <AccordionContent>
                        GitHub es una erramienta to guapa maravillosa y que te revienta la cabepsa.
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

        </div>

        {/* Columna derecha: Slider de fotos y equipo */}
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