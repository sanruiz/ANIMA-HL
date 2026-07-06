import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { NEWS_TO_BLOG_REDIRECTS } from "./src/lib/redirects";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    // Permite imágenes servidas desde tu WordPress (ajusta el hostname en producción).
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  async redirects() {
    return NEWS_TO_BLOG_REDIRECTS;
  },
};

export default withNextIntl(nextConfig);
