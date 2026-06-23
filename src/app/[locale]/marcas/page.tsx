import { getTranslations, setRequestLocale } from "next-intl/server";
import { fetchGraphQL } from "@/lib/wp";
import { BRANDS_QUERY } from "@/lib/queries";
import type { BrandsResponse, BrandNode } from "@/lib/types";
import { localizeTags } from "@/lib/i18n-tags";

function isTruthyPetFriendly(
  value: NonNullable<BrandNode["brandFields"]>["petfriendly"] | undefined
) {
  if (typeof value === "boolean") {
    return value;
  }

  if (value == null) {
    return false;
  }

  return !["no", "none", "false", "0", ""].includes(
    String(value).trim().toLowerCase()
  );
}

export default async function MarcasPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("brands");

  let brands: BrandNode[] = [];
  let failed = false;

  try {
    const data = await fetchGraphQL<BrandsResponse>({
      query: BRANDS_QUERY,
      locale,
    });
    brands = data.brands.nodes;
  } catch (err) {
    console.error("[marcas] error cargando marcas:", err);
    failed = true;
  }

  return (
    <div className="container">
      <h1>{t("title")}</h1>

      {failed ? (
        <p className="error">{t("error")}</p>
      ) : brands.length === 0 ? (
        <p className="empty">{t("empty")}</p>
      ) : (
        <div className="grid">
          {brands.map((brand) => {
            const img = brand.featuredImage?.node;
            const f = brand.brandFields;
            const hours = [f?.days, f?.time].filter(Boolean).join(" · ");
            const isPetFriendly = isTruthyPetFriendly(f?.petfriendly);
            return (
              <article className="card" key={brand.id}>
                {img?.sourceUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img.sourceUrl}
                    alt={img.altText ?? brand.title ?? ""}
                  />
                )}
                <div className="body">
                  <h3>{brand.title}</h3>
                  {f?.store && <div className="meta">{f.store}</div>}
                  {hours && <div className="meta">{hours}</div>}
                  {f?.website && (
                    <div className="meta">
                      <a
                        href={f.website}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "var(--accent)" }}
                      >
                        {t("website")} ↗
                      </a>
                    </div>
                  )}
                  <div>
                    {isPetFriendly && (
                      <span className="tag">🐾 {t("petFriendly")}</span>
                    )}
                    {brand.brandTags?.nodes.map((tag) => (
                      <span className="tag" key={tag.slug}>
                        {localizeTags(tag.name, locale)}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
