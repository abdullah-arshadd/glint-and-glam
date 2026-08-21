import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import crypto from "crypto";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // 🔒 Security: respond identically whether or not the user exists.
    // This stops the endpoint being used to check which emails are registered.
    const genericResponse = NextResponse.json(
      { message: "If an account exists, a reset link has been sent." },
      { status: 200 }
    );

    if (!user) {
      return genericResponse;
    }

    // Raw token goes in the email link. Only its SHA-256 hash is stored in
    // the DB, so a leaked database alone can't be used to reset passwords.
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: hashedToken,
        resetTokenExpiry: expiry,
      },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password?token=${rawToken}`;

    // 🌟 IMPORTANT: Resend's SDK resolves with { data, error } — it does NOT
    // throw on a failed send (e.g. unverified sender domain). Without checking
    // `error` explicitly, a failed send looks identical to a successful one.
    const { data: emailData, error: emailError } = await resend.emails.send({
      // 🔧 TEMP — replace with your actual verified sender (the one your
      // signup OTP emails use successfully) once you share that file.
      from: "Glint & Glam <no-reply@glintandglam.pk>",
      to: user.email,
      subject: "Reset Your Password — Glint & Glam",
      html: `
        <div style="font-family: Arial, sans-serif; background-color:#f5f3ed; padding: 40px 20px;">
          <div style="max-width:480px;margin:0 auto;background:#ffffff;padding:36px 32px;border-radius:8px;">
            <h2 style="color:#3a2e28;font-weight:500;margin-bottom:8px;">Reset Your Password</h2>
            <p style="color:#3a2e28;font-size:13px;line-height:1.6;opacity:0.85;">
              We received a request to reset the password for your Glint &amp; Glam account. Click the button below to choose a new password. This link expires in 30 minutes.
            </p>
            <a href="${resetUrl}" style="display:inline-block;margin-top:20px;background:#3a2e28;color:#ffffff;padding:12px 28px;text-decoration:none;font-size:12px;letter-spacing:1px;text-transform:uppercase;border-radius:4px;">
              Reset Password
            </a>
            <p style="color:#3a2e28;font-size:11px;opacity:0.6;margin-top:24px;">
              If you didn't request this, you can safely ignore this email — your password will remain unchanged.
            </p>
          </div>
        </div>
      `,
    });

    if (emailError) {
      // Logged server-side only — the response to the browser stays generic
      // for security, but now you'll actually SEE why it failed in your logs.
      console.error("🚨 Resend failed to send password reset email:", emailError);
    } else {
      console.log("✅ Password reset email sent:", emailData?.id);
    }

    return genericResponse;
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}