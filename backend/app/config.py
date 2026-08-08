import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Load environment variables from backend/.env explicitly
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
load_dotenv(env_path, override=True)

class Settings(BaseSettings):
    PROJECT_NAME: str = "NextArcher API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Supabase Credentials
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://qwmnyomlfchazapkohfy.supabase.co")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    
    # JWT Security Configuration
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "nextarcher_super_secret_jwt_key_2026_change_in_prod")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Groq AI Engine Credentials
    GROK_API_KEY: str = os.getenv("GROK_API_KEY") or os.getenv("GROQ_API_KEY") or ""
    GROK_MODEL: str = os.getenv("GROK_MODEL", "llama-3.3-70b-versatile")

    # Fast2SMS Gateway Credentials
    FAST2SMS_API_KEY: str = os.getenv("FAST2SMS_API_KEY", "pjgNOCe9TSqQ5zwbIBsZFdkXaYGPVcuMyf2KR438niWvm1rDU0xjI24yBTlCuPVzeiOGwK1h9rQFApb7")

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
