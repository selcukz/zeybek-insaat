import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { projeler, durumEtiketi } from "@/lib/data";
import Halka from "@/components/halka";

export const metadata: Metadata = {
  title: "İnşaat takibi",
  description:
    "Zeybek İnşaat'ın devam eden ve teslim edilen projelerinde aylık ölçülmüş fiziksel gerçekleşme oranları.",
};

const trTarih = (iso: string) =>
  new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export default function TakipListesi() {
  const takiptekiler = projeler.filter((p) => p.durum !== "yeni");

  return (
    <>
      <section className="border-b border-beton-300 bg-beton-100 pb-14 pt-[9.5rem] lg:pb-20 lg:pt-[11.5rem]">
        <div className="shell">
          <p className="eyebrow text-tuc-600">İnşaat takibi</p>
          <h1 className="display mt-4 max-w-[20ch] text-[clamp(2.25rem,4.4vw,4rem)]">
            Her ay ölçülür, <em>aynı gün</em> yayımlanır
          </h1>
          <p className="mt-6 max-w-[52rem] text-[1.0625rem] leading-relaxed text-kursun-500">
            Aşağıdaki oranlar, ayın son iş günü sahada yapılan imalat ölçümüne
            dayanır ve hak sahibi portalındaki hakediş dosyasıyla birebir
            aynıdır. Tahmin ya da hedef değil, gerçekleşen imalattır.
          </p>
        </div>
      </section>

      <section className="py-14 lg:py-20">
        <div className="shell grid gap-px bg-beton-300">
          {takiptekiler.map((p) => (
            <Link
              key={p.slug}
              href={`/insaat-takibi/${p.slug}`}
              className="group grid items-center gap-8 bg-kagit p-6 transition-colors hover:bg-beton-100 lg:grid-cols-[16rem_1fr_auto] lg:p-8"
            >
              <div className="relative aspect-4/3 overflow-hidden bg-beton-200 lg:aspect-3/2">
                <Image
                  src={p.saha[0]}
                  alt={`${p.ad} şantiyesi`}
                  fill
                  sizes="16rem"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
              </div>

              <div>
                <p className="eyebrow text-tuc-600">
                  {durumEtiketi[p.durum]} · {p.mahalle}, {p.ilce}
                </p>
                <h2 className="display mt-3 text-[clamp(1.5rem,2.2vw,2rem)]">
                  {p.ad}
                </h2>
                <p className="mt-3 max-w-[52ch] text-[0.9375rem] leading-relaxed text-kursun-500">
                  {p.ozet}
                </p>
                <dl className="mt-5 flex flex-wrap gap-x-10 gap-y-3">
                  {[
                    { e: "Son ölçüm", d: trTarih(p.sonGuncelleme) },
                    { e: "Teslim", d: trTarih(p.sozlesmeTeslim) },
                    {
                      e: "Bağımsız bölüm",
                      d: `${p.bloklar.reduce((t, b) => t + b.bagimsizBolum, 0)}`,
                    },
                  ].map((s) => (
                    <div key={s.e}>
                      <dt className="eyebrow text-kursun-400">{s.e}</dt>
                      <dd className="data mt-1.5 text-[0.8125rem] text-kursun-800">
                        {s.d}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="justify-self-start lg:justify-self-end">
                <Halka yuzde={p.genelYuzde} />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
