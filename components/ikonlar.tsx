import type { FeatureIcon, LocationIcon } from "@/lib/data";

const ortak = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.1,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const ozellikCizimleri: Record<FeatureIcon, React.ReactNode> = {
  // Perde-çerçeve sistem: çapraz bağlantılı taşıyıcı
  deprem: (
    <>
      <path d="M4 21V6l8-3 8 3v15" />
      <path d="M4 21h16M4 13h16" />
      <path d="M4 13l8 8M20 13l-8 8" />
    </>
  ),
  otopark: (
    <>
      <path d="M3 20v-6l2-5h14l2 5v6" />
      <path d="M3 17h18" />
      <circle cx="6.5" cy="20" r="1.2" />
      <circle cx="17.5" cy="20" r="1.2" />
    </>
  ),
  peyzaj: (
    <>
      <path d="M12 21V9" />
      <path d="M12 13c-4 0-6-2.5-6-6 3.5 0 6 2 6 6z" />
      <path d="M12 11c0-3.5 2-6 6-6 0 3.5-2.5 6-6 6z" />
      <path d="M4 21h16" />
    </>
  ),
  asansor: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="0.5" />
      <path d="M12 3v18" />
      <path d="M8 9l-1.5 2h3zM16 15l1.5-2h-3z" />
    </>
  ),
  jenerator: (
    <>
      <rect x="3" y="8" width="18" height="11" rx="1" />
      <path d="M7 8V6h10v2M6 19v2M18 19v2" />
      <path d="M13 10.5l-3 3.5h4l-3 3" />
    </>
  ),
  guvenlik: (
    <>
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  isi: (
    <>
      <path d="M10 14V5a2 2 0 1 1 4 0v9" />
      <circle cx="12" cy="17" r="3.2" />
      <path d="M17 7h3M17 11h3" />
    </>
  ),
  cocuk: (
    <>
      <path d="M5 21V8l7-5 7 5v13" />
      <path d="M9 21v-6h6v6" />
      <path d="M3 21h18" />
    </>
  ),
};

const konumCizimleri: Record<LocationIcon, React.ReactNode> = {
  metro: (
    <>
      <rect x="5" y="3" width="14" height="13" rx="2.5" />
      <path d="M5 11h14" />
      <circle cx="8.5" cy="13.5" r="0.9" />
      <circle cx="15.5" cy="13.5" r="0.9" />
      <path d="M7 21l2.5-5M17 21l-2.5-5" />
    </>
  ),
  hastane: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="1" />
      <path d="M12 8v7M8.5 11.5h7" />
    </>
  ),
  okul: (
    <>
      <path d="M2 8l10-4 10 4-10 4z" />
      <path d="M6 10.5V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-5.5" />
    </>
  ),
  carsi: (
    <>
      <path d="M4 9h16l-1 11H5z" />
      <path d="M9 9V6a3 3 0 0 1 6 0v3" />
    </>
  ),
  sahil: (
    <>
      <path d="M3 17c1.5 0 1.5 1.5 3 1.5s1.5-1.5 3-1.5 1.5 1.5 3 1.5 1.5-1.5 3-1.5 1.5 1.5 3 1.5 1.5-1.5 3-1.5" />
      <path d="M12 15V6M12 6l5 2-5 2" />
      <path d="M8 15h8" />
    </>
  ),
  yol: (
    <>
      <path d="M8 3L5 21M16 3l3 18" />
      <path d="M12 4v3M12 10.5v3M12 17v3" />
    </>
  ),
};

export function OzellikIkonu({
  ad,
  className = "h-6 w-6",
}: {
  ad: FeatureIcon;
  className?: string;
}) {
  return (
    <svg {...ortak} className={className}>
      {ozellikCizimleri[ad]}
    </svg>
  );
}

export function KonumIkonu({
  ad,
  className = "h-5 w-5",
}: {
  ad: LocationIcon;
  className?: string;
}) {
  return (
    <svg {...ortak} className={className}>
      {konumCizimleri[ad]}
    </svg>
  );
}
