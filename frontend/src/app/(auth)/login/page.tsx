"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Welcome back!");
      router.push("/dashboard");
    }
    setLoading(false);
  };

  return (
    <div className="glass rounded-2xl p-8 animate-slide-up">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 glow-green"
          style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}>
          <span className="text-2xl">💰</span>
        </div>
        <h1 className="text-3xl font-bold text-white text-glow">FinanceAI</h1>
        <p className="text-slate-400 mt-1 text-sm">Smart money, smarter decisions</p>
      </div>

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 outline-none transition-all duration-200"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
            onFocus={(e) => e.target.style.borderColor = "rgba(34,197,94,0.5)"}
            onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 outline-none transition-all duration-200"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
            onFocus={(e) => e.target.style.borderColor = "rgba(34,197,94,0.5)"}
            onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200 mt-2"
          style={{
            background: loading
              ? "rgba(34,197,94,0.5)"
              : "linear-gradient(135deg, #22c55e, #16a34a)",
            boxShadow: loading ? "none" : "0 0 20px rgba(34,197,94,0.3)",
          }}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="text-center text-slate-400 mt-6 text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/register"
          className="text-green-400 hover:text-green-300 font-medium transition-colors">
          Sign up free
        </Link>
      </p>
    </div>
  );
}