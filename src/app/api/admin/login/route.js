import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // Yeh aapki .env.local file se credentials uthayega
    const correctUsername = process.env.ADMIN_USERNAME;
    const correctPassword = process.env.ADMIN_PASSWORD;

    // Safety Check: Agar variables missing hain toh crash na ho
    if (!correctUsername || !correctPassword) {
      console.error("CRITICAL: .env.local file mein ADMIN_USERNAME ya ADMIN_PASSWORD missing hai!");
      return NextResponse.json({ success: false, message: "Server configuration missing" }, { status: 500 });
    }

    // Credentials matching validation
    if (username === correctUsername && password === correctPassword) {
      const response = NextResponse.json({ success: true, message: "Authenticated successfully" });
      
      // Secure HTTP-Only Cookie generate ho rahi hai session tracking ke liye
      response.cookies.set('admin_session', 'authenticated_true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 2, // 2 Ghante ka token session
        path: '/',
      });

      return response;
    }

    return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
  } catch (error) {
    console.error("Backend login route crash error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}