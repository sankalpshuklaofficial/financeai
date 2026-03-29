"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  period: string;
  alert_threshold: number;
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "", amount: "", period: "monthly", alert_threshold: "80"
  });

  const fetchBudgets = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data } = await supabase
      .from("budgets")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });
    setBudgets(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchBudgets(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase.from("budgets").insert({
      user_id: session.user.id,
      name: form.name,
      amount: parseFloat(form.amount),
      period: form.period,
      alert_threshold: parseFloat(form.alert_threshold),
      start_date: new Date().toISOString().split("T")[0],
      spent: 0,
    });

    if (error) { toast.error(error.message); return; }
    toast.success("Budget created!");
    setShowForm(false);
    setForm({ name: "", amount: "", period: "monthly", alert_threshold: "80" });
    fetchBudgets();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("budgets").delete().eq("id", id);
    toast.success("Budget deleted!");
    fetchBudgets();
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px", padding: "10px 14px",
    color: "white", width: "100%", outline: "none", fontFamily: "inherit",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Budgets</h1>
          <p className="text-slate-400 text-sm mt-1">Track your spending limits</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 rounded-xl font-semibold text-white"
          style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", boxShadow: "0 0 20px rgba(34,197,94,0.3)" }}>
          {showForm ? "Cancel" : "+ New Budget"}
        </button>
      </div>

      {showForm && (
        <div className="glass rounded-2xl p-6 animate-slide-up">
          <h3 className="text-white font-semibold mb-4">Create Budget</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 text-sm mb-1 block">Budget Name</label>
              <input style={inputStyle} placeholder="e.g. Food & Dining" required
                value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div>
              <label className="text-slate-400 text-sm mb-1 block">Limit Amount (Rs.)</label>
              <input style={inputStyle} type="number" placeholder="5000" required
                value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
            </div>
            <div>
              <label className="text-slate-400 text-sm mb-1 block">Period</label>
              <select style={inputStyle} value={form.period}
                onChange={e => setForm({...form, period: e.target.value})}>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-sm mb-1 block">Alert at (%)</label>
              <input style={inputStyle} type="number" placeholder="80" min="1" max="100"
                value={form.alert_threshold}
                onChange={e => setForm({...form, alert_threshold: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="w-full py-3 rounded-xl font-semibold text-white"
                style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}>
                Create Budget
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="skeleton h-48 rounded-2xl" />)
        ) : budgets.length === 0 ? (
          <div className="col-span-3 glass rounded-2xl p-16 text-center">
            <p className="text-4xl mb-3">🎯</p>
            <p className="text-slate-400">No budgets yet — create one above!</p>
          </div>
        ) : budgets.map((b) => {
          const pct = Math.min(100, Math.round((b.spent / b.amount) * 100));
          const isOver = pct >= 100;
          const isAlert = pct >= b.alert_threshold;
          const barColor = isOver ? "#ef4444" : isAlert ? "#f59e0b" : "#22c55e";

          return (
            <div key={b.id} className="glass rounded-2xl p-6 glass-hover">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">{b.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded-full text-slate-400"
                    style={{ background: "rgba(255,255,255,0.05)" }}>
                    {b.period}
                  </span>
                  <button onClick={() => handleDelete(b.id)}
                    className="text-slate-600 hover:text-red-400 transition-colors">×</button>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Spent</span>
                  <span style={{ color: barColor }}>
                    Rs.{b.spent.toLocaleString("en-IN")} / Rs.{b.amount.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="w-full rounded-full h-2" style={{ background: "rgba(255,255,255,0.1)" }}>
                  <div className="h-2 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, background: barColor }} />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-xs">
                  {isOver ? "Over budget!" : `${100 - pct}% remaining`}
                </span>
                <span className="font-bold text-lg" style={{ color: barColor }}>{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}