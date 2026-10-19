import { useTranslations } from "next-intl";
import { PageIntro } from "@/components/anima/page-intro";

// Blog intro migrated from Webflow section.intro-text.blog.
export function BlogIntro() {
  const t = useTranslations("blog");

  return (
    <PageIntro
      heading={t("heading")}
      headingId="blog-intro-heading"
      lead={t.rich("lead", {
        em: (chunks) => <em>{chunks}</em>,
        br: () => <br />,
      })}
    />
  );
}
