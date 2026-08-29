import type { Metadata } from "next";
import OdemePanosu from "@/components/hesap/odeme-panosu";
import { cikisYap } from "./giris/actions";
import { hesapla, odemeler, sozlesme, tarihKisa } from "@/lib/hesap";

export const metadata: Metadata = {
  title: "Ödeme Takibi · Zeybek İnşaat",
  robots: { index: false, follow: false, nocache: true },
};

// "Bugün" her istekte doğru olsun
export const dynamic = "force-dynamic";

export default function HesapSayfasi() {
  const hesap = hesapla(new Date());
  const sonOdeme = odemeler[odemeler.length - 1];

  return (
    <main>
      <header className="band an">
        <div>
          <p className="lbl" style={{ color: "var(--seri-2)" }}>
            {sozlesme.proje} · {sozlesme.adaParsel}
          </p>
          <h1
            className="num"
            style={{ fontSize: "clamp(24px, 3vw, 34px)", marginTop: 14 }}
          >
            {sozlesme.blok.toLocaleUpperCase("tr")} — DAİRE {sozlesme.daire}
          </h1>
        </div>

        <div style={{ display: "flex", gap: 36, alignItems: "flex-end" }}>
          <div>
            <p className="lbl" style={{ color: "var(--gri-2)" }}>
              Hak sahibi
            </p>
            <p style={{ fontSize: 13, marginTop: 9, color: "var(--cizgi)" }}>
              {sozlesme.hakSahibi}
            </p>
          </div>
          <div>
            <p className="lbl" style={{ color: "var(--gri-2)" }}>
              Son ödeme
            </p>
            <p style={{ fontSize: 13, marginTop: 9, color: "var(--cizgi)" }}>
              {tarihKisa(sonOdeme.tarih)}
            </p>
          </div>
          <form action={cikisYap}>
            <button
              type="submit"
              className="lbl"
              style={{
                background: "none",
                border: 0,
                cursor: "pointer",
                font: "inherit",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--gri)",
                textDecoration: "underline",
                textUnderlineOffset: 4,
                padding: 0,
              }}
            >
              Çıkış
            </button>
          </form>
        </div>
      </header>

      <OdemePanosu
        hesap={hesap}
        odemeler={odemeler}
        toplamBedel={sozlesme.toplamBedel}
      />
    </main>
  );
}
