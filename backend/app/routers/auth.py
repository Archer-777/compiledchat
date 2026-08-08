from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
import uuid
import math

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

class FaceRegisterRequest(BaseModel):
    embedding: List[float]  # 128-D vector

class FaceLoginRequest(BaseModel):
    embedding: List[float]  # 128-D vector

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    if not credentials:
        return {"sub": "guest-user-0000-0000", "email": "guest@nextarcher.com", "first_name": "Guest"}
    payload = decode_access_token(credentials.credentials)
    if not payload:
        return {"sub": "guest-user-0000-0000", "email": "guest@nextarcher.com", "first_name": "Guest"}
    return payload

def euclidean_distance(v1: List[float], v2: List[float]) -> float:
    """Calculates L2 Euclidean distance between two 128-D vectors."""
    if len(v1) != len(v2):
        return float('inf')
    return math.sqrt(sum((a - b) ** 2 for a, b in zip(v1, v2)))

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
        client.from_("user_dashboard").upsert([{
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
        }], on_conflict="user_id").execute()

        # Insert default digital twin entry
        client.from_("digital_twins").upsert([{
            "user_id": user_id,
            "twin_name": twin_name,
            "bw_filter": "dramatic",
            "sacred_ring": "halo",
            "glow_intensity": 85
        }], on_conflict="user_id").execute()
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

@router.post("/face-register")
def register_face_descriptor(req: FaceRegisterRequest, current_user: dict = Depends(get_current_user)):
    client = get_supabase_client()
    user_id = current_user["sub"]

    if len(req.embedding) != 128:
        raise HTTPException(status_code=400, detail="Face descriptor must be a 128-D Float32 vector array")

    if client:
        client.from_("face_descriptors").upsert([{
            "user_id": user_id,
            "embedding": req.embedding,
            "device": "web"
        }], on_conflict="user_id").execute()
    else:
        mock_face_db[user_id] = req.embedding

    return {"status": "success", "message": "Facial biometric profile saved successfully", "user_id": user_id}

@router.post("/face-login", response_model=AuthResponse)
def face_login(req: FaceLoginRequest):
    if len(req.embedding) != 128:
        raise HTTPException(status_code=400, detail="Face descriptor must be a 128-D Float32 vector array")

    client = get_supabase_client()
    matched_user_id = None
    MATCH_THRESHOLD = 0.6

    if client:
        # 1. Try RPC match function
        try:
            rpc_res = client.rpc("match_face_descriptor", {
                "query_embedding": req.embedding,
                "match_threshold": MATCH_THRESHOLD
            }).execute()

            if rpc_res.data and len(rpc_res.data) > 0:
                matched_user_id = rpc_res.data[0]["user_id"]
        except Exception as e:
            print(f"[Face Login RPC Error]: {e}")

        # 2. Fallback to direct query if RPC yielded no match
        if not matched_user_id:
            try:
                faces_res = client.from_("face_descriptors").select("user_id, embedding").execute()
                if faces_res.data:
                    best_dist = float('inf')
                    for row in faces_res.data:
                        raw_emb = row.get("embedding")
                        emb = None
                        if isinstance(raw_emb, list):
                            emb = raw_emb
                        elif isinstance(raw_emb, str):
                            import json
                            try:
                                emb = json.loads(raw_emb)
                            except Exception:
                                pass
                        
                        if isinstance(emb, list) and len(emb) == 128:
                            dist = euclidean_distance(req.embedding, emb)
                            if dist < MATCH_THRESHOLD and dist < best_dist:
                                best_dist = dist
                                matched_user_id = row["user_id"]
            except Exception as err:
                print(f"[Face Login Table Select Error]: {err}")
    else:
        # Fallback to mock face DB
        best_dist = float('inf')
        for u_id, emb in mock_face_db.items():
            dist = euclidean_distance(req.embedding, emb)
            if dist < MATCH_THRESHOLD and dist < best_dist:
                best_dist = dist
                matched_user_id = u_id

    if not matched_user_id:
        raise HTTPException(status_code=401, detail="Facial biometric match failed. Face not recognized.")

    # Fetch user info for JWT token creation
    user_row = None
    if client:
        u_res = client.from_("users").select("*").eq("id", matched_user_id).execute()
        if u_res.data:
            user_row = u_res.data[0]
    else:
        for u in mock_users_db.values():
            if u.get("id") == matched_user_id:
                user_row = u
                break

    if not user_row:
        user_row = {"id": matched_user_id, "email": "user@nextarcher.com", "first_name": "User", "last_name": ""}

    token = create_access_token({"sub": user_row["id"], "email": user_row.get("email"), "first_name": user_row.get("first_name")})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_row["id"],
            "email": user_row.get("email"),
            "first_name": user_row.get("first_name"),
            "last_name": user_row.get("last_name")
        }
    }

@router.get("/me")
def get_user_profile(current_user: dict = Depends(get_current_user)):
    return {"user": current_user}

@router.get("/digital-twin-name")
def get_digital_twin_name(name: Optional[str] = None, email: Optional[str] = None):
    raw_name = name or email or ""
    if not raw_name:
        client = get_supabase_client()
        if client:
            try:
                res = client.from_("users").select("first_name, last_name, email").limit(1).execute()
                if res.data and len(res.data) > 0:
                    raw_name = res.data[0].get("first_name") or (res.data[0].get("email", "").split("@")[0])
            except Exception:
                pass
    clean_name = (raw_name or "Archer").strip().split(" ")[0]
    twin_name = f"{clean_name}_2.0"
    return {"success": True, "twinName": twin_name, "userName": clean_name}
