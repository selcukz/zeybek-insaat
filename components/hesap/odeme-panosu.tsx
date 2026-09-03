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
import PastaGrafik from "./pasta-grafik";
import ZamanGrafik, { type Mod } from "./zaman-grafik";

const SERI_1 = "#1b6fa8";
const GECE = "#051c2c";
const GRI = "#8a98a5";

/** Sekmeler yalnız çizgiyi değiştirir; kolonlar iki görünümde de aynı. */
const MODLAR: { k: Mod; ad: string; alt: string }[] = [
  {
    k: "kumulatif",
    ad: "Kümülatif",
    alt: "Kolonlar 18 taksit · çizgi bedele tırmanan toplam (peşinat dahil)",
  },
  {
    k: "bakiye",
    ad: "Bakiye",
    alt: "Kolonlar 18 taksit · çizgi kalan borcun aylara göre azalışı",
  },
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

  const altBaslik = MODLAR.find((m) => m.k === mod)!.alt;

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

      {/* ═══ Grafikler ═══ */}
      <section className="kart ic">
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2 className="num" style={{ fontSize: 20, letterSpacing: "0.02em" }}>
              ÖDEME PROFİLİ
            </h2>
            <p className="kucuk" style={{ marginTop: 8 }}>
              {altBaslik}
            </p>
          </div>

          <div className="sekmeler" role="group" aria-label="Grafik görünümü">
            {MODLAR.map((m) => (
              <button
                key={m.k}
                type="button"
                className="sekme"
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
            marginTop: 20,
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          {/* ── zaman grafiği ── */}
          <div style={{ flex: "1 1 380px", minWidth: 340, maxWidth: 560 }}>
            <ZamanGrafik
              noktalar={noktalar}
              mod={mod}
              aktif={aktifIndex}
              toplamBedel={toplamBedel}
              aciklama={altBaslik}
              onGezin={setUzerinde}
              onSec={(i) => setSabit(sabit === i ? null : i)}
            />

            <div
              style={{
                display: "flex",
                gap: 20,
                marginTop: 10,
                paddingLeft: 46,
                flexWrap: "wrap",
              }}
            >
              <Anahtar renk={SERI_1} ad="Ödenen" />
              <Anahtar bos ad="Beklenen" />
              <Anahtar cizgi ad={mod === "kumulatif" ? "Kümülatif" : "Kalan bakiye"} />
            </div>
            <p className="minik" style={{ marginTop: 10, paddingLeft: 46 }}>
              Üzerinde gezinin — panel o aya geçer. Tıklayınca sabitlenir.
            </p>
          </div>

          {/* ── dağılım pastası ── */}
          <PastaGrafik
            pesinat={hesap.pesinatOdenen}
            taksit={hesap.taksitOdenen}
            kalan={hesap.kalanBorc}
            toplam={toplamBedel}
          />

          {/* ── okuma paneli ── */}
          <div
            style={{
              width: 250,
              flexShrink: 0,
              border: "1px solid var(--cizgi)",
              background: "var(--panel)",
              padding: 18,
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div>
              <p className="lbl">
                {imlecVar && uzerinde === null ? "Sabitlendi" : aktif.tur}
              </p>
              <p className="num" style={{ fontSize: 20, marginTop: 10 }}>
                {aktif.uzun}
              </p>
            </div>

            <div style={{ height: 1, background: "var(--cizgi)" }} />

            {[
              { ad: "Beklenen", d: lira(aktif.beklenen), c: GECE },
              {
                ad: "Ödenen",
                d: lira(aktif.odenen),
                c: aktif.odenen > 0 ? SERI_1 : GRI,
              },
              { ad: "Kalan bakiye", d: lira(aktif.bakiye), c: SERI_1 },
              { ad: "Kümülatif", d: lira(aktif.kumulatif), c: GECE },
            ].map((s) => (
              <div
                key={s.ad}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <span className="lbl" style={{ color: "var(--gri-2)" }}>
                  {s.ad}
                </span>
                <span className="num" style={{ fontSize: 15, color: s.c }}>
                  {s.d}
                </span>
              </div>
            ))}

            <div style={{ height: 1, background: "var(--cizgi)" }} />

            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <svg
                width="17"
                height="17"
                viewBox="0 0 16 16"
                fill="none"
                stroke={aktif.gecmis ? SERI_1 : GRI}
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
              <span
                className="num"
                style={{ fontSize: 14, color: aktif.gecmis ? SERI_1 : GRI }}
              >
                {aktif.durum}
              </span>
            </div>

            <p className="kucuk" style={{ marginTop: "auto" }}>
              {aktif.i === 0
                ? hesap.pesinatTamam
                  ? `Peşinatın tamamı ${sayiAdi(hesap.pesinatAdedi)} havaleyle ${hesap.pesinatSonTarih} tarihinde tamamlandı.`
                  : `Peşinat ${sayiAdi(hesap.pesinatAdedi)} havaleyle kısmen ödendi; son havale ${hesap.pesinatSonTarih}.`
                : aktif.gecmis
                  ? `Taksit ${aktif.i} ödendi. Vade ${aktif.vade}.`
                  : `Vade ${aktif.vade}. Ödeme girildiğinde bu ay Ödendi durumuna geçer.`}
            </p>
          </div>
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
                      {lira(t.beklenen)}
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

/**
 * Dolu kutu = ödenen. İçi boş kesik çizgili kutu = beklenen.
 * İnce çubuk = sağ eksendeki kümülatif çizgi.
 */
function Anahtar({
  renk,
  bos,
  cizgi,
  ad,
}: {
  renk?: string;
  bos?: boolean;
  cizgi?: boolean;
  ad: string;
}) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span
        style={{
          width: 16,
          height: cizgi ? 2 : 9,
          borderRadius: 2,
          display: "inline-block",
          background: cizgi ? SERI_1 : bos ? "#f0f7fb" : renk,
          border: bos ? "1px solid #5fc2e8" : undefined,
        }}
      />
      <span className="lbl" style={{ color: "var(--gri-2)" }}>
        {ad}
      </span>
    </span>
  );
}
