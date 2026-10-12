"use client";

import type { DolarNoktasi, GrafikNoktasi } from "@/lib/hesap";
import { bugunKonumu } from "./profil-grafik";

/**
 * Dolar karşılığı — diagram-design çizgi grafiği, profil grafiğiyle aynı
 * ölçek ve ay ekseni.
 *
 * İki seri: (1) bütün ödemeler ve plan 18.08.2026 kuruyla — son ödemeye
 * dek düz, sonrası kesik plan; (2) her havale kendi günündeki kurla
 * (odak, portakal). İkisi arasındaki açıklık kur farkıdır.
 */

const INK = "#2d3142";
const MUTED = "#4f5d75";
const ACCENT = "#eb6c36";
const PAPER = "#f5f5f5";
const GRID = "rgba(45,49,66,0.08)";
const AXIS = "rgba(45,49,66,0.25)";

const W = 880;
const H = 480;
const SOL = 80;
const SAG = 840;
const UST = 40;
const ALT = 380;
const ADIM_USD = 50_000;

const tr = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 });
const bin = (v: number) => (v === 0 ? "0" : `${tr.format(v / 1000)} bin`);

export default function DolarGrafik({
  noktalar,
  dolar,
  sonOdeme,
  bugun,
  aktif,
  onGezin,
  onSec,
}: {
  noktalar: GrafikNoktasi[];
  dolar: DolarNoktasi[];
  sonOdeme: number;
  bugun: string;
  aktif: number | null;
  onGezin: (i: number | null) => void;
  onSec: (i: number) => void;
}) {
  const son = dolar.length - 1;
  const ust = Math.ceil(dolar[son].sabit / ADIM_USD) * ADIM_USD;
  const adim = (SAG - SOL) / son;
  const x = (i: number) => SOL + i * adim;
  const y = (v: number) => ALT - (v / ust) * (ALT - UST);
  const xy = (i: number, v: number) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`;

  const sabitGercek = dolar.slice(0, sonOdeme + 1);
  const sabitPlan = dolar.slice(sonOdeme);
  const gercek = dolar.filter((d) => d.gercek !== null);
  const sonG = gercek[gercek.length - 1];

  const izgara = Array.from({ length: ust / ADIM_USD }, (_, k) => (k + 1) * ADIM_USD);
  const bugunX = x(bugunKonumu(bugun));

  const aktifD = aktif === null ? null : dolar[aktif];

  return (
    <div className="dd-sarma">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ minWidth: W }}
        role="img"
        aria-labelledby="dolar-title dolar-desc"
        onMouseLeave={() => onGezin(null)}
      >
        <title id="dolar-title">Ödemelerin dolar karşılığı</title>
        <desc id="dolar-desc">
          {`Çizgi grafik: kümülatif ödemenin dolar karşılığı. 18.08.2026 kuruyla ${tr.format(
            sonG.sabit,
          )} $, ödeme günü kurlarıyla ${tr.format(
            sonG.gercek ?? 0,
          )} $ ödendi; aynı kurla plan ${tr.format(dolar[son].sabit)} $ ile kapanır.`}
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
          KÜMÜLATİF ÖDEME · USD
        </text>

        {izgara.map((v) => (
          <line
            key={v}
            x1={SOL}
            y1={y(v)}
            x2={SAG}
            y2={y(v)}
            stroke={GRID}
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
            {bin(v)}
          </text>
        ))}

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

        {/* Bugün */}
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

        {/* Sabit kur — plan, kesik */}
        <polyline
          points={sabitPlan.map((d) => xy(d.i, d.sabit)).join(" ")}
          fill="none"
          stroke={INK}
          strokeOpacity={0.6}
          strokeWidth={1.2}
          strokeDasharray="5,4"
          strokeLinejoin="round"
        />
        <text
          className="dd-m"
          x={SAG}
          y={y(dolar[son].sabit) - 10}
          fill={MUTED}
          fontSize={8}
          textAnchor="end"
        >
          {tr.format(dolar[son].sabit)} $
        </text>

        {/* Sabit kur — gerçekleşen, düz */}
        <polyline
          points={sabitGercek.map((d) => xy(d.i, d.sabit)).join(" ")}
          fill="none"
          stroke={INK}
          strokeWidth={1.4}
          strokeLinejoin="round"
        />
        {sabitGercek.map((d) => (
          <circle key={`s${d.i}`} cx={x(d.i)} cy={y(d.sabit)} r={2.5} fill={INK} />
        ))}

        {/* Ödeme günü kuru — odak */}
        <polyline
          points={gercek.map((d) => xy(d.i, d.gercek!)).join(" ")}
          fill="none"
          stroke={ACCENT}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
        {gercek.map((d) => (
          <circle key={`g${d.i}`} cx={x(d.i)} cy={y(d.gercek!)} r={4} fill={ACCENT} />
        ))}

        {/* Son ödeme etiketleri — sabit kur üstte (kesik planın üzerinden
            geçmesin diye yüksekte), ödeme günü kuru altta */}
        <text
          className="dd-m"
          x={x(sonG.i) + 10}
          y={y(sonG.sabit) - 24}
          fill={INK}
          fontSize={9}
        >
          {tr.format(sonG.sabit)} $
        </text>
        <text
          className="dd-m"
          x={x(sonG.i) + 10}
          y={y(sonG.gercek!) + 18}
          fill={ACCENT}
          fontSize={9}
          fontWeight={600}
        >
          {tr.format(sonG.gercek!)} $
        </text>

        {/* İmleç */}
        {aktifD && (
          <g pointerEvents="none">
            <line
              x1={x(aktifD.i)}
              y1={UST}
              x2={x(aktifD.i)}
              y2={ALT}
              stroke="rgba(45,49,66,0.45)"
              strokeWidth={1}
            />
            <circle
              cx={x(aktifD.i)}
              cy={y(aktifD.gercek ?? aktifD.sabit)}
              r={6}
              fill={PAPER}
              stroke={aktifD.gercek !== null ? ACCENT : MUTED}
              strokeWidth={1.8}
            />
          </g>
        )}

        <g aria-hidden="true">
          {dolar.map((d) => (
            <rect
              key={`h${d.i}`}
              x={x(d.i) - adim / 2}
              y={UST}
              width={adim}
              height={ALT - UST + 28}
              fill="transparent"
              style={{ cursor: "crosshair" }}
              onMouseEnter={() => onGezin(d.i)}
              onClick={() => onSec(d.i)}
            />
          ))}
        </g>

        {/* Lejant */}
        <line x1={40} y1={422} x2={SAG} y2={422} stroke="rgba(45,49,66,0.10)" strokeWidth={0.8} />
        <text className="dd-m" x={40} y={438} fill={MUTED} fontSize={8} letterSpacing="0.18em">
          LEJANT
        </text>

        <line x1={40} y1={456} x2={64} y2={456} stroke={ACCENT} strokeWidth={1.8} />
        <circle cx={52} cy={456} r={4} fill={ACCENT} />
        <text className="dd-s" x={72} y={460} fill={MUTED} fontSize={8.5}>
          Ödenen · ödeme günü kuru
        </text>

        <line x1={230} y1={456} x2={254} y2={456} stroke={INK} strokeWidth={1.4} />
        <text className="dd-s" x={262} y={460} fill={MUTED} fontSize={8.5}>
          Ödenen · 18.08.2026 kuru
        </text>

        <line
          x1={420}
          y1={456}
          x2={444}
          y2={456}
          stroke={INK}
          strokeOpacity={0.6}
          strokeWidth={1.2}
          strokeDasharray="5,4"
        />
        <text className="dd-s" x={452} y={460} fill={MUTED} fontSize={8.5}>
          Plan · 18.08.2026 kuru
        </text>

        <text className="dd-m" x={SAG} y={460} fill={MUTED} fontSize={8} textAnchor="end">
          TCMB USD DÖVİZ ALIŞ
        </text>
      </svg>
    </div>
  );
}
