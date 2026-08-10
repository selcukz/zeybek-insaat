import type { Block } from "@/lib/data";

const KAT_YUKSEKLIGI = 3.1;

function kot(m: number) {
  const s = Math.abs(m).toFixed(2).replace(".", ",");
  return `${m < 0 ? "−" : "+"}${s}`;
}

/**
 * Kat Takip — kaba inşaatın ulaştığı kotu bina kesiti üzerinde gösterir.
 * Dolu katlar tamamlanmış, taramalı kat imalatta, boş katlar bekleyen kattır.
 */
export default function KatTakip({ blok }: { blok: Block }) {
  const ustKatlar = Array.from({ length: blok.katlar }, (_, i) => i).reverse();
  const bodrumlar = Array.from({ length: blok.bodrum }, (_, i) => -(i + 1));
  const bodrumTamam = blok.tamamlananKat > 0;
  const ulasilanKot = blok.tamamlananKat * KAT_YUKSEKLIGI;
  const satirYuksekligi = "h-5 sm:h-6";

  const etiket = (i: number) => (i === 0 ? "Z" : `${i}`);

  return (
    // Genişlik sınırı kesitin bina oranında okunmasını sağlar
    <figure className="w-full max-w-[24rem]">
      <figcaption className="mb-4 flex items-end justify-between gap-4 border-b border-beton-300 pb-3">
        <div>
          <span className="eyebrow text-tuc-600">{blok.ad}</span>
          <p className="data mt-1.5 text-[0.6875rem] text-kursun-500">
            {blok.bodrum} bodrum · {blok.katlar} kat ·{" "}
            {blok.bagimsizBolum} bağımsız bölüm
          </p>
        </div>
        <div className="text-right">
          <p className="data text-lg leading-none text-kursun-800">
            {kot(ulasilanKot)}
          </p>
          <p className="eyebrow mt-1.5 text-kursun-400">Ulaşılan kot</p>
        </div>
      </figcaption>

      <div className="space-y-[3px]">
        {/* Zemin üstü */}
        {ustKatlar.map((i) => {
          const tamam = i < blok.tamamlananKat;
          const aktif = i === blok.tamamlananKat && blok.aktifKatYuzde > 0;
          return (
            <div key={i} className="flex items-center gap-3">
              <span
                className={`data w-7 shrink-0 text-right text-[0.625rem] tabular-nums ${
                  tamam || aktif ? "text-kursun-600" : "text-beton-400"
                }`}
              >
                {etiket(i)}
              </span>
              <div
                className={`relative flex-1 ${satirYuksekligi} border ${
                  tamam
                    ? "border-file-700 bg-file-600"
                    : aktif
                      ? "border-file-600 bg-file-200"
                      : "border-beton-300 bg-transparent"
                }`}
              >
                {aktif && (
                  <div
                    className="hatch absolute inset-y-0 left-0"
                    style={{ width: `${blok.aktifKatYuzde}%` }}
                  />
                )}
              </div>
              <span className="data hidden w-[4.5rem] shrink-0 text-[0.5625rem] leading-tight text-file-700 sm:block">
                {aktif ? `imalatta %${blok.aktifKatYuzde}` : ""}
              </span>
            </div>
          );
        })}

        {/* Zemin kotu */}
        <div className="flex items-center gap-3 pt-1">
          <span className="data w-7 shrink-0 text-right text-[0.625rem] text-kursun-800">
            ±0
          </span>
          <div className="flex-1 border-t-2 border-kursun-800" />
          <span className="data hidden w-[4.5rem] shrink-0 text-[0.5625rem] text-kursun-500 sm:block">
            zemin kotu
          </span>
        </div>

        {/* Bodrumlar */}
        {bodrumlar.map((i) => (
          <div key={i} className="flex items-center gap-3">
            <span
              className={`data w-7 shrink-0 text-right text-[0.625rem] ${
                bodrumTamam ? "text-kursun-600" : "text-beton-400"
              }`}
            >
              {i}
            </span>
            <div
              className={`relative flex-1 ${satirYuksekligi} border ${
                bodrumTamam
                  ? "border-kursun-700 bg-kursun-600"
                  : "hatch-earth border-beton-300"
              }`}
            />
            <span className="data hidden w-[4.5rem] shrink-0 sm:block" />
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-beton-300 pt-3">
        <Anahtar sinif="border-file-700 bg-file-600" ad="Tamamlandı" />
        <Anahtar sinif="hatch border-file-600" ad="İmalatta" />
        <Anahtar sinif="border-beton-300" ad="Bekleyen" />
        <Anahtar sinif="border-kursun-700 bg-kursun-600" ad="Bodrum" />
      </div>
    </figure>
  );
}

function Anahtar({ sinif, ad }: { sinif: string; ad: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className={`h-2.5 w-5 border ${sinif}`} aria-hidden />
      <span className="eyebrow text-kursun-500">{ad}</span>
    </span>
  );
}
