// Product-related GraphQL queries

export const GET_PRODUCTS = `
  query getProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          handle
          description
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 1) {
            edges {
              node {
                url
                altText
                width
                height
              }
            }
          }
          variants(first: 1) {
            edges {
              node {
                id
                title
                availableForSale
                selectedOptions {
                  name
                  value
                }
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const GET_PRODUCT = `
  query getProduct($handle: String!) {
    productByHandle(handle: $handle) {
      id
      title
      description
      handle
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 10) {
        edges {
          node {
            id
            url
            altText
            width
            height
          }
        }
      }
      media(first: 10) {
        edges {
          node {
            ... on MediaImage {
              id
              mediaContentType
              image {
                id
                url
                altText
                width
                height
              }
            }
            ... on Video {
              id
              mediaContentType
              sources {
                url
                mimeType
              }
            }
            ... on Model3d {
              id
              mediaContentType
              sources {
                url
                mimeType
              }
            }
            ... on ExternalVideo {
              id
              mediaContentType
              host
              originUrl
            }
          }
        }
      }
      variants(first: 10) {
        edges {
          node {
            id
            title
            availableForSale
            selectedOptions {
              name
              value
            }
            price {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;
