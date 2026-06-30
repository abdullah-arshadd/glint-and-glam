import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    // Session fetching setup
    let email = null;
    try {
      const sessionRes = await fetch(`${req.nextUrl.origin}/api/auth/session`, {
        headers: { cookie: req.headers.get('cookie') || '' }
      });
      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        email = sessionData?.user?.email;
      }
    } catch (e) {
      console.error("User order session catch error:", e);
    }

    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 🔥 FIX: Deeply include variant -> product -> images parameters here!
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Fetch user orders operational crash:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}