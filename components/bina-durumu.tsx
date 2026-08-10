"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import type { Project } from "@/lib/data";
import KatTakip from "./kat-takip";
import Halka from "./halka";

const trTarih = (iso: string) =>
  new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

/**
 * Bugünün tarihi yalnızca istemcide bilinir; sunucu ve istemci saatleri
 * farklı olabileceği için sunucuda null döner ve "kalan gün" tire gösterilir.
 * Anlık görüntü önbelleklenir, aksi hâlde her render yeni değer üretirdi.
 */
let bugunOnbellek: number | null = null;
const abonelikYok = () => () => {};
const istemciBugun = () => (bugunOnbellek ??= Date.now());
const sunucuBugun = () => null;

export default function BinaDurumu({ projeler }: { projeler: Project[] }) {
  const [aktif, setAktif] = useState(projeler[0].slug);
  const bugun = useSyncExternalStore(
    abonelikYok,
    istemciBugun,
    sunucuBugun,
  );

  const proje = projeler.find((p) => p.slug === aktif) ?? projeler[0];

  const kalan =
    bugun === null
      ? null
      : Math.ceil(
          (new Date(proje.sozlesmeTeslim).getTime() - bugun) / 86_400_000,
        );

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center gap-x-7 gap-y-3">
        {projeler.map((p) => (
          <button
            key={p.slug}
            type="button"
            onClick={() => setAktif(p.slug)}
            className={`eyebrow border-b-2 pb-1.5 transition-colors ${
              p.slug === aktif
                ? "border-tuc-500 text-kursun-800"
                : "border-transparent text-kursun-400 hover:text-kursun-600"
            }`}
          >
            {p.ad}
          </button>
        ))}
      </div>

      <div className="grid gap-px border border-beton-300 bg-beton-300 lg:grid-cols-[minmax(17rem,22rem)_1fr]">
        {/* Özet */}
        <div className="flex flex-col gap-7 bg-kagit p-7 xl:p-9">
          <div className="flex items-center gap-6">
            <Halka yuzde={proje.genelYuzde} />
            <div>
              <p className="eyebrow text-tuc-600">Fiziksel gerçekleşme</p>
              <p className="display mt-2 text-[1.5rem]">{proje.ad}</p>
              <p className="data mt-1 text-[0.6875rem] text-kursun-500">
                {proje.mahalle}, {proje.ilce}
              </p>
            </div>
          </div>

          <dl className="divide-y divide-beton-300 border-y border-beton-300">
            <Satir etiket="Sözleşmesel teslim" deger={trTarih(proje.sozlesmeTeslim)} />
            <Satir
              etiket="Teslime kalan"
              deger={kalan === null ? "—" : `${kalan.toLocaleString("tr-TR")} gün`}
            />
            <Satir etiket="Son saha ölçümü" deger={trTarih(proje.sonGuncelleme)} />
            <Satir
              etiket="Bağımsız bölüm"
              deger={`${proje.bloklar.reduce((t, b) => t + b.bagimsizBolum, 0)} adet`}
            />
          </dl>

          <p className="text-[0.8125rem] leading-relaxed text-kursun-500">
            Yüzdeler, ayın son iş günü sahada yapılan imalat ölçümüne dayanır ve
            hak sahibi portalındaki hakediş dosyasıyla birebir aynıdır.
          </p>

          <Link
            href={`/insaat-takibi/${proje.slug}`}
            className="btn btn-outline self-start"
          >
            Saha raporunu aç
          </Link>
        </div>

        {/* Kat kesitleri */}
        <div className="grid gap-x-12 gap-y-10 bg-kagit p-7 sm:grid-cols-2 xl:p-9">
          {proje.bloklar.map((b) => (
            <KatTakip key={b.ad} blok={b} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Satir({ etiket, deger }: { etiket: string; deger: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3">
      <dt className="eyebrow text-kursun-400">{etiket}</dt>
      <dd className="data text-[0.8125rem] text-kursun-800">{deger}</dd>
    </div>
  );
}
