import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SAB Exam Portal — School of Accounting & Business",
  description: "Online application portal for Repeat/Medical End Semester Examinations — BSc. Applied Accounting, Institute of Chartered Accountants of Sri Lanka",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
