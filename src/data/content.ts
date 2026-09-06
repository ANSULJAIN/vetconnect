export type Service = {
  slug: string;
  title: string;
  examples: string;
  icon: "health" | "behaviour" | "skin" | "nutrition" | "second" | "parenting";
};

export const SERVICES: Service[] = [
  {
    slug: "general-health",
    title: "General Pet Health",
    examples: "Fever, vomiting, diarrhoea, loss of appetite",
    icon: "health",
  },
  {
    slug: "behaviour",
    title: "Behaviour Consultation",
    examples: "Excessive barking, aggression, separation anxiety",
    icon: "behaviour",
  },
  {
    slug: "skin-coat",
    title: "Skin and Coat",
    examples: "Hair fall, itching, skin infections, wound care",
    icon: "skin",
  },
  {
    slug: "nutrition",
    title: "Diet and Nutrition",
    examples: "Weight management, diabetic diets, bird nutrition",
    icon: "nutrition",
  },
  {
    slug: "second-opinion",
    title: "Second Vet Opinion",
    examples: "Report review, chronic condition management",
    icon: "second",
  },
  {
    slug: "new-pet",
    title: "New Pet Parenting",
    examples: "Bringing a puppy home, vaccination schedules",
    icon: "parenting",
  },
];

export type Doctor = {
  name: string;
  qualification: string;
  bio: string;
  languages: string;
  /** Drop a square photo in /public/images/doctors/ and reference it here. */
  photo?: string;
};

/**
 * PLACEHOLDER DATA — replace with the real veterinarians before launch.
 * Photos go in /public/images/doctors/ as square JPEGs, ~400x400.
 */
export const DOCTORS: Doctor[] = [
  {
    name: "Dr. [Name]",
    qualification: "B.V.Sc. & A.H.",
    bio: "Veterinary consultant and surgeon with experience across companion animals, birds and livestock. Special interest in preventive care.",
    languages: "English, Hindi",
    photo: undefined,
  },
  {
    name: "Dr. [Name]",
    qualification: "B.V.Sc. & A.H., M.V.Sc.",
    bio: "Clinical and research experience in infectious disease medicine, treating dogs, cats, birds and cattle.",
    languages: "English, Hindi, Telugu",
    photo: undefined,
  },
  {
    name: "Dr. [Name]",
    qualification: "M.V.Sc.",
    bio: "Over ten years of clinical experience in small animal medicine, surgery, emergency care and inpatient management.",
    languages: "English, Tamil",
    photo: undefined,
  },
  {
    name: "Dr. [Name]",
    qualification: "B.V.Sc. & A.H., Ph.D",
    bio: "Consultant and surgeon with expertise in veterinary surgery, radiology, preventive care and nutrition.",
    languages: "English, Hindi, Odia",
    photo: undefined,
  },
];

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
};

/** PLACEHOLDER — swap for real reviews once the pilot has them. */
export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Booked at 9pm when my dog had a fever. The vet called back within fifteen minutes and the prescription came through on WhatsApp. He was better in two days.",
    name: "[Customer name]",
    role: "Dog parent",
  },
  {
    quote:
      "I live outside India and needed advice for my cat. This was far easier than finding a local clinic, and the doctor was thorough.",
    name: "[Customer name]",
    role: "Cat parent",
  },
  {
    quote:
      "Affordable and quick. The coordinator followed up the next morning to check how she was doing, which I did not expect.",
    name: "[Customer name]",
    role: "Pet parent",
  },
  {
    quote:
      "My budgie stopped eating and no clinic nearby sees birds. The vet knew exactly what to look for.",
    name: "[Customer name]",
    role: "Bird parent",
  },
];

export const FAQ: { q: string; a: string }[] = [
  {
    q: "Can I consult a vet for my dog?",
    a: "Yes. Our veterinarians handle everything from fever, vomiting and diarrhoea to skin conditions, behaviour and diet. Book a slot, describe the symptoms, and a vet will call you back.",
  },
  {
    q: "Can I consult for my cat?",
    a: "Yes. Cats are one of the most common consultations we take, covering illness, litter and behaviour problems, vaccination schedules and nutrition.",
  },
  {
    q: "Can I consult for my pet bird?",
    a: "Yes. Several of our veterinarians have avian experience and regularly advise on budgerigars, cockatiels, lovebirds, parrots and poultry.",
  },
  {
    q: "Can I consult for an exotic pet?",
    a: "Yes. We take consultations for rabbits, guinea pigs, hamsters, turtles and fish. Mention the species when you book so we can assign the right veterinarian.",
  },
  {
    q: "I cannot identify what is wrong with my pet. Can I still consult?",
    a: "That is exactly what a consultation is for. Describe what you have noticed — appetite, energy, toilet habits, anything unusual — and the veterinarian will work through it with you.",
  },
  {
    q: "Can I get a prescription online?",
    a: "Yes. Where a prescription is appropriate, the veterinarian issues a written one after the consultation and it is shared with you digitally.",
  },
  {
    q: "Can I consult for a cow, goat or sheep?",
    a: `Yes. Our veterinarians advise on cattle, buffalo, goats and sheep. For farm animals needing hands-on treatment, we can also arrange a visit — write to ${"care@vetconnect.co.in"} and we will tell you what is available in your district.`,
  },
  {
    q: "Is the service available across India?",
    a: "Online consultations are available anywhere in India. Home visits and vaccinations are currently limited to selected cities — check the home visit page for the current list.",
  },
  {
    q: "How quickly will a veterinarian call me?",
    a: "Most consultations connect within fifteen minutes of booking. If you choose a later slot, the veterinarian will call at the time you selected.",
  },
  {
    q: "What if my pet needs emergency care?",
    a: "Online consultation is not a substitute for emergency treatment. If your pet has had a serious injury, is struggling to breathe, has collapsed or is bleeding heavily, go to the nearest veterinary hospital immediately.",
  },
];

export const WHY_US: string[] = [
  "Cannot travel to a clinic? Consult a verified veterinarian from home.",
  "No travel, no waiting room, no rescheduling around clinic hours.",
  "Vets with species-specific experience — dogs, cats, birds and exotics.",
  "A written prescription and follow-up notes after every consultation.",
];
