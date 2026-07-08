import Image from "next/image";
import { useTranslations } from "next-intl";
import type { BrandSingle } from "@/lib/types";
import { formatBrandHours } from "@/lib/utils";
import { shouldBypassImageOptimizer } from "@/lib/wp-image";

interface BrandDetailProps {
  brand: BrandSingle;
}

// Single-brand template migrated from Webflow's .template-info-container:
// title + conditional description (WP content) + info rows (Hours/Contact/
// Location) + one full-height image (the gallery repeater is always empty
// in production, so it always falls back to the featured image).
export default function BrandDetail({ brand }: BrandDetailProps) {
  const t = useTranslations("brands.detail");
  const image = brand.featuredImage?.node;
  const fields = brand.brandFields;
  const hours = formatBrandHours(fields?.days, fields?.time);

  return (
    <section className="brand-detail">
      <div className="brand-detail__grid">
        <div className="brand-detail__body">
          <h1 className="brand-detail__title">{brand.title}</h1>

          {brand.content && (
            <div
              className="brand-detail__description"
              dangerouslySetInnerHTML={{ __html: brand.content }}
            />
          )}

          {hours && (
            <div className="brand-detail__info">
              <p className="brand-detail__info-label">{t("hoursLabel")}</p>
              <p className="brand-detail__info-value">{hours}</p>
            </div>
          )}

          {fields?.phone && (
            <div className="brand-detail__info">
              <p className="brand-detail__info-label">{t("contactLabel")}</p>
              <a
                href={`tel:${fields.phone}`}
                className="brand-detail__info-value"
              >
                {fields.phone}
              </a>
            </div>
          )}

          {fields?.store && (
            <div className="brand-detail__info">
              <p className="brand-detail__info-label">{t("locationLabel")}</p>
              <p className="brand-detail__info-value">{fields.store}</p>
            </div>
          )}
        </div>

        {image?.sourceUrl && (
          <div className="brand-detail__media">
            <Image
              src={image.sourceUrl}
              alt={image.altText ?? brand.title ?? ""}
              fill
              sizes="(max-width: 991px) 95vw, 47vw"
              className="brand-detail__img"
              unoptimized={shouldBypassImageOptimizer(image.sourceUrl)}
              priority
            />
          </div>
        )}
      </div>
    </section>
  );
}
