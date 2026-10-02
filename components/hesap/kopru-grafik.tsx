/**
 * Bedelden kalana — diagram-design şelale grafiği (type-waterfall.md).
 *
 * Pastanın yerini aldı: aynı bileşimi (peşinat · taksitler · kalan)
 * açıyla değil, korunan bir ara toplamla gösterir. Bedel tabandan
 * yükselir, her ödeme bir önceki seviyeden düşer, kalan yine tabana
 * oturur. Taşıma çizgileri toplamın boşluklar boyunca korunduğunu söyler.
 *
 * Ödenen taksitler tek köprüdür; çubuk sayısı 4'te kalır (tür bütçesi
 * 3–8). Sıfır köprü çizilmez. Yön dolgu ağırlığıyla kodlanır: toplam
 * koyu çerçeveli, azalış içi boş; odak köprü (taksitler) portakal.
 */

const INK = "#2d3142";
const MUTED = "#4f5d75";
const ACCENT = "#eb6c36";
const PAPER = "#f5f5f5";
const GRID = "rgba(45,49,66,0.08)";
const AXIS = "rgba(45,49,66,0.25)";
const CARRY = "rgba(45,49,66,0.55)";

/* viewBox 640 × 480 — çizim alanı x 80→600, y 40→380 */
const W = 640;
const H = 480;
const SOL = 80;
const SAG = 600;
const UST = 40;
const ALT = 380;
const PITCH = 128;
const GEN = 88;

const tr = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 });
const milyon = (v: number) =>
  `${(v / 1_000_000).toLocaleString("tr-TR", { maximumFractionDigits: 1 })}M`;

type Cubuk = {
  ad: string;
  rol: "total" | "delta";
  /** Toplam için işaretsiz tutar, köprü için işaretli. */
  deger: number;
  odak?: boolean;
};

export default function KopruGrafik({
  toplamBedel,
  pesinat,
  taksit,
  kalan,
}: {
  toplamBedel: number;
  pesinat: number;
  taksit: number;
  kalan: number;
}) {
  const cubuklar: Cubuk[] = [
    { ad: "Bedel", rol: "total", deger: toplamBedel },
    ...(pesinat > 0 ? [{ ad: "Peşinat", rol: "delta" as const, deger: -pesinat }] : []),
    ...(taksit > 0
      ? [{ ad: "Taksitler", rol: "delta" as const, deger: -taksit, odak: true }]
      : []),
    { ad: "Kalan", rol: "total", deger: kalan },
  ];

  const y = (v: number) => Math.round(ALT - (v / toplamBedel) * (ALT - UST));
  const n = cubuklar.length;
  const bas = SOL + (SAG - SOL - ((n - 1) * PITCH + GEN)) / 2;

  // Ara toplamı yürüt: her çubuğun alt / üst seviyesi ve sonrasında kalan.
  let seviye = 0;
  const cizim = cubuklar.map((c, k) => {
    const x = bas + k * PITCH;
    let ust: number;
    let alt: number;
    if (c.rol === "total") {
      seviye = c.deger;
      ust = c.deger;
      alt = 0;
    } else {
      const once = seviye;
      seviye = once + c.deger;
      ust = Math.max(once, seviye);
      alt = Math.min(once, seviye);
    }
    return { ...c, x, ust, alt, sonra: seviye };
  });

  const izgara = [0.25, 0.5, 0.75, 1].map((f) => f * toplamBedel);
  const isaretli = (v: number) => (v < 0 ? `−${tr.format(-v)}` : `+${tr.format(v)}`);

  return (
    <div className="dd-sarma">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ minWidth: W }}
        role="img"
        aria-labelledby="kopru-title kopru-desc"
      >
        <title id="kopru-title">Bedelden kalana</title>
        <desc id="kopru-desc">
          {`Şelale grafik: ${tr.format(toplamBedel)} ₺ bedelden ${tr.format(
            pesinat,
          )} ₺ peşinat${
            taksit > 0 ? ` ve ${tr.format(taksit)} ₺ taksit` : ""
          } düşülünce ${tr.format(kalan)} ₺ kalır.`}
        </desc>

        <rect width={W} height={H} fill={PAPER} />

        <text
          className="dd-m"
          transform={`rotate(-90 24 ${(UST + ALT) / 2})`}
          x={24}
          y={(UST + ALT) / 2}
          fill={MUTED}
          fontSize={7}
          letterSpacing="0.14em"
          textAnchor="middle"
        >
          SÖZLEŞME BEDELİ · ₺
        </text>

        {izgara.map((v, k) => (
          <line
            key={v}
            x1={SOL}
            y1={y(v)}
            x2={SAG}
            y2={y(v)}
            stroke={k === izgara.length - 1 ? "rgba(45,49,66,0.06)" : GRID}
            strokeWidth={0.8}
          />
        ))}
        <line x1={SOL} y1={UST} x2={SOL} y2={ALT} stroke={AXIS} strokeWidth={1} />
        <line x1={SOL} y1={ALT} x2={SAG} y2={ALT} stroke={AXIS} strokeWidth={1} />
        {izgara.map((v) => (
          <text
            key={`t${v}`}
            className="dd-m"
            x={72}
            y={y(v) + 4}
            fill={MUTED}
            fontSize={8}
            textAnchor="end"
          >
            {milyon(v)}
          </text>
        ))}

        {/* Taşımalar — çubuklardan önce; ara toplamı boşluk boyunca taşır */}
        {cizim.slice(0, -1).map((c, k) => (
          <line
            key={`c${k}`}
            x1={c.x + GEN}
            y1={y(c.sonra)}
            x2={cizim[k + 1].x}
            y2={y(c.sonra)}
            stroke={CARRY}
            strokeWidth={1}
            data-carry={c.sonra}
          />
        ))}

        {cizim.map((c) => {
          const ust = y(c.ust);
          const yuk = Math.max(1, y(c.alt) - ust);
          const dolgu =
            c.rol === "total"
              ? "rgba(45,49,66,0.08)"
              : c.odak
                ? "rgba(235,108,54,0.12)"
                : PAPER;
          const cizgi = c.rol === "total" ? INK : c.odak ? ACCENT : MUTED;
          const azalis = c.rol === "delta" && c.deger < 0;
          return (
            <g key={c.ad}>
              <rect x={c.x} y={ust} width={GEN} height={yuk} fill={PAPER} />
              <rect
                x={c.x}
                y={ust}
                width={GEN}
                height={yuk}
                fill={dolgu}
                stroke={cizgi}
                strokeWidth={1}
                data-role={c.rol}
                data-value={c.rol === "total" ? c.deger : isaretli(c.deger)}
                data-name={c.ad}
              />
              <text
                className="dd-m"
                x={c.x + GEN / 2}
                y={azalis ? ust + yuk + 12 : ust - 8}
                fill={c.odak ? INK : MUTED}
                fontSize={8}
                fontWeight={c.odak ? 600 : 400}
                textAnchor="middle"
              >
                {c.rol === "total" ? tr.format(c.deger) : isaretli(c.deger)}
              </text>
              <text
                className="dd-s"
                x={c.x + GEN / 2}
                y={400}
                fill={c.odak ? ACCENT : INK}
                fontSize={11}
                fontWeight={600}
                textAnchor="middle"
              >
                {c.ad}
              </text>
            </g>
          );
        })}

        {/* Lejant */}
        <line x1={40} y1={422} x2={SAG} y2={422} stroke="rgba(45,49,66,0.10)" strokeWidth={0.8} />
        <text className="dd-m" x={40} y={438} fill={MUTED} fontSize={8} letterSpacing="0.18em">
          LEJANT
        </text>

        <rect x={40} y={450} width={16} height={10} rx={2} fill="rgba(45,49,66,0.08)" stroke={INK} strokeWidth={1} />
        <text className="dd-s" x={64} y={459} fill={MUTED} fontSize={8.5}>
          Bedel / kalan
        </text>

        <rect x={164} y={450} width={16} height={10} rx={2} fill={PAPER} stroke={MUTED} strokeWidth={1} />
        <text className="dd-s" x={188} y={459} fill={MUTED} fontSize={8.5}>
          Ödeme · borçtan düşer
        </text>

        {taksit > 0 && (
          <>
            <rect
              x={340}
              y={450}
              width={16}
              height={10}
              rx={2}
              fill="rgba(235,108,54,0.12)"
              stroke={ACCENT}
              strokeWidth={1}
            />
            <text className="dd-s" x={364} y={459} fill={MUTED} fontSize={8.5}>
              Taksitler · her ay büyür
            </text>
          </>
        )}
      </svg>
    </div>
  );
}
