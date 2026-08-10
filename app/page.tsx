import Image from "next/image";
import Link from "next/link";
import { projeler, devamEdenler, surec, kurum, projeBul } from "@/lib/data";
import ProjeRayi from "@/components/proje-rayi";
import BinaDurumu from "@/components/bina-durumu";
import PortalTelefon from "@/components/portal-telefon";
import Sorular from "@/components/sorular";
import KesifFormu from "@/components/kesif-formu";

const heroProje = projeBul("zeybek-meydan")!;
const yanProjeler = [projeBul("zeybek-kisikli")!, projeBul("zeybek-bahce")!];

export default function AnaSayfa() {
  return (
    <>
      {/* ---------------- Hero ---------------- */}
      <section className="relative grid h-[min(90vh,54rem)] min-h-[34rem] grid-cols-1 lg:grid-cols-[1.7fr_1fr_1fr]">
        <div className="relative col-span-full row-start-1 lg:col-span-1">
          <Image
            src="/gorseller/hero-ana.jpg"
            alt="Zeybek Meydan, Fikirtepe'de tamamlanan konut yapısı"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/40" />
        </div>

        {yanProjeler.map((p) => (
          <Link
            key={p.slug}
            href={`/projeler/${p.slug}`}
            className="group relative row-start-1 hidden border-l border-white/20 lg:block"
          >
            <Image
              src={p.gorsel}
              alt={`${p.ad}, ${p.mahalle}`}
              fill
              sizes="25vw"
              className="object-cover brightness-[0.78] transition-all duration-700 group-hover:scale-[1.03] group-hover:brightness-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/25" />
            <div className="absolute inset-x-0 bottom-0 p-7">
              <p className="display text-[1.375rem] text-white">{p.ad}</p>
              <p className="data mt-1.5 text-[0.6875rem] text-white/75">
                {p.mahalle}, {p.ilce}
              </p>
              <span className="eyebrow mt-4 inline-flex items-center gap-2 text-white/0 transition-colors duration-300 group-hover:text-white">
                Projeyi aç
                <svg
                  viewBox="0 0 16 8"
                  className="h-2 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  aria-hidden
                >
                  <path d="M0 4h14M11 1l3 3-3 3" />
                </svg>
              </span>
            </div>
          </Link>
        ))}

        {/* Metin katmanı */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 row-start-1">
          <div className="shell pb-12 lg:pb-16">
            <div className="pointer-events-auto max-w-[46rem] rise">
              <p className="eyebrow text-tuc-200">
                {heroProje.mahalle} · {heroProje.ad}
              </p>
              <h1 className="display mt-5 text-[clamp(2.5rem,5.2vw,5rem)] text-white">
                Aynı sokakta, <em>yeni</em> bir ev
              </h1>
              <p className="mt-6 max-w-[38rem] text-[1.0625rem] leading-relaxed text-white/80">
                Kentsel dönüşümü hak sahibi mahallesinden ayrılmadan
                tamamlıyoruz. Riskli yapı tespitinden anahtar teslimine kadar
                bütün süreci biz yürütüyor, ilerlemeyi her ay yazılı olarak
                paylaşıyoruz.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  href={`/projeler/${heroProje.slug}`}
                  className="btn btn-ghost"
                >
                  Projeyi inceleyin
                </Link>
                <Link href="#iletisim" className="btn btn-solid">
                  Ücretsiz keşif
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Rakamlar ---------------- */}
      <section className="border-b border-beton-300 bg-beton-100">
        <div className="shell">
          <dl className="grid grid-cols-2 gap-px bg-beton-300 lg:grid-cols-4">
            {kurum.rakamlar.map((r) => (
              <div key={r.etiket} className="bg-beton-100 px-6 py-9 lg:px-9">
                <dt className="data text-[clamp(2rem,3vw,2.75rem)] leading-none text-kursun-800">
                  {r.deger}
                </dt>
                <dd className="eyebrow mt-3.5 text-kursun-500">{r.etiket}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------------- Projeler ---------------- */}
      <section id="projeler" className="scroll-mt-28 py-20 lg:py-28">
        <div className="shell mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-tuc-600">Projeler</p>
            <h2 className="display mt-4 text-[clamp(2rem,3.6vw,3.5rem)]">
              Zeybek&rsquo;in <em>şehri</em>
            </h2>
          </div>
          <p className="max-w-[34rem] text-[0.9375rem] leading-relaxed text-kursun-500">
            Dokuz ilçede süren yerinde dönüşüm işleri. Her proje, aynı adada
            oturan maliklerle imzalanan kat karşılığı sözleşmeye dayanır.
          </p>
        </div>
        <div className="shell-bleed-right">
          <ProjeRayi
            projeler={projeler}
            filtreler={["hepsi", "devam", "tamamlandi", "yeni"]}
            not={{
              baslik: "Binanız listede yok mu?",
              metin:
                "Adresinizi bırakın, binanızı yerinde inceleyip ön değerlendirme raporunuzu ücretsiz verelim. Rapor sizi hiçbir şeye bağlamaz.",
              eylem: "Keşif talebi",
              href: "#iletisim",
            }}
          />
        </div>
      </section>

      {/* ---------------- İmza: kat takibi ---------------- */}
      <section
        id="takip"
        className="scroll-mt-28 border-y border-beton-300 bg-beton-100 py-20 lg:py-28"
      >
        <div className="shell">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow text-tuc-600">Canlı saha durumu</p>
              <h2 className="display mt-4 text-[clamp(2rem,3.6vw,3.5rem)]">
                Binanız ne <em>durumda</em>?
              </h2>
            </div>
            <p className="max-w-[34rem] text-[0.9375rem] leading-relaxed text-kursun-500">
              Kaba inşaatın ulaştığı kotu kat kat gösteriyoruz. Ölçüm her ayın
              son iş günü sahada yapılır; yüzde, hakediş dosyasındaki imalat
              miktarının aynısıdır.
            </p>
          </div>
          <BinaDurumu projeler={devamEdenler} />
        </div>
      </section>

      {/* ---------------- Süreç ---------------- */}
      <section id="surec" className="scroll-mt-28 py-20 lg:py-28">
        <div className="shell">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow text-tuc-600">6306 sayılı Kanun</p>
              <h2 className="display mt-4 text-[clamp(2rem,3.6vw,3.5rem)]">
                Kentsel dönüşüm <em>süreci</em>
              </h2>
            </div>
            <p className="max-w-[34rem] text-[0.9375rem] leading-relaxed text-kursun-500">
              Altı aşama, yasal sırasıyla. Süreler İstanbul&rsquo;da
              tamamladığımız işlerin ortalamasıdır; belediye ve tapu
              işlemlerine göre değişebilir.
            </p>
          </div>

          <ol className="grid gap-px bg-beton-300 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {surec.map((a, i) => (
              <li key={a.ad} className="bg-kagit p-7">
                <div className="flex items-baseline justify-between gap-3 border-b border-kursun-800 pb-3">
                  <span className="data text-[1.75rem] leading-none text-tuc-500">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="eyebrow text-kursun-400">{a.sure}</span>
                </div>
                <h3 className="display mt-5 text-[1.25rem]">{a.ad}</h3>
                <p className="eyebrow mt-2.5 text-tuc-600">{a.dayanak}</p>
                <p className="mt-4 text-[0.8125rem] leading-relaxed text-kursun-500">
                  {a.metin}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------------- Kurumsal ---------------- */}
      <section
        id="kurumsal"
        className="scroll-mt-28 border-y border-beton-300 bg-kursun-800 text-white"
      >
        <div className="grid lg:grid-cols-2">
          <div className="relative min-h-[22rem] lg:min-h-[38rem]">
            <Image
              src="/gorseller/avlu.jpg"
              alt="Tamamlanan bir Zeybek İnşaat projesinin ortak avlusu"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-center px-(--spacing-margin) py-16 lg:py-24">
            <div className="max-w-[38rem]">
              <p className="eyebrow text-tuc-400">Kurumsal</p>
              <h2 className="display mt-4 text-[clamp(2rem,3.2vw,3.25rem)]">
                Müteahhit, teslim <em>tarihiyle</em> ölçülür
              </h2>
              <div className="prose-tr mt-7 text-[0.9375rem] text-white/70">
                <p>
                  Zeybek İnşaat {kurum.kurulus} yılından bu yana yalnızca
                  İstanbul&rsquo;da, yalnızca kat karşılığı kentsel dönüşüm işi
                  yapıyor. Konut satışı ya da yatırım geliştirme yapmıyoruz;
                  tek müşterimiz binanın kat malikleridir.
                </p>
                <p>
                  Bugüne kadar teslim ettiğimiz on yedi projenin tamamı
                  sözleşmesel teslim tarihinde veya öncesinde tamamlandı. Bunu
                  mümkün kılan şey karmaşık bir yöntem değil: her ay ölçülen
                  gerçek imalat, tek bir taşeron zinciri ve maliklerle
                  paylaşılan açık bir programdır.
                </p>
              </div>

              <ul className="mt-9 grid gap-px bg-white/15 sm:grid-cols-3">
                {[
                  { b: "2 yıl", a: "İmalat garantisi" },
                  { b: "15 yıl", a: "Taşıyıcı sistem garantisi" },
                  { b: "Aylık", a: "Yazılı ilerleme raporu" },
                ].map((g) => (
                  <li key={g.a} className="bg-kursun-800 p-5">
                    <p className="data text-[1.25rem] text-white">{g.b}</p>
                    <p className="eyebrow mt-2 text-white/50">{g.a}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Portal ---------------- */}
      <section
        id="portal"
        className="scroll-mt-28 bg-beton-200 py-20 lg:py-28"
      >
        <div className="shell grid items-center gap-14 lg:grid-cols-[1fr_auto]">
          <div className="max-w-[42rem]">
            <p className="eyebrow text-tuc-600">Hak sahibi portalı</p>
            <h2 className="display mt-4 text-[clamp(2rem,3.6vw,3.5rem)]">
              Sözleşmeniz cebinizde, <em>her ay</em> güncel
            </h2>
            <p className="mt-6 text-[0.9375rem] leading-relaxed text-kursun-600">
              Sözleşmeyi imzalayan her malike bir portal hesabı açılır. Aynı
              bilgiye bütün maliklerin aynı anda ulaşması, dönüşüm sürecindeki
              anlaşmazlıkların çoğunu baştan bitirir.
            </p>

            <ul className="mt-8 grid gap-px bg-beton-300 sm:grid-cols-2">
              {[
                {
                  b: "Aylık ilerleme",
                  a: "Ölçülmüş imalat yüzdesi, saha fotoğrafları ve kalan gün sayısı.",
                },
                {
                  b: "Kira yardımı",
                  a: "Başvuru durumu ve her ayın ödeme kaydı.",
                },
                {
                  b: "Belgeleriniz",
                  a: "Sözleşme, muvafakatname, risk raporu ve ruhsatlar.",
                },
                {
                  b: "Daireniz",
                  a: "Kat, cephe, brüt alan ve teslim tarihi.",
                },
              ].map((m) => (
                <li key={m.b} className="bg-beton-200 py-5 pr-5 sm:pl-5 sm:first:pl-0">
                  <p className="text-[0.9375rem] font-semibold text-kursun-800">
                    {m.b}
                  </p>
                  <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-kursun-500">
                    {m.a}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#" className="btn btn-outline">
                iOS uygulaması
              </a>
              <a href="#" className="btn btn-outline">
                Android uygulaması
              </a>
              <a href="#" className="btn btn-outline">
                Tarayıcıdan giriş
              </a>
            </div>
          </div>

          <PortalTelefon />
        </div>
      </section>

      {/* ---------------- Sorular ---------------- */}
      <section id="sorular" className="scroll-mt-28 py-20 lg:py-28">
        <div className="shell grid gap-12 lg:grid-cols-[22rem_1fr] xl:gap-20">
          <div>
            <p className="eyebrow text-tuc-600">Sıkça sorulanlar</p>
            <h2 className="display mt-4 text-[clamp(2rem,3.2vw,3rem)]">
              Maliklerin en çok <em>sorduğu</em>
            </h2>
            <p className="mt-6 text-[0.9375rem] leading-relaxed text-kursun-500">
              Sorunuzun karşılığını bulamazsanız telefonla arayın; sözleşme
              öncesi bütün soruları ücretsiz cevaplıyoruz.
            </p>
            <a href={kurum.telefonHref} className="btn btn-outline mt-8">
              {kurum.telefon}
            </a>
          </div>
          <Sorular />
        </div>
      </section>

      {/* ---------------- İletişim ---------------- */}
      <section
        id="iletisim"
        className="scroll-mt-28 border-t border-beton-300 bg-beton-100 py-20 lg:py-28"
      >
        <div className="shell grid gap-12 lg:grid-cols-[1fr_1.1fr] xl:gap-20">
          <div>
            <p className="eyebrow text-tuc-600">İletişim</p>
            <h2 className="display mt-4 text-[clamp(2rem,3.6vw,3.5rem)]">
              Önce binanızı <em>görelim</em>
            </h2>
            <p className="mt-6 max-w-[38rem] text-[0.9375rem] leading-relaxed text-kursun-500">
              Keşif ücretsizdir ve sizi hiçbir şeye bağlamaz. İncelemenin
              sonunda binanızın durumunu, tahmini imar hakkını ve süreç
              takvimini yazılı olarak bırakıyoruz.
            </p>

            <dl className="mt-10 divide-y divide-beton-300 border-y border-beton-300">
              {[
                { e: "Telefon", d: kurum.telefon },
                { e: "E-posta", d: kurum.eposta },
                { e: "Adres", d: kurum.adres },
                { e: "Çalışma saatleri", d: "Hafta içi 09.00 – 18.00" },
              ].map((s) => (
                <div
                  key={s.e}
                  className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                >
                  <dt className="eyebrow text-kursun-400">{s.e}</dt>
                  <dd className="text-[0.9375rem] text-kursun-800 sm:text-right">
                    {s.d}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <KesifFormu />
        </div>
      </section>
    </>
  );
}
