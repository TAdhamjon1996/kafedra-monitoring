import os
import sys

# Ensure backend directory is in sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import engine, Base
from app.seed.seed_data import seed_database

from app.routers.auth import router as auth_router
from app.routers.tasks import router as tasks_router
from app.routers.submissions import router as submissions_router
from app.routers.rating import router as rating_router
from app.routers.stats import router as stats_router
from app.routers.export import router as export_router
from app.routers.files import router as files_router
from app.routers.notifications import router as notifications_router

# Initialize FastAPI application
app = FastAPI(
    title="Kafedra Professor-O'qituvchilari Ilmiy Faoliyatini Monitoring Qilish Axborot Tizimi",
    description="TATU 'Raqamli texnologiyalar konvergensiyasi' kafedrasi monitoring portali backend API",
    version="1.0.0",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc"
)

# CORS Middleware (allows frontend on ports 3000, 5173, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auto-initialize database on startup
@app.on_event("startup")
def on_startup():
    print("Initializing Database & Seed Data...")
    Base.metadata.create_all(bind=engine)
    seed_database()
    print("Database ready.")

# Register API Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(tasks_router, prefix=settings.API_V1_STR)
app.include_router(submissions_router, prefix=settings.API_V1_STR)
app.include_router(rating_router, prefix=settings.API_V1_STR)
app.include_router(stats_router, prefix=settings.API_V1_STR)
app.include_router(export_router, prefix=settings.API_V1_STR)
app.include_router(files_router, prefix=settings.API_V1_STR)
app.include_router(notifications_router, prefix=settings.API_V1_STR)

@app.get("/api")
def api_status():
    return {
        "status": "online",
        "system": settings.PROJECT_NAME,
        "department": "Muhammad al-Xorazmiy nomidagi TATU 'Raqamli texnologiyalar konvergensiyasi' kafedrasi",
        "api_docs": f"{settings.API_V1_STR}/docs",
        "author": "Egamberdiyev Nodir Abdunazarovich (TATU)"
    }

# Mount Frontend SPA if dist folder exists
frontend_dist = os.path.abspath(os.path.join(backend_dir, "..", "frontend", "dist"))
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")
else:
    @app.get("/")
    def root():
        return {
            "status": "online",
            "message": "Frontend build not detected. Run 'npm run build' in frontend directory.",
            "api_docs": f"{settings.API_V1_STR}/docs"
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
