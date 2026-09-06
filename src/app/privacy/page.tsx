import type { Metadata } from "next";
import { Prose } from "@/components/ui/Prose";
import { SITE } from "@/data/site";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return (
    <Prose title="Privacy policy" updated="September 2026">
      <p>
        This policy explains what VetConnect collects when you book a
        consultation, why we collect it, and what we do with it. It applies to
        vetconnect.co.in and to the consultations booked through it.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Contact details</strong> — your name, mobile number and, if you
          provide one, your email address. We need these to call you back.
        </li>
        <li>
          <strong>Pet and case details</strong> — species, age, sex, preferred
          language and the description of the problem you enter when booking.
        </li>
        <li>
          <strong>Payment records</strong> — the transaction identifier and
          status returned by our payment processor. We never see or store your
          card, UPI or bank credentials.
        </li>
      </ul>

      <h2>Why we collect it</h2>
      <p>
        To assign an appropriate veterinarian, conduct the consultation, issue a
        prescription where clinically appropriate, and keep a record of the case
        so a follow-up consultation has context. We also use aggregate,
        de-identified case information to improve the service.
      </p>

      <h2>Who we share it with</h2>
      <ul>
        <li>
          <strong>The veterinarian assigned to your case</strong>, who sees only
          what is needed to advise you.
        </li>
        <li>
          <strong>Razorpay</strong>, our payment processor, which handles the
          transaction under its own privacy policy.
        </li>
        <li>
          <strong>Law enforcement or regulators</strong>, where we are legally
          required to.
        </li>
      </ul>
      <p>We do not sell your personal information, and we do not share it for advertising.</p>

      <h2>Where it is stored</h2>
      <p>
        Booking records are stored on infrastructure operated by Cloudflare.
        Access is restricted to VetConnect staff who need it to run the service.
      </p>

      <h2>Your rights</h2>
      <p>
        Under India&rsquo;s Digital Personal Data Protection Act, you may ask us
        for a copy of the personal data we hold about you, ask us to correct it,
        or ask us to delete it. Write to{" "}
        <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a> and we
        will respond within 30 days. Deleting your data may mean we can no longer
        provide continuity of care for past consultations.
      </p>

      <h2>Retention</h2>
      <p>
        Consultation records are kept for three years, which allows a treating
        veterinarian to refer back to a pet&rsquo;s history. Payment records are
        kept for as long as tax law requires.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy go to{" "}
        <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a> or
        WhatsApp {SITE.whatsapp}.
      </p>
    </Prose>
  );
}
