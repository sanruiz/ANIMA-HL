// Tipos de los CPTs del plugin soma-malls-content-types expuestos por WPGraphQL.

export type FeaturedImage = {
  node: {
    sourceUrl: string | null;
    altText: string | null;
  } | null;
} | null;

export type TermNode = {
  name: string;
  slug: string;
};

export type EventNode = {
  id: string;
  title: string | null;
  slug: string | null;
  date: string | null;
  excerpt: string | null;
  featuredImage: FeaturedImage;
  eventTags: { nodes: TermNode[] } | null;
};

export type BrandNode = {
  id: string;
  title: string | null;
  slug: string | null;
  featuredImage: FeaturedImage;
  brandTags: { nodes: TermNode[] } | null;
};

export type EventsResponse = { events: { nodes: EventNode[] } };
export type BrandsResponse = { brands: { nodes: BrandNode[] } };
