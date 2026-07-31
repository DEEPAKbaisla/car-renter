import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import connectDb from "@/lib/db";
import Booking from "@/model/booking";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!bookingId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDb();

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.user.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (booking.status === "confirmed") {
      const safeBooking = await Booking.findById(bookingId)
        .select("-razorpayOrderId -razorpayPaymentId -razorpaySignature -remainingRazorpayOrderId -remainingRazorpayPaymentId -remainingRazorpaySignature")
        .lean();
      return NextResponse.json({ booking: safeBooking }, { status: 200 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const sigBuf = Buffer.from(String(expectedSignature), "utf8");
    const razorpayBuf = Buffer.from(String(razorpay_signature), "utf8");
    const sigValid =
      sigBuf.length === razorpayBuf.length &&
      crypto.timingSafeEqual(sigBuf, razorpayBuf);

    if (!sigValid) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    const amountPaidNow = booking.paymentPlan === "full" ? booking.totalAmount : Math.round(booking.totalAmount / 2);

    booking.razorpayPaymentId = razorpay_payment_id;
    booking.razorpaySignature = razorpay_signature;
    booking.amountPaid = amountPaidNow;
    booking.status = "confirmed";
    await booking.save();

    const safeBooking = await Booking.findById(bookingId)
      .select("-razorpayOrderId -razorpayPaymentId -razorpaySignature -remainingRazorpayOrderId -remainingRazorpayPaymentId -remainingRazorpaySignature")
      .lean();

    return NextResponse.json({ booking: safeBooking });
  } catch (error) {
    console.error("Payment verify error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
