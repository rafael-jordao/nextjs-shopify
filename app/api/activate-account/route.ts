import { NextRequest, NextResponse } from 'next/server';
import { shopifyFetch } from '@/lib/shopify/client';

const CUSTOMER_ACTIVATE_BY_URL = `
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

export async function POST(request: NextRequest) {
  try {
    const { activationUrl, password } = await request.json();

    if (!activationUrl || !password) {
      return NextResponse.json(
        { message: 'Activation URL and password are required' },
        { status: 400 }
      );
    }

    const data = await shopifyFetch<{
      customerActivateByUrl: {
        customer: any;
        customerAccessToken: {
          accessToken: string;
          expiresAt: string;
        };
        customerUserErrors: Array<{ field: string; message: string }>;
      };
    }>(CUSTOMER_ACTIVATE_BY_URL, {
      activationUrl,
      password,
    });

    if (data.customerActivateByUrl.customerUserErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: data.customerActivateByUrl.customerUserErrors[0].message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Account activated successfully',
      data: {
        customer: data.customerActivateByUrl.customer,
        accessToken: data.customerActivateByUrl.customerAccessToken,
      },
    });
  } catch (error) {
    console.error('Error activating account:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
