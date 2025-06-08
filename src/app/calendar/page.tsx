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
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import Header from "@/components/ui/header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<Array<{
    id: string;
    title: string;
    description: string;
    date: Date;
    priority: "low" | "medium" | "high";
  }>>([]);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
  });

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

  const handleCreateEvent = () => {
    if (!selectedDate || !newEvent.title) return;

    const event = {
      id: Math.random().toString(36).substring(2, 9),
      ...newEvent,
      date: selectedDate,
    };

    setEvents([...events, event]);
    setNewEvent({
      title: "",
      description: "",
      priority: "medium",
    });
  };

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => isSameDay(event.date, day));
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
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nueva tarea
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      Crear nueva tarea para {selectedDate && format(selectedDate, "PPPP")}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Input
                        placeholder="Título de la tarea"
                        value={newEvent.title}
                        onChange={(e) =>
                          setNewEvent({ ...newEvent, title: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Textarea
                        placeholder="Descripción"
                        value={newEvent.description}
                        onChange={(e) =>
                          setNewEvent({ ...newEvent, description: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Select
                        value={newEvent.priority}
                        onValueChange={(value: "low" | "medium" | "high") =>
                          setNewEvent({ ...newEvent, priority: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Prioridad" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Baja</SelectItem>
                          <SelectItem value="medium">Media</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="submit"
                      onClick={handleCreateEvent}
                      disabled={!newEvent.title}
                    >
                      Crear tarea
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
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
              const dayEvents = getEventsForDay(day);

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
                  {/* Eventos del día */}
                  <div className="mt-1 space-y-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className={cn(
                          "text-xs p-1 rounded truncate",
                          event.priority === "high"
                            ? "bg-red-100 text-red-800"
                            : event.priority === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                        )}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-muted-foreground text-center">
                        +{dayEvents.length - 2} más
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
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Eventos para {format(selectedDate, "PPPP")}
                </h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Añadir tarea
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        Crear nueva tarea para {format(selectedDate, "PPPP")}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Input
                          placeholder="Título de la tarea"
                          value={newEvent.title}
                          onChange={(e) =>
                            setNewEvent({ ...newEvent, title: e.target.value })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Textarea
                          placeholder="Descripción"
                          value={newEvent.description}
                          onChange={(e) =>
                            setNewEvent({ ...newEvent, description: e.target.value })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Select
                          value={newEvent.priority}
                          onValueChange={(value: "low" | "medium" | "high") =>
                            setNewEvent({ ...newEvent, priority: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Prioridad" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Baja</SelectItem>
                            <SelectItem value="medium">Media</SelectItem>
                            <SelectItem value="high">Alta</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        type="submit"
                        onClick={handleCreateEvent}
                        disabled={!newEvent.title}
                      >
                        Crear tarea
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="space-y-2">
                {getEventsForDay(selectedDate).length > 0 ? (
                  getEventsForDay(selectedDate).map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start p-4 border rounded-lg"
                    >
                      <div
                        className={cn(
                          "flex-shrink-0 w-2 h-full rounded",
                          event.priority === "high"
                            ? "bg-red-500"
                            : event.priority === "medium"
                            ? "bg-yellow-500"
                            : "bg-blue-500"
                        )}
                      ></div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{event.title}</h3>
                          <span className="text-sm text-muted-foreground">
                            {format(event.date, "HH:mm")}
                          </span>
                        </div>
                        {event.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {event.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No hay tareas programadas para este día
                  </p>
                )}
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