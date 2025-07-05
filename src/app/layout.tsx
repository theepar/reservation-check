import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ReservCheck - Airbnb & Booking.com Calendar Management",
  description: "Manage your Airbnb and Booking.com reservations with our beautiful, responsive calendar interface. Import and track your bookings effortlessly.",
  keywords: "Airbnb calendar, Booking.com calendar, reservation management, property management, calendar import, ical, booking tracker",
  authors: [{ name: "ReservCheck" }],
  openGraph: {
    title: "ReservCheck Calendar",
    description: "Manage your Airbnb and Booking.com reservations with ease",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ReservCheck Calendar",
    description: "Manage your Airbnb and Booking.com reservations with ease",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#3b82f6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
