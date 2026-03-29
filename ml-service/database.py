import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_KEY")
)

def get_user_transactions(user_id: str):
    response = supabase.table("transactions")\
        .select("*")\
        .eq("user_id", user_id)\
        .order("date")\
        .execute()
    return response.data