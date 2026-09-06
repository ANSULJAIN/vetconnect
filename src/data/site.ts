/**
 * Single source of truth for anything that appears in more than one place —
 * price, contact details, nav. Change it here, not in the components.
 */

export const SITE = {
  name: "VetConnect",
  tagline: "Bringing pet care home",
  /** Consultation price in rupees. Also sent to the payment API, which re-checks it. */
  consultPrice: 199,
  connectMinutes: 15,
  /**
   * Bookings and support both land here. Change these two lines when the
   * business gets its own number — every page reads from here.
   */
  whatsapp: "+91 93481 38852",
  whatsappDigits: "919348138852",
  email: "care@vetconnect.co.in",
  supportEmail: "care@vetconnect.co.in",
  since: 2026,
} as const;

export const NAV: { label: string; href: string }[] = [
  { label: "Consult a vet online", href: "/consult" },
  { label: "Home vet visit", href: "/home-visit" },
  { label: "Vaccinations at home", href: "/vaccinations" },
  { label: "FAQ", href: "/#faq" },
];

export const PETS = [
  "Dog",
  "Cat",
  "Bird",
  "Rabbit",
  "Guinea Pig",
  "Fish",
  "Turtle",
  "Cow",
  "Other",
] as const;

export const LANGUAGES = [
  "English",
  "Hindi",
  "Telugu",
  "Tamil",
  "Odia",
  "Punjabi",
] as const;
