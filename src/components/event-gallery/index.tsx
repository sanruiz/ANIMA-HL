"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import type { MediaItem } from "@/lib/types";
import { shouldBypassImageOptimizer } from "@/lib/wp-image";

interface EventGalleryProps {
  images: MediaItem[];
  title: string | null;
}

type GalleryImage = MediaItem & {
  sourceUrl: string;
};

function hasSourceUrl(image: MediaItem): image is GalleryImage {
  return Boolean(image.sourceUrl);
}

function getImageWidth(image: GalleryImage): number {
  return image.mediaDetails?.width ?? 1400;
}

function getImageHeight(image: GalleryImage): number {
  return image.mediaDetails?.height ?? 1000;
}

export default function EventGallery({ images, title }: EventGalleryProps) {
  const t = useTranslations("agenda.detail");
  const galleryImages = useMemo(() => images.filter(hasSourceUrl), [images]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeImage =
    activeIndex === null ? null : galleryImages[activeIndex] ?? null;

  useEffect(() => {
    if (activeIndex === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveIndex(null);
        return;
      }

      if (event.key === "ArrowLeft") {
        setActiveIndex((currentIndex) => {
          if (currentIndex === null) return currentIndex;
          return currentIndex === 0
            ? galleryImages.length - 1
            : currentIndex - 1;
        });
      }

      if (event.key === "ArrowRight") {
        setActiveIndex((currentIndex) => {
          if (currentIndex === null) return currentIndex;
          return currentIndex === galleryImages.length - 1
            ? 0
            : currentIndex + 1;
        });
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex, galleryImages.length]);

  if (galleryImages.length === 0) return null;

  const handlePreviousClick = () => {
    setActiveIndex((currentIndex) => {
      if (currentIndex === null) return currentIndex;
      return currentIndex === 0 ? galleryImages.length - 1 : currentIndex - 1;
    });
  };

  const handleNextClick = () => {
    setActiveIndex((currentIndex) => {
      if (currentIndex === null) return currentIndex;
      return currentIndex === galleryImages.length - 1 ? 0 : currentIndex + 1;
    });
  };

  return (
    <section className="event-gallery" aria-label={t("galleryLabel")}>
      <ul className="event-gallery__grid">
        {galleryImages.map((image, index) => (
          <li key={`${image.sourceUrl}:${index}`} className="event-gallery__item">
            <button
              type="button"
              className="event-gallery__thumb"
              aria-label={t("openGalleryImage", { number: index + 1 })}
              onClick={() => setActiveIndex(index)}
            >
              <Image
                src={image.sourceUrl}
                alt={image.altText ?? title ?? ""}
                fill
                sizes="(min-width: 992px) 25vw, (min-width: 640px) 50vw, 95vw"
                className="event-gallery__thumb-img"
                unoptimized={shouldBypassImageOptimizer(image.sourceUrl)}
              />
            </button>
          </li>
        ))}
      </ul>

      {activeImage ? (
        <div
          className="event-gallery__lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={t("galleryLabel")}
        >
          <button
            type="button"
            className="event-gallery__backdrop"
            aria-label={t("closeGallery")}
            onClick={() => setActiveIndex(null)}
          />
          <div className="event-gallery__lightbox-inner">
            <button
              type="button"
              className="event-gallery__control event-gallery__control--close"
              aria-label={t("closeGallery")}
              onClick={() => setActiveIndex(null)}
            >
              <X size={26} strokeWidth={1.6} aria-hidden />
            </button>

            {galleryImages.length > 1 ? (
              <button
                type="button"
                className="event-gallery__control event-gallery__control--previous"
                aria-label={t("previousImage")}
                onClick={handlePreviousClick}
              >
                <ChevronLeft size={34} strokeWidth={1.4} aria-hidden />
              </button>
            ) : null}

            <Image
              src={activeImage.sourceUrl}
              alt={activeImage.altText ?? title ?? ""}
              width={getImageWidth(activeImage)}
              height={getImageHeight(activeImage)}
              sizes="95vw"
              className="event-gallery__lightbox-img"
              unoptimized={shouldBypassImageOptimizer(activeImage.sourceUrl)}
            />

            {galleryImages.length > 1 ? (
              <button
                type="button"
                className="event-gallery__control event-gallery__control--next"
                aria-label={t("nextImage")}
                onClick={handleNextClick}
              >
                <ChevronRight size={34} strokeWidth={1.4} aria-hidden />
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
