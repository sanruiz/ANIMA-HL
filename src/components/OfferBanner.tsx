"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import Lottie, { type LottieRefCurrentProps } from "lottie-react";

// Sección "offer-banner" del home: foto de la calle a 70vh con animación Lottie
// centrada (categorías rotando). Replicado de section.offer-banner en Webflow.
// El Lottie reproduce una sola vez cuando la sección entra al viewport (IX2).
export default function OfferBanner() {
  const locale = useLocale();
  const [data, setData] = useState<object | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const playedRef = useRef(false);

  useEffect(() => {
    const url = locale === "es" ? "/lottie/offer-es.json" : "/lottie/offer-en.json";
    let cancelled = false;
    fetch(url)
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch((err) => console.error("[OfferBanner] error loading lottie:", err));
    return () => {
      cancelled = true;
    };
  }, [locale]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !playedRef.current) {
            playedRef.current = true;
            lottieRef.current?.goToAndPlay(0, true);
          }
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [data]);

  return (
    <section ref={sectionRef} className="offer-banner" aria-label="Ánima Village">
      <div className="offer-banner__inner">
        {data && (
          <Lottie
            lottieRef={lottieRef}
            animationData={data}
            loop={true}
            autoplay={false}
            className="offer-banner__lottie"
            rendererSettings={{ preserveAspectRatio: "xMidYMid meet" }}
          />
        )}
      </div>
    </section>
  );
}
