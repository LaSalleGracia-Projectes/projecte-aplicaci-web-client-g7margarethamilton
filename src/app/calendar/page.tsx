"use client";
import { useState, useEffect } from "react";
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
import { useAuth } from "@/app/providers";
import supabase from "@/lib/supabase";

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start_time: Date;
  end_time: Date;
  color: string;
  calendarId: string;
}

interface Calendar {
  id: string;
  title: string;
  is_favorite: boolean;
  id_category?: string | null;
}

const COLOR_OPTIONS = [
  { value: "blue", label: "Azul", bg: "bg-blue-100", bgLight: "bg-blue-100", text: "text-blue-800", categoryId: "1" },
  { value: "red", label: "Rojo", bg: "bg-red-200", bgLight: "bg-red-100", text: "text-red-600", categoryId: "2" },
  { value: "green", label: "Verde", bg: "bg-green-200", bgLight: "bg-green-100", text: "text-green-600", categoryId: "3" },
  { value: "yellow", label: "Amarillo", bg: "bg-yellow-200", bgLight: "bg-yellow-100", text: "text-yellow-600", categoryId: "4" },
  { value: "purple", label: "Morado", bg: "bg-purple-200", bgLight: "bg-purple-100", text: "text-purple-600", categoryId: "5" },
  { value: "pink", label: "Rosa", bg: "bg-pink-200", bgLight: "bg-pink-100", text: "text-pink-600", categoryId: "6" },
  { value: "indigo", label: "Indigo", bg: "bg-indigo-200", bgLight: "bg-indigo-100", text: "text-indigo-600", categoryId: "7" },
] as const;

type ColorOption = typeof COLOR_OPTIONS[number];

export default function CalendarPage() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    start_time: new Date().toISOString().slice(0, 16),
    end_time: new Date().toISOString().slice(0, 16),
    color: "blue" as ColorOption['value'],
  });
  const [newCalendarTitle, setNewCalendarTitle] = useState("");
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inicializa el formulario de nueva tarea con la fecha seleccionada
  const openNewTaskDialog = () => {
    const baseDate = selectedDate || new Date();
    const iso = baseDate.toISOString().slice(0, 16);
    setNewEvent({
      title: "",
      description: "",
      start_time: iso,
      end_time: iso,
      color: "blue",
    });
  };

  useEffect(() => {
    if (!user?.email) {
      setError("Debes iniciar sesión para ver tus calendarios");
      return;
    }

    const loadCalendars = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("calendar")
          .select("id,title,is_favorite,id_category")
          .eq("email", user.email);
        if (error) throw error;
        setCalendars(data || []);
        if (data?.length > 0) {
          setSelectedCalendarId(data[0].id);
        }
      } catch (err: any) {
        setError(err.message || "Error al cargar los calendarios");
      } finally {
        setIsLoading(false);
      }
    };

    loadCalendars();
  }, [user]);

  useEffect(() => {
    if (!selectedCalendarId) return;

    const loadEvents = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("calendar_task")
          .select("id,title,content,start_time,end_time,id_calendar")
          .eq("id_calendar", selectedCalendarId)
          .order("start_time", { ascending: true });
        if (error) throw error;
        const formattedEvents = data.map(task => {
          try {
            const content = JSON.parse(task.content);
            return {
              id: task.id.toString(),
              title: task.title,
              description: content.description || "",
              start_time: new Date(task.start_time),
              end_time: new Date(task.end_time),
              color: content.color || "blue",
              calendarId: task.id_calendar.toString(),
            };
          } catch {
            return {
              id: task.id.toString(),
              title: task.title,
              description: task.content || "",
              start_time: new Date(task.start_time),
              end_time: new Date(task.end_time),
              color: "blue",
              calendarId: task.id_calendar.toString(),
            };
          }
        });
        setEvents(formattedEvents);
      } catch (err: any) {
        setError(err.message || "Error al cargar los eventos");
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, [selectedCalendarId]);

  const createCalendar = async () => {
    if (!newCalendarTitle || !user?.email) {
      setError("Falta el título del calendario o el email del usuario");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("calendar")
        .insert([{ title: newCalendarTitle, is_favorite: false, email: user.email }])
        .select("id,title,is_favorite,id_category");
      if (error) throw error;
      const newCalendar = data[0];
      setCalendars(prev => [...prev, newCalendar]);
      setSelectedCalendarId(newCalendar.id);
      setNewCalendarTitle("");
    } catch (err: any) {
      setError(err.message || "No se pudo crear el calendario");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    if (!newEvent.title || !selectedCalendarId || !newEvent.start_time || !newEvent.end_time) {
      setError("Faltan datos requeridos (título, fechas o calendario)");
      return;
    }
    if (new Date(newEvent.end_time) < new Date(newEvent.start_time)) {
      setError("La fecha de fin debe ser posterior a la de inicio");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("calendar_task")
        .insert([{
          title: newEvent.title,
          content: JSON.stringify({
            description: newEvent.description,
            color: newEvent.color,
          }),
          start_time: newEvent.start_time + ":00.000Z",
          end_time: newEvent.end_time + ":00.000Z",
          id_calendar: selectedCalendarId,
          id_category: null,
          is_completed: false,
          priority: 1,
        }])
        .select("id,title,content,start_time,end_time,id_calendar");
      if (error) throw error;
      const newTask = data[0];
      setEvents(prev => [...prev, {
        id: newTask.id.toString(),
        title: newTask.title,
        description: JSON.parse(newTask.content).description || "",
        start_time: new Date(newTask.start_time),
        end_time: new Date(newTask.end_time),
        color: JSON.parse(newTask.content).color || "blue",
        calendarId: newTask.id_calendar.toString(),
      }]);
      setNewEvent({
        title: "",
        description: "",
        start_time: new Date().toISOString().slice(0, 16),
        end_time: new Date().toISOString().slice(0, 16),
        color: "blue",
      });
    } catch (err: any) {
      setError(err.message || "Error al crear el evento");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEvent = async () => {
    if (!editingEvent || !selectedCalendarId || !editingEvent.start_time || !editingEvent.end_time) {
      setError("Faltan datos requeridos (título, fechas o calendario)");
      return;
    }
    if (new Date(editingEvent.end_time) < new Date(editingEvent.start_time)) {
      setError("La fecha de fin debe ser posterior a la de inicio");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("calendar_task")
        .update({
          title: editingEvent.title,
          content: JSON.stringify({
            description: editingEvent.description,
            color: editingEvent.color,
          }),
          start_time: new Date(editingEvent.start_time).toISOString(),
          end_time: new Date(editingEvent.end_time).toISOString(),
          id_category: null,
        })
        .eq("id", editingEvent.id)
        .eq("id_calendar", selectedCalendarId)
        .select("id,title,content,start_time,end_time,id_calendar");
      if (error) throw error;
      const updatedTask = data[0];
      setEvents(prev => prev.map(ev =>
        ev.id === editingEvent.id ? {
          ...ev,
          title: updatedTask.title,
          description: JSON.parse(updatedTask.content).description || "",
          start_time: new Date(updatedTask.start_time),
          end_time: new Date(updatedTask.end_time),
          color: JSON.parse(updatedTask.content).color || "blue",
        } : ev
      ));
      setEditingEvent(null);
    } catch (err: any) {
      setError(err.message || "Error al actualizar el evento");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from("calendar_task")
        .delete()
        .eq("id", id)
        .eq("id_calendar", selectedCalendarId);
      if (error) throw error;
      setEvents(prev => prev.filter(ev => ev.id !== id));
    } catch (err: any) {
      setError(err.message || "Error al eliminar el evento");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(event.start_time, day));
  };

  const getColorClass = (colorValue: string): ColorOption => {
    return COLOR_OPTIONS.find(c => c.value === colorValue) || COLOR_OPTIONS[0];
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  if (!isLoading && calendars.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex justify-center items-center py-12 px-4">
          <div className="w-full max-w-md text-center space-y-6">
            <h1 className="text-2xl font-bold">No tienes calendarios</h1>
            <p className="text-muted-foreground">Crea tu primer calendario para empezar a organizar tus tareas.</p>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2">
                  <Plus className="h-5 w-5" />
                  Crear nuevo calendario
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Crear nuevo calendario</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Input
                    placeholder="Nombre del calendario"
                    value={newCalendarTitle}
                    onChange={(e) => setNewCalendarTitle(e.target.value)}
                  />
                  <Button
                    onClick={createCalendar}
                    disabled={!newCalendarTitle || isLoading}
                  >
                    {isLoading ? "Creando..." : "Crear calendario"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            {error && (
              <div className="bg-red-100 text-red-800 p-4 rounded-md">
                {error}
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex justify-center py-12 px-4">
        <div className="w-full max-w-4xl flex flex-col gap-8">
          {error && (
            <div className="bg-red-100 text-red-800 p-4 rounded-md">
              {error}
            </div>
          )}
          <div className="flex flex-col items-center gap-4">
            <h1 className="text-3xl font-bold">
              {format(currentDate, "MMMM yyyy")}
            </h1>
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="icon" onClick={handlePrevMonth} disabled={isLoading}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleNextMonth} disabled={isLoading}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleToday} disabled={isLoading}>
                Hoy
              </Button>
              <select
                value={selectedCalendarId || ""}
                onChange={(e) => setSelectedCalendarId(e.target.value)}
                className="p-2 border rounded text-sm"
                disabled={isLoading}
              >
                {calendars.map(calendar => (
                  <option key={calendar.id} value={calendar.id}>
                    {calendar.title}
                  </option>
                ))}
              </select>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2" disabled={isLoading}>
                    <Plus className="h-4 w-4" />
                    Nuevo calendario
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Crear nuevo calendario</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <Input
                      placeholder="Nombre del calendario"
                      value={newCalendarTitle}
                      onChange={(e) => setNewCalendarTitle(e.target.value)}
                    />
                    <Button
                      onClick={createCalendar}
                      disabled={!newCalendarTitle || isLoading}
                    >
                      {isLoading ? "Creando..." : "Crear calendario"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              {selectedCalendarId && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      className="gap-2"
                      disabled={isLoading}
                      onClick={openNewTaskDialog}
                    >
                      <Plus className="h-4 w-4" />
                      Nueva tarea
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Crear nueva tarea</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <Input
                        placeholder="Título de la tarea"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                      />
                      <Textarea
                        placeholder="Descripción"
                        value={newEvent.description}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                      />
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Fecha y hora de inicio</label>
                        <Input
                          type="datetime-local"
                          value={newEvent.start_time}
                          onChange={(e) => setNewEvent(prev => ({ ...prev, start_time: e.target.value }))}
                        />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Fecha y hora de fin</label>
                        <Input
                          type="datetime-local"
                          value={newEvent.end_time}
                          onChange={(e) => setNewEvent(prev => ({ ...prev, end_time: e.target.value }))}
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
                              onClick={() => setNewEvent(prev => ({ ...prev, color: color.value }))}
                              title={color.label}
                            />
                          ))}
                        </div>
                      </div>
                      <Button
                        onClick={handleCreateEvent}
                        disabled={!newEvent.title || !newEvent.start_time || !newEvent.end_time || isLoading}
                      >
                        {isLoading ? "Creando..." : "Crear tarea"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => (
              <div key={day} className="text-center font-medium text-sm text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {daysInMonth.map((day) => {
              const isSelected = isSameDay(day, selectedDate);
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
                    !isSameMonth(day, currentDate) && "text-muted-foreground opacity-50",
                    isToday && !isSelected && "border-primary"
                  )}
                >
                  <div className="flex justify-between">
                    <span className={cn("text-sm", isToday && !isSelected && "font-bold")}>
                      {format(day, "d")}
                    </span>
                    {isToday && <span className="h-2 w-2 rounded-full bg-primary"></span>}
                  </div>
                  <div className="mt-1 space-y-1">
                    {dayEvents.slice(0, 2).map((event) => {
                      const color = getColorClass(event.color);
                      return (
                        <div
                          key={event.id}
                          className={cn("text-xs p-1 rounded truncate", color.bgLight, color.text)}
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
          {selectedDate && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Eventos para {format(selectedDate, "PPPP")}
                </h2>
                {selectedCalendarId && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        disabled={isLoading}
                        onClick={openNewTaskDialog}
                      >
                        <Plus className="h-4 w-4" />
                        Añadir tarea
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Crear nueva tarea</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <Input
                          placeholder="Título de la tarea"
                          value={newEvent.title}
                          onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                        />
                        <Textarea
                          placeholder="Descripción"
                          value={newEvent.description}
                          onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                        />
                        <div className="grid gap-2">
                          <label className="text-sm font-medium">Fecha y hora de inicio</label>
                          <Input
                            type="datetime-local"
                            value={newEvent.start_time}
                            onChange={(e) => setNewEvent(prev => ({ ...prev, start_time: e.target.value }))}
                          />
                        </div>
                        <div className="grid gap-2">
                          <label className="text-sm font-medium">Fecha y hora de fin</label>
                          <Input
                            type="datetime-local"
                            value={newEvent.end_time}
                            onChange={(e) => setNewEvent(prev => ({ ...prev, end_time: e.target.value }))}
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
                                onClick={() => setNewEvent(prev => ({ ...prev, color: color.value }))}
                                title={color.label}
                              />
                            ))}
                          </div>
                        </div>
                        <Button
                          onClick={handleCreateEvent}
                          disabled={!newEvent.title || !newEvent.start_time || !newEvent.end_time || isLoading}
                        >
                          {isLoading ? "Creando..." : "Crear tarea"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              <div className="space-y-2">
                {getEventsForDay(selectedDate).length > 0 ? (
                  getEventsForDay(selectedDate).map((event) => {
                    const color = getColorClass(event.color);
                    return (
                      <div key={event.id} className="flex items-start p-4 border rounded-lg">
                        <div className={`flex-shrink-0 w-2 h-full rounded ${color.bg}`}></div>
                        <div className="ml-4 flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">{event.title}</h3>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">{color.label}</span>
                              <Dialog
                                open={editingEvent?.id === event.id}
                                onOpenChange={(open) => !open && setEditingEvent(null)}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setEditingEvent({
                                      ...event,
                                      start_time: event.start_time.toISOString().slice(0, 16),
                                      end_time: event.end_time.toISOString().slice(0, 16),
                                    })}
                                    disabled={isLoading}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>Editar tarea</DialogTitle>
                                  </DialogHeader>
                                  <div className="grid gap-4 py-4">
                                    <Input
                                      placeholder="Título"
                                      value={editingEvent?.title || ""}
                                      onChange={(e) => editingEvent && setEditingEvent({ ...editingEvent, title: e.target.value })}
                                    />
                                    <Textarea
                                      placeholder="Descripción"
                                      value={editingEvent?.description || ""}
                                      onChange={(e) => editingEvent && setEditingEvent({ ...editingEvent, description: e.target.value })}
                                    />
                                    <div className="grid gap-2">
                                      <label className="text-sm font-medium">Fecha y hora de inicio</label>
                                      <Input
                                        type="datetime-local"
                                        value={editingEvent?.start_time || ""}
                                        onChange={(e) => editingEvent && setEditingEvent({ ...editingEvent, start_time: e.target.value })}
                                      />
                                    </div>
                                    <div className="grid gap-2">
                                      <label className="text-sm font-medium">Fecha y hora de fin</label>
                                      <Input
                                        type="datetime-local"
                                        value={editingEvent?.end_time || ""}
                                        onChange={(e) => editingEvent && setEditingEvent({ ...editingEvent, end_time: e.target.value })}
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
                                            onClick={() => editingEvent && setEditingEvent({ ...editingEvent, color: color.value })}
                                            title={color.label}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                    <Button
                                      onClick={handleUpdateEvent}
                                      disabled={!editingEvent?.title || !editingEvent?.start_time || !editingEvent?.end_time || isLoading}
                                    >
                                      {isLoading ? "Guardando..." : "Guardar cambios"}
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteEvent(event.id)}
                                disabled={isLoading}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {format(event.start_time, "PPPP p")} - {format(event.end_time, "PPPP p")}
                          </p>
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