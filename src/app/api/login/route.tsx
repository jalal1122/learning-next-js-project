import User from "@/Models/user.model.js";
import { connectDB } from "@/Config/db.config";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { generateToken } from "@/Helpers/GenerateToken";

// Ensure database connection is initialized once per Lambda/edge instance.
connectDB();

// Helper to safely build error responses
const jsonError = (message: string, status: number) =>
  NextResponse.json({ success: false, message }, { status });

const cookiesOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24 * 1, // 1 day
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email: string | undefined = body?.email?.toLowerCase().trim();
    const password: string | undefined = body?.password;

    if (!email || !password) {
      return jsonError("Both email and password are required", 400);
    }

    // Basic email pattern (lightweight validation)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return jsonError("Invalid email format", 400);
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return jsonError("Invalid email or password", 401);
    }

    // Compare provided password with stored hashed password
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isPasswordValid) {
      return jsonError("Invalid email or password", 401);
    }

    const accessToken = generateToken({ id: existingUser._id });

    // If login is successful, you can return a success response
    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        accessToken,
        user: {
          id: existingUser._id,
          name: existingUser.name,
          email: existingUser.email,
          createdAt: existingUser.createdAt,
        },
      },
      { status: 200 }
    );
    response.cookies.set("accessToken", accessToken, cookiesOptions);
    return response;
  } catch (error: unknown) {
    console.error("Login error:", error);
    return jsonError("Internal Server Error", 500);
  }
}
