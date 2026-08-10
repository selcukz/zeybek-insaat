"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, useRef, useState } from "react";
import type { Project, ProjectStatus } from "@/lib/data";
import { durumEtiketi } from "@/lib/data";

type Filtre = ProjectStatus | "hepsi";

export default function ProjeRayi({
  projeler,
  filtreler,
  not,
}: {
  projeler: Project[];
  /** Verilirse rayın üstünde durum süzgeci gösterilir. */
  filtreler?: Filtre[];
  /** Kartların arasına yerleşen koyu bilgi kartı. */
  not?: { baslik: string; metin: string; eylem: string; href: string };
}) {
  const [aktif, setAktif] = useState<Filtre>(filtreler?.[0] ?? "hepsi");
  const ray = useRef<HTMLDivElement>(null);

  const gorunen =
    aktif === "hepsi" ? projeler : projeler.filter((p) => p.durum === aktif);

  const kaydir = (yon: 1 | -1) => {
    const el = ray.current;
    if (!el) return;
    el.scrollBy({ left: yon * Math.round(el.clientWidth * 0.7) });
  };

  return (
    <>
      {filtreler && (
        <div className="mb-8 flex flex-wrap items-center gap-x-7 gap-y-3 pr-(--spacing-margin)">
          {filtreler.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setAktif(f)}
              className={`eyebrow border-b-2 pb-1.5 transition-colors ${
                aktif === f
                  ? "border-tuc-500 text-kursun-800"
                  : "border-transparent text-kursun-400 hover:text-kursun-600"
              }`}
            >
              {f === "hepsi" ? "Tümü" : durumEtiketi[f]}
            </button>
          ))}
          <div className="ml-auto hidden gap-2 md:flex">
            <Ok yon={-1} onClick={() => kaydir(-1)} />
            <Ok yon={1} onClick={() => kaydir(1)} />
          </div>
        </div>
      )}

      <div ref={ray} className="rail gap-3 pb-2">
        {/* Fragment kullanılır: display:contents sarmalayıcı kartları
            flex öğesi olmaktan çıkarır ve kartlar eziliyordu. */}
        {gorunen.map((p, i) => (
          <Fragment key={p.slug}>
            <ProjeKart proje={p} />
            {not && i === 2 && <NotKarti {...not} />}
          </Fragment>
        ))}
        {/* Sağ kenarda nefes payı */}
        <div className="w-[max(var(--spacing-margin),1px)] shrink-0" aria-hidden />
      </div>
    </>
  );
}

function ProjeKart({ proje }: { proje: Project }) {
  return (
    <Link
      href={`/projeler/${proje.slug}`}
      className="group relative block w-[clamp(15rem,20vw,22rem)] overflow-hidden"
    >
      <div className="relative aspect-3/4 overflow-hidden bg-beton-200">
        <Image
          src={proje.gorsel}
          alt={`${proje.ad}, ${proje.mahalle}`}
          fill
          sizes="(max-width: 768px) 70vw, 22rem"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

        <span className="eyebrow absolute left-5 top-5 bg-white/90 px-2.5 py-1.5 text-kursun-800">
          {proje.ilce}
        </span>

        <div className="absolute inset-x-5 bottom-5">
          <p className="display text-[1.375rem] text-white">{proje.ad}</p>
          <p className="data mt-1.5 text-[0.6875rem] text-white/70">
            {proje.mahalle} · {durumEtiketi[proje.durum]}
          </p>

          {proje.durum === "devam" && (
            <div className="mt-4">
              <div className="h-[3px] w-full bg-white/25">
                <div
                  className="h-full bg-file-400"
                  style={{ width: `${proje.genelYuzde}%` }}
                />
              </div>
              <p className="data mt-1.5 text-[0.625rem] text-white/70">
                %{proje.genelYuzde} tamamlandı
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function NotKarti({
  baslik,
  metin,
  eylem,
  href,
}: {
  baslik: string;
  metin: string;
  eylem: string;
  href: string;
}) {
  return (
    <div className="flex w-[clamp(15rem,20vw,22rem)] flex-col justify-between bg-kursun-800 p-7 aspect-3/4">
      <div>
        <p className="display text-[1.5rem] text-white">{baslik}</p>
        <p className="mt-4 text-sm leading-relaxed text-white/65">{metin}</p>
      </div>
      <Link href={href} className="btn btn-ghost self-start">
        {eylem}
      </Link>
    </div>
  );
}

function Ok({ yon, onClick }: { yon: 1 | -1; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={yon === 1 ? "Sonraki projeler" : "Önceki projeler"}
      className="flex h-10 w-10 items-center justify-center border border-beton-300 text-kursun-600 transition-colors hover:border-kursun-800 hover:bg-kursun-800 hover:text-white"
    >
      <svg
        viewBox="0 0 16 16"
        className={`h-3.5 w-3.5 ${yon === -1 ? "rotate-180" : ""}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        aria-hidden
      >
        <path d="M5 1l7 7-7 7" />
      </svg>
    </button>
  );
}
