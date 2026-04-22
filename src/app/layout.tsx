import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Elvan Signal Bot Dashboard",
  description: "AI buying-signal intelligence tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
