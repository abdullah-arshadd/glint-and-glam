import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password, phone, otp } = body;

    // Phase 1: Agar user sirf OTP request kar raha hai (Signup Form Submit kiya)
    if (!otp) {
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

      // Generate 6-Digit OTP
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 Mins Valid

      // Save to temporary OTP table
      await prisma.phoneVerification.upsert({
        where: { phone: phone.trim() },
        update: { otp: generatedOtp, expiresAt },
        create: { phone: phone.trim(), otp: generatedOtp, expiresAt },
      });

      // SMS Console Log Debugger
      console.log(`============= SIGNUP OTP FOR ${phone} IS: ${generatedOtp} =============`);

      return NextResponse.json({ message: 'OTP sent! Please verify your phone number to complete signup.', otpSent: true }, { status: 200 });
    }

    // Phase 2: User ne OTP daal diya hai, ab verify karke account create karo
    const record = await prisma.phoneVerification.findUnique({
      where: { phone: phone.trim() }
    });

    if (!record || record.otp !== otp) {
      return NextResponse.json({ message: 'Invalid OTP code.' }, { status: 400 });
    }

    if (new Date() > record.expiresAt) {
      return NextResponse.json({ message: 'OTP has expired. Request a new one.' }, { status: 400 });
    }

    // Double safe check before final insert
    const finalCheck = await prisma.user.findFirst({
      where: { OR: [{ email: email.toLowerCase() }, { phone: phone.trim() }] }
    });
    if (finalCheck) {
      return NextResponse.json({ message: 'Email or Phone already taken during verification.' }, { status: 400 });
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

    // Cleanup OTP record
    await prisma.phoneVerification.delete({ where: { phone: phone.trim() } });

    const { password: _, ...userWithoutPassword } = newUser;

    // Automatically log them in by setting cookie directly on signup success
    const response = NextResponse.json(
      { message: 'Account created and verified successfully!', user: userWithoutPassword },
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
    console.error('SIGNUP_OTP_ROUTE_ERROR:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}