"use client";

import Link from "next/link";
import { useState } from "react";
import { siteHaritasi, kurum } from "@/lib/data";

export default function SiteFooter() {
  const [acik, setAcik] = useState(true);

  return (
    <footer>
      {/* Bülten şeridi */}
      <div className="border-t border-beton-300 bg-kagit">
        <div className="shell flex flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between">
          <form
            className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center"
            onSubmit={(e) => e.preventDefault()}
          >
            <label
              htmlFor="bulten"
              className="eyebrow shrink-0 text-kursun-600"
            >
              Proje duyurularını e-postayla alın
            </label>
            <div className="flex max-w-sm flex-1 items-center border-b border-kursun-400 focus-within:border-tuc-500">
              <input
                id="bulten"
                type="email"
                required
                placeholder="E-posta adresiniz"
                className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-kursun-400"
              />
              <button
                type="submit"
                aria-label="Bültene abone ol"
                className="p-2 text-kursun-600 hover:text-tuc-500"
              >
                <svg
                  viewBox="0 0 20 12"
                  className="h-3 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  aria-hidden
                >
                  <path d="M0 6h18M13 1l5 5-5 5" />
                </svg>
              </button>
            </div>
          </form>

          <div className="flex items-center gap-5">
            <span className="eyebrow text-kursun-500">Bizi takip edin</span>
            {["Instagram", "LinkedIn", "YouTube"].map((a) => (
              <a
                key={a}
                href="#"
                className="text-[0.8125rem] text-kursun-600 underline-offset-4 hover:text-tuc-500 hover:underline"
              >
                {a}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Koyu künye çubuğu */}
      <div className="bg-kursun-800">
        <div className="shell flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <span className="text-lg font-bold uppercase tracking-[-0.03em] text-white leading-none">
              Zeybek
            </span>
            <span className="h-4 w-px bg-white/25" aria-hidden />
            <span className="data text-[0.6875rem] text-white/50">
              © {new Date().getFullYear()} {kurum.ad} — Tüm hakları saklıdır.
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            <a
              href={kurum.telefonHref}
              className="eyebrow text-white/70 hover:text-white"
            >
              {kurum.telefon}
            </a>
            <Link
              href="/#iletisim"
              className="eyebrow text-white/70 hover:text-white"
            >
              Ücretsiz keşif
            </Link>
            <button
              type="button"
              onClick={() => setAcik((v) => !v)}
              aria-expanded={acik}
              className="eyebrow flex items-center gap-2 border border-white/30 px-4 py-2.5 text-white transition-colors hover:bg-white hover:text-kursun-800"
            >
              Site haritası
              <svg
                viewBox="0 0 10 6"
                className={`h-[5px] w-[9px] transition-transform ${
                  acik ? "" : "rotate-180"
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                aria-hidden
              >
                <path d="M1 5l4-4 4 4" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Site haritası */}
      <div
        className={`overflow-hidden bg-beton-100 transition-[max-height] duration-500 ease-out ${
          acik ? "max-h-[120rem]" : "max-h-0"
        }`}
      >
        <div className="shell grid grid-cols-2 gap-x-8 gap-y-10 py-12 sm:grid-cols-3 lg:grid-cols-6">
          {siteHaritasi.map((sutun) => (
            <div key={sutun.baslik}>
              <h3 className="eyebrow text-tuc-600">{sutun.baslik}</h3>
              <ul className="mt-4 space-y-2.5">
                {sutun.baglantilar.map((b) => (
                  <li key={b.ad + b.href}>
                    <Link
                      href={b.href}
                      className="text-[0.8125rem] leading-snug text-kursun-600 transition-colors hover:text-tuc-600"
                    >
                      {b.ad}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="shell border-t border-beton-300 py-6">
          <p className="data text-[0.6875rem] leading-relaxed text-kursun-400">
            {kurum.adres} · {kurum.eposta} · Kuruluş {kurum.kurulus}
          </p>
        </div>
      </div>
    </footer>
  );
}
