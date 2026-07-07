import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { PostNode } from "@/lib/types";
import { formatMonthYear } from "@/lib/utils";
import { shouldBypassImageOptimizer } from "@/lib/wp-image";

interface BlogListProps {
  posts: PostNode[];
  locale: string;
}

// Post grid migrated from Webflow news-list.
export default function BlogList({ posts, locale }: BlogListProps) {
  return (
    <section className="flex w-full justify-center bg-brand-claro pb-24">
      <ul className="m-0 grid w-[95%] max-w-[var(--width-max)] list-none grid-cols-1 gap-[50px] p-0 md:grid-cols-3">
        {posts.map((post) => {
          const img = post.featuredImage?.node;
          if (!post.slug) return null;

          return (
            <li key={post.id} className="mb-[25px]">
              <Link
                href={`/blog/${post.slug}`}
                className="group relative flex h-[600px] max-h-[70vh] w-full flex-col items-center justify-center overflow-hidden bg-brand-oscuro/50"
              >
                {img?.sourceUrl ? (
                  <Image
                    src={img.sourceUrl}
                    alt={img.altText ?? post.title ?? ""}
                    fill
                    sizes="(min-width: 768px) 33vw, 95vw"
                    className="object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                    unoptimized={shouldBypassImageOptimizer(img.sourceUrl)}
                  />
                ) : null}
                <div
                  className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40"
                  aria-hidden
                />
                <div className="absolute inset-x-0 bottom-0 flex flex-col items-center px-[30px] pb-[50px] text-center">
                  <h2 className="m-0 pt-[10px] font-[family-name:var(--font-primary)] text-lg font-normal leading-6 text-brand-claro">
                    {post.title}
                  </h2>
                  {post.date && (
                    <p className="m-0 pt-[10px] font-[family-name:var(--font-ui-stack)] text-sm text-brand-claro/60">
                      {formatMonthYear(post.date, locale)}
                    </p>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
