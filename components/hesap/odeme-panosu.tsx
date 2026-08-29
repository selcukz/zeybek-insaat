"use client";

import { useMemo, useState } from "react";
import { lira, liraKurus, tarihKisa, type Hesap, type Odeme } from "@/lib/hesap";
import PastaGrafik from "./pasta-grafik";

type Mod = "bakiye" | "kumulatif" | "aylik";

const SERI_1 = "#1b6fa8";
const SERI_2 = "#5fc2e8";
const GECE = "#051c2c";
const GRI = "#8a98a5";

const MODLAR: { k: Mod; ad: string; alt: string }[] = [
  { k: "bakiye", ad: "Bakiye", alt: "Kalan borcun aylara göre azalışı" },
  { k: "kumulatif", ad: "Kümülatif", alt: "Ödenenin bedele oranı" },
  { k: "aylik", ad: "Aylık", alt: "Ay bazında ödeme tutarları" },
];

// çizim alanı — kompakt
const SOL = 46;
const SAG = 452;
const UST = 12;
const TABAN = 166;

export default function OdemePanosu({
  hesap,
  odemeler,
  toplamBedel,
}: {
  hesap: Hesap;
  odemeler: Odeme[];
  toplamBedel: number;
}) {
  const [mod, setMod] = useState<Mod>("bakiye");
  const [uzerinde, setUzerinde] = useState<number | null>(null);
  const [sabit, setSabit] = useState<number | null>(null);

  const g = useMemo(() => {
    const N = hesap.taksitler.length;

    const noktalar = [
      {
        i: 0,
        kisa: "Ağu 26",
        uzun: "Ağustos 2026",
        vade: tarihKisa(odemeler[odemeler.length - 1].tarih),
        tutar: hesap.toplamOdenen,
        bakiye: hesap.kalanBorc,
        kumulatif: hesap.toplamOdenen,
        gecmis: true,
        tur: "Peşinat",
        durum: "Ödendi",
      },
      ...hesap.taksitler.map((t) => {
        const kum = hesap.toplamOdenen + t.beklenen * t.sira;
        return {
          i: t.sira,
          kisa: t.ayKisa,
          uzun: t.ayUzun,
          vade: t.vade,
          tutar: t.beklenen,
          bakiye: toplamBedel - kum,
          kumulatif: kum,
          gecmis: t.durum === "odendi",
          tur: `Taksit ${t.sira}`,
          durum:
            t.durum === "odendi"
              ? "Ödendi"
              : t.durum === "gecikti"
                ? "Gecikti"
                : t.durum === "kismi"
                  ? "Kısmi"
                  : "Bekliyor",
        };
      }),
    ];

    const adim = (SAG - SOL) / N;
    const x = (i: number) => SOL + i * adim;

    const alanModu = mod !== "aylik";
    const tavan = mod === "aylik" ? hesap.toplamOdenen : toplamBedel;
    const deger = (p: (typeof noktalar)[number]) =>
      mod === "bakiye" ? p.bakiye : mod === "kumulatif" ? p.kumulatif : p.tutar;
    const y = (v: number) => UST + (1 - v / tavan) * (TABAN - UST);

    const izgara = Array.from({ length: 3 }, (_, k) => {
      const dv = tavan * (1 - k / 2);
      return {
        y: y(dv),
        etiket:
          dv === 0 ? "0" : `${(dv / 1_000_000).toFixed(1).replace(".", ",")}M`,
      };
    });

    let gercekCizgi = "";
    let gercekAlan = "";
    let planCizgi = "";
    let planAlan = "";

    if (alanModu) {
      const bas = mod === "bakiye" ? toplamBedel : 0;
      gercekCizgi = `M ${SOL} ${y(bas)} L ${x(0)} ${y(bas)} L ${x(0)} ${y(deger(noktalar[0]))}`;
      gercekAlan = `${gercekCizgi} L ${x(0)} ${TABAN} L ${SOL} ${TABAN} Z`;

      planCizgi = `M ${x(0)} ${y(deger(noktalar[0]))}`;
      for (let k = 1; k <= N; k++) {
        planCizgi += ` L ${x(k)} ${y(deger(noktalar[k - 1]))} L ${x(k)} ${y(deger(noktalar[k]))}`;
      }
      planAlan = `${planCizgi} L ${x(N)} ${TABAN} L ${x(0)} ${TABAN} Z`;
    }

    const barW = Math.max(5, adim * 0.56);
    const barlar = noktalar.map((p) => {
      const yy = y(p.tutar);
      return {
        i: p.i,
        x: x(p.i) - barW / 2,
        y: yy,
        w: barW,
        h: Math.max(2, TABAN - yy),
        renk: p.gecmis ? SERI_1 : SERI_2,
      };
    });

    const eksen = noktalar
      .filter((p) => p.i % 6 === 0)
      .map((p) => ({ x: x(p.i), ad: p.kisa }));

    const aktifIndex = uzerinde ?? sabit;
    const aktif = aktifIndex !== null ? noktalar[aktifIndex] : noktalar[0];

    return {
      adim,
      x,
      y,
      deger,
      noktalar,
      izgara,
      eksen,
      barlar,
      alanModu,
      gercekCizgi,
      gercekAlan,
      planCizgi,
      planAlan,
      aktifIndex,
      aktif,
    };
  }, [mod, uzerinde, sabit, hesap, odemeler, toplamBedel]);

  const altBaslik = MODLAR.find((m) => m.k === mod)!.alt;
  const imlecVar = g.aktifIndex !== null;

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
            <svg
              viewBox="0 0 470 196"
              style={{ width: "100%", height: "auto", display: "block" }}
              onMouseLeave={() => setUzerinde(null)}
              role="img"
              aria-label={altBaslik}
            >
              <defs>
                <pattern
                  id="hesap-tarama"
                  width="6"
                  height="6"
                  patternTransform="rotate(-45)"
                  patternUnits="userSpaceOnUse"
                >
                  <rect width="2" height="6" fill={SERI_2} opacity="0.42" />
                </pattern>
              </defs>

              {g.izgara.map((k) => (
                <g key={k.etiket}>
                  <line
                    x1={SOL}
                    y1={k.y}
                    x2={SAG}
                    y2={k.y}
                    stroke="var(--cizgi-2)"
                    strokeWidth={1}
                  />
                  <text
                    x={SOL - 8}
                    y={k.y + 4}
                    textAnchor="end"
                    fill={GRI}
                    fontSize={11}
                    fontFamily="inherit"
                  >
                    {k.etiket}
                  </text>
                </g>
              ))}

              {g.alanModu ? (
                <>
                  <path d={g.gercekAlan} fill={SERI_1} opacity={0.14} />
                  <path d={g.planAlan} fill="url(#hesap-tarama)" />
                  <path
                    d={g.planCizgi}
                    fill="none"
                    stroke={SERI_2}
                    strokeWidth={2}
                    strokeLinejoin="round"
                  />
                  <path
                    d={g.gercekCizgi}
                    fill="none"
                    stroke={SERI_1}
                    strokeWidth={2}
                    strokeLinejoin="round"
                  />
                </>
              ) : (
                g.barlar.map((b) => (
                  <rect
                    key={b.i}
                    x={b.x}
                    y={b.y}
                    width={b.w}
                    height={b.h}
                    fill={b.renk}
                    rx={2}
                  />
                ))
              )}

              <line
                x1={SOL}
                y1={TABAN}
                x2={SAG}
                y2={TABAN}
                stroke="var(--cizgi)"
                strokeWidth={1}
              />

              {g.eksen.map((e) => (
                <text
                  key={e.ad}
                  x={e.x}
                  y={186}
                  textAnchor="middle"
                  fill={GRI}
                  fontSize={11}
                  fontFamily="inherit"
                >
                  {e.ad}
                </text>
              ))}

              {imlecVar && (
                <g>
                  <line
                    x1={g.x(g.aktif.i)}
                    y1={UST}
                    x2={g.x(g.aktif.i)}
                    y2={TABAN}
                    stroke={GECE}
                    strokeWidth={1}
                    strokeDasharray="3 3"
                  />
                  <circle
                    cx={g.x(g.aktif.i)}
                    cy={g.y(g.deger(g.aktif))}
                    r={4.5}
                    fill="#fff"
                    stroke={g.aktif.gecmis ? SERI_1 : SERI_2}
                    strokeWidth={2.5}
                  />
                </g>
              )}

              {g.noktalar.map((p) => (
                <rect
                  key={p.i}
                  x={g.x(p.i) - g.adim / 2}
                  y={UST}
                  width={g.adim}
                  height={TABAN - UST}
                  fill="transparent"
                  style={{ pointerEvents: "all", cursor: "crosshair" }}
                  onMouseEnter={() => setUzerinde(p.i)}
                  onClick={() => setSabit(sabit === p.i ? null : p.i)}
                />
              ))}
            </svg>

            <div
              style={{
                display: "flex",
                gap: 20,
                marginTop: 10,
                paddingLeft: 46,
                flexWrap: "wrap",
              }}
            >
              <Anahtar renk={SERI_1} ad="Gerçekleşen" />
              <Anahtar tarama ad="Planlanan" />
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
                {imlecVar && uzerinde === null ? "Sabitlendi" : g.aktif.tur}
              </p>
              <p className="num" style={{ fontSize: 20, marginTop: 10 }}>
                {g.aktif.uzun}
              </p>
            </div>

            <div style={{ height: 1, background: "var(--cizgi)" }} />

            {[
              { ad: "Ödeme", d: lira(g.aktif.tutar), c: GECE },
              { ad: "Kalan bakiye", d: lira(g.aktif.bakiye), c: SERI_1 },
              { ad: "Toplam ödenen", d: lira(g.aktif.kumulatif), c: GECE },
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
                stroke={g.aktif.gecmis ? SERI_1 : GRI}
                strokeWidth={1.6}
                strokeLinecap="round"
                aria-hidden="true"
              >
                {g.aktif.gecmis ? (
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
                style={{ fontSize: 14, color: g.aktif.gecmis ? SERI_1 : GRI }}
              >
                {g.aktif.durum}
              </span>
            </div>

            <p className="kucuk" style={{ marginTop: "auto" }}>
              {g.aktif.gecmis
                ? "Peşinatın tamamı üç havaleyle 27 Ağustos 2026 tarihinde tamamlandı."
                : `Vade ${g.aktif.vade}. Ödeme girildiğinde bu ay Ödendi durumuna geçer.`}
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
                const n = g.noktalar[t.sira];
                return (
                  <tr
                    key={t.sira}
                    className={g.aktifIndex === t.sira ? "vurgulu" : undefined}
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

function Anahtar({
  renk,
  tarama,
  ad,
}: {
  renk?: string;
  tarama?: boolean;
  ad: string;
}) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span
        style={{
          width: 16,
          height: 9,
          borderRadius: 2,
          display: "inline-block",
          background: tarama
            ? "repeating-linear-gradient(-45deg, #5fc2e8 0 2px, transparent 2px 6px)"
            : renk,
          border: tarama ? "1px solid #5fc2e8" : undefined,
        }}
      />
      <span className="lbl" style={{ color: "var(--gri-2)" }}>
        {ad}
      </span>
    </span>
  );
}
