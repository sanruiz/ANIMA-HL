import { useTranslations } from "next-intl";

// Blog intro migrated from Webflow section.intro-text.blog.
export default function BlogIntro() {
  const t = useTranslations("blog");

  return (
    <section className="blog-intro" aria-labelledby="blog-intro-heading">
      <div className="blog-intro__inner">
        <h1 id="blog-intro-heading" className="blog-intro__heading">
          {t("heading")}
        </h1>
        <p className="blog-intro__lead">
          {t.rich("lead", {
            em: (chunks) => <em>{chunks}</em>,
            br: () => <br />,
          })}
        </p>
      </div>
    </section>
  );
}
