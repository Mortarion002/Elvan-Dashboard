import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";

import { LandingPage } from "@/components/landing/LandingPage";

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Elvan - AI Signal Dashboard",
  description: "Unified observability for production AI signal systems.",
};

export default function Home() {
  return (
    <main className={dmSans.className}>
      <LandingPage />
    </main>
  );
}
