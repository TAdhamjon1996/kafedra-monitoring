from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Request
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime, timezone
from app.core.database import get_db
from app.core.security import get_current_user_payload
from app.models.entities import ShirTask, TaskSubmission, SubmissionAttachment, User, AuditLog
from app.services.file_validator import validate_and_save_attachment
from app.services.rating_engine import recalculate_user_rating, preview_activity_points
from app.schemas.schemas import SubmissionReview

router = APIRouter(prefix="/submissions", tags=["Hisobotlar va Tasdiqlar"])

@router.get("/preview-points")
@router.post("/preview-points")
def get_points_preview(
    activity_type: str = "scopus",
    co_authors_count: int = 1
):
    """Hisobot yuklashdan oldin kutilayotgan reyting ballini hisoblash"""
    return preview_activity_points(activity_type, co_authors_count)

@router.post("/submit")
async def submit_task_report(
    request: Request,
    task_id: int = Form(...),
    activity_type: str = Form(...),
    publication_title: str = Form(...),
    doi_url: Optional[str] = Form(None),
    co_authors_count: int = Form(1),
    actual_result: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    payload: dict = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
):
    user_id = int(payload.get("sub", 0))
    role = payload.get("role")

    task = db.query(ShirTask).filter(ShirTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Topshiriq topilmadi.")

    # IDOR check: only task owner or admin
    if role == "teacher" and task.user_id != user_id:
        raise HTTPException(status_code=403, detail="Boshqa o'qituvchining topshirig'iga hisobot yuklay olmaysiz.")

    now = datetime.now(timezone.utc)
    submission = TaskSubmission(
        task_id=task.id,
        activity_type=activity_type.lower(),
        publication_title=publication_title,
        doi_url=doi_url,
        co_authors_count=max(1, co_authors_count),
        actual_result=actual_result or "Hisobot va tasdiqlovchi hujjat yuklandi.",
        status="tekshiruvda",
        submission_date=now
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)

    # If file attached, validate magic bytes, SHA-256 and store
    file_info = None
    if file and file.filename:
        file_meta = await validate_and_save_attachment(file, user_id)
        attachment = SubmissionAttachment(
            submission_id=submission.id,
            file_name=file_meta["file_name"],
            file_url=file_meta["file_url"],
            file_type=file_meta["file_type"],
            file_size_bytes=file_meta["file_size_bytes"],
            sha256_hash=file_meta["sha256_hash"]
        )
        db.add(attachment)
        db.commit()
        db.refresh(attachment)
        file_info = file_meta

    # Update task state machine
    task.status = "tekshiruvda"
    
    # Audit log
    audit = AuditLog(
        user_id=user_id,
        action="Hisobot yuklandi (Submit report)",
        ip_address=request.client.host if request.client else "127.0.0.1",
        details=f"Topshiriq ID {task.id}: {publication_title} ({activity_type})"
    )
    db.add(audit)
    db.commit()

    return {
        "status": "success",
        "message": "Hisobot muvaffaqiyatli yuklandi va kafedra mudiri tekshiruviga yuborildi.",
        "submission_id": submission.id,
        "file": file_info
    }

@router.get("/pending")
def get_pending_submissions(payload: dict = Depends(get_current_user_payload), db: Session = Depends(get_db)):
    role = payload.get("role")
    if role not in ["admin", "head_of_dept"]:
        raise HTTPException(status_code=403, detail="Ushbu ma'lumotlar faqat kafedra mudiriga ochiq.")

    submissions = db.query(TaskSubmission).filter(
        TaskSubmission.status == "tekshiruvda"
    ).order_by(TaskSubmission.submission_date.desc()).all()

    result = []
    for s in submissions:
        user = s.task.user if s.task else None
        attachments = [{
            "id": a.id,
            "file_name": a.file_name,
            "file_url": a.file_url,
            "file_type": a.file_type,
            "file_size_bytes": a.file_size_bytes
        } for a in s.attachments]

        result.append({
            "id": s.id,
            "task_id": s.task_id,
            "task_title": s.task.task_title if s.task else "",
            "category_name": s.task.category.category_name if s.task and s.task.category else "",
            "user_id": user.id if user else 0,
            "user_fio": user.fio if user else "",
            "activity_type": s.activity_type,
            "publication_title": s.publication_title,
            "doi_url": s.doi_url,
            "co_authors_count": s.co_authors_count,
            "actual_result": s.actual_result,
            "status": s.status,
            "submission_date": s.submission_date,
            "attachments": attachments
        })
    return result

@router.post("/{submission_id}/review")
def review_submission(
    submission_id: int,
    review_data: SubmissionReview,
    request: Request,
    payload: dict = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
):
    role = payload.get("role")
    if role not in ["admin", "head_of_dept"]:
        raise HTTPException(status_code=403, detail="Hisobotlarni tekshirish va tasdiqlash faqat kafedra mudiriga ruxsat etilgan.")

    submission = db.query(TaskSubmission).filter(TaskSubmission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Hisobot topilmadi.")

    verifier_id = int(payload.get("sub", 0))
    now = datetime.now(timezone.utc)
    task = submission.task

    if review_data.action == "tasdiqlash":
        submission.status = "tasdiqlandi"
        submission.verified_by = verifier_id
        submission.verified_at = now
        submission.rejection_comment = None
        
        task.status = "tasdiqlandi"
        if task.category_id == 1:
            task.actual_hours = review_data.approved_hours or task.planned_hours
            
        action_text = "Hisobot tasdiqlandi"
        details_text = f"Topshiriq ID {task.id} tasdiqlandi. Reyting qayta hisoblandi."
    else:
        submission.status = "qaytarildi"
        submission.verified_by = verifier_id
        submission.verified_at = now
        submission.rejection_comment = review_data.rejection_comment or "Kamchiliklar mavjud, qayta yuklansin."
        
        task.status = "qaytarildi"
        action_text = "Hisobot rad etildi (qaytarildi)"
        details_text = f"Topshiriq ID {task.id} qaytarildi: {submission.rejection_comment}"

    db.commit()

    # Recalculate rating in real-time
    new_rating = recalculate_user_rating(db, task.user_id, task.year_id)

    # Audit log
    audit = AuditLog(
        user_id=verifier_id,
        action=action_text,
        ip_address=request.client.host if request.client else "127.0.0.1",
        details=details_text
    )
    db.add(audit)
    db.commit()

    return {
        "status": "success",
        "action": review_data.action,
        "new_submission_status": submission.status,
        "new_task_status": task.status,
        "user_new_total_score": new_rating.total_score,
        "message": f"Hisobot holati '{submission.status}' ga o'zgartirildi va o'qituvchi reytingi yangilandi."
    }
