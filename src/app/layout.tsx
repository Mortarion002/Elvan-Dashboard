import type { Metadata } from "next";
import Script from "next/script";
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
    <html lang="en" suppressHydrationWarning>
      <body>
        <Script
          id="elvan-theme"
          strategy="beforeInteractive"
        >{`
try {
  var storedTheme = localStorage.getItem("elvan-theme");
  if (storedTheme === "light" || storedTheme === "dark") {
    document.documentElement.dataset.theme = storedTheme;
  }
} catch (_) {}
        `}</Script>
        {children}
      </body>
    </html>
  );
}
