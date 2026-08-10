/** Portal ekranı — imza kat kesitinin cepte görünen küçük hali. */
export default function PortalTelefon() {
  const katlar = [1, 1, 1, 1, 1, 1, 1, 1, 1, 0.45, 0, 0, 0, 0];

  return (
    <div className="relative mx-auto w-[15.5rem] shrink-0">
      <div className="rounded-[2.25rem] border border-kursun-700/25 bg-kursun-800 p-2.5 shadow-[0_30px_60px_-25px_rgb(21_32_42_/_0.55)]">
        <div className="relative overflow-hidden rounded-[1.75rem] bg-kagit">
          {/* Çentik */}
          <div className="absolute left-1/2 top-2 z-10 h-4 w-20 -translate-x-1/2 rounded-full bg-kursun-800" />

          <div className="px-4 pb-5 pt-9">
            <p className="eyebrow text-tuc-600">Zeybek Meydan</p>
            <p className="data mt-1 text-[0.625rem] text-kursun-400">
              A Blok · Daire 12
            </p>

            <div className="mt-4 flex items-end justify-between border-b border-beton-300 pb-3">
              <span className="data text-[2rem] leading-none text-kursun-800">
                %61
              </span>
              <span className="eyebrow pb-1 text-kursun-400">gerçekleşme</span>
            </div>

            <div className="mt-4 space-y-[3px]">
              {katlar
                .map((k, i) => ({ k, i }))
                .reverse()
                .map(({ k, i }) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="data w-3 text-right text-[0.5rem] text-beton-400">
                      {i === 0 ? "Z" : i}
                    </span>
                    <div
                      className={`h-1 flex-1 border ${
                        k === 1
                          ? "border-file-700 bg-file-600"
                          : k > 0
                            ? "hatch border-file-600"
                            : "border-beton-300"
                      }`}
                    />
                  </div>
                ))}
            </div>

            <div className="mt-4 space-y-2 border-t border-beton-300 pt-3">
              <Satir ad="Kira yardımı" deger="Temmuz ödendi" iyi />
              <Satir ad="Sözleşmesel teslim" deger="30.09.2027" />
              <Satir ad="Saha fotoğrafı" deger="14 yeni" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Satir({
  ad,
  deger,
  iyi,
}: {
  ad: string;
  deger: string;
  iyi?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-[0.625rem] text-kursun-500">{ad}</span>
      <span
        className={`data text-[0.625rem] ${
          iyi ? "text-file-700" : "text-kursun-800"
        }`}
      >
        {deger}
      </span>
    </div>
  );
}
