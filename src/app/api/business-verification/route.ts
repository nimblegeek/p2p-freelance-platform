import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { organizationNumber, companyName } = await request.json();

    // Validate required fields
    if (!organizationNumber || !companyName) {
      return NextResponse.json(
        { error: 'Organization number and company name are required' },
        { status: 400 }
      );
    }

    // Check if verification already exists
    const existingVerification = await prisma.businessVerification.findFirst({
      where: {
        OR: [
          { userId: session.user.id },
          { organizationNumber },
        ],
      },
    });

    if (existingVerification) {
      return NextResponse.json(
        { error: 'Business verification already exists' },
        { status: 409 }
      );
    }

    // Create new business verification
    const verification = await prisma.businessVerification.create({
      data: {
        userId: session.user.id,
        organizationNumber,
        companyName,
        verificationStatus: 'PENDING',
      },
    });

    return NextResponse.json(verification, { status: 201 });
  } catch (error) {
    console.error('Business verification error:', error);
    return NextResponse.json(
      { error: 'Failed to create business verification' },
      { status: 500 }
    );
  }
}
