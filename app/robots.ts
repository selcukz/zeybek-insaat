import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Hak sahibi hesabı arama motorlarına kapalı
      disallow: "/hesap",
    },
    sitemap: "https://zeybekins.com/sitemap.xml",
  };
}
