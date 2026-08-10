"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useState, useSyncExternalStore } from "react";
import { projeler, kurum } from "@/lib/data";

const ustBaglantilar = [
  { ad: "Hak Sahibi Portalı", href: "/#portal" },
  { ad: "Ücretsiz Keşif", href: "/#iletisim" },
  { ad: "Basın", href: "/#kurumsal" },
  { ad: "Kariyer", href: "/#kurumsal" },
];

const menu: {
  ad: string;
  href: string;
  alt?: { ad: string; not: string; href: string }[];
}[] = [
  {
    ad: "Projeler",
    href: "/#projeler",
    alt: projeler.map((p) => ({
      ad: p.ad,
      not: `${p.mahalle}, ${p.ilce}`,
      href: `/projeler/${p.slug}`,
    })),
  },
  {
    ad: "İnşaat Takibi",
    href: "/insaat-takibi",
    alt: projeler
      .filter((p) => p.durum !== "yeni")
      .map((p) => ({
        ad: p.ad,
        not: `%${p.genelYuzde} tamamlandı`,
        href: `/insaat-takibi/${p.slug}`,
      })),
  },
  { ad: "Kentsel Dönüşüm", href: "/#surec" },
  { ad: "Kurumsal", href: "/#kurumsal" },
  { ad: "İletişim", href: "/#iletisim" },
];

/** Sayfa kaydırıldı mı — dış kaynağa abone olunur, efektle senkronlanmaz. */
function useKaydi() {
  const abone = useCallback((yenile: () => void) => {
    window.addEventListener("scroll", yenile, { passive: true });
    return () => window.removeEventListener("scroll", yenile);
  }, []);
  return useSyncExternalStore(
    abone,
    () => window.scrollY > 24,
    () => false,
  );
}

export default function SiteHeader() {
  const pathname = usePathname();
  const kaydi = useKaydi();
  const [acikMenu, setAcikMenu] = useState<string | null>(null);
  const [mobil, setMobil] = useState(false);

  // Gezinince menüleri kapat: render sırasında uyarlama, efekt değil.
  const [oncekiYol, setOncekiYol] = useState(pathname);
  if (oncekiYol !== pathname) {
    setOncekiYol(pathname);
    setMobil(false);
    setAcikMenu(null);
  }

  const heroVar =
    pathname === "/" || /^\/(projeler|insaat-takibi)\/[^/]+$/.test(pathname);

  const seffaf = heroVar && !kaydi && !mobil;

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* Üst hizmet çubuğu */}
      <div
        className={`hidden lg:block border-b transition-colors duration-300 ${
          seffaf
            ? "bg-kursun-900/45 border-white/10 backdrop-blur-sm"
            : "bg-kursun-900 border-white/10"
        }`}
      >
        <div className="shell flex h-10 items-center justify-end gap-8">
          {ustBaglantilar.map((b) => (
            <Link
              key={b.ad}
              href={b.href}
              className="eyebrow text-white/65 hover:text-white transition-colors"
            >
              {b.ad}
            </Link>
          ))}
          <a
            href={kurum.telefonHref}
            className="eyebrow flex items-center gap-2 bg-tuc-500 px-4 py-2 text-white hover:bg-tuc-600 transition-colors"
          >
            <PhoneIcon />
            {kurum.telefon}
          </a>
        </div>
      </div>

      {/* Ana navigasyon */}
      <div
        onMouseLeave={() => setAcikMenu(null)}
        className={`transition-colors duration-300 ${
          seffaf
            ? "bg-gradient-to-b from-black/45 to-transparent"
            : "bg-kursun-800 shadow-[0_1px_0_rgb(255_255_255_/_0.08)]"
        }`}
      >
        <div className="shell flex h-[68px] items-center justify-between gap-6">
          <Link href="/" className="flex items-baseline gap-3 shrink-0">
            <span className="text-[1.375rem] font-bold uppercase tracking-[-0.03em] text-white leading-none">
              Zeybek
            </span>
            <span className="h-4 w-px bg-tuc-400/70" aria-hidden />
            <span className="eyebrow text-tuc-200">İnşaat</span>
          </Link>

          <nav className="hidden lg:flex items-stretch h-[68px]">
            {menu.map((m) => (
              <div
                key={m.ad}
                className="relative flex items-center"
                onMouseEnter={() => setAcikMenu(m.alt ? m.ad : null)}
              >
                <Link
                  href={m.href}
                  className={`eyebrow px-5 h-full flex items-center gap-1.5 transition-colors ${
                    acikMenu === m.ad
                      ? "text-white"
                      : "text-white/75 hover:text-white"
                  }`}
                >
                  {m.ad}
                  {m.alt && <Chevron open={acikMenu === m.ad} />}
                </Link>
                {m.alt && (
                  <div
                    className={`absolute left-0 top-full w-[19rem] origin-top border-t-2 border-tuc-500 bg-kursun-800 transition-all duration-200 ${
                      acikMenu === m.ad
                        ? "visible opacity-100 translate-y-0"
                        : "invisible opacity-0 -translate-y-1"
                    }`}
                  >
                    {m.alt.map((a) => (
                      <Link
                        key={a.href}
                        href={a.href}
                        className="flex items-baseline justify-between gap-4 border-b border-white/8 px-5 py-3.5 last:border-0 hover:bg-kursun-700 transition-colors"
                      >
                        <span className="text-[0.875rem] text-white/90">
                          {a.ad}
                        </span>
                        <span className="data text-[0.6875rem] text-white/40">
                          {a.not}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => setMobil((v) => !v)}
            aria-expanded={mobil}
            aria-label={mobil ? "Menüyü kapat" : "Menüyü aç"}
            className="lg:hidden flex h-10 w-10 items-center justify-center text-white"
          >
            <span className="relative block h-3.5 w-6">
              <span
                className={`absolute left-0 h-px w-full bg-current transition-all duration-300 ${
                  mobil ? "top-1.5 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 top-1.5 h-px w-full bg-current transition-opacity duration-200 ${
                  mobil ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 h-px w-full bg-current transition-all duration-300 ${
                  mobil ? "top-1.5 -rotate-45" : "top-3"
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Mobil menü */}
      <div
        className={`lg:hidden overflow-hidden bg-kursun-800 transition-[max-height] duration-400 ease-out ${
          mobil ? "max-h-[85vh] overflow-y-auto" : "max-h-0"
        }`}
      >
        <div className="shell py-6">
          {menu.map((m) => (
            <div key={m.ad} className="border-b border-white/10 py-1">
              <Link
                href={m.href}
                className="block py-3 text-lg text-white/90"
              >
                {m.ad}
              </Link>
              {m.alt && (
                <div className="pb-3 pl-4">
                  {m.alt.map((a) => (
                    <Link
                      key={a.href}
                      href={a.href}
                      className="flex items-baseline justify-between gap-4 py-2 text-white/60"
                    >
                      <span className="text-sm">{a.ad}</span>
                      <span className="data text-[0.6875rem] text-white/35">
                        {a.not}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <a
            href={kurum.telefonHref}
            className="btn btn-solid mt-6 w-full"
          >
            <PhoneIcon />
            {kurum.telefon}
          </a>
        </div>
      </div>
    </header>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 10 6"
      className={`h-[5px] w-[9px] transition-transform duration-200 ${
        open ? "rotate-180" : ""
      }`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      aria-hidden
    >
      <path d="M1 1l4 4 4-4" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      viewBox="0 0 14 14"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      aria-hidden
    >
      <path d="M4.2 1.6 5.6 4 4.3 5.4a8 8 0 0 0 4.3 4.3L10 8.4l2.4 1.4-.5 2.1-1.6.5C6.1 12 2 7.9 1.5 3.7l.5-1.6z" />
    </svg>
  );
}
