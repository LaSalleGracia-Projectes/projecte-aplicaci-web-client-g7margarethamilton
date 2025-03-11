"use client";
import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import Header from "@/components/ui/header";

export default function Homepage() {
  const { scrollYProgress } = useScroll();
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -300]);
  
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const handleScroll = () => setHidden(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  return (
    <div className="relative min-h-screen overflow-hidden">
      <motion.div 
        className="fixed top-0 w-full z-50" 
        animate={{ y: hidden ? -100 : 0 }} 
        transition={{ duration: 0.5 }}
      >
        <Header />
      </motion.div>

      <main className="container mx-auto px-4">
        <section className="h-screen flex flex-col justify-center items-center text-center">
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            Tu organizador diario
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl mb-8 max-w-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            Simplifica tu día, maximiza tu productividad. Flow2Day te ayuda a organizar tus tareas y alcanzar tus metas.
          </motion.p>
          <Button size="lg">Explorar</Button>
        </section>

        <section className="py-16 relative">
          <motion.div 
            className="absolute inset-0 bg-gradient-to-b from-background to-secondary/50"
            style={{ y: parallaxY }}
          />
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Características principales</h2>
            <ul className="grid md:grid-cols-2 gap-8">
              {["Planificación diaria", "Seguimiento de objetivos", "Recordatorios inteligentes", "Análisis de productividad"].map((feature, index) => (
                <motion.li 
                  key={index}
                  className="bg-card p-6 rounded-lg shadow-md"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                >
                  <h3 className="text-xl font-semibold mb-2">{feature}</h3>
                  <p className="text-muted-foreground">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                </motion.li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className="bg-secondary py-8 text-center">
        <p className="text-sm text-muted-foreground">
          Hecho con ❤️ y Next.js | © {new Date().getFullYear()} Flow2Day
        </p>
      </footer>
    </div>
  );
}