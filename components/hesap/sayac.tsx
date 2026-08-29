"use client";

import { useEffect, useRef, useState } from "react";
import { lira } from "@/lib/hesap";

/**
 * Kalan borcu sıfırdan gerçek değerine sayarak açar.
 * Hareket azaltma açıksa doğrudan son değeri gösterir.
 */
export default function Sayac({
  deger,
  sure = 1250,
}: {
  deger: number;
  sure?: number;
}) {
  const [gosterilen, setGosterilen] = useState(deger);
  const kare = useRef<number | undefined>(undefined);

  useEffect(() => {
    const azHareket = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (azHareket) {
      setGosterilen(deger);
      return;
    }

    let bas: number | null = null;
    const adim = (t: number) => {
      if (bas === null) bas = t;
      const p = Math.min(1, (t - bas) / sure);
      setGosterilen(deger * (1 - Math.pow(1 - p, 3)));
      if (p < 1) kare.current = requestAnimationFrame(adim);
    };
    kare.current = requestAnimationFrame(adim);

    return () => {
      if (kare.current) cancelAnimationFrame(kare.current);
    };
  }, [deger, sure]);

  return <>{lira(gosterilen)}</>;
}
