import { gql } from 'graphql-request';

// Query para criar checkout com dados do cliente
export const CREATE_CHECKOUT = gql`
  mutation checkoutCreate($input: CheckoutCreateInput!) {
    checkoutCreate(input: $input) {
      checkout {
        id
        webUrl
        subtotalPriceV2 {
          amount
          currencyCode
        }
        totalTaxV2 {
          amount
          currencyCode
        }
        totalPriceV2 {
          amount
          currencyCode
        }
        lineItems(first: 250) {
          edges {
            node {
              id
              title
              quantity
              variant {
                id
                title
                price
                priceV2 {
                  amount
                  currencyCode
                }
                product {
                  id
                  handle
                  title
                }
                image {
                  url
                  altText
                }
              }
            }
          }
        }
      }
      checkoutUserErrors {
        field
        message
      }
    }
  }
`;

// Atualizar dados de entrega do checkout
export const UPDATE_CHECKOUT_SHIPPING_ADDRESS = gql`
  mutation checkoutShippingAddressUpdateV2(
    $checkoutId: ID!
    $shippingAddress: MailingAddressInput!
  ) {
    checkoutShippingAddressUpdateV2(
      checkoutId: $checkoutId
      shippingAddress: $shippingAddress
    ) {
      checkout {
        id
        webUrl
        availableShippingRates {
          ready
          shippingRates {
            handle
            title
            priceV2 {
              amount
              currencyCode
            }
          }
        }
      }
      checkoutUserErrors {
        field
        message
      }
    }
  }
`;

// Atualizar email do checkout
export const UPDATE_CHECKOUT_EMAIL = gql`
  mutation checkoutEmailUpdateV2($checkoutId: ID!, $email: String!) {
    checkoutEmailUpdateV2(checkoutId: $checkoutId, email: $email) {
      checkout {
        id
        email
        webUrl
      }
      checkoutUserErrors {
        field
        message
      }
    }
  }
`;

// Selecionar método de entrega
export const UPDATE_CHECKOUT_SHIPPING_LINE = gql`
  mutation checkoutShippingLineUpdate(
    $checkoutId: ID!
    $shippingRateHandle: String!
  ) {
    checkoutShippingLineUpdate(
      checkoutId: $checkoutId
      shippingRateHandle: $shippingRateHandle
    ) {
      checkout {
        id
        webUrl
        totalPriceV2 {
          amount
          currencyCode
        }
        shippingLine {
          handle
          title
          priceV2 {
            amount
            currencyCode
          }
        }
      }
      checkoutUserErrors {
        field
        message
      }
    }
  }
`;

// Query para buscar checkout por ID
export const GET_CHECKOUT = gql`
  query getCheckout($id: ID!) {
    node(id: $id) {
      ... on Checkout {
        id
        webUrl
        email
        subtotalPriceV2 {
          amount
          currencyCode
        }
        totalTaxV2 {
          amount
          currencyCode
        }
        totalPriceV2 {
          amount
          currencyCode
        }
        shippingAddress {
          firstName
          lastName
          address1
          address2
          city
          province
          country
          zip
          phone
        }
        shippingLine {
          handle
          title
          priceV2 {
            amount
            currencyCode
          }
        }
        availableShippingRates {
          ready
          shippingRates {
            handle
            title
            priceV2 {
              amount
              currencyCode
            }
          }
        }
        lineItems(first: 250) {
          edges {
            node {
              id
              title
              quantity
              variant {
                id
                title
                price
                priceV2 {
                  amount
                  currencyCode
                }
                product {
                  id
                  handle
                  title
                }
                image {
                  url
                  altText
                }
              }
            }
          }
        }
      }
    }
  }
`;
