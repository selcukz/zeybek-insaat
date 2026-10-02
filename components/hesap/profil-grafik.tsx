"use client";

import { sonGercekIndex, sozlesme, type GrafikNoktasi } from "@/lib/hesap";

/**
 * Ödeme profili — diagram-design çizgi grafiği (type-line.md).
 *
 * Odak seri (portakal, 1.8px, köşe noktaları) gerçekleşen ödemedir;
 * plan aynı ölçekte ince kesik çizgidir. Aylık taksit kolonları yok:
 * 18 eşit kolon tür bütçesini (≤8 çubuk) aşıyor ve bilgi taşımıyordu —
 * aylık tutarlar taksit tablosunda duruyor.
 *
 * Değer ekseni sıfırdan başlar ve bedelde biter; kırpılmaz.
 * Seçili ay React tarafında durur, çünkü aynı seçim okuma panelini ve
 * taksit tablosunu da sürer. Grafik saf SVG'dir, kütüphane yok.
 */

export type Mod = "kumulatif" | "bakiye";

/* style-guide.md varsayılan jetonları */
const INK = "#2d3142";
const MUTED = "#4f5d75";
const ACCENT = "#eb6c36";
const PAPER = "#f5f5f5";
const GRID = "rgba(45,49,66,0.08)";
const AXIS = "rgba(45,49,66,0.25)";

/* viewBox 880 × 480 — çizim alanı x 80→840, y 40→380 */
const W = 880;
const H = 480;
const SOL = 80;
const SAG = 840;
const UST = 40;
const ALT = 380;

const tr = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 });
const milyon = (v: number) =>
  `${(v / 1_000_000).toLocaleString("tr-TR", { maximumFractionDigits: 1 })}M`;

/** Bugünün grafikteki konumu: i. nokta i. ayın son günüdür. */
function bugunKonumu(bugunIso: string) {
  const bas = new Date(sozlesme.baslangic + "T00:00:00");
  const b = new Date(bugunIso + "T00:00:00");
  const ayFarki =
    (b.getFullYear() - bas.getFullYear()) * 12 + (b.getMonth() - bas.getMonth());
  const ayGunu = new Date(b.getFullYear(), b.getMonth() + 1, 0).getDate();
  return Math.min(sozlesme.taksitSayisi, Math.max(0, ayFarki - 1 + b.getDate() / ayGunu));
}

export default function ProfilGrafik({
  noktalar,
  mod,
  aktif,
  toplamBedel,
  toplamOdenen,
  bugun,
  onGezin,
  onSec,
}: {
  noktalar: GrafikNoktasi[];
  mod: Mod;
  aktif: number | null;
  toplamBedel: number;
  toplamOdenen: number;
  bugun: string;
  onGezin: (i: number | null) => void;
  onSec: (i: number) => void;
}) {
  const son = noktalar.length - 1;
  const adim = (SAG - SOL) / son;
  const x = (i: number) => SOL + i * adim;
  const y = (v: number) => ALT - (v / toplamBedel) * (ALT - UST);
  const xy = (i: number, v: number) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`;

  const deger = (kum: number) => (mod === "kumulatif" ? kum : toplamBedel - kum);

  // Plan: sözleşmenin öngördüğü kümülatif, peşinattan bedele.
  const plan = noktalar.map((p) => deger(p.kumulatif));

  // Gerçekleşen: peşinat + kapanan taksitler. Son gerçek nokta nakit
  // esaslıdır (toplam ödenen) — bir sonraki taksite geçen fazla da dahil,
  // yoksa grafik başlıktaki rakamdan eksik gösterir.
  const sonGercek = sonGercekIndex(noktalar);
  const gercek: number[] = [];
  let kum = noktalar[0].odenen;
  for (let i = 0; i <= sonGercek; i++) {
    if (i > 0) kum += noktalar[i].odenen;
    gercek.push(deger(i === sonGercek ? toplamOdenen : kum));
  }

  const bugunX = x(bugunKonumu(bugun));
  const izgara = [0.25, 0.5, 0.75, 1].map((f) => f * toplamBedel);

  const aktifDeger =
    aktif === null
      ? null
      : aktif <= sonGercek
        ? gercek[aktif]
        : plan[aktif];

  const eksenAdi = mod === "kumulatif" ? "KÜMÜLATİF ÖDEME · ₺" : "KALAN BAKİYE · ₺";
  const sonDeger = gercek[sonGercek];

  return (
    <div className="dd-sarma">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ minWidth: W }}
        role="img"
        aria-labelledby="profil-title profil-desc"
        onMouseLeave={() => onGezin(null)}
      >
        <title id="profil-title">
          {mod === "kumulatif" ? "Kümülatif ödeme ve plan" : "Kalan bakiye ve plan"}
        </title>
        <desc id="profil-desc">
          {`Çizgi grafik: peşinat ayı ve 18 taksit boyunca ${
            mod === "kumulatif" ? "ödenen toplam" : "kalan borç"
          }. Bugüne kadar ${tr.format(toplamOdenen)} ₺ ödendi; plan ${
            noktalar[son].vade
          } tarihinde ${tr.format(toplamBedel)} ₺ ile kapanır.`}
        </desc>

        <rect width={W} height={H} fill={PAPER} />

        {/* Eksen adı */}
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
          {eksenAdi}
        </text>

        {/* Izgara + eksenler */}
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

        {/* Ay etiketleri — üç ayda bir */}
        {noktalar.map((p) =>
          p.i % 3 === 0 ? (
            <text
              key={`x${p.i}`}
              className="dd-m"
              x={x(p.i)}
              y={400}
              fill={MUTED}
              fontSize={9}
              textAnchor="middle"
            >
              {p.kisa}
            </text>
          ) : null,
        )}

        {/* Bugün — tek açıklama işareti */}
        <line
          x1={bugunX}
          y1={UST}
          x2={bugunX}
          y2={ALT}
          stroke={AXIS}
          strokeWidth={1}
          strokeDasharray="2,3"
        />
        <text
          className="dd-m"
          x={bugunX + 6}
          y={UST + 8}
          fill={MUTED}
          fontSize={7}
          letterSpacing="0.14em"
        >
          BUGÜN
        </text>

        {/* Plan — odak dışı, kesik */}
        <polyline
          points={plan.map((v, i) => xy(i, v)).join(" ")}
          fill="none"
          stroke={MUTED}
          strokeWidth={1.2}
          strokeDasharray="5,4"
          strokeLinejoin="round"
        />
        <text
          className="dd-m"
          x={SAG}
          y={y(plan[son]) + (mod === "kumulatif" ? -10 : -8)}
          fill={MUTED}
          fontSize={8}
          textAnchor="end"
        >
          {tr.format(plan[son])}
        </text>

        {/* Gerçekleşen — odak seri */}
        {mod === "kumulatif" && sonGercek > 0 && (
          <polygon
            points={[
              ...gercek.map((v, i) => xy(i, v)),
              `${x(sonGercek)},${ALT}`,
              `${x(0)},${ALT}`,
            ].join(" ")}
            fill="rgba(235,108,54,0.06)"
          />
        )}
        <polyline
          points={gercek.map((v, i) => xy(i, v)).join(" ")}
          fill="none"
          stroke={ACCENT}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
        {gercek.map((v, i) => (
          <circle key={`g${i}`} cx={x(i)} cy={y(v)} r={4} fill={ACCENT} />
        ))}
        <text
          className="dd-m"
          // Plan çizgisinin karşı tarafına yazılır: kümülatifte plan sağa
          // yükselir (etiket altta), bakiyede sağa iner (etiket üstte).
          x={x(sonGercek) + 10}
          y={y(sonDeger) + (mod === "kumulatif" ? 18 : -10)}
          fill={INK}
          fontSize={9}
          fontWeight={600}
        >
          {tr.format(sonDeger)}
        </text>

        {/* İmleç */}
        {aktif !== null && aktifDeger !== null && (
          <g pointerEvents="none">
            <line
              x1={x(aktif)}
              y1={UST}
              x2={x(aktif)}
              y2={ALT}
              stroke="rgba(45,49,66,0.45)"
              strokeWidth={1}
            />
            <circle
              cx={x(aktif)}
              cy={y(aktifDeger)}
              r={6}
              fill={PAPER}
              stroke={aktif <= sonGercek ? ACCENT : MUTED}
              strokeWidth={1.8}
            />
          </g>
        )}

        {/* Fare bölgeleri — her ay bir şerit */}
        <g aria-hidden="true">
          {noktalar.map((p) => (
            <rect
              key={`h${p.i}`}
              x={x(p.i) - adim / 2}
              y={UST}
              width={adim}
              height={ALT - UST + 28}
              fill="transparent"
              style={{ cursor: "crosshair" }}
              onMouseEnter={() => onGezin(p.i)}
              onClick={() => onSec(p.i)}
            />
          ))}
        </g>

        {/* Lejant — alt şerit */}
        <line x1={40} y1={422} x2={SAG} y2={422} stroke="rgba(45,49,66,0.10)" strokeWidth={0.8} />
        <text className="dd-m" x={40} y={438} fill={MUTED} fontSize={8} letterSpacing="0.18em">
          LEJANT
        </text>

        <line x1={40} y1={456} x2={64} y2={456} stroke={ACCENT} strokeWidth={1.8} />
        <circle cx={52} cy={456} r={4} fill={ACCENT} />
        <text className="dd-s" x={72} y={460} fill={MUTED} fontSize={8.5}>
          Gerçekleşen · odak
        </text>

        <line
          x1={220}
          y1={456}
          x2={244}
          y2={456}
          stroke={MUTED}
          strokeWidth={1.2}
          strokeDasharray="5,4"
        />
        <text className="dd-s" x={252} y={460} fill={MUTED} fontSize={8.5}>
          Sözleşme planı
        </text>

        <line
          x1={380}
          y1={450}
          x2={380}
          y2={462}
          stroke={AXIS}
          strokeWidth={1}
          strokeDasharray="2,3"
        />
        <text className="dd-s" x={392} y={460} fill={MUTED} fontSize={8.5}>
          Bugün
        </text>

        <text className="dd-m" x={SAG} y={460} fill={MUTED} fontSize={8} textAnchor="end">
          ÜZERİNDE GEZİNİN · TIKLAYINCA SABİTLENİR
        </text>
      </svg>
    </div>
  );
}
