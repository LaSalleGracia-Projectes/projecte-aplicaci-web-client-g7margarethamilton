// src/app/calendar/page.tsx
"use client";

import { useState } from "react";
import {
  addMonths,
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
} from "date-fns";
import { motion } from "framer-motion";
import Header from "@/components/ui/header";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const renderHeader = () => (
    <div className="flex justify-between items-center mb-4">
      <button onClick={() => setCurrentDate(addMonths(currentDate, -1))} className="p-2 text-lg font-bold">
        &lt;
      </button>
      <h2 className="text-xl font-semibold">{format(currentDate, "MMMM yyyy")}</h2>
      <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 text-lg font-bold">
        &gt;
      </button>
    </div>
  );

  const renderDays = () => {
    const days = [];
    const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // lunes
    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-sm font-medium text-center text-gray-600">
          {format(addDays(start, i), "EE")}
        </div>
      );
    }
    return <div className="grid grid-cols-7">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isSelected = selectedDate && isSameDay(day, selectedDate);

        days.push(
          <div
            key={day.toString()}
            className={`text-sm text-center p-2 border rounded cursor-pointer ${
              isCurrentMonth ? "text-black" : "text-gray-400"
            } ${isSelected ? "bg-blue-500 text-white" : "hover:bg-blue-100"}`}
            onClick={() => setSelectedDate(day)}
          >
            {format(day, "d")}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-1">
          {days}
        </div>
      );
      days = [];
    }

    return <div className="mt-2">{rows}</div>;
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center bg-background text-foreground">
      {/* Header fijo como en home */}
      <motion.div
        className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-white/60 border-b border-border"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Header />
      </motion.div>

      {/* Contenido principal con padding superior para dejar espacio al header */}
      <main className="w-full max-w-md mt-32 p-4 border rounded shadow bg-white">
        {renderHeader()}
        {renderDays()}
        {renderCells()}
      </main>

      <footer className="bg-secondary py-8 text-center w-full mt-16">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Flow2Day - Hecho con ❤️ y Next.js
        </p>
      </footer>
    </div>
  );
}
