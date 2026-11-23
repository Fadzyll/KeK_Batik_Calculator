import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Kek Batik Manager",
  description: "Track ingredient costs, price each piece, and record sales.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#643c28" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {user && <Nav email={user.email} />}
        <main className="mx-auto max-w-5xl px-4 pt-6 pb-28 sm:pb-12">{children}</main>
      </body>
    </html>
  );
}
