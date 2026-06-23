import { useTranslations } from "next-intl";

// Primera sección del home: video full-bleed con texto superpuesto.
// Migrado del hero de animavillage.com (videohome.mp4 en /public).
export default function VideoHero() {
  const t = useTranslations("home");

  return (
    <section className="video-hero" aria-label="Ánima Village">
      <video
        className="video-hero__media"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/videohome-poster.jpg"
      >
        <source src="/videohome.mp4" type="video/mp4" />
      </video>

      <div className="video-hero__overlay" aria-hidden />

      <div className="video-hero__content">
        <h1 className="video-hero__title">
          {t.rich("heroText", {
            em: (chunks) => <em>{chunks}</em>,
          })}
        </h1>
      </div>
    </section>
  );
}
