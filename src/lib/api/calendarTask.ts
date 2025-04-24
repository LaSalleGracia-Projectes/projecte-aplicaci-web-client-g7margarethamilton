import { api } from "@/app/providers";

type CalendarTask = {
  id?: string;
  title: string;
  content?: string;
  is_completed?: boolean;
  priority?: "low" | "medium" | "high";
  start_time: string; // formato ISO (ej. 2025-04-10T14:00:00Z)
  end_time: string;
  id_calendar: string;
  id_category?: string;
};

// ✅ Obtener todas las tareas del calendario
export const fetchCalendarTasks = async (): Promise<CalendarTask[]> => {
  const { data } = await api.get("/calendar-task");
  return data;
};

// ✅ Crear una nueva tarea
export const createCalendarTask = async (task: CalendarTask): Promise<CalendarTask> => {
  const { data } = await api.post("/calendar-task", task);
  return data;
};

// ✅ Obtener una tarea por ID
export const getCalendarTask = async (id: string): Promise<CalendarTask> => {
  const { data } = await api.get(`/calendar-task/${id}`);
  return data;
};

// ✅ Actualizar una tarea existente
export const updateCalendarTask = async (id: string, updates: Partial<CalendarTask>): Promise<CalendarTask> => {
  const { data } = await api.put(`/calendar-task/${id}`, updates);
  return data;
};

// ✅ Eliminar una tarea
export const deleteCalendarTask = async (id: string): Promise<void> => {
  await api.delete(`/calendar-task/${id}`);
};