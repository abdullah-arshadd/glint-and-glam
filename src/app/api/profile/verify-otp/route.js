import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('twinkles_session')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const body = await request.json();
    const { phone, otp } = body;

    if (!phone || !otp) {
      return NextResponse.json({ message: 'Missing parameters' }, { status: 400 });
    }

    // 1. Record dhoondo temporary collection se
    const record = await prisma.phoneVerification.findUnique({ where: { phone } });

    if (!record || record.otp !== otp) {
      return NextResponse.json({ message: 'Invalid OTP code. Please try again.' }, { status: 400 });
    }

    // 2. Expiry check karo
    if (new Date() > record.expiresAt) {
      return NextResponse.json({ message: 'OTP has expired. Please request a new one.' }, { status: 400 });
    }

    // 3. Main User record update karo
    const updatedUser = await prisma.user.update({
      where: { id: decoded.id },
      data: { phone },
    });

    // 4. Verification clean up karo database se
    await prisma.phoneVerification.delete({ where: { phone } });

    // 5. Naya session sign karo taake updated details save hojayein
    const newToken = jwt.sign(
      { id: updatedUser.id, email: updatedUser.email, role: updatedUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json({ message: 'Phone verified and updated successfully!' }, { status: 200 });
    
    response.cookies.set({
      name: 'twinkles_session',
      value: newToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('VERIFY_OTP_ERROR:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}