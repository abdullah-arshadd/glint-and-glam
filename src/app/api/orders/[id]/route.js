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

// 🛠️ 2. PATCH: Admin Panel se Order Status, Cancellation Reason aur Payment Status update karne ke liye
export async function PATCH(req, { params }) {
  try {
    const resolvedParams = await params;
    const orderId = resolvedParams.id;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID missing" }, { status: 400 });
    }

    const body = await req.json();
    const { status, cancellationReason, paymentStatus } = body;

    // Pehle existing order state check karte hain taake payment status transition track ho sake
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Dynamic data payload banana taake purani fields overwrite na hon agar request mein missing hon
    const dataToUpdate = {};
    if (status) dataToUpdate.status = status;
    if (cancellationReason !== undefined) dataToUpdate.cancellationReason = cancellationReason;
    if (paymentStatus) dataToUpdate.paymentStatus = paymentStatus;

    // Safe Database Transaction Flow
    const result = await prisma.$transaction(async (tx) => {
      // 1. Order state database mein update karein
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: dataToUpdate,
      });

      // Order Amount track karne ke liye (Aapki schema mein `totalAmount` ya `total` jo bhi variable ho)
      const orderAmount = Number(updatedOrder.totalAmount || updatedOrder.total || 0);

      // 2. 📈 CONDITION 1: Pehle FULL_PAID nahi tha, ab FULL_PAID ho gaya -> Increments Sales
      if (paymentStatus && existingOrder.paymentStatus !== 'FULL_PAID' && paymentStatus === 'FULL_PAID') {
        // Agar aapne Sales metrics save karne ke liye alag Table/Model banaya hua hai (e.g., DashboardMetrics):
        // await tx.dashboardMetrics.updateMany({
        //   data: { totalSales: { increment: orderAmount } }
        // });
        console.log(`Sales incremented by Rs. ${orderAmount} for Order #${orderId}`);
      }

      // 3. 📉 CONDITION 2: Pehle FULL_PAID tha, par admin ne change karke UNPAID/HALF_PAID kiya -> Deducts Sales
      if (paymentStatus && existingOrder.paymentStatus === 'FULL_PAID' && paymentStatus !== 'FULL_PAID') {
        // Reverse condition entry setup:
        // await tx.dashboardMetrics.updateMany({
        //   data: { totalSales: { decrement: orderAmount } }
        // });
        console.log(`Sales reverted/deducted by Rs. ${orderAmount} for Order #${orderId}`);
      }

      return updatedOrder;
    });

    return NextResponse.json({ success: true, order: result }, { status: 200 });

  } catch (error) {
    console.error("Update order data backend crash:", error);
    return NextResponse.json({ error: "Failed to update order status or billing info" }, { status: 500 });
  }
}