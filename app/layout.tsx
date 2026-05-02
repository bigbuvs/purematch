import type { Metadata } from "next";
import { Playfair_Display, Noto_Serif, Inter, Manrope } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-playfair",
});
const notoSerif = Noto_Serif({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  variable: "--font-noto-serif",
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://purematch-app.vercel.app'

export const metadata: Metadata = {
  title: "PureMatch — Registro Digital de Linaje Canino",
  description:
    "La plataforma donde los perros con pedigree encuentran su mejor match. Solo perfiles verificados. Solo contactos de confianza.",
  metadataBase: new URL(APP_URL),
  openGraph: {
    title: "PureMatch — Registro Digital de Linaje Canino",
    description: "La plataforma donde los perros con pedigree encuentran su mejor match. Solo perfiles verificados.",
    url: APP_URL,
    siteName: "PureMatch",
    locale: "es_CL",
    type: "website",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "PureMatch" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PureMatch — Registro Digital de Linaje Canino",
    description: "La plataforma donde los perros con pedigree encuentran su mejor match.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${playfair.variable} ${notoSerif.variable} ${inter.variable} ${manrope.variable}`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="min-h-dvh flex flex-col bg-background">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
