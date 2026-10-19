import { Link } from "@/i18n/navigation";

type BreadcrumbsProps = {
  locale: string;
  section: { label: string; href: string };
  variant?: "light" | "dark";
};

export function Breadcrumbs({
  locale,
  section,
  variant = "light",
}: BreadcrumbsProps) {
  const linkClassName =
    "inline-flex min-h-11 items-center transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current";

  return (
    <nav
      aria-label={locale === "en" ? "Breadcrumb" : "Ruta de navegación"}
      className={`mb-8 text-[10px] uppercase tracking-[0.22em] md:mb-14 ${variant === "dark" ? "text-refugio" : "text-origen"}`}
    >
      <ol className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <li>
          <Link href="/" className={linkClassName}>
            {locale === "en" ? "Home" : "Inicio"}
          </Link>
        </li>
        <li className="flex min-w-0 items-center gap-3">
          <span aria-hidden="true" className="opacity-50">/</span>
          <Link href={section.href} className={linkClassName}>
            {section.label}
          </Link>
        </li>
      </ol>
    </nav>
  );
}
