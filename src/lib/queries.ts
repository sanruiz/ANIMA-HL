// GraphQL queries against the content model exposed by sanruiz-mall-core.
// Shapes (connections using `nodes`, including the single `brand` post_object
// relation on Deal/Job Offer) were verified end-to-end against a real
// WordPress install — see docs/PLATFORM-CHECKLIST.md.

export const EVENTS_QUERY = /* GraphQL */ `
  query Events($first: Int = 50) {
    events(first: $first, where: { orderby: { field: DATE, order: DESC } }) {
      nodes {
        id
        title
        slug
        date
        excerpt
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
        eventTags {
          nodes {
            name
            slug
          }
        }
        eventFields {
          startDate
          startTime
          endDate
          endTime
          place
          featured
          gallery {
            nodes {
              sourceUrl
              altText
            }
          }
        }
      }
    }
  }
`;

export const EVENT_BY_SLUG_QUERY = /* GraphQL */ `
  query EventBySlug($slug: ID!) {
    event(id: $slug, idType: SLUG) {
      id
      title
      slug
      date
      modified
      excerpt
      content
      featuredImage {
        node {
          sourceUrl
          altText
          mediaDetails {
            width
            height
          }
        }
      }
      eventTags {
        nodes {
          name
          slug
        }
      }
      eventFields {
        startDate
        startTime
        endDate
        endTime
        place
        featured
        gallery {
          nodes {
            sourceUrl
            altText
            mediaDetails {
              width
              height
            }
          }
        }
      }
    }
  }
`;

export const EVENT_SLUGS_QUERY = /* GraphQL */ `
  query EventSlugs($first: Int = 200) {
    events(first: $first) {
      nodes {
        id
        slug
        modified
      }
    }
  }
`;

export const BRANDS_QUERY = /* GraphQL */ `
  query Brands($first: Int = 100, $after: String) {
    brands(
      first: $first
      after: $after
      where: { orderby: { field: TITLE, order: ASC } }
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        title
        slug
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
        brandTags {
          nodes {
            name
            slug
            ancestors {
              nodes {
                slug
              }
            }
          }
        }
        brandFields {
          store
          phone
          email
          website
          days
          time
          featured
          petfriendly
          petfriendlyDescription
          gallery {
            nodes {
              sourceUrl
              altText
            }
          }
        }
      }
    }
  }
`;

export const BRAND_BY_SLUG_QUERY = /* GraphQL */ `
  query BrandBySlug($slug: ID!) {
    brand(id: $slug, idType: SLUG) {
      id
      title
      slug
      content
      modified
      featuredImage {
        node {
          sourceUrl
          altText
          mediaDetails {
            width
            height
          }
        }
      }
      brandTags {
        nodes {
          name
          slug
        }
      }
      brandFields {
        store
        phone
        email
        website
        days
        time
        featured
        petfriendly
        petfriendlyDescription
        gallery {
          nodes {
            sourceUrl
            altText
            mediaDetails {
              width
              height
            }
          }
        }
      }
    }
  }
`;

export const BRAND_SLUGS_QUERY = /* GraphQL */ `
  query BrandSlugs($first: Int = 200) {
    brands(first: $first) {
      nodes {
        id
        slug
        modified
      }
    }
  }
`;

export const DEALS_QUERY = /* GraphQL */ `
  query Deals($first: Int = 100) {
    deals(first: $first, where: { orderby: { field: DATE, order: DESC } }) {
      nodes {
        id
        title
        slug
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
        dealTags {
          nodes {
            name
            slug
          }
        }
        dealFields {
          startDate
          endDate
          discount
          brand {
            nodes {
              id
            }
          }
        }
      }
    }
  }
`;

export const DEAL_BY_SLUG_QUERY = /* GraphQL */ `
  query DealBySlug($slug: ID!) {
    deal(id: $slug, idType: SLUG) {
      id
      title
      slug
      content
      modified
      featuredImage {
        node {
          sourceUrl
          altText
        }
      }
      dealTags {
        nodes {
          name
          slug
        }
      }
      dealFields {
        startDate
        endDate
        discount
        brand {
          nodes {
            id
          }
        }
      }
    }
  }
`;

export const DEAL_SLUGS_QUERY = /* GraphQL */ `
  query DealSlugs($first: Int = 200) {
    deals(first: $first) {
      nodes {
        id
        slug
        modified
      }
    }
  }
`;

export const JOB_OFFERS_QUERY = /* GraphQL */ `
  query JobOffers($first: Int = 100) {
    jobOffers(first: $first, where: { orderby: { field: DATE, order: DESC } }) {
      nodes {
        id
        title
        slug
        jobOfferTags {
          nodes {
            name
            slug
          }
        }
        jobOfferFields {
          brand {
            nodes {
              id
            }
          }
          description
        }
      }
    }
  }
`;

export const JOB_OFFER_BY_SLUG_QUERY = /* GraphQL */ `
  query JobOfferBySlug($slug: ID!) {
    jobOffer(id: $slug, idType: SLUG) {
      id
      title
      slug
      content
      modified
      jobOfferTags {
        nodes {
          name
          slug
        }
      }
      jobOfferFields {
        brand {
          nodes {
            id
          }
        }
        description
        functions
        requirements
        offer
        contact
      }
    }
  }
`;

export const JOB_OFFER_SLUGS_QUERY = /* GraphQL */ `
  query JobOfferSlugs($first: Int = 200) {
    jobOffers(first: $first) {
      nodes {
        id
        slug
        modified
      }
    }
  }
`;

export const NEWS_QUERY = /* GraphQL */ `
  query News($first: Int = 50) {
    posts(first: $first, where: { orderby: { field: DATE, order: DESC } }) {
      nodes {
        id
        title
        slug
        date
        excerpt
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
      }
    }
  }
`;

export const NEWS_BY_SLUG_QUERY = /* GraphQL */ `
  query NewsBySlug($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      id
      title
      date
      modified
      excerpt
      content
      featuredImage {
        node {
          sourceUrl
          altText
        }
      }
    }
  }
`;

export const NEWS_SLUGS_QUERY = /* GraphQL */ `
  query NewsSlugs($first: Int = 100) {
    posts(first: $first, where: { orderby: { field: DATE, order: DESC } }) {
      nodes {
        id
        slug
        date
        modified
      }
    }
  }
`;

export const PAGE_SLUGS_QUERY = /* GraphQL */ `
  query PageSlugs($first: Int = 200) {
    pages(first: $first) {
      nodes {
        id
        uri
        modified
      }
    }
  }
`;

export const PAGE_BY_URI_QUERY = /* GraphQL */ `
  query PageByUri($uri: ID!) {
    page(id: $uri, idType: URI) {
      id
      uri
      slug
      title
      date
      modified
      content(format: RENDERED)
      featuredImage {
        node {
          sourceUrl
          altText
          mediaDetails {
            width
            height
          }
        }
      }
    }
  }
`;

export const MENUS_QUERY = /* GraphQL */ `
  query Menus {
    primaryMenuItems: menuItems(where: { location: PRIMARY }, first: 50) {
      nodes {
        id
        label
        uri
        path
        target
        parentId
        order
      }
    }
    footerMenuItems: menuItems(where: { location: FOOTER }, first: 50) {
      nodes {
        id
        label
        uri
        path
        target
        parentId
        order
      }
    }
  }
`;

export const MALL_SETTINGS_QUERY = /* GraphQL */ `
  query MallSettings {
    mallSettings {
      mallSettingsFields {
        mallName
        tagline
        logo {
          node {
            sourceUrl
          }
        }
        favicon {
          node {
            sourceUrl
          }
        }
        address
        phone
        email
        website
        openingHours
        mapUrl
        latitude
        longitude
        instagramUrl
        facebookUrl
        tiktokUrl
        youtubeUrl
      }
    }
  }
`;
