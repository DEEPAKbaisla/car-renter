import mongoose from "mongoose";

interface OtpDocument {
  _id?: mongoose.Types.ObjectId;
  email: string;
  name: string;
  hashedPassword: string;
  otp: string;
  expiresAt: Date;
  attempts: number;
  createdAt?: Date;
}

const otpSchema = new mongoose.Schema<OtpDocument>(
  {
    email: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    hashedPassword: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Otp = mongoose.models?.Otp || mongoose.model("Otp", otpSchema);
export default Otp;
