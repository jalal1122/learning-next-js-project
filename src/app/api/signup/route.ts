import User from "@/Models/user.model.js";
import { connectDB } from "@/Config/db.config";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import sendVerificationEmail from "@/Helpers/SendVerificationEmail";

// Ensure database connection is initialized once per Lambda/edge instance.
connectDB();

// Helper to safely build error responses
const jsonError = (message: string, status: number) =>
  NextResponse.json({ success: false, message }, { status });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name: string | undefined = body?.name?.trim();
    const email: string | undefined = body?.email?.toLowerCase().trim();
    const password: string | undefined = body?.password;

    if (!name || !email || !password) {
      return jsonError("All fields (name, email, password) are required", 400);
    }

    // Basic email pattern (lightweight validation)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return jsonError("Invalid email format", 400);
    }

    if (password.length < 6) {
      return jsonError("Password must be at least 6 characters", 400);
    }

    // Check if user already exists (use findOne instead of find)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return jsonError("User already exists", 409);
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = await bcrypt.hash(
      email + Date.now().toString(),
      10
    );

    const verificationTokenBase64 = Buffer.from(verificationToken)
      .toString("base64")
      .replace(/\+/g, "-") // replace + with -
      .replace(/\//g, "_") // replace / with _
      .replace(/=+$/, ""); // remove padding =

    // Create and persist the new user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      verificationToken: verificationTokenBase64,
      isVerified: false,
      verificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      resetToken: undefined,
      resetTokenExpiry: undefined,
    });

    sendVerificationEmail("verify", email, verificationTokenBase64);

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          createdAt: newUser.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    // Narrow possible Mongo duplicate key error
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: number }).code === 11000
    ) {
      return jsonError("Email already registered", 409);
    }
    console.error("Signup error:", error);
    return jsonError("Internal Server Error", 500);
  }
}
