import type { Metadata } from "next";
import GirisFormu from "./giris-formu";

export const metadata: Metadata = {
  title: "Giriş · Zeybek İnşaat",
  robots: { index: false, follow: false, nocache: true },
};

export default async function GirisSayfasi({
  searchParams,
}: {
  searchParams: Promise<{ devam?: string }>;
}) {
  const { devam } = await searchParams;

  return (
    <main
      style={{
        minHeight: "100dvh",
        background: "var(--gece)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "64px 24px",
      }}
    >
      <div className="an" style={{ width: "100%", maxWidth: 360 }}>
        <p className="lbl" style={{ color: "var(--seri-2)" }}>
          Liva Acıbadem
        </p>
        <h1 className="num" style={{ fontSize: 28, marginTop: 14, color: "#fff" }}>
          A BLOK — DAİRE 8
        </h1>
        <p
          style={{
            marginTop: 16,
            fontSize: 13,
            lineHeight: 1.6,
            color: "var(--gri)",
          }}
        >
          Bu sayfa yalnızca daire sahibine açıktır. Devam etmek için şifreyi
          girin.
        </p>

        <GirisFormu devam={devam ?? ""} />
      </div>
    </main>
  );
}
