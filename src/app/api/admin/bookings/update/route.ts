import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import connectDb from "@/lib/db";
import Booking from "@/model/booking";

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending_payment: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
  cancelled: [],
  completed: [],
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookingId, action } = await req.json();

    if (!bookingId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!["confirm", "cancel", "complete"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await connectDb();

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const statusMap: Record<string, string> = {
      confirm: "confirmed",
      cancel: "cancelled",
      complete: "completed",
    };

    const newStatus = statusMap[action];
    const allowedTransitions = VALID_TRANSITIONS[booking.status] || [];

    if (!allowedTransitions.includes(newStatus)) {
      return NextResponse.json(
        { error: `Cannot ${action} a booking with status "${booking.status}"` },
        { status: 400 }
      );
    }

    if (action === "confirm" && booking.amountPaid < booking.totalAmount) {
      return NextResponse.json(
        { error: "Cannot confirm booking before full payment is received" },
        { status: 400 }
      );
    }

    booking.status = newStatus as typeof booking.status;
    await booking.save();

    const updated = await Booking.findById(bookingId)
      .populate("car", "name brand model image price")
      .populate("user", "name email")
      .select("-razorpayOrderId -razorpayPaymentId -razorpaySignature -remainingRazorpayOrderId -remainingRazorpayPaymentId -remainingRazorpaySignature")
      .lean();

    return NextResponse.json({ booking: updated });
  } catch (error) {
    console.error("Admin update booking error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
