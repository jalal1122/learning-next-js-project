import User from "@/Models/user.model.js";
import { connectDB } from "@/Config/db.config";
import { NextRequest, NextResponse } from "next/server";

connectDB();

// Unified JSON error helper
const jsonError = (message: string, status: number) =>
  NextResponse.json({ success: false, message }, { status });

/**
 * Email / account verification endpoint.
 * This should NOT require an authenticated session cookie because users typically
 * verify before logging in. We only trust the signed token sent in the email.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token;

    if (!token) return jsonError("Verification token is required", 400);

    // Find user by verification token (stored as-is). If you move to hashing the token,
    // you'll need to store a hashed version and compare with bcrypt instead.
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return jsonError(
        "Invalid, expired verification link or Already verified",
        400
      );
    }

    const isMatch = token === user.verificationToken;

    if (!isMatch) {
      return jsonError("Invalid or expired verification link", 400);
    }

    if (user.isVerified) {
      return jsonError("User already verified", 400);
    }

    if (
      user.verificationTokenExpiry &&
      user.verificationTokenExpiry < new Date()
    ) {
      return jsonError("Verification link has expired", 400);
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    return NextResponse.json({
      success: true,
      message: "User verified successfully",
    });
  } catch (error) {
    console.error("Verification error:", error);
    return jsonError("Internal Server Error", 500);
  }
}
