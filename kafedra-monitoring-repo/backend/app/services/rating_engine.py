from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from app.models.entities import ShirTask, TaskSubmission, RatingScore, User, AuditLog

BASE_RATES = {
    "scopus": 50.0,
    "oak": 30.0,
    "dgu": 25.0,
    "tezis_xalqaro": 10.0,
    "tezis_res": 5.0,
    "uslubiy": 20.0,
    "darslik": 40.0,
    "slayd": 15.0,
    "ustoz_shogird": 15.0,
    "manual": 10.0
}

def calculate_coauthor_coefficient(co_authors_count: int) -> float:
    """
    Hammualliflik koeffitsiyenti:
    1 muallif -> 1.0
    2 muallif -> 0.6
    3 va undan ortiq -> 1 / m
    """
    m = max(1, co_authors_count)
    if m == 1:
        return 1.0
    elif m == 2:
        return 0.6
    else:
        return round(1.0 / m, 3)

def preview_activity_points(activity_type: str, co_authors_count: int = 1) -> Dict[str, Any]:
    """Topshiriq hisobotini topshirishdan oldin kutilayotgan ballni hisoblab ko'rsatish"""
    base = BASE_RATES.get(activity_type.lower(), 10.0)
    kh = calculate_coauthor_coefficient(co_authors_count)
    calculated = round(base * kh, 2)
    return {
        "activity_type": activity_type,
        "base_rate": base,
        "base_points": base,
        "co_authors_count": co_authors_count,
        "coauthor_coefficient": kh,
        "estimated_points": calculated
    }

def recalculate_user_rating(db: Session, user_id: int, year_id: int) -> RatingScore:
    """
    Foydalanuvchining tasdiqlangan barcha topshiriqlari va hisobotlari bo'yicha
    ko'p mezonli reyting ballarini inson omilisiz avtomatik hisoblash.
    """
    # 1. O'quv ishlari (category_id = 1) - Tasdiqlangan soatlar bo'yicha
    teaching_tasks = db.query(ShirTask).filter(
        ShirTask.user_id == user_id,
        ShirTask.year_id == year_id,
        ShirTask.category_id == 1
    ).all()
    
    teaching_hours = 0.0
    for task in teaching_tasks:
        if task.status == "tasdiqlandi":
            teaching_hours += (task.actual_hours or task.planned_hours or 0.0)
        elif task.status == "jarayonda":
            # Semestr davomidagi darslar uchun pro-rata
            teaching_hours += (task.actual_hours or (task.planned_hours * 0.5) or 0.0)
            
    teaching_score = round(teaching_hours * 0.1, 2)

    # 2. Boshqa barcha bo'limlar bo'yicha tasdiqlangan hisobotlar (task_submissions)
    submissions = db.query(TaskSubmission).join(ShirTask).filter(
        ShirTask.user_id == user_id,
        ShirTask.year_id == year_id,
        TaskSubmission.status == "tasdiqlandi"
    ).all()

    methodical_score = 0.0
    scientific_score = 0.0
    mentor_score = 0.0
    bonus_score = 0.0

    for sub in submissions:
        cat_id = sub.task.category_id
        act = sub.activity_type.lower()
        kh = calculate_coauthor_coefficient(sub.co_authors_count)
        
        # 2: O'quv-uslubiy
        if cat_id == 2:
            if "darslik" in act or "darslik" in sub.publication_title.lower():
                methodical_score += 40.0 * kh
            elif "uslubiy" in act or "uslubiy" in sub.publication_title.lower() or "ko'rsatma" in sub.publication_title.lower():
                methodical_score += 20.0 * kh
            else:
                methodical_score += 15.0 * kh
                
        # 3: Ilmiy-tadqiqot
        elif cat_id == 3:
            base = BASE_RATES.get(act, 10.0)
            scientific_score += base * kh

        # 4: Ustoz-shogird
        elif cat_id == 4:
            mentor_score += 15.0

        # 5: Qo'shimcha bajarilgan ishlar
        elif cat_id == 5:
            bonus_score += 10.0

    # 3. Jarima ballari (muddati kechikkan yoki rad etilgan ishlar)
    penalties = 0.0
    overdue_tasks = db.query(ShirTask).filter(
        ShirTask.user_id == user_id,
        ShirTask.year_id == year_id,
        ShirTask.status == "qaytarildi"
    ).count()
    penalty_score = float(overdue_tasks * 2.0)

    # 4. Yig'ma integrallashgan reyting bali
    total_score = round(teaching_score + methodical_score + scientific_score + mentor_score + bonus_score - penalty_score, 2)

    # 5. RatingScore jadvalini yangilash (UPSERT)
    rating_entry = db.query(RatingScore).filter(
        RatingScore.user_id == user_id,
        RatingScore.year_id == year_id
    ).first()

    now = datetime.now(timezone.utc)
    if not rating_entry:
        rating_entry = RatingScore(
            user_id=user_id,
            year_id=year_id,
            teaching_score=teaching_score,
            methodical_score=methodical_score,
            scientific_score=scientific_score,
            mentor_score=mentor_score,
            bonus_score=bonus_score,
            penalty_score=penalty_score,
            total_score=total_score,
            updated_at=now
        )
        db.add(rating_entry)
    else:
        rating_entry.teaching_score = teaching_score
        rating_entry.methodical_score = methodical_score
        rating_entry.scientific_score = scientific_score
        rating_entry.mentor_score = mentor_score
        rating_entry.bonus_score = bonus_score
        rating_entry.penalty_score = penalty_score
        rating_entry.total_score = total_score
        rating_entry.updated_at = now

    db.commit()
    db.refresh(rating_entry)
    return rating_entry
