import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import connectDb from "@/lib/db";
import Car from "@/model/carModels";
import Booking from "@/model/booking";
import razorpay from "@/lib/razorpay";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  const mongoSession = await mongoose.startSession();
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { carId, startDate, endDate, paymentPlan } = await req.json();

    if (!carId || !startDate || !endDate || !paymentPlan) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!["full", "half"].includes(paymentPlan)) {
      return NextResponse.json({ error: "Invalid payment plan" }, { status: 400 });
    }

    await connectDb();

    const car = await Car.findById(carId);
    if (!car) {
      return NextResponse.json({ error: "Car not found" }, { status: 404 });
    }

    if (car.status !== "available") {
      return NextResponse.json({ error: "Car is not available" }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ error: "Invalid dates" }, { status: 400 });
    }

    if (end <= start) {
      return NextResponse.json({ error: "End date must be after start date" }, { status: 400 });
    }

    const diffTime = end.getTime() - start.getTime();
    const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const pricePerDay = car.price;
    const totalAmount = Math.round(pricePerDay * totalDays);
    const amountToPayNow = paymentPlan === "full" ? totalAmount : Math.round(totalAmount / 2);
    const amountDue = totalAmount - amountToPayNow;

    await mongoSession.startTransaction();

    const existingBooking = await Booking.findOne({
      car: carId,
      status: { $in: ["pending_payment", "confirmed"] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } },
      ],
    }).session(mongoSession);

    if (existingBooking) {
      await mongoSession.abortTransaction();
      return NextResponse.json({ error: "Car is already booked for these dates" }, { status: 400 });
    }

    const [booking] = await Booking.create([{
      user: session.user.id,
      car: carId,
      startDate: start,
      endDate: end,
      totalDays,
      pricePerDay,
      totalAmount,
      paymentPlan,
      amountPaid: 0,
      amountDue,
      status: "pending_payment",
    }], { session: mongoSession });

    await mongoSession.commitTransaction();

    const razorpayOrder = await razorpay.orders.create({
      amount: amountToPayNow * 100,
      currency: "INR",
      receipt: `booking_${booking._id}`,
    });

    booking.razorpayOrderId = razorpayOrder.id;
    await booking.save();

    return NextResponse.json({
      bookingId: booking._id,
      orderId: razorpayOrder.id,
      amount: amountToPayNow * 100,
      currency: "INR",
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    });
  } catch (error) {
    if (mongoSession.inTransaction()) {
      await mongoSession.abortTransaction();
    }
    console.error("Booking create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  } finally {
    await mongoSession.endSession();
  }
}
