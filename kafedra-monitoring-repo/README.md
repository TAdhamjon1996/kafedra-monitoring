# KAFEDRA PROFESSOR-O‘QITUVCHILARINING ILMIY FAOLIYATINI MONITORING QILISH AXBOROT TIZIMI

> **Muallif:** Egamberdiyev Nodir Abdunazarovich  
> **Ta'lim muassasasi:** Muhammad al-Xorazmiy nomidagi Toshkent axborot texnologiyalari universiteti (TATU)  
> **Kafedra:** "Raqamli texnologiyalar konvergensiyasi"  
> **Ilmiy rahbar:** p.f.d., prof. F.M. Zakirova  
> **Kafedra mudiri:** Dots. Aliyev S.A.  
> **O‘quv yili:** 2026/2027

---

## 1. LOYIHA HAQIDA VA DOLZARBLIGI

Ushbu axborot tizimi Oliy ta’lim muassasalarida professor-o‘qituvchilarning shaxsiy ish rejasi (SHIR) hamda ilmiy-tadqiqot faoliyati ko‘rsatkichlarini (Scopus, Web of Science, OAK jurnallari, DGU intellektual mulk guvohnomalari, xalqaro va respublika konferensiya tezislari) yig‘ish, tekshirish, tasdiqlash hamda ko‘p mezonli reyting ballarini inson omilisiz avtomatlashtirilgan tarzda hisoblash uchun mo‘ljallangan to‘liq **3-Tier (uch pog‘onali)** veb-platformadir.

Tizim ilova qilingan 2 ta UI maket (Ommaviy Landing sahifasi hamda O‘qituvchi shaxsiy kabineti) asosida, imlo xatolaridan xoli toza **O‘zbek tili (Lotin)** interfeysida ishlab chiqilgan.

---

## 2. TEXNOLOGIK STEK

| Qatlam | Texnologiyalar | Vazifasi va afzalliklari |
| :--- | :--- | :--- |
| **Frontend (Presentation Layer)** | React 19, TypeScript, Tailwind CSS, Lucide Icons, SVG Radial Indicators | UI maketlarga (1 va 2-rasmlar) 100% mos zamonaviy interfeys, `#1D5CE5` korporativ ko‘k rang palitrasi, moslashuvchan (Responsive) dizayn |
| **Backend (Business Logic Layer)** | Python 3.10+, FastAPI, SQLAlchemy ORM, Pydantic v2 | Yuqori unumdorlik, avtomatik interaktiv OpenAPI/Swagger hujjatlashtirish, chekli avtomat (State Machine) |
| **Xavfsizlik & Autentifikatsiya** | JWT (JSON Web Tokens), `HTTP-only` cookies, `bcrypt` parol xeshlash | OWASP Top 10 talablariga mos xavfsizlik, BOLA / IDOR himoyasi, MIME magic-bytes fayl tekshiruvi, SHA-256 xesh |
| **Hisobotlar & Eksport** | `openpyxl` (Excel), `reportlab` (PDF) | Rasmiy tasdiqlangan SHIR shaklini 1 marta bosishda `.xlsx` va `.pdf` formatida generatsiya qilish |
| **Ma'lumotlar bazasi** | PostgreSQL (3NF/BCNF) + SQLite (`monitoring.db`) | 8 ta relyatsion jadval, indekslar, kaskadli o‘chirishlar va audit jurnallari |

---

## 3. MA'LUMOTLAR BAZASI STRUKTURASI (8 TA JADVAL)

1. `roles` — rollar modeli (`admin`, `head_of_dept`, `teacher`).
2. `users` — professor-o‘qituvchilar va rahbarlar ma'lumotlari (`fio`, `email`, `password_hash`, `role_id`, `department`, `position`, `rate_fraction`).
3. `academic_years` — o‘quv yili va me'yoriy soat (`year_name="2026/2027"`, `total_norm_hours=851`, `is_active=True`).
4. `shir_categories` — SHIR ning 5 ta asosiy yo‘nalishi:
   - `1`: O‘quv ishlari
   - `2`: O‘quv-uslubiy ishlar
   - `3`: Ilmiy-tadqiqot ishlari
   - `4`: Ustoz-shogird ishlari
   - `5`: Qo‘shimcha bajarilgan ishlar
5. `shir_tasks` — shaxsiy ish rejasidagi 24 ta topshiriq (`user_id`, `year_id`, `category_id`, `task_title`, `target_groups`, `planned_hours`, `actual_hours`, `semester`, `due_date`, `status`).
6. `task_submissions` — o‘qituvchi tomonidan topshirilgan hisobotlar (`task_id`, `activity_type`, `publication_title`, `doi_url`, `co_authors_count`, `actual_result`, `status`, `rejection_comment`).
7. `submission_attachments` — tasdiqlovchi fayllar (`submission_id`, `file_name`, `file_url`, `file_type`, `file_size_bytes`, `sha256_hash`).
8. `rating_scores` — hisoblangan reyting ballari (`user_id`, `teaching_score`, `methodical_score`, `scientific_score`, `mentor_score`, `bonus_score`, `penalty_score`, `total_score`).
9. `audit_logs` — xavfsizlik va audit jurnali (`user_id`, `action`, `ip_address`, `details`, `created_at`).

---

## 4. MATEMATIK REYTING FORMULASI VA HAMMUALLIFLIK KOEFFITSIYENTI

Tizimda ballar inson subyektivizmidan xoli ravishda quyidagi matematik formula asosida hisoblanadi:

$$R_{umumiy} = R_{o'quv} + R_{uslubiy} + R_{ilmiy} + R_{ustoz} + R_{bonus} - R_{jarima}$$

### A) Ilmiy-tadqiqot ishlari ($R_{ilmiy}$):
$$R_{ilmiy} = \sum (\text{Baza ball} \times K_h)$$

- **Bazaviy ballar:**
  - Scopus / Web of Science maqolasi: **50 ball**
  - OAK e'tirofidagi xalqaro/milliy jurnal: **30 ball**
  - DGU dasturiy ta'minot guvohnomasi (patent): **25 ball**
  - Xalqaro konferensiya tezisi: **10 ball**
  - Respublika konferensiya tezisi: **5 ball**
- **Hammualliflik koeffitsiyenti ($K_h$):**
  - $m = 1$ muallif: $K_h = 1.0$ (100% ball)
  - $m = 2$ muallif: $K_h = 0.6$ (60% ball har biriga)
  - $m \ge 3$ muallif: $K_h = \frac{1}{m}$

### B) O‘quv ishlari ($R_{o'quv}$):
Tasdiqlangan auditoriya soatlari: $\text{soat} \times 0.1$ ball (masalan: 351 soat auditoriya = 35.1 ball).

### C) O‘quv-uslubiy ishlar ($R_{uslubiy}$):
- Uslubiy ko‘rsatma / qo‘llanma: **20 ball**
- Darslik / Monografiya: **40 ball**
- Elektron o‘quv-uslubiy majmua (EO‘UM) / slaydlar: **15 ball**

### D) Ustoz-shogird ishlari ($R_{ustoz}$):
To‘garak, fan olimpiadasi yoki talabalar ilmiy anjumanidagi har bir tasdiqlangan tadbir uchun: **15 ball**.

---

## 5. TIZIMNI ISHGA TUSHIRISH YO‘RIQNOMASI

### Usul 1: Yagona buyruq bilan ishga tushirish (Tavsiya etiladi)
Backend o‘rnatilgan React SPA build (`dist/`) fayllarini avtomatik statik resurs sifatida xizmat qiladi:

```bash
cd "d:\2026-2027\bitiruv ishi\monitoring-system\backend"
python run.py
```
Brauzerda oching: **[http://127.0.0.1:8000/](http://127.0.0.1:8000/)**  
Interaktiv API hujjatlari: **[http://127.0.0.1:8000/api/v1/docs](http://127.0.0.1:8000/api/v1/docs)**

---

### Usul 2: Dasturchi rejimi (Developer Mode)
Agar frontend kodlariga o‘zgartirish kiritib, Hot Module Replacement (HMR) dan foydalanmoqchi bo‘lsangiz:

**1-terminal (Backend):**
```bash
cd "d:\2026-2027\bitiruv ishi\monitoring-system\backend"
python run.py
```

**2-terminal (Frontend):**
```bash
cd "d:\2026-2027\bitiruv ishi\monitoring-system\frontend"
npm run dev
```
Brauzerda oching: **[http://127.0.0.1:5173/](http://127.0.0.1:5173/)**

---

## 6. TEST FOYDALANUVCHILARI (1-CLICK KIRISH)

Kirish modalida test uchun quyidagi profillardan 1 ta bosish orqali foydalanishingiz mumkin:

| Profil | Login (Email) | Parol | Roli va Huquqlari |
| :--- | :--- | :--- | :--- |
| **Egamberdiyev Nodir** | `nodir@tuit.uz` | `nodir2026` | **O‘qituvchi (Assistent, 1.0 stavka)** — 24 ta topshiriq, 851 soat reja, hisobot yuklash, shaxsiy reyting, Excel/PDF yuklab olish |
| **Dots. Aliyev S.A.** | `mudir@tuit.uz` | `mudir2026` | **Kafedra mudiri** — Kelib tushgan hisobotlarni ko‘rib chiqish, tasdiqlash, qaytarish, kafedra reytingi va yuklamalarni qayta taqsimlash |
| **Administrator** | `admin@tuit.uz` | `admin2026` | **Bosh administrator** — Foydalanuvchilar boshqaruvi, audit jurnali, o‘quv yili sozlamalari |

---

## 7. XAVFSIZLIK VA FAYL VALIDATSIYASI (OWASP TOP 10)

1. **MIME Magic-Bytes tekshiruvi:** Yuklanayotgan fayllarning faqat kengaytmasi (`.pdf`, `.jpg`, `.png`) emas, balki boshlang‘ich baytlari (`%PDF-`, `\xFF\xD8\xFF`, `\x89PNG`) server tomonidan chuqur tekshiriladi.
2. **SHA-256 xeshlash:** Har bir qabul qilingan faylning kriptografik xeshi hisoblanadi va dublikatlar oldi olinadi.
3. **BOLA / IDOR himoyasi:** O‘qituvchi faqat o‘ziga tegishli `user_id` bo‘yicha topshiriqlarni ko‘rishi va hisobot yuklashi mumkin.
4. **Audit jurnali:** Barcha muhim amallar (login, hisobot topshirish, mudir tasdiqlashi, soat o‘zgarishi) `audit_logs` jadvalida IP-manzil va vaqt bilan saqlanadi.

---

© 2026-2027 TATU "Raqamli texnologiyalar konvergensiyasi" kafedrasi.
