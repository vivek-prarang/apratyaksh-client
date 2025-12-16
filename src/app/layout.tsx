import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sanskrit: Natural Intelligence | Phonetical - Neither Spiritual, Nor Scriptual",
  description:
    "Varṇamālā: Unity of Language (Script), Maths (Numbers), Colours (Varna) and Music (Raga)",

  keywords: [
    "Sanskrit language",
    "Sanskrit phonetics",
    "Natural intelligence",
    "Cognitive science",
    "Scientific Sanskrit",
    "Linguistics",
    "AI and Sanskrit",
  ],

  openGraph: {
    title: "Sanskrit: Natural Intelligence | Phonetical - Neither Spiritual, Nor Scriptual ",
    description:
      "Varṇamālā: Unity of Language (Script), Maths (Numbers), Colours (Varna) and Music (Raga)",
    url: "https://apratyaksh.com/",
    siteName: "Sanskrit: Natural Intelligence",
    images: [
      {
        url: "https://i.ibb.co/23xyRZX8/pngvarnamala.png",
        width: 1200,
        height: 630,
        alt: "Sanskrit Varnamala – Natural Intelligence",
        type: "image/png",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Sanskrit: Natural Intelligence | Phonetical - Neither Spiritual, Nor Scriptual ",
    description:
      "Varṇamālā: Unity of Language (Script), Maths (Numbers), Colours (Varna) and Music (Raga).",
    images: ["https://i.ibb.co/23xyRZX8/pngvarnamala.png"],
  },

  metadataBase: new URL("https://apratyaksh.com/"),
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
