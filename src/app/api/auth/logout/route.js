import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();

    // 🔒 Cookie ko delete karne ke liye uski value empty aur maxAge ko 0 set karenge
    cookieStore.set({
      name: 'twinkles_session',
      value: '', // Clear the token value
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // 0 seconds means it expires immediately
      path: '/', // Path ka root hona lazmi hai taake poori site se delete ho
    });

    return NextResponse.json(
      { message: 'Logged out successfully! See you again.' }, 
      { status: 200 }
    );
  } catch (error) {
    console.error('LOGOUT_ERROR:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message }, 
      { status: 500 }
    );
  }
}