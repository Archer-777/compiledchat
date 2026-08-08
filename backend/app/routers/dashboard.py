from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from app.routers.auth import get_current_user
from app.database import get_supabase_client

router = APIRouter(prefix="/dashboard", tags=["Dashboard & Telemetry"])

class WorldBalanceRequest(BaseModel):
    business_pct: float = Field(ge=0, le=100)
    family_pct: float = Field(ge=0, le=100)
    friend_pct: float = Field(ge=0, le=100)

def recompute_maslow_matrix(biz: float, fam: float, fri: float) -> dict:
    """
    Instant Model Recomputation Algorithm for Maslow's Hierarchy of Needs:
    - Physiological (85% base weight from family & friend stability)
    - Safety & Order (70% base weight from business & family security)
    - Belonging (65% base weight from family & friend social harmony)
    - Self-Esteem (80% base weight from business achievement)
    - Actualization (50% base weight from overall balance index)
    """
    overall_balance = (biz + fam + fri) / 3.0
    
    phys = min(100.0, round(0.5 * fam + 0.4 * fri + 10.0, 1))
    safety = min(100.0, round(0.6 * biz + 0.3 * fam + 10.0, 1))
    belonging = min(100.0, round(0.5 * fam + 0.5 * fri, 1))
    esteem = min(100.0, round(0.7 * biz + 0.2 * fam + 10.0, 1))
    actualization = min(100.0, round(0.4 * overall_balance + 20.0, 1))

    return {
        "physiological": phys,
        "safety_order": safety,
        "belonging": belonging,
        "self_esteem": esteem,
        "actualization": actualization
    }

@router.get("/telemetry")
def get_telemetry(current_user: dict = Depends(get_current_user)):
    client = get_supabase_client()
    user_id = current_user["sub"]

    dash_data = None
    latest_analysis = None

    if client:
        # Fetch user dashboard data
        d_res = client.from_("user_dashboard").select("*").eq("user_id", user_id).execute()
        if d_res.data and len(d_res.data) > 0:
            dash_data = d_res.data[0]
            
        # Fetch latest session analysis for chakra glow & weak chakra
        a_res = client.from_("session_analysis").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(1).execute()
        if a_res.data and len(a_res.data) > 0:
            latest_analysis = a_res.data[0]

    # Defaults if no DB record
    karma_rating = dash_data.get("karma_rating", 90) if dash_data else 90
    veto_status = dash_data.get("veto_status", "Safe + No Burnout") if dash_data else "Safe + No Burnout"
    
    world_bal = {
        "business_pct": dash_data.get("world_business_pct", 80) if dash_data else 80,
        "family_pct": dash_data.get("world_family_pct", 90) if dash_data else 90,
        "friend_pct": dash_data.get("world_friend_pct", 60) if dash_data else 60,
    }

    maslow = {
        "physiological": dash_data.get("maslow_physiological", 85) if dash_data else 85,
        "safety_order": dash_data.get("maslow_safety_order", 70) if dash_data else 70,
        "belonging": dash_data.get("maslow_belonging", 65) if dash_data else 65,
        "self_esteem": dash_data.get("maslow_self_esteem", 80) if dash_data else 80,
        "actualization": dash_data.get("maslow_actualization", 50) if dash_data else 50,
    }

    growth_consciousness = {
        "collective_intelligence_index": latest_analysis.get("collective_intelligence_index", 40) if latest_analysis else 40,
        "global_consciousness_score": latest_analysis.get("global_consciousness_score", 60) if latest_analysis else 60,
        "balanced_thinking_ratio": latest_analysis.get("balanced_talking_ratio", 90) if latest_analysis else 90,
    }

    chakra_glows = latest_analysis.get("chakra_glow_levels", {
        "root": 75, "sacral": 80, "solar_plexus": 65, "heart": 45, "throat": 90, "third_eye": 85, "crown": 95
    }) if latest_analysis else {
        "root": 75, "sacral": 80, "solar_plexus": 65, "heart": 45, "throat": 90, "third_eye": 85, "crown": 95
    }

    weak_chakra = latest_analysis.get("weak_chakra", "heart") if latest_analysis else "heart"

    return {
        "karma_rating": karma_rating,
        "veto_status": veto_status,
        "world_balance": world_bal,
        "maslow_matrix": maslow,
        "growth_consciousness": growth_consciousness,
        "chakra_glow_levels": chakra_glows,
        "weak_chakra": weak_chakra
    }

@router.post("/world-balance")
def update_world_balance(req: WorldBalanceRequest, current_user: dict = Depends(get_current_user)):
    client = get_supabase_client()
    user_id = current_user["sub"]

    # Recompute Maslow Matrix instantly
    recomputed_maslow = recompute_maslow_matrix(req.business_pct, req.family_pct, req.friend_pct)

    dash_update = {
        "user_id": user_id,
        "world_business_pct": req.business_pct,
        "world_family_pct": req.family_pct,
        "world_friend_pct": req.friend_pct,
        "maslow_physiological": recomputed_maslow["physiological"],
        "maslow_safety_order": recomputed_maslow["safety_order"],
        "maslow_belonging": recomputed_maslow["belonging"],
        "maslow_self_esteem": recomputed_maslow["self_esteem"],
        "maslow_actualization": recomputed_maslow["actualization"]
    }

    if client:
        client.from_("user_dashboard").upsert([dash_update], on_conflict="user_id").execute()

    return {
        "world_balance": {
            "business_pct": req.business_pct,
            "family_pct": req.family_pct,
            "friend_pct": req.friend_pct
        },
        "maslow_matrix": recomputed_maslow
    }
