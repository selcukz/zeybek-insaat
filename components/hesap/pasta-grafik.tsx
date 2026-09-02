"use client";

import { useState } from "react";
import { lira } from "@/lib/hesap";

/* Düz daire. 3B derinlik kaldırıldı: açı zaten payı kodluyordu,
   kalınlık hiçbir şeyi kodlamıyor — yalnızca alan algısını eğiyordu. */
const CX = 150;
const CY = 104;
const R = 68;
const ETIKET_R = 88;

const D2R = Math.PI / 180;

type Dilim = {
  ad: string;
  tutar: number;
  renk: string;
  /** İçi boş = henüz gerçekleşmedi. Dolu = para el değiştirdi. */
  bos?: boolean;
};

const nokta = (a: number, r: number) => ({
  x: CX + r * Math.cos(a * D2R),
  y: CY + r * Math.sin(a * D2R),
});

/**
 * Ödemenin bileşimi: peşinat, ödenen taksitler ve kalan borç.
 * Taksit ödendikçe orta dilim büyür — bugün sıfır olduğu için gizlidir.
 *
 * Dolu dilim = ödenmiş; içi boş kesik çizgili dilim = henüz ödenmemiş.
 * Aynı okuma zaman grafiğinde de geçerli — sayfada tek bir dil var.
 * Yüzdeler yay dışına doğrudan yazılır: okuma açıya bırakılmaz.
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
    { ad: "Kalan borç", tutar: kalan, renk: "#5fc2e8", bos: true },
  ];

  // -90° tepe noktası; saat yönünde ilerler
  let aci = -90;
  const parcalar = dilimler.map((d, i) => {
    const yay = (d.tutar / toplam) * 360;
    const a0 = aci;
    const a1 = aci + yay;
    aci = a1;

    const p0 = nokta(a0, R);
    const p1 = nokta(a1, R);
    const orta = (a0 + a1) / 2;

    return {
      ...d,
      i,
      orta,
      yuzde: (d.tutar / toplam) * 100,
      yol:
        `M ${CX} ${CY} L ${p0.x.toFixed(1)} ${p0.y.toFixed(1)} ` +
        `A ${R} ${R} 0 ${yay > 180 ? 1 : 0} 1 ` +
        `${p1.x.toFixed(1)} ${p1.y.toFixed(1)} Z`,
      etiket: nokta(orta, ETIKET_R),
      saga: Math.cos(orta * D2R) >= 0,
      /** Vurguda dilim kendi ekseni boyunca dışarı kayar. */
      kaydir: `translate(${(6 * Math.cos(orta * D2R)).toFixed(1)}px, ${(
        6 * Math.sin(orta * D2R)
      ).toFixed(1)}px)`,
    };
  });

  return (
    <figure style={{ width: 300, flexShrink: 0, margin: 0 }}>
      <svg
        viewBox="0 0 300 200"
        style={{ width: "100%", height: "auto", display: "block" }}
        role="img"
        aria-label={`Ödeme bileşimi: ${parcalar
          .map((p) => `${p.ad} ${p.yuzde.toFixed(1)} yüzde`)
          .join(", ")}`}
      >
        {parcalar.map((p) => (
          <g
            key={`d-${p.i}`}
            onMouseEnter={() => setVurgu(p.i)}
            onMouseLeave={() => setVurgu(null)}
            style={{
              cursor: "default",
              transform: vurgu === p.i ? p.kaydir : "none",
              opacity: vurgu === null || vurgu === p.i ? 1 : 0.5,
              transition:
                "transform 180ms cubic-bezier(.4,0,.2,1), opacity 140ms ease",
            }}
          >
            <path
              d={p.yol}
              fill={p.bos ? "#ffffff" : p.renk}
              stroke={p.bos ? p.renk : "#ffffff"}
              strokeWidth={p.bos ? 1.6 : 2}
              strokeDasharray={p.bos ? "6 4" : undefined}
              strokeLinejoin="round"
            />
          </g>
        ))}

        {/* doğrudan etiketler — okuma açıya bırakılmaz */}
        {parcalar.map((p) => (
          <text
            key={`e-${p.i}`}
            x={p.etiket.x}
            y={p.etiket.y + 4}
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
                  background: p.bos ? "#ffffff" : p.renk,
                  border: p.bos ? `1px dashed ${p.renk}` : undefined,
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
