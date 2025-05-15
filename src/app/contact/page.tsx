"use client";

import { motion } from "framer-motion";
import Header from "@/components/ui/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export default function ContactPage() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string | null }>({ type: null, message: null });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validación básica
        if (!email || !message) {
            setStatus({ type: 'error', message: 'Por favor completa todos los campos' });
            return;
        }

        setIsSubmitting(true);
        setStatus({ type: null, message: null });

        try {
            const response = await fetch("http://localhost:3000/api/v1/auth/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, message }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Error al enviar el mensaje");
            }

            setStatus({ type: 'success', message: 'Mensaje enviado con éxito. ¡Gracias por contactarnos!' });
            
            // Resetear el formulario
            setEmail("");
            setMessage("");
        } catch (error) {
            setStatus({ 
                type: 'error', 
                message: error instanceof Error ? error.message : "Hubo un problema al enviar tu mensaje" 
            });
        } finally {
            setIsSubmitting(false);
        }
    };

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
                        
                        {/* Mensajes de estado */}
                        {status.type && (
                            <div className={`mb-4 p-4 rounded-md ${
                                status.type === 'success' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                            }`}>
                                {status.message}
                            </div>
                        )}
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="email" className="block font-medium">Email</label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="tu@email.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        
                            <div className="space-y-2">
                                <label htmlFor="message" className="block font-medium">Mensaje</label>
                                <Textarea
                                    id="message"
                                    rows={5}
                                    placeholder="Describe tu consulta o sugerencia..."
                                    required
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                            </div>
                            <Button 
                                type="submit" 
                                className="w-full"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Enviando..." : "Enviar mensaje"}
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