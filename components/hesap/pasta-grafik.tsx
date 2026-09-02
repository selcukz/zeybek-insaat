"use client";

import { useState } from "react";
import { lira } from "@/lib/hesap";
import { P, CIZGI_OLCEK, D2R, pol, rnd, yuzYuzde } from "./lieflat";

/**
 * Ödemenin bileşimi — Lieflat Charts F4 "Tick Donut".
 *
 * Yüz kişilik oy kuyruğu bir kadrana sarılır: 1 çentik = %1, tam 100
 * çentik. Saat 12 sıfırdır, saat yönünde okunur, her onuncu çentiğin
 * içine bir sayaç noktası düşer.
 *
 * Neden 3B pastanın yerine: 3B pasta, alan algısını eğdiği için yüzdeyi
 * açıdan okumayı güvenilmez kılıyordu — eski sürüm bunu etiketle
 * telafi etmek zorunda kalmıştı. Çentikte okuma açıya değil sayıya
 * bağlı: dilim gerçekten sayılabiliyor.
 *
 * Renk sırası açıklık merdivenidir (porcelain · "açıklık = veri"):
 * ödenen en koyu, kalan borç en açık. Sıra, ödemenin ilerleyişini
 * kodlar; renk tek ipucu değildir, her dilim ayrıca adıyla yazılır.
 */

const YAZI =
  'Consolas, "Cascadia Mono", Menlo, "DejaVu Sans Mono", monospace';

const CX = 150;
const CY = 96;
const R0 = 54; /* çentiklerin iç yarıçapı */

type Dilim = {
  ad: string;
  tutar: number;
  renk: string;
};

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
    { ad: "Peşinat", tutar: pesinat, renk: P.HERO },
    ...(taksit > 0
      ? [{ ad: "Ödenen taksitler", tutar: taksit, renk: P.DATA }]
      : []),
    { ad: "Kalan borç", tutar: kalan, renk: P.DATA2 },
  ];

  // 1 çentik = %1 sözleşmesi ancak çentikler tam 100 tanaysa doğrudur.
  const centikler = yuzYuzde(
    dilimler.map((d) => d.tutar),
    toplam,
  );

  let sayac = 0;
  const parcalar = dilimler.map((d, i) => {
    const adet = centikler[i];
    const bas = sayac;
    sayac += adet;
    return {
      ...d,
      i,
      adet,
      bas,
      yuzde: toplam > 0 ? (d.tutar / toplam) * 100 : 0,
    };
  });

  return (
    <figure style={{ width: 300, flexShrink: 0, margin: 0 }}>
      <svg
        viewBox="0 0 300 196"
        style={{ width: "100%", height: "auto", display: "block" }}
        role="img"
        aria-label={`Ödeme bileşimi: ${parcalar
          .map((p) => `${p.ad} yüzde ${p.yuzde.toFixed(1)}`)
          .join(", ")}`}
      >
        {parcalar.map((p) => (
          <g
            key={`d-${p.i}`}
            onMouseEnter={() => setVurgu(p.i)}
            onMouseLeave={() => setVurgu(null)}
          >
            {/* ── çentikler ── */}
            {Array.from({ length: p.adet }, (_, k) => {
              const idx = p.bas + k;
              const a = idx * 3.6 - 90;
              const uzunluk = 10 + rnd(idx + 1, p.i + 2) * 6;
              const [x1, y1] = pol(CX, CY, R0, a);
              const [x2, y2] = pol(CX, CY, R0 + uzunluk, a);
              return (
                <g key={k}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={p.renk}
                    strokeWidth={
                      vurgu === p.i ? 1.6 * CIZGI_OLCEK : 1 * CIZGI_OLCEK
                    }
                    opacity={vurgu === null || vurgu === p.i ? 1 : 0.85}
                  />
                  {idx % 10 === 0 &&
                    (() => {
                      const [dx, dy] = pol(CX, CY, R0 - 5, a);
                      return <circle cx={dx} cy={dy} r={0.8} fill={P.FAINT} />;
                    })()}
                </g>
              );
            })}

            {/* ── dilim etiketi, kesikli tüy çizgiyle bağlı ── */}
            {p.adet > 0 &&
              (() => {
                const orta = (p.bas + p.adet / 2) * 3.6 - 90;
                const [lx, ly] = pol(CX, CY, R0 + 34, orta);
                const [gx, gy] = pol(CX, CY, R0 + 19, orta);
                const kos = Math.cos(orta * D2R);
                const hiza =
                  kos > 0.3 ? "start" : kos < -0.3 ? "end" : "middle";
                return (
                  <>
                    <line
                      x1={gx}
                      y1={gy}
                      x2={lx}
                      y2={ly}
                      stroke={P.FAINT}
                      strokeWidth={0.7 * CIZGI_OLCEK}
                      strokeDasharray="1 3"
                    />
                    <text
                      x={lx}
                      y={ly + 3}
                      fontSize={8.5}
                      fontWeight={800}
                      fill={p.renk}
                      textAnchor={hiza}
                      letterSpacing=".06em"
                      style={{
                        paintOrder: "stroke",
                        stroke: P.HALO,
                        strokeWidth: 3,
                      }}
                    >
                      {`%${p.yuzde.toFixed(1).replace(".", ",")}`}
                    </text>
                  </>
                );
              })()}
          </g>
        ))}

        {/* ── merkez: yalnızca toplam ve birim açıklaması ── */}
        <text
          x={CX}
          y={CY - 1}
          fontSize={20}
          fontWeight={800}
          fill={P.TXT}
          textAnchor="middle"
          fontFamily={YAZI}
        >
          100
        </text>
        <text
          x={CX}
          y={CY + 14}
          fontSize={7}
          fontWeight={600}
          fill={P.MUT}
          textAnchor="middle"
          letterSpacing=".1em"
          fontFamily={YAZI}
        >
          ÇENTİK · BİRİ = %1
        </text>

        {/* ── birim satırı ── */}
        <text
          x={150}
          y={188}
          fontSize={7}
          fontWeight={600}
          fill={P.FAINT}
          textAnchor="middle"
          letterSpacing=".12em"
          fontFamily={YAZI}
        >
          SAAT 12 SIFIRDIR · NOKTA HER ONUNCUDA · SAAT YÖNÜNDE
        </text>
      </svg>

      <figcaption style={{ marginTop: 12 }}>
        {parcalar.map((p) => (
          <div
            key={`l-${p.i}`}
            onMouseEnter={() => setVurgu(p.i)}
            onMouseLeave={() => setVurgu(null)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "3px 0",
              opacity: vurgu === null || vurgu === p.i ? 1 : 0.55,
            }}
          >
            <span
              aria-hidden
              style={{
                width: 14,
                height: 3,
                background: p.renk,
                flexShrink: 0,
              }}
            />
            <span className="lbl" style={{ flex: 1 }}>
              {p.ad}
            </span>
            <span className="num" style={{ fontSize: 13 }}>
              {lira(p.tutar)}
            </span>
          </div>
        ))}
      </figcaption>
    </figure>
  );
}
