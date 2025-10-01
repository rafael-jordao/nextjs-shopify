/**
 * Focused GraphQL queries for customer profile operations
 * These queries are optimized for specific use cases to reduce payload and cost
 */

// Customer profile - basic info only
export const GET_CUSTOMER_PROFILE = `
  query getCustomerProfile($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      email
      firstName
      lastName
      phone
      acceptsMarketing
      createdAt
    }
  }
`;

// Customer with addresses - for address management
export const GET_CUSTOMER_WITH_ADDRESSES = `
  query getCustomerWithAddresses($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      email
      firstName
      lastName
      phone
      defaultAddress {
        id
      }
      addresses(first: 20) {
        edges {
          node {
            id
            firstName
            lastName
            company
            address1
            address2
            city
            province
            provinceCode
            country
            countryCodeV2
            zip
            phone
          }
        }
      }
    }
  }
`;

// Customer orders - minimal order info for order list
export const GET_CUSTOMER_ORDERS = `
  query getCustomerOrders($customerAccessToken: String!, $first: Int = 10) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      orders(first: $first, sortKey: PROCESSED_AT, reverse: true) {
        edges {
          node {
            id
            name
            orderNumber
            processedAt
            financialStatus
            fulfillmentStatus
            totalPrice {
              amount
              currencyCode
            }
            lineItems(first: 5) {
              edges {
                node {
                  title
                  quantity
                }
              }
            }
          }
        }
      }
    }
  }
`;

// Single order details - for order detail page
export const GET_ORDER_DETAILS = `
  query getOrderDetails($id: ID!) {
    order(id: $id) {
      id
      name
      orderNumber
      processedAt
      financialStatus
      fulfillmentStatus
      totalPrice {
        amount
        currencyCode
      }
      subtotalPrice {
        amount
        currencyCode
      }
      totalTax {
        amount
        currencyCode
      }
      totalShippingPrice {
        amount
        currencyCode
      }
      shippingAddress {
        firstName
        lastName
        company
        address1
        address2
        city
        province
        country
        zip
        phone
      }
      lineItems(first: 50) {
        edges {
          node {
            title
            quantity
            variant {
              id
              title
              price {
                amount
                currencyCode
              }
              product {
                handle
              }
              image {
                url
                altText
                width
                height
              }
            }
          }
        }
      }
      discountApplications(first: 10) {
        edges {
          node {
            ... on DiscountCodeApplication {
              code
              applicable
            }
            ... on AutomaticDiscountApplication {
              title
            }
          }
        }
      }
    }
  }
`;

// Customer session validation - minimal data for auth check
export const VALIDATE_CUSTOMER_SESSION = `
  query validateCustomerSession($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      email
      firstName
      lastName
      phone
    }
  }
`;

// Customer for checkout - addresses and basic info
export const GET_CUSTOMER_FOR_CHECKOUT = `
  query getCustomerForCheckout($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      email
      firstName
      lastName
      phone
      defaultAddress {
        id
        firstName
        lastName
        company
        address1
        address2
        city
        province
        provinceCode
        country
        countryCodeV2
        zip
        phone
      }
      addresses(first: 10) {
        edges {
          node {
            id
            firstName
            lastName
            company
            address1
            address2
            city
            province
            provinceCode
            country
            countryCodeV2
            zip
            phone
          }
        }
      }
    }
  }
`;
