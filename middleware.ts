import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { HESAP_COOKIE, esitMi, jetonUret } from "@/lib/hesap-oturum";

/**
 * /hesap ve altındaki her şey şifreyle korunur. Sitenin geri kalanı
 * herkese açıktır. Şifre HESAP_SIFRE ortam değişkeninde tutulur;
 * tanımlı değilse rota tamamen kapalıdır (güvenli tarafta kalır).
 */
export async function middleware(istek: NextRequest) {
  const { pathname } = istek.nextUrl;

  // Giriş sayfasının kendisi ve giriş ucu korumanın dışında
  if (pathname.startsWith("/hesap/giris")) return NextResponse.next();

  const sifre = process.env.HESAP_SIFRE;
  if (!sifre) {
    return new NextResponse(
      "Bu sayfa yapılandırılmamış: HESAP_SIFRE ortam değişkeni tanımlı değil.",
      { status: 503, headers: { "content-type": "text/plain; charset=utf-8" } },
    );
  }

  const cerez = istek.cookies.get(HESAP_COOKIE)?.value ?? "";
  const beklenen = await jetonUret(sifre);

  if (cerez && esitMi(cerez, beklenen)) return NextResponse.next();

  const giris = new URL("/hesap/giris", istek.url);
  // Girişten sonra istenen sayfaya dönmek için
  if (pathname !== "/hesap") giris.searchParams.set("devam", pathname);
  return NextResponse.redirect(giris);
}

export const config = {
  matcher: ["/hesap", "/hesap/:path*"],
};
