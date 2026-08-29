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
    <main className="flex min-h-dvh items-center justify-center bg-kursun-900 px-6 py-16">
      <div className="w-full max-w-sm">
        <p className="eyebrow text-tuc-400">Zeybek İnşaat</p>
        <h1 className="display mt-4 text-3xl text-kagit">
          Hak Sahibi <em>Hesabı</em>
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-kursun-400">
          Bu sayfa yalnızca daire sahibine açıktır. Devam etmek için şifreyi girin.
        </p>

        <GirisFormu devam={devam ?? ""} />
      </div>
    </main>
  );
}
