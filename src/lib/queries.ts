// Queries GraphQL contra los CPTs event/brand del plugin soma-malls-content-types.
//
// Campos ACF: el grupo ACF de Event se expone como `eventFields` en el schema
// remoto de WPGraphQL.

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
        days
        time
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

export const BRANDS_QUERY = /* GraphQL */ `
  query Brands($first: Int = 100) {
    brands(first: $first, where: { orderby: { field: TITLE, order: ASC } }) {
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
          }
        }
        brandFields {
          store
          phone
          website
          days
          time
          featured
          petfriendly
          petfriendlyDescription
        }
      }
    }
  }
`;
