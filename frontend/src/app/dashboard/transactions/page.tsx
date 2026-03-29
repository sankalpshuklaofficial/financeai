"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Transaction } from "@/types";
import toast from "react-hot-toast";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "", amount: "", type: "expense", date: new Date().toISOString().split("T")[0], description: ""
  });

  const fetchTransactions = async () => {
    const data = await api.getTransactions();
    setTransactions(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchTransactions(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await api.createTransaction(form);
    if (result.id) {
      toast.success("Transaction added!");
      setShowForm(false);
      setForm({ title: "", amount: "", type: "expense", date: new Date().toISOString().split("T")[0], description: "" });
      fetchTransactions();
    } else {
      toast.error(result.error || "Failed to add");
    }
  };

  const handleDelete = async (id: string) => {
    await api.deleteTransaction(id);
    toast.success("Deleted!");
    fetchTransactions();
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    padding: "10px 14px",
    color: "white",
    width: "100%",
    outline: "none",
    fontFamily: "inherit",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Transactions</h1>
          <p className="text-slate-400 text-sm mt-1">{transactions.length} total records</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 rounded-xl font-semibold text-white transition-all"
          style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", boxShadow: "0 0 20px rgba(34,197,94,0.3)" }}>
          {showForm ? "Cancel" : "+ Add Transaction"}
        </button>
      </div>

      {showForm && (
        <div className="glass rounded-2xl p-6 animate-slide-up">
          <h3 className="text-white font-semibold mb-4">New Transaction</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 text-sm mb-1 block">Title</label>
              <input style={inputStyle} placeholder="e.g. Grocery shopping" required
                value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
            </div>
            <div>
              <label className="text-slate-400 text-sm mb-1 block">Amount (Rs.)</label>
              <input style={inputStyle} type="number" placeholder="0.00" required min="0"
                value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
            </div>
            <div>
              <label className="text-slate-400 text-sm mb-1 block">Type</label>
              <select style={inputStyle}
                value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
                <option value="transfer">Transfer</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-sm mb-1 block">Date</label>
              <input style={inputStyle} type="date" required
                value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="text-slate-400 text-sm mb-1 block">Description (optional)</label>
              <input style={inputStyle} placeholder="Add notes..."
                value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="w-full py-3 rounded-xl font-semibold text-white"
                style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}>
                Save Transaction
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="glass rounded-2xl p-6">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16 w-full" />)}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-slate-400">No transactions yet</p>
            <p className="text-slate-600 text-sm mt-1">Add one above or upload a CSV</p>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((t) => (
              <div key={t.id} className="flex items-center gap-4 p-4 rounded-xl glass-hover"
                style={{ background: "rgba(255,255,255,0.02)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style={{ background: "rgba(255,255,255,0.05)" }}>
                  {t.category?.icon || (t.type === "income" ? "💰" : "💳")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm">{t.title}</p>
                  <p className="text-slate-500 text-xs">{t.date} · {t.source}</p>
                </div>
                <p className={`font-bold ${t.type === "income" ? "text-green-400" : "text-red-400"}`}>
                  {t.type === "income" ? "+" : "-"}Rs.{Number(t.amount).toLocaleString("en-IN")}
                </p>
                <button onClick={() => handleDelete(t.id)}
                  className="text-slate-600 hover:text-red-400 transition-colors ml-2 text-lg">
                  x
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}