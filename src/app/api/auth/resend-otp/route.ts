import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/db";
import User from "@/model/userModel";
import Otp from "@/model/otpModel";
import { generateOtp, sendVerificationOtp } from "@/lib/otp";
import { resendOtpLimiter } from "@/lib/arjet";
import { z } from "zod";

const resendOtpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const result = resendOtpSchema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.issues[0].message;
      return NextResponse.json(
        { message: firstError },
        { status: 400 }
      );
    }

    const { email } = result.data;

    const decision = await resendOtpLimiter.protect(req);
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
        { message: "Email is already verified" },
        { status: 400 }
      );
    }

    const otpData = await Otp.findOne({ email });

    if (!otpData) {
      return NextResponse.json(
        { message: "No pending verification found. Please register again." },
        { status: 400 }
      );
    }

    if (
      otpData.expiresAt &&
      new Date() < otpData.expiresAt &&
      otpData.expiresAt.getTime() - Date.now() > 9 * 60 * 1000
    ) {
      return NextResponse.json(
        { message: "Please wait before requesting a new OTP" },
        { status: 429 }
      );
    }

    const otp = generateOtp();

    otpData.otp = otp;
    otpData.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    otpData.attempts = 0;
    await otpData.save();

    let emailSent = false;
    try {
      await sendVerificationOtp(email, otpData.name, otp);
      emailSent = true;
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);
    }

    const response: Record<string, unknown> = {
      message: "OTP resent successfully",
    };

    if (!emailSent && process.env.NODE_ENV === "development") {
      response.otp = otp;
      response.devNote = "Email sending failed. Use this OTP for testing.";
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
