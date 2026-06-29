"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Register User
      const registerRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password, phoneNumber }),
      });

      const registerData = await registerRes.json();

      if (!registerRes.ok) {
        throw new Error(registerData.error || "Registration failed");
      }

      // 2. Auto Login after Registration
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginRes.json();

      if (!loginRes.ok) {
        throw new Error("Registration successful, but auto-login failed. Please sign in manually.");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-[480px] bg-white border border-slate-100 rounded-[32px] p-8 sm:p-10 shadow-[0_20px_40px_rgba(249,115,22,0.04)] my-8">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mb-6 shadow-sm">
            <span className="text-white font-bold text-2xl">D</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Create Account</h2>
          <p className="text-slate-500 text-sm">Unlock enterprise document extraction</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl p-4 flex gap-3 text-sm font-medium mb-6">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-[1.2px] ml-2">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              required
              disabled={loading}
              className="bg-slate-50 border border-slate-200 rounded-full text-slate-900 px-6 py-4 focus:outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all disabled:opacity-50"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-[1.2px] ml-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
              disabled={loading}
              className="bg-slate-50 border border-slate-200 rounded-full text-slate-900 px-6 py-4 focus:outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all disabled:opacity-50"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-[1.2px] ml-2">Phone Number (Optional)</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1 (555) 000-0000"
              disabled={loading}
              className="bg-slate-50 border border-slate-200 rounded-full text-slate-900 px-6 py-4 focus:outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all disabled:opacity-50"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-[1.2px] ml-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 chars, 1 uppercase, 1 number"
                required
                disabled={loading}
                className="w-full bg-slate-50 border border-slate-200 rounded-full text-slate-900 px-6 py-4 focus:outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all disabled:opacity-50 pr-16"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 font-medium text-sm px-2 py-1 focus:outline-none"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-4 rounded-full mt-2 shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-all disabled:opacity-70 hover:-translate-y-0.5 tracking-wide"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-slate-500 text-sm mt-8">
          Already have an account?{" "}
          <Link href="/auth/signin" className="text-slate-900 font-extrabold hover:text-slate-700 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
