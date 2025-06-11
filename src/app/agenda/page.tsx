"use client";
import { useState, useEffect } from "react";
import { format, addWeeks, subWeeks, startOfWeek, addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/app/providers";

interface Schedule {
  id: number;
  title: string;
  is_favorite: boolean;
  email: string;
  id_category: number | null;
  created_at: string;
}

interface ScheduleTask {
  id: number;
  title: string;
  content: string;
  priority: number;
  start_time: string; // "HH:mm:ss"
  end_time: string; // "HH:mm:ss"
  week_day: number; // 1 = lunes, 7 = domingo
  id_schedule: number;
  id_category: number | null;
  created_at: string;
}

const WEEK_DAYS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

export default function AgendaPage() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(
    null
  );
  const [tasks, setTasks] = useState<ScheduleTask[]>([]);
  const [currentWeek, setCurrentWeek] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [newScheduleTitle, setNewScheduleTitle] = useState("");
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    start_time: "09:00",
    end_time: "10:00",
    week_day: 1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar agendas usando la API
  useEffect(() => {
    if (!user?.email) return;
    const fetchSchedules = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/v1/schedule/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.email }),
        });
        const data = await res.json();
        setSchedules(data);
        if (data.length > 0) setSelectedScheduleId(data[0].id);
      } catch (err) {
        setError("Error al cargar las agendas");
      }
      setIsLoading(false);
    };
    fetchSchedules();
  }, [user]);

  // Cargar tareas usando la API
  useEffect(() => {
    if (!selectedScheduleId || !user?.email) return;
    const fetchTasks = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/v1/schedule-task/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.email }),
        });
        const data = await res.json();
        // Solo tareas de la agenda seleccionada
        setTasks(
          data.filter((t: ScheduleTask) => t.id_schedule === selectedScheduleId)
        );
      } catch (err) {
        setError("Error al cargar las tareas");
      }
      setIsLoading(false);
    };
    fetchTasks();
  }, [selectedScheduleId, currentWeek, user]);

  // Crear nueva agenda usando la API
  const handleCreateSchedule = async () => {
    if (!newScheduleTitle || !user?.email) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/schedule/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.email,
          title: newScheduleTitle,
          is_favorite: false,
          id_category: null,
        }),
      });
      const result = await res.json();
      if (result.schedule) {
        setSchedules((prev) => [...prev, result.schedule]);
        setSelectedScheduleId(result.schedule.id);
        setNewScheduleTitle("");
      }
    } catch (err) {
      setError("Error al crear la agenda");
    }
    setIsLoading(false);
  };

  // Crear nueva tarea usando la API
  const handleCreateTask = async () => {
    if (!newTask.title || !selectedScheduleId || !user?.email) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/schedule-task/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.email,
          title: newTask.title,
          content: JSON.stringify({ description: newTask.description }),
          priority: 1,
          start_time: newTask.start_time + ":00",
          end_time: newTask.end_time + ":00",
          week_day: newTask.week_day,
          id_schedule: selectedScheduleId,
          id_category: null,
        }),
      });
      const result = await res.json();
      if (result.task) {
        setTasks((prev) => [...prev, result.task]);
        setNewTask({
          title: "",
          description: "",
          start_time: "09:00",
          end_time: "10:00",
          week_day: 1,
        });
      }
    } catch (err) {
      setError("Error al crear la tarea");
    }
    setIsLoading(false);
  };

  // Eliminar tarea usando la API
  const handleDeleteTask = async (id: number) => {
    if (!user?.email) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/schedule-task/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.email }),
      });
      const result = await res.json();
      if (result.message === "Tasca eliminada correctament") {
        setTasks((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (err) {
      setError("Error al eliminar la tarea");
    }
    setIsLoading(false);
  };

  // Cambiar semana
  const handlePrevWeek = () => setCurrentWeek(subWeeks(currentWeek, 1));
  const handleNextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1));

  // Tareas por día de la semana
  const getTasksForDay = (weekDay: number) =>
    tasks.filter((t) => t.week_day === weekDay);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 border-b">
        <h1 className="text-2xl font-bold">Agenda Semanal</h1>
      </header>
      <main className="flex-1 flex flex-col items-center py-8 px-2">
        <div className="flex gap-2 mb-4">
          <Button onClick={handlePrevWeek}>Semana anterior</Button>
          <div className="font-semibold text-lg">
            {format(currentWeek, "d MMM yyyy")} -{" "}
            {format(addDays(currentWeek, 6), "d MMM yyyy")}
          </div>
          <Button onClick={handleNextWeek}>Semana siguiente</Button>
        </div>
        <div className="flex gap-2 mb-4">
          <select
            value={selectedScheduleId || ""}
            onChange={(e) => setSelectedScheduleId(Number(e.target.value))}
            className="p-2 border rounded"
          >
            {schedules.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Crear nueva agenda</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nueva agenda</DialogTitle>
              </DialogHeader>
              <Input
                placeholder="Título de la agenda"
                value={newScheduleTitle}
                onChange={(e) => setNewScheduleTitle(e.target.value)}
              />
              <Button
                onClick={handleCreateSchedule}
                disabled={!newScheduleTitle || isLoading}
              >
                Crear
              </Button>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Crear tarea</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nueva tarea</DialogTitle>
              </DialogHeader>
              <Input
                placeholder="Título"
                value={newTask.title}
                onChange={(e) =>
                  setNewTask((prev) => ({ ...prev, title: e.target.value }))
                }
              />
              <Textarea
                placeholder="Descripción"
                value={newTask.description}
                onChange={(e) =>
                  setNewTask((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
              <label>Día de la semana</label>
              <select
                value={newTask.week_day}
                onChange={(e) =>
                  setNewTask((prev) => ({
                    ...prev,
                    week_day: Number(e.target.value),
                  }))
                }
                className="p-2 border rounded"
              >
                {WEEK_DAYS.map((d, i) => (
                  <option key={i + 1} value={i + 1}>
                    {d}
                  </option>
                ))}
              </select>
              <label>Hora inicio</label>
              <Input
                type="time"
                value={newTask.start_time}
                onChange={(e) =>
                  setNewTask((prev) => ({
                    ...prev,
                    start_time: e.target.value,
                  }))
                }
              />
              <label>Hora fin</label>
              <Input
                type="time"
                value={newTask.end_time}
                onChange={(e) =>
                  setNewTask((prev) => ({ ...prev, end_time: e.target.value }))
                }
              />
              <Button
                onClick={handleCreateTask}
                disabled={!newTask.title || isLoading}
              >
                Crear tarea
              </Button>
            </DialogContent>
          </Dialog>
        </div>
        <div className="grid grid-cols-7 gap-4 w-full max-w-5xl">
          {WEEK_DAYS.map((day, idx) => (
            <div key={day} className="bg-gray-50 rounded p-2 min-h-[120px]">
              <div className="font-bold mb-2">{day}</div>
              {getTasksForDay(idx + 1).length === 0 && (
                <div className="text-gray-400 text-sm">Sin tareas</div>
              )}
              {getTasksForDay(idx + 1).map((task) => (
                <div
                  key={task.id}
                  className="bg-white rounded shadow p-2 mb-2 flex flex-col"
                >
                  <div className="font-semibold">{task.title}</div>
                  <div className="text-xs text-gray-500">
                    {task.start_time} - {task.end_time}
                  </div>
                  <div className="text-xs text-gray-600 mb-1">
                    {JSON.parse(task.content).description}
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    Borrar
                  </Button>
                </div>
              ))}
            </div>
          ))}
        </div>
        {error && <div className="mt-4 text-red-600">{error}</div>}
      </main>
    </div>
  );
}
