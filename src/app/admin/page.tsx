import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { AdminArea } from "@/components/admin/AdminPanel";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

export default function Page() {
  return (
    <div className="bg-paper py-12 sm:py-16">
      <Container>
        <AdminArea />
      </Container>
    </div>
  );
}
