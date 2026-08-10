/** Fiziksel gerçekleşme halkası. */
export default function Halka({
  yuzde,
  ad,
  buyuk = false,
}: {
  yuzde: number;
  ad?: string;
  buyuk?: boolean;
}) {
  const boyut = buyuk ? 168 : 92;
  const kalinlik = buyuk ? 9 : 6;
  const r = (boyut - kalinlik) / 2;
  const cevre = 2 * Math.PI * r;
  const dolu = (Math.min(100, Math.max(0, yuzde)) / 100) * cevre;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: boyut, height: boyut }}>
        <svg
          viewBox={`0 0 ${boyut} ${boyut}`}
          className="-rotate-90"
          width={boyut}
          height={boyut}
          aria-hidden
        >
          <circle
            cx={boyut / 2}
            cy={boyut / 2}
            r={r}
            fill="none"
            stroke="var(--color-beton-300)"
            strokeWidth={kalinlik}
          />
          <circle
            cx={boyut / 2}
            cy={boyut / 2}
            r={r}
            fill="none"
            stroke="var(--color-file-600)"
            strokeWidth={kalinlik}
            strokeDasharray={`${dolu} ${cevre - dolu}`}
            strokeLinecap="butt"
          />
        </svg>
        <span
          className={`data absolute inset-0 flex items-center justify-center text-kursun-800 ${
            buyuk ? "text-[2rem]" : "text-[0.9375rem]"
          }`}
        >
          %{yuzde}
        </span>
      </div>
      {ad && (
        <span className="eyebrow max-w-[9rem] text-center text-kursun-500">
          {ad}
        </span>
      )}
    </div>
  );
}
