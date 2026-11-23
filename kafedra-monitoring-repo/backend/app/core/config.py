import os

class Settings:
    PROJECT_NAME: str = "Kafedra Professor-O'qituvchilari Ilmiy Faoliyatini Monitoring Qilish Axborot Tizimi"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-jwt-key-tatu-convergence-2026-secure")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database URL: default SQLite with foreign keys, supports PostgreSQL seamlessly
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./monitoring.db")
    
    # Uploads directory
    BASE_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    UPLOAD_DIR: str = os.path.join(BASE_DIR, "uploads", "submissions")
    
    # Max file size: 25 MB
    MAX_FILE_SIZE_BYTES: int = 25 * 1024 * 1024
    ALLOWED_EXTENSIONS: list = [".pdf", ".jpg", ".jpeg", ".png"]

settings = Settings()
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
