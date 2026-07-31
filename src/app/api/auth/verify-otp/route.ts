import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/db";
import User from "@/model/userModel";
import Otp from "@/model/otpModel";
import crypto from "crypto";
import { verifyOtpLimiter } from "@/lib/arjet";

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { message: "Email and OTP are required" },
        { status: 400 }
      );
    }

    const decision = await verifyOtpLimiter.protect(req);
    if (decision.isDenied()) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    await connectDb();

    const otpData = await Otp.findOne({ email: email.toLowerCase() });

    if (!otpData) {
      return NextResponse.json(
        { message: "OTP not found. Please register again." },
        { status: 400 }
      );
    }

    if (otpData.expiresAt < new Date()) {
      await Otp.deleteOne({ _id: otpData._id });
      return NextResponse.json(
        { message: "OTP expired. Please register again." },
        { status: 400 }
      );
    }

    const attemptResult = await Otp.updateOne(
      { _id: otpData._id, attempts: { $lt: 5 } },
      { $inc: { attempts: 1 } }
    );

    if (attemptResult.modifiedCount === 0) {
      await Otp.deleteOne({ _id: otpData._id });
      return NextResponse.json(
        { message: "Too many attempts. Please register again." },
        { status: 400 }
      );
    }

    const otpBuf = Buffer.from(String(otp), "utf8");
    const storedBuf = Buffer.from(String(otpData.otp), "utf8");
    let otpValid = false;
    if (otpBuf.length === storedBuf.length) {
      otpValid = crypto.timingSafeEqual(otpBuf, storedBuf);
    }

    if (!otpValid) {
      return NextResponse.json(
        { message: "Invalid OTP. Please try again." },
        { status: 400 }
      );
    }

    await User.create({
      name: otpData.name,
      email: otpData.email,
      password: otpData.hashedPassword,
      isVerified: true,
    });

    await Otp.deleteOne({ _id: otpData._id });

    return NextResponse.json(
      { message: "Email verified successfully. Please sign in." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
