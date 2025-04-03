"use client";

import { motion } from "framer-motion";
import Header from "@/components/ui/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";


export default function ContactPage() {
    return (
    <div className="flex flex-col min-h-screen">
        <Header />
    
        <div className="flex-1 container mx-auto px-4 py-12 flex flex-col md:flex-row gap-8">
            {/* Columna izquierda: Información de contacto */}
        <div className="w-full md:w-1/2 space-y-8">
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-4xl font-bold mb-6"
        >
            Contacta con nosotros
            </motion.h1>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="space-y-6"
        >
            <div>
                <h2 className="text-2xl font-semibold mb-4">Información de contacto</h2>
                <p className="text-muted-foreground">
                    Estamos aquí para ayudarte con cualquier duda que tengas. Ponte en contacto con nuestro equipo a través de los siguientes medios:
                </p>
            </div>

            <div className="space-y-4">
                <div>
                    <h3 className="font-medium">Email</h3> <br />
                    <p className="text-muted-foreground">Cualquier correo de contacto que tengas y que uses normalmente:</p> <br />
                    <p className="text-muted-foreground">contacto@flow2day.com</p>
                </div>
                
            </div>

            <div className="pt-4">
                <h2 className="text-2xl font-semibold mb-4">Horario de atención</h2>
                <p className="text-muted-foreground">
                    Lunes a Viernes: 9:00 - 18:00<br />
                </p>
            </div>
        </motion.div>
        </div>

        {/* Columna derecha: Formulario de contacto */}
        <div className="w-full md:w-1/2">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="bg-card p-8 rounded-lg shadow-md"
        >
            <h2 className="text-2xl font-bold mb-6">Escribe tu email y envíanos un mensaje</h2>
            
            <form className="space-y-6">
                <div className="space-y-2">
                    <label htmlFor="email" className="block font-medium">Email</label>
                <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    required
                />
                </div>
            
                <div className="space-y-2">
                    <label htmlFor="message" className="block font-medium">Mensaje</label>
                    <Textarea
                    id="message"
                    rows={5}
                    placeholder="Describe tu consulta o sugerencia..."
                    required
                    />
                </div>
                <Button type="submit" className="w-full">
                    Enviar mensaje
                </Button>
                </form>
            </motion.div>
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