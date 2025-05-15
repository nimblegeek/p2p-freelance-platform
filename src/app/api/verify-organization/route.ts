import { NextResponse } from 'next/server';
import { RoaringService } from '@/services/roaring';

export async function POST(request: Request) {
  try {
    const { organizationNumber } = await request.json();

    // Basic validation
    if (!organizationNumber) {
      return NextResponse.json(
        { error: 'Organization number is required' },
        { status: 400 }
      );
    }

    // Clean the organization number
    const cleanNumber = organizationNumber.replace(/\D/g, '');
    if (cleanNumber.length !== 10) {
      return NextResponse.json(
        { error: 'Invalid organization number format' },
        { status: 400 }
      );
    }

    // Verify with Roaring API
    const roaringService = new RoaringService();
    try {
      const companyInfo = await roaringService.verifyCompany(cleanNumber);
      
      // Check if the company is active
      if (companyInfo.status !== 'ACTIVE') {
        return NextResponse.json(
          { error: 'Company is not active' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        valid: true,
        message: 'Organization verified successfully',
        company: companyInfo,
      });
    } catch (apiError: any) {
      if (apiError.message === 'Company not found') {
        return NextResponse.json(
          { error: 'Company not found in registry' },
          { status: 404 }
        );
      }
      throw apiError;
    }
  } catch (error) {
    console.error('Organization verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify organization' },
      { status: 500 }
    );
  }
}
