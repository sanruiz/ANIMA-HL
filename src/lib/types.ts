// Tipos de los CPTs del plugin soma-malls-content-types expuestos por WPGraphQL.

export type FeaturedImage = {
  node: {
    sourceUrl: string | null;
    altText: string | null;
    mediaDetails?: {
      width: number | null;
      height: number | null;
    } | null;
  } | null;
} | null;

export type TermNode = {
  name: string;
  slug: string;
};

export type MediaItem = {
  sourceUrl: string | null;
  altText: string | null;
  mediaDetails?: {
    width: number | null;
    height: number | null;
  } | null;
};

export type EventFields = {
  startDate: string | null;
  startTime: string | null;
  endDate: string | null;
  endTime: string | null;
  place: string | null;
  featured: boolean | null;
  gallery: { nodes: MediaItem[] } | null;
} | null;

export type EventNode = {
  id: string;
  title: string | null;
  slug: string | null;
  date: string | null;
  excerpt: string | null;
  featuredImage: FeaturedImage;
  eventTags: { nodes: TermNode[] } | null;
  eventFields: EventFields;
};

export type EventSingle = {
  id: string;
  title: string | null;
  slug: string | null;
  date: string | null;
  modified: string | null;
  excerpt: string | null;
  content: string | null;
  featuredImage: FeaturedImage;
  eventTags: { nodes: TermNode[] } | null;
  eventFields: EventFields;
};

export type BrandFields = {
  store: string | null;
  phone: string | null;
  website: string | null;
  days: string | null;
  time: string | null;
  featured: boolean | null;
  petfriendly: string | boolean | number | null;
  petfriendlyDescription: string | null;
} | null;

export type BrandNode = {
  id: string;
  title: string | null;
  slug: string | null;
  featuredImage: FeaturedImage;
  brandTags: { nodes: TermNode[] } | null;
  brandFields: BrandFields;
};

export type PostNode = {
  id: string;
  title: string | null;
  slug: string | null;
  date: string | null;
  excerpt: string | null;
  featuredImage: FeaturedImage;
};

export type EventsResponse = { events: { nodes: EventNode[] } };
export type EventBySlugResponse = { event: EventSingle | null };
export type BrandsResponse = { brands: { nodes: BrandNode[] } };

export type BrandHoursFields = {
  store: string | null;
  phone: string | null;
  days: string | null;
  time: string | null;
  gallery: { nodes: MediaItem[] } | null;
} | null;

export type BrandSingle = {
  id: string;
  title: string | null;
  slug: string | null;
  content: string | null;
  modified: string | null;
  featuredImage: FeaturedImage;
  brandTags: { nodes: TermNode[] } | null;
  brandFields: BrandHoursFields;
};
export type BrandBySlugResponse = { brand: BrandSingle | null };

export type BrandSlugNode = {
  id: string;
  slug: string | null;
  modified: string | null;
};
export type BrandSlugsResponse = { brands: { nodes: BrandSlugNode[] } };
export type NewsResponse = { posts: { nodes: PostNode[] } };

export type PostSingle = {
  id: string;
  title: string | null;
  date: string | null;
  modified: string | null;
  excerpt: string | null;
  content: string | null;
  featuredImage: FeaturedImage;
};
export type NewsBySlugResponse = { post: PostSingle | null };

export type PageSingle = {
  id: string;
  uri: string | null;
  slug: string | null;
  title: string | null;
  date: string | null;
  modified: string | null;
  content: string | null;
  featuredImage: FeaturedImage;
};

export type PageByUriResponse = { page: PageSingle | null };

export type NewsSlugNode = {
  id: string;
  slug: string | null;
  date: string | null;
  modified: string | null;
};

export type NewsSlugsResponse = { posts: { nodes: NewsSlugNode[] } };
