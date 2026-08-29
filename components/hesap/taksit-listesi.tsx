import { lira, type Taksit } from "@/lib/hesap";

const DURUM: Record<
  Taksit["durum"],
  { etiket: string; renk: string; cizgi: string; dolgu: string }
> = {
  odendi: {
    etiket: "Ödendi",
    renk: "text-file-700",
    cizgi: "border-file-700",
    dolgu: "bg-file-600",
  },
  kismi: {
    etiket: "Kısmi",
    renk: "text-file-700",
    cizgi: "border-file-600",
    dolgu: "bg-file-600",
  },
  gecikti: {
    etiket: "Gecikti",
    renk: "text-tuc-600",
    cizgi: "border-tuc-500",
    dolgu: "bg-tuc-500",
  },
  bekliyor: {
    etiket: "Bekliyor",
    renk: "text-kursun-400",
    cizgi: "border-beton-300",
    dolgu: "bg-transparent",
  },
};

/**
 * Taksit planı — kat takip satırlarıyla aynı dil: dolu satır ödenmiş,
 * taramalı satır bekleyen, boş çerçeve henüz vadesi gelmemiş taksittir.
 */
export default function TaksitListesi({ taksitler }: { taksitler: Taksit[] }) {
  return (
    <ol className="mt-6 space-y-[3px]">
      {taksitler.map((t) => {
        const d = DURUM[t.durum];
        const bekleyen = t.durum === "bekliyor" || t.durum === "gecikti";

        return (
          <li key={t.sira} className="flex items-center gap-3">
            <span className="data w-12 shrink-0 text-right text-[0.625rem] text-kursun-400">
              {t.ayKisa}
            </span>

            <span
              className={`relative block h-6 flex-1 border ${d.cizgi} bg-kagit`}
            >
              {t.yuzde > 0 && (
                <span
                  className={`absolute inset-y-0 left-0 ${d.dolgu}`}
                  style={{ width: `${t.yuzde}%` }}
                />
              )}
              {bekleyen && (
                <span
                  className="absolute inset-y-0 right-0 opacity-40"
                  style={{
                    left: `${t.yuzde}%`,
                    backgroundImage:
                      "repeating-linear-gradient(-45deg, var(--color-tuc-400) 0 2px, transparent 2px 7px)",
                  }}
                />
              )}
            </span>

            <span className="data w-20 shrink-0 text-right text-[0.6875rem] text-kursun-600">
              {lira(t.beklenen)}
            </span>
            <span
              className={`eyebrow w-14 shrink-0 text-right ${d.renk}`}
              title={`Vade ${t.vade}`}
            >
              {d.etiket}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
