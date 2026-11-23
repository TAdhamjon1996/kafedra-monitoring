-- ====================================================================
-- KAFEDRA PROFESSOR-O'QITUVCHILARINING ILMIY VA PEDAGOGIK FAOLIYATINI 
-- MONITORING QILISH AXBOROT TIZIMI (POSTGRESQL 3NF/BCNF MODEL)
-- TATU "Raqamli texnologiyalar konvergensiyasi" kafedrasi
-- ====================================================================

-- 1. Foydalanuvchi rollari jadvali
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL, -- 'admin', 'head_of_dept', 'teacher'
    description VARCHAR(255),
    permissions JSONB DEFAULT '{}'::jsonb
);

-- 2. Foydalanuvchilar (professor-o'qituvchilar, mudir, admin) jadvali
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    fio VARCHAR(150) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT REFERENCES roles(id) ON DELETE RESTRICT,
    department VARCHAR(150) NOT NULL DEFAULT 'Raqamli texnologiyalar konvergensiyasi',
    position VARCHAR(100) NOT NULL DEFAULT 'Assistent',
    rate_fraction NUMERIC(3,2) NOT NULL DEFAULT 1.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. O'quv yillari jadvali
CREATE TABLE IF NOT EXISTS academic_years (
    id SERIAL PRIMARY KEY,
    year_name VARCHAR(20) UNIQUE NOT NULL, -- '2026/2027'
    total_norm_hours INT NOT NULL DEFAULT 851,
    is_active BOOLEAN DEFAULT TRUE
);

-- 4. Shaxsiy ish rejasi (SHIR) yo'nalishlari jadvali
CREATE TABLE IF NOT EXISTS shir_categories (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    weight_percent FLOAT DEFAULT 20.0,
    default_rate FLOAT DEFAULT 1.0
);

-- 5. SHIR topshiriqlari jadvali
CREATE TABLE IF NOT EXISTS shir_tasks (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    year_id INT REFERENCES academic_years(id) ON DELETE CASCADE,
    category_id INT REFERENCES shir_categories(id),
    task_title TEXT NOT NULL,
    target_groups VARCHAR(255),
    planned_hours NUMERIC(6,2) NOT NULL DEFAULT 0.00,
    actual_hours NUMERIC(6,2) NOT NULL DEFAULT 0.00,
    semester VARCHAR(20) CHECK (semester IN ('kuzgi', 'bahorgi', 'yillik')),
    due_date DATE,
    status VARCHAR(20) DEFAULT 'rejalashtirilgan' CHECK (status IN ('rejalashtirilgan', 'kutilmoqda', 'tekshiruvda', 'tasdiqlandi', 'qaytarildi')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Topshirilgan hisobotlar va ekspertiza natijalari jadvali
CREATE TABLE IF NOT EXISTS task_submissions (
    id SERIAL PRIMARY KEY,
    task_id INT REFERENCES shir_tasks(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('scopus', 'oak', 'dgu', 'tezis_xalqaro', 'tezis_res', 'uslubiy', 'ustoz_shogird', 'manual')),
    publication_title TEXT NOT NULL,
    doi_url VARCHAR(255),
    co_authors_count INT DEFAULT 1,
    actual_result TEXT,
    verified_by INT REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'tekshiruvda' CHECK (status IN ('tekshiruvda', 'tasdiqlandi', 'qaytarildi')),
    rejection_comment TEXT,
    submission_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tasdiqlovchi fayllar va guvohnomalar jadvali
CREATE TABLE IF NOT EXISTS submission_attachments (
    id SERIAL PRIMARY KEY,
    submission_id INT REFERENCES task_submissions(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size_bytes BIGINT,
    sha256_hash VARCHAR(64),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. O'qituvchilar reyting ballari jadvali
CREATE TABLE IF NOT EXISTS rating_scores (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    year_id INT REFERENCES academic_years(id) ON DELETE CASCADE,
    teaching_score NUMERIC(6,2) DEFAULT 0.00,
    methodical_score NUMERIC(6,2) DEFAULT 0.00,
    scientific_score NUMERIC(6,2) DEFAULT 0.00,
    mentor_score NUMERIC(6,2) DEFAULT 0.00,
    bonus_score NUMERIC(6,2) DEFAULT 0.00,
    penalty_score NUMERIC(6,2) DEFAULT 0.00,
    total_score NUMERIC(6,2) GENERATED ALWAYS AS (
        teaching_score + methodical_score + scientific_score + mentor_score + bonus_score - penalty_score
    ) STORED,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_academic_year UNIQUE (user_id, year_id)
);

-- 9. Tizim xavfsizlik audit jurnali jadvali
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- INDEKSLAR STRATEGIYASI (UNUMDORLIKNI OPTIMALLASHTIRISH)
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_users_email_role ON users(email, role_id);
CREATE INDEX IF NOT EXISTS idx_shir_tasks_user_year ON shir_tasks(user_id, year_id);
CREATE INDEX IF NOT EXISTS idx_shir_tasks_category ON shir_tasks(category_id);
CREATE INDEX IF NOT EXISTS idx_task_submissions_task_status ON task_submissions(task_id, status);
CREATE INDEX IF NOT EXISTS idx_rating_scores_user_year ON rating_scores(user_id, year_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action ON audit_logs(user_id, action);
