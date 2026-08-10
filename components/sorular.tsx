"use client";

import { useState } from "react";
import { sikSorulanlar } from "@/lib/data";

export default function Sorular() {
  const [acik, setAcik] = useState<number | null>(0);

  return (
    <div className="border-t border-beton-300">
      {sikSorulanlar.map((s, i) => {
        const secili = acik === i;
        return (
          <div key={s.soru} className="border-b border-beton-300">
            <h3>
              <button
                type="button"
                onClick={() => setAcik(secili ? null : i)}
                aria-expanded={secili}
                className="flex w-full items-start justify-between gap-6 py-6 text-left"
              >
                <span className="display text-[clamp(1.125rem,1.6vw,1.5rem)]">
                  {s.soru}
                </span>
                <span
                  className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center border transition-colors ${
                    secili
                      ? "border-tuc-500 bg-tuc-500 text-white"
                      : "border-beton-300 text-kursun-500"
                  }`}
                  aria-hidden
                >
                  <svg
                    viewBox="0 0 12 12"
                    className="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.3"
                  >
                    <path d="M1 6h10" />
                    <path
                      d="M6 1v10"
                      className={`origin-center transition-transform duration-300 ${
                        secili ? "scale-y-0" : ""
                      }`}
                    />
                  </svg>
                </span>
              </button>
            </h3>
            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                secili ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <p className="max-w-[62ch] pb-7 text-[0.9375rem] leading-relaxed text-kursun-500">
                  {s.cevap}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
