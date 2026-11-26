import { Header } from "@/components/Header";
import { Hero } from "@/components/hero/Hero";
import { Manifesto } from "@/components/sections/Manifesto";
import { Stats } from "@/components/sections/Stats";
import { Directions } from "@/components/sections/Directions";
import { Process } from "@/components/sections/Process";
import { Cases } from "@/components/sections/Cases";
import { Clients } from "@/components/sections/Clients";
import { Formats } from "@/components/sections/Formats";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";

const Index = () => (
  <div className="relative min-h-screen bg-mist">
    <Header />
    <main>
      <Hero />
      <div className="relative bg-gradient-to-b from-mist via-[#F3F7FA] to-mist">
        <Manifesto />
        <Stats />
        <Directions />
        <Process />
        <Cases />
        <Clients />
        <Formats />
        <Contact />
      </div>
    </main>
    <Footer />
  </div>
);

export default Index;
