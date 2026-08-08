from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
import uuid

from app.services.auth_service import hash_password, verify_password, create_access_token, decode_access_token
from app.database import get_supabase_client

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer(auto_error=False)

# In-memory mock storage if Supabase is offline
mock_users_db = {}
mock_face_db = {}

# Pydantic Schemas
class RegisterRequest(BaseModel):
    first_name: str
    last_name: str
    age: int = Field(ge=13, le=120)
    gender: str
    profession: str
    phone: str
    email: EmailStr
    password: str = Field(min_length=6)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class FaceLoginRequest(BaseModel):
    embedding: List[float]  # 128-D vector

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Bearer authentication token required")
    payload = decode_access_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired authentication token")
    return payload

@router.post("/register", response_model=AuthResponse)
def register_user(req: RegisterRequest):
    client = get_supabase_client()
    hashed_pwd = hash_password(req.password)
    user_id = str(uuid.uuid4())
    twin_name = f"{req.first_name}_2.0"

    user_payload = {
        "id": user_id,
        "email": req.email,
        "password_hash": hashed_pwd,
        "first_name": req.first_name,
        "last_name": req.last_name,
        "age": req.age,
        "gender": req.gender,
        "profession": req.profession,
        "phone": req.phone,
        "phone_verified": True,
        "email_verified": True
    }

    if client:
        # Check if email exists
        res = client.from_("users").select("id").eq("email", req.email).execute()
        if res.data and len(res.data) > 0:
            raise HTTPException(status_code=400, detail="User with this email already exists")
        
        # Insert user
        ins_res = client.from_("users").insert([user_payload]).execute()
        if not ins_res.data:
            raise HTTPException(status_code=500, detail="Failed to create user record")
        
        # Insert default dashboard entry
        client.from_("user_dashboard").insert([{
            "user_id": user_id,
            "karma_rating": 90,
            "veto_status": "Safe + No Burnout",
            "world_business_pct": 80,
            "world_family_pct": 90,
            "world_friend_pct": 60,
            "maslow_physiological": 85,
            "maslow_safety_order": 70,
            "maslow_belonging": 65,
            "maslow_self_esteem": 80,
            "maslow_actualization": 50
        }]).execute()

        # Insert default digital twin entry
        client.from_("digital_twins").insert([{
            "user_id": user_id,
            "twin_name": twin_name,
            "bw_filter": "dramatic",
            "sacred_ring": "halo",
            "glow_intensity": 85
        }]).execute()
    else:
        # Mock mode fallback
        if req.email in mock_users_db:
            raise HTTPException(status_code=400, detail="User already exists")
        mock_users_db[req.email] = user_payload

    token = create_access_token({"sub": user_id, "email": req.email, "first_name": req.first_name})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "email": req.email,
            "first_name": req.first_name,
            "last_name": req.last_name,
            "twin_name": twin_name
        }
    }

@router.post("/login", response_model=AuthResponse)
def login_user(req: LoginRequest):
    client = get_supabase_client()
    user_row = None

    if client:
        res = client.from_("users").select("*").eq("email", req.email).execute()
        if res.data and len(res.data) > 0:
            user_row = res.data[0]
    else:
        user_row = mock_users_db.get(req.email)

    if not user_row or not verify_password(req.password, user_row["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": user_row["id"], "email": user_row["email"], "first_name": user_row["first_name"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_row["id"],
            "email": user_row["email"],
            "first_name": user_row["first_name"],
            "last_name": user_row["last_name"]
        }
    }

@router.get("/me")
def get_user_profile(current_user: dict = Depends(get_current_user)):
    return {"user": current_user}
