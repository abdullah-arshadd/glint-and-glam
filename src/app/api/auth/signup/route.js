import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password, phone } = body;

    // Strict validation for required fields
    if (!name || !email || !password || !phone) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Strict Uniqueness Check (Database level verification se pehle code level block)
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { phone: phone.trim() }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return NextResponse.json({ message: 'Email already exists! Please login.' }, { status: 400 });
      }
      return NextResponse.json({ message: 'Phone number is already registered!' }, { status: 400 });
    }

    // Hash Password & Save User permanent
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        phone: phone.trim(),
        role: 'USER'
      }
    });

    const { password: _, ...userWithoutPassword } = newUser;

    // Automatically log them in by setting cookie directly on signup success
    const response = NextResponse.json(
      { message: 'Account created successfully!', user: userWithoutPassword },
      { status: 201 }
    );

    // Dynamic import for JWT to prevent edge issues if any
    const jwt = require('jsonwebtoken');
    const sessionToken = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
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
    console.error('SIGNUP_ROUTE_ERROR:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}