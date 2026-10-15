# supabase_client.py
# this file makes the supabase client available to the rest of the backend code
import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

url = os.getenv("SUPABASE_URL")
db_key = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, db_key)