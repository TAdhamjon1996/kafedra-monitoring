export type RoleType = 'admin' | 'head_of_dept' | 'teacher';

export interface User {
  id: number;
  fio: string;
  email: string;
  role: RoleType;
  department: string;
  position: string;
  rate_fraction: number;
}

export interface ShirCategory {
  id: number;
  category_name: string;
  weight_percent: number;
  default_rate: number;
}

export type TaskStatus = 'rejalashtirilgan' | 'kutilmoqda' | 'tekshiruvda' | 'tasdiqlandi' | 'qaytarildi';
export type SemesterType = 'kuzgi' | 'bahorgi' | 'yillik';

export interface ShirTask {
  id: number;
  user_id: number;
  year_id: number;
  category_id: number;
  category_name?: string;
  task_title: string;
  target_groups?: string;
  planned_hours: number;
  actual_hours: number;
  semester: SemesterType;
  due_date?: string;
  status: TaskStatus;
}

export type ActivityType = 
  | 'scopus' 
  | 'oak' 
  | 'dgu' 
  | 'tezis_xalqaro' 
  | 'tezis_res' 
  | 'uslubiy' 
  | 'darslik'
  | 'ustoz_shogird' 
  | 'manual';

export interface Attachment {
  id: number;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size_bytes: number;
  uploaded_at: string;
}

export interface TaskSubmission {
  id: number;
  task_id: number;
  task_title?: string;
  user_fio?: string;
  activity_type: ActivityType;
  publication_title: string;
  doi_url?: string;
  co_authors_count: number;
  actual_result?: string;
  status: 'tekshiruvda' | 'tasdiqlandi' | 'qaytarildi';
  rejection_comment?: string;
  verified_by?: number;
  verified_at?: string;
  created_at: string;
  attachments?: Attachment[];
}

export interface RatingScore {
  id: number;
  user_id: number;
  year_id: number;
  teaching_score: number;
  methodical_score: number;
  scientific_score: number;
  mentor_score: number;
  bonus_score: number;
  penalty_score: number;
  total_score: number;
  updated_at?: string;
}

export interface CategoryProgress {
  category_id: number;
  category_name: string;
  total_tasks: number;
  completed_tasks: number;
  percentage: number;
}

export interface DashboardOverview {
  user: User;
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  uncompleted_tasks: number;
  total_score: number;
  categories_progress: CategoryProgress[];
  recent_tasks: ShirTask[];
}

export interface LandingStats {
  teachers_count: number;
  submitted_reports: number;
  approved_reports: number;
  in_progress_reports: number;
  department_name: string;
}

export interface LeaderboardItem {
  user_id: number;
  fio: string;
  position: string;
  teaching_score: number;
  methodical_score: number;
  scientific_score: number;
  mentor_score: number;
  bonus_score: number;
  penalty_score: number;
  total_score: number;
  completed_tasks: number;
  total_tasks: number;
}
