"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

const navItems = [
  { href: "/dashboard", icon: "📊", label: "Dashboard" },
  { href: "/dashboard/transactions", icon: "💳", label: "Transactions" },
  { href: "/dashboard/budgets", icon: "🎯", label: "Budgets" },
  { href: "/dashboard/goals", icon: "⭐", label: "Goals" },
  { href: "/dashboard/analytics", icon: "🤖", label: "AI Analytics" },
  { href: "/dashboard/upload", icon: "📤", label: "Upload" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string; user_metadata?: { full_name?: string } } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/login");
      } else {
        setUser(session.user);
        setLoading(false);
      }
    });
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#020817" }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 animate-pulse"
            style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }} />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: "#020817" }}>
      {/* Sidebar */}
      <aside className="w-64 min-h-screen flex flex-col glass"
        style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}>

        {/* Logo */}
        <div className="p-6 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}>
              <span className="text-lg">💰</span>
            </div>
            <div>
              <h1 className="font-bold text-white text-lg">FinanceAI</h1>
              <p className="text-xs text-slate-500">Smart Finance</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white transition-all duration-200 glass-hover group">
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="p-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl glass mb-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}>
              {user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {user?.user_metadata?.full_name || "User"}
              </p>
              <p className="text-slate-500 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full px-4 py-2 rounded-xl text-slate-400 hover:text-red-400 text-sm transition-colors text-left">
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="sticky top-0 z-10 px-8 py-4 flex items-center justify-between glass"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <h2 className="text-white font-semibold">
            Welcome back, {user?.user_metadata?.full_name?.split(" ")[0] || "there"} 👋
          </h2>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-slate-400 text-sm">Live</span>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-8 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}