import os
import hashlib
import uuid
from typing import Tuple, Dict, Any
from fastapi import UploadFile, HTTPException, status
from app.core.config import settings

# Magic bytes signatures
MAGIC_BYTES = {
    b"%PDF": "application/pdf",
    b"\xFF\xD8\xFF": "image/jpeg",
    b"\x89PNG\r\n\x1a\n": "image/png"
}

def detect_mime_type(header_bytes: bytes) -> str:
    for magic, mime in MAGIC_BYTES.items():
        if header_bytes.startswith(magic):
            return mime
    return "application/octet-stream"

async def validate_and_save_attachment(file: UploadFile, user_id: int) -> Dict[str, Any]:
    # 1. Check extension
    filename = file.filename or "hujjat"
    ext = os.path.splitext(filename)[1].lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Faqat ruxsat berilgan fayl turlari qabul qilinadi: {', '.join(settings.ALLOWED_EXTENSIONS)}. Siz yuklagan format: {ext}"
        )

    # 2. Read content in chunks to check size and magic bytes
    content = await file.read()
    file_size = len(content)

    if file_size > settings.MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Fayl hajmi 25 MB dan oshmasligi kerak. Yuklangan fayl hajmi: {round(file_size / (1024*1024), 2)} MB"
        )
    if file_size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Yuklangan fayl bo'sh bo'lishi mumkin emas."
        )

    # 3. Magic bytes verification (OWASP MIME checking)
    header = content[:16]
    detected_mime = detect_mime_type(header)
    
    if ext == ".pdf" and detected_mime != "application/pdf":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Fayl haqiqiy PDF standarti emas (MIME xatolik).")
    if ext in [".jpg", ".jpeg"] and detected_mime != "image/jpeg":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Fayl haqiqiy JPEG standarti emas (MIME xatolik).")
    if ext == ".png" and detected_mime != "image/png":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Fayl haqiqiy PNG standarti emas (MIME xatolik).")

    # 4. Compute SHA-256 Hash
    sha256 = hashlib.sha256(content).hexdigest()

    # 5. Save securely to user directory
    user_upload_dir = os.path.join(settings.UPLOAD_DIR, str(user_id))
    os.makedirs(user_upload_dir, exist_ok=True)

    safe_name = f"{uuid.uuid4().hex[:12]}_{filename.replace(' ', '_')}"
    full_path = os.path.join(user_upload_dir, safe_name)

    with open(full_path, "wb") as f:
        f.write(content)

    # Relative URL for client access
    file_url = f"/api/v1/files/download/{user_id}/{safe_name}"

    return {
        "file_name": filename,
        "file_url": file_url,
        "file_type": detected_mime,
        "file_size_bytes": file_size,
        "sha256_hash": sha256,
        "stored_path": full_path
    }
