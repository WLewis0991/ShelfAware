import type { Metadata } from "next";
import { IBM_Plex_Serif, Mona_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const ibmPlexSerif = IBM_Plex_Serif({
  variable: "--font-ibm-plex-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const monsSans = Mona_Sans({
  variable: "--font-mona-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Shelf Aware",
  description:
    "Transforms any books or PDFs into an interactive conversation with AI, using either text or voice.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        ibmPlexSerif.variable,
        monsSans.variable,
        "font-sans",
        "relative",
      )}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
