import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import connectDb from "@/lib/db";
import Booking from "@/model/booking";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const status = searchParams.get("status");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10")));
    const skip = (page - 1) * limit;

    await connectDb();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) {
        query.startDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.startDate.$lte = new Date(endDate);
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
