/**
 * Single source of truth for anything that appears in more than one place —
 * price, contact details, nav. Change it here, not in the components.
 */

export const SITE = {
  name: "VetConnect",
  tagline: "Bringing pet care home",
  /** Consultation price in rupees. Also sent to the payment API, which re-checks it. */
  consultPrice: 199,
  /** Late-night consultations (from `nightFromHour` until close) cost this. */
  nightPrice: 299,
  nightFromHour: 22,
  /** Vets take calls from `openHour` until `closeHour` (24 = midnight). */
  openHour: 8,
  closeHour: 24,
  connectMinutes: 15,
  /**
   * Bookings and support both land here. Change these two lines when the
   * business gets its own number — every page reads from here.
   */
  whatsapp: "+91 83198 55908",
  whatsappDigits: "918319855908",
  email: "care@vetconnect.co.in",
  supportEmail: "care@vetconnect.co.in",
  since: 2026,
  /** AI follow-up questions before payment (functions/api/intake.ts). Off until we add the API key. */
  aiIntake: false,
} as const;

export const NAV: { label: string; href: string }[] = [
  { label: "Consult a vet online", href: "/consult" },
  { label: "Home vet visit", href: "/home-visit" },
  { label: "Vaccinations at home", href: "/vaccinations" },
  { label: "FAQ", href: "/#faq" },
];

export const PETS = ["Dog", "Cat", "Rabbit", "Cow", "Buffalo", "Cattle"] as const;

export const LANGUAGES = [
  "English",
  "Hindi",
  "Telugu",
  "Tamil",
  "Odia",
  "Punjabi",
] as const;
