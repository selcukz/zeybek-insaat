"use client";

import { useActionState } from "react";
import { girisYap } from "./actions";

export default function GirisFormu({ devam }: { devam: string }) {
  const [durum, gonder, bekliyor] = useActionState(girisYap, {});

  return (
    <form action={gonder} className="mt-8">
      <input type="hidden" name="devam" value={devam} />

      <label htmlFor="sifre" className="eyebrow block text-kursun-400">
        Şifre
      </label>
      <input
        id="sifre"
        name="sifre"
        type="password"
        autoFocus
        autoComplete="current-password"
        aria-describedby={durum?.hata ? "giris-hata" : undefined}
        className="data mt-3 w-full border border-kursun-600 bg-kursun-800 px-4 py-3.5 text-base text-kagit outline-none transition-colors placeholder:text-kursun-500 focus:border-tuc-400"
        placeholder="••••••••"
      />

      {durum?.hata && (
        <p id="giris-hata" role="alert" className="data mt-3 text-xs text-tuc-400">
          {durum.hata}
        </p>
      )}

      <button
        type="submit"
        disabled={bekliyor}
        className="btn btn-solid mt-6 w-full disabled:opacity-60"
      >
        {bekliyor ? "Kontrol ediliyor…" : "Giriş yap"}
      </button>
    </form>
  );
}
