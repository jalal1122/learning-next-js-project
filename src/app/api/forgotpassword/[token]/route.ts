import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/Config/db.config";
import User from "@/Models/user.model.js";

connectDB();

// Unified JSON error helper
const jsonError = (message: string, status: number) =>
  NextResponse.json({ success: false, message }, { status });

export async function POST(
  _request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = await params;

    const body = await _request.json();
    const password: string | undefined = body?.password;

    // Find user by reset token
    const user = await User.findOne({ resetToken: token });
    if (!user) {
      return jsonError("User not found with this token", 400);
    }

    if (!token) return jsonError("Reset token is required", 400);

    const isMatch = token === user.resetToken;
    if (!isMatch) {
      console.log("Token mismatch:", token, user.resetToken);
      return jsonError("Invalid or expired reset link", 400);
    }
    if (user.resetTokenExpiry && user.resetTokenExpiry < new Date()) {
      return jsonError("Invalid or expired reset link", 400);
    }

    if (!password || password.length < 6) {
      return jsonError("Password must be at least 6 characters", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    // Invalidate the reset token after successful password reset

    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();
    return NextResponse.json({
      success: true,
      message: "Password Successfully reset. You can now log in.",
    });
  } catch (error) {
    console.error("Reset token verification error:", error);
    return jsonError("Internal server error", 500);
  }
}
