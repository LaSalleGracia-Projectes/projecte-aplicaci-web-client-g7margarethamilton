import ScheduleList from "./scheduleList";
import CreateScheduleForm from "./createScheduleForm";

export default function AgendaPage() {
  return (
    <main className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Tus Agendas</h1>
      <CreateScheduleForm />
      <ScheduleList />
    </main>
  );
}