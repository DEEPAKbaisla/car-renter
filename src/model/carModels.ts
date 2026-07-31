import mongoose from "mongoose";
interface carDocument {
  _id?: mongoose.Types.ObjectId;
  name: string;
  type:
    | "hatchback"
    | "sedan"
    | "suv"
    | "convertible"
    | "coupe"
    | "wagon"
    | "pickup";
  price: number;
  brand: string;
  model: string;
  status: "available" | "booked" | "maintenance";
  transmission: "manual" | "automatic" | "semi-automatic";
  fuelType: "petrol" | "diesel" | "electric" | "hybrid" | "cng";
  seats: number;
  rating?: number;
  year: number;
  color?: string;
  description?: string;
  mileage?: number;
  bodyType?: string;
  trips: number;
  image: string[];
  createdBy?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const carSchema = new mongoose.Schema<carDocument>(
  {
    name: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["hatchback", "sedan", "suv", "luxury"],
      required: true,
    },
    transmission: {
      type: String,
      enum: ["manual", "automatic"],
      required: true,
    },
    fuelType: {
      type: String,
      enum: ["petrol", "diesel", "electric", "hybrid", "cng"],
      required: true,
    },
    seats: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    color: {
      type: String,
    },
    description: {
      type: String,
    },
    mileage: {
      type: Number,
      required: true,
    },
    bodyType: {
      type: String,
    },

    status: {
      type: String,
      enum: ["available", "unavailable", "booked", "maintenance"],
      default: "available",
    },
    trips: {
      type: Number,
      default: 0,
    },
    image: {
      type: [String],
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

const Car = mongoose.models?.Car || mongoose.model("Car", carSchema);
export default Car;
