import connectDb from "@/lib/db";
import User from "@/model/userModel";
import { NextRequest, NextResponse } from "next/server";
import { generateResetToken, hashToken, sendPasswordResetEmail } from "@/lib/otp";
import { forgotPasswordLimiter } from "@/lib/arjet";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = forgotPasswordSchema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.issues[0].message;
      return NextResponse.json({ message: firstError }, { status: 400 });
    }

    const { email } = result.data;

    const decision = await forgotPasswordLimiter.protect(request);
    if (decision.isDenied()) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    await connectDb();

    const user = await User.findOne({ email });
    if (!user) {
      // Return success even if user not found to prevent email enumeration
      return NextResponse.json(
        { message: "If an account with that email exists, a reset link has been sent." },
        { status: 200 }
      );
    }

    const resetToken = generateResetToken();
    const hashedToken = hashToken(resetToken);

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save();

    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

    let emailSent = false;
    try {
      await sendPasswordResetEmail(user.email, user.name, resetUrl);
      emailSent = true;
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);
    }

    const response: Record<string, unknown> = {
      message: "If an account with that email exists, a reset link has been sent.",
    };

    if (!emailSent && process.env.NODE_ENV === "development") {
      response.resetUrl = resetUrl;
      response.devNote = "Email sending failed. Use this link for testing.";
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
