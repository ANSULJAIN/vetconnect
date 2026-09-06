import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { BookingForm } from "@/components/booking/BookingForm";
import { SITE } from "@/data/site";

export const metadata: Metadata = {
  title: "Consult a vet online",
  description: `Book an online veterinary consultation for ₹${SITE.consultPrice}. A verified vet calls you back, usually within ${SITE.connectMinutes} minutes.`,
};

export default function ConsultPage() {
  return (
    <div className="bg-paper py-14 sm:py-20">
      <Container size="narrow">
        <header className="text-center">
          <h1 className="font-display text-[32px] leading-tight font-extrabold tracking-tight text-ink text-balance sm:text-[40px]">
            Book an online vet consultation
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-[16.5px] leading-relaxed text-ink-muted">
            Tell us about your pet and pick a time. A verified veterinarian will
            call you back — usually within {SITE.connectMinutes} minutes.
          </p>
        </header>

        <div className="mt-12">
          <BookingForm />
        </div>

        <p className="mt-10 rounded-xl border-l-[3px] border-clay bg-clay-soft px-5 py-4 text-[14px] leading-relaxed text-ink-soft">
          <strong className="font-semibold text-clay">Emergency?</strong> Online
          consultation is not a substitute for emergency care. If your pet has a
          serious injury, is struggling to breathe, has collapsed or is bleeding
          heavily, go to the nearest veterinary hospital immediately.
        </p>
      </Container>
    </div>
  );
}
