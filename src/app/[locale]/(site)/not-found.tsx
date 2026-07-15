import { Compass, Home, MapPin } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export default async function NotFoundPage() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "notFound" });

  return (
    <section className="flex min-h-[calc(100svh-100px)] w-full items-center justify-center overflow-hidden bg-brand-claro px-5 pb-18 pt-36 text-brand-oscuro md:px-8 md:pb-24 md:pt-44">
      <div className="grid w-full max-w-[var(--width-max)] gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.58fr)] lg:items-center">
        <div className="max-w-190">
          <p className="mb-5 font-(family-name:--font-ui-stack) text-xs font-medium uppercase tracking-[0.18em] text-brand-verde">
            {t("eyebrow")}
          </p>
          <h1 className="mb-6 max-w-175 font-(family-name:--font-primary) text-[46px] leading-[0.98] font-normal text-brand-oscuro md:text-[72px] lg:text-[92px]">
            {t("heading")}
          </h1>
          <p className="max-w-150 font-(family-name:--font-primary) text-[21px] leading-8 text-brand-oscuro/82 md:text-[27px] md:leading-10">
            {t("lead")}
          </p>

          <div className="mt-10 flex flex-col gap-3 font-(family-name:--font-ui-stack) sm:flex-row">
            <Button
              asChild
              className="h-11 rounded-none border-brand-oscuro bg-brand-oscuro px-5 text-brand-claro hover:bg-brand-verde"
            >
              <Link href="/">
                <Home aria-hidden className="size-4 text-brand-claro" />
                <span className="text-brand-claro">{t("home")}</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 rounded-none border-brand-oscuro bg-transparent px-5 text-brand-oscuro hover:bg-brand-beige"
            >
              <Link href="/map">
                <MapPin aria-hidden className="size-4" />
                {t("map")}
              </Link>
            </Button>
          </div>
        </div>

        <aside
          aria-label={t("detailLabel")}
          className="relative min-h-80 border border-brand-oscuro bg-brand-beige p-6 md:min-h-96 md:p-8 lg:min-h-[520px]"
        >
          <div className="absolute inset-x-6 top-6 h-px bg-brand-oscuro/45 md:inset-x-8 md:top-8" />
          <div className="absolute bottom-6 left-6 right-6 h-px bg-brand-oscuro/45 md:bottom-8 md:left-8 md:right-8" />
          <div className="flex h-full min-h-68 flex-col justify-between gap-10 md:min-h-80 lg:min-h-[456px]">
            <p className="font-(family-name:--font-ui-stack) text-xs uppercase tracking-[0.18em] text-brand-verde">
              {t("status")}
            </p>

            <div className="relative">
              <span className="block font-(family-name:--font-primary) text-[108px] leading-none text-brand-oscuro md:text-[148px] lg:text-[178px]">
                404
              </span>
              <span className="absolute bottom-2 right-0 h-18 w-18 rounded-full border border-brand-oscuro/55 md:h-24 md:w-24" />
            </div>

            <div className="flex items-start gap-4 border-t border-brand-oscuro/35 pt-6">
              <Compass aria-hidden className="mt-1 size-5 shrink-0 text-brand-verde" />
              <p className="m-0 font-(family-name:--font-ui-stack) text-sm leading-6 text-brand-oscuro/78 md:text-base md:leading-7">
                {t("hint")}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
