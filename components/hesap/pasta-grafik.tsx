"use client";

import { useState } from "react";
import { lira } from "@/lib/hesap";

/* Eliptik izdüşüm — yükseklik/genişlik oranı bakış açısını verir */
const CX = 148;
const CY = 104;
const RX = 96;
const RY = 40;
const DERINLIK = 26;

const D2R = Math.PI / 180;

type Dilim = {
  ad: string;
  tutar: number;
  renk: string;
  tarama?: boolean;
};

/** Gövde duvarı için yüzey renginin koyu tonu. */
function koyult(hex: string, k: number) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * k);
  const g = Math.round(((n >> 8) & 255) * k);
  const b = Math.round((n & 255) * k);
  return `rgb(${r} ${g} ${b})`;
}

const nokta = (a: number, olcek = 1) => ({
  x: CX + RX * olcek * Math.cos(a * D2R),
  y: CY + RY * olcek * Math.sin(a * D2R),
});

/**
 * Ödemenin bileşimi: peşinat, ödenen taksitler ve kalan borç.
 * Taksit ödendikçe orta dilim büyür — bugün sıfır olduğu için gizlidir.
 *
 * Not: 3B pasta, alan algısını eğdiği için dilimler ayrıca yüzde ve
 * tutar olarak doğrudan etiketlenir; okuma renge veya açıya bırakılmaz.
 */
export default function PastaGrafik({
  pesinat,
  taksit,
  kalan,
  toplam,
}: {
  pesinat: number;
  taksit: number;
  kalan: number;
  toplam: number;
}) {
  const [vurgu, setVurgu] = useState<number | null>(null);

  const dilimler: Dilim[] = [
    { ad: "Peşinat", tutar: pesinat, renk: "#1b6fa8" },
    ...(taksit > 0
      ? [{ ad: "Ödenen taksitler", tutar: taksit, renk: "#8a6bc1" }]
      : []),
    { ad: "Kalan borç", tutar: kalan, renk: "#5fc2e8", tarama: true },
  ];

  // -90° tepe noktası; saat yönünde ilerler
  let aci = -90;
  const parcalar = dilimler.map((d, i) => {
    const yay = (d.tutar / toplam) * 360;
    const a0 = aci;
    const a1 = aci + yay;
    aci = a1;

    const p0 = nokta(a0);
    const p1 = nokta(a1);
    const buyukYay = yay > 180 ? 1 : 0;

    const ust = `M ${CX} ${CY} L ${p0.x} ${p0.y} A ${RX} ${RY} 0 ${buyukYay} 1 ${p1.x} ${p1.y} Z`;

    // Gövde yalnızca ön yarıda görünür (sin > 0 → 0°–180°)
    const f0 = Math.max(a0, 0);
    const f1 = Math.min(a1, 180);
    let duvar = "";
    if (f1 > f0) {
      const s = nokta(f0);
      const e = nokta(f1);
      const la = f1 - f0 > 180 ? 1 : 0;
      duvar =
        `M ${s.x} ${s.y} L ${s.x} ${s.y + DERINLIK} ` +
        `A ${RX} ${RY} 0 ${la} 1 ${e.x} ${e.y + DERINLIK} ` +
        `L ${e.x} ${e.y} A ${RX} ${RY} 0 ${la} 0 ${s.x} ${s.y} Z`;
    }

    const orta = (a0 + a1) / 2;
    const etiket = nokta(orta, 1.3);

    return {
      ...d,
      i,
      ust,
      duvar,
      yuzde: (d.tutar / toplam) * 100,
      etiket,
      saga: Math.cos(orta * D2R) >= 0,
    };
  });

  return (
    <figure
      style={{
        width: 300,
        flexShrink: 0,
        margin: 0,
      }}
    >
      <svg
        viewBox="0 0 300 186"
        style={{ width: "100%", height: "auto", display: "block" }}
        role="img"
        aria-label={`Ödeme bileşimi: ${parcalar
          .map((p) => `${p.ad} ${p.yuzde.toFixed(1)} yüzde`)
          .join(", ")}`}
      >
        <defs>
          <pattern
            id="pasta-tarama"
            width="7"
            height="7"
            patternTransform="rotate(-45)"
            patternUnits="userSpaceOnUse"
          >
            <rect width="2.5" height="7" fill="#ffffff" opacity="0.5" />
          </pattern>
        </defs>

        {/* gövde duvarları önce — üst yüzeyler bunların üstüne oturur */}
        {parcalar.map(
          (p) =>
            p.duvar && (
              <path
                key={`g-${p.i}`}
                d={p.duvar}
                fill={koyult(p.renk, vurgu === p.i ? 0.82 : 0.72)}
              />
            ),
        )}

        {/* üst yüzeyler */}
        {parcalar.map((p) => (
          <g
            key={`u-${p.i}`}
            onMouseEnter={() => setVurgu(p.i)}
            onMouseLeave={() => setVurgu(null)}
            style={{
              cursor: "default",
              transform: vurgu === p.i ? "translateY(-4px)" : "none",
              transition: "transform 160ms ease",
            }}
          >
            <path d={p.ust} fill={p.renk} />
            {p.tarama && <path d={p.ust} fill="url(#pasta-tarama)" />}
            <path
              d={p.ust}
              fill="none"
              stroke="#ffffff"
              strokeWidth={1.5}
              strokeLinejoin="round"
            />
          </g>
        ))}

        {/* doğrudan etiketler — okuma açıya bırakılmaz */}
        {parcalar.map((p) => (
          <text
            key={`e-${p.i}`}
            x={p.etiket.x}
            y={p.etiket.y}
            textAnchor={p.saga ? "start" : "end"}
            fill="#051c2c"
            fontSize={14}
            fontWeight={700}
            fontFamily="inherit"
          >
            %{p.yuzde.toFixed(1).replace(".", ",")}
          </text>
        ))}
      </svg>

      <figcaption
        style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 6 }}
      >
        {parcalar.map((p) => (
          <div
            key={p.ad}
            onMouseEnter={() => setVurgu(p.i)}
            onMouseLeave={() => setVurgu(null)}
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: 10,
              opacity: vurgu === null || vurgu === p.i ? 1 : 0.5,
              transition: "opacity 140ms ease",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  width: 16,
                  height: 9,
                  borderRadius: 2,
                  flexShrink: 0,
                  background: p.tarama
                    ? "repeating-linear-gradient(-45deg, #5fc2e8 0 2px, transparent 2px 6px)"
                    : p.renk,
                  border: p.tarama ? "1px solid #5fc2e8" : undefined,
                }}
              />
              <span className="lbl" style={{ color: "var(--gri-2)" }}>
                {p.ad}
              </span>
            </span>
            <span className="num" style={{ fontSize: 14 }}>
              {lira(p.tutar)}
            </span>
          </div>
        ))}
      </figcaption>
    </figure>
  );
}
