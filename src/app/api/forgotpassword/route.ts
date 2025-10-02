import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import sendVerificationEmail from "@/Helpers/SendVerificationEmail";
import { connectDB } from "@/Config/db.config";
import User from "@/Models/user.model";

// Ensure database connection is initialized once per Lambda/edge instance.
connectDB();

// Helper to safely build error responses
const jsonError = (message: string, status: number) =>
  NextResponse.json({ success: false, message }, { status });

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) {
      return jsonError("Email is required", 400);
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // To prevent email enumeration, respond with success even if user not found
      return NextResponse.json({
        success: true,
        message: "If that email exists, a reset link has been sent.",
      });
    }

    const hash = await bcrypt.hash(email + Date.now().toString(), 10);

    const resetToken = Buffer.from(hash).toString("base64")
    .replace(/\+/g, "-") // replace + with -
    .replace(/\//g, "_") // replace / with _
    .replace(/=+$/, ""); // remove padding =


    user.resetToken = resetToken;
    user.resetTokenExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour from now

    sendVerificationEmail("reset", email, resetToken);
    await user.save();

    return NextResponse.json({
      success: true,
      message: "If that email exists, a reset link has been sent.",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    return jsonError("Internal server error", 500);
  }
}
