"use client";

import React, { useState } from "react";
import { Mail, RefreshCcw, CheckCircle2, AlertCircle } from "lucide-react";
import axios from "axios";

// UI only (no real API interaction yet)
const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await axios.post("/api/forgotpassword", { email });
      setSuccess("If that email exists, a reset link has been sent.");
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data?.message || "An error occurred.");
      } else {
        setError("An error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };
  const disabled = !email || loading;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50 px-4 py-20">
      <div className="w-full max-w-md">
        <div className="relative bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-indigo-100 overflow-hidden">
          {/* Accent bar */}
          <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-600" />

          <div className="px-8 pt-10 pb-12">
            <div className="text-center space-y-3 mb-8">
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-700 to-blue-600 bg-clip-text text-transparent">
                Forgot Password
              </h1>
              <p className="text-sm text-gray-500 leading-relaxed">
                Enter your account email and we&#39;ll send you a secure link to
                reset your password.
              </p>
            </div>

            {error && (
              <div className="mb-6 flex items-start gap-2 rounded-lg border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                <AlertCircle size={18} className="mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="mb-6 flex items-start gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <CheckCircle2 size={18} className="mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-semibold tracking-wide text-gray-600 uppercase">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500"
                    size={18}
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="text-black w-full rounded-lg border border-gray-300 bg-white/70 pl-10 pr-4 py-3 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/40 outline-none transition disabled:opacity-50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={disabled}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:opacity-60 disabled:cursor-not-allowed transition-all active:scale-[.98]"
              >
                {loading && <RefreshCcw size={16} className="animate-spin" />}
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <div className="mt-8 text-center text-[11px] text-gray-400 tracking-wide">
              We never share your email. Link expires shortly for security.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
