import type { Metadata } from "next";
import { Prose } from "@/components/ui/Prose";
import { SITE } from "@/data/site";

export const metadata: Metadata = { title: "Terms of use" };

export default function TermsPage() {
  return (
    <Prose title="Terms of use" updated="September 2026">
      <p>
        By booking a consultation on vetconnect.co.in you agree to these terms.
        Please read them before you pay.
      </p>

      <h2>What the service is</h2>
      <p>
        VetConnect connects pet owners with registered veterinarians for remote
        consultation by phone or video. The veterinarian advises on the basis of
        what you describe and any images you share. They cannot physically
        examine your animal.
      </p>

      <h2>What it is not</h2>
      <p>
        <strong>
          Online consultation is not emergency care and is not a substitute for
          physical examination.
        </strong>{" "}
        If your pet has suffered trauma, is struggling to breathe, is bleeding
        heavily, has collapsed, is having seizures or has ingested a poison, go
        to the nearest veterinary hospital immediately rather than booking here.
      </p>

      <h2>Clinical responsibility</h2>
      <p>
        Advice is given by the individual veterinarian, who exercises their own
        professional judgement. A consultation may conclude that your pet needs
        an in-person examination, in which case the veterinarian will tell you
        so. That is a valid outcome of a consultation and not grounds for a
        refund.
      </p>

      <h2>Your responsibilities</h2>
      <ul>
        <li>Give accurate and complete information about your pet.</li>
        <li>Be reachable on the number you provide during your chosen slot.</li>
        <li>Follow the advice and dosing instructions given, or seek in-person care.</li>
        <li>Do not use the service on behalf of anyone else without their knowledge.</li>
      </ul>

      <h2>Payment</h2>
      <p>
        Consultations are charged at ₹{SITE.consultPrice}. Bookings are
        confirmed over WhatsApp, where we send a payment link before the
        consultation begins. Prices may change, but the price shown at the time
        of booking is the price you pay.
      </p>

      <h2>Prescriptions</h2>
      <p>
        Where clinically appropriate, the veterinarian will issue a written
        prescription. They are not obliged to prescribe any particular medicine,
        and will not prescribe where doing so would be unsafe without an
        examination.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the extent permitted by law, VetConnect&rsquo;s liability arising from
        a consultation is limited to the amount you paid for it. We are not
        liable for outcomes arising from inaccurate information provided at
        booking, or from advice not being followed.
      </p>

      <h2>Governing law</h2>
      <p>These terms are governed by the laws of India.</p>

      <h2>Contact</h2>
      <p>
        <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a> · WhatsApp {SITE.whatsapp}
      </p>
    </Prose>
  );
}
