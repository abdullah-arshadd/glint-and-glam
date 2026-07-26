import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { Resend } from 'resend';

// Resend initialization using your API key from .env
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password, phone } = body;

    // Strict validation for required fields
    if (!name || !email || !password || !phone) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // 🌟 Generate a 6-digit OTP and set expiry (15 minutes)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000);
    const hashedPassword = await bcrypt.hash(password, 12);

    // Strict Uniqueness Check
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { phone: phone.trim() }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.isVerified) {
        // If user is already verified, block registration
        if (existingUser.email === email.toLowerCase()) {
          return NextResponse.json({ message: 'Email already exists! Please login.' }, { status: 400 });
        }
        return NextResponse.json({ message: 'Phone number is already registered!' }, { status: 400 });
      } else {
        // 🌟 If user exists but is NOT verified yet, update their data and send a new OTP
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            name,
            password: hashedPassword,
            phone: phone.trim(),
            verificationToken: otp,
            tokenExpiry: tokenExpiry
          }
        });
      }
    } else {
      // 🌟 Completely new user creation (isVerified defaults to false)
      await prisma.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          password: hashedPassword,
          phone: phone.trim(),
          role: 'USER',
          isVerified: false,
          verificationToken: otp,
          tokenExpiry: tokenExpiry
        }
      });
    }

    // 🌟 Send OTP Email via Resend using Live Verified Domain
    const { error: resendError } = await resend.emails.send({
      from: 'Glint & Glam <verify@glintandglam.pk>', 
      to: email.toLowerCase(),
      subject: 'Verify your account - Glint & Glam',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 30px; color: #3a2e28; max-width: 500px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; background-color: #ffffff;">
          <h2 style="font-weight: 300; font-family: Georgia, serif; text-align: center; color: #3a2e28; margin-bottom: 20px;">Welcome to Glint & Glam</h2>
          <p style="font-size: 14px; text-align: center; color: #3a2e28;">Hi ${name},</p>
          <p style="font-size: 14px; text-align: center; color: #666666; line-height: 1.5;">Please use the following 6-digit code to verify your email address and activate your account. This code expires in 15 minutes.</p>
          
          <div style="background-color: #f5f3ed; padding: 20px; text-align: center; margin: 30px 0; border-radius: 6px; border: 1px solid rgba(58, 46, 40, 0.1);">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #3a2e28;">${otp}</span>
          </div>
          
          <p style="font-size: 12px; text-align: center; color: #999999;">If you didn't request this registration, you can safely ignore this email.</p>
        </div>
      `
    });

    if (resendError) {
      console.error("Resend Sending Error:", resendError);
      return NextResponse.json({ message: 'Failed to send verification email', error: resendError }, { status: 500 });
    }

    return NextResponse.json(
      { message: 'Verification code sent successfully!' },
      { status: 201 }
    );

  } catch (error) {
    console.error('SIGNUP_ROUTE_ERROR:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}