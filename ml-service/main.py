from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv

from database import get_user_transactions, supabase
from models import (
    forecast_expenses,
    detect_anomalies,
    get_category_insights,
    generate_tips
)

load_dotenv()

app = FastAPI(title="FinanceAI ML Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5000", "https://*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def get_user_id(authorization: str = Header(None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="No token provided")
    
    token = authorization.split(" ")[1]
    response = supabase.auth.get_user(token)
    
    if not response.user:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    return response.user.id

@app.get("/")
def root():
    return {"message": "FinanceAI ML Service Running", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "OK", "service": "ML"}

@app.get("/api/ml/forecast")
async def forecast(authorization: str = Header(None)):
    user_id = await get_user_id(authorization)
    transactions = get_user_transactions(user_id)
    result = forecast_expenses(transactions)
    return result

@app.get("/api/ml/anomalies")
async def anomalies(authorization: str = Header(None)):
    user_id = await get_user_id(authorization)
    transactions = get_user_transactions(user_id)
    result = detect_anomalies(transactions)
    return {"anomalies": result, "count": len(result)}

@app.get("/api/ml/insights")
async def insights(authorization: str = Header(None)):
    user_id = await get_user_id(authorization)
    transactions = get_user_transactions(user_id)
    
    return {
        "forecast": forecast_expenses(transactions),
        "anomalies": detect_anomalies(transactions),
        "categories": get_category_insights(transactions),
        "tips": generate_tips(transactions)
    }

@app.get("/api/ml/tips")
async def tips(authorization: str = Header(None)):
    user_id = await get_user_id(authorization)
    transactions = get_user_transactions(user_id)
    result = generate_tips(transactions)
    return {"tips": result}