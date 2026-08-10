import type { Metadata } from "next";
import { Fraunces, Archivo, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Zeybek İnşaat — İstanbul'da yerinde kentsel dönüşüm",
    template: "%s · Zeybek İnşaat",
  },
  description:
    "İstanbul'da kat karşılığı kentsel dönüşüm. Riskli yapı tespitinden anahtar teslimine kadar süreci yürütüyor, inşaat ilerlemesini her ay hak sahipleriyle paylaşıyoruz.",
  metadataBase: new URL("https://zeybekinsaat.com.tr"),
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Zeybek İnşaat",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      className={`${fraunces.variable} ${archivo.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-kagit">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
