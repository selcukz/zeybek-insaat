"use client";

import { useActionState } from "react";
import { girisYap } from "./actions";

export default function GirisFormu({ devam }: { devam: string }) {
  const [durum, gonder, bekliyor] = useActionState(girisYap, {});

  return (
    <form action={gonder} style={{ marginTop: 32 }}>
      <input type="hidden" name="devam" value={devam} />

      <label htmlFor="sifre" className="lbl" style={{ display: "block" }}>
        Şifre
      </label>
      <input
        id="sifre"
        name="sifre"
        type="password"
        autoFocus
        autoComplete="current-password"
        aria-describedby={durum?.hata ? "giris-hata" : undefined}
        style={{
          marginTop: 12,
          width: "100%",
          minHeight: 48,
          padding: "0 16px",
          font: "inherit",
          fontSize: 16,
          color: "#fff",
          background: "var(--gece-2)",
          border: `1px solid ${durum?.hata ? "var(--seri-3)" : "#1d3d52"}`,
          outlineOffset: 2,
        }}
      />

      {durum?.hata && (
        <p
          id="giris-hata"
          role="alert"
          style={{ marginTop: 12, fontSize: 12, color: "var(--seri-2)" }}
        >
          {durum.hata}
        </p>
      )}

      <button
        type="submit"
        disabled={bekliyor}
        style={{
          marginTop: 24,
          width: "100%",
          minHeight: 48,
          font: "inherit",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#fff",
          background: "var(--seri-1)",
          border: 0,
          cursor: bekliyor ? "wait" : "pointer",
          opacity: bekliyor ? 0.6 : 1,
        }}
      >
        {bekliyor ? "Kontrol ediliyor…" : "Giriş yap"}
      </button>
    </form>
  );
}
