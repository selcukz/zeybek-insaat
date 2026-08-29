import type { Metadata } from "next";
import BorcMerdiveni from "@/components/hesap/borc-merdiveni";
import Sayac from "@/components/hesap/sayac";
import TaksitListesi from "@/components/hesap/taksit-listesi";
import { cikisYap } from "./giris/actions";
import {
  hesapla,
  lira,
  liraKurus,
  odemeler,
  sozlesme,
  tarihKisa,
  tarihUzun,
} from "@/lib/hesap";

export const metadata: Metadata = {
  title: "Ödeme Takibi · Zeybek İnşaat",
  robots: { index: false, follow: false, nocache: true },
};

// "Bugün" her istekte doğru olsun
export const dynamic = "force-dynamic";

export default function HesapSayfasi() {
  const bugun = new Date();
  const h = hesapla(bugun);

  return (
    <main className="min-h-dvh bg-kagit pb-20">
      {/* ── Künye ── */}
      <header className="rise bg-kursun-900 px-[--spacing-margin] py-8 text-kagit">
        <div className="mx-auto flex max-w-(--spacing-container-max) flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-tuc-400">
              {sozlesme.proje} · {sozlesme.adaParsel}
            </p>
            <h1 className="display mt-3 text-4xl sm:text-5xl">
              {sozlesme.blok}, <em>{sozlesme.daire} No&apos;lu</em> Daire
            </h1>
          </div>

          <div className="flex items-end gap-8">
            <div>
              <p className="eyebrow text-kursun-400">Hak sahibi</p>
              <p className="data mt-2 text-[0.8125rem] text-beton-200">
                {sozlesme.hakSahibi}
              </p>
            </div>
            <div>
              <p className="eyebrow text-kursun-400">Son ödeme</p>
              <p className="data mt-2 text-[0.8125rem] text-beton-200">
                {tarihKisa(odemeler[odemeler.length - 1].tarih)}
              </p>
            </div>
            <form action={cikisYap}>
              <button
                type="submit"
                className="eyebrow text-kursun-400 underline underline-offset-4 transition-colors hover:text-tuc-400"
              >
                Çıkış
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* ── Kalan borç ── */}
      <section className="border-b border-beton-200 px-[--spacing-margin] py-11">
        <div className="mx-auto flex max-w-(--spacing-container-max) flex-wrap items-end justify-between gap-12">
          <div className="min-w-[20rem] flex-1">
            <p className="eyebrow text-tuc-600">Kalan borç</p>
            <p className="data an-acil mt-4 text-6xl leading-none font-medium sm:text-7xl">
              <Sayac deger={h.kalanBorc} />
              <span className="ml-2.5 text-3xl text-kursun-400">₺</span>
            </p>

            <div className="mt-7 flex items-center gap-4">
              <div className="relative h-3 flex-1 overflow-hidden border border-beton-300 bg-beton-100">
                <div
                  className="an-yay absolute inset-y-0 left-0 bg-file-600"
                  style={{ width: `${h.yuzde}%`, animationDelay: "300ms" }}
                />
                <div
                  className="hatch an-acil absolute inset-y-0 right-0 opacity-55"
                  style={{ left: `${h.yuzde}%`, animationDelay: "680ms" }}
                />
              </div>
              <span className="data w-16 text-right text-sm text-file-700">
                {h.yuzde.toFixed(1).replace(".", ",")}%
              </span>
            </div>
            <p className="eyebrow mt-3 text-kursun-400">Bedelin ödenen kısmı</p>
          </div>

          <dl className="grid w-full max-w-3xl grid-cols-2 border border-beton-200 lg:grid-cols-4">
            <Olcu
              etiket="Ödenen"
              deger={lira(h.toplamOdenen)}
              alt={`${odemeler.length} havale`}
              vurgu
              gecikme={100}
            />
            <Olcu
              etiket="Toplam bedel"
              deger={lira(sozlesme.toplamBedel)}
              alt="sözleşme"
              gecikme={170}
            />
            <Olcu
              etiket="Kalan taksit"
              deger={`${h.kalanTaksitSayisi} ay`}
              alt={`ayda ${lira(h.aylikTaksit)} ₺`}
              gecikme={240}
            />
            <Olcu
              etiket="Son vade"
              deger={h.bitisTarihi}
              alt={`${lira(h.kalanGun)} gün kaldı`}
              gecikme={310}
            />
          </dl>
        </div>
      </section>

      {/* ── Merdiven + defter + plan ── */}
      <div className="mx-auto grid max-w-(--spacing-container-max) grid-cols-1 xl:grid-cols-[minmax(0,1fr)_28rem]">
        <section className="border-beton-200 px-[--spacing-margin] py-10 xl:border-r">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h2 className="display text-3xl">
              Kalan Borç <em>Merdiveni</em>
            </h2>
            <div className="flex items-center gap-5">
              <Anahtar renk="bg-file-600" ad="Gerçekleşen" />
              <Anahtar tarama ad="Planlanan" />
            </div>
          </div>

          <BorcMerdiveni hesap={h} />

          {/* Dekont defteri */}
          <h2 className="display mt-14 text-3xl">
            Yapılan <em>Ödemeler</em>
          </h2>

          <table className="mt-6 w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-kursun-800">
                <th className="eyebrow pb-2.5 font-medium text-kursun-400">
                  Tarih
                </th>
                <th className="eyebrow pb-2.5 font-medium text-kursun-400">
                  Alıcı
                </th>
                <th className="eyebrow pb-2.5 text-right font-medium text-kursun-400">
                  Tutar ₺
                </th>
                <th className="eyebrow hidden pb-2.5 text-right font-medium text-kursun-400 sm:table-cell">
                  Referans
                </th>
              </tr>
            </thead>
            <tbody>
              {odemeler.map((o, i) => (
                <tr
                  key={o.referans}
                  className="rise border-b border-beton-200"
                  style={{ animationDelay: `${560 + i * 90}ms` }}
                >
                  <td className="data py-4 text-xs text-kursun-500">
                    {tarihUzun(o.tarih)}
                  </td>
                  <td className="py-4">
                    <span className="text-sm font-medium">{o.alici}</span>
                    <span className="data mt-1 block text-[0.6875rem] text-kursun-400">
                      {o.banka} · EFT ·{" "}
                      {o.tur === "pesinat" ? "peşinat" : "taksit"}
                    </span>
                  </td>
                  <td className="data py-4 text-right text-base">
                    {lira(o.tutar)}
                  </td>
                  <td className="data hidden py-4 text-right text-[0.6875rem] text-kursun-400 sm:table-cell">
                    {o.referans}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td />
                <td className="eyebrow pt-4">Toplam ödenen</td>
                <td className="data pt-4 text-right text-lg text-file-700">
                  {lira(h.toplamOdenen)}
                </td>
                <td className="data hidden pt-4 text-right text-[0.6875rem] text-kursun-400 sm:table-cell">
                  {odemeler.length} dekont
                </td>
              </tr>
            </tfoot>
          </table>

          <p className="data mt-5 border-t border-beton-200 pt-4 text-[0.6875rem] text-kursun-400">
            Havale masrafları toplam {liraKurus(h.masrafToplami)} ₺ — bedele
            mahsup edilmez, ayrıca ödenmiştir.
          </p>
        </section>

        {/* Plan */}
        <section className="bg-beton-100 px-[--spacing-margin] py-10 xl:px-10">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="display text-3xl">
              Ödeme <em>Planı</em>
            </h2>
            <span className="data text-[0.6875rem] text-kursun-400">
              {sozlesme.taksitSayisi} taksit
            </span>
          </div>
          <p className="data mt-2.5 text-[0.6875rem] text-kursun-400">
            {h.taksitler[0].ayUzun} – {h.sonAy} · eşit taksit
          </p>

          <TaksitListesi taksitler={h.taksitler} />

          <div className="mt-7 flex items-baseline justify-between border-t border-beton-300 pt-5">
            <span className="eyebrow">Plan toplamı</span>
            <span className="data text-lg">{lira(h.planToplami)} ₺</span>
          </div>

          <div className="mt-8 border border-beton-300 bg-kagit p-5">
            <p className="eyebrow text-tuc-600">Yeni ödeme eklemek</p>
            <p className="mt-3 text-[0.8125rem] leading-relaxed text-kursun-500">
              <code className="data text-[0.75rem] text-kursun-800">
                lib/hesap.ts
              </code>{" "}
              dosyasındaki <span className="data text-[0.75rem]">odemeler</span>{" "}
              listesine bir satır ekleyin. Yüzdeler, merdiven ve plan durumları
              kendiliğinden güncellenir.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function Olcu({
  etiket,
  deger,
  alt,
  vurgu,
  gecikme,
}: {
  etiket: string;
  deger: string;
  alt: string;
  vurgu?: boolean;
  gecikme: number;
}) {
  return (
    <div
      className="rise border-beton-200 p-5 not-last:border-r"
      style={{ animationDelay: `${gecikme}ms` }}
    >
      <dt className="eyebrow text-kursun-400">{etiket}</dt>
      <dd
        className={`data mt-3 text-2xl ${vurgu ? "text-file-700" : "text-kursun-800"}`}
      >
        {deger}
      </dd>
      <dd className="data mt-1.5 text-[0.6875rem] text-kursun-400">{alt}</dd>
    </div>
  );
}

function Anahtar({
  renk,
  tarama,
  ad,
}: {
  renk?: string;
  tarama?: boolean;
  ad: string;
}) {
  return (
    <span className="flex items-center gap-2">
      <span
        className={`inline-block h-2.5 w-4 ${renk ?? ""} ${tarama ? "border border-tuc-200" : ""}`}
        style={
          tarama
            ? {
                backgroundImage:
                  "repeating-linear-gradient(-45deg, var(--color-tuc-400) 0 2px, transparent 2px 7px)",
              }
            : undefined
        }
      />
      <span className="eyebrow text-kursun-500">{ad}</span>
    </span>
  );
}
