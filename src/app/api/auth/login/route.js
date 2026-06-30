import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Missing email or password' },
        { status: 400 }
      );
    }

    // 1. Database mein check karo user exist karta hai ya nahi
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Agar user nahi mila
    if (!user) {
      return NextResponse.json(
        { message: 'Account not found. Please register first!' },
        { status: 404 }
      );
    }

    // 2. Password match karo (jo input kiya vs jo hashed database mein hai)
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return NextResponse.json(
        { message: 'Invalid password. Please try again.' },
        { status: 401 }
      );
    }

    // 3. Agar sab sahi hai toh user data nikal lo (password ke bina)
    const { password: _, ...userWithoutPassword } = user;

    // 🚀 FIXED: Pehle response ko variable mein hold kiya
    const response = NextResponse.json(
      { 
        message: 'Login successful! Welcome back.', 
        user: userWithoutPassword 
      },
      { status: 200 }
    );

    // 🔒 SECURE COOKIE LAYER: Ab response par secure cookie attach karo
    response.cookies.set({
      name: 'twinkles_session',
      value: JSON.stringify(userWithoutPassword),
      httpOnly: true, // Anti-XSS Protection (JS reads blocks)
      secure: process.env.NODE_ENV === 'production', // Production par automatically true ho jayega (HTTPS), localhost par false (jo ke perfect hai)
      sameSite: 'lax', // CSRF safety layer
      maxAge: 60 * 60 * 24 * 7, // Cookie ki life: 1 Hafta (7 days)
      path: '/', // Pure website context ke liye accessible root path
    });

    // Cooked response return karo browser ko
    return response;

  } catch (error) {
    console.error('LOGIN_ERROR:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}