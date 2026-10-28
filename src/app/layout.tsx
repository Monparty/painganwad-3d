import type { Metadata, Viewport } from "next";
import { Noto_Serif_Thai, Sarabun, Srisakdi } from "next/font/google";
import "./globals.css";

const display = Srisakdi({
  variable: "--font-display",
  subsets: ["thai", "latin"],
  weight: ["400", "700"],
});

const serif = Noto_Serif_Thai({
  variable: "--font-serif",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "700"],
});

const sans = Sarabun({
  variable: "--font-sans",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "ไปวัด · นั่งฟังพระสวดมนต์",
  description: "เข้าพระอุโบสถแบบสามมิติ หันมองรอบตัว และนั่งฟังพระสงฆ์สวดมนต์",
};

export const viewport: Viewport = {
  themeColor: "#120806",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`${display.variable} ${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
