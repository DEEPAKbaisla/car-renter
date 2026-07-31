import connectDb from "@/lib/db";
import User from "@/model/userModel";
import Otp from "@/model/otpModel";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateOtp, sendVerificationOtp } from "@/lib/otp";
import { registerLimiter } from "@/lib/arjet";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = registerSchema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.issues[0].message;
      return NextResponse.json({ message: firstError }, { status: 400 });
    }

    const { name, email, password } = result.data;

    const decision = await registerLimiter.protect(request);
    if (decision.isDenied()) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    await connectDb();

    const existUser = await User.findOne({ email });
    if (existUser) {
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 400 }
      );
    }

    await Otp.deleteMany({ email });

    const hashPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();

    await Otp.create({
      email,
      name,
      hashedPassword: hashPassword,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      attempts: 0,
    });

    let emailSent = false;
    try {
      await sendVerificationOtp(email, name, otp);
      emailSent = true;
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);
    }

    const response: Record<string, unknown> = {
      message: "Account created. Please verify your email.",
      email,
    };

    if (!emailSent && process.env.NODE_ENV === "development") {
      response.otp = otp;
      response.devNote = "Email sending failed. Use this OTP for testing.";
    }

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
