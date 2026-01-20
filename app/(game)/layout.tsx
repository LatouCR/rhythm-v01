import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans, Playpen_Sans } from "next/font/google";
import "../globals.css"; 
import { Providers } from "@/lib/providers/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
});

const playpenSans = Playpen_Sans({
  variable: "--font-playpen-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Another VSRG",
  description: "Web based Vertical Scrolling Rhythm Game",
};

export default function GameMenusLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSans.variable} ${playpenSans.variable} antialiased bg-menu-background`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
