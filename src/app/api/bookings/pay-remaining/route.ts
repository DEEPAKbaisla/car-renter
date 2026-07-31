import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import connectDb from "@/lib/db";
import Booking from "@/model/booking";
import razorpay from "@/lib/razorpay";
import { z } from "zod";

const payRemainingSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = payRemainingSchema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.issues[0].message;
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { bookingId } = result.data;

    await connectDb();

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.user.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (booking.paymentPlan !== "half") {
      return NextResponse.json({ error: "This booking does not have a remaining balance" }, { status: 400 });
    }

    if (booking.amountDue <= 0) {
      return NextResponse.json({ error: "No remaining amount due" }, { status: 400 });
    }

    if (booking.status !== "confirmed") {
      return NextResponse.json({ error: "Booking must be confirmed before paying remaining" }, { status: 400 });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: booking.amountDue * 100,
      currency: "INR",
      receipt: `booking_remaining_${booking._id}`,
    });

    booking.remainingRazorpayOrderId = razorpayOrder.id;
    await booking.save();

    return NextResponse.json({
      bookingId: booking._id,
      orderId: razorpayOrder.id,
      amount: booking.amountDue * 100,
      currency: "INR",
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    });
  } catch (error) {
    console.error("Pay remaining error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
