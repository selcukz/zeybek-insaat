"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { HESAP_COOKIE, jetonUret } from "@/lib/hesap-oturum";

/** Kaba kuvvete karşı basit gecikme — her denemede sabit bekleme. */
const GECIKME_MS = 600;

export async function girisYap(
  _oncekiDurum: { hata?: string } | undefined,
  form: FormData,
): Promise<{ hata?: string }> {
  const girilen = String(form.get("sifre") ?? "");
  const devam = String(form.get("devam") ?? "");
  const sifre = process.env.HESAP_SIFRE;

  await new Promise((r) => setTimeout(r, GECIKME_MS));

  if (!sifre) return { hata: "Sayfa yapılandırılmamış. HESAP_SIFRE tanımlı değil." };
  if (!girilen) return { hata: "Şifre girin." };
  if (girilen !== sifre) return { hata: "Şifre yanlış." };

  const cerezler = await cookies();
  cerezler.set(HESAP_COOKIE, await jetonUret(sifre), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/hesap",
    maxAge: 60 * 60 * 24 * 30, // 30 gün
  });

  redirect(devam.startsWith("/hesap") ? devam : "/hesap");
}

export async function cikisYap() {
  const cerezler = await cookies();
  cerezler.delete({ name: HESAP_COOKIE, path: "/hesap" });
  redirect("/hesap/giris");
}
