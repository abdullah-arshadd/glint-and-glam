import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// 🔒 PRIVATE HELPER: Secure Cookie se Session ID nikalna ya naya generate karna
async function getOrCreateCartSession() {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get('twinks_cart_session')?.value;
  let isNew = false;

  if (!sessionId) {
    sessionId = crypto.randomUUID(); // Automatic unique long string generate hogi
    isNew = true;
  }

  return { sessionId, isNew };
}

// ⏳ UTILITY: Cookies ko response me inject karne ka generator helper
function setSessionCookie(response, sessionId) {
  response.cookies.set({
    name: 'twinks_cart_session',
    value: sessionId,
    httpOnly: true, // Anti-XSS Protection (JavaScript access block)
    secure: process.env.NODE_ENV === 'production', // Local par http, live build par HTTPS compulsory
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 Days expiration cycle
    path: '/' // Global scope app context access
  });
}

// 1. GET: Session ID ke mutabiq database se cart items lana
export async function GET(req) {
  try {
    const { sessionId, isNew } = await getOrCreateCartSession();

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

    const response = NextResponse.json(cartItems);
    
    // Agar user first time aaya hai, to uski token cookie set kardo
    if (isNew) setSessionCookie(response, sessionId);
    
    return response;
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}

// 2. POST: Item add karna ya quantity update karna
export async function POST(req) {
  try {
    const { sessionId, isNew } = await getOrCreateCartSession();
    const { variantId, quantity, isUpdate } = await req.json();

    if (!variantId) {
      return NextResponse.json({ error: "Missing variantId" }, { status: 400 });
    }

    // Check karo agar item pehle se cart mein hai
    const existingItem = await prisma.cartItem.findFirst({
      where: { sessionId, variantId },
      include: { variant: true }
    });

    let resultItem;

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

      // Stock Limit Check
      if (newQuantity > existingItem.variant.stock) {
        return NextResponse.json({ error: "Out of stock limit" }, { status: 400 });
      }

      resultItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity }
      });
    } else {
      // Agar item bilkul naya hai cart mein, toh naya entry create karo
      resultItem = await prisma.cartItem.create({
        data: {
          sessionId,
          variantId,
          quantity: quantity || 1
        }
      });
    }

    const response = NextResponse.json(resultItem);
    
    if (isNew) setSessionCookie(response, sessionId);
    
    return response;
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json({ error: "Failed to handle cart operation" }, { status: 500 });
  }
}

// 3. DELETE: Pori cart saaf karna ya specific item delete karna
export async function DELETE(req) {
  try {
    const { sessionId, isNew } = await getOrCreateCartSession();
    
    // Request check karne ke liye safe dynamic json parsing block
    const body = await req.json().catch(() => ({}));
    const { cartItemId } = body;

    let response;

    if (cartItemId) {
      // Case A: Row cross/trash button click se single item delete karna
      await prisma.cartItem.delete({
        where: { id: cartItemId }
      });
      response = NextResponse.json({ message: "Item removed" });
    } else {
      // Case B: No parameters in body matlab pure checkout cart clear trigger (Clear Cart)
      await prisma.cartItem.deleteMany({
        where: { sessionId }
      });
      response = NextResponse.json({ message: "Cart cleared" });
    }

    if (isNew) setSessionCookie(response, sessionId);
    
    return response;
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}