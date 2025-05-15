import { NextResponse } from 'next/server';
import { BankIDService } from '@/services/bankid';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { orderRef } = await request.json();
    const bankIDService = new BankIDService();
    
    const collectResponse = await bankIDService.collectAuth(orderRef);
    
    // If authentication is complete, create or update user
    if (collectResponse.status === 'complete' && collectResponse.completionData) {
      const { personalNumber, name, givenName, surname } = collectResponse.completionData.user;
      
      // Find or create user
      const user = await prisma.user.upsert({
        where: { 
          // Use personalNumber as unique identifier
          personalNumber: personalNumber 
        },
        update: {
          name: name,
          firstName: givenName,
          lastName: surname,
          emailVerified: new Date(), // BankID verification counts as email verification
        },
        create: {
          personalNumber: personalNumber,
          name: name,
          firstName: givenName,
          lastName: surname,
          userType: 'FREELANCER',
          emailVerified: new Date(),
        },
      });

      return NextResponse.json({
        status: 'complete',
        user: {
          id: user.id,
          name: user.name,
          personalNumber: user.personalNumber,
        },
      });
    }
    
    return NextResponse.json(collectResponse);
  } catch (error) {
    console.error('BankID collect error:', error);
    return NextResponse.json(
      { error: 'Failed to collect BankID authentication status' },
      { status: 500 }
    );
  }
}
