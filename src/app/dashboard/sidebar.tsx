import { motion } from "framer-motion";
import { Home, User, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/app/providers";

const menuItems = [
  { icon: <Home size={24} />, link: "/dashboard", label: "Home" },
  { icon: <User size={24} />, link: "/profile", label: "Perfil" },
  { icon: <Settings size={24} />, link: "/settings", label: "Configuración" },
];

export default function Sidebar() {
  const { logOut } = useAuth();

  return (
    <motion.aside
      className="fixed top-0 left-0 h-full w-12 bg-gray-900 text-white flex flex-col items-center py-6 gap-6 shadow-lg"
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
    >
      {menuItems.map((item, index) => (
        <motion.div
          key={index}
          whileHover={{ scale: 1.2 }}
          className="relative group cursor-pointer"
        >
          <Link href={item.link} className="hover:text-blue-400">
            {item.icon}
          </Link>
          <span className="absolute left-12 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition">
            {item.label}
          </span>
        </motion.div>
      ))}

      {/* Botón de Logout bien alineado */}
      <motion.button
        onClick={logOut}
        whileHover={{ scale: 1.2 }}
        className="mt-auto mb-6 text-red-500 hover:text-red-700"
      >
        <LogOut size={24} />
      </motion.button>
    </motion.aside>
  );
}