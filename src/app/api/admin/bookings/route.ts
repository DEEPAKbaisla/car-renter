import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import connectDb from "@/lib/db";
import Booking from "@/model/booking";
import { BookingStatus } from "@/model/booking";

const VALID_STATUSES: BookingStatus[] = ["pending_payment", "confirmed", "cancelled", "completed"];

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const status = searchParams.get("status");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1") || 1);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10") || 10));
    const skip = (page - 1) * limit;

    await connectDb();

    const query: Record<string, unknown> = {};

    if (status && status !== "all") {
      if (!VALID_STATUSES.includes(status as BookingStatus)) {
        return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
      }
      query.status = status;
    }

    if (startDate || endDate) {
      query.startDate = {} as Record<string, Date>;
      if (startDate) {
        (query.startDate as Record<string, Date>).$gte = new Date(startDate);
      }
      if (endDate) {
        (query.startDate as Record<string, Date>).$lte = new Date(endDate);
      }
    }

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate("car", "name brand model image price")
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Booking.countDocuments(query),
    ]);

    return NextResponse.json({
      bookings,
      total,
      page,
      pageCount: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Admin fetch bookings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
