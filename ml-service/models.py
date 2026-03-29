import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def prepare_dataframe(transactions: list) -> pd.DataFrame:
    if not transactions:
        return pd.DataFrame()
    
    df = pd.DataFrame(transactions)
    df['date'] = pd.to_datetime(df['date'])
    df['amount'] = pd.to_numeric(df['amount'], errors='coerce').fillna(0)
    df['month'] = df['date'].dt.to_period('M')
    return df

def forecast_expenses(transactions: list) -> dict:
    df = prepare_dataframe(transactions)
    
    if df.empty:
        return {"forecast": [], "message": "No data available"}
    
    expenses = df[df['type'] == 'expense'].copy()
    
    if expenses.empty:
        return {"forecast": [], "message": "No expense data"}
    
    monthly = expenses.groupby('month')['amount'].sum().reset_index()
    monthly['month_str'] = monthly['month'].astype(str)
    
    if len(monthly) < 2:
        avg = monthly['amount'].mean()
        forecasts = []
        for i in range(1, 4):
            future_date = datetime.now() + timedelta(days=30*i)
            forecasts.append({
                "month": future_date.strftime("%Y-%m"),
                "predicted_amount": round(avg, 2),
                "confidence": 0.6
            })
        return {"forecast": forecasts}
    
    amounts = monthly['amount'].values
    x = np.arange(len(amounts))
    
    # Linear regression
    coeffs = np.polyfit(x, amounts, 1)
    trend = np.poly1d(coeffs)
    
    forecasts = []
    for i in range(1, 4):
        future_x = len(amounts) + i - 1
        predicted = max(0, float(trend(future_x)))
        future_date = datetime.now() + timedelta(days=30*i)
        forecasts.append({
            "month": future_date.strftime("%Y-%m"),
            "predicted_amount": round(predicted, 2),
            "confidence": round(max(0.5, 0.9 - i * 0.1), 2)
        })
    
    return {
        "forecast": forecasts,
        "historical": [
            {"month": row['month_str'], "amount": round(row['amount'], 2)}
            for _, row in monthly.iterrows()
        ]
    }

def detect_anomalies(transactions: list) -> list:
    df = prepare_dataframe(transactions)
    
    if df.empty or len(df) < 5:
        return []
    
    expenses = df[df['type'] == 'expense'].copy()
    
    if expenses.empty:
        return []
    
    mean = expenses['amount'].mean()
    std = expenses['amount'].std()
    
    if std == 0:
        return []
    
    anomalies = []
    for _, row in expenses.iterrows():
        z_score = abs((row['amount'] - mean) / std)
        if z_score > 2:
            anomalies.append({
                "id": row.get('id', ''),
                "title": row.get('title', 'Transaction'),
                "amount": float(row['amount']),
                "date": str(row['date'].date()),
                "z_score": round(float(z_score), 2),
                "severity": "high" if z_score > 3 else "medium"
            })
    
    return sorted(anomalies, key=lambda x: x['z_score'], reverse=True)[:5]

def get_category_insights(transactions: list) -> list:
    df = prepare_dataframe(transactions)
    
    if df.empty:
        return []
    
    expenses = df[df['type'] == 'expense'].copy()
    
    if expenses.empty:
        return []
    
    total = expenses['amount'].sum()
    
    if 'category_id' not in expenses.columns:
        return []
    
    category_totals = expenses.groupby('category_id')['amount'].sum()
    
    insights = []
    for cat_id, amount in category_totals.items():
        percentage = (amount / total * 100) if total > 0 else 0
        insights.append({
            "category_id": cat_id,
            "total_amount": round(float(amount), 2),
            "percentage": round(float(percentage), 1)
        })
    
    return sorted(insights, key=lambda x: x['total_amount'], reverse=True)

def generate_tips(transactions: list) -> list:
    df = prepare_dataframe(transactions)
    tips = []
    
    if df.empty:
        return [{"type": "tip", "message": "Add your first transaction to get AI insights!"}]
    
    expenses = df[df['type'] == 'expense']
    income = df[df['type'] == 'income']
    
    total_expense = expenses['amount'].sum()
    total_income = income['amount'].sum()
    
    if total_income > 0:
        savings_rate = ((total_income - total_expense) / total_income) * 100
        if savings_rate < 20:
            tips.append({
                "type": "warning",
                "message": f"Your savings rate is {savings_rate:.1f}%. Try to save at least 20% of income."
            })
        elif savings_rate > 40:
            tips.append({
                "type": "achievement",
                "message": f"Excellent! You are saving {savings_rate:.1f}% of your income!"
            })
    
    if len(expenses) > 5:
        avg_transaction = expenses['amount'].mean()
        tips.append({
            "type": "tip",
            "message": f"Your average expense is Rs.{avg_transaction:.0f}. Track recurring ones to find savings."
        })
    
    if not tips:
        tips.append({
            "type": "tip",
            "message": "Keep logging transactions consistently for better AI insights!"
        })
    
    return tips