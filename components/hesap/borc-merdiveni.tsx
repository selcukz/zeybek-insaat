import { lira, sozlesme, type Hesap } from "@/lib/hesap";

const W = 800;
const SOL = 62;
const UST = 22;
const ALT = 258;

/**
 * Kalan Borç Merdiveni — bakiye peşinatla düşer, sonra her taksitte
 * bir basamak inerek sıfıra ulaşır. Sitenin kat takip dilini izler:
 * dolu yeşil gerçekleşen, taramalı tunç planlanan imalattır.
 */
export default function BorcMerdiveni({ hesap }: { hesap: Hesap }) {
  const toplam = sozlesme.toplamBedel;
  const n = sozlesme.taksitSayisi + 1;
  const adim = (W - SOL) / n;

  const x = (i: number) => SOL + i * adim;
  const y = (v: number) => UST + (1 - v / toplam) * (ALT - UST);

  const yBas = y(toplam);
  const yBugun = y(hesap.kalanBorc);

  // Gerçekleşen: sözleşme bedelinden bugünkü bakiyeye düşüş
  const gercekCizgi = `M ${SOL} ${yBas} L ${x(0)} ${yBas} L ${x(0)} ${yBugun}`;
  const gercekAlan = `${gercekCizgi} L ${x(0)} ${ALT} L ${SOL} ${ALT} Z`;

  // Planlanan: kalan taksitler basamak basamak sıfıra
  const kalanTaksit = hesap.taksitler.filter((t) => t.durum !== "odendi");
  let planCizgi = `M ${x(0)} ${yBugun}`;
  let bakiye = hesap.kalanBorc;
  kalanTaksit.forEach((t, i) => {
    const oncekiY = y(bakiye);
    bakiye = Math.max(0, bakiye - t.beklenen);
    planCizgi += ` L ${x(i + 1)} ${oncekiY} L ${x(i + 1)} ${y(bakiye)}`;
  });
  const planAlan = `${planCizgi} L ${x(kalanTaksit.length)} ${ALT} L ${x(0)} ${ALT} Z`;

  const izgara = Array.from({ length: 5 }, (_, g) => {
    const deger = toplam * (1 - g / 4);
    return { y: y(deger), etiket: `${lira(deger / 1_000_000)}M` };
  });

  const aylar = [
    { x: x(0), ad: "Bugün" },
    ...hesap.taksitler
      .filter((_, i) => (i + 1) % 3 === 0)
      .map((t, i) => ({ x: x((i + 1) * 3), ad: t.ayKisa })),
  ];

  return (
    <svg
      viewBox="0 0 820 296"
      className="mt-6 block h-auto w-full"
      role="img"
      aria-label={`Kalan borç ${lira(hesap.kalanBorc)} lira; ${hesap.kalanTaksitSayisi} taksitte sıfırlanıyor`}
    >
      <defs>
        <pattern
          id="merdiven-tarama"
          width="7"
          height="7"
          patternTransform="rotate(-45)"
          patternUnits="userSpaceOnUse"
        >
          <rect width="2" height="7" fill="var(--color-tuc-400)" opacity="0.5" />
        </pattern>
        <clipPath id="merdiven-acilim">
          <rect
            x="0"
            y="0"
            width="820"
            height="296"
            className="an-yay-svg"
            style={{ animationDelay: "420ms" }}
          />
        </clipPath>
      </defs>

      {izgara.map((g) => (
        <g key={g.etiket}>
          <line
            x1={SOL}
            y1={g.y}
            x2={W}
            y2={g.y}
            stroke="var(--color-beton-200)"
            strokeWidth={1}
          />
          <text
            x={SOL - 12}
            y={g.y + 3}
            textAnchor="end"
            fill="var(--color-kursun-400)"
            fontFamily="var(--font-mono)"
            fontSize={10}
          >
            {g.etiket}
          </text>
        </g>
      ))}

      <g clipPath="url(#merdiven-acilim)">
        <path d={planAlan} fill="url(#merdiven-tarama)" />
        <path d={gercekAlan} fill="var(--color-file-600)" opacity={0.16} />
      </g>

      <path
        d={planCizgi}
        fill="none"
        stroke="var(--color-tuc-400)"
        strokeWidth={2}
        pathLength={1}
        className="an-ciz"
        style={{ animationDelay: "700ms" }}
      />
      <path
        d={gercekCizgi}
        fill="none"
        stroke="var(--color-file-700)"
        strokeWidth={2.5}
        pathLength={1}
        className="an-ciz"
        style={{ animationDelay: "420ms" }}
      />

      <g className="an-acil" style={{ animationDelay: "1050ms" }}>
        <line
          x1={x(0)}
          y1={14}
          x2={x(0)}
          y2={ALT + 4}
          stroke="var(--color-kursun-800)"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
        <circle cx={x(0)} cy={yBugun} r={4.5} fill="var(--color-file-700)" />
      </g>

      {aylar.map((a) => (
        <text
          key={a.ad}
          x={a.x}
          y={280}
          textAnchor="middle"
          fill="var(--color-kursun-400)"
          fontFamily="var(--font-mono)"
          fontSize={10}
        >
          {a.ad}
        </text>
      ))}
    </svg>
  );
}
