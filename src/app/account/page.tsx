import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { AccountView } from "@/components/account/AccountView";

export const metadata: Metadata = { title: "Your account", robots: { index: false } };

export default function Page() {
  return (
    <div className="bg-paper py-12 sm:py-16">
      <Container size="narrow">
        <AccountView />
      </Container>
    </div>
  );
}
