import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Link from "next/link";
import { Heart } from "lucide-react";
import Navigation from '@/components/Navigation';


const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "Brill & Damaris Wedding | January 23, 2026",
  description: "Join us for our special day at Rusinga Island Lodge",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navigation />  {/* New smart navigation */}
        {children}
        <Toaster />     {/* For success messages */}
      </body>
    </html>
  );
}
 