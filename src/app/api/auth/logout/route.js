import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ message: 'Logged out' }, { status: 200 });
  
  // Cookie ki maxAge 0 karke usay browser se delete kar do
  response.cookies.set('twinkles_session', '', {
    httpOnly: true,
    maxAge: 0,
    path: '/'
  });
  
  return response;
}