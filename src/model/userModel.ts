import mongoose from "mongoose";
type UserRole = "user" | "admin";

interface UserDocument {
  _id?: mongoose.Types.ObjectId;
  name: string;
  image?: string;
  email: string;
  role: UserRole;
  password?: string;
  isBlocked?: boolean;
  isVerified?: boolean;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new mongoose.Schema<UserDocument>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
    image: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });

const User = mongoose.models?.User || mongoose.model("User", userSchema);
export default User;
