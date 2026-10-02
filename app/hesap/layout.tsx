import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./hesap.css";

/* Grafik kartı diagram-design (cathrynlavery/diagram-design) varsayılan
   derisini kullanır: Instrument Serif başlık, Geist ad, Geist Mono sayı.
   Yalnız bu sayfada yüklenir; sitenin geri kalanı etkilenmez. */
const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin", "latin-ext"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

export default function HesapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`hesap ${geist.variable} ${geistMono.variable} ${instrumentSerif.variable}`}
    >
      {children}
    </div>
  );
}
