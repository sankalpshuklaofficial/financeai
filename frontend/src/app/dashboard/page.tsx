"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Transaction } from "@/types";

const statCards = [
  { label: "Total Balance", key: "balance", icon: "💰", color: "#22c55e", prefix: "₹" },
  { label: "Monthly Income", key: "income", icon: "📈", color: "#3b82f6", prefix: "₹" },
  { label: "Monthly Expense", key: "expense", icon: "📉", color: "#ef4444", prefix: "₹" },
  { label: "Savings Rate", key: "savings", icon: "🎯", color: "#f59e0b", suffix: "%" },
];

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from("transactions")
        .select("*, category:categories(*)")
        .eq("user_id", session.user.id)
        .order("date", { ascending: false })
        .limit(10);

      setTransactions(data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const monthlyIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpense = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const savingsRate = monthlyIncome > 0
    ? Math.round(((monthlyIncome - monthlyExpense) / monthlyIncome) * 100)
    : 0;

  const stats = {
    balance: monthlyIncome - monthlyExpense,
    income: monthlyIncome,
    expense: monthlyExpense,
    savings: savingsRate,
  };

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <div key={i} className="glass rounded-2xl p-6 glass-hover">
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">{card.icon}</span>
              <div className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: card.color }} />
            </div>
            <p className="text-slate-400 text-sm mb-1">{card.label}</p>
            {loading ? (
              <div className="skeleton h-8 w-32" />
            ) : (
              <p className="text-2xl font-bold text-white">
                {card.prefix || ""}
                {stats[card.key as keyof typeof stats].toLocaleString("en-IN")}
                {card.suffix || ""}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-semibold text-lg">Recent Transactions</h3>
          <span className="text-slate-500 text-sm">{transactions.length} total</span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton h-16 w-full" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-slate-400">No transactions yet</p>
            <p className="text-slate-600 text-sm mt-1">Upload a CSV or add manually</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((t) => (
              <div key={t.id}
                className="flex items-center gap-4 p-4 rounded-xl glass-hover"
                style={{ background: "rgba(255,255,255,0.02)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style={{ background: "rgba(255,255,255,0.05)" }}>
                  {t.category?.icon || "💳"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">{t.title}</p>
                  <p className="text-slate-500 text-xs">{t.date}</p>
                </div>
                <p className={`font-bold text-sm ${t.type === "income" ? "text-green-400" : "text-red-400"}`}>
                  {t.type === "income" ? "+" : "-"}₹{t.amount.toLocaleString("en-IN")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
