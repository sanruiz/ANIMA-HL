import type { ReactNode } from "react";

interface PageIntroProps {
  heading: ReactNode;
  headingId: string;
  lead: ReactNode;
}

export default function PageIntro({ heading, headingId, lead }: PageIntroProps) {
  return (
    <section className="blog-intro" aria-labelledby={headingId}>
      <div className="blog-intro__inner">
        <h1 id={headingId} className="blog-intro__heading">
          {heading}
        </h1>
        <p className="blog-intro__lead">{lead}</p>
      </div>
    </section>
  );
}
