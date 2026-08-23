import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { Stats } from "@/components/sections/Stats";
import { Problem } from "@/components/sections/Problem";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Marquee } from "@/components/sections/Marquee";
import { Verification } from "@/components/sections/Verification";
import { ForVets } from "@/components/sections/ForVets";
import { Pilot } from "@/components/sections/Pilot";
import { FAQ } from "@/components/sections/FAQ";
import { CTA } from "@/components/sections/CTA";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <Stats />
        <Problem />
        <HowItWorks />
        <Marquee />
        <Verification />
        <ForVets />
        <Pilot />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
