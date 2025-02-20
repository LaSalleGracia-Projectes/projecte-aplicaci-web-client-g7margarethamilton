import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Hero() {
    return (
    <section className="relative py-20 overflow-hidden">
      {/* Background image */}
        <Image src="/hero-image.jpg" alt="Hero background" fill className="object-cover object-center" priority />

      {/* Overlay */}
        <div className="absolute inset-0 bg-flow-black/50" />
        <div className="container mx-auto px-4 relative z-10">
        <div className="text-center space-y-8 max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-flow-white">
            Bienvenido a tu organizador personal
            </h1>
            <p className="text-xl text-flow-light-grey">Administra tus eventos, tareas y rutinas de manera sencilla.</p>
        <div className="flex justify-center">
            <Button size="lg" className="bg-flow-blue text-flow-white hover:bg-flow-blue/90 text-lg px-8">
            Empezar
                <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
        </div>
        </div>
        </div>
    </section>
    )
}

