"use client";

// Cargar componentes de Framer Motion solo en el cliente
import Header from "@/components/ui/header";
import dynamic from "next/dynamic";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  siNextdotjs,
  siKotlin,
  siNodedotjs,
  siGithub,
  siFigma,
  siNotion,
  siSupabase,
  siAndroid,
  siReact,
  siTypescript,
} from "simple-icons/icons";
import technologiesData from "@/data/technologies.json";

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

interface TechnologyItem {
  name: string;
  icon: string;
  description: string;
}

interface TechnologySection {
  title: string;
  items: TechnologyItem[];
}

// interface TechnologiesData {
//   sections: TechnologySection[];
// }

const iconMap = {
  siNextdotjs,
  siKotlin,
  siNodedotjs,
  siGithub,
  siFigma,
  siNotion,
  siSupabase,
  siAndroid,
  siReact,
  siTypescript,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            Somos un grupo de estudiantes de La Salle con una idea de proyecto
            que ideamos entre todos. Somos cuatro personas: dos de ellas
            estudiantes de DAW (Desarrollo de Aplicaciones Web) y otras dos de
            DAM (Desarrollo de Aplicaciones Multiplataforma). El proyecto se
            llama Flow2Day!, como se puede observar en varias partes de la
            propia página.
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
            Flow2Day es una aplicación tanto web como mobil que te ayuda a
            organizar tus tareas y alcanzar tus metas.
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
            A continuación se muestran las tecnologías utilizadas en el
            proyecto:
          </MotionP>

          {technologiesData?.sections?.map(
            (section: TechnologySection, sectionIndex: number) => (
              <Accordion
                key={`section-${sectionIndex}`}
                type="single"
                collapsible
              >
                <AccordionItem value={`section-${sectionIndex}`}>
                  <AccordionTrigger className="text-lg font-medium">
                    {section.title}
                  </AccordionTrigger>
                  <AccordionContent>
                    {section.items.map(
                      (tech: TechnologyItem, techIndex: number) => {
                        const IconComponent = iconMap[tech.icon];
                        return (
                          <div key={`tech-${sectionIndex}-${techIndex}`}>
                            <div className="flex items-center gap-2 py-2">
                              <Icon icon={IconComponent} className="w-5 h-5" />
                              <span className="font-medium">{tech.name}</span>
                            </div>
                            <p className="text-muted-foreground mb-4 pl-7">
                              {tech.description}
                            </p>
                            {techIndex < section.items.length - 1 && (
                              <hr className="my-3 border-t border-gray-200" />
                            )}
                          </div>
                        );
                      }
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )
          )}
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
