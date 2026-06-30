import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// 📊 1. GET: Admin panel ke liye saare orders fetch karne ka method
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error("Fetch orders API error:", error);
    return NextResponse.json({ error: "Orders fetch fail ho gaye" }, { status: 500 });
  }
}

// 🛒 2. POST: Checkout se order generate karne ka method
export async function POST(req) {
  try {
    const body = await req.json();
    const { fullName, phone, city, address, notes, items, total, paymentMethod } = body;

    // 🛑 Guardrail 1: Validation Check
    if (!fullName || !phone || !address || !items || items.length === 0 || !paymentMethod) {
      return NextResponse.json({ error: "Required fields or payment choice missing" }, { status: 400 });
    }

    // 🛑 Guardrail 2: STRICT AUTHENTICATION CHECK
    let loggedInUserId = null;
    try {
      const sessionRes = await fetch(`${req.nextUrl.origin}/api/auth/session`, {
        method: "GET",
        headers: { cookie: req.headers.get('cookie') || '' }
      });
      
      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        if (sessionData?.user?.email) {
          const dbUser = await prisma.user.findUnique({
            where: { email: sessionData.user.email }
          });
          if (dbUser) {
            loggedInUserId = dbUser.id;
          }
        }
      }
    } catch (sessionErr) {
      console.error("Session fetch error:", sessionErr);
    }

    if (!loggedInUserId) {
      return NextResponse.json({ error: "Please log in first to place an order." }, { status: 401 });
    }

    // 🛑 Guardrail 3: Stock Check Before Proceeding
    for (const item of items) {
      const vId = item.variantId || item.variant?.id || item.id;
      const variant = await prisma.productVariant.findUnique({
        where: { id: String(vId) },
        include: { product: true }
      });

      if (!variant) {
        return NextResponse.json({ error: `Item not found in database.` }, { status: 404 });
      }

      if (variant.stock < item.quantity) {
        return NextResponse.json({ 
          error: `Sorry, ${variant.product?.name || 'Item'} is out of stock! Only ${variant.stock} left.` 
        }, { status: 400 });
      }
    }

    // --- 🛒 CASE A: CASH ON DELIVERY (COD) ---
    if (paymentMethod === 'COD') {
      const newOrder = await prisma.$transaction(async (tx) => {
        const order = await tx.order.create({
          data: {
            fullName, phone, city, address, notes: notes || "",
            totalAmount: Number(total), status: 'PENDING', userId: loggedInUserId,
            paymentMethod: 'COD', paymentStatus: 'PENDING', gatewayRefId: null,
            items: {
              create: items.map((item) => ({
                variantId: String(item.variantId || item.variant?.id || item.id),
                quantity: Number(item.quantity),
                price: Number(item.variant?.price || item.price || 0),
              })),
            },
          },
        });

        for (const item of items) {
          const vId = item.variantId || item.variant?.id || item.id;
          await tx.productVariant.update({
            where: { id: String(vId) },
            data: { stock: { decrement: Number(item.quantity) } }
          });
        }
        return order;
      });

      return NextResponse.json({ success: true, orderId: newOrder.id, isRedirect: false });
    }

    // --- 💳 FUTURE PAYMENT GATEWAY HOOK PLACEHOLDER ---
    // Jab naya payment gateway integrate karna ho, toh uska case yahan switch chain karein.
    if (paymentMethod === 'CARD' || paymentMethod === 'WALLET') {
      return NextResponse.json({ 
        error: "Online payment gateway is temporarily under maintenance. Please select Cash on Delivery." 
      }, { status: 400 });
    }

    return NextResponse.json({ error: "Invalid payment method structure." }, { status: 400 });

  } catch (error) {
    console.error("Order processing error:", error);
    return NextResponse.json({ error: "Failed to process request layout" }, { status: 500 });
  }
}