// Video loop full-bleed de About (asset LOOP ABOUT de Webflow).
export default function AboutVideo() {
  return (
    <section className="about-video" aria-hidden>
      <video
        className="about-video__media"
        autoPlay
        muted
        loop
        playsInline
        poster="/about/loop-about-poster.jpg"
      >
        <source src="/about/loop-about.mp4" type="video/mp4" />
      </video>
    </section>
  );
}
