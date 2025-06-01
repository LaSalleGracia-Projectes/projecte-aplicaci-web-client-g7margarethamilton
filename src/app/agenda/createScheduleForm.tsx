"use client";

import { useState } from "react";

export default function CreateScheduleForm() {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

const user = JSON.parse(localStorage.getItem("user") || "{}");
    const res = await fetch("http://localhost:3000/api/v1/schedule", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("tokenWeb")}`,
      },
      body: JSON.stringify({
        title,
        is_favorite: false,
        userId: user.email,
        id_category: null,
      }),
    });

    console.log("payload sent: ", res);

    if (res.ok) {
      location.reload(); // recarga para ver la nueva agenda
    } else {
      console.error("Error creando agenda");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleCreate} className="flex gap-4 items-end">
      <div className="flex flex-col">
        <label className="text-sm font-medium">Nombre de la agenda</label>
        <input
          type="text"
          className="border rounded px-3 py-1"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Creando..." : "Crear"}
      </button>
    </form>
  );
}