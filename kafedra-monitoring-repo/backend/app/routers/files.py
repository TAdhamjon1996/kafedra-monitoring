import os
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import FileResponse
from app.core.config import settings

router = APIRouter(prefix="/files", tags=["Fayllar ombori"])

@router.get("/download/{user_id}/{filename}")
def download_file(user_id: int, filename: str):
    user_dir = os.path.join(settings.UPLOAD_DIR, str(user_id))
    safe_path = os.path.abspath(os.path.join(user_dir, filename))

    # Path traversal prevention
    if not safe_path.startswith(os.path.abspath(settings.UPLOAD_DIR)):
        raise HTTPException(status_code=403, detail="Ruxsatsiz yo'l.")

    if not os.path.exists(safe_path):
        # If it's a seeded placeholder file, return a dummy text response or 404
        raise HTTPException(status_code=404, detail="Fayl topilmadi yoki hali yuklanmagan.")

    return FileResponse(safe_path, filename=filename)
