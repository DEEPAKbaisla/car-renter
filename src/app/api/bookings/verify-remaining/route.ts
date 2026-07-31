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

    if (booking.amountDue <= 0) {
      return NextResponse.json({ error: "No remaining amount due" }, { status: 400 });
    }

    if (booking.status !== "confirmed") {
      return NextResponse.json(
        { error: "Booking must be confirmed before paying remaining" },
        { status: 400 }
      );
    }

    if (booking.remainingRazorpayOrderId !== razorpay_order_id) {
      return NextResponse.json(
        { error: "Invalid order ID" },
        { status: 400 }
      );
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

    booking.remainingRazorpayPaymentId = razorpay_payment_id;
    booking.remainingRazorpaySignature = razorpay_signature;
    booking.amountPaid = booking.totalAmount;
    booking.amountDue = 0;
    await booking.save();

    const safeBooking = await Booking.findById(bookingId)
      .select("-razorpayOrderId -razorpayPaymentId -razorpaySignature -remainingRazorpayOrderId -remainingRazorpayPaymentId -remainingRazorpaySignature")
      .lean();

    return NextResponse.json({ booking: safeBooking });
  } catch (error) {
    console.error("Verify remaining error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
