
import type { Metadata } from "next";
import SOS from "@/../components/sos";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ponto Verde",
  description: "Quiosque de saúde Ponto Verde",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <body>
        {children}
        <SOS />
      </body>
    </html>
  );
}
