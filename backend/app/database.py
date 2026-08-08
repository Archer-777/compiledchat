from supabase import create_client, Client
from app.config import settings

def get_supabase_client() -> Client:
    """
    Returns a configured Supabase client using the service role key
    to allow the backend full admin access for custom user management.
    """
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        print("[WARNING] Supabase credentials missing from environment. Operating in mock mode.")
        return None
    try:
        return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
    except Exception as e:
        print(f"[ERROR] Failed to initialize Supabase client: {e}")
        return None

supabase_db = get_supabase_client()
