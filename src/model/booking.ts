import mongoose from "mongoose";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded";

export interface BookingDocument {
  _id?: mongoose.Types.ObjectId;

  user: mongoose.Types.ObjectId; // who booked
  car: mongoose.Types.ObjectId;  // which car

  startDate: Date;
  endDate: Date;

  totalDays: number;
  pricePerDay: number;
  totalPrice: number;

  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;

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

    totalPrice: {
      type: Number,
      required: true,
    },

    bookingStatus: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
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

const Booking =
  mongoose.models.Booking ||
  mongoose.model<BookingDocument>("Booking", bookingSchema);

export default Booking;
