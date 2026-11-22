import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { DoctorArea } from "@/components/doctor/DoctorDashboard";

export const metadata: Metadata = {
  title: "For veterinarians",
  description: "Join VetConnect as a veterinarian and consult pet parents online.",
};

export default function Page() {
  return (
    <div className="bg-paper py-12 sm:py-16">
      <Container size="narrow">
        <DoctorArea />
      </Container>
    </div>
  );
}
