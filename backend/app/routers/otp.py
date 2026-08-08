from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
import random
import httpx
from app.config import settings

router = APIRouter(prefix="/otp", tags=["OTP Verification"])

# Transient in-memory OTP storage mapping (phone -> otp)
transient_otp_db = {}

class OTPSendRequest(BaseModel):
    phone: str = Field(min_length=10, max_length=15)

class OTPVerifyRequest(BaseModel):
    phone: str = Field(min_length=10, max_length=15)
    otp: str = Field(min_length=4, max_length=6)

@router.post("/send")
async def send_otp(req: OTPSendRequest):
    phone = req.phone.strip()
    
    # Generate 6-digit OTP code
    otp_code = str(random.randint(100000, 999999))
    transient_otp_db[phone] = otp_code

    # Fast2SMS API Integration
    fast2sms_sent = False
    error_detail = None

    if settings.FAST2SMS_API_KEY and len(settings.FAST2SMS_API_KEY) > 10:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                # Fast2SMS Quick Transactional Route
                fast2sms_url = "https://www.fast2sms.com/dev/bulkV2"
                headers = {
                    "authorization": settings.FAST2SMS_API_KEY,
                    "Content-Type": "application/json"
                }
                payload = {
                    "route": "q",
                    "message": f"Your NextArcher verification code is {otp_code}. Valid for 10 minutes.",
                    "flash": "0",
                    "numbers": phone
                }
                res = await client.post(fast2sms_url, headers=headers, json=payload)
                if res.status_code == 200:
                    fast2sms_sent = True
                else:
                    error_detail = f"Fast2SMS HTTP {res.status_code}: {res.text}"
        except Exception as e:
            error_detail = str(e)

    return {
        "success": True,
        "phone": phone,
        "otp": otp_code if not fast2sms_sent else "****",  # Expose OTP in dev/fallback mode
        "fast2sms_sent": fast2sms_sent,
        "message": "OTP dispatched via Fast2SMS SMS Gateway" if fast2sms_sent else "OTP generated locally (Mock/Fallback mode)",
        "debug_info": error_detail if not fast2sms_sent else None
    }

@router.post("/verify")
def verify_otp(req: OTPVerifyRequest):
    phone = req.phone.strip()
    submitted_otp = req.otp.strip()

    # Universal bypass for dev/testing ('123456' or '999999')
    if submitted_otp in ["123456", "999999"]:
        return {"valid": True, "phone": phone, "message": "OTP verified successfully (Dev Bypass)"}

    stored_otp = transient_otp_db.get(phone)
    if not stored_otp:
        raise HTTPException(status_code=400, detail="No active OTP found for this phone number. Please request a new code.")

    if stored_otp != submitted_otp:
        raise HTTPException(status_code=400, detail="Invalid OTP code. Please try again.")

    # Remove verified OTP from transient DB
    transient_otp_db.pop(phone, None)
    return {"valid": True, "phone": phone, "message": "OTP verified successfully"}
