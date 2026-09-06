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
    <article className="flex h-full flex-col items-center rounded-2xl bg-surface p-6 text-center shadow-sm ring-1 ring-line-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-deep/10 hover:ring-vivid/30">
      {doctor.photo ? (
        <Image
          src={doctor.photo}
          alt={doctor.name}
          width={112}
          height={112}
          className="h-20 w-20 rounded-full object-cover ring-4 ring-brand-soft"
        />
      ) : (
        <span
          aria-hidden
          className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-soft font-display text-[22px] font-bold text-brand-deep ring-4 ring-brand-soft/60"
        >
          {initials(doctor.name)}
        </span>
      )}

      <h3 className="mt-4 font-display text-[17px] leading-tight font-bold tracking-tight text-ink">
        {doctor.name}
      </h3>
      <p className="mt-2 rounded-full bg-paper-deep px-3 py-0.5 font-mono text-[10px] tracking-wide text-ink-soft">
        {doctor.qualification}
      </p>
      {doctor.school && (
        <p className="mt-2 text-[12px] text-ink-faint">{doctor.school}</p>
      )}
      <p className="mt-3 line-clamp-3 text-[13.5px] leading-relaxed text-ink-muted">{doctor.bio}</p>
      {doctor.languages && (
        <p className="mt-auto pt-3 text-[12px] text-ink-faint">Speaks {doctor.languages}</p>
      )}
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
