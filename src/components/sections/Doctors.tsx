import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Carousel } from "@/components/ui/Carousel";
import { DOCTORS, type Doctor } from "@/data/content";

export function Doctors() {
  return (
    <section id="vets" className="scroll-mt-24 bg-brand-wash py-18 sm:py-24">
      <Container size="wide">
        <h2 className="text-center font-display text-[30px] leading-tight font-extrabold tracking-tight text-ink text-balance sm:text-[38px]">
          Our vet experts
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-[16px] leading-relaxed text-ink-muted">
          Every veterinarian on VetConnect is registered, credential-checked and
          experienced with the species they advise on.
        </p>

        <Carousel label="Our veterinarians" className="mt-12">
          {DOCTORS.map((d, i) => (
            <DoctorCard key={i} doctor={d} />
          ))}
        </Carousel>
      </Container>
    </section>
  );
}

function DoctorCard({ doctor }: { doctor: Doctor }) {
  return (
    <article className="flex h-full flex-col items-center rounded-2xl bg-surface p-8 text-center shadow-sm ring-1 ring-line-soft">
      {doctor.photo ? (
        <Image
          src={doctor.photo}
          alt={doctor.name}
          width={112}
          height={112}
          className="h-28 w-28 rounded-full object-cover ring-4 ring-brand-soft"
        />
      ) : (
        <span
          aria-hidden
          className="flex h-28 w-28 items-center justify-center rounded-full bg-brand-soft font-display text-[30px] font-bold text-brand-deep ring-4 ring-brand-soft/60"
        >
          {initials(doctor.name)}
        </span>
      )}

      <h3 className="mt-5 font-display text-[20px] font-bold tracking-tight text-ink">
        {doctor.name}
      </h3>
      <p className="mt-2 rounded-full bg-paper-deep px-3.5 py-1 font-mono text-[11px] tracking-wide text-ink-soft">
        {doctor.qualification}
      </p>
      <p className="mt-4 text-[14px] leading-relaxed text-ink-muted">{doctor.bio}</p>
      <p className="mt-4 text-[13px] text-ink-faint">Speaks {doctor.languages}</p>
    </article>
  );
}

/** "Dr. Asha Rao" -> "AR"; falls back to a paw glyph for placeholder names. */
function initials(name: string) {
  const parts = name
    .replace(/^Dr\.?\s*/i, "")
    .replace(/[[\]]/g, "")
    .trim()
    .split(/\s+/)
    .filter((p) => p.toLowerCase() !== "name");
  if (parts.length === 0) return "🐾";
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
