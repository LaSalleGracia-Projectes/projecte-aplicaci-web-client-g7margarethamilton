"use client";

import React, { useState, useEffect } from "react";
import { formatDate, DateSelectArg, EventClickArg } from "@fullcalendar/core";
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
  const [newEventStartTime, setNewEventStartTime] = useState<string>("");
  const [newEventEndTime, setNewEventEndTime] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<DateSelectArg | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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

  const handleEventClick = async (selected: EventClickArg) => {
    if (
      window.confirm(
        `¿Estás seguro de que quieres eliminar el evento "${selected.event.title}"?`
      )
    ) {
      try {
        const token = localStorage.getItem("tokenWeb");
        if (!token) {
          throw new Error("No authentication token found.");
        }

        const response = await fetch(`${API_BASE_URL}/calendar-task/${selected.event.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Error al eliminar el evento");
        }

        // Actualizar la lista de eventos después de eliminar
        setCurrentEvents((prevEvents) => 
          prevEvents.filter((event) => event.id !== selected.event.id)
        );
      } catch (error) {
        console.error("Error deleting event:", error);
        setError(error instanceof Error ? error.message : "Error al eliminar el evento");
      }
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setNewEventTitle("");
    setNewEventContent("");
    setNewEventPriority(1);
    setNewEventStartTime("");
    setNewEventEndTime("");
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newEventTitle && newEventContent && newEventStartTime && newEventEndTime) {
      try {
        setError(null);
        const token = getTokenWeb();
        if (!token) {
          throw new Error("No authentication token found.");
        }

        const newEvent: Omit<CalendarEvent, 'id' | 'created_at'> = {
          title: newEventTitle,
          content: newEventContent,
          is_completed: false,
          priority: newEventPriority,
          start_time: newEventStartTime,
          end_time: newEventEndTime,
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
      } catch (error) {
        console.error("Error creating event:", error);
        setError(error instanceof Error ? error.message : "Error al crear el evento");
      }
    }
  };

  return (
    <div>
      <div className="flex w-full px-10 justify-start items-start gap-8">
        <div className="w-3/12">
          <div className="py-10 text-2xl font-extrabold px-7">Calendar Events</div>
          {isLoading && <div className="text-center">Cargando eventos...</div>}
          {error && <div className="text-red-500 text-center">{error}</div>}
          <ul className="space-y-4">
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
            select={(info) => {
              setSelectedDate(info);
              setIsDialogOpen(true);
            }}
            eventClick={handleEventClick}
            events={currentEvents}
          />
        </div>
      </div>

      {/* Dialog for adding new events */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Event Details</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleAddEvent}>
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
            <input
              type="number"
              placeholder="Priority"
              value={newEventPriority}
              onChange={(e) => setNewEventPriority(Number(e.target.value))}
              required
              className="border border-gray-200 p-3 rounded-md text-lg w-full"
            />
            <div className="flex gap-4">
              <input
                type="datetime-local"
                value={newEventStartTime}
                onChange={(e) => setNewEventStartTime(e.target.value)}
                required
                className="border border-gray-200 p-3 rounded-md text-lg"
              />
              <input
                type="datetime-local"
                value={newEventEndTime}
                onChange={(e) => setNewEventEndTime(e.target.value)}
                required
                className="border border-gray-200 p-3 rounded-md text-lg"
              />
            </div>
            <button
              type="submit"
              className="bg-green-500 text-white p-3 rounded-md w-full"
            >
              Add Event
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendar;