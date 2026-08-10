import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { projeler, projeBul, durumEtiketi } from "@/lib/data";
import { OzellikIkonu, KonumIkonu } from "@/components/ikonlar";
import ProjeRayi from "@/components/proje-rayi";

export function generateStaticParams() {
  return projeler.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/projeler/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const proje = projeBul(slug);
  if (!proje) return {};
  return { title: `${proje.ad} — ${proje.ilce}`, description: proje.ozet };
}

export default async function ProjeSayfasi({
  params,
}: PageProps<"/projeler/[slug]">) {
  const { slug } = await params;
  const proje = projeBul(slug);
  if (!proje) notFound();

  const digerleri = projeler.filter((p) => p.slug !== proje.slug);
  const takipEdilebilir = proje.durum !== "yeni";

  return (
    <>
      {/* Hero */}
      <section className="relative h-[min(78vh,44rem)] min-h-[26rem]">
        <Image
          src={proje.gorsel}
          alt={`${proje.ad}, ${proje.mahalle}, ${proje.ilce}`}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/45" />
        <div className="absolute inset-x-0 bottom-0">
          <div className="shell pb-10">
            <div className="inline-block bg-kagit px-8 py-6">
              <p className="display text-[1.5rem] leading-none">{proje.ad}</p>
              <p className="eyebrow mt-3 text-tuc-600">
                {proje.mahalle} · {proje.ilce}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tanıtım + özellikler */}
      <section className="py-16 lg:py-24">
        <div className="shell grid gap-14 lg:grid-cols-[1fr_1fr] xl:gap-24">
          <div>
            <p className="eyebrow text-tuc-600">{durumEtiketi[proje.durum]}</p>
            <h1 className="display mt-4 text-[clamp(2rem,3.6vw,3.5rem)]">
              {proje.ad}
            </h1>
            <p className="mt-4 text-[1.0625rem] text-kursun-600">
              {proje.slogan}
            </p>

            <div className="prose-tr mt-8 text-[0.9375rem] text-kursun-600">
              {proje.aciklama.map((p) => (
                <p key={p.slice(0, 40)}>{p}</p>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              {takipEdilebilir && (
                <Link
                  href={`/insaat-takibi/${proje.slug}`}
                  className="btn btn-outline"
                >
                  İnşaat takibi
                </Link>
              )}
              <Link href="/#iletisim" className="btn btn-solid">
                Bilgi talebi
              </Link>
            </div>
          </div>

          <div>
            <p className="eyebrow text-kursun-500">Proje özellikleri</p>
            {/* Kenarlıklar hücrelerin üzerinde: tek sayıda özellikte
                boş ızgara hücresi dolgu bloğu olarak görünmez. */}
            <ul className="mt-5 grid grid-cols-2 border-l border-t border-beton-300 sm:grid-cols-3">
              {proje.ozellikler.map((o) => (
                <li
                  key={o.ad}
                  className="flex flex-col items-center gap-3.5 border-b border-r border-beton-300 px-4 py-8 text-center"
                >
                  <OzellikIkonu ad={o.ikon} className="h-7 w-7 text-tuc-500" />
                  <span className="text-[0.75rem] leading-snug text-kursun-600">
                    {o.ad}
                  </span>
                </li>
              ))}
            </ul>

            <p className="eyebrow mt-12 text-kursun-500">Künye</p>
            <dl className="mt-5 divide-y divide-beton-300 border-y border-beton-300">
              {proje.kunye.map((k) => (
                <div
                  key={k.etiket}
                  className="flex items-baseline justify-between gap-6 py-3.5"
                >
                  <dt className="text-[0.8125rem] text-kursun-500">
                    {k.etiket}
                  </dt>
                  <dd className="data text-[0.8125rem] text-kursun-800">
                    {k.deger}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Görseller */}
      <section className="border-y border-beton-300 bg-beton-100 py-16 lg:py-24">
        <div className="shell mb-9">
          <p className="eyebrow text-tuc-600">Görseller</p>
          <h2 className="display mt-4 text-[clamp(1.75rem,3vw,2.75rem)]">
            Projeden <em>kareler</em>
          </h2>
        </div>
        <div className="shell-bleed-right">
          <div className="rail gap-3">
            {proje.gorseller.map((g, i) => (
              <div
                key={g + i}
                className="relative aspect-4/3 w-[clamp(20rem,42vw,52rem)] overflow-hidden bg-beton-200"
              >
                <Image
                  src={g}
                  alt={`${proje.ad} — görsel ${i + 1}`}
                  fill
                  sizes="(max-width: 768px) 85vw, 52rem"
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

      {/* Konum */}
      <section className="py-16 lg:py-24">
        <div className="shell grid gap-12 lg:grid-cols-[1fr_1.2fr] xl:gap-20">
          <div>
            <p className="eyebrow text-tuc-600">Konum</p>
            <h2 className="display mt-4 text-[clamp(1.75rem,3vw,2.75rem)]">
              {proje.mahalle}&rsquo;den <em>ne kadar uzakta</em>
            </h2>
            <p className="mt-6 max-w-[38rem] text-[0.9375rem] leading-relaxed text-kursun-500">
              Süreler özel araçla, gün içi normal trafik koşullarında
              hesaplanmıştır. Yürüme mesafeleri ayrıca belirtilmiştir.
            </p>
            <p className="data mt-8 border-l-2 border-tuc-500 py-1 pl-4 text-[0.75rem] leading-relaxed text-kursun-400">
              Harita, parsel bilgisi kesinleştiğinde eklenecektir.
            </p>
          </div>

          <ul className="divide-y divide-beton-300 border-y border-beton-300">
            {proje.konum.map((k) => (
              <li key={k.ad} className="flex items-center gap-5 py-4">
                <KonumIkonu ad={k.ikon} className="h-5 w-5 text-tuc-500" />
                <span className="flex-1 text-[0.9375rem] text-kursun-700">
                  {k.ad}
                </span>
                <span className="data text-[0.8125rem] text-kursun-800">
                  {k.dakika} dk
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Bilgilendirme şeridi */}
      <section className="bg-kursun-800">
        <div className="shell flex flex-col items-start gap-6 py-10 md:flex-row md:items-center md:justify-between">
          <p className="max-w-[46rem] text-[1.0625rem] text-white/85">
            {proje.ad} hakkındaki gelişmelerden haberdar olmak ister misiniz?
          </p>
          <Link href="/#iletisim" className="btn btn-ghost shrink-0">
            Bilgi almak istiyorum
          </Link>
        </div>
      </section>

      {/* Diğer projeler */}
      <section className="py-16 lg:py-24">
        <div className="shell mb-9">
          <p className="eyebrow text-tuc-600">Diğer projeler</p>
          <h2 className="display mt-4 text-[clamp(1.75rem,3vw,2.75rem)]">
            Şehirdeki <em>diğer</em> işlerimiz
          </h2>
        </div>
        <div className="shell-bleed-right">
          <ProjeRayi projeler={digerleri} />
        </div>
      </section>
    </>
  );
}
