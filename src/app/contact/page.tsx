import type { Metadata } from "next";
import { Prose } from "@/components/ui/Prose";
import { SITE } from "@/data/site";

export const metadata: Metadata = { title: "Contact us" };

export default function ContactPage() {
  return (
    <Prose title="Contact us">
      <p>
        For help with a booking, a refund, or anything else, reach us on any of
        these. We answer WhatsApp fastest.
      </p>

      <h2>WhatsApp</h2>
      <p>
        <a href={`https://wa.me/${SITE.whatsappDigits}`}>{SITE.whatsapp}</a> — for
        booking help and follow-ups.
      </p>

      <h2>Email</h2>
      <p>
        <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a> — monitored
        every day, replies within one working day.
      </p>

      <h2>Emergencies</h2>
      <p>
        We are not an emergency service. If your pet needs urgent treatment, go
        to your nearest veterinary hospital.
      </p>
    </Prose>
  );
}
