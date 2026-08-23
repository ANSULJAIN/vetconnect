import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VetConnect",
  description:
    "A verified veterinarian at the farm gate, the same day. Two-tier veterinary dispatch for rural India.",
  openGraph: {
    title: "VetConnect",
    description:
      "A verified veterinarian at the farm gate, the same day. Two-tier veterinary dispatch for rural India.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
