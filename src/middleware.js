import { NextResponse } from 'next/server';

export async function middleware(request) {
  // 1. Browser ki cookies se session token uthao
  const token = request.cookies.get('twinkles_session')?.value;
  const { pathname } = request.nextUrl;

  // 2. Define karo protected aur auth routes
  // Protected Routes: Jahan bina login ke nahi ja sakte (e.g., Profile edit, checkout, dashboard)
  const isProtectedRoute = pathname.startsWith('/profile') || pathname.startsWith('/checkout');
  
  // Auth Routes: Jahan login hote hue dobara nahi jana chahiye (e.g., Login, Signup)
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup');

  // Case A: User login nahi hai aur protected page access kar raha hai
  if (isProtectedRoute && !token) {
    // User ko login par bhejo aur sath me url save rakho taakay login ke baad wapas wahin aaye
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Case B: User pehle se logged in hai lekin dubara login/signup khol raha hai
  if (isAuthRoute && token) {
    // Use sidha home page ya profile par redirect kar do
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Agar sab kuch theek hai, toh request ko aage jaane do
  return NextResponse.next();
}

// 🎯 CONFIG: Yeh step sab se zaroori hai! 
// Server ko batana ke middleware kis kis route par trigger hona chahiye
export const config = {
  matcher: [
    '/profile/:path*', 
    '/checkout/:path*', 
    '/login', 
    '/signup'
  ],
};