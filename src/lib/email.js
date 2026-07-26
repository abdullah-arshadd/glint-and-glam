import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderEmails({ order, customerEmail, customerName, orderItems, totalAmount, shippingAddress }) {
  try {
    // 1. Items ki HTML Table Generate Karein
    const itemsTableHtml = orderItems.map(item => `
      <tr style="border-bottom: 1px solid #eeeeee;">
        <td style="padding: 10px 0; font-size: 13px; color: #3a2e28;">
          <strong>${item.productName || item.name}</strong><br/>
          <span style="font-size: 11px; color: #888888;">Qty: ${item.quantity}</span>
        </td>
        <td style="padding: 10px 0; font-size: 13px; color: #3a2e28; text-align: right;">
          Rs. ${Number(item.price * item.quantity).toLocaleString()}
        </td>
      </tr>
    `).join('');

    // 📩 EMAIL 1: Customer Order Confirmation Template
    const customerEmailPromise = resend.emails.send({
      from: 'Glint & Glam <orders@glintandglam.pk>',
      to: [customerEmail],
      subject: `Order Confirmed - #${order.id.slice(-6).toUpperCase()} | Glint & Glam`,
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f7f2e6; padding: 30px 10px; color: #3a2e28;">
          <div style="max-w: 550px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; border: 1px solid rgba(58,46,40,0.1);">
            
            <h1 style="font-family: Georgia, serif; text-align: center; font-size: 24px; font-weight: normal; margin-bottom: 5px;">Glint & Glam</h1>
            <p style="text-align: center; font-size: 12px; uppercase; tracking-widest: 2px; color: #bd977a; margin-top: 0;">Order Confirmation</p>
            
            <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;" />
            
            <p style="font-size: 14px;">Hi <strong>${customerName}</strong>,</p>
            <p style="font-size: 13px; color: #555555; line-height: 1.5;">Thank you for your order! We are preparing your exquisite jewelry pieces with care. Here is your order summary:</p>
            
            <div style="background-color: #fcfbfa; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0; font-size: 12px; color: #888888;">Order ID: <strong style="color: #3a2e28;">#${order.id.slice(-6).toUpperCase()}</strong></p>
              <p style="margin: 5px 0 0 0; font-size: 12px; color: #888888;">Payment Method: <strong style="color: #3a2e28;">Cash on Delivery (COD)</strong></p>
            </div>

            <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-top: 25px;">Order Summary</h3>
            <table style="width: 100%; border-collapse: collapse;">
              ${itemsTableHtml}
            </table>

            <div style="margin-top: 15px; text-align: right;">
              <p style="font-size: 15px; font-weight: bold; color: #3a2e28;">
                Total: Rs. ${Number(totalAmount).toLocaleString()}
              </p>
            </div>

            <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-top: 25px;">Shipping Details</h3>
            <p style="font-size: 13px; color: #555555; line-height: 1.5; margin: 0;">
              ${shippingAddress.street || shippingAddress.address}<br/>
              ${shippingAddress.city}, ${shippingAddress.phone}
            </p>

            <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0 20px 0;" />
            
            <p style="font-size: 11px; text-align: center; color: #999999; margin: 0;">
              If you have any questions, feel free to reply directly to this email or contact us at <a href="mailto:glintandglam.pk@gmail.com" style="color: #bd977a;">glintandglam.pk@gmail.com</a>.
            </p>
          </div>
        </div>
      `
    });

    // 📩 EMAIL 2: Admin New Order Alert Template
    const adminEmailPromise = resend.emails.send({
      from: 'Glint & Glam Store <orders@glintandglam.pk>',
      to: ['glintandglam.pk@gmail.com'], // Aapki official email
      subject: `🚨 NEW ORDER RECEIVED! #${order.id.slice(-6).toUpperCase()} - Rs. ${Number(totalAmount).toLocaleString()}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #222222;">
          <h2 style="color: #2b7a78;">🎉 You got a new order!</h2>
          <p><strong>Order ID:</strong> #${order.id}</p>
          <p><strong>Customer Name:</strong> ${customerName}</p>
          <p><strong>Customer Email:</strong> ${customerEmail}</p>
          <p><strong>Phone:</strong> ${shippingAddress.phone}</p>
          <p><strong>Shipping Address:</strong> ${shippingAddress.street || shippingAddress.address}, ${shippingAddress.city}</p>
          
          <hr style="margin: 20px 0;" />
          
          <h3>Items Ordered:</h3>
          <ul>
            ${orderItems.map(item => `<li><strong>${item.productName || item.name}</strong> - Qty: ${item.quantity} (Rs. ${item.price})</li>`).join('')}
          </ul>
          
          <h3 style="color: #3a2e28;">Total Amount: Rs. ${Number(totalAmount).toLocaleString()}</h3>
        </div>
      `
    });

    // Both emails trigger simultaneously
    await Promise.all([customerEmailPromise, adminEmailPromise]);
    console.log("Order emails sent successfully to Customer & Admin!");

  } catch (error) {
    console.error("Failed to send order emails via Resend:", error);
  }
}