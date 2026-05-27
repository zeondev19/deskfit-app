import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://deskfit-app.vercel.app"),
  title: {
    default: "DeskFit - Desk Setup Planner",
    template: "%s | DeskFit"
  },
  description: "Plan, arrange, and validate a 2D desk setup before buying or redesigning your workspace.",
  applicationName: "DeskFit",
  keywords: ["desk setup planner", "workspace planner", "desk layout", "2D planner", "home office"],
  authors: [{ name: "DeskFit" }],
  creator: "DeskFit",
  openGraph: {
    title: "DeskFit - Desk Setup Planner",
    description: "Customize your desk size, arrange gear, check fit, and export your setup as a PNG.",
    url: "https://deskfit-app.vercel.app",
    siteName: "DeskFit",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "DeskFit 2D desk setup planner"
      }
    ],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "DeskFit - Desk Setup Planner",
    description: "Plan your desk setup before buying anything.",
    images: ["/opengraph-image"]
  },
  icons: {
    icon: "/icon.svg"
  }
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
