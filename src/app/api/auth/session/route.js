import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('twinkles_session')?.value;

    // 1. Agar cookie token nahi mila, toh empty user return karo
    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    try {
      // 2. Token ko verify karo crypto key se
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Database se fresh record nikal lo (safest practice)
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

      if (!user) {
        return NextResponse.json({ user: null }, { status: 200 });
      }

      // 4. Dropdown ko encrypted data ka verified structures bhej do
      return NextResponse.json({ user }, { status: 200 });

    } catch (jwtError) {
      // Agar token invalid/expired ho chuka ho
      console.error('JWT_VERIFICATION_FAILED:', jwtError.message);
      return NextResponse.json({ user: null }, { status: 200 });
    }

  } catch (error) {
    console.error('SESSION_ROUTE_ERROR:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}