import { useState } from "react";
import Link from "next/link";
import { Menu, User, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/app/providers";
import { Card } from "@/components/ui/card";

const menuItems = [
  { icon: <User size={24} />, link: "/profile", label: "Perfil" },
  { icon: <Settings size={24} />, link: "/settings", label: "Configuración" },
];

export default function Sidebar() {
  const { logOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed top-4 left-4 z-50">
      {/* Botón de menú */}
      <button
        onMouseEnter={() => setIsOpen(true)}
        className="p-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100"
      >
        <Menu size={24} />
      </button>

      {/* Sidebar */}
      {isOpen && (
        <Card
          onMouseLeave={() => setIsOpen(false)}
          className="fixed top-0 left-0 h-screen w-64 bg-gray-100 text-black shadow-lg p-6 flex flex-col gap-6"
        >
          {menuItems.map((item, index) => (
            <Link key={index} href={item.link} className="flex items-center gap-2 p-2 rounded hover:bg-gray-200">
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
          <button
            onClick={logOut}
            className="flex items-center gap-2 text-red-500 p-2 rounded hover:bg-gray-200"
          >
            <LogOut size={24} />
            <span>Salir</span>
          </button>
        </Card>
      )}
    </div>
  );
}
