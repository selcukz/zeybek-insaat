"use client";

import { useRef } from "react";
import { sonGercekIndex, type GrafikNoktasi } from "@/lib/hesap";
import { P, CIZGI_OLCEK, rnd } from "./lieflat";

/**
 * Ödeme profili — Lieflat Charts "basics" dilinde, elle yazılmış SVG.
 *
 * Üç görünüm, katalogdaki üç figüre karşılık gelir:
 *   Bakiye    → F3 Hairline Area  · bir tüy çizgi = bir ay, tabandan tepeye
 *   Kümülatif → F2 Hairline Line  · bir nokta = bir ay, içi boş = planlanan
 *   Aylık     → F1 Rung Bars      · bir çentik = 100.000 ₺, sayılabilir
 *
 * Skill'in sözleşmesi: uzaktan bakınca temel grafik siluetini tanı,
 * yakından bakınca her birimi tek tek say. Dolgu bir renk bloğu değil,
 * ayların kendisi. Eksen kırpılmaz — çubuğun sözleşmesi uzunluk ∝ değer.
 *
 * ECharts kaldırıldı: bu üç figür de saf SVG, dolayısıyla ~182 KB'lık
 * çizim motoru artık gerekmiyor.
 *
 * Renkler `lieflat.ts` içindeki porcelain rollerinden gelir; hangi ayın
 * seçili olduğu React tarafında durur, çünkü aynı seçim yandaki okuma
 * panelini ve taksit tablosunu da sürer.
 */

export type Mod = "bakiye" | "kumulatif" | "aylik";

const YAZI =
  'Consolas, "Cascadia Mono", Menlo, "DejaVu Sans Mono", monospace';

/* ── Yerleşim (viewBox birimleri) ─────────────────────────────── */
const W = 470;
const H = 210;
const SOL = 46;
const SAG = 458;
const TEPE = 16;
const TABAN = 162;
const AY_Y = 181; /* ay etiketleri   */
const BIRIM_Y = 201; /* birim satırı    */

/** Aylık görünümde bir çentiğin değeri. */
const CENTIK = 100_000;

const TUY = 0.55 * CIZGI_OLCEK; /* tüy çizgi  ≈ 1,0 */
const KONTUR = 1.2 * CIZGI_OLCEK; /* tepe hattı ≈ 2,2 */

const milyon = (v: number) =>
  v === 0 ? "0" : `${(v / 1_000_000).toFixed(1).replace(".", ",")}M`;

export default function ZamanGrafik({
  noktalar,
  mod,
  aktif,
  toplamBedel,
  aciklama,
  onGezin,
  onSec,
}: {
  noktalar: GrafikNoktasi[];
  mod: Mod;
  aktif: number | null;
  toplamBedel: number;
  aciklama: string;
  onGezin: (i: number | null) => void;
  onSec: (i: number) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);

  const n = noktalar.length;
  const alanModu = mod !== "aylik";

  /* Seri modlarında noktalar kenarlara oturur; çubuk modunda her ay
     kendi şeridinin ortasına çekilir, yoksa ilk çubuk y eksenine biner. */
  const adim = alanModu ? (SAG - SOL) / (n - 1) : (SAG - SOL) / n;
  const x = (i: number) => (alanModu ? SOL + i * adim : SOL + (i + 0.5) * adim);

  const deger = (p: GrafikNoktasi) =>
    mod === "bakiye" ? p.bakiye : mod === "kumulatif" ? p.kumulatif : p.tutar;

  const tavan = alanModu
    ? toplamBedel
    : Math.max(...noktalar.map((p) => p.tutar));
  const y = (v: number) => TABAN - (v / tavan) * (TABAN - TEPE);

  const sonGercek = sonGercekIndex(noktalar);

  /* ── Fare → kategori indeksi ─────────────────────────────────
     SVG ölçeklendiği için istemci koordinatı viewBox'a çevrilir. */
  const indeksBul = (clientX: number) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const kutu = svg.getBoundingClientRect();
    if (kutu.width === 0) return null;
    const vx = ((clientX - kutu.left) / kutu.width) * W;
    const i = alanModu
      ? Math.round((vx - SOL) / adim)
      : Math.floor((vx - SOL) / adim);
    return i >= 0 && i < n ? i : null;
  };

  /* ── Y ekseni: 0 · yarı · tavan ──────────────────────────────── */
  const izgara = [0, tavan / 2, tavan];

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={aciklama}
      style={{
        width: "100%",
        height: "auto",
        display: "block",
        cursor: "crosshair",
        fontFamily: YAZI,
      }}
      onMouseMove={(e) => onGezin(indeksBul(e.clientX))}
      onMouseLeave={() => onGezin(null)}
      onClick={(e) => {
        const i = indeksBul(e.clientX);
        if (i !== null) onSec(i);
      }}
    >
      {/* ── ızgara + y etiketleri ── */}
      {izgara.map((v) => (
        <g key={`iz-${v}`}>
          <line
            x1={SOL}
            y1={y(v)}
            x2={SAG}
            y2={y(v)}
            stroke={P.GRID}
            strokeWidth={0.8}
          />
          <text
            x={SOL - 8}
            y={y(v) + 3.5}
            fontSize={9.5}
            fontWeight={600}
            fill={P.LAB}
            textAnchor="end"
          >
            {milyon(v)}
          </text>
        </g>
      ))}

      {/* ══ Bakiye · F3 Hairline Area ══
          Dolgu renk bloğu değil: her ay tabandan kendi değerine kadar
          bir tüy çizgi. Alan, ayların kendisinden oluşur. */}
      {mod === "bakiye" && (
        <>
          {noktalar.map((p) => (
            <line
              key={`tuy-${p.i}`}
              x1={x(p.i)}
              y1={TABAN}
              x2={x(p.i)}
              y2={y(p.bakiye)}
              stroke={p.gecmis ? P.DATA : P.DATA2}
              strokeWidth={p.i === aktif ? KONTUR : TUY}
              opacity={0.85 + rnd(p.i + 1, 7) * 0.15}
            />
          ))}
          <path
            d={
              "M" + noktalar.map((p) => `${x(p.i)} ${y(p.bakiye)}`).join(" L ")
            }
            fill="none"
            stroke={P.HERO}
            strokeWidth={KONTUR}
            strokeLinejoin="round"
          />
        </>
      )}

      {/* ══ Kümülatif · F2 Hairline Line ══
          Takvim tabanı: ay olsun olmasın her ay için bir tırnak.
          Nokta dolu = gerçekleşen, içi boş = planlanan. */}
      {mod === "kumulatif" && (
        <>
          {noktalar.map((p) => (
            <line
              key={`trn-${p.i}`}
              x1={x(p.i)}
              y1={TABAN}
              x2={x(p.i)}
              y2={TABAN - 7}
              stroke={P.QUIET}
              strokeWidth={0.6 * CIZGI_OLCEK}
            />
          ))}
          <path
            d={
              "M" +
              noktalar.map((p) => `${x(p.i)} ${y(p.kumulatif)}`).join(" L ")
            }
            fill="none"
            stroke={P.HERO}
            strokeWidth={KONTUR}
            strokeLinejoin="round"
          />
          {noktalar.map((p) => (
            <circle
              key={`nk-${p.i}`}
              cx={x(p.i)}
              cy={y(p.kumulatif)}
              r={p.i === aktif ? 4.2 : 2.4}
              fill={p.gecmis ? P.DATA : P.HALO}
              stroke={p.gecmis ? P.DATA : P.DATA2}
              strokeWidth={p.gecmis ? 0 : 1.4}
            />
          ))}
        </>
      )}

      {/* ══ Aylık · F1 Rung Bars ══
          Çubuk gövdesi bir dizi yatay çentik; 1 çentik = 100.000 ₺.
          Uzaktan çubuk silueti, yakından sayılabilir birimler. */}
      {mod === "aylik" && (
        <RungBars noktalar={noktalar} aktif={aktif} x={x} tavan={tavan} />
      )}

      {/* ── imleç: kesik çizgi + beyaz okuma noktası ── */}
      {aktif !== null && (
        <>
          <line
            x1={x(aktif)}
            y1={TEPE}
            x2={x(aktif)}
            y2={TABAN}
            stroke={P.TXT}
            strokeWidth={1}
            strokeDasharray="3 3"
          />
          <circle
            cx={x(aktif)}
            cy={y(deger(noktalar[aktif]))}
            r={4.5}
            fill={P.HALO}
            stroke={noktalar[aktif].gecmis ? P.DATA : P.DATA2}
            strokeWidth={2.5}
          />
        </>
      )}

      {/* ── taban çizgisi ── */}
      <line
        x1={SOL}
        y1={TABAN}
        x2={SAG}
        y2={TABAN}
        stroke={P.FLOOR}
        strokeWidth={0.8 * CIZGI_OLCEK}
      />

      {/* ── ay etiketleri (her altıncı) ── */}
      {noktalar.map((p) =>
        p.i % 6 === 0 ? (
          <text
            key={`ay-${p.i}`}
            x={x(p.i)}
            y={AY_Y}
            fontSize={9.5}
            fontWeight={600}
            fill={P.LAB}
            /* Son etiket ortalanırsa viewBox'ın sağ kenarından taşar. */
            textAnchor={p.i === n - 1 ? "end" : "middle"}
            letterSpacing=".08em"
          >
            {p.kisa}
          </text>
        ) : null,
      )}

      {/* ── birim satırı: figürün sözleşmesini yazıyla söyler ── */}
      <text
        x={W / 2}
        y={BIRIM_Y}
        fontSize={7.5}
        fontWeight={600}
        fill={P.FAINT}
        textAnchor="middle"
        letterSpacing=".12em"
      >
        {mod === "bakiye"
          ? "BİR TÜY ÇİZGİ = BİR AY · TEPE HAT KALAN BAKİYE"
          : mod === "kumulatif"
            ? "BİR NOKTA = BİR AY · İÇİ BOŞ = PLANLANAN"
            : `BİR ÇENTİK = ${CENTIK.toLocaleString("tr-TR")} ₺ · NOKTA HER BEŞİNCİDE`}
      </text>

      {/* Plan eğrisinin başladığı ay — gerçekleşen/planlanan sınırı. */}
      {alanModu && sonGercek < n - 1 && (
        <line
          x1={x(sonGercek)}
          y1={TEPE}
          x2={x(sonGercek)}
          y2={TABAN}
          stroke={P.FAINT}
          strokeWidth={0.7}
          strokeDasharray="1 3"
        />
      )}
    </svg>
  );
}

/**
 * F1 Rung Bars — çubuk, bir dizi yatay çentikten kurulur.
 * Çentik uzunluğu ve opaklığı belirlenimci `rnd` ile hafifçe titrer;
 * her beşinci çentiğin sağına bir sayaç noktası konur.
 */
function RungBars({
  noktalar,
  aktif,
  x,
  tavan,
}: {
  noktalar: GrafikNoktasi[];
  aktif: number | null;
  x: (i: number) => number;
  tavan: number;
}) {
  const enCok = Math.max(1, Math.round(tavan / CENTIK));
  const basamak = (TABAN - TEPE) / enCok;
  const yariGenislik = 6.5;

  return (
    <>
      {noktalar.map((p) => {
        const adet = Math.max(1, Math.round(p.tutar / CENTIK));
        const renk = p.gecmis ? P.DATA : P.DATA2;
        const vurgulu = p.i === aktif;

        return (
          <g key={`rb-${p.i}`}>
            {Array.from({ length: adet }, (_, k) => {
              const yy = TABAN - k * basamak - basamak / 2;
              const g = yariGenislik - 1.5 + rnd(k + 1, p.i + 2) * 3;
              return (
                <g key={k}>
                  <line
                    x1={x(p.i) - g}
                    y1={yy}
                    x2={x(p.i) + g}
                    y2={yy}
                    stroke={renk}
                    strokeWidth={vurgulu ? 1.6 : 1.1}
                    opacity={0.85 + rnd(k + 2, p.i + 4) * 0.15}
                  />
                  {k % 5 === 4 && (
                    <circle
                      cx={x(p.i) + yariGenislik + 3}
                      cy={yy}
                      r={0.8}
                      fill={P.FAINT}
                    />
                  )}
                </g>
              );
            })}
            {/* Etiket, tutarın kendisi değil çentik sayısıdır: birim
                satırı "1 çentik = 100.000 ₺" dediği için sayı doğrudan
                okunur ve dar şeride sığar. Kuruşu yandaki panel verir. */}
            {(p.i === 0 || vurgulu) && (
              <text
                x={x(p.i)}
                y={TABAN - adet * basamak - 6}
                fontSize={9}
                fontWeight={800}
                fill={P.TXT}
                textAnchor="middle"
                style={{
                  paintOrder: "stroke",
                  stroke: P.HALO,
                  strokeWidth: 3,
                }}
              >
                {adet}
              </text>
            )}
          </g>
        );
      })}
    </>
  );
}
