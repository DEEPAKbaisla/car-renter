import mongoose from "mongoose";

export type BookingStatus =
  | "pending_payment"
  | "confirmed"
  | "cancelled"
  | "completed";

export type PaymentPlan = "full" | "half";

export interface BookingDocument {
  _id?: mongoose.Types.ObjectId;

  user: mongoose.Types.ObjectId;
  car: mongoose.Types.ObjectId;

  startDate: Date;
  endDate: Date;

  totalDays: number;
  pricePerDay: number;
  totalAmount: number;

  paymentPlan: PaymentPlan;
  amountPaid: number;
  amountDue: number;

  status: BookingStatus;

  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;

  remainingRazorpayOrderId?: string;
  remainingRazorpayPaymentId?: string;
  remainingRazorpaySignature?: string;

  pickupLocation?: string;
  dropLocation?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

const bookingSchema = new mongoose.Schema<BookingDocument>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    totalDays: {
      type: Number,
      required: true,
    },

    pricePerDay: {
      type: Number,
      required: true,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    paymentPlan: {
      type: String,
      enum: ["full", "half"],
      required: true,
    },

    amountPaid: {
      type: Number,
      default: 0,
    },

    amountDue: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["pending_payment", "confirmed", "cancelled", "completed"],
      default: "pending_payment",
    },

    razorpayOrderId: {
      type: String,
    },

    razorpayPaymentId: {
      type: String,
    },

    razorpaySignature: {
      type: String,
    },

    remainingRazorpayOrderId: {
      type: String,
    },

    remainingRazorpayPaymentId: {
      type: String,
    },

    remainingRazorpaySignature: {
      type: String,
    },

    pickupLocation: {
      type: String,
    },

    dropLocation: {
      type: String,
    },
  },
  { timestamps: true }
);

bookingSchema.index({ status: 1, user: 1, car: 1 });
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ car: 1, startDate: 1, endDate: 1 });

const Booking =
  mongoose.models.Booking ||
  mongoose.model<BookingDocument>("Booking", bookingSchema);

export default Booking;
