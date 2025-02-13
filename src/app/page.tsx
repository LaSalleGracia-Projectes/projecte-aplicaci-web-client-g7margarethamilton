import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Navbar (Aún no implementado) */}
      <header className="w-full p-4 bg-white dark:bg-gray-800 shadow-md fixed top-0">
        <h1 className="text-xl font-bold text-center">FLOW2DAY!</h1>
      </header>

      <div id="main-content"> 
      <section className="flex flex-col items-center gap-6 mt-20 p-4 text-center">
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-white">
          Bienvenido a tu organizador personal
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Administra tus eventos, tareas y rutinas de manera sencilla.
        </p>

        <Button className="text-lg px-6 py-3">Empezar</Button>
      </section>
      </div>
      {/* Footer */}
      <footer className="absolute bottom-4 text-gray-500 dark:text-gray-400">
        <p>© 2025 Todos los derechos reservados</p>
      </footer>
    </main>
  );
}