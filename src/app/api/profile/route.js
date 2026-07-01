import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Helper: Token verify karne ke liye
async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('twinkles_session')?.value;

  if (!token) return null;

  try {
    // Agar kisi ne cookie badli hogi, toh yeh line error throw kar degi
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded; // Returns { id, email, role }
  } catch (err) {
    return null;
  }
}

// 🟢 GET: Fetch Profile (With Phone Support)
export async function GET() {
  try {
    const sessionUser = await getAuthUser();
    if (!sessionUser) {
      return NextResponse.json({ message: 'Unauthorized / Session Expired' }, { status: 401 });
    }

    // 🚀 FIXED: phone: true add kiya taakay database se saved number bhi load ho sake
    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { 
        name: true, 
        email: true,
        phone: true 
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error('PROFILE_GET_ERROR:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// 🔵 PUT: Update Profile
export async function PUT(request) {
  try {
    const sessionUser = await getAuthUser();
    if (!sessionUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, password } = body;

    if (!name) {
      return NextResponse.json({ message: 'Name is required' }, { status: 400 });
    }

    const updateData = { name };

    if (password && password.trim() !== '') {
      if (password.length < 6) {
        return NextResponse.json({ message: 'Password must be at least 6 characters' }, { status: 400 });
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    // DB Update
    const updatedUser = await prisma.user.update({
      where: { id: sessionUser.id },
      data: updateData,
    });

    const { password: _, ...userWithoutPassword } = updatedUser;

    // 🚀 NEW TOKEN: Kyunke name update hua hai, naya token sign karna parega
    const newToken = jwt.sign(
      { id: updatedUser.id, email: updatedUser.email, role: updatedUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json(
      { message: 'Profile updated successfully!', user: userWithoutPassword },
      { status: 200 }
    );

    // Refresh Cookie
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
    console.error('PROFILE_PUT_ERROR:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}