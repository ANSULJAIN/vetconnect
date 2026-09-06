import type { Metadata } from "next";
import { PetHero } from "@/components/sections/PetHero";
import { Services } from "@/components/sections/Services";
import { PetBand } from "@/components/sections/PetBand";
import { Doctors } from "@/components/sections/Doctors";
import { WhyUs } from "@/components/sections/WhyUs";
import { Testimonials } from "@/components/sections/Testimonials";
import { PetFAQ } from "@/components/sections/PetFAQ";
import { SITE } from "@/data/site";

export const metadata: Metadata = {
  title: `Online Veterinary Consultation 24/7 | Consult a Vet at ₹${SITE.consultPrice}`,
  description:
    "Consult a verified veterinarian online for your dog, cat, bird or exotic pet. Connect in 15 minutes, get a written prescription. Available across India.",
};

export default function Home() {
  return (
    <>
      <PetHero />
      <Services />
      <PetBand />
      <Doctors />
      <WhyUs />
      <Testimonials />
      <PetFAQ />
    </>
  );
}
