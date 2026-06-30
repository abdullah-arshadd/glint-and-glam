import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Humari banayi hui prisma.js file
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    // 1. Frontend se aane wale data ko parse karo
    const body = await request.json();
    const { name, email, password } = body;

    // 2. Validation check karo ke sab kuch aaya hai ya nahi
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Missing required fields (name, email, password)' },
        { status: 400 }
      );
    }

    // 3. Check karo ke user pehle se register toh nahi hai
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already exists! Please login instead.' },
        { status: 400 }
      );
    }

    // 4. Password ko Hash (secure) karo
    const hashedPassword = await bcrypt.hash(password, 12);

    // 5. Naya user database (Supabase) mein save karo
    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'USER', // Default role set kar diya
      },
    });

    // Security ke liye response mein password wapas nahi bhejenge
    const { password: _, ...userWithoutPassword } = newUser;

    // 🚀 AUTOMATIC LOGIN LAYER: Response hold karo taakay secure cookie set ho sake
    const response = NextResponse.json(
      { message: 'User registered successfully! Welcome to Twinkles of Joy.', user: userWithoutPassword },
      { status: 201 }
    );

    // 🔒 SECURE COOKIE SET: Naye user ka session instantly create karo
    response.cookies.set({
      name: 'twinkles_session',
      value: JSON.stringify(userWithoutPassword),
      httpOnly: true, // Anti-XSS (JavaScript cannot access)
      secure: process.env.NODE_ENV === 'production', // HTTPS in production, standard http on local
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 Week expiry
      path: '/', // Global app scope access
    });

    return response;

  } catch (error) {
    console.error('SIGNUP_ERROR:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}