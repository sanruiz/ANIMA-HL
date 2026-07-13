"use client";

import { Search } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { type ChangeEvent, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { localizeTags } from "@/lib/i18n-tags";
import type { BrandNode } from "@/lib/types";
import { cn } from "@/lib/utils";
import { shouldBypassImageOptimizer } from "@/lib/wp-image";

const ALL_FILTER = "__all__";

interface BrandsDirectoryProps {
  brands: BrandNode[];
}

// Sección "Retail Reimagined" migrada de Webflow: heading + subheading (canvas
// en BEM) + tabs de filtros + grid de tarjetas (interactivos/repetidos en
// Tailwind — ver hybrid rule en CLAUDE.md).
export default function BrandsDirectory({ brands }: BrandsDirectoryProps) {
  const t = useTranslations("brands");
  const locale = useLocale();
  const [active, setActive] = useState<string>(ALL_FILTER);
  const [searchTerm, setSearchTerm] = useState("");

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    for (const brand of brands) {
      for (const tag of brand.brandTags?.nodes ?? []) {
        if (!map.has(tag.slug)) {
          map.set(tag.slug, localizeTags(tag.name, locale));
        }
      }
    }
    return [...map.entries()]
      .map(([slug, name]) => ({ slug, name }))
      .sort((a, b) => a.name.localeCompare(b.name, locale));
  }, [brands, locale]);

  const normalizedSearch = searchTerm.trim().toLocaleLowerCase(locale);

  const filtered = useMemo(() => {
    const categoryMatches =
      active === ALL_FILTER
        ? brands
        : brands.filter(
            (brand) =>
              brand.brandTags?.nodes.some((tag) => tag.slug === active) ??
              false,
          );

    if (!normalizedSearch) return categoryMatches;

    return categoryMatches.filter((brand) => {
      const brandName = brand.title?.toLocaleLowerCase(locale) ?? "";
      return brandName.includes(normalizedSearch);
    });
  }, [brands, active, normalizedSearch, locale]);

  const filterKey = `${active}:${normalizedSearch}`;

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filterClass = (isActive: boolean) =>
    cn(
      "appearance-none rounded-full border bg-transparent cursor-pointer",
      "px-4 py-2 text-[13px] uppercase tracking-[0.06em]",
      "font-[family-name:var(--font-ui-stack)] font-normal",
      "transition-colors duration-200",
      "border-brand-oscuro/20 text-brand-oscuro",
      "hover:border-brand-oscuro",
      isActive && "border-brand-oscuro bg-brand-oscuro text-brand-claro"
    );

  return (
    <section
      className="brands-directory"
      aria-labelledby="brands-directory-heading"
    >
      <div className="brands-directory__intro">
        <h2 id="brands-directory-heading" className="brands-directory__heading">
          {t("directoryHeading")}
        </h2>
        <p className="brands-directory__lead">{t("directoryLead")}</p>
      </div>

      <div className="w-[95%] max-w-160 pb-6">
        <label htmlFor="brands-search" className="sr-only">
          {t("searchLabel")}
        </label>
        <div className="relative">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-brand-oscuro/45"
            strokeWidth={1.8}
          />
          <input
            id="brands-search"
            type="search"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder={t("searchPlaceholder")}
            className="h-12 w-full rounded-full border border-brand-oscuro/20 bg-transparent pl-12 pr-5 font-(family-name:--font-ui-stack) text-base font-normal text-brand-oscuro outline-none transition-colors duration-200 placeholder:text-brand-oscuro/45 hover:border-brand-oscuro focus:border-brand-oscuro focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-oscuro"
          />
        </div>
      </div>

      <div
        role="tablist"
        aria-label={t("directoryHeading")}
        className="w-[95%] max-w-(--width-max) flex flex-wrap justify-center gap-x-3 gap-y-2 pt-4 pb-10"
      >
        <button
          type="button"
          role="tab"
          aria-selected={active === ALL_FILTER}
          onClick={() => setActive(ALL_FILTER)}
          className={filterClass(active === ALL_FILTER)}
        >
          {t("filterAll")}
        </button>
        {categories.map(({ slug, name }) => (
          <button
            key={slug}
            type="button"
            role="tab"
            aria-selected={active === slug}
            onClick={() => setActive(slug)}
            className={filterClass(active === slug)}
          >
            {name}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="w-[95%] max-w-160 py-16 text-center font-(family-name:--font-primary) text-xl text-brand-oscuro/65">
          {t("empty")}
        </p>
      ) : (
        <ul className="w-[95%] max-w-(--width-max) list-none p-0 m-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10 lg:gap-x-8 lg:gap-y-12">
          {filtered.map((brand) => {
            const img = brand.featuredImage?.node;
            if (!brand.slug) return null;
            return (
              <li
                key={`${filterKey}:${brand.id}`}
                className="brands-directory__item"
              >
                <Link
                  href={`/brands/${brand.slug}`}
                  className="group flex flex-col gap-4.5"
                >
                  <div className="relative w-full aspect-4/3 overflow-hidden bg-brand-beige/60">
                    {img?.sourceUrl ? (
                      <Image
                        src={img.sourceUrl}
                        alt={img.altText ?? brand.title ?? ""}
                        fill
                        sizes="(min-width: 992px) 33vw, (min-width: 600px) 50vw, 95vw"
                        className="object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                        unoptimized={shouldBypassImageOptimizer(img.sourceUrl)}
                      />
                    ) : null}
                  </div>
                  <div className="px-0.5">
                    <h3 className="m-0 font-(family-name:--font-ui-stack) font-light text-base lg:text-[17px] leading-5.5 text-brand-oscuro">
                      {brand.title}
                    </h3>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
