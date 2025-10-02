"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import clsx from "clsx";
import { useRouter } from "next/navigation";

type Status = "idle" | "verifying" | "success" | "error";

const VerifyToken: React.FC = () => {
  const router = useRouter();
  const { token } = useParams();
  const [status, setStatus] = useState<Status>("verifying");
  const [message, setMessage] = useState<string>("Verifying your token...");

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      try {
        setStatus("verifying");
        setMessage("Verifying your token...");
        const response = await axios.post(`/api/verifytoken/${token}`);
        if (!isMounted) return;
        // We keep functionality minimal: just reflect success visually.
        setStatus("success");
        setMessage(response.data?.message || "Token verified successfully.");
        console.log("Verification response:", response.data);

        setTimeout(() => {
          if (!isMounted) return;
          setMessage("You can close this tab or continue using the app.");
          router.push("/login");
        }, 3000);
      } catch (error: unknown) {
        if (!isMounted) return;
        setStatus("error");
        if (axios.isAxiosError(error) && error.response) {
          setMessage(error.response.data?.message || "Failed to verify token.");
          console.error("Error verifying token:", error.response.data);
          setTimeout(() => {
            router.push("/login");
          }, 3000);
        } else if (error instanceof Error) {
          setMessage(error.message || "An unexpected error occurred.");
          console.error("Error verifying token:", error.message);
        } else {
          setMessage("An unexpected error occurred.");
          console.error("Unknown verification error");
        }
      }
    };
    run();
    return () => {
      isMounted = false;
    };
  }, [token]);

  const pulse = status === "verifying";
  const isError = status === "error";
  const isSuccess = status === "success";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-12 px-4">
      <div className="w-full max-w-lg">
        <div className="relative bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-indigo-100 overflow-hidden">
          {/* Top Accent Bar */}
          <div
            className={clsx(
              "h-1 w-full",
              isSuccess && "bg-gradient-to-r from-emerald-400 to-emerald-600",
              isError && "bg-gradient-to-r from-rose-400 to-rose-600",
              pulse &&
                "bg-gradient-to-r from-indigo-400 via-indigo-500 to-blue-500 animate-pulse"
            )}
          />

          {/* Decorative header */}
          <div className="h-28 bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-600" />

          <div className="px-8 pb-10 -mt-16">
            <div className="mx-auto w-28 h-28 rounded-full ring-4 ring-white shadow-lg flex items-center justify-center bg-gradient-to-br from-indigo-200 to-indigo-400">
              {pulse && (
                <div className="w-12 h-12 border-4 border-white/60 border-t-white rounded-full animate-spin" />
              )}
              {isSuccess && (
                <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center text-white text-3xl font-bold shadow-inner">
                  ✓
                </div>
              )}
              {isError && (
                <div className="w-14 h-14 rounded-full bg-rose-500 flex items-center justify-center text-white text-3xl font-bold shadow-inner">
                  !
                </div>
              )}
              {status === "idle" && (
                <span className="text-indigo-600 font-semibold select-none">
                  •
                </span>
              )}
            </div>

            <div className="mt-6 text-center space-y-3">
              <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-700 to-blue-600 bg-clip-text text-transparent">
                {isSuccess && "Verification Successful"}
                {isError && "Verification Failed"}
                {pulse && "Verifying Token"}
                {status === "idle" && "Verify Token"}
              </h1>
              <p
                className={clsx(
                  "text-sm font-medium",
                  pulse && "text-gray-600",
                  isSuccess && "text-emerald-600",
                  isError && "text-rose-600"
                )}
              >
                {message}
              </p>
              <div className="text-xs text-gray-400 break-all">
                Token: <span className="font-mono">{token}</span>
              </div>
            </div>

            {/* Progress timeline style indicator */}
            <div className="mt-10">
              <div className="flex items-center justify-center gap-3">
                <div
                  className={clsx(
                    "w-3 h-3 rounded-full",
                    pulse && "bg-indigo-400 animate-pulse",
                    isSuccess && "bg-emerald-500",
                    isError && "bg-rose-500"
                  )}
                />
                <div
                  className={clsx(
                    "w-3 h-3 rounded-full",
                    pulse && "bg-indigo-300 animate-pulse delay-150",
                    isSuccess && "bg-emerald-400",
                    isError && "bg-rose-400"
                  )}
                />
                <div
                  className={clsx(
                    "w-3 h-3 rounded-full",
                    pulse && "bg-indigo-200 animate-pulse delay-300",
                    isSuccess && "bg-emerald-300",
                    isError && "bg-rose-300"
                  )}
                />
              </div>
            </div>

            {/* Action / hint area */}
            <div className="mt-10 text-center text-xs text-gray-500 space-y-2">
              {isSuccess && (
                <p>You can safely close this tab or continue using the app.</p>
              )}
              {isError && (
                <p>
                  If the link expired, request a new one. Ensure you copied the
                  full URL.
                </p>
              )}
              {pulse && <p>Hang tight while we confirm your token...</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyToken;
