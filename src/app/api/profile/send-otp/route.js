import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('twinkles_session')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { phone } = body; // E.g., "+923001234567"

    if (!phone) {
      return NextResponse.json({ message: 'Phone number is required' }, { status: 400 });
    }

    // 1. Generate 6-Digit Random Number
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 Mins Validation Life

    // 2. Database mein save ya upsert (purana delete/naya save) karo
    await prisma.phoneVerification.upsert({
      where: { phone },
      update: { otp, expiresAt },
      create: { phone, otp, expiresAt },
    });

    // 3. 🚀 SMS GATEWAY INTEGRATION LAYER
    // Yahan aap Twilio ya local PK gateway ka function call karoge:
    // await sendSMS(phone, `Your Glint & Glam verification code is: ${otp}`);
    console.log(`============= OTP FOR ${phone} IS: ${otp} =============`);

    return NextResponse.json({ message: 'OTP sent successfully to your phone!' }, { status: 200 });

  } catch (error) {
    console.error('SEND_OTP_ERROR:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}