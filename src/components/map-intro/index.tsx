import { useTranslations } from "next-intl";
import PageIntro from "@/components/page-intro";

export default function MapIntro() {
  const t = useTranslations("map");

  return (
    <PageIntro
      heading={t("heading")}
      headingId="map-intro-heading"
      lead={t.rich("lead", {
        em: (chunks) => <em>{chunks}</em>,
        br: () => <br />,
      })}
    />
  );
}
