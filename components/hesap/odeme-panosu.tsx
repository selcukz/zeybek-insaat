"use client";

import { useMemo, useState } from "react";
import {
  grafikNoktalari,
  lira,
  liraKurus,
  sayiAdi,
  tarihKisa,
  type Hesap,
  type Odeme,
} from "@/lib/hesap";
import KopruGrafik from "./kopru-grafik";
import ProfilGrafik, { type Mod } from "./profil-grafik";

const SERI_1 = "#1b6fa8";
const GECE = "#051c2c";

/* Grafik kartı — diagram-design varsayılan jetonları (hesap.css .dd) */
const INK = "#2d3142";
const MUTED = "#4f5d75";
const SOFT = "#7a8399";
const ACCENT = "#eb6c36";

/** Sekmeler yalnız çizginin ne gösterdiğini değiştirir. */
const MODLAR: { k: Mod; ad: string }[] = [
  { k: "kumulatif", ad: "Kümülatif" },
  { k: "bakiye", ad: "Bakiye" },
];

export default function OdemePanosu({
  hesap,
  odemeler,
  toplamBedel,
}: {
  hesap: Hesap;
  odemeler: Odeme[];
  toplamBedel: number;
}) {
  const [mod, setMod] = useState<Mod>("kumulatif");
  const [uzerinde, setUzerinde] = useState<number | null>(null);
  const [sabit, setSabit] = useState<number | null>(null);

  const noktalar = useMemo(
    () => grafikNoktalari(hesap, toplamBedel),
    [hesap, toplamBedel],
  );

  const aktifIndex = uzerinde ?? sabit;
  const aktif = noktalar[aktifIndex ?? 0];
  const imlecVar = aktifIndex !== null;

  return (
    <>
      {/* ═══ Ölçü şeridi ═══ */}
      <div className="kart olculer">
        <div className="olcu an" style={{ animationDelay: "80ms" }}>
          <p className="lbl">Kalan borç</p>
          <p className="num olcu-deger">{lira(hesap.kalanBorc)}</p>
          <p className="kucuk" style={{ marginTop: 10 }}>
            ₺ · bedelin %{(100 - hesap.yuzde).toFixed(1).replace(".", ",")}&apos;i
          </p>
        </div>

        <div className="olcu an" style={{ animationDelay: "140ms" }}>
          <p className="lbl">Ödenen</p>
          <p className="num olcu-deger" style={{ color: SERI_1 }}>
            {lira(hesap.toplamOdenen)}
          </p>
          <div
            style={{
              marginTop: 13,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div className="oran" style={{ flexGrow: 1 }}>
              <div className="oran-dolu" style={{ width: `${hesap.yuzde}%` }} />
              <div className="oran-plan" style={{ left: `${hesap.yuzde}%` }} />
            </div>
            <span className="num" style={{ fontSize: 13, color: SERI_1 }}>
              %{hesap.yuzde.toFixed(1).replace(".", ",")}
            </span>
          </div>
        </div>

        <div className="olcu an" style={{ animationDelay: "200ms" }}>
          <p className="lbl">Aylık taksit</p>
          <p className="num olcu-deger">{lira(hesap.aylikTaksit)}</p>
          <p className="kucuk" style={{ marginTop: 10 }}>
            ₺ · {hesap.kalanTaksitSayisi} taksit kaldı
          </p>
        </div>

        <div className="olcu an" style={{ animationDelay: "260ms" }}>
          <p className="lbl">Son vade</p>
          <p className="num olcu-deger">{hesap.bitisTarihi}</p>
          <p className="kucuk" style={{ marginTop: 10 }}>
            {lira(hesap.kalanGun)} gün kaldı
          </p>
        </div>
      </div>

      {/* ═══ Grafikler — diagram-design kartı ═══ */}
      <section className="dd">
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <div>
            <p className="dd-kas">Ödeme profili · {MODLAR.find((m) => m.k === mod)!.ad}</p>
            <h2 className="dd-baslik">
              {lira(hesap.toplamOdenen)} ₺ ödendi{" "}
              <em>· {lira(hesap.kalanBorc)} ₺ kaldı</em>
            </h2>
          </div>

          <div className="dd-sekmeler" role="group" aria-label="Grafik görünümü">
            {MODLAR.map((m) => (
              <button
                key={m.k}
                type="button"
                className="dd-sekme"
                aria-pressed={mod === m.k}
                onClick={() => setMod(m.k)}
              >
                {m.ad}
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 28,
            marginTop: 22,
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          {/* ── çizgi grafik ── */}
          <div style={{ flex: "0 1 880px", minWidth: 0 }}>
            <ProfilGrafik
              noktalar={noktalar}
              mod={mod}
              aktif={aktifIndex}
              toplamBedel={toplamBedel}
              toplamOdenen={hesap.toplamOdenen}
              bugun={hesap.bugun}
              onGezin={setUzerinde}
              onSec={(i) => setSabit(sabit === i ? null : i)}
            />
          </div>

          {/* ── okuma paneli ── */}
          <aside className="dd-panel" style={{ width: 250, flexShrink: 0 }}>
            <div>
              <p className="dd-kas" style={{ fontSize: 10 }}>
                {imlecVar && uzerinde === null ? "Sabitlendi" : aktif.tur}
              </p>
              <p className="dd-baslik" style={{ fontSize: 26, marginTop: 6 }}>
                {aktif.uzun}
              </p>
            </div>

            <div className="dd-cizgi" />

            {[
              { ad: "Beklenen", d: lira(aktif.beklenen), c: INK },
              {
                ad: "Ödenen",
                d: lira(aktif.odenen),
                c: aktif.odenen > 0 ? INK : SOFT,
              },
              { ad: "Kalan bakiye", d: lira(aktif.bakiye), c: INK },
              { ad: "Kümülatif", d: lira(aktif.kumulatif), c: INK },
            ].map((s) => (
              <div key={s.ad} className="dd-satir">
                <span className="dd-ad">{s.ad}</span>
                <span className="dd-deger" style={{ color: s.c }}>
                  {s.d}
                </span>
              </div>
            ))}

            <div className="dd-cizgi" />

            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke={aktif.gecmis ? ACCENT : SOFT}
                strokeWidth={1.6}
                strokeLinecap="round"
                aria-hidden="true"
              >
                {aktif.gecmis ? (
                  <path d="M3 8.5 L6.5 12 L13 4" />
                ) : (
                  <>
                    <circle cx="8" cy="8" r="6.5" />
                    <path d="M8 4.5 V8 L10.5 10" />
                  </>
                )}
              </svg>
              <span className="dd-kas" style={{ color: aktif.gecmis ? INK : MUTED }}>
                {aktif.durum}
              </span>
            </div>

            <p style={{ fontSize: 12.5, lineHeight: 1.55, color: MUTED }}>
              {aktif.i === 0
                ? hesap.pesinatTamam
                  ? `Peşinatın tamamı ${sayiAdi(hesap.pesinatAdedi)} havaleyle ${hesap.pesinatSonTarih} tarihinde tamamlandı.`
                  : `Peşinat ${sayiAdi(hesap.pesinatAdedi)} havaleyle kısmen ödendi; son havale ${hesap.pesinatSonTarih}.`
                : aktif.gecmis
                  ? `Taksit ${aktif.i} ödendi. Vade ${aktif.vade}.`
                  : `Vade ${aktif.vade}. Ödeme girildiğinde bu ay Ödendi durumuna geçer.`}
            </p>
          </aside>
        </div>

        <div className="dd-cizgi" style={{ margin: "30px 0 26px" }} />

        {/* ── şelale ── */}
        <div
          style={{
            display: "flex",
            gap: 40,
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: "0 1 640px", minWidth: 0 }}>
            <p className="dd-kas">Bedelden kalana</p>
            <h3 className="dd-baslik" style={{ fontSize: 24 }}>
              Ödenen her lira borçtan düşer
            </h3>
            <div style={{ marginTop: 16 }}>
              <KopruGrafik
                toplamBedel={toplamBedel}
                pesinat={hesap.pesinatOdenen}
                taksit={hesap.taksitOdenen}
                kalan={hesap.kalanBorc}
              />
            </div>
          </div>

          <p className="dd-not dd-not-yan" style={{ flex: "1 1 240px", maxWidth: 340 }}>
            Bedelin %{hesap.yuzde.toFixed(1).replace(".", ",")}&apos;i ödendi. Kalan{" "}
            {lira(hesap.kalanBorc)} ₺, {hesap.kalanTaksitSayisi} taksitte{" "}
            {hesap.bitisTarihi} tarihinde sıfırlanır.
          </p>
        </div>
      </section>

      {/* ═══ Tablolar ═══ */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 480px), 1fr))",
          background: "var(--kagit)",
        }}
      >
        <section className="ic" style={{ borderRight: "1px solid var(--cizgi)" }}>
          <h2 className="num" style={{ fontSize: 20, letterSpacing: "0.02em" }}>
            YAPILAN ÖDEMELER
          </h2>
          <table style={{ marginTop: 18 }}>
            <thead>
              <tr>
                <th className="lbl">Tarih</th>
                <th className="lbl">Alıcı</th>
                <th className="lbl sag">Tutar ₺</th>
                <th className="lbl sag">Referans</th>
              </tr>
            </thead>
            <tbody>
              {odemeler.map((o) => (
                <tr key={o.referans}>
                  <td style={{ fontSize: 13, color: "var(--gri-2)" }}>
                    {tarihKisa(o.tarih)}
                  </td>
                  <td>
                    <span style={{ fontSize: 14 }}>{o.alici}</span>
                    <span
                      className="minik"
                      style={{ display: "block", marginTop: 4 }}
                    >
                      {o.banka} · {o.tur === "pesinat" ? "peşinat" : "taksit"}
                    </span>
                  </td>
                  <td className="num sag" style={{ fontSize: 16 }}>
                    {lira(o.tutar)}
                  </td>
                  <td className="sag minik">{o.referans}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td style={{ borderBottom: 0, paddingTop: 15 }} />
                <td
                  className="lbl"
                  style={{ borderBottom: 0, paddingTop: 15, color: GECE }}
                >
                  Toplam
                </td>
                <td
                  className="num sag"
                  style={{
                    borderBottom: 0,
                    paddingTop: 15,
                    fontSize: 19,
                    color: SERI_1,
                  }}
                >
                  {lira(hesap.toplamOdenen)}
                </td>
                <td
                  className="sag minik"
                  style={{ borderBottom: 0, paddingTop: 15 }}
                >
                  {odemeler.length} dekont
                </td>
              </tr>
            </tfoot>
          </table>
          <p
            className="kucuk"
            style={{
              marginTop: 16,
              borderTop: "1px solid var(--cizgi-2)",
              paddingTop: 13,
            }}
          >
            Havale masrafları toplam {liraKurus(hesap.masrafToplami)} ₺ — bedele
            mahsup edilmez, ayrıca ödenmiştir.
          </p>
        </section>

        <section className="ic">
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <h2 className="num" style={{ fontSize: 20, letterSpacing: "0.02em" }}>
              TAKSİT PLANI
            </h2>
            <span className="minik">
              {hesap.taksitler[0].ayUzun} – {hesap.sonAy}
            </span>
          </div>

          <table style={{ marginTop: 18 }}>
            <thead>
              <tr>
                <th className="lbl">#</th>
                <th className="lbl">Vade</th>
                <th className="lbl sag">Kalan bakiye</th>
                <th className="lbl sag">Taksit ₺</th>
                <th className="lbl sag">Durum</th>
              </tr>
            </thead>
            <tbody>
              {hesap.taksitler.map((t) => {
                const n = noktalar[t.sira];
                return (
                  <tr
                    key={t.sira}
                    className={aktifIndex === t.sira ? "vurgulu" : undefined}
                    onMouseEnter={() => setUzerinde(t.sira)}
                    onMouseLeave={() => setUzerinde(null)}
                    style={{ cursor: "crosshair" }}
                  >
                    <td className="minik">{String(t.sira).padStart(2, "0")}</td>
                    <td style={{ fontSize: 13, color: "var(--gri-2)" }}>
                      {t.vade}
                    </td>
                    <td className="num sag minik">{lira(n.bakiye)}</td>
                    <td className="num sag" style={{ fontSize: 14 }}>
                      {liraKurus(t.beklenen)}
                    </td>
                    <td className="lbl sag">{n.durum}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              borderTop: `1px solid ${GECE}`,
              marginTop: 12,
              paddingTop: 14,
            }}
          >
            <span className="lbl" style={{ color: GECE }}>
              Plan toplamı
            </span>
            <span className="num" style={{ fontSize: 19 }}>
              {lira(hesap.planToplami)} ₺
            </span>
          </div>
        </section>
      </div>
    </>
  );
}
