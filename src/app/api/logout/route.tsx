import { NextResponse } from "next/server";

export async function GET() {
  const response = NextResponse.json({ message: "Logged out successfully" });
  response.cookies.set("accessToken", "", { maxAge: 0 }); // Clear session cookie
  return response;
}
