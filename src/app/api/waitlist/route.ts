import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UserType, WaitlistStatus } from '@prisma/client';

// Create a new waitlist entry
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { email, userType, firstName, lastName, companyName, interests, source } = data;

    // Validate required fields
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    if (!['CLIENT', 'FREELANCER'].includes(userType)) {
      return NextResponse.json(
        { error: 'Invalid user type' },
        { status: 400 }
      );
    }

    // Create waitlist entry
    const entry = await prisma.waitlistEntry.create({
      data: {
        email,
        userType: userType as UserType,
        firstName: firstName || null,
        lastName: lastName || null,
        companyName: companyName || null,
        interests: interests ? interests.join(',') : null,
        source: source || null,
        status: WaitlistStatus.PENDING,
      },
    });

    return NextResponse.json(
      { message: 'Successfully joined waitlist', entry },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'This email is already on the waitlist' },
        { status: 409 }
      );
    }

    console.error('Waitlist error:', error);
    return NextResponse.json(
      { error: 'Failed to join waitlist' },
      { status: 500 }
    );
  }
}

// Get all waitlist entries with filtering options
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userType = searchParams.get('userType');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build where clause for filtering
    const where: any = {};
    if (userType) where.userType = userType;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count for pagination
    const total = await prisma.waitlistEntry.count({ where });

    // Get paginated results
    const entries = await prisma.waitlistEntry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      entries,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error('Waitlist fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch waitlist entries' },
      { status: 500 }
    );
  }
}

// Update a waitlist entry
export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json(
        { error: 'Entry ID is required' },
        { status: 400 }
      );
    }

    const entry = await prisma.waitlistEntry.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(entry);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      );
    }

    console.error('Waitlist update error:', error);
    return NextResponse.json(
      { error: 'Failed to update waitlist entry' },
      { status: 500 }
    );
  }
}

// Delete a waitlist entry
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Entry ID is required' },
        { status: 400 }
      );
    }

    await prisma.waitlistEntry.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Entry deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      );
    }

    console.error('Waitlist deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete waitlist entry' },
      { status: 500 }
    );
  }
}
