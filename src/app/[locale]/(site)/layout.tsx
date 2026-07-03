import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

// Layout del sitio "normal" (header + footer globales). Las páginas fuera de
// este route group — p. ej. /coming-soon — no heredan el chrome del sitio.
export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <>
      <SiteHeader locale={locale} />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}
