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
  whatsapp: "+917010200909",
  whatsappDigits: "917010200909",
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
