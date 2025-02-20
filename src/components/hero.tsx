"use client"

import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function Hero() {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background image */}
      <Image src="/hero-image.jpg" alt="Hero background" fill className="object-cover object-center" priority />

      {/* Overlay */}
      <motion.div
        className="absolute inset-0 bg-flow-black/50"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center space-y-8 max-w-3xl mx-auto">
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-flow-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Bienvenido a tu organizador personal
          </motion.h1>
          <motion.p
            className="text-xl text-flow-light-grey"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Administra tus eventos, tareas y rutinas de manera sencilla.
          </motion.p>
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Button size="lg" className="bg-flow-blue text-flow-white hover:bg-flow-blue/90 text-lg px-8 group">
              Empezar
              <motion.span
                className="ml-2 inline-block"
                initial={{ x: 0 }}
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <ArrowRight className="h-5 w-5" />
              </motion.span>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

