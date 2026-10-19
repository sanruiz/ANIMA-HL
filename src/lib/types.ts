// Types for the content model exposed by the sanruiz-mall-core plugin over
// WPGraphQL. Field shapes and connection patterns (`nodes` for relations,
// including single post_object relations like `brand`) were verified
// end-to-end against a real WordPress install — see
// docs/PLATFORM-CHECKLIST.md.

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
  ancestors?: {
    nodes: { slug: string | null }[];
  } | null;
};

export type MediaItem = {
  sourceUrl: string | null;
  altText: string | null;
  mediaDetails?: {
    width: number | null;
    height: number | null;
  } | null;
};

/**
 * An ACF post_object relation (e.g. `brand` on Deal/Job Offer) is exposed by
 * WPGraphQL for ACF as a connection even though it's a single relation — see
 * the `nodes` (not `node`) shape confirmed in Fase 1 verification. Only `id`
 * is queried here; resolving the related Brand's own fields needs a second
 * query or a named fragment, not yet implemented in this starter.
 */
export type BrandRelation = { nodes: { id: string }[] } | null;

// ---------------------------------------------------------------- Event ---

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

export type EventSingle = EventNode & {
  modified: string | null;
  content: string | null;
};

export type EventsResponse = { events: { nodes: EventNode[] } };
export type EventBySlugResponse = { event: EventSingle | null };

export type EventSlugNode = { id: string; slug: string | null; modified: string | null };
export type EventSlugsResponse = { events: { nodes: EventSlugNode[] } };

// ---------------------------------------------------------------- Brand ---

/**
 * A single, complete shape used for both listing and detail — the legacy
 * ANIMA-HL frontend had two inconsistent Brand field types (one missing
 * `gallery`, the other missing `website`/`featured`/`petfriendly`); this
 * starter intentionally has only one.
 */
export type BrandFields = {
  store: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  days: string | null;
  time: string | null;
  featured: boolean | null;
  petfriendly: string[] | string | boolean | number | null;
  petfriendlyDescription: string | null;
  gallery: { nodes: MediaItem[] } | null;
} | null;

export type BrandNode = {
  id: string;
  title: string | null;
  slug: string | null;
  featuredImage: FeaturedImage;
  brandTags: { nodes: TermNode[] } | null;
  brandFields: BrandFields;
};

export type BrandSingle = BrandNode & {
  content: string | null;
  modified: string | null;
};

export type BrandsResponse = { brands: { nodes: BrandNode[] } };
export type BrandBySlugResponse = { brand: BrandSingle | null };

export type BrandSlugNode = { id: string; slug: string | null; modified: string | null };
export type BrandSlugsResponse = { brands: { nodes: BrandSlugNode[] } };

// ----------------------------------------------------------------- Deal ---

export type DealFields = {
  startDate: string | null;
  endDate: string | null;
  discount: string | null;
  brand: BrandRelation;
} | null;

export type DealNode = {
  id: string;
  title: string | null;
  slug: string | null;
  featuredImage: FeaturedImage;
  dealTags: { nodes: TermNode[] } | null;
  dealFields: DealFields;
};

export type DealSingle = DealNode & {
  content: string | null;
  modified: string | null;
};

export type DealsResponse = { deals: { nodes: DealNode[] } };
export type DealBySlugResponse = { deal: DealSingle | null };

export type DealSlugNode = { id: string; slug: string | null; modified: string | null };
export type DealSlugsResponse = { deals: { nodes: DealSlugNode[] } };

// ------------------------------------------------------------ Job Offer ---

export type JobOfferFields = {
  brand: BrandRelation;
  description: string | null;
  functions: string | null;
  requirements: string | null;
  offer: string | null;
  contact: string | null;
} | null;

export type JobOfferNode = {
  id: string;
  title: string | null;
  slug: string | null;
  jobOfferTags: { nodes: TermNode[] } | null;
  jobOfferFields: JobOfferFields;
};

export type JobOfferSingle = JobOfferNode & {
  content: string | null;
  modified: string | null;
};

export type JobOffersResponse = { jobOffers: { nodes: JobOfferNode[] } };
export type JobOfferBySlugResponse = { jobOffer: JobOfferSingle | null };

export type JobOfferSlugNode = { id: string; slug: string | null; modified: string | null };
export type JobOfferSlugsResponse = { jobOffers: { nodes: JobOfferSlugNode[] } };

// ------------------------------------------------------------------ Post --

export type PostNode = {
  id: string;
  title: string | null;
  slug: string | null;
  date: string | null;
  excerpt: string | null;
  featuredImage: FeaturedImage;
};

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

export type NewsSlugNode = {
  id: string;
  slug: string | null;
  date: string | null;
  modified: string | null;
};
export type NewsSlugsResponse = { posts: { nodes: NewsSlugNode[] } };

/** Union of every "slugs for sitemap" query response, used by src/app/sitemap.ts. */
export type ContentSlugsResponse =
  | NewsSlugsResponse
  | BrandSlugsResponse
  | EventSlugsResponse
  | DealSlugsResponse
  | JobOfferSlugsResponse
  | PageSlugsResponse;

// ------------------------------------------------------------------ Page --

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

export type PageSlugNode = { id: string; uri: string | null; modified: string | null };
export type PageSlugsResponse = { pages: { nodes: PageSlugNode[] } };

// ------------------------------------------------------------------ Menu --

/** A single wp-admin nav menu item, from a location registered in the theme (see `register_nav_menus`). */
export type MenuItemNode = {
  id: string;
  label: string | null;
  uri: string | null;
  path: string | null;
  target: string | null;
  parentId: string | null;
  order: number | null;
};

export type MenusResponse = {
  primaryMenuItems: { nodes: MenuItemNode[] };
  footerMenuItems: { nodes: MenuItemNode[] };
};

// ------------------------------------------------------------ MallSettings

export type MallSettingsFields = {
  mallName: string | null;
  tagline: string | null;
  logo: { node: { sourceUrl: string | null } | null } | null;
  favicon: { node: { sourceUrl: string | null } | null } | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  openingHours: string | null;
  mapUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  tiktokUrl: string | null;
  youtubeUrl: string | null;
} | null;

export type MallSettingsResponse = {
  mallSettings: { mallSettingsFields: MallSettingsFields } | null;
};
