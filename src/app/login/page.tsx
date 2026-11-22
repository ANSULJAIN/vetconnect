import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { LoginPage } from "@/components/auth/LoginPage";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false },
};

export default function Page() {
  return (
    <div className="bg-paper py-14 sm:py-20">
      <Container size="narrow">
        <LoginPage />
      </Container>
    </div>
  );
}
