import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// 🔑 Netlify runtime settings fix: Is line ko top par zaroor declare karein
export const runtime = 'nodejs';

// 🔍 1. GET: Single order details fetch karne ke liye (Order Success Page data flow)
export async function GET(req, { params }) {
  try {
    const resolvedParams = await params; 
    const orderId = resolvedParams.id; 

    if (!orderId) {
      return NextResponse.json({ error: "Order ID missing" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
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
      }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order, { status: 200 });

  } catch (error) {
    console.error("Fetch single order backend crash:", error);
    return NextResponse.json({ error: "Failed to fetch order status info" }, { status: 500 });
  }
}

// 🛠️ 2. PATCH: Admin Panel se Order Status update karne ke liye
export async function PATCH(req, { params }) {
  try {
    const resolvedParams = await params;
    const orderId = resolvedParams.id;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID missing" }, { status: 400 });
    }

    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: "Status field is required" }, { status: 400 });
    }

    // Prisma entry modification
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: status },
    });

    return NextResponse.json({ success: true, order: updatedOrder }, { status: 200 });

  } catch (error) {
    console.error("Update order status backend crash:", error);
    return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
  }
}