from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.core.database import get_db
from app.core.security import get_current_user_payload
from app.models.entities import ShirTask, ShirCategory, User, AcademicYear, AuditLog
from app.schemas.schemas import TaskResponse, TaskCreate, TaskUpdate
from app.services.rating_engine import recalculate_user_rating

router = APIRouter(prefix="/tasks", tags=["SHIR Topshiriqlari"])

@router.get("/my-tasks")
def get_my_tasks(
    category_id: Optional[int] = None,
    semester: Optional[str] = None,
    status_filter: Optional[str] = None,
    payload: dict = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
):
    user_id = int(payload.get("sub", 0))
    query = db.query(ShirTask).filter(ShirTask.user_id == user_id)

    if category_id:
        query = query.filter(ShirTask.category_id == category_id)
    if semester:
        query = query.filter(ShirTask.semester == semester.lower())
    if status_filter:
        query = query.filter(ShirTask.status == status_filter.lower())

    tasks = query.order_by(ShirTask.category_id.asc(), ShirTask.id.asc()).all()
    
    result = []
    for t in tasks:
        result.append({
            "id": t.id,
            "user_id": t.user_id,
            "year_id": t.year_id,
            "category_id": t.category_id,
            "category_name": t.category.category_name if t.category else "",
            "task_title": t.task_title,
            "target_groups": t.target_groups,
            "planned_hours": t.planned_hours,
            "actual_hours": t.actual_hours,
            "semester": t.semester,
            "due_date": t.due_date,
            "status": t.status,
            "created_at": t.created_at,
            "submissions_count": len(t.submissions) if t.submissions else 0
        })
    return result

@router.get("/{task_id}")
def get_task_detail(task_id: int, payload: dict = Depends(get_current_user_payload), db: Session = Depends(get_db)):
    user_id = int(payload.get("sub", 0))
    role = payload.get("role", "teacher")

    task = db.query(ShirTask).filter(ShirTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Topshiriq topilmadi.")

    # IDOR check: teacher can only view own task, admin/mudir can view all
    if role == "teacher" and task.user_id != user_id:
        raise HTTPException(status_code=403, detail="Siz faqat o'zingizga tegishli topshiriqni ko'rishingiz mumkin.")

    submissions_list = []
    for s in task.submissions:
        attachments_list = []
        for a in s.attachments:
            attachments_list.append({
                "id": a.id,
                "file_name": a.file_name,
                "file_url": a.file_url,
                "file_type": a.file_type,
                "file_size_bytes": a.file_size_bytes,
                "sha256_hash": a.sha256_hash,
                "uploaded_at": a.uploaded_at
            })
        submissions_list.append({
            "id": s.id,
            "activity_type": s.activity_type,
            "publication_title": s.publication_title,
            "doi_url": s.doi_url,
            "co_authors_count": s.co_authors_count,
            "actual_result": s.actual_result,
            "status": s.status,
            "rejection_comment": s.rejection_comment,
            "submission_date": s.submission_date,
            "verified_at": s.verified_at,
            "attachments": attachments_list
        })

    return {
        "id": task.id,
        "user_id": task.user_id,
        "category_id": task.category_id,
        "category_name": task.category.category_name if task.category else "",
        "task_title": task.task_title,
        "target_groups": task.target_groups,
        "planned_hours": task.planned_hours,
        "actual_hours": task.actual_hours,
        "semester": task.semester,
        "due_date": task.due_date,
        "status": task.status,
        "submissions": submissions_list
    }

@router.post("")
def create_task(task_in: TaskCreate, payload: dict = Depends(get_current_user_payload), db: Session = Depends(get_db)):
    role = payload.get("role")
    if role not in ["admin", "head_of_dept"]:
        raise HTTPException(status_code=403, detail="Topshiriq yaratish faqat mudir yoki administratorga ruxsat etilgan.")

    new_task = ShirTask(
        user_id=task_in.user_id,
        year_id=task_in.year_id,
        category_id=task_in.category_id,
        task_title=task_in.task_title,
        target_groups=task_in.target_groups,
        planned_hours=task_in.planned_hours,
        actual_hours=task_in.actual_hours,
        semester=task_in.semester,
        due_date=task_in.due_date,
        status="kutilmoqda"
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return {"message": "Topshiriq muvaffaqiyatli biriktirildi.", "task_id": new_task.id}

@router.post("/{task_id}/reassign")
def reassign_task_hours(
    task_id: int,
    target_user_id: int,
    transferred_hours: float,
    request: Request,
    payload: dict = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
):
    """Semestr o'rtasida dars mashg'ulotlari soatlarini bir o'qituvchidan ikkinchisiga qayta taqsimlash"""
    role = payload.get("role")
    if role not in ["admin", "head_of_dept"]:
        raise HTTPException(status_code=403, detail="Soatlarni qayta taqsimlash faqat kafedra mudiriga ruxsat etilgan.")

    source_task = db.query(ShirTask).filter(ShirTask.id == task_id).first()
    target_user = db.query(User).filter(User.id == target_user_id).first()

    if not source_task or not target_user:
        raise HTTPException(status_code=404, detail="Topshiriq yoki maqsadli o'qituvchi topilmadi.")

    if transferred_hours <= 0 or transferred_hours > source_task.planned_hours:
        raise HTTPException(status_code=400, detail="O'tkazilayotgan soat miqdori noto'g'ri ko'rsatildi.")

    # Deduct from source
    source_task.planned_hours -= transferred_hours
    if source_task.actual_hours > source_task.planned_hours:
        source_task.actual_hours = source_task.planned_hours

    # Create new task for target user
    new_task = ShirTask(
        user_id=target_user.id,
        year_id=source_task.year_id,
        category_id=source_task.category_id,
        task_title=f"{source_task.task_title} (Qayta taqsimlangan: {source_task.user.fio}dan)",
        target_groups=source_task.target_groups,
        planned_hours=transferred_hours,
        actual_hours=0.0,
        semester=source_task.semester,
        due_date=source_task.due_date,
        status="kutilmoqda"
    )
    db.add(new_task)

    # Log audit
    audit = AuditLog(
        user_id=int(payload.get("sub", 0)),
        action="Soatlarni qayta taqsimlash (Reassign)",
        ip_address=request.client.host if request.client else "127.0.0.1",
        details=f"{transferred_hours} soat {source_task.user.fio}dan {target_user.fio}ga o'tkazildi."
    )
    db.add(audit)
    db.commit()

    # Recalculate ratings
    recalculate_user_rating(db, source_task.user_id, source_task.year_id)
    recalculate_user_rating(db, target_user.id, source_task.year_id)

    return {
        "status": "success",
        "message": f"{transferred_hours} soat muvaffaqiyatli qayta taqsimlandi va yangi topshiriq biriktirildi."
    }
