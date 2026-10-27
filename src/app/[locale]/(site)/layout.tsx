import { SiteFooter } from "@/components/anima/site-footer";
import { SiteHeader } from "@/components/anima/site-header";
import { getMenus } from "@/lib/menus";

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
  // Los editores controlan la nav desde wp-admin (Apariencia → Menús). Si
  // WordPress no responde, getMenus devuelve vacío y el header cae a su
  // lista local en vez de quedarse sin navegación.
  const { primary } = await getMenus(locale);

  return (
    <>
      <SiteHeader locale={locale} menu={primary} />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}
