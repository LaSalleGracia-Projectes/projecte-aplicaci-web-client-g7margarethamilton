"use client";

import React, { useState, useEffect } from "react";
import { formatDate, EventClickArg } from "@fullcalendar/core";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getTokenWeb } from "@/lib/auth";
import { Trash2 } from "lucide-react";

const API_BASE_URL = "http://localhost:3000/api/v1";

interface CalendarEvent {
  id?: number;
  title: string;
  content: string;
  is_completed: boolean;
  priority: number;
  start_time: string;
  end_time: string;
  id_calendar: number;
  id_category: number;
  created_at?: string;
}

interface FormattedEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  extendedProps: {
    content: string;
    priority: number;
    is_completed: boolean;
  };
}

const Calendar: React.FC = () => {
  const [currentEvents, setCurrentEvents] = useState<FormattedEvent[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [newEventTitle, setNewEventTitle] = useState<string>("");
  const [newEventContent, setNewEventContent] = useState<string>("");
  const [newEventPriority, setNewEventPriority] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [newEventStartHour, setNewEventStartHour] = useState<string>("09:00");
  const [newEventEndHour, setNewEventEndHour] = useState<string>("10:00");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventIdToDelete, setEventIdToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const token = localStorage.getItem("tokenWeb");
        if (!token) {
          throw new Error("No authentication token found.");
        }

        const response = await fetch(`${API_BASE_URL}/calendar-task`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch events: ${response.statusText}`);
        }

        const events: CalendarEvent[] = await response.json();
        // Transformar los eventos al formato que espera FullCalendar
        const formattedEvents: FormattedEvent[] = events.map((event) => ({
          id: event.id?.toString() || "",
          title: event.title,
          start: event.start_time,
          end: event.end_time,
          extendedProps: {
            content: event.content,
            priority: event.priority,
            is_completed: event.is_completed
          }
        }));
        setCurrentEvents(formattedEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
        setError(error instanceof Error ? error.message : "Error al cargar los eventos");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleEventClick = (selected: EventClickArg) => {
    // Buscar el evento en currentEvents
    const event = currentEvents.find(e => e.id === selected.event.id);
    if (event) {
      setEditingEventId(event.id);
      setNewEventTitle(event.title);
      setNewEventContent(event.extendedProps.content);
      setNewEventPriority(event.extendedProps.priority);
      // Fecha y horas
      const startDate = new Date(event.start);
      setSelectedDate(new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()));
      setNewEventStartHour(startDate.toISOString().slice(11, 16));
      const endDate = new Date(event.end);
      setNewEventEndHour(endDate.toISOString().slice(11, 16));
      setIsDialogOpen(true);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setNewEventTitle("");
    setNewEventContent("");
    setNewEventPriority(1);
    setSelectedDate(null);
    setNewEventStartHour("09:00");
    setNewEventEndHour("10:00");
  };

  const adjustTimeForUTC = (timeString: string): string => {
    const date = new Date(timeString);
    date.setHours(date.getHours() + 2);
    return date.toISOString(); 
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newEventTitle && newEventContent && selectedDate && newEventStartHour && newEventEndHour) {
      try {
        setError(null);
        const token = getTokenWeb();
        if (!token) {
          throw new Error("No authentication token found.");
        }
        
        // Crear las fechas usando la fecha local seleccionada
        const [startHours, startMinutes] = newEventStartHour.split(':').map(Number);
        const [endHours, endMinutes] = newEventEndHour.split(':').map(Number);
        
        const startDate = new Date(selectedDate);
        startDate.setHours(startHours, startMinutes, 0, 0);
        
        const endDate = new Date(selectedDate);
        endDate.setHours(endHours, endMinutes, 0, 0);
        
        // Ajustar las horas para UTC
        const adjustedStartTime = adjustTimeForUTC(startDate.toISOString());
        const adjustedEndTime = adjustTimeForUTC(endDate.toISOString());

        if (editingEventId) {
          // PUT para editar (enviar todos los campos requeridos)
          // Buscar el evento original para obtener los campos que no se editan en el modal
          const originalEvent = currentEvents.find(ev => ev.id === editingEventId);
          const updatedEvent = {
            title: newEventTitle,
            content: newEventContent,
            is_completed: originalEvent ? originalEvent.extendedProps.is_completed : false,
            priority: newEventPriority,
            start_time: adjustedStartTime,
            end_time: adjustedEndTime,
            id_calendar: 8,
            id_category: 1, 
            userId: localStorage.getItem('userEmail') || ""
          };
          const response = await fetch(`${API_BASE_URL}/calendar-task/${editingEventId}`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedEvent),
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error updating event");
          }
          // Actualizar en el estado local
          setCurrentEvents((prevEvents) => prevEvents.map(ev =>
            ev.id === editingEventId
              ? {
                  ...ev,
                  title: newEventTitle,
                  start: adjustedStartTime,
                  end: adjustedEndTime,
                  extendedProps: {
                    ...ev.extendedProps,
                    content: newEventContent,
                    priority: newEventPriority,
                  }
                }
              : ev
          ));
          handleCloseDialog();
          setEditingEventId(null);
        } else {
          // Crear evento nuevo (POST)
          const newEvent: Omit<CalendarEvent, 'id' | 'created_at'> = {
            title: newEventTitle,
            content: newEventContent,
            is_completed: false,
            priority: newEventPriority,
            start_time: adjustedStartTime,
            end_time: adjustedEndTime,
            id_calendar: 8,
            id_category: 1,
          };
          const response = await fetch(`${API_BASE_URL}/calendar-task`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newEvent),
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error al crear el evento");
          }
          const data = await response.json();
          const createdEvent: CalendarEvent = data.task;
          if (!createdEvent.id) {
            setError("Error: The created event does not have a valid ID.");
            return;
          }
          const formattedEvent: FormattedEvent = {
            id: createdEvent.id.toString(),
            title: createdEvent.title,
            start: createdEvent.start_time,
            end: createdEvent.end_time,
            extendedProps: {
              content: createdEvent.content,
              priority: Number(createdEvent.priority),
              is_completed: createdEvent.is_completed ?? false
            }
          };
          setCurrentEvents((prevEvents) => [...prevEvents, formattedEvent]);
          handleCloseDialog();
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : "Error al guardar el evento");
      }
    }
  };

  const handleToggleComplete = async (eventId: string, currentStatus: boolean) => {
    try {
      const token = getTokenWeb();
      if (!token) {
        throw new Error("No authentication token found.");
      }

      const response = await fetch(`${API_BASE_URL}/calendar-task/${eventId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_completed: !currentStatus,
          // Necesitamos enviar todos los campos requeridos
          title: currentEvents.find(e => e.id === eventId)?.title || "",
          content: currentEvents.find(e => e.id === eventId)?.extendedProps.content || "",
          priority: currentEvents.find(e => e.id === eventId)?.extendedProps.priority || 1,
          start_time: currentEvents.find(e => e.id === eventId)?.start || "",
          end_time: currentEvents.find(e => e.id === eventId)?.end || "",
          id_calendar: 8,
          id_category: 1,
        }),
      });

      if (!response.ok) {
        throw new Error("Error updating event status");
      }

      // Actualizar el estado local
      setCurrentEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === eventId
            ? {
                ...event,
                extendedProps: {
                  ...event.extendedProps,
                  is_completed: !currentStatus,
                },
              }
            : event
        )
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error updating event status");
    }
  };

  return (
    <div>
      <div className="flex w-full px-10 justify-start items-start gap-8">
        <div className="w-3/12 h-[85vh] flex flex-col">
          <div className="py-10 text-2xl font-extrabold px-7">Calendar Events</div>
          {isLoading && <div className="text-center">Cargando eventos...</div>}
          {error && <div className="text-red-500 text-center">{error}</div>}
          <ul className="space-y-4 flex-1 overflow-y-auto">
            {!isLoading && currentEvents.length <= 0 && (
              <div className="italic text-center text-gray-400">
                No hay eventos programados
              </div>
            )}

            {currentEvents.length > 0 &&
              currentEvents.map((event) => (
                <li
                  className="border border-gray-200 shadow px-4 py-2 rounded-md text-blue-800 flex items-center justify-between"
                  key={event.id}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="checkbox"
                      checked={event.extendedProps.is_completed}
                      onChange={() => handleToggleComplete(event.id, event.extendedProps.is_completed)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => {
                        setEditingEventId(event.id);
                        setNewEventTitle(event.title);
                        setNewEventContent(event.extendedProps.content);
                        setNewEventPriority(event.extendedProps.priority);
                        const startDate = new Date(event.start);
                        setSelectedDate(new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()));
                        setNewEventStartHour(startDate.toISOString().slice(11, 16));
                        const endDate = new Date(event.end);
                        setNewEventEndHour(endDate.toISOString().slice(11, 16));
                        setIsDialogOpen(true);
                      }}
                    >
                      <span className={event.extendedProps.is_completed ? "line-through text-gray-500" : ""}>
                        {event.title}
                      </span>
                      <br />
                      <label className="text-slate-950">
                        {formatDate(new Date(event.start), {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })} {" "}
                        {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {event.end &&
                          " - " + new Date(event.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </label>
                    </div>
                  </div>
                  <button
                    className="ml-2 text-red-500 hover:text-red-700"
                    title="Delete event"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEventIdToDelete(event.id);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
                </li>
              ))}
          </ul>
        </div>

        <div className="w-9/12 mt-8">
          <FullCalendar
            height={"85vh"}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
            }}
            initialView="dayGridMonth"
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            timeZone="local"
            firstDay={1}
            slotLabelFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }}
            select={(info) => {
              setEditingEventId(null);
              setSelectedDate(info.start);
              setNewEventTitle("");
              setNewEventContent("");
              setNewEventPriority(1);
              setNewEventStartHour("09:00");
              setNewEventEndHour("10:00");
              setIsDialogOpen(true);
            }}
            eventClick={handleEventClick}
            events={currentEvents}
          />
        </div>
      </div>

      {/* Dialog for adding new events */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg w-full p-6">
          <DialogHeader>
            <DialogTitle>{editingEventId ? "Edit Event" : "Add New Event Details"}</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSaveEvent}>
            {selectedDate && (
              <div className="text-center font-semibold text-lg">
                {selectedDate.toLocaleDateString()}
              </div>
            )}
            <input
              type="text"
              placeholder="Event Title"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              required
              className="border border-gray-200 p-3 rounded-md text-lg w-full"
            />
            <textarea
              placeholder="Event Content"
              value={newEventContent}
              onChange={(e) => setNewEventContent(e.target.value)}
              required
              className="border border-gray-200 p-3 rounded-md text-lg w-full"
            />
            <label className="block font-medium">Priority</label>
            <select
              value={newEventPriority}
              onChange={(e) => setNewEventPriority(Number(e.target.value))}
              required
              className="border border-gray-200 p-3 rounded-md text-lg w-full"
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
            </select>
            <div className="flex gap-4 w-full">
              <input
                type="time"
                value={newEventStartHour}
                onChange={(e) => setNewEventStartHour(e.target.value)}
                required
                className="border border-gray-200 p-3 rounded-md text-lg flex-1"
              />
              <input
                type="time"
                value={newEventEndHour}
                onChange={(e) => setNewEventEndHour(e.target.value)}
                required
                className="border border-gray-200 p-3 rounded-md text-lg flex-1"
              />
            </div>
            <button
              type="submit"
              className="bg-green-500 text-white p-3 rounded-md w-full"
            >
              {editingEventId ? "Save Changes" : "Add Event"}
            </button>
            {editingEventId && (
              <button
                type="button"
                className="bg-red-500 text-white p-3 rounded-md w-full mt-2"
                onClick={() => {
                  setEventIdToDelete(editingEventId);
                  setDeleteDialogOpen(true);
                }}
              >
                Delete Event
              </button>
            )}
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmación de borrado */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md w-full p-6">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="mb-4">Are you sure you want to delete this event? This action cannot be undone.</div>
          <div className="flex gap-4">
            <button
              className="bg-red-500 text-white p-3 rounded-md w-full"
              onClick={async () => {
                if (!eventIdToDelete) return;
                try {
                  const token = getTokenWeb();
                  if (!token) throw new Error("No authentication token found.");
                  const response = await fetch(`${API_BASE_URL}/calendar-task/${eventIdToDelete}`, {
                    method: "DELETE",
                    headers: {
                      Authorization: `Bearer ${token}`,
                      "Content-Type": "application/json",
                    },
                  });
                  if (!response.ok) throw new Error("Error deleting event");
                  setCurrentEvents((prevEvents) => prevEvents.filter((event) => event.id !== eventIdToDelete));
                  setDeleteDialogOpen(false);
                  setEventIdToDelete(null);
                  // Si se estaba editando este evento, cerrar el modal de edición
                  if (editingEventId === eventIdToDelete) {
                    handleCloseDialog();
                    setEditingEventId(null);
                  }
                } catch (error) {
                  setError(error instanceof Error ? error.message : "Error deleting event");
                }
              }}
            >
              Delete
            </button>
            <button
              className="bg-gray-200 text-gray-800 p-3 rounded-md w-full"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendar;