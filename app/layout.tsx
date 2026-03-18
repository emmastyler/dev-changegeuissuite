import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Change Genius™ — Leadership Intelligence Platform",
  description: "Understand how leaders drive change and how teams execute it.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased bg-white text-slate-900">{children}</body>
    </html>
  );
}
