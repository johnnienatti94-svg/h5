import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = { title:"MeePro — เข้าสู่ระบบ", description:"เข้าสู่ระบบหรือสมัครสมาชิก MeePro ด้วยหมายเลขโทรศัพท์" };
export const viewport: Viewport = { width:"device-width", initialScale:1, themeColor:"#FF6E00" };
export default function RootLayout({ children }: Readonly<{ children:React.ReactNode }>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Noto+Sans+Thai:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
