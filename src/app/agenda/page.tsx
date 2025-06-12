"use client";
import { useState, useEffect } from "react";
import {
  format,
  startOfWeek,
  addDays,
  getDay,
} from "date-fns";
import {
  Plus,
  Trash2 as Trash,
} from "lucide-react";
import Header from "@/components/ui/header";
import { Button } from "@/components/ui/button";
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
import axios from "axios";

// Días de la semana
const WEEK_DAYS = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
  { value: 7, label: "Domingo" },
] as const;
type WeekDay = typeof WEEK_DAYS[number]["value"];

interface Schedule {
  id: number;
  title: string;
  is_favorite: boolean;
  email: string;
  id_category: number | null;
}

interface ScheduleTask {
  id: number;
  title: string;
  content: string;
  priority: number;
  start_time: string; // formato HH:mm:ss
  end_time: string;
  week_day: WeekDay;
  id_schedule: number;
  id_category: number | null;
  created_at: string;
  done?: boolean;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

export default function AgendaPage() {
  const { user } = useAuth();
  const [currentWeek, setCurrentWeek] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [tasks, setTasks] = useState<ScheduleTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [doneCount, setDoneCount] = useState(0);

  const todayWeekDay = (() => {
    const jsDay = getDay(new Date());
    return jsDay === 0 ? 7 : jsDay;
  })();

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    start_time: "09:00",
    end_time: "10:00",
    week_day: todayWeekDay as WeekDay,
  });

  const [newScheduleTitle, setNewScheduleTitle] = useState("");

  const getDatesOfWeek = () => {
    const start = startOfWeek(currentWeek, { weekStartsOn: 1 });
    return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
  };

  const dates = getDatesOfWeek();

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const startOfCurrent = startOfWeek(now, { weekStartsOn: 1 });
      if (startOfCurrent.getTime() !== currentWeek.getTime()) {
        setCurrentWeek(startOfCurrent);
      }
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [currentWeek]);

  useEffect(() => {
    setTasks([]);
    setError(null);
  }, [selectedScheduleId]);

  useEffect(() => {
    if (!user?.email) {
      setError("Por favor, inicia sesión.");
      return;
    }

    const fetchSchedules = async () => {
      setIsLoading(true);
      try {
        const response = await api.get("/schedule", {
          params: { userId: user.email },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('tokenWeb')}`,
          }
        });

        const data = response.data || [];

        if (Array.isArray(data) && data.length > 0) {
          setSchedules(data);
          if (!selectedScheduleId || !data.some(s => s.id === selectedScheduleId)) {
            setSelectedScheduleId(data[0].id);
          }
        } else if (schedules.length === 0) {
          const newSchedule = await createDefaultSchedule();
          setSchedules([newSchedule]);
          setSelectedScheduleId(newSchedule.id);
        }
      } catch (err: any) {
        setError(
          err.response?.status === 400
            ? "Solicitud inválida."
            : err.response?.status === 403
            ? "Acceso denegado."
            : err.response?.status === 404
            ? "No se encontraron agendas."
            : "Error al cargar agendas."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (!selectedScheduleId || !user?.email) return;

    setTasks([]);

    const fetchTasks = async () => {
      setIsLoading(true);
      try {
        const response = await api.get("/schedule-task", {
          params: {
            userId: user.email,
            id_schedule: selectedScheduleId,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('tokenWeb')}`,
          }
        });

        const data = response.data || [];
        setTasks(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(
          err.response?.status === 400
            ? "Solicitud inválida."
            : err.response?.status === 403
            ? "Acceso denegado."
            : err.response?.status === 404
            ? "No se encontraron tareas."
            : "Error al cargar tareas."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [selectedScheduleId, user, currentWeek]);

  useEffect(() => {
    setDoneCount(tasks.filter((t) => t.done).length);
  }, [tasks]);

  // SOLO permite marcar como hecho en la lista de tareas de hoy
  const toggleDone = (id: number) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id && Number(task.week_day) === todayWeekDay
          ? { ...task, done: !task.done }
          : task
      )
    );
  };

  const createDefaultSchedule = async (): Promise<Schedule> => {
    try {
      const response = await api.post("/schedule", {
        title: "Agenda Personal",
        is_favorite: false,
        id_category: null,
        userId: user?.email,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('tokenWeb')}`,
        }
      });

      return response.data.schedule || response.data[0];
    } catch (err: any) {
      throw new Error(
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.response?.data?.hint ||
        "No se pudo crear la agenda"
      );
    }
  };

  const handleCreateSchedule = async () => {
    if (!newScheduleTitle || !user?.email) {
      setError("Faltan datos requeridos");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post("/schedule", {
        title: newScheduleTitle,
        is_favorite: false,
        id_category: null,
        userId: user.email,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('tokenWeb')}`,
        }
      });

      const newSchedule = response.data.schedule || response.data[0];
      setSchedules([...schedules, newSchedule]);
      setSelectedScheduleId(newSchedule.id);
      setNewScheduleTitle("");
    } catch (err: any) {
      setError(
        err.response?.status === 400
          ? "Solicitud inválida."
          : err.response?.status === 403
          ? "Acceso denegado."
          : "Error al crear agenda."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isOverlapping = (
    start: string,
    end: string,
    week_day: WeekDay
  ) => {
    const startMinutes = convertTimeToMinutes(start);
    const endMinutes = convertTimeToMinutes(end);

    return tasks.some((task) => {
      if (
        task.week_day !== week_day ||
        task.id_schedule !== selectedScheduleId
      ) {
        return false;
      }
      const taskStart = convertTimeToMinutes(task.start_time.slice(0, 5));
      const taskEnd = convertTimeToMinutes(task.end_time.slice(0, 5));
      return (
        (startMinutes < taskEnd && endMinutes > taskStart)
      );
    });
  };

  const convertTimeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + (minutes || 0);
  };

  const handleCreateTask = async () => {
    if (
      !newTask.title ||
      !selectedScheduleId ||
      !user?.email ||
      !newTask.start_time ||
      !newTask.end_time
    ) {
      setError("Faltan datos requeridos.");
      return;
    }

    if (newTask.start_time >= newTask.end_time) {
      setError("La hora de inicio debe ser menor a la de fin.");
      return;
    }

    if (isOverlapping(newTask.start_time, newTask.end_time, newTask.week_day)) {
      setError("no creo que puedas hacer dos cosas a la vez a la misma hora");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const taskData = {
        title: newTask.title,
        content: JSON.stringify({
          description: newTask.description,
        }),
        priority: 1,
        start_time: `${newTask.start_time}:00`,
        end_time: `${newTask.end_time}:00`,
        week_day: newTask.week_day,
        id_schedule: selectedScheduleId,
        id_category: null,
        userId: user.email,
      };

      const response = await api.post("/schedule-task", taskData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('tokenWeb')}`,
        }
      });
      const task = response.data.task || response.data;

      setTasks([...tasks, task]);
      setNewTask({
        title: "",
        description: "",
        start_time: "09:00",
        end_time: "10:00",
        week_day: todayWeekDay,
      });
    } catch (err: any) {
      setError(
        err.response?.status === 400
          ? "Solicitud inválida."
          : err.response?.status === 403
          ? "Acceso denegado."
          : "Error al crear tarea."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTask = async (id: number) => {
    if (!selectedScheduleId || !user?.email) return;

    setIsLoading(true);
    setError(null);

    try {
      await api.delete(`/schedule-task/${id}`, {
        data: {
          userId: user.email,
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('tokenWeb')}`,
        }
      });
      setTasks(tasks.filter((task) => task.id !== id));
    } catch (err: any) {
      setError(
        err.response?.status === 400
          ? "Solicitud inválida."
          : err.response?.status === 403
          ? "Acceso denegado."
          : "Error al eliminar tarea."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getTasksForDay = (day: WeekDay) => {
    return tasks.filter(
      (task) =>
        Number(task.week_day) === Number(day) &&
        task.id_schedule === selectedScheduleId
    );
  };

  const todayTasks = getTasksForDay(todayWeekDay);

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

          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Agenda Semanal</h1>
            <select
              value={selectedScheduleId || ""}
              onChange={(e) => {
                setSelectedScheduleId(Number(e.target.value));
              }}
              disabled={isLoading || schedules.length === 0}
              className="p-2 border rounded"
            >
              {schedules.map((schedule) => (
                <option key={schedule.id} value={schedule.id}>
                  {schedule.title}
                </option>
              ))}
            </select>

            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" disabled={isLoading || !user}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Agenda
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Nueva Agenda</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Input
                    placeholder="Nombre de la agenda"
                    value={newScheduleTitle}
                    onChange={(e) => setNewScheduleTitle(e.target.value)}
                  />
                  <Button
                    onClick={handleCreateSchedule}
                    disabled={!newScheduleTitle || isLoading}
                  >
                    {isLoading ? "Creando..." : "Crear"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex items-center justify-center gap-2">
            <span className="text-lg font-medium">
              {format(dates[0], "d MMM yyyy")} -{" "}
              {format(dates[6], "d MMM yyyy")}
            </span>
          </div>

          <div className="grid grid-cols-7 gap-4 w-full">
            {dates.map((date, index) => {
              const dayNumber = (index + 1) as WeekDay;
              const dayTasks = getTasksForDay(dayNumber);
              return (
                <div
                  key={date.toString()}
                  className={`bg-gray-50 rounded p-2 min-h-[150px] ${
                    dayNumber === todayWeekDay ? "border-2 border-blue-400" : ""
                  }`}
                >
                  <div className="font-semibold mb-2">
                    {WEEK_DAYS[index].label}
                  </div>
                  {dayTasks.length === 0 && (
                    <div className="text-gray-400 text-sm mt-2">
                      Sin tareas
                    </div>
                  )}
                  <ul className="space-y-2 mt-2">
                    {dayTasks.map((task) => (
                      <li
                        key={task.id}
                        className={`bg-white p-2 rounded shadow-sm flex items-center gap-2 ${
                          task.done && dayNumber === todayWeekDay ? "opacity-60 line-through" : ""
                        }`}
                      >
                        {/* SOLO mostrar info, NO check */}
                        <div className="flex-1">
                          <h4 className="font-medium">{task.title}</h4>
                          <p className="text-xs text-muted-foreground truncate">
                            {JSON.parse(task.content).description || "Sin descripción"}
                          </p>
                          <div className="mt-1 text-xs text-gray-500">
                            {task.start_time.slice(0, 5)} -{" "}
                            {task.end_time.slice(0, 5)}
                          </div>
                        </div>
                        <button
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteTask(task.id)}
                          disabled={isLoading}
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Lista de tareas del día actual debajo del calendario */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-4">
              Tareas de hoy ({WEEK_DAYS[todayWeekDay - 1].label})
              <span className="text-base text-green-700 font-semibold">
                {doneCount} / {tasks.length} hechas
              </span>
            </h2>
            {todayTasks.length === 0 ? (
              <div className="text-gray-400 text-sm">Sin tareas para hoy</div>
            ) : (
              <ul className="space-y-2">
                {todayTasks.map((task) => (
                  <li
                    key={task.id}
                    className={`bg-white p-3 rounded shadow flex flex-col md:flex-row md:items-center md:justify-between ${
                      task.done ? "opacity-60 line-through" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {/* SOLO aquí el check */}
                      <input
                        type="checkbox"
                        checked={!!task.done}
                        onChange={() => toggleDone(task.id)}
                        className="accent-green-600"
                      />
                      <div>
                        <div className="font-medium">{task.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {JSON.parse(task.content).description || "Sin descripción"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {task.start_time.slice(0, 5)} - {task.end_time.slice(0, 5)}
                        </div>
                      </div>
                    </div>
                    <button
                      className="text-red-500 hover:text-red-700 mt-2 md:mt-0"
                      onClick={() => handleDeleteTask(task.id)}
                      disabled={isLoading}
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2 self-start">
                <Plus className="h-4 w-4" />
                Añadir tarea
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nueva Tarea Semanal</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input
                  placeholder="Título"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                />
                <Textarea
                  placeholder="Descripción"
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium">Hora Inicio</label>
                    <Input
                      type="time"
                      value={newTask.start_time}
                      onChange={(e) =>
                        setNewTask({
                          ...newTask,
                          start_time: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Hora Fin</label>
                    <Input
                      type="time"
                      value={newTask.end_time}
                      onChange={(e) =>
                        setNewTask({
                          ...newTask,
                          end_time: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium">Día</label>
                  <select
                    value={newTask.week_day}
                    onChange={(e) =>
                      setNewTask({
                        ...newTask,
                        week_day: Number(e.target.value) as WeekDay,
                      })
                    }
                    className="w-full p-2 border rounded"
                  >
                    {WEEK_DAYS.map((day) => (
                      <option key={day.value} value={day.value}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  onClick={handleCreateTask}
                  disabled={!newTask.title || isLoading}
                >
                  Guardar Tarea
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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