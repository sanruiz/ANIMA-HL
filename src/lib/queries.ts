// Queries GraphQL contra los CPTs event/brand del plugin soma-malls-content-types.
//
// NOTA sobre campos ACF: cuando confirmes que cada field group tiene
// show_in_graphql=true (y esté instalado "WPGraphQL for ACF"), añade aquí el
// bloque del field group. Por convención de WPGraphQL aparece como un campo con
// el nombre del grupo, p. ej.:
//
//   eventFields { fecha lugar precio }
//
// Mientras tanto usamos los campos nativos (title, date, featuredImage, etc.).

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
      }
    }
  }
`;
