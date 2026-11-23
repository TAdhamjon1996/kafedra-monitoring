from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Date, Text, Boolean, BigInteger, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False) # 'admin', 'head_of_dept', 'teacher'
    description = Column(String(255), nullable=True)
    permissions = Column(JSON, default=dict)

    users = relationship("User", back_populates="role")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    fio = Column(String(150), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id", ondelete="RESTRICT"), nullable=False)
    department = Column(String(150), nullable=False, default="Raqamli texnologiyalar konvergensiyasi")
    position = Column(String(100), nullable=False, default="Assistent")
    rate_fraction = Column(Float, nullable=False, default=1.00)
    created_at = Column(DateTime, default=utc_now)

    role = relationship("Role", back_populates="users")
    tasks = relationship("ShirTask", back_populates="user", cascade="all, delete-orphan")
    ratings = relationship("RatingScore", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user")

class AcademicYear(Base):
    __tablename__ = "academic_years"

    id = Column(Integer, primary_key=True, index=True)
    year_name = Column(String(20), unique=True, nullable=False) # '2026/2027'
    total_norm_hours = Column(Integer, nullable=False, default=851)
    is_active = Column(Boolean, default=True)

    tasks = relationship("ShirTask", back_populates="academic_year", cascade="all, delete-orphan")
    ratings = relationship("RatingScore", back_populates="academic_year", cascade="all, delete-orphan")

class ShirCategory(Base):
    __tablename__ = "shir_categories"

    id = Column(Integer, primary_key=True, index=True)
    category_name = Column(String(100), nullable=False)
    weight_percent = Column(Float, default=20.0)
    default_rate = Column(Float, default=1.0)

    tasks = relationship("ShirTask", back_populates="category")

class ShirTask(Base):
    __tablename__ = "shir_tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    year_id = Column(Integer, ForeignKey("academic_years.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(Integer, ForeignKey("shir_categories.id"), nullable=False)
    task_title = Column(Text, nullable=False)
    target_groups = Column(String(255), nullable=True)
    planned_hours = Column(Float, default=0.0)
    actual_hours = Column(Float, default=0.0)
    semester = Column(String(20), default="kuzgi") # 'kuzgi', 'bahorgi', 'yillik'
    due_date = Column(Date, nullable=True)
    status = Column(String(20), default="rejalashtirilgan") # 'rejalashtirilgan', 'kutilmoqda', 'tekshiruvda', 'tasdiqlandi', 'qaytarildi'
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="tasks")
    academic_year = relationship("AcademicYear", back_populates="tasks")
    category = relationship("ShirCategory", back_populates="tasks")
    submissions = relationship("TaskSubmission", back_populates="task", cascade="all, delete-orphan")

class TaskSubmission(Base):
    __tablename__ = "task_submissions"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("shir_tasks.id", ondelete="CASCADE"), nullable=False)
    activity_type = Column(String(50), nullable=False) # 'scopus', 'oak', 'dgu', 'tezis_xalqaro', 'tezis_res', 'uslubiy', 'ustoz_shogird', 'manual'
    publication_title = Column(Text, nullable=False)
    doi_url = Column(String(255), nullable=True)
    co_authors_count = Column(Integer, default=1)
    actual_result = Column(Text, nullable=True)
    verified_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    verified_at = Column(DateTime, nullable=True)
    status = Column(String(20), default="tekshiruvda") # 'tekshiruvda', 'tasdiqlandi', 'qaytarildi'
    rejection_comment = Column(Text, nullable=True)
    submission_date = Column(DateTime, default=utc_now)

    task = relationship("ShirTask", back_populates="submissions")
    verifier = relationship("User", foreign_keys=[verified_by])
    attachments = relationship("SubmissionAttachment", back_populates="submission", cascade="all, delete-orphan")

class SubmissionAttachment(Base):
    __tablename__ = "submission_attachments"

    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("task_submissions.id", ondelete="CASCADE"), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_url = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=False) # 'application/pdf', 'image/jpeg', 'image/png'
    file_size_bytes = Column(BigInteger, default=0)
    sha256_hash = Column(String(64), nullable=True)
    uploaded_at = Column(DateTime, default=utc_now)

    submission = relationship("TaskSubmission", back_populates="attachments")

class RatingScore(Base):
    __tablename__ = "rating_scores"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    year_id = Column(Integer, ForeignKey("academic_years.id", ondelete="CASCADE"), nullable=False)
    teaching_score = Column(Float, default=0.0)
    methodical_score = Column(Float, default=0.0)
    scientific_score = Column(Float, default=0.0)
    mentor_score = Column(Float, default=0.0)
    bonus_score = Column(Float, default=0.0)
    penalty_score = Column(Float, default=0.0)
    total_score = Column(Float, default=0.0)
    updated_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="ratings")
    academic_year = relationship("AcademicYear", back_populates="ratings")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(255), nullable=False)
    ip_address = Column(String(45), nullable=True)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="audit_logs")
