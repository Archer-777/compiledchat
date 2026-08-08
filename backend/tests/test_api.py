from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/healthz")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_register_and_auth_flow():
    # 1. Register User
    reg_payload = {
        "first_name": "TestPriya",
        "last_name": "Manna",
        "age": 20,
        "gender": "female",
        "profession": "Student",
        "phone": "9130324670",
        "email": "testpriya@nextarcher.com",
        "password": "securepassword123"
    }
    reg_res = client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_res.status_code == 200
    data = reg_res.json()
    assert "access_token" in data
    assert data["user"]["first_name"] == "TestPriya"
    assert data["user"]["twin_name"] == "TestPriya_2.0"

    token = data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Get Profile (/auth/me)
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["user"]["first_name"] == "TestPriya"

    # 3. Create Chat Session
    sess_res = client.post("/api/v1/chat/sessions", json={"title": "Morning Alignment"}, headers=headers)
    assert sess_res.status_code == 200
    session_id = sess_res.json()["session"]["id"]

    # 4. Post Message (Phase 1 Mock)
    msg_res = client.post(f"/api/v1/chat/sessions/{session_id}/messages", json={"message": "Today I feel happy."}, headers=headers)
    assert msg_res.status_code == 200
    assert "reply" in msg_res.json()

    # 5. End Session & Auto-Analyze
    end_res = client.post(f"/api/v1/chat/sessions/{session_id}/end", headers=headers)
    assert end_res.status_code == 200
    assert end_res.json()["analysis"]["weak_chakra"] == "heart"

    # 6. Fetch Dashboard Telemetry
    telem_res = client.get("/api/v1/dashboard/telemetry", headers=headers)
    assert telem_res.status_code == 200
    assert telem_res.json()["karma_rating"] == 90

    # 7. Update World Balance Sliders (Instant Recomputation)
    wb_res = client.post("/api/v1/dashboard/world-balance", json={"business_pct": 80, "family_pct": 90, "friend_pct": 60}, headers=headers)
    assert wb_res.status_code == 200
    maslow = wb_res.json()["maslow_matrix"]
    assert maslow["physiological"] == 79.0
    assert maslow["safety_order"] == 85.0

    # 8. Digital Twin Profile (Rule: FirstName_2.0)
    twin_res = client.get("/api/v1/twin/profile", headers=headers)
    assert twin_res.status_code == 200
    assert twin_res.json()["twin"]["twin_name"] == "TestPriya_2.0"
