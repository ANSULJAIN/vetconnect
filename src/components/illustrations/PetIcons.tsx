/**
 * Line icons for the six consultation categories, drawn on a 24x24 grid so they
 * sit on the same optical weight as the icons in Icons.tsx.
 */

type Props = { className?: string };

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

export function IconPaw({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <ellipse cx="7" cy="9" rx="1.9" ry="2.4" />
      <ellipse cx="12" cy="7.2" rx="1.9" ry="2.5" />
      <ellipse cx="17" cy="9" rx="1.9" ry="2.4" />
      <path d="M12 12.4c-2.7 0-4.8 1.9-4.8 4.1 0 1.6 1.2 2.7 2.8 2.7.8 0 1.4-.3 2-.3s1.2.3 2 .3c1.6 0 2.8-1.1 2.8-2.7 0-2.2-2.1-4.1-4.8-4.1Z" />
    </svg>
  );
}

export function IconBehaviour({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M4 12a8 8 0 1 1 3.2 6.4L4 19.5l1-3.1A7.9 7.9 0 0 1 4 12Z" />
      <path d="M9.6 9.8a2.4 2.4 0 1 1 3.3 2.2c-.6.3-.9.8-.9 1.4v.4" />
      <path d="M12 16.6h.01" />
    </svg>
  );
}

export function IconSkin({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3.5c3.6 2.4 5.8 5 5.8 8.3a5.8 5.8 0 0 1-11.6 0c0-3.3 2.2-5.9 5.8-8.3Z" />
      <path d="M9.6 12.6c.9.8 1.6 1.1 2.4 1.1s1.5-.3 2.4-1.1" />
      <path d="M10.2 9.7h.01M13.8 10.4h.01" />
    </svg>
  );
}

export function IconBowl({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M3.5 11.5h17c0 4.1-3.4 7-8.5 7s-8.5-2.9-8.5-7Z" />
      <path d="M8.4 8.4c0-1.4.8-2 1.8-2.5s1.6-1 1.6-2.4" />
      <path d="M13.2 8.6c.3-1 1-1.4 1.8-1.8" />
    </svg>
  );
}

export function IconSecondOpinion({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M6.5 3.5h7.2L18 7.8v12.7H6.5Z" />
      <path d="M13.4 3.6v4.3H18" />
      <path d="M9.3 12.4h5.4M9.3 15.6h3.6" />
    </svg>
  );
}

export function IconHouse({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M4 10.6 12 4l8 6.6V20H4Z" />
      <path d="M12 20v-4.4a1.9 1.9 0 0 1 3.8 0V20" />
      <path d="M8.6 12.6h.01" />
    </svg>
  );
}

export function IconCheck({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="m4.5 12.5 4.8 4.8L19.5 7" />
    </svg>
  );
}

export function IconStar({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="m12 3.6 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.8l5.9-.9Z" />
    </svg>
  );
}

export function IconTag({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M11.4 3.5H20v8.6l-8.4 8.4-8.6-8.6Z" />
      <circle cx="16.3" cy="7.7" r="1.4" />
    </svg>
  );
}

export function IconWhatsApp({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.6.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.6-1.2a.6.6 0 0 0 0-.6c0-.1-.6-1.4-.8-1.9s-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3A2.9 2.9 0 0 0 6.6 12a5.1 5.1 0 0 0 1.1 2.7 11.6 11.6 0 0 0 4.5 4 8.8 8.8 0 0 0 1.5.5 3.6 3.6 0 0 0 1.7.1 2.8 2.8 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.6-.3Z" />
    </svg>
  );
}

/* ---- booking-form field icons ---- */

export function IconCalendar({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.4" />
      <path d="M3.5 9.6h17M8 3.5v3M16 3.5v3" />
      <path d="M7.6 13.2h.01M12 13.2h.01M16.4 13.2h.01M7.6 16.8h.01M12 16.8h.01" />
    </svg>
  );
}

export function IconClockSmall({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.2V12l3.2 1.9" />
    </svg>
  );
}

export function IconGender({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <circle cx="10.2" cy="13.6" r="5.1" />
      <path d="M14 9.8 20 3.8M15.4 3.8H20v4.6" />
    </svg>
  );
}

export function IconGlobe({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17" />
      <path d="M12 3.5c2.1 2.3 3.2 5.3 3.2 8.5S14.1 18.2 12 20.5c-2.1-2.3-3.2-5.3-3.2-8.5S9.9 5.8 12 3.5Z" />
    </svg>
  );
}

export function IconChat({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M4 6.2A2.2 2.2 0 0 1 6.2 4h11.6A2.2 2.2 0 0 1 20 6.2v7.4a2.2 2.2 0 0 1-2.2 2.2H9.4L5 19.6v-3.8H6.2A2.2 2.2 0 0 1 4 13.6Z" />
      <path d="M8.4 8.6h7.2M8.4 11.6h4.4" />
    </svg>
  );
}

export function IconUser({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="8.4" r="3.9" />
      <path d="M4.8 20.2a7.2 7.2 0 0 1 14.4 0" />
    </svg>
  );
}

export function IconCake({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M4 20.2h16M5.4 20.2v-6.1a2 2 0 0 1 2-2h9.2a2 2 0 0 1 2 2v6.1" />
      <path d="M12 11.9V8.6M12 5.6v.01" />
      <path d="M5.4 15.6c1.6 0 1.6 1.3 3.3 1.3s1.6-1.3 3.3-1.3 1.6 1.3 3.3 1.3 1.6-1.3 3.3-1.3" />
    </svg>
  );
}

export const SERVICE_ICONS = {
  health: IconPaw,
  behaviour: IconBehaviour,
  skin: IconSkin,
  nutrition: IconBowl,
  second: IconSecondOpinion,
  parenting: IconHouse,
} as const;
