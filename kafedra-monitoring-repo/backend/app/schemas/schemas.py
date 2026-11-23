from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, date

# --- Auth Schemas ---
class LoginRequest(BaseModel):
    email: Optional[str] = None
    username: Optional[str] = None
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

# --- User Schemas ---
class UserBase(BaseModel):
    fio: str
    email: str
    department: str = "Raqamli texnologiyalar konvergensiyasi"
    position: str = "Assistent"
    rate_fraction: float = 1.00

class UserCreate(UserBase):
    password: str
    role_name: str = "teacher"

class UserResponse(UserBase):
    id: int
    role_id: int
    role_name: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# --- Task Schemas ---
class TaskBase(BaseModel):
    task_title: str
    category_id: int
    target_groups: Optional[str] = None
    planned_hours: float = 0.0
    actual_hours: float = 0.0
    semester: str = "kuzgi"
    due_date: Optional[date] = None

class TaskCreate(TaskBase):
    user_id: int
    year_id: int

class TaskUpdate(BaseModel):
    task_title: Optional[str] = None
    target_groups: Optional[str] = None
    planned_hours: Optional[float] = None
    actual_hours: Optional[float] = None
    semester: Optional[str] = None
    due_date: Optional[date] = None
    status: Optional[str] = None

class TaskResponse(TaskBase):
    id: int
    user_id: int
    year_id: int
    status: str
    category_name: Optional[str] = None
    created_at: Optional[datetime] = None
    submissions_count: Optional[int] = 0

    class Config:
        from_attributes = True

# --- Submission Schemas ---
class SubmissionCreate(BaseModel):
    task_id: int
    activity_type: str = Field(..., description="scopus, oak, dgu, tezis_xalqaro, tezis_res, uslubiy, ustoz_shogird, manual")
    publication_title: str
    doi_url: Optional[str] = None
    co_authors_count: int = 1
    actual_result: Optional[str] = None

class SubmissionReview(BaseModel):
    action: str = Field(..., description="'tasdiqlash' yoki 'qaytarish'")
    rejection_comment: Optional[str] = None
    approved_hours: Optional[float] = None

class AttachmentResponse(BaseModel):
    id: int
    file_name: str
    file_url: str
    file_type: str
    file_size_bytes: int
    sha256_hash: Optional[str] = None
    uploaded_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class SubmissionResponse(BaseModel):
    id: int
    task_id: int
    task_title: Optional[str] = None
    user_id: Optional[int] = None
    user_fio: Optional[str] = None
    activity_type: str
    publication_title: str
    doi_url: Optional[str] = None
    co_authors_count: int
    actual_result: Optional[str] = None
    verified_by: Optional[int] = None
    verified_at: Optional[datetime] = None
    status: str
    rejection_comment: Optional[str] = None
    submission_date: Optional[datetime] = None
    attachments: List[AttachmentResponse] = []

    class Config:
        from_attributes = True

# --- Rating Schemas ---
class RatingResponse(BaseModel):
    id: int
    user_id: int
    user_fio: Optional[str] = None
    position: Optional[str] = None
    department: Optional[str] = None
    year_id: int
    teaching_score: float
    methodical_score: float
    scientific_score: float
    mentor_score: float
    bonus_score: float
    penalty_score: float
    total_score: float
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# --- Dashboard & Stats Schemas ---
class RadialMetric(BaseModel):
    category_id: int
    category_title: str
    total_tasks: int
    completed_tasks: int
    percentage: int
    color_class: str

class DashboardOverview(BaseModel):
    user_id: int
    user_fio: str
    position: str
    department: str
    total_tasks: int
    completed_tasks: int
    in_progress_tasks: int
    pending_tasks: int
    rating: RatingResponse
    radial_metrics: List[RadialMetric]
    recent_tasks: List[TaskResponse]

class LandingStats(BaseModel):
    total_teachers: int
    submitted_reports: int
    approved_reports: int
    in_progress_reports: int
