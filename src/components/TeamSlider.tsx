"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface TeamMember {
    name: string;
    role: string;
    image: string;
}

interface TeamSliderProps {
    members: TeamMember[];
    autoPlay?: boolean;
    interval?: number;
}

export default function TeamSlider({
    members,
    autoPlay = true,
    interval = 3000,
}: TeamSliderProps) {
    const [currentSlide, setCurrentSlide] = useState(0);

useEffect(() => {
    if (!autoPlay) return;

    const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % members.length);
    }, interval);

    return () => clearInterval(timer);
}, [autoPlay, interval, members.length]);

return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Contenedor del slider */}
        <div className="relative overflow-hidden rounded-xl shadow-lg bg-white/10 backdrop-blur-sm">
        <div
            className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
            {members.map((member, index) => (
            <div
                key={index}
                className="flex-shrink-0 w-full flex flex-col items-center p-8"
            >
                <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-white/20 mb-6">
                <Image
                    src={member.image}
                    alt={`Foto de ${member.name}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    priority={index === 0}
                />
                </div>
                <h3 className="text-xl font-bold text-black">{member.name}</h3>
                <p className="text-black/80">{member.role}</p>
            </div>
        ))}
        </div>

        {/* Flechas de navegación */}
        <button
            onClick={() =>
            setCurrentSlide(
                (prev) => (prev - 1 + members.length) % members.length
            )
        }
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 p-2 rounded-full hover:bg-white/50 transition-colors"
            aria-label="Anterior"
        >
        ←
        </button>
        <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % members.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 p-2 rounded-full hover:bg-white/50 transition-colors"
            aria-label="Siguiente"
        >
        →
        </button>
    </div>

      {/* Indicadores */}
        <div className="flex justify-center mt-6 gap-2">
        {members.map((_, index) => (
            <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
                currentSlide === index ? "bg-black w-6" : "bg-black/30"
            }`}
            aria-label={`Ir a slide ${index + 1}`}
            />
        ))}
        </div>
    </div>
    );
}
