import type { Metadata } from "next";
import { roboto } from '@/app/ui/fonts';
import "./globals.css";
import React from "react";

export const metadata: Metadata = {
  title: "Sudoku game",
  description: "Simple sudoku game in Next.js made by sewe2000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (

  <html lang="en">
  <body className={roboto.className}>{children}</body>
  </html>
)
  ;
}
