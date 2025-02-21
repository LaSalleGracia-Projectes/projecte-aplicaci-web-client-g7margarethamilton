// import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import Features from "@/components/features";
import Hero from "@/components/hero";
import Footer from "@/components/footer";
// import Image from "next/image";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen bg-flow-white dark:bg-flow-black">
      <Navbar /> 
      <div id="navbar-separator" className="pt-16">
      <Hero />
      <Features />
      <Footer />
      </div>
    </main>
  );
}