"use client";
import { useState, useEffect } from "react";
import {
  format,
  addWeeks,
  subWeeks,
  startOfWeek,
  addDays,
  isSameWeek,
  getDay,
  isSameDay,
  isWithinInterval,
  parseISO,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
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
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

export default function AgendaPage() {
  const { user } = useAuth();
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [tasks, setTasks] = useState<ScheduleTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Día de la semana actual (1 = lunes, 7 = domingo)
  const todayWeekDay = (() => {
    const jsDay = getDay(new Date()); // 0 (domingo) - 6 (sábado)
    return jsDay === 0 ? 7 : jsDay;
  })();

  // Estados para formularios
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    start_time: "09:00",
    end_time: "10:00",
    week_day: todayWeekDay as WeekDay,
  });

  const [newScheduleTitle, setNewScheduleTitle] = useState("");

  // Calcular días de la semana actual
  const getDatesOfWeek = () => {
    const start = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Lunes
    return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
  };

  const dates = getDatesOfWeek();

  // Cargar agendas del usuario
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
          setSelectedScheduleId(data[0].id);
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

  // Cargar tareas de la agenda seleccionada
  useEffect(() => {
    if (!selectedScheduleId || !user?.email) return;

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

  // Crear agenda por defecto
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

  // Crear nueva agenda
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

  // Validar que no haya dos tareas a la misma hora el mismo día en la semana visible
  const isSameHourTask = (
    start: string,
    week_day: WeekDay
  ) => {
    // Solo tareas de la semana visible
    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const weekEnd = addDays(weekStart, 6);

    return tasks.some((task) => {
      // Solo comparar tareas del mismo día y semana
      const taskDate = dates[Number(task.week_day) - 1];
      return (
        task.week_day === week_day &&
        isWithinInterval(taskDate, { start: weekStart, end: weekEnd }) &&
        task.start_time.slice(0, 5) === start
      );
    });
  };

  // Crear nueva tarea semanal
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

    if (isSameHourTask(newTask.start_time, newTask.week_day)) {
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

  // Eliminar tarea
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

  // Obtener tareas por día de la semana SOLO de la semana visible
  const getTasksForDay = (day: WeekDay) => {
    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const weekEnd = addDays(weekStart, 6);

    return tasks.filter((task) => {
      const taskDate = dates[Number(task.week_day) - 1];
      return (
        Number(task.week_day) === Number(day) &&
        isWithinInterval(taskDate, { start: weekStart, end: weekEnd })
      );
    });
  };

  // Navegación entre semanas
  const handlePrevWeek = () => setCurrentWeek(subWeeks(currentWeek, 1));
  const handleNextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1));

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex justify-center py-12 px-4">
        <div className="w-full max-w-4xl flex flex-col gap-8">
          {/* Mostrar errores */}
          {error && (
            <div className="bg-red-100 text-red-800 p-4 rounded-md">
              {error}
            </div>
          )}
          {isLoading && <p className="text-center">Cargando...</p>}

          {/* Selección de agenda */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Agenda Semanal</h1>

            <select
              value={selectedScheduleId || ""}
              onChange={(e) =>
                setSelectedScheduleId(Number(e.target.value))
              }
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

          {/* Navegación de semanas */}
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrevWeek} disabled={isLoading}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-lg font-medium">
              {format(dates[0], "d MMM yyyy")} -{" "}
              {format(dates[6], "d MMM yyyy")}
            </span>
            <Button variant="outline" size="icon" onClick={handleNextWeek} disabled={isLoading}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Contenido de la semana */}
          <div className="grid grid-cols-7 gap-4 w-full">
            {dates.map((date, index) => {
              const dayNumber = (index + 1) as WeekDay;
              const dayTasks = getTasksForDay(dayNumber);
              return (
                <div
                  key={date.toString()}
                  className="bg-gray-50 rounded p-2 min-h-[150px]"
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
                        className="bg-white p-2 rounded shadow-sm"
                      >
                        <h4 className="font-medium">{task.title}</h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {JSON.parse(task.content).description || "Sin descripción"}
                        </p>
                        <div className="mt-1 text-xs text-gray-500">
                          {task.start_time.slice(0, 5)} -{" "}
                          {task.end_time.slice(0, 5)}
                        </div>
                        <div className="flex justify-end mt-2 gap-1">
                          <button
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteTask(task.id)}
                            disabled={isLoading}
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Botón para añadir tarea */}
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
                  {isLoading ? "Guardando..." : "Guardar Tarea"}
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