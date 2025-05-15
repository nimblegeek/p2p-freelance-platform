import { NextResponse } from 'next/server';
import { BankIDService } from '@/services/bankid';

export async function POST(request: Request) {
  try {
    const { personalNumber } = await request.json();
    const bankIDService = new BankIDService();
    
    const authResponse = await bankIDService.initializeAuth(personalNumber);
    
    return NextResponse.json(authResponse);
  } catch (error) {
    console.error('BankID initialization error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize BankID authentication' },
      { status: 500 }
    );
  }
}
