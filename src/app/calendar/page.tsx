"use client";

import { useState } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Header from "@/components/ui/header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Encabezado de tu app */}
      <Header />

      {/* Contenido principal centrado */}
      <main className="flex-1 flex justify-center py-12 px-4">
        <div className="w-full max-w-4xl flex flex-col gap-8">
          {/* Título y controles */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h1 className="text-3xl font-bold">
              {format(currentDate, "MMMM yyyy")}
            </h1>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleToday}>
                Hoy
              </Button>
            </div>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-1">
            {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => (
              <div
                key={day}
                className="text-center font-medium text-sm text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Celdas del calendario */}
          <div className="grid grid-cols-7 gap-1">
            {daysInMonth.map((day) => {
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={day.toString()}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "h-24 p-2 border rounded-md cursor-pointer transition-colors",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent",
                    !isSameMonth(day, currentDate) &&
                      "text-muted-foreground opacity-50",
                    isToday && !isSelected && "border-primary"
                  )}
                >
                  <div className="flex justify-between">
                    <span
                      className={cn(
                        "text-sm",
                        isToday && !isSelected && "font-bold"
                      )}
                    >
                      {format(day, "d")}
                    </span>
                    {isToday && (
                      <span className="h-2 w-2 rounded-full bg-primary"></span>
                    )}
                  </div>
                  {/* Evento de ejemplo */}
                  <div className="mt-1 space-y-1">
                    {isSameDay(day, new Date()) && (
                      <div className="text-xs p-1 bg-blue-100 text-blue-800 rounded truncate">
                        Reunión
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detalle de eventos */}
          {selectedDate && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">
                Eventos para {format(selectedDate, "PPPP")}
              </h2>
              <div className="space-y-2">
                <div className="flex items-start p-4 border rounded-lg">
                  <div className="flex-shrink-0 w-2 h-full bg-blue-500 rounded"></div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Reunión de equipo</h3>
                      <span className="text-sm text-muted-foreground">
                        10:00 - 11:30
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Discusión del sprint actual
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-secondary py-8 text-center w-full">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Flow2Day - Hecho con ❤️ y Next.js
        </p>
      </footer>
    </div>
  );
}
