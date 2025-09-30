// Customer and Orders GraphQL queries

export const GET_CUSTOMER = `
  query getCustomer($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      email
      firstName
      lastName
      phone
      acceptsMarketing
      createdAt
      updatedAt
      defaultAddress {
        id
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
      addresses(first: 10) {
        edges {
          node {
            id
            firstName
            lastName
            address1
            address2
            city
            provinceCode
            countryCodeV2
            zip
            phone
            company
          }
        }
      }
      orders(first: 20) {
        edges {
          node {
            id
            name
            orderNumber
            email
            phone
            processedAt
            fulfillmentStatus
            financialStatus
            cancelReason
            canceledAt
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
              address1
              address2
              city
              province
              country
              zip
              phone
            }
            lineItems(first: 10) {
              edges {
                node {
                  title
                  quantity
                  variant {
                    id
                    title
                    image {
                      url
                      altText
                    }
                    price {
                      amount
                      currencyCode
                    }
                    product {
                      handle
                      title
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const GET_ORDER = `
  query getOrder($id: ID!) {
    order(id: $id) {
      id
      name
      orderNumber
      email
      phone
      processedAt
      fulfillmentStatus
      financialStatus
      cancelReason
      canceledAt
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
        address1
        address2
        city
        province
        country
        zip
        phone
      }
      billingAddress {
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
      lineItems(first: 50) {
        edges {
          node {
            title
            quantity
            variant {
              id
              title
              image {
                url
                altText
              }
              price {
                amount
                currencyCode
              }
              product {
                handle
                title
              }
            }
          }
        }
      }
      fulfillments {
        trackingCompany
        trackingNumber
        trackingUrl
        status
        createdAt
        updatedAt
      }
    }
  }
`;

export const CUSTOMER_CREATE = `
  mutation customerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        email
        firstName
        lastName
        phone
        acceptsMarketing
      }
      customerUserErrors {
        field
        message
      }
    }
  }
`;

export const CUSTOMER_ACCESS_TOKEN_CREATE = `
  mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        field
        message
      }
    }
  }
`;

export const CUSTOMER_ACCESS_TOKEN_DELETE = `
  mutation customerAccessTokenDelete($customerAccessToken: String!) {
    customerAccessTokenDelete(customerAccessToken: $customerAccessToken) {
      deletedAccessToken
      deletedCustomerAccessTokenId
      userErrors {
        field
        message
      }
    }
  }
`;

export const CUSTOMER_UPDATE = `
  mutation customerUpdate($customerAccessToken: String!, $customer: CustomerUpdateInput!) {
    customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
      customer {
        id
        email
        firstName
        lastName
        phone
        acceptsMarketing
      }
      customerUserErrors {
        field
        message
      }
    }
  }
`;

export const CUSTOMER_RECOVER = `
  mutation customerRecover($email: String!) {
    customerRecover(email: $email) {
      customerUserErrors {
        field
        message
      }
    }
  }
`;

export const CUSTOMER_ACTIVATE_BY_URL = `
  mutation customerActivateByUrl($activationUrl: URL!, $password: String!) {
    customerActivateByUrl(activationUrl: $activationUrl, password: $password) {
      customer {
        id
        email
        firstName
        lastName
        phone
      }
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        field
        message
      }
    }
  }
`;

export const CUSTOMER_RESET_BY_URL = `
  mutation customerResetByUrl($resetUrl: URL!, $password: String!) {
    customerResetByUrl(resetUrl: $resetUrl, password: $password) {
      customer {
        id
        email
        firstName
        lastName
        phone
      }
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        field
        message
      }
    }
  }
`;
