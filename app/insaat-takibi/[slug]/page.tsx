import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { projeler, projeBul, durumEtiketi } from "@/lib/data";
import Halka from "@/components/halka";
import KatTakip from "@/components/kat-takip";

export function generateStaticParams() {
  return projeler
    .filter((p) => p.durum !== "yeni")
    .map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/insaat-takibi/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const proje = projeBul(slug);
  if (!proje) return {};
  return {
    title: `${proje.ad} inşaat takibi`,
    description: `${proje.ad} projesinde fiziksel gerçekleşme %${proje.genelYuzde}. Son saha ölçümü ${proje.sonGuncelleme}.`,
  };
}

const trTarih = (iso: string) =>
  new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export default async function TakipSayfasi({
  params,
}: PageProps<"/insaat-takibi/[slug]">) {
  const { slug } = await params;
  const proje = projeBul(slug);
  if (!proje || proje.durum === "yeni") notFound();

  return (
    <>
      {/* Hero */}
      <section className="relative h-[min(70vh,38rem)] min-h-[24rem]">
        <Image
          src={proje.saha[0]}
          alt={`${proje.ad} şantiyesi`}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/45" />
        <div className="absolute inset-x-0 bottom-0">
          <div className="shell pb-10">
            <div className="inline-block bg-kagit px-8 py-6">
              <p className="eyebrow text-tuc-600">İnşaat takibi</p>
              <p className="display mt-3 text-[1.5rem] leading-none">
                {proje.ad}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Genel durum */}
      <section className="py-16 lg:py-24">
        <div className="shell">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow text-tuc-600">
                {durumEtiketi[proje.durum]} · {proje.mahalle}, {proje.ilce}
              </p>
              <h1 className="display mt-4 text-[clamp(2rem,3.6vw,3.5rem)]">
                Fiziksel <em>gerçekleşme</em>
              </h1>
            </div>
            <Link
              href={`/projeler/${proje.slug}`}
              className="btn btn-outline"
            >
              Proje künyesi
            </Link>
          </div>

          <div className="grid gap-px border border-beton-300 bg-beton-300 lg:grid-cols-[auto_1fr]">
            <div className="flex flex-col items-center justify-center gap-6 bg-kagit px-10 py-12">
              <Halka yuzde={proje.genelYuzde} buyuk />
              <p className="eyebrow text-kursun-500">Genel ilerleme</p>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-10 bg-kagit p-10 sm:grid-cols-3 xl:grid-cols-6">
              {proje.imalat.map((i) => (
                <Halka key={i.ad} yuzde={i.yuzde} ad={i.ad} />
              ))}
            </div>
          </div>

          <dl className="mt-px grid gap-px border border-t-0 border-beton-300 bg-beton-300 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { e: "Son saha ölçümü", d: trTarih(proje.sonGuncelleme) },
              { e: "Sözleşmesel teslim", d: trTarih(proje.sozlesmeTeslim) },
              {
                e: "Bağımsız bölüm",
                d: `${proje.bloklar.reduce((t, b) => t + b.bagimsizBolum, 0)} adet`,
              },
              { e: "Yüklenici", d: "Zeybek İnşaat" },
            ].map((s) => (
              <div key={s.e} className="bg-kagit p-6">
                <dt className="eyebrow text-kursun-400">{s.e}</dt>
                <dd className="data mt-2.5 text-[0.9375rem] text-kursun-800">
                  {s.d}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Kat kesitleri */}
      <section className="border-y border-beton-300 bg-beton-100 py-16 lg:py-24">
        <div className="shell">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow text-tuc-600">Kaba inşaat</p>
              <h2 className="display mt-4 text-[clamp(1.75rem,3vw,2.75rem)]">
                Hangi <em>kattayız</em>
              </h2>
            </div>
            <p className="max-w-[34rem] text-[0.9375rem] leading-relaxed text-kursun-500">
              Her satır bir kat döşemesidir. Dolu katların betonu dökülmüş,
              taramalı katta kalıp ve donatı imalatı sürüyor demektir.
            </p>
          </div>

          <div className="grid gap-x-14 gap-y-12 border border-beton-300 bg-kagit p-8 sm:grid-cols-2 xl:p-12">
            {proje.bloklar.map((b) => (
              <KatTakip key={b.ad} blok={b} />
            ))}
          </div>
        </div>
      </section>

      {/* Saha fotoğrafları */}
      <section className="py-16 lg:py-24">
        <div className="shell mb-9">
          <p className="eyebrow text-tuc-600">
            {proje.durum === "tamamlandi"
              ? "Teslim edilen yapı"
              : `${trTarih(proje.sonGuncelleme)} sahası`}
          </p>
          <h2 className="display mt-4 text-[clamp(1.75rem,3vw,2.75rem)]">
            {proje.durum === "tamamlandi" ? (
              <>
                Tamamlanmış <em>hâli</em>
              </>
            ) : (
              <>
                Bu ay <em>çekilenler</em>
              </>
            )}
          </h2>
        </div>
        <div className="shell-bleed-right">
          <div className="rail gap-3">
            {proje.saha.map((g, i) => (
              <div
                key={g + i}
                className="relative aspect-4/3 w-[clamp(20rem,38vw,46rem)] overflow-hidden bg-beton-200"
              >
                <Image
                  src={g}
                  alt={`${proje.ad} şantiyesi — fotoğraf ${i + 1}`}
                  fill
                  sizes="(max-width: 768px) 85vw, 46rem"
                  className="object-cover"
                />
              </div>
            ))}
            <div
              className="w-[max(var(--spacing-margin),1px)] shrink-0"
              aria-hidden
            />
          </div>
        </div>
      </section>

      {/* Saha notu */}
      <section className="border-t border-beton-300 bg-beton-100 py-16 lg:py-24">
        <div className="shell grid gap-12 lg:grid-cols-[22rem_1fr] xl:gap-20">
          <div>
            <p className="eyebrow text-tuc-600">Saha notu</p>
            <h2 className="display mt-4 text-[clamp(1.75rem,2.6vw,2.5rem)]">
              Şantiye <em>şefinden</em>
            </h2>
            <p className="data mt-6 text-[0.75rem] leading-relaxed text-kursun-400">
              Bu not her ayın son iş gününde güncellenir ve hak sahibi
              portalındaki aylık raporun aynısıdır.
            </p>
          </div>
          <div className="prose-tr text-[0.9375rem] text-kursun-600">
            {proje.ilerlemeNotu.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
