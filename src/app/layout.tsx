import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StickyCTA } from "@/components/sections/StickyCTA";
import { SITE } from "@/data/site";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `VetConnect — online veterinary consultation at ₹${SITE.consultPrice}`,
    template: "%s | VetConnect",
  },
  description:
    "Consult a verified veterinarian online for your pet. Connect in 15 minutes, get a written prescription, from the comfort of your home.",
  openGraph: {
    title: "VetConnect — online veterinary consultation",
    description:
      "Consult a verified veterinarian online for your pet. Connect in 15 minutes, get a written prescription.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${instrument.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden bg-paper">
        <Header />
        {/* StickyCTA lives inside main so it stops travelling at the footer. */}
        <main className="flex-1">
          {children}
          <StickyCTA />
        </main>
        <Footer />
      </body>
    </html>
  );
}
