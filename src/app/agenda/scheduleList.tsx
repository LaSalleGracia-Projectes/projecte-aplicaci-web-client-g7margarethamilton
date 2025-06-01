"use client";

import { useEffect, useState } from "react";

type Schedule = {
  id: string;
  title: string;
  isFavorite: boolean;
  email: string;
  id_category: string | null;
  created_at: string;
};

export default function ScheduleList() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/v1/schedule', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('tokenWeb')}`,
          },
        })
  
        if (!res.ok) throw new Error('Error al obtener las agendas')
  
        const data = await res.json()
        console.log('🔍 Respuesta del backend:', data) // <-- ACÁ
  
        setSchedules(data) // O data.schedules si es un objeto
      } catch (err) {
        console.error(err)
      }
    }
  
    fetchSchedules()
  }, [])
  

  if (schedules.length === 0) {
    return <p className="text-gray-500">No tienes agendas aún.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {schedules.map((agenda) => (
        <div
          key={agenda.id}
          className="border rounded-xl p-4 shadow-sm hover:shadow-md transition"
        >
          <h2 className="text-lg font-semibold">{agenda.title}</h2>
          <p className="text-sm text-gray-500">
            Creada el {new Date(agenda.created_at).toLocaleDateString()}
          </p>
          <a
            href={`/agenda/${agenda.id}`}
            className="inline-block mt-2 text-blue-600 hover:underline"
          >
            Ver agenda →
          </a>
        </div>
      ))}
    </div>
  );
}