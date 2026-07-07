import "../globals.css";
import type { Metadata } from "next";
import { Cardo, Geist_Mono, Inter } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getSiteUrl } from "@/lib/seo";

const cardo = Cardo({
  variable: "--font-cardo",
  subsets: ["latin"],
  weight: "400",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Sustituto libre de "Neue Haas Grotesk Display" (Adobe) que usa el nav en Webflow.
const inter = Inter({
  variable: "--font-ui",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: "Ánima Village",
  description: "Sitio headless con WordPress + Next.js",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Habilita el renderizado estático para este locale.
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`${cardo.variable} ${geistMono.variable} ${inter.variable}`}
    >
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
