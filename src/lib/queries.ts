// Queries GraphQL contra los CPTs event/brand del plugin soma-malls-content-types.
//
// Campos ACF: el grupo ACF de Event se expone como el campo `events` dentro de
// cada nodo Event (nombre del field group). Lo pedimos con el alias `eventFields`
// para evitar el confuso `events { events { ... } }`.

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
        eventFields: events {
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
        brandFields: brands {
          store
          phone
          website
          days
          time
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
