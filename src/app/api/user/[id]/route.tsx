import { NextRequest, NextResponse } from "next/server";

// Ensure database connection is initialized once per Lambda/edge instance.
import { connectDB } from "@/Config/db.config";
import User from "@/Models/user.model.js";
import mongoose from "mongoose";

connectDB();

// Helper to safely build error responses
const jsonError = (message: string, status: number) =>
  NextResponse.json({ success: false, message }, { status });

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return jsonError("Invalid user ID format", 400);
    }

    const checkUser = await User.findById(id);
    if (!checkUser) {
      return jsonError("User not found", 404);
    }

    if (!id) {
      return jsonError("User ID is required", 400);
    }

    const user = await User.findById(id).select("-password"); // Exclude password field

    if (!user) {
      return jsonError("User not found", 404);
    }

    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("User retrieval error:", err);
      return jsonError(err?.message || "Internal Server Error", 500);
    } else {
      console.error("Unknown error:", err);
      return jsonError("An unexpected error occurred", 500);
    }
  }
}
