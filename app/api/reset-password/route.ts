import { NextRequest, NextResponse } from 'next/server';
import { shopifyFetch } from '@/lib/shopify/client';

const CUSTOMER_RESET_BY_URL = `
  mutation customerResetByUrl($resetUrl: URL!, $password: String!) {
    customerResetByUrl(resetUrl: $resetUrl, password: $password) {
      customer {
        id
        email
        firstName
        lastName
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
    const { resetUrl, password } = await request.json();

    if (!resetUrl || !password) {
      return NextResponse.json(
        { message: 'Reset URL and password are required' },
        { status: 400 }
      );
    }

    const data = await shopifyFetch<{
      customerResetByUrl: {
        customer: any;
        customerAccessToken: {
          accessToken: string;
          expiresAt: string;
        };
        customerUserErrors: Array<{ field: string; message: string }>;
      };
    }>(CUSTOMER_RESET_BY_URL, {
      resetUrl,
      password,
    });

    if (data.customerResetByUrl.customerUserErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: data.customerResetByUrl.customerUserErrors[0].message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
      customer: data.customerResetByUrl.customer,
      accessToken: data.customerResetByUrl.customerAccessToken?.accessToken,
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
