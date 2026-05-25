import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DeskFit - Desk Setup Planner",
  description: "Plan and validate your desk setup before buying or redesigning your workspace."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
