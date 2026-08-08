from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import auth, otp, chat, dashboard, twin

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(otp.router, prefix=settings.API_V1_STR)
app.include_router(chat.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(twin.router, prefix=settings.API_V1_STR)

@app.get("/healthz", tags=["System Health"])
def health_check():
    return {
        "ok": True,
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "healthy"
    }

@app.get("/api/auth/digital-twin-name", tags=["Digital Twin"])
def digital_twin_name(name: str = None, email: str = None):
    clean_name = (name or email or "Archer").strip().split(" ")[0]
    twin_name = f"{clean_name}_2.0"
    return {"success": True, "twinName": twin_name, "userName": clean_name}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
