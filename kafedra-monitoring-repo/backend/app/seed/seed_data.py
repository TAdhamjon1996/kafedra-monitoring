import os
import sys

# Ensure backend root is on sys.path
backend_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

from datetime import datetime, date, timezone
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, Base, engine
from app.core.security import hash_password
from app.models.entities import (
    Role, User, AcademicYear, ShirCategory, ShirTask,
    TaskSubmission, SubmissionAttachment, RatingScore, AuditLog
)
from app.services.rating_engine import recalculate_user_rating

def seed_database():
    print("Creating tables if not exists...")
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # 1. Seed Roles
        roles_data = [
            {"name": "admin", "description": "Tizim administratori", "permissions": {"manage_users": True, "manage_settings": True, "view_all": True}},
            {"name": "head_of_dept", "description": "Kafedra mudiri", "permissions": {"review_tasks": True, "assign_tasks": True, "export_reports": True, "view_department": True}},
            {"name": "teacher", "description": "Professor-o'qituvchi", "permissions": {"view_own": True, "submit_reports": True, "upload_files": True}}
        ]
        roles_map = {}
        for r in roles_data:
            existing = db.query(Role).filter(Role.name == r["name"]).first()
            if not existing:
                role = Role(name=r["name"], description=r["description"], permissions=r["permissions"])
                db.add(role)
                db.commit()
                db.refresh(role)
                roles_map[r["name"]] = role
            else:
                roles_map[r["name"]] = existing

        # 2. Seed Academic Year
        year = db.query(AcademicYear).filter(AcademicYear.year_name == "2026/2027").first()
        if not year:
            year = AcademicYear(year_name="2026/2027", total_norm_hours=851, is_active=True)
            db.add(year)
            db.commit()
            db.refresh(year)

        # 3. Seed Categories
        categories_data = [
            (1, "1. O‘quv ishlari", 35.0, 1.0),
            (2, "2. O‘quv-uslubiy", 20.0, 1.0),
            (3, "3. Ilmiy-tadqiqot", 25.0, 1.0),
            (4, "4. Ustoz-shogird ishlari", 10.0, 1.0),
            (5, "5. Qo‘shimcha bajarilgan ishlar", 10.0, 1.0)
        ]
        cat_map = {}
        for cid, cname, weight, default_rate in categories_data:
            cat = db.query(ShirCategory).filter(ShirCategory.id == cid).first()
            if not cat:
                cat = ShirCategory(id=cid, category_name=cname, weight_percent=weight, default_rate=default_rate)
                db.add(cat)
                db.commit()
                db.refresh(cat)
            cat_map[cid] = cat

        # 4. Seed Users
        users_to_seed = [
            {
                "fio": "Egamberdiyev Nodir Abdunazarovich",
                "email": "nodir@tuit.uz",
                "password": "nodir2026",
                "role_id": roles_map["teacher"].id,
                "position": "Assistent",
                "department": "Raqamli texnologiyalar konvergensiyasi"
            },
            {
                "fio": "Dots. Aliyev Sardor Asatillayevich",
                "email": "mudir@tuit.uz",
                "password": "mudir2026",
                "role_id": roles_map["head_of_dept"].id,
                "position": "Kafedra mudiri",
                "department": "Raqamli texnologiyalar konvergensiyasi"
            },
            {
                "fio": "Tizim Administratori",
                "email": "admin@tuit.uz",
                "password": "admin2026",
                "role_id": roles_map["admin"].id,
                "position": "Bosh administrator",
                "department": "Raqamli texnologiyalar konvergensiyasi"
            },
            {
                "fio": "Prof. Karimov Baxtiyor Toxirovich",
                "email": "karimov@tuit.uz",
                "password": "karimov2026",
                "role_id": roles_map["teacher"].id,
                "position": "Professor",
                "department": "Raqamli texnologiyalar konvergensiyasi"
            },
            {
                "fio": "Dots. Usmonova Nigora Qobilovna",
                "email": "usmonova@tuit.uz",
                "password": "usmonova2026",
                "role_id": roles_map["teacher"].id,
                "position": "Dotsent",
                "department": "Raqamli texnologiyalar konvergensiyasi"
            }
        ]

        users_map = {}
        for u in users_to_seed:
            user_pass_hash = hash_password(u["password"])
            existing = db.query(User).filter(User.email == u["email"]).first()
            if not existing:
                new_u = User(
                    fio=u["fio"],
                    email=u["email"],
                    password_hash=user_pass_hash,
                    role_id=u["role_id"],
                    department=u["department"],
                    position=u["position"],
                    rate_fraction=1.00
                )
                db.add(new_u)
                db.commit()
                db.refresh(new_u)
                users_map[u["email"]] = new_u
            else:
                existing.password_hash = user_pass_hash
                db.commit()
                users_map[u["email"]] = existing

        nodir = users_map["nodir@tuit.uz"]
        mudir = users_map["mudir@tuit.uz"]

        # 5. Seed Nodir's Tasks (exact 24 tasks: 16 completed, 6 in progress, 2 pending)
        existing_tasks = db.query(ShirTask).filter(ShirTask.user_id == nodir.id).count()
        if existing_tasks == 0:
            print("Seeding authentic 851-hour tasks for Egamberdiyev Nodir...")
            tasks_data = [
                # --- Category 1: O'quv ishlari (8 tasks: 6 completed, 2 in progress -> 75% | 6/8) ---
                (1, "Ma’lumotlar tahlili fani bo‘yicha ma’ruza mashg‘ulotlari (M213-M214-23 KIo‘)", "M213-M214-23 KIo‘", 42.0, 42.0, "kuzgi", "tasdiqlandi", "2026-10-30"),
                (1, "Ma’lumotlar tahlili amaliy mashg‘ulotlari (230-231-23 ATo‘)", "230-231-23 ATo‘", 60.0, 60.0, "kuzgi", "tasdiqlandi", "2026-11-15"),
                (1, "Ma’lumotlar bazasi amaliy va laboratoriya mashg‘ulotlari (210-212-214-25 KIo‘)", "210-212-214-25 KIo‘, 310 DIo‘", 180.0, 180.0, "kuzgi", "tasdiqlandi", "2026-12-10"),
                (1, "Oraliq va yakuniy nazoratlarni qabul qilish (030-031-22 SATo‘)", "030-031-22 SATo‘", 46.0, 46.0, "kuzgi", "tasdiqlandi", "2026-12-25"),
                (1, "Ma’lumotlar tahlili fani amaliy mashg‘ulotlari (0130-23 SATo‘)", "0130-23 SATo‘", 6.0, 6.0, "kuzgi", "tasdiqlandi", "2026-12-28"),
                (1, "Ma’ruza konspektlarini Moodle platformasiga joylash", "Barcha oqimlar", 40.0, 40.0, "kuzgi", "tasdiqlandi", "2026-09-20"),
                (1, "Ma’lumotlar tahlili (TF) bahorgi semestr darslari (230-231-24)", "230-231-24", 121.0, 60.0, "bahorgi", "jarayonda", "2027-04-15"),
                (1, "Diplom loyihasi (DL / BMI) va amaliyotga rahbarlik", "Bitiruvchilar", 118.0, 40.0, "bahorgi", "jarayonda", "2027-05-30"),

                # --- Category 2: O'quv-uslubiy (7 tasks: 4 completed, 1 in progress, 2 pending -> 57% | 4/7) ---
                (2, "Ma’lumotlar bazasini boshqarish tizimlari fanidan 60 betlik uslubiy ko‘rsatma", "TATU Ilmiy kengashi", 60.0, 60.0, "yillik", "tasdiqlandi", "2026-12-31"),
                (2, "Ma’lumotlar bazasi fani sillabusi va ishchi o‘quv dasturini ishlab chiqish", "Kafedra fanlari", 20.0, 20.0, "kuzgi", "tasdiqlandi", "2026-09-10"),
                (2, "Moodle platformasida elektron o‘quv-uslubiy majmua (EO‘UM) yaratish", "Kafedra fanlari", 30.0, 30.0, "kuzgi", "tasdiqlandi", "2026-10-20"),
                (2, "Amaliy mashg‘ulotlar uchun virtual laboratoriya topshiriqlari bazasi", "Laboratoriyalar", 25.0, 25.0, "kuzgi", "tasdiqlandi", "2026-11-20"),
                (2, "Dars ishlanmalari va slaydlarni yuklash", "Moodle / Kafedra portali", 25.0, 10.0, "bahorgi", "tekshiruvda", "2027-03-30"),
                (2, "Ma’lumotlar tahlili fanidan yangi avlod o‘quv qo‘llanmasini tayyorlash", "Mualliflar guruhi", 40.0, 0.0, "bahorgi", "kutilmoqda", "2027-05-15"),
                (2, "Xalqaro ta’lim standartlari asosida test savollari bankini yangilash", "Test markazi", 20.0, 0.0, "bahorgi", "kutilmoqda", "2027-06-01"),

                # --- Category 3: Ilmiy-tadqiqot (6 tasks: 3 completed, 1 in progress, 2 pending/in-progress -> 50% | 3/6) ---
                (3, "Scopus bazasidagi ilmiy maqola (0.25 b.t.): 'Distributed Stream Analytics Architecture in Scalable Cloud Environments'", "Journal of Cloud Computing & Big Data Analytics", 50.0, 50.0, "yillik", "tasdiqlandi", "2027-06-28"),
                (3, "OAK ro‘yxatidagi ilmiy jurnalda maqola chop etish", "TATU Ilmiy-texnik jurnali", 30.0, 30.0, "kuzgi", "tasdiqlandi", "2026-11-30"),
                (3, "Elektron hisoblash mashinalari uchun dasturiy vosita (DGU 38192)", "Adliya vazirligi IMA", 25.0, 25.0, "kuzgi", "tasdiqlandi", "2026-12-15"),
                (3, "Ikkinchi dasturiy vositaga DGU mualliflik guvohnomasini rasmiylashtirish", "Adliya vazirligi IMA", 25.0, 10.0, "bahorgi", "tekshiruvda", "2027-04-20"),
                (3, "Xalqaro ilmiy-amaliy anjumanda ma’ruza bilan ishtirok etish va tezis", "Xalqaro konferensiya", 10.0, 10.0, "bahorgi", "tasdiqlandi", "2027-04-10"),
                (3, "Respublika ilmiy anjumanida ma’ruza tezisi e’lon qilish", "Respublika anjumani", 5.0, 0.0, "bahorgi", "kutilmoqda", "2027-05-20"),

                # --- Category 4: Ustoz-shogird ishlari (5 tasks: 4 completed, 1 in progress -> 80% | 4/5) ---
                (4, "230-23ATo‘ akademik guruhiga murabbiylik faoliyati va tarbiyaviy soatlar", "230-23ATo‘", 20.0, 20.0, "kuzgi", "tasdiqlandi", "2026-12-20"),
                (4, "Iqtidorli talabalarni dasturlash bo‘yicha Respublika fan olimpiadasiga tayyorlash", "4 nafar talaba", 15.0, 15.0, "yillik", "tasdiqlandi", "2027-03-25"),
                (4, "Maktab va texnikum yoshlari o‘rtasida IT kasbiga yo‘naltirish ochiq darslari", "Toshkent maktablari", 10.0, 10.0, "kuzgi", "tasdiqlandi", "2026-11-10"),
                (4, "Kafedra qoshidagi 'Ma’lumotlar tahlilchisi' talabalar to‘garagini boshqarish", "To‘garak a’zolari", 15.0, 15.0, "bahorgi", "tasdiqlandi", "2027-04-05"),
                (4, "Talabalar startap loyihalariga mentorlik qilish va tanlovga hujjat topshirish", "Startap jamoasi", 15.0, 5.0, "bahorgi", "tekshiruvda", "2027-05-10"),

                # --- Category 5: Qo‘shimcha bajarilgan ishlar (6 tasks: 4 completed, 2 in progress/pending -> 67% | 4/6) ---
                (5, "Kafedra elektron kutubxonasi va repozitoriysini yangilash", "Kafedra serveri", 15.0, 15.0, "kuzgi", "tasdiqlandi", "2026-10-15"),
                (5, "Fakultet ilmiy kengashiga taqdimot materiallarini tayyorlashda ishtirok", "Fakultet dekanati", 10.0, 10.0, "kuzgi", "tasdiqlandi", "2026-11-25"),
                (5, "Xalqaro Erasmus+ loyihasi seminarlarida kafedra vakili sifatida qatnashish", "Erasmus+ konsorsiumi", 15.0, 15.0, "bahorgi", "tasdiqlandi", "2027-03-15"),
                (5, "Yangi o‘quv yili uchun auditoriya kompyuterlarini dasturiy ta’minot bilan sozlash", "Kafedra laboratoriyasi", 20.0, 20.0, "kuzgi", "tasdiqlandi", "2026-09-01"),
                (5, "Universitet ochiq eshiklar kunida kafedra ko‘rgazmasini tashkil etish", "Universitet jamoasi", 10.0, 0.0, "bahorgi", "kutilmoqda", "2027-05-01"),
                (5, "Talabalar yotoqxonasida navbatchilik va tarbiyaviy suhbatlar o‘tkazish", "Talabalar turar joyi", 10.0, 5.0, "yillik", "jarayonda", "2027-04-20"),
            ]

            # We insert tasks and sample submissions
            for cat_id, title, groups, planned, actual, semester, status_val, due_str in tasks_data:
                d_date = datetime.strptime(due_str, "%Y-%m-%d").date()
                task = ShirTask(
                    user_id=nodir.id,
                    year_id=year.id,
                    category_id=cat_id,
                    task_title=title,
                    target_groups=groups,
                    planned_hours=planned,
                    actual_hours=actual,
                    semester=semester,
                    status=status_val,
                    due_date=d_date
                )
                db.add(task)
                db.commit()
                db.refresh(task)

                # If status is tasdiqlandi or tekshiruvda, create submission records
                if status_val in ["tasdiqlandi", "tekshiruvda"]:
                    act_type = "manual"
                    if "Scopus" in title:
                        act_type = "scopus"
                    elif "OAK" in title:
                        act_type = "oak"
                    elif "DGU" in title:
                        act_type = "dgu"
                    elif "Xalqaro" in title:
                        act_type = "tezis_xalqaro"
                    elif "uslubiy" in title:
                        act_type = "uslubiy"
                    elif cat_id == 4:
                        act_type = "ustoz_shogird"

                    doi = "https://doi.org/10.1109/JCCBDA.2026.104523" if act_type == "scopus" else None
                    sub = TaskSubmission(
                        task_id=task.id,
                        activity_type=act_type,
                        publication_title=title,
                        doi_url=doi,
                        co_authors_count=2 if act_type == "scopus" else 1,
                        actual_result=f"Vazifa to'liq bajarildi. Tasdiqlovchi rasmiy hujjatlar ilova qilindi.",
                        verified_by=mudir.id if status_val == "tasdiqlandi" else None,
                        verified_at=datetime.now(timezone.utc) if status_val == "tasdiqlandi" else None,
                        status="tasdiqlandi" if status_val == "tasdiqlandi" else "tekshiruvda",
                        submission_date=datetime.now(timezone.utc)
                    )
                    db.add(sub)
                    db.commit()
                    db.refresh(sub)

                    # Add sample attachment
                    att = SubmissionAttachment(
                        submission_id=sub.id,
                        file_name=f"{act_type}_tasdiqnoma.pdf",
                        file_url=f"/api/v1/files/download/{nodir.id}/{act_type}_tasdiqnoma.pdf",
                        file_type="application/pdf",
                        file_size_bytes=1024 * 350,
                        sha256_hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
                    )
                    db.add(att)
                    db.commit()

            # Seed other faculty members for leaderboard
            for u in [users_map["karimov@tuit.uz"], users_map["usmonova@tuit.uz"]]:
                sample_t = ShirTask(
                    user_id=u.id,
                    year_id=year.id,
                    category_id=1,
                    task_title="Auditoriya ma'ruza va amaliyot mashg'ulotlari",
                    planned_hours=650.0,
                    actual_hours=650.0,
                    semester="yillik",
                    status="tasdiqlandi"
                )
                db.add(sample_t)
                db.commit()
                recalculate_user_rating(db, u.id, year.id)

            # Recalculate Nodir's rating
            recalculate_user_rating(db, nodir.id, year.id)
            print("Egamberdiyev Nodir tasks and ratings seeded successfully.")

        # Seed initial Audit Log
        admin_id = users_map["admin@tuit.uz"].id
        audit = AuditLog(
            user_id=admin_id,
            action="Tizim boshlang'ich ma'lumotlar bilan ishga tushirildi",
            ip_address="127.0.0.1",
            details="2026/2027 o'quv yili me'yorlari va foydalanuvchilar kontingenti yaratildi."
        )
        db.add(audit)
        db.commit()

    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
