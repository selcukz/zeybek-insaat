"use client";

import { useMemo, useState } from "react";
import {
  lira,
  liraKurus,
  senaryoHesapla,
  tarihKisa,
  type Hesap,
  type Odeme,
} from "@/lib/hesap";

type Mod = "bakiye" | "kumulatif" | "aylik";

const SERI_1 = "#1b6fa8";
const SERI_2 = "#5fc2e8";
const SERI_3 = "#8a6bc1";
const GECE = "#051c2c";
const GRI = "#8a98a5";

const MODLAR: { k: Mod; ad: string; alt: string }[] = [
  {
    k: "bakiye",
    ad: "Bakiye",
    alt: "Kalan borcun aylara göre azalışı — 18 taksitte sıfırlanır",
  },
  {
    k: "kumulatif",
    ad: "Kümülatif",
    alt: "Bugüne kadar ödenenin sözleşme bedeline oranı",
  },
  {
    k: "aylik",
    ad: "Aylık",
    alt: "Ay bazında ödeme tutarları — peşinat ve taksitler",
  },
];

// çizim alanı
const SOL = 70;
const SAG = 880;
const UST = 20;
const TABAN = 284;

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
  const [ekstra, setEkstra] = useState(0);

  const senaryo = useMemo(
    () => senaryoHesapla(hesap, ekstra),
    [hesap, ekstra],
  );

  const g = useMemo(() => {
    const N = hesap.taksitler.length;

    // 0 = bugün (peşinat sonrası), 1..N = taksitler
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

    const izgara = Array.from({ length: 5 }, (_, k) => {
      const dv = tavan * (1 - k / 4);
      return {
        y: y(dv),
        etiket:
          dv === 0
            ? "0"
            : dv >= 1_000_000
              ? `${(dv / 1_000_000).toFixed(1).replace(".", ",")}M`
              : `${lira(dv / 1000)}B`,
      };
    });

    // gerçekleşen + planlanan yollar
    let gercekCizgi = "";
    let gercekAlan = "";
    let planCizgi = "";
    let planAlan = "";
    let senaryoCizgi = "";

    if (alanModu) {
      const bas = mod === "bakiye" ? toplamBedel : 0;
      gercekCizgi = `M ${SOL} ${y(bas)} L ${x(0)} ${y(bas)} L ${x(0)} ${y(deger(noktalar[0]))}`;
      gercekAlan = `${gercekCizgi} L ${x(0)} ${TABAN} L ${SOL} ${TABAN} Z`;

      planCizgi = `M ${x(0)} ${y(deger(noktalar[0]))}`;
      for (let k = 1; k <= N; k++) {
        planCizgi += ` L ${x(k)} ${y(deger(noktalar[k - 1]))} L ${x(k)} ${y(deger(noktalar[k]))}`;
      }
      planAlan = `${planCizgi} L ${x(N)} ${TABAN} L ${x(0)} ${TABAN} Z`;

      // senaryo yalnızca bakiye görünümünde ve fazla ödeme varken
      if (mod === "bakiye" && ekstra > 0) {
        senaryoCizgi = `M ${x(0)} ${y(senaryo.egri[0])}`;
        for (let k = 1; k <= N; k++) {
          senaryoCizgi += ` L ${x(k)} ${y(senaryo.egri[k - 1])} L ${x(k)} ${y(senaryo.egri[k])}`;
        }
      }
    }

    const barW = Math.max(8, adim * 0.56);
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
      .filter((p) => p.i % 3 === 0)
      .map((p) => ({ x: x(p.i), ad: p.kisa }));

    const aktifIndex = uzerinde ?? sabit;
    const aktif = aktifIndex !== null ? noktalar[aktifIndex] : noktalar[0];

    return {
      N,
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
      senaryoCizgi,
      aktifIndex,
      aktif,
      // senaryonun sıfıra değdiği nokta
      senaryoBitisX: x(senaryo.ayAdedi),
    };
  }, [mod, uzerinde, sabit, ekstra, hesap, odemeler, toplamBedel, senaryo]);

  const altBaslik = MODLAR.find((m) => m.k === mod)!.alt;
  const imlecVar = g.aktifIndex !== null;

  return (
    <>
      {/* ═══ Ölçü şeridi ═══ */}
      <div className="kart olculer">
        <div className="olcu an" style={{ animationDelay: "80ms" }}>
          <p className="lbl">Kalan borç</p>
          <p className="num olcu-deger">{lira(hesap.kalanBorc)}</p>
          <p style={{ fontSize: 11, marginTop: 9, color: "var(--gri-2)" }}>
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
              marginTop: 12,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div className="oran" style={{ flexGrow: 1 }}>
              <div className="oran-dolu" style={{ width: `${hesap.yuzde}%` }} />
              <div className="oran-plan" style={{ left: `${hesap.yuzde}%` }} />
            </div>
            <span className="num" style={{ fontSize: 11, color: SERI_1 }}>
              %{hesap.yuzde.toFixed(1).replace(".", ",")}
            </span>
          </div>
        </div>

        <div className="olcu an" style={{ animationDelay: "200ms" }}>
          <p className="lbl">Aylık taksit</p>
          <p className="num olcu-deger">{lira(hesap.aylikTaksit)}</p>
          <p style={{ fontSize: 11, marginTop: 9, color: "var(--gri-2)" }}>
            ₺ · {hesap.kalanTaksitSayisi} taksit kaldı
          </p>
        </div>

        <div className="olcu an" style={{ animationDelay: "260ms" }}>
          <p className="lbl">Son vade</p>
          <p className="num olcu-deger">{hesap.bitisTarihi}</p>
          <p style={{ fontSize: 11, marginTop: 9, color: "var(--gri-2)" }}>
            {lira(hesap.kalanGun)} gün kaldı
          </p>
        </div>
      </div>

      {/* ═══ Grafik ═══ */}
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
            <h2 className="num" style={{ fontSize: 19, letterSpacing: "0.02em" }}>
              ÖDEME PROFİLİ
            </h2>
            <p style={{ fontSize: 11, color: "var(--gri-2)", marginTop: 7 }}>
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
            gap: 24,
            marginTop: 20,
            alignItems: "stretch",
            flexWrap: "wrap",
          }}
        >
          <svg
            viewBox="0 0 900 340"
            style={{ flexGrow: 1, minWidth: 380, height: "auto" }}
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
                  x={SOL - 10}
                  y={k.y + 3}
                  textAnchor="end"
                  fill={GRI}
                  fontSize={10}
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
                {g.senaryoCizgi && (
                  <>
                    <path
                      d={g.senaryoCizgi}
                      fill="none"
                      stroke={SERI_3}
                      strokeWidth={2.5}
                      strokeDasharray="6 4"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx={g.senaryoBitisX}
                      cy={g.y(0)}
                      r={5}
                      fill="#fff"
                      stroke={SERI_3}
                      strokeWidth={2.5}
                    />
                    <text
                      x={g.senaryoBitisX}
                      y={g.y(0) - 14}
                      textAnchor="middle"
                      fill={SERI_3}
                      fontSize={10}
                      fontWeight={700}
                      fontFamily="inherit"
                    >
                      {senaryo.bitisAyKisa}
                    </text>
                  </>
                )}
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
                  rx={3}
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
                y={304}
                textAnchor="middle"
                fill={GRI}
                fontSize={10}
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
                  r={5}
                  fill="#fff"
                  stroke={g.aktif.gecmis ? SERI_1 : SERI_2}
                  strokeWidth={2.5}
                />
              </g>
            )}

            {/* fare/dokunma yakalayıcılar */}
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

          {/* okuma paneli */}
          <div
            style={{
              width: 260,
              flexShrink: 0,
              border: "1px solid var(--cizgi)",
              background: "var(--panel)",
              padding: 20,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div>
              <p className="lbl">
                {imlecVar && uzerinde === null ? "Sabitlendi" : g.aktif.tur}
              </p>
              <p className="num" style={{ fontSize: 21, marginTop: 11 }}>
                {g.aktif.uzun}
              </p>
            </div>

            <div style={{ height: 1, background: "var(--cizgi)" }} />

            {[
              { ad: "Ödeme", d: lira(g.aktif.tutar), c: GECE },
              { ad: "Kalan bakiye", d: lira(g.aktif.bakiye), c: SERI_1 },
              { ad: "Toplam ödenen", d: lira(g.aktif.kumulatif), c: GECE },
              {
                ad: "Tamamlanan",
                d: `%${((g.aktif.kumulatif / toplamBedel) * 100).toFixed(1).replace(".", ",")}`,
                c: GRI,
              },
            ].map((s) => (
              <div
                key={s.ad}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  gap: 12,
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
                width="16"
                height="16"
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
                style={{ fontSize: 13, color: g.aktif.gecmis ? SERI_1 : GRI }}
              >
                {g.aktif.durum}
              </span>
            </div>

            <p
              style={{
                fontSize: 11,
                lineHeight: 1.55,
                color: GRI,
                marginTop: "auto",
              }}
            >
              {g.aktif.gecmis
                ? "Peşinatın tamamı üç havaleyle 27 Ağustos 2026 tarihinde tamamlandı."
                : `Vade ${g.aktif.vade}. Ödeme girildiğinde bu ay Ödendi durumuna geçer.`}
            </p>
          </div>
        </div>

        {/* gösterge */}
        <div
          style={{
            display: "flex",
            gap: 22,
            marginTop: 16,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Anahtar renk={SERI_1} ad="Gerçekleşen" />
          <Anahtar tarama ad="Planlanan" />
          {ekstra > 0 && mod === "bakiye" && (
            <Anahtar renk={SERI_3} kesikli ad="Erken ödeme senaryosu" />
          )}
          <span style={{ fontSize: 11, color: GRI }}>
            Grafiğin üzerinde gezinin — sağdaki panel o aya geçer. Tıklayınca
            sabitlenir.
          </span>
        </div>
      </section>

      {/* ═══ Erken ödeme senaryosu ═══ */}
      <section className="kart ic">
        <div
          style={{
            display: "flex",
            gap: 32,
            flexWrap: "wrap",
            alignItems: "flex-start",
          }}
        >
          <div style={{ flexGrow: 1, minWidth: 320 }}>
            <h2 className="num" style={{ fontSize: 19, letterSpacing: "0.02em" }}>
              ERKEN ÖDEME SENARYOSU
            </h2>
            <p style={{ fontSize: 11, color: "var(--gri-2)", marginTop: 7 }}>
              Sözleşme faizsiz ve endekssiz — her fazla ödeme doğrudan süreyi
              kısaltır.
            </p>

            <label
              htmlFor="ekstra"
              className="lbl"
              style={{ display: "block", marginTop: 24 }}
            >
              Aylık fazla ödeme
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginTop: 10,
              }}
            >
              <input
                id="ekstra"
                className="surgu"
                type="range"
                min={0}
                max={1_500_000}
                step={25_000}
                value={ekstra}
                onChange={(e) => setEkstra(Number(e.target.value))}
                style={{ flexGrow: 1 }}
                aria-describedby="senaryo-ozet"
              />
              <span
                className="num"
                style={{
                  fontSize: 19,
                  color: SERI_3,
                  width: 130,
                  textAlign: "right",
                }}
              >
                +{lira(ekstra)} ₺
              </span>
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                marginTop: 14,
                flexWrap: "wrap",
              }}
            >
              {[0, 100_000, 250_000, 500_000, 1_000_000].map((v) => (
                <button
                  key={v}
                  type="button"
                  className="sekme"
                  aria-pressed={ekstra === v}
                  onClick={() => setEkstra(v)}
                  style={{ border: "1px solid var(--cizgi)", padding: "0 14px" }}
                >
                  {v === 0 ? "Plan" : `+${lira(v / 1000)}B`}
                </button>
              ))}
            </div>
          </div>

          <div
            id="senaryo-ozet"
            aria-live="polite"
            style={{
              width: 380,
              flexShrink: 0,
              border: `1px solid ${ekstra > 0 ? SERI_3 : "var(--cizgi)"}`,
              background: "var(--panel)",
              padding: 20,
            }}
          >
            {ekstra === 0 ? (
              <p style={{ fontSize: 12, lineHeight: 1.6, color: "var(--gri-2)" }}>
                Sürgüyü kaydırın: aylık taksitin üstüne koyacağınız her tutar,
                borcun kapanma tarihini öne çeker. Kesikli mor çizgi yeni eğriyi
                gösterir.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <Satir
                  ad="Yeni aylık ödeme"
                  deger={`${lira(senaryo.aylik)} ₺`}
                  renk={GECE}
                />
                <Satir
                  ad="Borç kapanışı"
                  deger={senaryo.bitisAyUzun}
                  renk={SERI_3}
                  buyuk
                />
                <Satir
                  ad="Kazanılan süre"
                  deger={
                    senaryo.kazanilanAy > 0
                      ? `${senaryo.kazanilanAy} ay erken`
                      : "değişmez"
                  }
                  renk={senaryo.kazanilanAy > 0 ? SERI_3 : GRI}
                />
                <Satir
                  ad="Taksit sayısı"
                  deger={`${senaryo.ayAdedi} ay`}
                  renk={GECE}
                />
                <div style={{ height: 1, background: "var(--cizgi)" }} />
                <p style={{ fontSize: 11, lineHeight: 1.55, color: GRI }}>
                  Son ay {lira(senaryo.sonOdeme)} ₺ ödenerek borç kapanır.
                  Toplam ödenecek tutar değişmez ({lira(hesap.kalanBorc)} ₺) —
                  yalnızca süre kısalır.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══ Tablolar ═══ */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 460px), 1fr))",
          background: "var(--kagit)",
        }}
      >
        <section className="ic" style={{ borderRight: "1px solid var(--cizgi)" }}>
          <h2 className="num" style={{ fontSize: 19, letterSpacing: "0.02em" }}>
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
                  <td style={{ fontSize: 12, color: "var(--gri-2)" }}>
                    {tarihKisa(o.tarih)}
                  </td>
                  <td>
                    <span style={{ fontSize: 13 }}>{o.alici}</span>
                    <span
                      style={{
                        display: "block",
                        fontSize: 10,
                        color: GRI,
                        marginTop: 3,
                      }}
                    >
                      {o.banka} · {o.tur === "pesinat" ? "peşinat" : "taksit"}
                    </span>
                  </td>
                  <td className="num sag" style={{ fontSize: 15 }}>
                    {lira(o.tutar)}
                  </td>
                  <td className="sag" style={{ fontSize: 10, color: GRI }}>
                    {o.referans}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td style={{ borderBottom: 0, paddingTop: 15 }} />
                <td
                  className="lbl"
                  style={{
                    borderBottom: 0,
                    paddingTop: 15,
                    color: GECE,
                  }}
                >
                  Toplam
                </td>
                <td
                  className="num sag"
                  style={{ borderBottom: 0, paddingTop: 15, fontSize: 18, color: SERI_1 }}
                >
                  {lira(hesap.toplamOdenen)}
                </td>
                <td
                  className="sag"
                  style={{ borderBottom: 0, paddingTop: 15, fontSize: 10, color: GRI }}
                >
                  {odemeler.length} dekont
                </td>
              </tr>
            </tfoot>
          </table>
          <p
            style={{
              fontSize: 11,
              color: GRI,
              marginTop: 16,
              borderTop: "1px solid var(--cizgi-2)",
              paddingTop: 13,
              lineHeight: 1.5,
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
            <h2 className="num" style={{ fontSize: 19, letterSpacing: "0.02em" }}>
              TAKSİT PLANI
            </h2>
            <span style={{ fontSize: 11, color: GRI }}>
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
                    <td style={{ fontSize: 11, color: GRI }}>
                      {String(t.sira).padStart(2, "0")}
                    </td>
                    <td style={{ fontSize: 11, color: "var(--gri-2)" }}>
                      {t.vade}
                    </td>
                    <td className="num sag" style={{ fontSize: 11, color: GRI }}>
                      {lira(n.bakiye)}
                    </td>
                    <td className="num sag" style={{ fontSize: 12 }}>
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
            <span className="num" style={{ fontSize: 18 }}>
              {lira(hesap.planToplami)} ₺
            </span>
          </div>
        </section>
      </div>
    </>
  );
}

function Satir({
  ad,
  deger,
  renk,
  buyuk,
}: {
  ad: string;
  deger: string;
  renk: string;
  buyuk?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <span className="lbl" style={{ color: "var(--gri-2)" }}>
        {ad}
      </span>
      <span className="num" style={{ fontSize: buyuk ? 22 : 15, color: renk }}>
        {deger}
      </span>
    </div>
  );
}

function Anahtar({
  renk,
  tarama,
  kesikli,
  ad,
}: {
  renk?: string;
  tarama?: boolean;
  kesikli?: boolean;
  ad: string;
}) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span
        style={{
          width: 16,
          height: 8,
          borderRadius: 2,
          display: "inline-block",
          background: kesikli
            ? `repeating-linear-gradient(90deg, ${renk} 0 5px, transparent 5px 8px)`
            : tarama
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
