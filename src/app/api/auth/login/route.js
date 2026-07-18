import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ message: 'Missing email or password' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json({ message: 'Account not found. Please register first!' }, { status: 404 });
    }

    // 🌟 NEW: Strict Verification Check (Block login if email is not verified)
    if (!user.isVerified) {
      return NextResponse.json(
        { message: 'Please verify your email first. Go to signup to request a new code.' }, 
        { status: 403 }
      );
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return NextResponse.json({ message: 'Invalid password. Please try again.' }, { status: 401 });
    }

    const { password: _, ...userWithoutPassword } = user;

    // 🔒 CRYPTO LAYER: Data ko secret key ke saath sign karke token banaya
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json(
      { message: 'Login successful! Welcome back.', user: userWithoutPassword },
      { status: 200 }
    );

    // Cookie ka naam vahi rakha hai 'twinkles_session' taake aapka baaki code na tute
    response.cookies.set({
      name: 'twinkles_session',
      value: token, // Ab yahan text nahi, secure cryptographic token ja raha hai!
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('LOGIN_ERROR:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}