// import { Calendar } from "@/components/Calendar";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="relative flex h-screen max-h-screen w-full flex-col gap-4 px-4 pt-4 items-center justify-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p>Welcome to the dashboard!</p>

    <Link href="/calendar">
    <Card className="w-full max-w-md p-6 text-center">
        CALENDAR 🗓️
      </Card>
    </Link>
      
      <Card className="w-full max-w-md p-6 text-center">
        SCHEDULE ⏰
      </Card>
    </div>
  );
}