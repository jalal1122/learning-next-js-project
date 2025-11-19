"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Eye, EyeOff, RefreshCw } from "lucide-react";
import axios from "axios";

// NOTE: Pure UI only (no API call). Wire up actual functionality later.

const ForgotPasswordPage: React.FC = () => {
  const { token } = useParams();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const strength = useMemo(() => {
    if (!password) return { score: 0, label: "Empty", color: "bg-gray-200" };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong", "Excellent"];
    const colors = [
      "bg-rose-400",
      "bg-rose-500",
      "bg-amber-500",
      "bg-yellow-500",
      "bg-emerald-500",
      "bg-green-600",
    ];
    return {
      score,
      label: labels[score],
      color: colors[score],
    };
  }, [password]);

  const progressPercent = ((strength.score / 5) * 100).toFixed(0);

  const passwordsMatch =
    !password || !confirmPassword || password === confirmPassword;
  const canSubmit =
    password &&
    confirmPassword &&
    passwordsMatch &&
    strength.score >= 3 &&
    !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!canSubmit) return;
    try {
      setSubmitting(true);
      await axios.post(`/api/forgotpassword/${token}`, { password });
      setSuccess("Password reset success placeholder (implement logic later)");
      setPassword("");
      setConfirmPassword("");
      // Optionally navigate after delay
      // setTimeout(() => router.push('/login'), 1500);
    } catch (err) {
      if(axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Something went wrong (placeholder). Wire API later.");
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong (placeholder). Wire API later.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50 px-4 py-20">
      <div className="w-full max-w-lg">
        <div className="relative bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-indigo-100 overflow-hidden">
          {/* Accent Bar */}
          <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-600" />
          <div className="px-8 pt-10 pb-12">
            <div className="text-center space-y-2 mb-8">
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-700 to-blue-600 bg-clip-text text-transparent">
                Reset Password
              </h1>
              <p className="text-sm text-gray-500">
                Enter your new password below. Token:{" "}
                <span className="font-mono break-all text-indigo-600">
                  {token}
                </span>
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-lg border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700 flex items-start gap-2">
                <span className="font-semibold">Error:</span> {error}
              </div>
            )}
            {success && (
              <div className="mb-6 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 flex items-start gap-2">
                <span className="font-semibold">Success:</span> {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-7">
              {/* Password Field */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold tracking-wide text-gray-600 uppercase">
                  New Password
                </label>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="text-black w-full rounded-lg border border-gray-300 bg-white/70 px-4 py-3 pr-12 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/40 outline-none transition"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {/* Strength Meter */}
                <div className="space-y-1">
                  <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                    <div
                      style={{ width: `${progressPercent}%` }}
                      className={`h-full transition-all duration-500 ${strength.color}`}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-medium text-gray-500">
                    <span>
                      Password Strength:{" "}
                      <span className="text-gray-700">{strength.label}</span>
                    </span>
                    <span>{progressPercent}%</span>
                  </div>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold tracking-wide text-gray-600 uppercase">
                  Confirm Password
                </label>
                <div className="relative group">
                  <input
                    type={showConfirm ? "text" : "password"}
                    className={`text-black w-full rounded-lg border bg-white/70 px-4 py-3 pr-12 text-sm shadow-sm focus:ring-2 outline-none transition ${
                      passwordsMatch
                        ? "border-gray-300 focus:border-indigo-500 focus:ring-indigo-400/40"
                        : "border-rose-400 focus:border-rose-500 focus:ring-rose-400/40"
                    }`}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {!passwordsMatch && (
                  <p className="text-xs font-medium text-rose-600 mt-1">
                    Passwords do not match.
                  </p>
                )}
              </div>

              {/* Requirements */}
              <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-gray-500">
                <div
                  className={`flex items-center gap-1 ${
                    password.length >= 8 ? "text-emerald-600" : ""
                  }`}
                >
                  ● 8+ chars
                </div>
                <div
                  className={`flex items-center gap-1 ${
                    /[A-Z]/.test(password) ? "text-emerald-600" : ""
                  }`}
                >
                  ● Uppercase
                </div>
                <div
                  className={`flex items-center gap-1 ${
                    /[a-z]/.test(password) ? "text-emerald-600" : ""
                  }`}
                >
                  ● Lowercase
                </div>
                <div
                  className={`flex items-center gap-1 ${
                    /[0-9]/.test(password) ? "text-emerald-600" : ""
                  }`}
                >
                  ● Number
                </div>
                <div
                  className={`flex items-center gap-1 ${
                    /[^A-Za-z0-9]/.test(password) ? "text-emerald-600" : ""
                  }`}
                >
                  ● Symbol
                </div>
                <div
                  className={`flex items-center gap-1 ${
                    passwordsMatch && confirmPassword ? "text-emerald-600" : ""
                  }`}
                >
                  ● Match
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <button
                  disabled={!canSubmit}
                  type="submit"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:opacity-60 disabled:cursor-not-allowed transition-all active:scale-[.98]"
                >
                  {submitting && (
                    <RefreshCw size={16} className="animate-spin" />
                  )}
                  {submitting ? "Processing..." : "Reset Password"}
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="sm:w-40 inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-200 transition-all active:scale-[.98]"
                >
                  Back to Login
                </button>
              </div>
            </form>

            <div className="mt-10 text-center text-[11px] text-gray-400 tracking-wide">
              This is a UI-only placeholder. Connect it to your backend logic
              later.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
