import { 
  User, 
  ShirTask, 
  TaskSubmission, 
  RatingScore, 
  DashboardOverview, 
  LandingStats, 
  LeaderboardItem,
  ActivityType 
} from '../types';

const API_BASE = '/api/v1';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('access_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('access_token', token);
    } else {
      localStorage.removeItem('access_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `Xatolik yuz berdi (${response.status})`;
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
        }
      } catch {
        // ignore json parse error
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // --- AUTH ---
  async login(username: string, password: string): Promise<{ access_token: string; user: User }> {
    const res = await this.request<{ access_token: string; user: User }>('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: username, password }),
    });

    this.setToken(res.access_token);
    return res;
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    } finally {
      this.setToken(null);
    }
  }

  // --- STATS ---
  async getLandingStats(): Promise<LandingStats> {
    return this.request<LandingStats>('/stats/landing');
  }

  async getDashboardOverview(): Promise<DashboardOverview> {
    return this.request<DashboardOverview>('/stats/dashboard-overview');
  }

  // --- TASKS ---
  async getMyTasks(status?: string, category_id?: number): Promise<ShirTask[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (category_id) params.append('category_id', category_id.toString());
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<ShirTask[]>(`/tasks/my-tasks${query}`);
  }

  async reassignHours(taskId: number, newHours: number): Promise<{ message: string; task_id: number; planned_hours: number }> {
    return this.request(`/tasks/${taskId}/reassign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ new_planned_hours: newHours }),
    });
  }

  // --- SUBMISSIONS ---
  async submitReport(data: {
    task_id: number;
    activity_type: ActivityType;
    publication_title: string;
    doi_url?: string;
    co_authors_count: number;
    actual_result?: string;
    file?: File;
  }): Promise<{ message: string; submission_id: number; status: string }> {
    const formData = new FormData();
    formData.append('task_id', data.task_id.toString());
    formData.append('activity_type', data.activity_type);
    formData.append('publication_title', data.publication_title);
    if (data.doi_url) formData.append('doi_url', data.doi_url);
    formData.append('co_authors_count', data.co_authors_count.toString());
    if (data.actual_result) formData.append('actual_result', data.actual_result);
    if (data.file) formData.append('file', data.file);

    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}/submissions/submit`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      let errMsg = 'Hisobotni yuborishda xatolik yuz berdi';
      try {
        const errJson = await response.json();
        if (errJson.detail) errMsg = errJson.detail;
      } catch {
        // ignore
      }
      throw new Error(errMsg);
    }

    return response.json();
  }

  async previewPoints(activity_type: ActivityType, co_authors_count: number): Promise<{
    activity_type: string;
    base_points: number;
    co_authors_count: number;
    coauthor_coefficient: number;
    estimated_points: number;
  }> {
    return this.request(`/submissions/preview-points?activity_type=${activity_type}&co_authors_count=${co_authors_count}`);
  }

  async getPendingSubmissions(): Promise<TaskSubmission[]> {
    return this.request<TaskSubmission[]>('/submissions/pending');
  }

  async reviewSubmission(
    submissionId: number, 
    status: 'tasdiqlandi' | 'qaytarildi', 
    rejectionComment?: string
  ): Promise<{ message: string; submission_id: number; status: string }> {
    return this.request(`/submissions/${submissionId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        rejection_comment: rejectionComment,
      }),
    });
  }

  // --- RATING ---
  async getMyRating(): Promise<RatingScore> {
    return this.request<RatingScore>('/rating/my-rating');
  }

  async getDepartmentLeaderboard(): Promise<LeaderboardItem[]> {
    return this.request<LeaderboardItem[]>('/rating/department-leaderboard');
  }

  // --- EXPORT ---
  getExcelExportUrl(userId: number): string {
    return `${API_BASE}/export/shir-excel/${userId}`;
  }

  getPdfExportUrl(userId: number): string {
    return `${API_BASE}/export/shir-pdf/${userId}`;
  }
}

export const api = new ApiService();
