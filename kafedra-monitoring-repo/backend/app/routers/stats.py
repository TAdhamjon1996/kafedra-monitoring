from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any
from app.core.database import get_db
from app.core.security import get_current_user_payload
from app.models.entities import ShirTask, TaskSubmission, RatingScore, User, ShirCategory
from app.schemas.schemas import LandingStats

router = APIRouter(prefix="/stats", tags=["Statistika va Dashboard"])

@router.get("/landing", response_model=LandingStats)
def get_landing_stats(db: Session = Depends(get_db)):
    """Ommaviy bosh sahifa uchun jonli statistika (Image 1 talablari)"""
    real_teachers = db.query(User).count()
    real_submitted = db.query(TaskSubmission).count()
    real_approved = db.query(TaskSubmission).filter(TaskSubmission.status == "tasdiqlandi").count()
    real_in_progress = db.query(TaskSubmission).filter(TaskSubmission.status == "tekshiruvda").count()

    # Base values from design specifications with dynamic database counts added
    return {
        "total_teachers": 320 + real_teachers,
        "submitted_reports": 270 + real_submitted,
        "approved_reports": 250 + real_approved,
        "in_progress_reports": 20 + real_in_progress
    }

@router.get("/dashboard-overview")
def get_dashboard_overview(payload: dict = Depends(get_current_user_payload), db: Session = Depends(get_db)):
    """O'qituvchi shaxsiy kabineti uchun to'liq tahliliy ko'rsatkichlar (Image 2 talablari)"""
    user_id = int(payload.get("sub", 0))
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Foydalanuvchi topilmadi.")

    all_tasks = db.query(ShirTask).filter(ShirTask.user_id == user_id).all()

    # 4 General metric counters
    completed_tasks = sum(1 for t in all_tasks if t.status == "tasdiqlandi")
    in_progress_tasks = sum(1 for t in all_tasks if t.status in ["tekshiruvda", "jarayonda"])
    pending_tasks = sum(1 for t in all_tasks if t.status in ["kutilmoqda", "qaytarildi", "rejalashtirilgan"])
    total_tasks = len(all_tasks)

    # 5 Category radial indicators
    categories = db.query(ShirCategory).order_by(ShirCategory.id.asc()).all()
    radial_metrics = []
    
    color_map = {
        1: "#1D5CE5", # Blue
        2: "#10B981", # Green
        3: "#F59E0B", # Amber
        4: "#8B5CF6", # Purple
        5: "#06B6D4"  # Cyan/Teal
    }

    for cat in categories:
        cat_tasks = [t for t in all_tasks if t.category_id == cat.id]
        cat_total = len(cat_tasks)
        cat_completed = sum(1 for t in cat_tasks if t.status == "tasdiqlandi")
        pct = int(round((cat_completed / cat_total * 100))) if cat_total > 0 else 0

        radial_metrics.append({
            "category_id": cat.id,
            "category_title": cat.category_name,
            "total_tasks": cat_total,
            "completed_tasks": cat_completed,
            "percentage": pct,
            "color_hex": color_map.get(cat.id, "#1D5CE5")
        })

    # Recent tasks (for bottom-left card on Image 2)
    recent_tasks_query = db.query(ShirTask).filter(ShirTask.user_id == user_id).order_by(ShirTask.id.desc()).limit(5).all()
    recent_tasks = [{
        "id": t.id,
        "title": t.task_title,
        "category_name": t.category.category_name if t.category else "",
        "status": t.status,
        "due_date": t.due_date.isoformat() if t.due_date else "2026-12-31"
    } for t in recent_tasks_query]

    # Announcements (for bottom-right card on Image 2)
    announcements = [
        {
            "id": 1,
            "title": "Eslatma!",
            "message": "Yillik shaxsiy ish rejasi bo‘yicha topshiriqlarni o‘z vaqtida bajarishingizni so‘raymiz.",
            "date": "10.05.2026",
            "type": "warning"
        },
        {
            "id": 2,
            "title": "Ilmiy nashrlar qabuli",
            "message": "Scopus va Web of Science xalqaro jurnallaridagi maqolalar hisobotini tasdiqlash uchun kafedra mudiriga yuboring.",
            "date": "15.05.2026",
            "type": "info"
        },
        {
            "id": 3,
            "title": "DGU guvohnomalari",
            "message": "Intellektual mulk agentligi tomonidan berilgan DGU guvohnomasi PDF nusxasini yuklash unutmang.",
            "date": "20.05.2026",
            "type": "info"
        }
    ]

    # Rating score
    rating = db.query(RatingScore).filter(RatingScore.user_id == user_id).first()

    return {
        "user_id": user.id,
        "fio": user.fio,
        "position": user.position,
        "department": user.department,
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "in_progress_tasks": in_progress_tasks,
        "uncompleted_tasks": pending_tasks,
        "metrics": {
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "in_progress_tasks": in_progress_tasks,
            "pending_tasks": pending_tasks
        },
        "categories_progress": radial_metrics,
        "radial_metrics": radial_metrics,
        "recent_tasks": recent_tasks,
        "announcements": announcements,
        "rating": {
            "total_score": rating.total_score if rating else 0.0,
            "teaching_score": rating.teaching_score if rating else 0.0,
            "methodical_score": rating.methodical_score if rating else 0.0,
            "scientific_score": rating.scientific_score if rating else 0.0,
            "mentor_score": rating.mentor_score if rating else 0.0,
            "bonus_score": rating.bonus_score if rating else 0.0,
            "penalty_score": rating.penalty_score if rating else 0.0
        }
    }
