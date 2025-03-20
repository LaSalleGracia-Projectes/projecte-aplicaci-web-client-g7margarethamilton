"use client";

import { motion } from "framer-motion";
//import { Button } from "@/components/ui/button";
import Header from "@/components/ui/header";


export default function AboutUsPage() {
    return (
    <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 container mx-auto px-4 py-12 flex gap-8">
        <div className="w-1/2">
        <motion.h1 initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold text-center mt-8">
            Sobre Nosotros</motion.h1>
        
        <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-lg text-muted-foreground"
        > Flow2Day es una aplicación web que te ayuda a organizar tus tareas y alcanzar tus metas.
        </motion.p>
        </div>
    

        <div className="w-1/2"> {/*slider columna derecha*/}
            <div className="bg-gray-100 rounded-lg p-8">
                <p className="text-center text-muted-foreground"> Slider de fotos (proximamente jej, crear componente y aplicarlo)</p>
                </div>
        
        </div>
        </div>
        </div>
    );
}