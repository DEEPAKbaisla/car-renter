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

export async function getUsers(search = "") {
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

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

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

    return { success: true, data: serializedUsers };
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

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return { success: false, error: "User not found" };
    }

    return {
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        isBlocked: user.isBlocked ?? false,
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
