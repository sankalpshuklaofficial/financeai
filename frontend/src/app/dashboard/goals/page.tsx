"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

interface Goal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
  icon: string;
  color: string;
  is_completed: boolean;
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "", target_amount: "", current_amount: "0",
    target_date: "", icon: "🎯", color: "#22c55e"
  });

  const fetchGoals = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data } = await supabase
      .from("savings_goals")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });
    setGoals(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchGoals(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase.from("savings_goals").insert({
      user_id: session.user.id,
      name: form.name,
      target_amount: parseFloat(form.target_amount),
      current_amount: parseFloat(form.current_amount),
      target_date: form.target_date || null,
      icon: form.icon,
      color: form.color,
    });

    if (error) { toast.error(error.message); return; }
    toast.success("Goal created!");
    setShowForm(false);
    fetchGoals();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("savings_goals").delete().eq("id", id);
    toast.success("Goal deleted!");
    fetchGoals();
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px", padding: "10px 14px",
    color: "white", width: "100%", outline: "none", fontFamily: "inherit",
  };

  const icons = ["🎯", "🏠", "🚗", "✈️", "📱", "💍", "🎓", "💰", "🏖️", "🏋️"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Savings Goals</h1>
          <p className="text-slate-400 text-sm mt-1">Track your financial targets</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 rounded-xl font-semibold text-white"
          style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", boxShadow: "0 0 20px rgba(34,197,94,0.3)" }}>
          {showForm ? "Cancel" : "+ New Goal"}
        </button>
      </div>

      {showForm && (
        <div className="glass rounded-2xl p-6 animate-slide-up">
          <h3 className="text-white font-semibold mb-4">Create Goal</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 text-sm mb-1 block">Goal Name</label>
              <input style={inputStyle} placeholder="e.g. New Laptop" required
                value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div>
              <label className="text-slate-400 text-sm mb-1 block">Target Amount (Rs.)</label>
              <input style={inputStyle} type="number" placeholder="50000" required
                value={form.target_amount}
                onChange={e => setForm({...form, target_amount: e.target.value})} />
            </div>
            <div>
              <label className="text-slate-400 text-sm mb-1 block">Already Saved (Rs.)</label>
              <input style={inputStyle} type="number" placeholder="0"
                value={form.current_amount}
                onChange={e => setForm({...form, current_amount: e.target.value})} />
            </div>
            <div>
              <label className="text-slate-400 text-sm mb-1 block">Target Date (optional)</label>
              <input style={inputStyle} type="date"
                value={form.target_date}
                onChange={e => setForm({...form, target_date: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="text-slate-400 text-sm mb-2 block">Choose Icon</label>
              <div className="flex gap-2 flex-wrap">
                {icons.map(icon => (
                  <button key={icon} type="button"
                    onClick={() => setForm({...form, icon})}
                    className="w-10 h-10 rounded-xl text-xl transition-all"
                    style={{
                      background: form.icon === icon ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.05)",
                      border: form.icon === icon ? "1px solid #22c55e" : "1px solid transparent"
                    }}>
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="w-full py-3 rounded-xl font-semibold text-white"
                style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}>
                Create Goal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="skeleton h-48 rounded-2xl" />)
        ) : goals.length === 0 ? (
          <div className="col-span-3 glass rounded-2xl p-16 text-center">
            <p className="text-4xl mb-3">⭐</p>
            <p className="text-slate-400">No goals yet — create your first one!</p>
          </div>
        ) : goals.map((g) => {
          const pct = Math.min(100, Math.round((g.current_amount / g.target_amount) * 100));
          return (
            <div key={g.id} className="glass rounded-2xl p-6 glass-hover">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ background: `${g.color}20` }}>
                    {g.icon}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{g.name}</h3>
                    {g.target_date && (
                      <p className="text-slate-500 text-xs">{g.target_date}</p>
                    )}
                  </div>
                </div>
                <button onClick={() => handleDelete(g.id)}
                  className="text-slate-600 hover:text-red-400 transition-colors">×</button>
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Progress</span>
                  <span style={{ color: g.color }}>
                    Rs.{g.current_amount.toLocaleString("en-IN")} / Rs.{g.target_amount.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="w-full rounded-full h-3" style={{ background: "rgba(255,255,255,0.1)" }}>
                  <div className="h-3 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, background: g.color }} />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-xs">
                  {pct === 100 ? "Goal achieved!" : `Rs.${(g.target_amount - g.current_amount).toLocaleString("en-IN")} remaining`}
                </span>
                <span className="font-bold text-lg" style={{ color: g.color }}>{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}