import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AIHCAS – AI Healthcare Assistant",
  description: "Your Intelligent AI Healthcare Assistant. Instant symptom guidance, voice interaction, and medical report analysis. Powered by AI, designed for you.",
  keywords: "AI healthcare, symptom checker, medical assistant, prescription analysis, health AI",
  authors: [{ name: "AIHCAS Team" }],
  openGraph: {
    title: "AIHCAS – AI Healthcare Assistant",
    description: "Instant symptom guidance, voice interaction, and report analysis.",
    type: "website",
  },
};

import { Providers } from "@/components/Providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
