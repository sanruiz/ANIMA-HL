import { useTranslations } from "next-intl";
import { SoulMark } from "./soul-mark";

// Cierre de About: emblema + heading italic centrados sobre beige.
export function AboutClosing() {
  const t = useTranslations("about");

  return (
    <section className="about-closing" aria-label="Ánima Village">
      <div className="about-closing__inner">
        <SoulMark className="about-closing__mark" />
        <h2 className="about-closing__heading">
          {t.rich("closing", { em: (chunks) => <em>{chunks}</em> })}
        </h2>
      </div>
    </section>
  );
}
