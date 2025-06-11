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
        const dateStr = selectedDate.toISOString().slice(0, 10); // yyyy-mm-dd
        const adjustedStartTime = adjustTimeForUTC(`${dateStr}T${newEventStartHour}`);
        const adjustedEndTime = adjustTimeForUTC(`${dateStr}T${newEventEndHour}`);
        if (editingEventId) {
          // PATCH para editar
          const updatedEvent = {
            title: newEventTitle,
            content: newEventContent,
            priority: newEventPriority,
            start_time: adjustedStartTime,
            end_time: adjustedEndTime,
          };
          const response = await fetch(`${API_BASE_URL}/calendar-task/${editingEventId}`, {
            method: "PATCH",
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
                  className="border border-gray-200 shadow px-4 py-2 rounded-md text-blue-800"
                  key={event.id}
                >
                  {event.title}
                  <br />
                  <label className="text-slate-950">
                    {formatDate(new Date(event.start), {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                    {" "}
                    {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {event.end &&
                      " - " + new Date(event.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </label>
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
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendar;