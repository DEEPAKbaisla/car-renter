import connectDb from "@/lib/db";
import User from "@/model/userModel";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hashToken } from "@/lib/otp";
import { resetPasswordLimiter } from "@/lib/arjet";

const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = resetPasswordSchema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.issues[0].message;
      return NextResponse.json({ message: firstError }, { status: 400 });
    }

    const { token, password } = result.data;

    const decision = await resetPasswordLimiter.protect(request);
    if (decision.isDenied()) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    await connectDb();

    const hashedToken = hashToken(token);

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    const hashPassword = await bcrypt.hash(password, 10);

    user.password = hashPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    return NextResponse.json(
      { message: "Password reset successful. Please sign in with your new password." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
