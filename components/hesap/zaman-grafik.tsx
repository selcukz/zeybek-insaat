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
 * Ödeme profili — bakiye / kümülatif / aylık görünümleri.
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

export type Mod = "bakiye" | "kumulatif" | "aylik";

const SERI_1 = "#1b6fa8"; /* gerçekleşen */
const SERI_2 = "#5fc2e8"; /* planlanan   */
const GECE = "#051c2c";
const GRI = "#8a98a5";
const KAGIT = "#ffffff";
const CIZGI = "#dce3e8";
const CIZGI_2 = "#eef2f5";

const YAZI =
  'Consolas, "Cascadia Mono", Menlo, "DejaVu Sans Mono", monospace';

function secenekUret(
  noktalar: GrafikNoktasi[],
  mod: Mod,
  aktif: number | null,
  toplamBedel: number,
): Secenek {
  const alanModu = mod !== "aylik";
  const deger = (p: GrafikNoktasi) =>
    mod === "bakiye" ? p.bakiye : mod === "kumulatif" ? p.kumulatif : p.tutar;

  const tavan = alanModu
    ? toplamBedel
    : Math.max(...noktalar.map((p) => p.tutar));

  const sonGercek = sonGercekIndex(noktalar);
  const aktifNokta = aktif === null ? null : noktalar[aktif];

  const seriler: Secenek["series"] = alanModu
    ? [
        {
          // Plan alanı doldurulmaz: içi boş kesik çizgi = henüz olmadı.
          // Pastadaki "kalan borç" dilimiyle aynı okuma.
          name: "Planlanan",
          type: "line",
          step: "end",
          silent: true,
          z: 2,
          symbol: "none",
          data: noktalar.map((p) => (p.i >= sonGercek ? deger(p) : null)),
          lineStyle: { color: SERI_2, width: 2, type: [6, 4] },
        },
        {
          name: "Gerçekleşen",
          type: "line",
          step: "end",
          silent: true,
          z: 3,
          // Gerçekleşen noktalar az; her biri kaydedilmiş bir ödemedir,
          // o yüzden nokta olarak da gösterilir.
          symbol: "circle",
          symbolSize: 6,
          showSymbol: true,
          data: noktalar.map((p) => (p.i <= sonGercek ? deger(p) : null)),
          itemStyle: { color: SERI_1 },
          lineStyle: { color: SERI_1, width: 2 },
          areaStyle: { color: SERI_1, opacity: 0.14 },
        },
      ]
    : [
        {
          name: "Aylık",
          type: "bar",
          silent: true,
          z: 2,
          barWidth: "56%",
          // Ödenen ay dolu; henüz gelmemiş ay içi boş kesik çizgili.
          data: noktalar.map((p) => ({
            value: p.tutar,
            itemStyle: p.gecmis
              ? {
                  color: SERI_1,
                  borderRadius: [2, 2, 0, 0] as [number, number, number, number],
                }
              : {
                  color: KAGIT,
                  borderColor: SERI_2,
                  borderWidth: 1.4,
                  borderType: [5, 3] as [number, number],
                  borderRadius: [2, 2, 0, 0] as [number, number, number, number],
                },
          })),
        },
      ];

  const imlec: ScatterSeriesOption = {
    type: "scatter",
    silent: true,
    animation: false,
    z: 5,
    symbolSize: 9,
    data: noktalar.map((p) => (p.i === aktif ? deger(p) : null)),
    itemStyle: {
      color: "#ffffff",
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

  return {
    animationDuration: 380,
    textStyle: { fontFamily: YAZI },
    grid: { left: 46, right: 18, top: 12, bottom: 30 },
    xAxis: {
      type: "category",
      data: noktalar.map((p) => p.kisa),
      boundaryGap: !alanModu,
      axisLine: { lineStyle: { color: CIZGI } },
      axisTick: { show: false },
      axisLabel: {
        color: GRI,
        fontSize: 11,
        margin: 14,
        interval: (i: number) => i % 6 === 0,
      },
    },
    yAxis: {
      type: "value",
      min: 0,
      max: tavan,
      interval: tavan / 2,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: CIZGI_2 } },
      axisLabel: {
        color: GRI,
        fontSize: 11,
        margin: 8,
        formatter: (v: number) =>
          v === 0 ? "0" : `${(v / 1_000_000).toFixed(1).replace(".", ",")}M`,
      },
    },
    series: [...seriler, imlec],
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
    grafik.current?.setOption(secenek);
  }, [secenek]);

  return (
    <div
      ref={kutu}
      role="img"
      aria-label={aciklama}
      style={{ width: "100%", aspectRatio: "470 / 196", cursor: "crosshair" }}
    />
  );
}
