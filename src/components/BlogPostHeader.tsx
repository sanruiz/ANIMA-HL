import { formatMonthYear } from "@/lib/utils";

interface BlogPostHeaderProps {
  date: string | null;
  locale: string;
  title: string | null;
}

export default function BlogPostHeader({
  date,
  locale,
  title,
}: BlogPostHeaderProps) {
  const formattedDate = formatMonthYear(date, locale);

  return (
    <header className="blog-post-hero">
      <div className="blog-post-hero__inner">
        <h1 className="blog-post-hero__title">{title}</h1>
        {formattedDate && (
          <p className="blog-post-hero__date">{formattedDate}</p>
        )}
      </div>
    </header>
  );
}
