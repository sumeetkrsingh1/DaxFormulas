import type { Metadata } from "next";
import { JetBrains_Mono, Sora } from "next/font/google";
import "./dax-library.css";
import "./auth.css";
import "./admin.css";

const sora = Sora({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sora",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "DAX Formula Library — Power BI",
  description: "380 ready-made DAX measures for Power BI — Datacense",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sora.className} ${jetbrains.variable}`}>{children}</body>
    </html>
  );
}
