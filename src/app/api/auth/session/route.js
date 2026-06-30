import { NextResponse } from 'next/server';

export async function GET(request) {
  // Browser se cookie uthao
  const sessionCookie = request.cookies.get('twinkles_session')?.value;

  // Agar cookie nahi hai, toh user null return karo
  if (!sessionCookie) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  try {
    // Cookie ko parse karo aur user data wapas bhej do
    const userData = JSON.parse(sessionCookie);
    return NextResponse.json({ user: userData }, { status: 200 });
  } catch (error) {
    // Agar parsing mein masla aaye toh logout samjho
    return NextResponse.json({ user: null }, { status: 200 });
  }
}