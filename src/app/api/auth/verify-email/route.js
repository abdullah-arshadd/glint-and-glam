import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    // 1. Validation for missing fields
    if (!email || !otp) {
      return NextResponse.json({ message: 'Email and OTP are required' }, { status: 400 });
    }

    // 2. Find the user by email
    const user = await prisma.user.findFirst({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return NextResponse.json({ message: 'Account not found. Please register again.' }, { status: 404 });
    }

    if (user.isVerified) {
      return NextResponse.json({ message: 'Account is already verified. Please login.' }, { status: 400 });
    }

    // 3. Match OTP
    if (user.verificationToken !== otp) {
      return NextResponse.json({ message: 'Invalid verification code' }, { status: 400 });
    }

    // 4. Check if OTP is expired
    if (!user.tokenExpiry || new Date() > new Date(user.tokenExpiry)) {
      return NextResponse.json({ message: 'Verification code has expired. Please register again to get a new code.' }, { status: 400 });
    }

    // 5. Success! Update user as verified and remove temporary token data
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
        tokenExpiry: null
      }
    });

    const { password: _, ...userWithoutPassword } = updatedUser;

    // 6. Automatically log them in by setting cookie directly on verification success
    const response = NextResponse.json(
      { message: 'Email verified and logged in successfully!', user: userWithoutPassword },
      { status: 200 }
    );

    // Dynamic import for JWT to prevent edge runtime issues
    const jwt = require('jsonwebtoken');
    const sessionToken = jwt.sign(
      { id: updatedUser.id, email: updatedUser.email, role: updatedUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    response.cookies.set({
      name: 'twinkles_session',
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('VERIFY_EMAIL_ROUTE_ERROR:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}