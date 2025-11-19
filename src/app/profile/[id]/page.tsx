"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";

interface UserShape {
  name: string;
  email: string;
  isVerified: boolean;
}

// Skeleton component (full layout) shown while loading
const ProfileSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center py-16 px-4">
    <div className="w-full max-w-xl animate-in fade-in duration-300">
      <div className="relative bg-white/70 backdrop-blur shadow-xl rounded-2xl border border-indigo-100 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-500" />
        <div className="px-8 pb-10 -mt-14">
          <div className="flex flex-col items-center text-center">
            <div className="w-28 h-28 rounded-full ring-4 ring-white shadow-md bg-gradient-to-br from-indigo-200 to-indigo-300 flex items-center justify-center">
              <div className="w-10 h-10 bg-indigo-300/70 rounded-full animate-pulse" />
            </div>
            <div className="mt-4 h-7 w-40 rounded bg-gray-200 animate-pulse" />
            <div className="mt-2 h-4 w-52 rounded bg-gray-200 animate-pulse" />
            <div className="mt-4 h-6 w-32 rounded-full bg-indigo-100 animate-pulse" />
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <div className="p-4 rounded-xl border border-gray-200 bg-white">
              <div className="h-3 w-14 bg-gray-200 rounded mb-3 animate-pulse" />
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="p-4 rounded-xl border border-gray-200 bg-white">
              <div className="h-3 w-16 bg-gray-200 rounded mb-3 animate-pulse" />
              <div className="h-5 w-44 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 justify-center">
            <div className="w-full sm:w-40 h-12 bg-rose-200 rounded-lg animate-pulse" />
            <div className="w-full sm:w-40 h-12 bg-gray-200 rounded-lg animate-pulse" />
          </div>
          <div className="mt-10 h-3 w-64 mx-auto bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  </div>
);

const ProfilePage: React.FC = () => {
  const router = useRouter();

  const { id } = useParams(); // Get the dynamic route parameter

  const [user, setUser] = useState<UserShape | null>(null);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  // Simulated loading (remove when you implement real fetch)
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      try {
        const response = await axios.get(`/api/user/${id}`, {
          signal: controller.signal,
        });
        if (isMounted) {
          setUser(response.data.user);
        }
      } catch (err) {
        if (!isMounted) return;
        if (axios.isAxiosError(err)) {
          if (err.code === "ERR_CANCELED") return; // aborted
          setError(
            err.response?.data?.message || err.message || "Request failed"
          );
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [id]);

  const handleLogout = async () => {
    try {
      const response = await axios.get("/api/logout");
      console.log("Logged out:", response.data);
      if (response.status === 200) {
        router.push("/login");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data?.message || "An unexpected error occurred.");
      }
    }
  };

  if (loading) return <ProfileSkeleton />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center py-16 px-4">
      {error && (
        <div className="absolute top-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong className="font-bold">Error:</strong> {error}
        </div>
      )}
      <div className="w-full max-w-xl">
        <div className="relative bg-white/80 backdrop-blur shadow-xl rounded-2xl border border-indigo-100 overflow-hidden">
          {/* Header Accent */}
          <div className="h-32 bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-500" />

          {/* Avatar Card */}
          <div className="px-8 pb-10 -mt-14">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <div className="w-28 h-28 rounded-full ring-4 ring-white shadow-md bg-gradient-to-br from-indigo-200 to-indigo-400 flex items-center justify-center text-3xl font-semibold text-white select-none">
                  {user?.name ? user.name.charAt(0) : "?"}
                </div>
              </div>
              <h1 className="mt-4 text-2xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-700 to-blue-600 bg-clip-text text-transparent">
                {user?.name}
              </h1>
              <p className="text-sm text-gray-500 mt-1">{user?.email}</p>

              {/* Status / Tagline Placeholder */}
              <p className="mt-4 text-xs uppercase tracking-wide text-indigo-600 font-medium bg-indigo-50 py-1 px-3 rounded-full">
                Member Profile
              </p>

              <p className="mt-3 text-black">
                Email Verified: {(user?.isVerified as boolean) ? "Yes" : "No"}
              </p>
            </div>

            {/* Info Grid */}
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              <div className="p-4 rounded-xl border border-gray-200 hover:border-indigo-300 transition-colors bg-white">
                <div className="text-[11px] font-medium tracking-wide text-gray-500 uppercase mb-1">
                  Name
                </div>
                <div className="font-semibold text-gray-800">{user?.name}</div>
              </div>

              <div className="p-4 rounded-xl border border-gray-200 hover:border-indigo-300 transition-colors bg-white break-all">
                <div className="text-[11px] font-medium tracking-wide text-gray-500 uppercase mb-1">
                  Email
                </div>
                <div className="font-semibold text-gray-800">{user?.email}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 justify-center">
              <button
                onClick={handleLogout}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-rose-700 focus:outline-none focus:ring-4 focus:ring-rose-300 active:scale-[.98] transition-all"
              >
                Logout
              </button>
              {/* <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 bg-white hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-indigo-200 active:scale-[.98] transition-all">
                Edit (stub)
              </button> */}
            </div>

            {/* Placeholder Footer */}
            <div className="mt-10 text-center text-[11px] text-gray-400 tracking-wide">
              <span>Customize this section later with more user fields.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
