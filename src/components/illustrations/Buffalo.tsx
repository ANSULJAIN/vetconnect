/**
 * Buffalo head, drawn head-on. Hand-built — there is no stock art in this project.
 *
 * Deliberately heavy-stroked and low-detail: it renders as small as 40px in the
 * app mockup, and fine line work turns to mush at that size.
 */
export function Buffalo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 100"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        {/* horns — wide sweep out and up */}
        <path
          d="M40 42C29 25 11 22 6 33c-4 9 1 18 9 20"
          strokeWidth="8"
        />
        <path
          d="M80 42c11-17 29-20 34-9 4 9-1 18-9 20"
          strokeWidth="8"
        />

        {/* head */}
        <path
          d="M40 41c0-7 9-13 20-13s20 6 20 13c0 17-3 29-9 36-4 4-7 6-11 6s-7-2-11-6c-6-7-9-19-9-36z"
          strokeWidth="7"
        />

        {/* eyes */}
        <path d="M51 56h.01M69 56h.01" strokeWidth="8" />

        {/* muzzle */}
        <path
          d="M60 66c7 0 12 4 12 9s-5 9-12 9-12-4-12-9 5-9 12-9z"
          strokeWidth="6"
        />
      </g>
    </svg>
  );
}
