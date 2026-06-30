import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// 1. GET: Session ID ke mutabiq database se cart items lana
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('sessionId');
  
  if (!sessionId) {
    return NextResponse.json([], { status: 400 });
  }

  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { sessionId },
      include: {
        variant: {
          include: {
            product: {
              include: {
                images: true // Taake image url frontend par crash na kare
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'asc' // Taake cart items ki tarteeb kharab na ho refresh par
      }
    });
    return NextResponse.json(cartItems);
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}

// 2. POST: Item add karna ya quantity update karna
export async function POST(req) {
  try {
    const { sessionId, variantId, quantity, isUpdate } = await req.json();

    if (!sessionId || !variantId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Check karo agar item pehle se cart mein hai
    const existingItem = await prisma.cartItem.findFirst({
      where: { sessionId, variantId },
      include: { variant: true }
    });

    if (existingItem) {
      let newQuantity;
      
      if (isUpdate) {
        // Agar Plus/Minus button se request aayi hai toh quantity direct change karo (+1 ya -1)
        newQuantity = existingItem.quantity + quantity;
      } else {
        // Agar Product Detail page se "Add to Bag" dobara dabaya hai toh +1 plus karo
        newQuantity = existingItem.quantity + 1;
      }

      // Safe check: 1 se kam na ho quantity
      if (newQuantity < 1) {
        return NextResponse.json({ error: "Quantity cannot be less than 1" }, { status: 400 });
      }

      // Stock Limit Check karein backend level par bhi safety ke liye
      if (newQuantity > existingItem.variant.stock) {
        return NextResponse.json({ error: "Out of stock limit" }, { status: 400 });
      }

      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity }
      });

      return NextResponse.json(updatedItem);
    }

    // Agar item bilkul naya hai cart mein, toh naya entry create karo
    const newItem = await prisma.cartItem.create({
      data: {
        sessionId,
        variantId,
        quantity: quantity || 1
      }
    });

    return NextResponse.json(newItem);
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json({ error: "Failed to handle cart operation" }, { status: 500 });
  }
}

// 3. DELETE: Pori cart saaf karna ya specific item delete karna
export async function DELETE(req) {
  try {
    // URL se sessionId check karo (Pori cart khali karne ke liye)
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (sessionId) {
      await prisma.cartItem.deleteMany({
        where: { sessionId }
      });
      return NextResponse.json({ message: "Cart cleared" });
    }

    // Body se cartItemId check karo (Single row cross/trash button se delete karne ke liye)
    const body = await req.json().catch(() => ({}));
    const { cartItemId } = body;

    if (cartItemId) {
      await prisma.cartItem.delete({
        where: { id: cartItemId }
      });
      return NextResponse.json({ message: "Item removed" });
    }

    return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}