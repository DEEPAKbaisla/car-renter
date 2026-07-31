import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import connectDb from "@/lib/db";
import Booking from "@/model/booking";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10")));
    const skip = (page - 1) * limit;

    await connectDb();

    const [bookings, total] = await Promise.all([
      Booking.find({ user: session.user.id })
        .populate("car", "name brand model image price")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Booking.countDocuments({ user: session.user.id }),
    ]);

    return NextResponse.json({
      bookings,
      total,
      page,
      pageCount: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Fetch bookings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
