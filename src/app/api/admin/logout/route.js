import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ success: true, message: "Logged out successfully" });
    
    // Cookie ko delete karne ke liye uski maxAge 0 set kar dete hain
    response.cookies.set('admin_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Instant expire
      path: '/',
    });

    return response;
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}