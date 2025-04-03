"use client";

import { Button } from "@/components/ui/button";
import Header from "@/components/ui/header";

export default function ContactPage() {
    return (
        <div className="min-h-screen">
            <Header />
        
        <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">Contacto</h1>
        
            <form className="space-y-6">
            <div>
                <label htmlFor="name" className="block mb-2">Nombre</label>
                <input
                    type="text"
                    id="name"
                    className="w-full p-3 border rounded-lg"
                    placeholder="Tu nombre"
            />
            </div>
            
            <div>
                <label htmlFor="email" className="block mb-2">Email</label>
                <input
                type="email"
                id="email"
                className="w-full p-3 border rounded-lg"
                placeholder="tu@email.com"
            />
            </div>
            
            <div>
                <label htmlFor="message" className="block mb-2">Mensaje</label>
                <textarea
                id="message"
                rows={5}
                className="w-full p-3 border rounded-lg"
                placeholder="Tu mensaje..."
            ></textarea>
            </div>
            
            <Button type="submit" className="w-full md:w-auto">
                Enviar mensaje
            </Button>
            </form>
        </div>
        </main>
    </div>
    );
}