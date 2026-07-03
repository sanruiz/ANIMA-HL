import { useTranslations } from "next-intl";

// Bloque de intro de About: dos párrafos centrados sobre fondo claro.
export default function AboutIntro() {
  const t = useTranslations("about");
  const em = (chunks: React.ReactNode) => <em>{chunks}</em>;

  return (
    <section className="about-intro">
      <div className="about-intro__inner">
        <p className="about-intro__lead">{t.rich("heroP1", { em })}</p>
        <p className="about-intro__lead">{t.rich("heroP2", { em })}</p>
      </div>
    </section>
  );
}
