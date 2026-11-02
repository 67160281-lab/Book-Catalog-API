import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ระบบจัดการคลังหนังสือและรีวิว (Book Catalog)",
  description: "เว็บแอปพลิเคชันจัดการข้อมูลหนังสือและรีวิวด้วย Next.js และ Express API",
};

/**
 * โครงร่างหลักของหน้าเว็บแอปพลิเคชัน (Root Layout)
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
