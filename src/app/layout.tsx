import type { Metadata } from "next";
import { Inter, Antonio } from "next/font/google";
import "./globals.css";
import ClientProvider from "@/ClientProvider";
import { Toaster } from "sonner";
import { LoadingBar } from "@/components/ui/loading-bar";


const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

const antonio = Antonio({
  subsets: ["latin"],
  variable: "--font-antonio",
   weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "RideOwn ",
  description:
    "A modern self-drive car rental web app for booking cars online with transparent pricing, flexible rentals, and a smooth user experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${antonio.variable}`}>
      <body>
        <LoadingBar />
        <ClientProvider>{children}</ClientProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
