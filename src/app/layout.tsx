import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Guide Me - YouTube to Structured Lessons",
  description: "Turn YouTube tutorials into structured lessons for visual learners",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
