import { NextResponse } from 'next/server';

export async function GET(request) {
  const session = request.cookies.get('admin_session')?.value;

  if (session === 'authenticated_true') {
    return NextResponse.json({ authenticated: true });
  }

  return NextResponse.json({ authenticated: false }, { status: 401 });
}