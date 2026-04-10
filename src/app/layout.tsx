import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mắt Việt Outlet | Ưu Đãi Đặc Biệt",
  description:
    "Đăng ký nhận voucher ưu đãi độc quyền từ Mắt Việt Outlet - Sale lên đến 50%++",
  openGraph: {
    title: "Mắt Việt Outlet | Ưu Đãi Đặc Biệt",
    description:
      "Đăng ký nhận voucher ưu đãi độc quyền từ Mắt Việt Outlet",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
