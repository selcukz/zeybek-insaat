"use client";

import { useState } from "react";

const ilceler = [
  "Kadıköy",
  "Üsküdar",
  "Ataşehir",
  "Maltepe",
  "Bahçelievler",
  "Bakırköy",
  "Beşiktaş",
  "Şişli",
  "Diğer",
];

export default function KesifFormu() {
  const [gonderildi, setGonderildi] = useState(false);

  if (gonderildi) {
    return (
      <div className="flex h-full min-h-[22rem] flex-col justify-center border border-file-400 bg-file-200/40 p-9">
        <p className="eyebrow text-file-700">Talebiniz alındı</p>
        <p className="display mt-4 text-[1.75rem]">
          İki iş günü içinde <em>arıyoruz</em>
        </p>
        <p className="mt-4 max-w-[46ch] text-[0.9375rem] leading-relaxed text-kursun-600">
          Keşif randevusunu telefonda birlikte belirleyip binanızı yerinde
          inceliyoruz. Ön değerlendirme raporu için sizden hiçbir ücret
          alınmaz.
        </p>
        <button
          type="button"
          onClick={() => setGonderildi(false)}
          className="btn btn-outline mt-8 self-start"
        >
          Yeni talep
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setGonderildi(true);
      }}
      className="border border-beton-300 bg-kagit p-7 xl:p-9"
    >
      <p className="eyebrow text-tuc-600">Ücretsiz keşif talebi</p>
      <p className="mt-3 max-w-[46ch] text-[0.9375rem] leading-relaxed text-kursun-500">
        Binanızın adresini bırakın; yerinde inceleyip yapım yılı, taşıyıcı
        sistem ve arsa payı üzerinden ön değerlendirme raporunuzu verelim.
      </p>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <Alan ad="ad" etiket="Ad soyad" tip="text" />
        <Alan ad="telefon" etiket="Telefon" tip="tel" />
        <div className="sm:col-span-2">
          <label htmlFor="ilce" className="eyebrow text-kursun-500">
            İlçe
          </label>
          <select
            id="ilce"
            name="ilce"
            required
            defaultValue=""
            className="mt-2 w-full border-b border-kursun-400 bg-transparent py-2.5 text-sm outline-none focus:border-tuc-500"
          >
            <option value="" disabled>
              Seçiniz
            </option>
            {ilceler.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <Alan ad="adres" etiket="Bina adresi" tip="text" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="not" className="eyebrow text-kursun-500">
            Eklemek istedikleriniz
          </label>
          <textarea
            id="not"
            name="not"
            rows={3}
            placeholder="Yapım yılı, kat adedi, daire sayısı, varsa risk raporu"
            className="mt-2 w-full resize-none border-b border-kursun-400 bg-transparent py-2.5 text-sm outline-none placeholder:text-kursun-400 focus:border-tuc-500"
          />
        </div>
      </div>

      <label className="mt-7 flex items-start gap-3 text-[0.75rem] leading-relaxed text-kursun-500">
        <input
          type="checkbox"
          required
          className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-tuc-500)]"
        />
        KVKK aydınlatma metnini okudum; bilgilerimin keşif talebi kapsamında
        işlenmesine izin veriyorum.
      </label>

      <button type="submit" className="btn btn-solid mt-7 w-full sm:w-auto">
        Keşif talebi gönder
      </button>
    </form>
  );
}

function Alan({
  ad,
  etiket,
  tip,
}: {
  ad: string;
  etiket: string;
  tip: string;
}) {
  return (
    <div>
      <label htmlFor={ad} className="eyebrow text-kursun-500">
        {etiket}
      </label>
      <input
        id={ad}
        name={ad}
        type={tip}
        required
        className="mt-2 w-full border-b border-kursun-400 bg-transparent py-2.5 text-sm outline-none focus:border-tuc-500"
      />
    </div>
  );
}
