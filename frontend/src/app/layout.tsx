import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Book Catalog & Review System",
  description: "Next.js Frontend connected to Express & Prisma SQLite API",
};

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

