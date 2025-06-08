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
import { ChevronLeft, ChevronRight, Plus, Edit, Trash } from "lucide-react";
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

// Definición de colores disponibles
const COLOR_OPTIONS = [
  { value: "blue", label: "Azul", bg: "bg-blue-500", bgLight: "bg-blue-100", text: "text-blue-800" },
  { value: "red", label: "Rojo", bg: "bg-red-500", bgLight: "bg-red-100", text: "text-red-800" },
  { value: "green", label: "Verde", bg: "bg-green-500", bgLight: "bg-green-100", text: "text-green-800" },
  { value: "yellow", label: "Amarillo", bg: "bg-yellow-500", bgLight: "bg-yellow-100", text: "text-yellow-800" },
  { value: "purple", label: "Morado", bg: "bg-purple-500", bgLight: "bg-purple-100", text: "text-purple-800" },
  { value: "pink", label: "Rosa", bg: "bg-pink-500", bgLight: "bg-pink-100", text: "text-pink-800" },
  { value: "indigo", label: "Indigo", bg: "bg-indigo-500", bgLight: "bg-indigo-100", text: "text-indigo-800" },
];

type ColorOption = typeof COLOR_OPTIONS[number];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<
    Array<{
      id: string;
      title: string;
      description: string;
      date: Date;
      color: string;
    }>
  >([]);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    color: "blue",
  });
  const [editingEvent, setEditingEvent] = useState<
    | {
        id: string;
        title: string;
        description: string;
        color: string;
      }
    | undefined
  >(undefined);

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
    setNewEvent({ title: "", description: "", color: "blue" });
  };

  const handleUpdateEvent = () => {
    if (!editingEvent || !selectedDate) return;

    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === editingEvent.id
          ? {
              ...event,
              title: editingEvent.title,
              description: editingEvent.description,
              color: editingEvent.color,
              date: selectedDate,
            }
          : event
      )
    );
    setEditingEvent(undefined);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter((event) => event.id !== id));
  };

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => isSameDay(event.date, day));
  };

  const getColorClass = (colorValue: string): ColorOption => {
    return COLOR_OPTIONS.find((c) => c.value === colorValue) || COLOR_OPTIONS[0];
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex justify-center py-12 px-4">
        <div className="w-full max-w-4xl flex flex-col gap-8">
          {/* Header centrado */}
          <div className="flex flex-col items-center gap-4">
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
                <DialogContent className="max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      Crear nueva tarea para{" "}
                      {selectedDate && format(selectedDate, "PPPP")}
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
                      <label className="text-sm font-medium">Color</label>
                      <div className="flex flex-wrap gap-2">
                        {COLOR_OPTIONS.map((color) => (
                          <button
                            key={color.value}
                            type="button"
                            className={cn(
                              "w-6 h-6 rounded-full border",
                              newEvent.color === color.value
                                ? "ring-2 ring-offset-2 ring-primary"
                                : "border-gray-300",
                              color.bg
                            )}
                            onClick={() => {
                              setNewEvent((prev) => ({ ...prev, color: color.value }));
                              console.log("Color seleccionado (crear):", color.value);
                            }}
                            title={color.label}
                          />
                        ))}
                      </div>
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

          {/* Días del mes */}
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
                  <div className="mt-1 space-y-1">
                    {dayEvents.slice(0, 2).map((event) => {
                      const color = getColorClass(event.color);
                      return (
                        <div
                          key={event.id}
                          className={cn(
                            "text-xs p-1 rounded truncate",
                            color.bgLight,
                            color.text
                          )}
                        >
                          {event.title}
                        </div>
                      );
                    })}
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

          {/* Lista de eventos del día seleccionado */}
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
                  <DialogContent className="max-h-[80vh] overflow-y-auto">
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
                        <label className="text-sm font-medium">Color</label>
                        <div className="flex flex-wrap gap-2">
                          {COLOR_OPTIONS.map((color) => (
                            <button
                              key={color.value}
                              type="button"
                              className={cn(
                                "w-6 h-6 rounded-full border",
                                newEvent.color === color.value
                                  ? "ring-2 ring-offset-2 ring-primary"
                                  : "border-gray-300",
                                color.bg
                              )}
                              onClick={() => {
                                setNewEvent((prev) => ({ ...prev, color: color.value }));
                                console.log("Color seleccionado (crear):", color.value);
                              }}
                              title={color.label}
                            />
                          ))}
                        </div>
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
                  getEventsForDay(selectedDate).map((event) => {
                    const color = getColorClass(event.color);
                    return (
                      <div
                        key={event.id}
                        className="flex items-start p-4 border rounded-lg"
                      >
                        <div className={`flex-shrink-0 w-2 h-full rounded ${color.bg}`}></div>
                        <div className="ml-4 flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">{event.title}</h3>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                {color.label}
                              </span>
                              <Dialog
                                open={editingEvent?.id === event.id}
                                onOpenChange={(open) => {
                                  if (!open) setEditingEvent(undefined);
                                }}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      setEditingEvent({
                                        id: event.id,
                                        title: event.title,
                                        description: event.description,
                                        color: event.color,
                                      })
                                    }
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>
                                      Editar tarea para{" "}
                                      {format(selectedDate, "PPPP")}
                                    </DialogTitle>
                                  </DialogHeader>
                                  <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                      <Input
                                        placeholder="Título de la tarea"
                                        value={editingEvent?.title || ""}
                                        onChange={(e) =>
                                          setEditingEvent({
                                            ...editingEvent!,
                                            title: e.target.value,
                                          })
                                        }
                                      />
                                    </div>
                                    <div className="grid gap-2">
                                      <Textarea
                                        placeholder="Descripción"
                                        value={editingEvent?.description || ""}
                                        onChange={(e) =>
                                          setEditingEvent({
                                            ...editingEvent!,
                                            description: e.target.value,
                                          })
                                        }
                                      />
                                    </div>
                                    <div className="grid gap-2">
                                      <label className="text-sm font-medium">Color</label>
                                      <div className="flex flex-wrap gap-2">
                                        {COLOR_OPTIONS.map((color) => (
                                          <button
                                            key={color.value}
                                            type="button"
                                            className={cn(
                                              "w-6 h-6 rounded-full border",
                                              editingEvent?.color === color.value
                                                ? "ring-2 ring-offset-2 ring-primary"
                                                : "border-gray-300",
                                              color.bg
                                            )}
                                            onClick={() => {
                                              setEditingEvent((prev) => ({
                                                ...prev!,
                                                color: color.value,
                                              }));
                                              console.log("Color seleccionado (editar):", color.value);
                                            }}
                                            title={color.label}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                    <Button
                                      type="submit"
                                      onClick={handleUpdateEvent}
                                      disabled={!editingEvent?.title}
                                    >
                                      Guardar cambios
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteEvent(event.id)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          {event.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {event.description}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
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