import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import NavSidebar from "@/components/NavSidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NégoAchats 2026-2027",
  description: "Gestion des négociations achats",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${geistSans.variable} h-full`}>
      <body className="h-full flex">
        <NavSidebar />
        <main className="flex-1 overflow-auto bg-slate-50 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
