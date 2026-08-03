import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { NEWS_TO_BLOG_REDIRECTS } from "./src/lib/redirects";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const wordpressUrl = new URL(
  process.env.WORDPRESS_API_URL ?? "https://anima-headless.local/graphql"
);

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    // Solo el WordPress del proyecto. Un comodín aquí convierte el optimizador
    // de imágenes en un proxy abierto: cualquiera podría servir archivos ajenos
    // a través del dominio y consumir la cuota de Vercel.
    //
    // El hostname sale de WORDPRESS_API_URL para que dev (LocalWP), preview y
    // producción funcionen sin tocar este archivo.
    remotePatterns: [
      {
        protocol: wordpressUrl.protocol.replace(":", "") as "http" | "https",
        hostname: wordpressUrl.hostname,
      },
    ],
  },
  async redirects() {
    return NEWS_TO_BLOG_REDIRECTS;
  },
};

export default withNextIntl(nextConfig);
