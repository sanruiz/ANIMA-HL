import { useTranslations } from "next-intl";
import SoulMark from "./SoulMark";

// Sección "section.full.beige" del home: emblema decorativo + heading italic
// centrados sobre fondo beige a 70vh. Replicado de Webflow.
export default function DailyRituals() {
  const t = useTranslations("home");

  return (
    <section className="rituals" aria-label="Ánima Village">
      <div className="rituals__inner">
        <SoulMark className="rituals__mark" />
        <h2 className="rituals__heading">
          {t.rich("ritualsHeading", {
            em: (chunks) => <em>{chunks}</em>,
            br: () => <br />,
          })}
        </h2>
      </div>
    </section>
  );
}
