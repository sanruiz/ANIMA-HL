"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import { Link } from "@/i18n/navigation";
import type { BrandNode } from "@/lib/types";
import { shouldBypassImageOptimizer } from "@/lib/wp-image";

interface FeaturedBrandsCarouselProps {
  brands: BrandNode[];
  copy: string;
  nextLabel: string;
  previousLabel: string;
}

export default function FeaturedBrandsCarousel({
  brands,
  copy,
  nextLabel,
  previousLabel,
}: FeaturedBrandsCarouselProps) {
  const scrollRef = useRef<HTMLUListElement>(null);

  const handleScrollPrevious = () => {
    const list = scrollRef.current;
    if (!list) return;

    list.scrollBy({
      left: list.clientWidth * -0.82,
      behavior: "smooth",
    });
  };

  const handleScrollNext = () => {
    const list = scrollRef.current;
    if (!list) return;

    list.scrollBy({
      left: list.clientWidth * 0.82,
      behavior: "smooth",
    });
  };

  if (brands.length === 0) return null;

  return (
    <section className="bg-brand-oscuro py-12 text-brand-claro md:py-16">
      <div className="mx-auto flex w-[95%] max-w-[var(--width-max)] items-center justify-between gap-6 pb-8 md:w-[90%]">
        <p className="m-0 max-w-[760px] font-[family-name:var(--font-primary)] text-xl leading-7 text-brand-claro/90 md:text-2xl md:leading-8">
          {copy}
        </p>
        <div className="hidden shrink-0 items-center gap-3 md:flex">
          <button
            type="button"
            aria-label={previousLabel}
            onClick={handleScrollPrevious}
            className="flex size-10 items-center justify-center rounded-full text-brand-claro transition-colors duration-200 hover:bg-brand-claro/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-claro"
          >
            <ArrowLeft aria-hidden size={28} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            aria-label={nextLabel}
            onClick={handleScrollNext}
            className="flex size-10 items-center justify-center rounded-full text-brand-claro transition-colors duration-200 hover:bg-brand-claro/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-claro"
          >
            <ArrowRight aria-hidden size={28} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      <ul
        ref={scrollRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-[2.5%] pb-3 [scrollbar-width:none] md:gap-5 md:px-[5%] [&::-webkit-scrollbar]:hidden"
      >
        {brands.map((brand) => {
          const img = brand.featuredImage?.node;
          if (!brand.slug) return null;

          return (
            <li
              key={brand.id}
              className="w-[78vw] max-w-[380px] shrink-0 snap-start sm:w-[46vw] lg:w-[30vw] xl:w-[24vw]"
            >
              <Link
                href={`/brands/${brand.slug}`}
                className="group flex flex-col gap-3"
              >
                <div className="relative aspect-square overflow-hidden bg-brand-beige/25">
                  {img?.sourceUrl ? (
                    <Image
                      src={img.sourceUrl}
                      alt={img.altText ?? brand.title ?? ""}
                      fill
                      sizes="(min-width: 1280px) 24vw, (min-width: 1024px) 30vw, (min-width: 640px) 46vw, 78vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      unoptimized={shouldBypassImageOptimizer(img.sourceUrl)}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-6 text-center">
                      <span className="font-[family-name:var(--font-ui-stack)] text-lg font-semibold uppercase leading-tight tracking-[0.06em] text-brand-oscuro md:text-xl">
                        {brand.title}
                      </span>
                    </div>
                  )}
                  </div>
                <span className="font-[family-name:var(--font-ui-stack)] text-base font-light leading-6 text-brand-claro/85 underline-offset-4 group-hover:underline">
                  {brand.title}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mx-auto flex w-[95%] justify-end gap-3 pt-4 md:hidden">
        <button
          type="button"
          aria-label={previousLabel}
          onClick={handleScrollPrevious}
          className="flex size-10 items-center justify-center rounded-full text-brand-claro transition-colors duration-200 hover:bg-brand-claro/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-claro"
        >
          <ArrowLeft aria-hidden size={28} strokeWidth={1.8} />
        </button>
        <button
          type="button"
          aria-label={nextLabel}
          onClick={handleScrollNext}
          className="flex size-10 items-center justify-center rounded-full text-brand-claro transition-colors duration-200 hover:bg-brand-claro/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-claro"
        >
          <ArrowRight aria-hidden size={28} strokeWidth={1.8} />
        </button>
      </div>
    </section>
  );
}
