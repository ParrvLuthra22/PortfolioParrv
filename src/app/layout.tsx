import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

import SmoothScroll from "@/components/SmoothScroll";
import CustomCursor from "@/components/CustomCursor";
import Navigation from "@/components/Navigation";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Parrv | Creative Developer & Designer",
  description: "Building digital experiences at the intersection of design and technology. Portfolio of Parrv Luthra — Creative Developer based in San Francisco.",
  keywords: ["portfolio", "creative developer", "designer", "web development", "UI/UX", "motion design"],
  authors: [{ name: "Parrv Luthra" }],
  openGraph: {
    title: "Parrv | Creative Developer & Designer",
    description: "Building digital experiences at the intersection of design and technology.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="lenis lenis-smooth">
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-black text-white`}>
        <SmoothScroll>
          <Navigation />
          <CustomCursor />
          {/* Noise overlay for texture */}
          <div className="noise-overlay" />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
