import Image from "next/image";
import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type ArteDetailTone = "verde" | "beige" | "claro";

interface ArteDetailImage {
  src: string;
  alt: string;
}

interface ArteDetailCta {
  href: string;
  label: string;
}

interface ArteDetailArtwork {
  artist: string;
  titleYear: ReactNode;
  medium: string;
}

interface ArteDetailProps {
  tone: ArteDetailTone;
  eyebrow?: string;
  heading: string;
  artwork?: ArteDetailArtwork;
  artworkPosition?: "before" | "after";
  description: ReactNode;
  note?: ReactNode;
  cta?: ArteDetailCta;
  images: ArteDetailImage[];
  reverse?: boolean;
}

const TONE_CLASSES: Record<ArteDetailTone, string> = {
  verde: "bg-brand-verde text-brand-claro",
  beige: "bg-brand-beige text-brand-oscuro",
  claro: "bg-brand-claro text-brand-oscuro",
};

const TONE_HEADING_CLASSES: Record<ArteDetailTone, string> = {
  verde: "text-brand-claro",
  beige: "text-brand-oscuro",
  claro: "text-brand-oscuro",
};

const CTA_HOVER_CLASSES: Record<ArteDetailTone, string> = {
  verde: "hover:bg-brand-beige hover:text-brand-verde",
  beige: "hover:bg-brand-oscuro hover:text-brand-beige",
  claro: "hover:bg-brand-oscuro hover:text-brand-claro",
};

export default function ArteDetail({
  tone,
  eyebrow,
  heading,
  artwork,
  artworkPosition = "before",
  description,
  note,
  cta,
  images,
  reverse = false,
}: ArteDetailProps) {
  const artworkBlock = artwork ? (
    <div className="font-(family-name:--font-primary) text-lg leading-relaxed lg:text-[21px]">
      <p className="m-0">{artwork.artist}</p>
      <p className="m-0 italic">{artwork.titleYear}</p>
      <p className="m-0">{artwork.medium}</p>
    </div>
  ) : null;

  return (
    <section className={cn("flex w-full justify-center", TONE_CLASSES[tone])}>
      <div className="grid w-[95%] max-w-(--width-content) grid-cols-1 items-center gap-10 pt-27.5 pb-16 lg:grid-cols-2 lg:gap-16 lg:pt-32.5 lg:pb-24">
        <div className={cn("flex flex-col gap-5", reverse && "lg:order-2")}>
          {eyebrow ? (
            <p className="m-0 font-(family-name:--font-primary) text-lg italic opacity-70">
              {eyebrow}
            </p>
          ) : null}
          <h1
            className={cn(
              "m-0 font-(family-name:--font-primary) text-[40px] leading-tight font-normal lg:text-[48px]",
              TONE_HEADING_CLASSES[tone],
            )}
          >
            {heading}
          </h1>
          <hr className="m-0 w-16 border-t border-current opacity-25" />
          {artworkPosition === "before" ? artworkBlock : null}
          <div className="flex flex-col gap-4 font-(family-name:--font-primary) text-lg leading-relaxed [&_em]:italic lg:text-[21px]">
            {description}
          </div>
          {artworkPosition === "after" ? artworkBlock : null}
          {note ? (
            <p className="m-0 font-(family-name:--font-primary) text-lg leading-relaxed opacity-75 lg:text-[21px]">
              {note}
            </p>
          ) : null}
          {cta ? (
            <Link
              href={cta.href}
              className={cn(
                "mt-1 inline-block self-start  rounded-full border border-current px-6.5 py-3 font-(family-name:--font-ui-stack) text-sm tracking-[0.02em] transition-colors duration-250",
                CTA_HOVER_CLASSES[tone],
              )}
            >
              {cta.label}
            </Link>
          ) : null}
        </div>
        <div className="grid grid-cols-2 gap-4 lg:gap-6">
          {images.map((image, index) => {
            const isOddOut =
              images.length % 2 === 1 && index === images.length - 1;

            return (
              <div
                key={`${image.src}:${index}`}
                className={cn(
                  "relative overflow-hidden",
                  isOddOut ? "col-span-2 aspect-video" : "aspect-4/5",
                )}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes={
                    isOddOut
                      ? "(max-width: 1023px) 95vw, 50vw"
                      : "(max-width: 1023px) 50vw, 25vw"
                  }
                  className="object-cover"
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
