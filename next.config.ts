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
    // WordPress no manda Cache-Control en /wp-content/uploads (solo etag y
    // last-modified), así que sin esto Next usaría su default de 4h y
    // regeneraría las ~600 variantes del sitio varias veces al día, facturando
    // cada transformación.
    //
    // Un año es seguro porque WordPress asigna un nombre único a cada subida
    // (agrega -1, -2 ante colisión), así que reemplazar una imagen produce una
    // URL nueva. La excepción es sobrescribir el archivo por SFTP o con un
    // plugin de reemplazo de medios conservando la ruta: en ese caso hay que
    // resubirla con otro nombre.
    minimumCacheTTL: 31536000,
    formats: ["image/avif", "image/webp"],
    qualities: [75],
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
