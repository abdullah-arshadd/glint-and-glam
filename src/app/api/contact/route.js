import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, phone, message } = body;

    // Validation Check
    if (!name || !email || !phone || !message) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    // Send Email via Resend to Admin (glintandglam.pk@gmail.com)
    await resend.emails.send({
      from: 'Glint & Glam Helpdesk <contact@glintandglam.pk>',
      to: ['glintandglam.pk@gmail.com'],
      replyTo: email, // 🌟 Gmail par "Reply" dabane se direct customer ko email chala jaye ga
      subject: `📩 NEW INQUIRY: ${name} (${phone})`,
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; padding: 30px 10px; color: #3a2e28; background-color: #f7f2e6;">
          <div style="max-width: 550px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; border: 1px solid rgba(58,46,40,0.1);">
            
            <h2 style="font-family: Georgia, serif; color: #3a2e28; border-bottom: 2px solid #bd977a; padding-bottom: 10px; margin-top: 0; font-size: 20px;">
              New Customer Message
            </h2>
            
            <div style="margin-top: 20px; font-size: 13px; line-height: 1.8;">
              <p style="margin: 4px 0;"><strong>Customer Name:</strong> ${name}</p>
              <p style="margin: 4px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #bd977a; text-decoration: none;">${email}</a></p>
              <p style="margin: 4px 0;"><strong>Phone:</strong> ${phone}</p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;" />
            
            <h3 style="font-size: 13px; uppercase; letter-spacing: 1px; color: #3a2e28; margin-bottom: 8px;">Message / Inquiry:</h3>
            <div style="background-color: #fcfbfa; padding: 16px; border-radius: 6px; border: 1px solid #f0e8d6; font-size: 13px; color: #444444; line-height: 1.6; white-space: pre-wrap;">
${message}
            </div>

            <p style="font-size: 11px; color: #888888; margin-top: 25px; text-align: center;">
              💡 <em>Pro-tip: Direct "Reply" on this email in Gmail will go straight to <strong>${email}</strong>.</em>
            </p>
          </div>
        </div>
      `
    });

    return NextResponse.json({ success: true, message: "Inquiry sent successfully" }, { status: 200 });

  } catch (error) {
    console.error("Contact Form API Error:", error);
    return NextResponse.json({ error: "Failed to send inquiry email" }, { status: 500 });
  }
}