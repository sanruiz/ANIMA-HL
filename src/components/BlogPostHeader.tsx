import Image from "next/image";
import type { FeaturedImage } from "@/lib/types";
import { formatMonthYear } from "@/lib/utils";
import { shouldBypassImageOptimizer } from "@/lib/wp-image";

interface BlogPostHeaderProps {
  date: string | null;
  featuredImage: FeaturedImage;
  locale: string;
  title: string | null;
}

export default function BlogPostHeader({
  date,
  featuredImage,
  locale,
  title,
}: BlogPostHeaderProps) {
  const image = featuredImage?.node;
  const formattedDate = formatMonthYear(date, locale);

  return (
    <header className="blog-post-hero">
      <div className="blog-post-hero__inner">
        <h1 className="blog-post-hero__title">{title}</h1>
        {formattedDate && (
          <p className="blog-post-hero__date">{formattedDate}</p>
        )}
        {image?.sourceUrl && (
          <div className="blog-post-hero__image">
            <Image
              src={image.sourceUrl}
              alt={image.altText ?? title ?? ""}
              width={1200}
              height={800}
              sizes="(max-width: 991px) 95vw, 60vw"
              className="blog-post-hero__img"
              unoptimized={shouldBypassImageOptimizer(image.sourceUrl)}
              priority
            />
          </div>
        )}
      </div>
    </header>
  );
}
