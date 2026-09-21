import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MeePro — สินค้าไอที ครบจบในที่เดียว",
  description: "MeePro ร้านขายสินค้าไอที มือถือ แท็บเล็ต อุปกรณ์เสริม พร้อมโปรโมชั่นพิเศษ ผ่อน 0% สาขาทั่วประเทศ",
  keywords: ["MeePro", "มือถือ", "iPhone", "Android", "แท็บเล็ต", "อุปกรณ์เสริม", "ผ่อน 0%"],
  robots: "index, follow",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#2563EB",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
