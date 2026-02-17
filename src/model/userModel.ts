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

    image: {
      type: String,
    },
  },
  { timestamps: true }
);

const User = mongoose.models?.User || mongoose.model("User", userSchema);
export default User;
