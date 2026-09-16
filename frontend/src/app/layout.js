import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "RetailVision AI — CCTV Analytics & Search",
  description: "AI-powered retail surveillance and natural language CCTV search platform",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f6f7f9] text-slate-950">
        <Sidebar />
        <div className="lg:pl-20 min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
