"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Tip { type: string; message: string; }
interface Anomaly { title: string; amount: number; date: string; severity: string; }
interface Forecast { month: string; predicted_amount: number; confidence: number; }

export default function AnalyticsPage() {
  const [insights, setInsights] = useState<{
    tips?: Tip[];
    anomalies?: Anomaly[];
    forecast?: { forecast?: Forecast[] };
  }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getInsights().then((data) => {
      setInsights(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const tipIcons: Record<string, string> = {
    warning: "⚠️", achievement: "🏆", tip: "💡", anomaly: "🚨", forecast: "📈"
  };

  const tipColors: Record<string, string> = {
    warning: "rgba(239,68,68,0.1)",
    achievement: "rgba(34,197,94,0.1)",
    tip: "rgba(99,102,241,0.1)",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">AI Analytics</h1>
        <p className="text-slate-400 text-sm mt-1">Machine learning insights from your data</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-48 rounded-2xl" />)}
        </div>
      ) : (
        <div className="space-y-6">

          {/* AI Tips */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-white font-semibold text-lg mb-4">💡 AI Insights</h3>
            {insights.tips && insights.tips.length > 0 ? (
              <div className="space-y-3">
                {insights.tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-xl"
                    style={{ background: tipColors[tip.type] || "rgba(255,255,255,0.03)" }}>
                    <span className="text-xl">{tipIcons[tip.type] || "💡"}</span>
                    <p className="text-slate-300 text-sm leading-relaxed">{tip.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-3xl mb-2">🤖</p>
                <p className="text-slate-400">Add more transactions to get AI insights</p>
              </div>
            )}
          </div>

          {/* Forecast */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-white font-semibold text-lg mb-4">📈 Expense Forecast</h3>
            {insights.forecast?.forecast && insights.forecast.forecast.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {insights.forecast.forecast.map((f, i) => (
                  <div key={i} className="p-4 rounded-xl text-center"
                    style={{ background: "rgba(255,255,255,0.03)" }}>
                    <p className="text-slate-400 text-sm mb-1">{f.month}</p>
                    <p className="text-white font-bold text-xl">
                      Rs.{f.predicted_amount.toLocaleString("en-IN")}
                    </p>
                    <div className="mt-2 flex items-center justify-center gap-1">
                      <div className="w-2 h-2 rounded-full"
                        style={{ background: f.confidence > 0.7 ? "#22c55e" : "#f59e0b" }} />
                      <p className="text-slate-500 text-xs">
                        {Math.round(f.confidence * 100)}% confidence
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-3xl mb-2">📊</p>
                <p className="text-slate-400">Need more transaction history for forecasting</p>
              </div>
            )}
          </div>

          {/* Anomalies */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-white font-semibold text-lg mb-4">🚨 Unusual Transactions</h3>
            {insights.anomalies && insights.anomalies.length > 0 ? (
              <div className="space-y-3">
                {insights.anomalies.map((a, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl"
                    style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.1)" }}>
                    <span className="text-2xl">{a.severity === "high" ? "🔴" : "🟡"}</span>
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">{a.title}</p>
                      <p className="text-slate-500 text-xs">{a.date}</p>
                    </div>
                    <p className="text-red-400 font-bold">
                      Rs.{a.amount.toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-3xl mb-2">✅</p>
                <p className="text-slate-400">No unusual transactions detected</p>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}