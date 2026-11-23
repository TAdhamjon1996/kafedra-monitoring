from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import (
    verify_password, create_access_token, get_current_user_payload
)
from app.models.entities import User, Role, AuditLog
from app.schemas.schemas import LoginRequest, TokenResponse, UserResponse

router = APIRouter(prefix="/auth", tags=["Autentifikatsiya"])

@router.post("/login", response_model=TokenResponse)
def login(login_data: LoginRequest, response: Response, request: Request, db: Session = Depends(get_db)):
    email_query = login_data.email or login_data.username
    if not email_query:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Elektron pochta yoki login kiritilishi shart."
        )
    user = db.query(User).filter(User.email == email_query).first()
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Elektron pochta yoki parol noto'g'ri kiritildi."
        )

    role_name = user.role.name if user.role else "teacher"
    token_payload = {
        "sub": str(user.id),
        "email": user.email,
        "fio": user.fio,
        "role": role_name,
        "department": user.department,
        "position": user.position
    }
    token = create_access_token(token_payload)

    # Set HTTP-only Cookie for security (OWASP)
    response.set_cookie(
        key="access_token",
        value=f"Bearer {token}",
        httponly=True,
        samesite="lax",
        secure=False, # True in production HTTPS
        max_age=60 * 60 * 24 * 7
    )

    # Log audit
    client_ip = request.client.host if request.client else "127.0.0.1"
    audit = AuditLog(
        user_id=user.id,
        action="Tizimga kirish (Login)",
        ip_address=client_ip,
        details=f"{user.fio} ({role_name}) tizimga muvaffaqiyatli kirdi."
    )
    db.add(audit)
    db.commit()

    user_info = {
        "id": user.id,
        "fio": user.fio,
        "email": user.email,
        "role": role_name,
        "department": user.department,
        "position": user.position
    }

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user_info
    }

@router.get("/me")
def get_current_user_profile(payload: dict = Depends(get_current_user_payload), db: Session = Depends(get_db)):
    user_id = int(payload.get("sub", 0))
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Foydalanuvchi topilmadi.")
    
    return {
        "id": user.id,
        "fio": user.fio,
        "email": user.email,
        "role": user.role.name if user.role else "teacher",
        "department": user.department,
        "position": user.position,
        "rate_fraction": user.rate_fraction
    }

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Tizimdan muvaffaqiyatli chiqildi."}
