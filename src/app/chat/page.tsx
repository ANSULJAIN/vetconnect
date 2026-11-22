import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { ChatPage } from "@/components/chat/ChatRoom";

export const metadata: Metadata = { title: "Chat with your vet", robots: { index: false } };

/** /chat/?c=<consultation id> — a query string, because the site is a static export. */
export default function Page() {
  return (
    <div className="bg-paper py-6 sm:py-10">
      <Container size="narrow">
        <ChatPage />
      </Container>
    </div>
  );
}
