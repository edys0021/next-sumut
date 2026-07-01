import "./globals.css";
import type { Metadata } from "next";
import MainLayout from "@/components/layout/main-layout";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { ConfigProvider } from "@/providers/config-provider";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body>
        <ConfigProvider>
        <MainLayout>
          {children}
        </MainLayout>
        </ConfigProvider>
      </body>
    </html>
  );
}