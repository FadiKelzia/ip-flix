import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "IP Information | TMFlix Network Tools",
  description: "Beautiful, instant IP address and network information display. See your public IP, geolocation, browser details, and more.",
  keywords: ["IP address", "geolocation", "network tools", "IP lookup", "browser info"],
  authors: [{ name: "TMFlix" }],
  openGraph: {
    title: "IP Information | TMFlix Network Tools",
    description: "Beautiful, instant IP address and network information display",
    url: "https://ip.tmflix.com",
    siteName: "TMFlix IP Info",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "IP Information | TMFlix Network Tools",
    description: "Beautiful, instant IP address and network information display",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
