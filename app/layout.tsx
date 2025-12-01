import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const ppMondwest = localFont({
  src: "../public/PPMondwest-Regular.otf",
  variable: "--font-pp-mondwest",
  weight: "400",
  display: "swap",
});

const ppNeueBit = localFont({
  src: "../public/PPNeueBit-Bold.otf",
  variable: "--font-pp-neue-bit",
  weight: "700",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nightroot",
  description: "Nightroot is a habit tracker for astronauts",
  icons: {
    icon: "/mars.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${ppMondwest.variable} ${ppNeueBit.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClerkProvider dynamic>
            <ConvexClientProvider>{children}</ConvexClientProvider>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
