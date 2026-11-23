from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.security import get_current_user_payload
from app.models.entities import RatingScore, User, AcademicYear
from app.schemas.schemas import RatingResponse

router = APIRouter(prefix="/rating", tags=["Reyting Ko'rsatkichlari"])

@router.get("/my-rating", response_model=RatingResponse)
def get_my_rating(payload: dict = Depends(get_current_user_payload), db: Session = Depends(get_db)):
    user_id = int(payload.get("sub", 0))
    rating = db.query(RatingScore).filter(RatingScore.user_id == user_id).first()
    if not rating:
        raise HTTPException(status_code=404, detail="Reyting ma'lumotlari topilmadi.")

    user = rating.user
    return {
        "id": rating.id,
        "user_id": rating.user_id,
        "user_fio": user.fio if user else "",
        "position": user.position if user else "",
        "department": user.department if user else "",
        "year_id": rating.year_id,
        "teaching_score": rating.teaching_score,
        "methodical_score": rating.methodical_score,
        "scientific_score": rating.scientific_score,
        "mentor_score": rating.mentor_score,
        "bonus_score": rating.bonus_score,
        "penalty_score": rating.penalty_score,
        "total_score": rating.total_score,
        "updated_at": rating.updated_at
    }

@router.get("/department-leaderboard")
def get_department_leaderboard(
    year_id: Optional[int] = None,
    payload: dict = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
):
    query = db.query(RatingScore).join(User)
    if year_id:
        query = query.filter(RatingScore.year_id == year_id)

    scores = query.order_by(RatingScore.total_score.desc()).all()

    leaderboard = []
    for rank, s in enumerate(scores, start=1):
        leaderboard.append({
            "rank": rank,
            "user_id": s.user_id,
            "fio": s.user.fio if s.user else "Noma'lum",
            "position": s.user.position if s.user else "Assistent",
            "department": s.user.department if s.user else "Raqamli texnologiyalar konvergensiyasi",
            "teaching_score": s.teaching_score,
            "methodical_score": s.methodical_score,
            "scientific_score": s.scientific_score,
            "mentor_score": s.mentor_score,
            "bonus_score": s.bonus_score,
            "penalty_score": s.penalty_score,
            "total_score": s.total_score
        })
    return leaderboard
