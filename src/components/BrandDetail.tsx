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
// Location) + featured image + optional gallery images from the ACF repeater.
export default function BrandDetail({ brand }: BrandDetailProps) {
  const t = useTranslations("brands.detail");
  const image = brand.featuredImage?.node;
  const fields = brand.brandFields;
  const hours = formatBrandHours(fields?.days, fields?.time);
  const mediaWidth = image?.mediaDetails?.width ?? 0;
  const mediaHeight = image?.mediaDetails?.height ?? 0;
  const hasMediaDimensions = mediaWidth > 0 && mediaHeight > 0;
  const imageWidth = hasMediaDimensions ? mediaWidth : 900;
  const imageHeight = hasMediaDimensions ? mediaHeight : 600;
  const galleryImages =
    fields?.gallery?.nodes.filter((galleryImage) => galleryImage.sourceUrl) ??
    [];
  const hasGalleryImages = galleryImages.length > 0;

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
            <div className="brand-detail__info mt-4">
              <p className="brand-detail__info-label">{t("hoursLabel")}</p>
              <p className="brand-detail__info-value">{hours}</p>
            </div>
          )}

          {fields?.phone && (
            <div className="brand-detail__info mt-4">
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
            <div className="brand-detail__info mt-4">
              <p className="brand-detail__info-label">{t("locationLabel")}</p>
              <p className="brand-detail__info-value">{fields.store}</p>
            </div>
          )}
        </div>

        {hasGalleryImages && (
          <div
            className="brand-detail__gallery columns-1 gap-6 md:columns-2 lg:columns-3"
            aria-label={`${brand.title ?? ""} gallery`}
          >
            {galleryImages.map((galleryImage, index) => {
              const { altText, mediaDetails, sourceUrl } = galleryImage;

              if (!sourceUrl) return null;

              const galleryWidth = mediaDetails?.width ?? 900;
              const galleryHeight = mediaDetails?.height ?? 1200;

              return (
                <figure
                  key={sourceUrl}
                  className="mb-6 break-inside-avoid overflow-hidden"
                >
                  <Image
                    src={sourceUrl}
                    alt={altText || brand.title || ""}
                    width={galleryWidth}
                    height={galleryHeight}
                    sizes="(max-width: 767px) 95vw, (max-width: 991px) 47vw, 16vw"
                    className="h-auto w-full object-cover"
                    unoptimized={shouldBypassImageOptimizer(sourceUrl)}
                    priority={index < 3}
                  />
                </figure>
              );
            })}
          </div>
        )}

        {!hasGalleryImages && image?.sourceUrl && (
          <div className="brand-detail__media">
            <Image
              src={image.sourceUrl}
              alt={image.altText ?? brand.title ?? ""}
              width={imageWidth}
              height={imageHeight}
              sizes="(max-width: 991px) 95vw, 47vw"
              className="brand-detail__img aspect-auto flex w-full flex-col items-start justify-start overflow-visible object-cover"
              unoptimized={shouldBypassImageOptimizer(image.sourceUrl)}
              priority
            />
          </div>
        )}
      </div>
    </section>
  );
}
