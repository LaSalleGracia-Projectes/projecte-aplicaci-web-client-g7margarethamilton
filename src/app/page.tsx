// import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import Features from "@/components/features";
import Hero from "@/components/hero";
import Footer from "@/components/footer";
// import Image from "next/image";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen bg-flow-white dark:bg-flow-black">
      <header className="w-full bg-flow-white/80 dark:bg-flow-black/80 backdrop-blur-sm border-b border-flow-ultra-light-grey dark:border-flow-grey/20 fixed top-0 z-10"></header>
      <Navbar /> 
      <Hero />
      <Features />
      <Footer />
    </main>
  );
}