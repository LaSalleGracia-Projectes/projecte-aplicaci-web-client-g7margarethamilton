import { Calendar, CheckSquare, Clock, ListTodo, Bell, BarChart } from "lucide-react"

const features = [
  {
    icon: ListTodo,
    title: "Gestión de Tareas",
    description: "Organiza y prioriza tus tareas diarias de manera eficiente.",
  },
  {
    icon: Calendar,
    title: "Calendario de Eventos",
    description: "Mantén un registro de tus eventos importantes y reuniones.",
  },
  {
    icon: Clock,
    title: "Rutinas Personalizadas",
    description: "Crea y mantén rutinas que se ajusten a tu estilo de vida.",
  },
  {
    icon: CheckSquare,
    title: "Seguimiento de Progreso",
    description: "Visualiza tu progreso y mantente motivado.",
  },
  {
    icon: Bell,
    title: "Recordatorios",
    description: "Recibe notificaciones para no olvidar tus tareas importantes.",
  },
  {
    icon: BarChart,
    title: "Análisis de Productividad",
    description: "Analiza tus hábitos y mejora tu productividad.",
  },
]

export default function Features() {
  return (
    <section className="py-20 bg-flow-white dark:bg-flow-black">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-flow-black dark:text-flow-white mb-4">
            Todo lo que necesitas para organizarte mejor
          </h2>
          <p className="text-flow-grey dark:text-flow-light-grey text-lg">
            Descubre las herramientas que te ayudarán a mantener tu vida organizada y productiva.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-lg border border-flow-ultra-light-grey dark:border-flow-grey/20 hover:border-flow-blue dark:hover:border-flow-blue transition-colors"
            >
              <feature.icon className="h-12 w-12 text-flow-blue mb-4" />
              <h3 className="text-xl font-semibold text-flow-black dark:text-flow-white mb-2">{feature.title}</h3>
              <p className="text-flow-grey dark:text-flow-light-grey">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

