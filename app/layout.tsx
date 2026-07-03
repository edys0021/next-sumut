import "./globals.css";
import type { Metadata } from "next";
import MainLayout from "@/components/layout/main-layout";
import localFont from "next/font/local";
import Script from "next/script";

const commissioner = localFont({
  src: [
    {
      path: "../public/assets/fonts/Commissioner-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/assets/fonts/Commissioner-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/assets/fonts/Commissioner-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "E-Branch Sumut",
  description: "Queue Systems Bank Sumatra Utara"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={commissioner.variable}>
      <body>
          <Script src="/env.js" strategy="beforeInteractive" />
          <MainLayout>
            {children}
          </MainLayout>
      </body>
    </html>
  );
}
