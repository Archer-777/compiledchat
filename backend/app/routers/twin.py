from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional
from app.routers.auth import get_current_user
from app.database import get_supabase_client

router = APIRouter(prefix="/twin", tags=["Digital Twin"])

class UpdateTwinRequest(BaseModel):
    photo_url: Optional[str] = None
    bw_filter: Optional[str] = "dramatic"
    sacred_ring: Optional[str] = "halo"
    glow_intensity: Optional[int] = Field(default=85, ge=0, le=100)

class RunTaskRequest(BaseModel):
    session_id: str
    message: str

@router.get("/profile")
def get_twin_profile(current_user: dict = Depends(get_current_user)):
    client = get_supabase_client()
    user_id = current_user["sub"]
    first_name = current_user.get("first_name", "User")
    expected_twin_name = f"{first_name}_2.0"

    twin_data = None
    if client:
        res = client.from_("digital_twins").select("*").eq("user_id", user_id).execute()
        if res.data and len(res.data) > 0:
            twin_data = res.data[0]

    if not twin_data:
        twin_data = {
            "user_id": user_id,
            "twin_name": expected_twin_name,
            "photo_url": None,
            "bw_filter": "dramatic",
            "sacred_ring": "halo",
            "glow_intensity": 85
        }

    return {"twin": twin_data}

@router.put("/profile")
def update_twin_profile(req: UpdateTwinRequest, current_user: dict = Depends(get_current_user)):
    client = get_supabase_client()
    user_id = current_user["sub"]
    first_name = current_user.get("first_name", "User")
    expected_twin_name = f"{first_name}_2.0"

    payload = {
        "user_id": user_id,
        "twin_name": expected_twin_name,  # Enforce FirstName_2.0 rule
        "photo_url": req.photo_url,
        "bw_filter": req.bw_filter,
        "sacred_ring": req.sacred_ring,
        "glow_intensity": req.glow_intensity
    }

    if client:
        client.from_("digital_twins").upsert([payload], on_conflict="user_id").execute()

    return {"status": "updated", "twin": payload}

# Digital Twin Agent Execution Endpoint (/runs pattern)
@router.post("/runs")
def enqueue_agent_run(req: RunTaskRequest, current_user: dict = Depends(get_current_user)):
    import uuid
    run_id = f"run_{uuid.uuid4().hex}"
    return {
        "run_id": run_id,
        "status": "queued",
        "session_id": req.session_id,
        "message": req.message
    }
