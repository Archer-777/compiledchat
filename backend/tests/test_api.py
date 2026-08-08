from fastapi.testclient import TestClient
from app.main import app
import time

client = TestClient(app)

def test_health_check():
    response = client.get("/healthz")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_otp_send_and_verify():
    # 1. Send OTP
    phone = "9130324670"
    send_res = client.post("/api/v1/otp/send", json={"phone": phone})
    assert send_res.status_code == 200
    assert send_res.json()["success"] is True
    
    otp_code = send_res.json()["otp"]
    verify_code = otp_code if otp_code != "****" else "123456"
    
    # 2. Verify OTP (using returned OTP or dev bypass)
    verify_res = client.post("/api/v1/otp/verify", json={"phone": phone, "otp": verify_code})
    assert verify_res.status_code == 200
    assert verify_res.json()["valid"] is True

def test_full_application_flow():
    unique_email = f"testpriya_{int(time.time())}@nextarcher.com"
    reg_payload = {
        "first_name": "TestPriya",
        "last_name": "Manna",
        "age": 20,
        "gender": "female",
        "profession": "Student",
        "phone": "9130324670",
        "email": unique_email,
        "password": "securepassword123"
    }
    
    # 1. Register User
    reg_res = client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_res.status_code == 200
    data = reg_res.json()
    assert "access_token" in data
    assert data["user"]["first_name"] == "TestPriya"

    token = data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Register Face Descriptor (128-D Vector)
    mock_vector = [0.1] * 128
    face_reg_res = client.post("/api/v1/auth/face-register", json={"embedding": mock_vector}, headers=headers)
    assert face_reg_res.status_code == 200
    assert face_reg_res.json()["status"] == "success"

    # 3. Face Login Matching
    face_login_res = client.post("/api/v1/auth/face-login", json={"embedding": mock_vector})
    assert face_login_res.status_code == 200
    assert "access_token" in face_login_res.json()

    # 4. Create Chat Session
    sess_res = client.post("/api/v1/chat/sessions", json={"title": "Groq AI Alignment"}, headers=headers)
    assert sess_res.status_code == 200
    session_id = sess_res.json()["session"]["id"]

    # 5. Post Message (Groq AI Completion or Mock Fallback)
    msg_res = client.post(f"/api/v1/chat/sessions/{session_id}/messages", json={"message": "I am feeling happy today."}, headers=headers)
    assert msg_res.status_code == 200
    assert "reply" in msg_res.json()
    assert len(msg_res.json()["reply"]) > 0

    # 6. End Session & Auto-Analyze
    end_res = client.post(f"/api/v1/chat/sessions/{session_id}/end", headers=headers)
    assert end_res.status_code == 200
    assert end_res.json()["analysis"]["weak_chakra"] == "heart"

    # 7. Fetch Dashboard Telemetry
    telem_res = client.get("/api/v1/dashboard/telemetry", headers=headers)
    assert telem_res.status_code == 200
    assert telem_res.json()["karma_rating"] == 90

    # 8. Update World Balance Sliders (Instant Recomputation)
    wb_res = client.post("/api/v1/dashboard/world-balance", json={"business_pct": 80, "family_pct": 90, "friend_pct": 60}, headers=headers)
    assert wb_res.status_code == 200
    maslow = wb_res.json()["maslow_matrix"]
    assert maslow["physiological"] == 79.0

    # 9. Digital Twin Profile (Rule: FirstName_2.0)
    twin_res = client.get("/api/v1/twin/profile", headers=headers)
    assert twin_res.status_code == 200
    assert twin_res.json()["twin"]["twin_name"] == "TestPriya_2.0"
