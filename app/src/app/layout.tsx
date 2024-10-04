import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { NavBar } from "@/components/NavBar";
import { cn } from "@/lib/utils";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Solana Todo App",
  description: "managing your task with solana to do app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-hero-pattern bg-cover bg-no-repeat bg-center overflow-x-hidden font-sans antialiased",
          fontSans.variable
        )}
      >
        <Providers>
          {" "}
          <NavBar /> {children}
        </Providers>
      </body>
    </html>
  );
}
