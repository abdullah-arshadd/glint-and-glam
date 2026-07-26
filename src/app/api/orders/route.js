import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Resend initialization using process.env.RESEND_API_KEY
const resend = new Resend(process.env.RESEND_API_KEY);

// 🌟 HELPER FUNCTION: Send Emails to both Admin & Customer
async function sendOrderConfirmationEmails({ order, items, customerEmail, fullName, phone, city, address, total, paymentMethod, paymentProof }) {
  try {
    // Notification Subject ke liye short 6-character code
    const shortOrderId = order.id.slice(-6).toUpperCase();

    // Generate Order Items HTML Table
    const itemsListHtml = items.map(item => {
      const itemName = item.name || item.product?.name || item.variant?.product?.name || 'Fine Jewelry Piece';
      const itemPrice = Number(item.variant?.price || item.price || 0);
      const itemQty = Number(item.quantity || 1);

      return `
        <tr style="border-bottom: 1px solid #eeeeee;">
          <td style="padding: 10px 0; font-size: 13px; color: #3a2e28;">
            <strong>${itemName}</strong><br/>
            <span style="font-size: 11px; color: #888888;">Qty: ${itemQty}</span>
          </td>
          <td style="padding: 10px 0; font-size: 13px; color: #3a2e28; text-align: right;">
            Rs. ${(itemPrice * itemQty).toLocaleString()}
          </td>
        </tr>
      `;
    }).join('');

    // 📩 1. ADMIN NOTIFICATION EMAIL (to glintandglam.pk@gmail.com)
    const adminEmailPromise = resend.emails.send({
      from: 'Glint & Glam Store <orders@glintandglam.pk>',
      to: ['glintandglam.pk@gmail.com'],
      subject: `🚨 NEW ORDER RECEIVED! #${shortOrderId} - Rs. ${Number(total).toLocaleString()}`, // Short ID for notification preview
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #222222; background-color: #ffffff;">
          <h2 style="color: #3a2e28; border-bottom: 2px solid #bd977a; padding-bottom: 8px;">🎉 New Order Received</h2>
          <p><strong>Order ID:</strong> #${order.id}</p> <!-- Full Order ID inside email body -->
          <p><strong>Customer Name:</strong> ${fullName}</p>
          <p><strong>Email:</strong> ${customerEmail || 'Not provided (Guest)'}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>City:</strong> ${city}</p>
          <p><strong>Address:</strong> ${address}</p>
          <p><strong>Payment Method:</strong> ${paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'Advance Bank Transfer'}</p>
          ${paymentProof ? `<p><strong>Payment Proof:</strong> <a href="${paymentProof}" target="_blank" style="color: #bd977a; font-weight: bold;">View Screenshot</a></p>` : ''}
          
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;" />
          
          <h3>Items Ordered:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            ${itemsListHtml}
          </table>
          
          <h3 style="color: #3a2e28; margin-top: 20px;">Total Amount: Rs. ${Number(total).toLocaleString()}</h3>
        </div>
      `
    });

    // 📩 2. CUSTOMER CONFIRMATION EMAIL (If Email exists)
    let customerEmailPromise = Promise.resolve();
    if (customerEmail) {
      customerEmailPromise = resend.emails.send({
        from: 'Glint & Glam <orders@glintandglam.pk>',
        to: [customerEmail],
        subject: `Order Confirmed - #${shortOrderId} | Glint & Glam`, // Short ID in Subject Line
        html: `
          <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f7f2e6; padding: 30px 10px; color: #3a2e28;">
            <div style="max-width: 550px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; border: 1px solid rgba(58,46,40,0.1);">
              
              <h1 style="font-family: Georgia, serif; text-align: center; font-size: 24px; font-weight: normal; margin-bottom: 5px; color: #3a2e28;">Glint & Glam</h1>
              <p style="text-align: center; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #bd977a; margin-top: 0;">Order Confirmation</p>
              
              <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;" />
              
              <p style="font-size: 14px;">Hi <strong>${fullName}</strong>,</p>
              <p style="font-size: 13px; color: #555555; line-height: 1.5;">Thank you for your order! We are preparing your exquisite jewelry pieces with care. Here is your order summary:</p>
              
              <div style="background-color: #fcfbfa; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #f0e8d6;">
                <p style="margin: 0; font-size: 12px; color: #888888;">Order ID: <strong style="color: #3a2e28;">#${order.id}</strong></p> <!-- Full Order ID inside email body -->
                <p style="margin: 5px 0 0 0; font-size: 12px; color: #888888;">Payment Method: <strong style="color: #3a2e28;">${paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'Advance Bank Transfer'}</strong></p>
              </div>

              <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin-top: 25px; color: #3a2e28;">Order Items</h3>
              <table style="width: 100%; border-collapse: collapse;">
                ${itemsListHtml}
              </table>

              <div style="margin-top: 15px; text-align: right;">
                <p style="font-size: 15px; font-weight: bold; color: #3a2e28;">
                  Total: Rs. ${Number(total).toLocaleString()}
                </p>
              </div>

              <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin-top: 25px; color: #3a2e28;">Shipping Details</h3>
              <p style="font-size: 13px; color: #555555; line-height: 1.5; margin: 0;">
                ${address}, ${city}<br/>
                Phone: ${phone}
              </p>

              <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0 20px 0;" />
              
              <p style="font-size: 11px; text-align: center; color: #999999; margin: 0;">
                If you have any questions, feel free to reply directly to this email or contact us at <a href="mailto:glintandglam.pk@gmail.com" style="color: #bd977a; text-decoration: none;">glintandglam.pk@gmail.com</a>.
              </p>
            </div>
          </div>
        `
      });
    }

    await Promise.all([adminEmailPromise, customerEmailPromise]);
    console.log("Order emails sent successfully.");
  } catch (err) {
    console.error("Resend Order Email Trigger Error:", err);
  }
}

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
    const { fullName, email, phone, city, address, notes, items, total, paymentMethod, paymentProof } = body;

    // 🛑 Guardrail 1: Validation Check
    if (!fullName || !phone || !address || !items || items.length === 0 || !paymentMethod) {
      return NextResponse.json({ error: "Required fields or payment choice missing" }, { status: 400 });
    }

    // 🛑 Guardrail 2: OPTIONAL AUTHENTICATION (Guest Checkout Enabled)
    let loggedInUserId = null;
    let customerEmail = email || null;

    try {
      const sessionRes = await fetch(`${req.nextUrl.origin}/api/auth/session`, {
        method: "GET",
        headers: { cookie: req.headers.get('cookie') || '' }
      });
      
      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        if (sessionData?.user?.email) {
          if (!customerEmail) customerEmail = sessionData.user.email;
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
            paymentProof: paymentProof || null,
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

      // 🌟 Send Emails to Admin & Customer asynchronously
      sendOrderConfirmationEmails({
        order: newOrder, items, customerEmail, fullName, phone, city, address, total, paymentMethod: 'COD', paymentProof
      });

      return NextResponse.json({ success: true, orderId: newOrder.id, isRedirect: false });
    }

    // --- 🏦 CASE B: ADVANCE BANK TRANSFER (BANK) ---
    if (paymentMethod === 'BANK') {
      const newOrder = await prisma.$transaction(async (tx) => {
        const order = await tx.order.create({
          data: {
            fullName, phone, city, address, notes: notes || "",
            totalAmount: Number(total), status: 'PENDING', userId: loggedInUserId,
            paymentMethod: 'BANK', paymentStatus: 'PENDING', gatewayRefId: null,
            paymentProof: paymentProof || null,
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

      // 🌟 Send Emails to Admin & Customer asynchronously
      sendOrderConfirmationEmails({
        order: newOrder, items, customerEmail, fullName, phone, city, address, total, paymentMethod: 'BANK', paymentProof
      });

      return NextResponse.json({ success: true, orderId: newOrder.id, isRedirect: false });
    }

    return NextResponse.json({ error: "Invalid payment method structure." }, { status: 400 });

  } catch (error) {
    console.error("Order processing error:", error);
    return NextResponse.json({ error: "Failed to process request layout" }, { status: 500 });
  }
}