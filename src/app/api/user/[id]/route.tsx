import { NextRequest, NextResponse } from "next/server";

// Ensure database connection is initialized once per Lambda/edge instance.
import { connectDB } from "@/Config/db.config";
import User from "@/Models/user.model.js";

connectDB();

// Helper to safely build error responses
const jsonError = (message: string, status: number) =>
  NextResponse.json({ success: false, message }, { status });

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return jsonError("User ID is required", 400);
    }

    const user = await User.findById(id).select("-password"); // Exclude password field

    if (!user) {
      return jsonError("User not found", 404);
    }

    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (err: unknown) {
    console.error("User retrieval error:", err);
    return jsonError("Internal Server Error", 500);
  }
}
