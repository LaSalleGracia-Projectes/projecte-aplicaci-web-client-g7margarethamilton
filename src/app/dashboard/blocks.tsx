import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Calendar } from "@/components/ui/calendar"

const tasks = [
  { id: 1, time: "08:00", title: "Ejercicio" },
  { id: 2, time: "10:00", title: "Reunión de trabajo" },
  { id: 3, time: "13:00", title: "Almuerzo saludable" },
  { id: 4, time: "18:00", title: "Lectura" },
];

export default function Blocks() {
  return (
    <div className="p-6 grid grid-cols-3 gap-6">
      {/* Agenda Widget */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Agenda</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {tasks.map((task) => (
              <li key={task.id} className="text-gray-700">
                {task.time} - {task.title}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Calendario Widget */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Calendario</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar/>
        </CardContent>
      </Card>

      {/* Timeline de Flujo Diario */}
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Flujo Diario</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 overflow-x-auto p-4">
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                className="p-4 bg-gray-100 rounded-lg shadow-md min-w-[150px] text-center"
                whileHover={{ scale: 1.05 }}
              >
                <p className="text-sm font-semibold">{task.time}</p>
                <p className="text-gray-700">{task.title}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
