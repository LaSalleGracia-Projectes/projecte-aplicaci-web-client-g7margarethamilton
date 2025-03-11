"use client";
import { motion } from "framer-motion";

const Blocks = () => {
  return (
    <div className="flex gap-6">
      {["Hábitos", "Estadísticas"].map((title, index) => (
        <motion.div
          key={index}
          drag
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          whileTap={{ scale: 0.9 }}
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-40 h-40 bg-primary text-white flex items-center justify-center text-xl font-bold rounded-xl shadow-lg cursor-pointer"
        >
          {title}
        </motion.div>
      ))}
    </div>
  );
};

export default Blocks;