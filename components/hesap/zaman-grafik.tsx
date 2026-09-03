"use client";

import { useEffect, useMemo, useRef } from "react";
import * as echarts from "echarts/core";
import { BarChart, LineChart, ScatterChart } from "echarts/charts";
import { GridComponent, MarkLineComponent } from "echarts/components";
import { SVGRenderer } from "echarts/renderers";
import type { ComposeOption, ECharts } from "echarts/core";
import type {
  BarSeriesOption,
  LineSeriesOption,
  ScatterSeriesOption,
} from "echarts/charts";
import type { GridComponentOption } from "echarts/components";
import type { ElementEvent } from "zrender";
import { sonGercekIndex, type GrafikNoktasi } from "@/lib/hesap";

/**
 * Ödeme profili — kümelenmiş kolon + çizgi (combo).
 *
 * Sol eksen / kolonlar (aylık ₺): her ay için sözleşmenin beklediği tutar
 * ile fiilen ödenen tutar yan yana durur. Sağ eksen / çizgi (kümülatif ₺):
 * bedele tırmanan eğri. Merdiven grafiği yalnız bakiyeyi gösteriyordu;
 * bu üç okumayı (beklenen · ödenen · kümülatif) tek karede verir.
 *
 * Dolu = para el değiştirdi. İçi boş kesik çizgi = henüz gerçekleşmedi.
 * Aynı okuma pastada ve ilerleme çubuğunda da geçerlidir.
 *
 * ECharts yalnızca çizim yapar; hangi ayın seçili olduğu React tarafında
 * durur, çünkü aynı seçim yandaki okuma panelini ve taksit tablosunu da
 * sürer. Fare olayları piksel → kategori indeksine çevrilip yukarı
 * bildirilir; imleç çizgisi ile noktası da buradan option'a yazılır.
 *
 * Renkler `hesap.css` içindeki --seri-* jetonlarının birebir karşılığıdır;
 * ECharts CSS değişkeni çözmediği için burada sabit olarak durur.
 */

echarts.use([
  LineChart,
  BarChart,
  ScatterChart,
  GridComponent,
  MarkLineComponent,
  SVGRenderer,
]);

type Secenek = ComposeOption<
  | LineSeriesOption
  | BarSeriesOption
  | ScatterSeriesOption
  | GridComponentOption
>;

/** Çizginin ne gösterdiği. Kolonlar her iki görünümde de aynıdır. */
export type Mod = "kumulatif" | "bakiye";

const SERI_1 = "#1b6fa8"; /* gerçekleşen */
const SERI_2 = "#5fc2e8"; /* planlanan   */
const GECE = "#051c2c";
const GRI = "#8a98a5";
const CIZGI = "#dce3e8";
const CIZGI_2 = "#eef2f5";
const KAGIT = "#ffffff";
const VURGU = "#f0f7fb";

const YAZI =
  'Consolas, "Cascadia Mono", Menlo, "DejaVu Sans Mono", monospace';

const KOSE = [2, 2, 0, 0] as [number, number, number, number];

/** Eksen etiketleri milyon cinsinden — panodaki bütün rakamlar gibi TR. */
const milyon = (v: number) =>
  v === 0 ? "0" : `${(v / 1_000_000).toFixed(1).replace(".", ",")}M`;

function secenekUret(
  noktalar: GrafikNoktasi[],
  mod: Mod,
  aktif: number | null,
  toplamBedel: number,
): Secenek {
  const cizgiDeger = (p: GrafikNoktasi) =>
    mod === "kumulatif" ? p.kumulatif : p.bakiye;

  // Kolonlar yalnız 18 taksiti taşır. Peşinat ayı taksitin ~6 katı; aynı
  // eksene konsaydı taksit kolonları okunmaz hale gelirdi ve kolonun boyu
  // tutardır — eksen kırılamaz. Peşinat çizginin başlangıç yüksekliğinde
  // ve okuma panelinde zaten duruyor.
  const taksitler = noktalar.filter((p) => p.i > 0);
  const enBuyukAy = Math.max(
    ...taksitler.map((p) => Math.max(p.beklenen, p.odenen)),
  );
  // Tavana pay bırakılır: eşit taksitler eksene dayanırsa kolonlar
  // parmaklık gibi görünür ve fazla/eksik ödeme farkı okunmaz olur.
  const solTavan = Math.ceil((enBuyukAy * 1.35) / 100_000) * 100_000;
  const kolonDegeri = (p: GrafikNoktasi, v: number) =>
    p.i === 0 || v <= 0 ? null : v;

  const sonGercek = sonGercekIndex(noktalar);
  const aktifNokta = aktif === null ? null : noktalar[aktif];

  const kolonlar: (BarSeriesOption | LineSeriesOption)[] = [
    {
      // Beklenen: açık zeminli, çerçeveli kolon — henüz gerçekleşmedi.
      // 19 ay dar bir karta sığdığı için kolon ~9px; bu genişlikte kesik
      // çerçeve parmaklığa dönüşüyor, o yüzden burada çizgi sürekli.
      // Kesik çizgi dili pastada ve ilerleme çubuğunda korunuyor.
      name: "Beklenen",
      type: "bar",
      silent: true,
      z: 2,
      yAxisIndex: 0,
      barGap: "10%",
      barCategoryGap: "28%",
      data: noktalar.map((p) => kolonDegeri(p, p.beklenen)),
      itemStyle: {
        color: VURGU,
        borderColor: SERI_2,
        borderWidth: 1.2,
        borderRadius: KOSE,
      },
    },
    {
      // Ödenen: dolu kolon. Ödeme girilmemiş ay hiç kolon çizmez.
      name: "Ödenen",
      type: "bar",
      silent: true,
      z: 3,
      yAxisIndex: 0,
      data: noktalar.map((p) => kolonDegeri(p, p.odenen)),
      itemStyle: { color: SERI_1, borderRadius: KOSE },
    },
  ];

  const cizgiler: LineSeriesOption[] = [
    {
      name: "Plan",
      type: "line",
      silent: true,
      z: 4,
      yAxisIndex: 1,
      symbol: "none",
      data: noktalar.map((p) => (p.i >= sonGercek ? cizgiDeger(p) : null)),
      lineStyle: { color: SERI_2, width: 2, type: [6, 4] },
    },
    {
      name: "Gerçekleşen",
      type: "line",
      silent: true,
      z: 5,
      yAxisIndex: 1,
      // Gerçekleşen noktalar az; her biri kaydedilmiş bir ödemedir,
      // o yüzden nokta olarak da gösterilir.
      symbol: "circle",
      symbolSize: 6,
      showSymbol: true,
      data: noktalar.map((p) => (p.i <= sonGercek ? cizgiDeger(p) : null)),
      itemStyle: { color: SERI_1 },
      lineStyle: { color: SERI_1, width: 2 },
    },
  ];

  const imlec: ScatterSeriesOption = {
    type: "scatter",
    silent: true,
    animation: false,
    z: 6,
    yAxisIndex: 1,
    symbolSize: 9,
    data: noktalar.map((p) => (p.i === aktif ? cizgiDeger(p) : null)),
    itemStyle: {
      color: KAGIT,
      borderColor: aktifNokta?.gecmis ? SERI_1 : SERI_2,
      borderWidth: 2.5,
    },
    markLine:
      aktif === null
        ? undefined
        : {
            silent: true,
            animation: false,
            symbol: "none",
            label: { show: false },
            emphasis: { disabled: true },
            lineStyle: { color: GECE, width: 1, type: [3, 3] },
            data: [{ xAxis: aktif }],
          },
  };

  const eksenAdi = {
    color: GRI,
    fontSize: 10,
    fontFamily: YAZI,
  };

  return {
    animationDuration: 380,
    textStyle: { fontFamily: YAZI },
    grid: { left: 48, right: 54, top: 30, bottom: 30 },
    xAxis: {
      type: "category",
      data: noktalar.map((p) => p.kisa),
      boundaryGap: true,
      axisLine: { lineStyle: { color: CIZGI } },
      axisTick: { show: false },
      axisLabel: {
        color: GRI,
        fontSize: 11,
        margin: 14,
        interval: (i: number) => i % 3 === 0,
      },
    },
    yAxis: [
      {
        type: "value",
        name: "AYLIK",
        nameGap: 12,
        nameTextStyle: { ...eksenAdi, align: "left" },
        min: 0,
        max: solTavan,
        interval: solTavan / 2,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: CIZGI_2 } },
        axisLabel: { color: GRI, fontSize: 11, margin: 8, formatter: milyon },
      },
      {
        type: "value",
        name: mod === "kumulatif" ? "KÜMÜLATİF" : "BAKİYE",
        nameGap: 12,
        nameTextStyle: { ...eksenAdi, align: "right" },
        min: 0,
        max: toplamBedel,
        interval: toplamBedel / 2,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { color: GRI, fontSize: 11, margin: 8, formatter: milyon },
      },
    ],
    series: [...kolonlar, ...cizgiler, imlec],
  };
}

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
  const kutu = useRef<HTMLDivElement>(null);
  const grafik = useRef<ECharts | null>(null);

  // Olay dinleyicileri bir kez bağlanır; güncel callback'lere ref'ten bakar.
  const gezinRef = useRef(onGezin);
  const secRef = useRef(onSec);
  const sayiRef = useRef(noktalar.length);
  useEffect(() => {
    gezinRef.current = onGezin;
    secRef.current = onSec;
    sayiRef.current = noktalar.length;
  });

  const secenek = useMemo(
    () => secenekUret(noktalar, mod, aktif, toplamBedel),
    [noktalar, mod, aktif, toplamBedel],
  );

  useEffect(() => {
    const el = kutu.current;
    if (!el) return;

    const g = echarts.init(el, undefined, { renderer: "svg" });
    grafik.current = g;

    const indeks = (ev: ElementEvent) => {
      const p: [number, number] = [ev.offsetX, ev.offsetY];
      if (!g.containPixel({ gridIndex: 0 }, p)) return null;
      const x = g.convertFromPixel({ xAxisIndex: 0 }, p[0]) as number;
      const i = Math.round(x);
      return i >= 0 && i < sayiRef.current ? i : null;
    };

    const zr = g.getZr();
    zr.on("mousemove", (ev: ElementEvent) => gezinRef.current(indeks(ev)));
    zr.on("globalout", () => gezinRef.current(null));
    zr.on("click", (ev: ElementEvent) => {
      const i = indeks(ev);
      if (i !== null) secRef.current(i);
    });

    const ro = new ResizeObserver(() => g.resize());
    ro.observe(el);

    return () => {
      ro.disconnect();
      g.dispose();
      grafik.current = null;
    };
  }, []);

  useEffect(() => {
    grafik.current?.setOption(secenek, { replaceMerge: "series" });
  }, [secenek]);

  return (
    <div
      ref={kutu}
      role="img"
      aria-label={aciklama}
      style={{ width: "100%", aspectRatio: "470 / 210", cursor: "crosshair" }}
    />
  );
}
