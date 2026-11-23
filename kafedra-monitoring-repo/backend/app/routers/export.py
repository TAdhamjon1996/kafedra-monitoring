from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user_payload
from app.models.entities import User, ShirTask, RatingScore
from app.services.export_service import export_shir_excel, export_shir_pdf

router = APIRouter(prefix="/export", tags=["Hisobotlarni Eksport Qilish"])

@router.get("/shir-excel/{user_id}")
def download_shir_excel(user_id: int, payload: dict = Depends(get_current_user_payload), db: Session = Depends(get_db)):
    req_user_id = int(payload.get("sub", 0))
    role = payload.get("role")
    if role == "teacher" and req_user_id != user_id:
        raise HTTPException(status_code=403, detail="Faqat o'z hisobotingizni yuklab olishingiz mumkin.")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Foydalanuvchi topilmadi.")

    tasks = db.query(ShirTask).filter(ShirTask.user_id == user_id).order_by(ShirTask.category_id.asc(), ShirTask.id.asc()).all()
    rating = db.query(RatingScore).filter(RatingScore.user_id == user_id).first()

    tasks_data = [{
        "category_name": t.category.category_name if t.category else "",
        "task_title": t.task_title,
        "target_groups": t.target_groups,
        "planned_hours": t.planned_hours,
        "actual_hours": t.actual_hours,
        "semester": t.semester,
        "status": t.status
    } for t in tasks]

    rating_data = {
        "total_score": rating.total_score if rating else 0.0,
        "teaching_score": rating.teaching_score if rating else 0.0,
        "methodical_score": rating.methodical_score if rating else 0.0,
        "scientific_score": rating.scientific_score if rating else 0.0,
        "mentor_score": rating.mentor_score if rating else 0.0,
        "bonus_score": rating.bonus_score if rating else 0.0,
        "penalty_score": rating.penalty_score if rating else 0.0
    }

    user_data = {
        "fio": user.fio,
        "position": user.position,
        "department": user.department
    }

    excel_stream = export_shir_excel(user_data, tasks_data, rating_data)
    filename = f"SHIR_{user.fio.replace(' ', '_')}_2026.xlsx"
    return StreamingResponse(
        excel_stream,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/shir-pdf/{user_id}")
def download_shir_pdf(user_id: int, payload: dict = Depends(get_current_user_payload), db: Session = Depends(get_db)):
    req_user_id = int(payload.get("sub", 0))
    role = payload.get("role")
    if role == "teacher" and req_user_id != user_id:
        raise HTTPException(status_code=403, detail="Faqat o'z hisobotingizni yuklab olishingiz mumkin.")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Foydalanuvchi topilmadi.")

    tasks = db.query(ShirTask).filter(ShirTask.user_id == user_id).order_by(ShirTask.category_id.asc(), ShirTask.id.asc()).all()
    rating = db.query(RatingScore).filter(RatingScore.user_id == user_id).first()

    tasks_data = [{
        "category_name": t.category.category_name if t.category else "",
        "task_title": t.task_title,
        "target_groups": t.target_groups,
        "planned_hours": t.planned_hours,
        "semester": t.semester,
        "status": t.status
    } for t in tasks]

    rating_data = {
        "total_score": rating.total_score if rating else 0.0,
        "teaching_score": rating.teaching_score if rating else 0.0,
        "methodical_score": rating.methodical_score if rating else 0.0,
        "scientific_score": rating.scientific_score if rating else 0.0,
        "mentor_score": rating.mentor_score if rating else 0.0
    }

    user_data = {
        "fio": user.fio,
        "position": user.position,
        "department": user.department
    }

    pdf_stream = export_shir_pdf(user_data, tasks_data, rating_data)
    filename = f"SHIR_{user.fio.replace(' ', '_')}_2026.pdf"
    return StreamingResponse(
        pdf_stream,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
