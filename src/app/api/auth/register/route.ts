import connectDb from "@/lib/db";
import User from "@/model/userModel";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();
    await connectDb();
    let existUser = await User.findOne({ email });
    if (existUser) {
      return NextResponse.json(
        { message: "email already exists" },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { message: "password must be at least 6 characters" },
        { status: 400 }
      );
    }

    let hashPassword = await bcrypt.hash(password, 10);

    let user = await User.create({
      name,
      email,
      password: hashPassword,
    });
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: `register error ${error}` },
      { status: 500 }
    );
  }
}
