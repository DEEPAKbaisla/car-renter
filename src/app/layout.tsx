import type { Metadata } from "next";
import { Roboto_Condensed } from "next/font/google";
import "./globals.css";
import ClientProvider from "@/ClientProvider";
import { Toaster } from "sonner";

const robotoCondensed = Roboto_Condensed({
  weight: "600", // Regular weight
  subsets: ["latin"], // Subset for Latin characters
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
    <html lang="en" className={robotoCondensed.className}>
      <body>
        <ClientProvider>{children}</ClientProvider>
        {/* <Toaster position="top-right" /> */}
      </body>
    </html>
  );
}
