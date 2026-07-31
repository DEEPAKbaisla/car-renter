"use server";

import authOptions from "@/lib/auth";
import connectDb from "@/lib/db";
import User from "@/model/userModel";
import { getServerSession } from "next-auth";

export async function getAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }

  await connectDb();
  const user = await User.findById(session.user.id).select("-password");
  if (!user || user.role !== "admin") {
    return null;
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    image: user.image,
    role: user.role,
  };
}

export async function getUsers(search = "", page = 1, limit = 10) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    await connectDb();
    const admin = await User.findById(session.user.id);
    if (!admin || admin.role !== "admin") {
      return { success: false, error: "Unauthorized: Admin only" };
    }

    let filter: any = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Math.max(1, page) - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    const serializedUsers = users.map((user) => ({
      id: user._id?.toString(),
      name: user.name ?? "",
      email: user.email ?? "",
      role: user.role ?? "user",
      isBlocked: user.isBlocked ?? false,
      image: user.image ?? null,
      createdAt: user.createdAt
        ? new Date(user.createdAt).toISOString()
        : null,
    }));

    return {
      success: true,
      data: serializedUsers,
      total,
      page,
      pageCount: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, error: "Failed to fetch users" };
  }
}

export async function updateUserRole(userId: string, role: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    await connectDb();
    const admin = await User.findById(session.user.id);
    if (!admin || admin.role !== "admin") {
      return { success: false, error: "Unauthorized: Admin only" };
    }

    if (!["user", "admin"].includes(role)) {
      return { success: false, error: "Invalid role" };
    }

    const user = await User.findById(userId);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    if (user.role === "admin" && role !== "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return { success: false, error: "Cannot demote the last admin" };
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return { success: false, error: "User not found" };
    }

    return {
      success: true,
      user: {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isBlocked: updatedUser.isBlocked ?? false,
      },
    };
  } catch (error) {
    return { success: false, error: "Failed to update user role" };
  }
}

export async function toggleUserBlock(userId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    await connectDb();
    const admin = await User.findById(session.user.id);
    if (!admin || admin.role !== "admin") {
      return { success: false, error: "Unauthorized: Admin only" };
    }

    const user = await User.findById(userId);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    if (user._id.toString() === session.user.id) {
      return { success: false, error: "Cannot block yourself" };
    }

    if (user.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return { success: false, error: "Cannot block the last admin" };
      }
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    return {
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        isBlocked: user.isBlocked,
      },
    };
  } catch (error) {
    return { success: false, error: "Failed to toggle user block" };
  }
}
