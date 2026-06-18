# AI-Based Study Planner System
## Final Year Project Presentation
### Mount Kigali University (MKU) — Kigali, Rwanda

---

## Slide 1: Title

**AI-Based Study Planner System**

- Student Name: [Your Name]
- Registration Number: [Your Reg Number]
- Supervisor: [Supervisor Name]
- Program: [Your Program]
- Academic Year: 2024/2025
- Institution: Mount Kigali University

---

## Slide 2: Problem Statement

**The Problem Students Face:**

- Students have many courses with different exam dates
- They don't know which subject to study first
- Some subjects are harder than others but students give them equal time
- Students forget exam dates until it's too late
- There is no tool at MKU that helps students plan their study time intelligently

**Result:** Students perform poorly because they study the wrong subjects at the wrong time.

---

## Slide 3: Objectives

**Main Objective:**
To develop an AI-based system that automatically creates personalized study plans for students at Mount Kigali University.

**Specific Objectives:**
1. To design a system where students can register their courses and exam dates
2. To implement an AI algorithm that scores each subject by urgency and difficulty
3. To generate day-by-day study schedules from today until each exam
4. To allow lecturers to monitor student study progress
5. To provide administrators with system-wide management and reporting tools

---

## Slide 4: Why is this "AI"?

**What makes this system intelligent (AI)?**

The system uses a **Rule-Based Weighted Scoring Algorithm** — this is a type of AI that makes decisions based on rules, just like a human tutor would.

**How a human tutor thinks:**
- "Your math exam is in 2 days — study math NOW"
- "You got 45% in physics last time — you need extra physics time"
- "Database is a 5-credit course — it's more important"
- "You rated AI as very hard — give it more hours"

**How our AI thinks (the same way, but automatically):**

| Factor | Weight | Meaning |
|--------|--------|---------|
| Days until exam | 35% | Closer exam = study more |
| Previous grade | 25% | Lower grade = study more |
| Difficulty level | 25% | Harder subject = study more |
| Credit hours | 15% | More credits = more important |

The AI **scores every subject** using these 4 rules, then gives the highest-scored subject the most study time. This is called a **Weighted Scoring Model** — a recognized AI technique used in decision-making systems.

---

## Slide 5: How the AI Algorithm Works (Simple Example)

**Example: Student has 3 courses**

| Course | Exam in | Last Grade | Difficulty | Credits |
|--------|---------|------------|------------|---------|
| AI | 3 days | 58% | 5/5 | 4 |
| Networks | 10 days | 72% | 3/5 | 3 |
| Research | 20 days | 85% | 2/5 | 2 |

**AI calculates scores:**
- AI: urgency(high) + weakness(high) + hard(high) + credits(high) = **Score: 72.5**
- Networks: urgency(medium) + weakness(low) + medium + medium = **Score: 41.2**
- Research: urgency(low) + strength(low) + easy(low) + low = **Score: 22.8**

**AI decision:** Give AI the most study hours, Networks gets second priority, Research gets least time.

**This happens automatically every day** — as exams get closer, scores change and the plan updates.

---

## Slide 6: System Features

| Feature | Student | Lecturer | Admin |
|---------|---------|----------|-------|
| Register & Login | ✅ | ✅ | ✅ |
| Add courses | ✅ | ✅ | ✅ |
| AI-generated study plan | ✅ | — | — |
| Weekly calendar | ✅ | — | — |
| Exam reminders (7 days) | ✅ | — | — |
| Progress tracking | ✅ | View only | View only |
| View enrolled students | — | ✅ | ✅ |
| PDF reports | — | ✅ | ✅ |
| Manage all users | — | — | ✅ |
| Forgot password | ✅ | ✅ | ✅ |

---

## Slide 7: Technology Stack

| Component | Technology | Why We Chose It |
|-----------|-----------|-----------------|
| Frontend (what you see) | HTML + CSS | Simple, works in any browser, no installation needed |
| Backend (server logic) | Node.js + Express.js | Fast, handles many users, JavaScript everywhere |
| Database (stores data) | MongoDB | Flexible, stores courses/plans easily, free |
| AI Engine | Pure Node.js algorithm | No external API needed, runs offline, fast |
| Security | JWT + bcrypt | Industry standard for login protection |
| PDF Reports | PDFKit | Generates downloadable reports |

---

## Slide 8: System Architecture (How it Works)

```
┌─────────────────────────────────────────────────────────┐
│                    USER'S BROWSER                         │
│  (Login Page, Dashboard, Study Plan, Progress)           │
└─────────────────────┬───────────────────────────────────┘
                      │ fetch API (sends/receives data)
                      ▼
┌─────────────────────────────────────────────────────────┐
│                  NODE.JS SERVER                           │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Auth    │  │  Routes      │  │  AI Planner      │  │
│  │  (JWT)   │  │  (API)       │  │  (Scoring)       │  │
│  └──────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────┬───────────────────────────────────┘
                      │ Mongoose (reads/writes)
                      ▼
┌─────────────────────────────────────────────────────────┐
│                   MONGODB DATABASE                        │
│  ┌────────┐ ┌─────────┐ ┌────────────┐ ┌──────────┐   │
│  │ users  │ │ courses │ │ studyplans │ │ progress │   │
│  └────────┘ └─────────┘ └────────────┘ └──────────┘   │
└─────────────────────────────────────────────────────────┘
```

**In simple words:**
1. Student opens the website in their browser
2. Browser talks to the server (asks for data or sends data)
3. Server processes requests, runs the AI algorithm when needed
4. Server saves/reads data from the database
5. Server sends results back to the browser to display

---

## Slide 9: Database Design

**4 Collections (like tables):**

**1. users** — stores all accounts
- fullName, email, password (encrypted), registrationNumber, role (student/lecturer/admin)

**2. courses** — stores courses for each user
- courseName, courseCode, creditHours, difficultyLevel, previousGrade, examDate

**3. studyplans** — stores AI-generated plans
- dailyPlans (array of days, each with study sessions), startDate, endDate

**4. progress** — tracks study completion
- course, date, hoursStudied, completed (yes/no), understandingLevel (1-5)

---

## Slide 10: How Student-Lecturer Link Works

**No manual assignment needed — it's automatic!**

```
LECTURER creates:          STUDENT registers:
CSC 4101 - AI              CSC 4101 - AI  ← SAME CODE!
CSC 4103 - Software Eng    CSC 4103 - Software Eng ← MATCH!

System sees matching course codes → Links them automatically
Lecturer can now see student's progress
```

**The course code is the key** — when a student adds a course with the same code as a lecturer's course, the system knows that student is in that lecturer's class.

---

## Slide 11: Security Features

1. **Password Hashing (bcrypt):** Passwords are scrambled before storage — even if database is stolen, passwords cannot be read
2. **JWT Tokens:** After login, users get a digital "pass" that expires in 7 days
3. **Role-Based Access:** Students cannot access admin pages, lecturers cannot delete users
4. **Password Policy:** Must have letters + numbers (e.g., Study2024) — no weak passwords allowed
5. **Forgot Password:** Verified by email + registration number combination

---

## Slide 12: Screenshots / Demo

**Demo Flow:**
1. Open http://localhost:3000
2. Login as student (uwimana@mku.ac.rw / student123)
3. Show Dashboard with exam reminders
4. Click "Generate New Plan" — AI creates the study schedule
5. Show Study Plan page with day-by-day sessions and priority scores
6. Log a progress entry
7. Login as lecturer — show linked students
8. Login as admin — show user management and PDF report

---

## Slide 13: How to Install and Run

**Step 1: Install Required Software**
- Download and install Node.js from https://nodejs.org (click the big green button)
- Download and install MongoDB from https://www.mongodb.com/try/download/community

**Step 2: Get the Project**
```
Download from: https://github.com/softboyai/AI-based-study
Or copy the project folder to your Desktop
```

**Step 3: Install Dependencies**
- Open Command Prompt (cmd)
- Navigate to the project folder
- Type: `npm install`

**Step 4: Start the System**
- Make sure MongoDB is running
- Type: `npm run seed` (creates demo accounts — only needed once)
- Type: `npm start`
- Browser opens automatically at http://localhost:3000

---

## Slide 14: How to Customize Colors

The entire system uses **CSS variables** in ONE file: `public/css/style.css`

Change the values at the top and EVERYTHING updates (navbar, buttons, cards, titles, links, badges, alerts).

```css
:root {
    --primary-blue: #1a56db;       /* Navbar, main buttons, links, stat numbers, progress bar */
    --primary-dark: #1e3a5f;       /* Navbar gradient, page titles, card headers, plan day headers */
    --primary-light: #3b82f6;      /* Button hover, active links */
    --secondary-blue: #60a5fa;     /* Progress bar end gradient */
    --accent-blue: #dbeafe;        /* Table headers, info boxes, badge backgrounds */
    --success: #10b981;            /* Save buttons, completed badges, success alerts */
    --warning: #f59e0b;            /* Exam reminders, partial badges, star ratings */
    --danger: #ef4444;             /* Delete buttons, logout, error alerts, urgent text */
    --light-gray: #f8fafc;        /* Page body background */
    --gray: #e2e8f0;              /* Borders, dividers, input borders */
    --text-dark: #1e293b;         /* All main text */
    --text-medium: #475569;       /* Labels, descriptions */
    --text-light: #94a3b8;        /* Placeholders, hints */
}
```

**To make it green:** Replace `--primary-blue: #059669; --primary-dark: #064e3b; --primary-light: #10b981; --secondary-blue: #6ee7b7; --accent-blue: #d1fae5;`

**To make it purple:** Replace `--primary-blue: #7c3aed; --primary-dark: #4c1d95; --primary-light: #8b5cf6; --secondary-blue: #c4b5fd; --accent-blue: #ede9fe;`

Steps: Open style.css, change the 5 values, save, refresh browser.

---

## Slide 15: How to Run on Another Computer

**What you need on the new computer:**
1. Node.js (download from nodejs.org, click the big green button, install)
2. MongoDB (download from mongodb.com/try/download/community, install)

**Steps to run:**
```
Step 1: Copy the project folder to the new computer
        (or download from GitHub: https://github.com/softboyai/AI-based-study)

Step 2: Open Command Prompt (cmd) or Terminal

Step 3: Navigate to the project folder
        cd "AI - Based Study Planner System"

Step 4: Install all packages
        npm install

Step 5: Make sure MongoDB is running
        (on Windows it runs automatically after install)

Step 6: Create demo accounts
        npm run seed

Step 7: Start the application
        npm start

Step 8: Browser opens automatically at http://localhost:3000
```

**If browser does not open:** manually type http://localhost:3000 in Chrome or Firefox.

**If you get "port in use" error:** close any other Node.js apps or change PORT=3001 in the .env file.

**If MongoDB connection fails:** make sure MongoDB service is running (check Windows Services or run `mongod` in terminal).

---

## Slide 15: Challenges and Solutions

| Challenge | Solution |
|-----------|----------|
| Students study without plan | AI algorithm creates optimized daily schedule |
| Don't know which subject is urgent | Scoring system weighs exam proximity at 35% |
| Weak subjects get neglected | Previous grade factor gives weak subjects more time |
| No connection between lecturer and student | Automatic linking by course code |
| Forgotten passwords | Reset using email + registration number |
| Security concerns | bcrypt hashing + JWT tokens + role-based access |

---

## Slide 16: Future Improvements

1. **Email notifications** — Send exam reminders via email
2. **Mobile app** — Build Android/iOS version
3. **AI learning** — Track which study strategies work best and adapt
4. **Group study** — Allow students to form study groups
5. **Integration with MKU systems** — Pull courses automatically from university database
6. **Offline mode** — Allow students to view plans without internet

---

## Slide 17: Conclusion

The AI-Based Study Planner System successfully:

✅ Automatically generates personalized study plans using AI scoring
✅ Prioritizes subjects based on urgency, difficulty, grade, and importance
✅ Provides a day-by-day schedule that adapts as exams approach
✅ Links students to lecturers automatically through course codes
✅ Supports three user roles with proper security
✅ Generates PDF reports for academic monitoring

**This system solves a real problem** that MKU students face daily — not knowing what to study and when. By using AI to make these decisions, students can focus on actually studying instead of planning.

---

## Slide 18: Thank You & Questions

**Thank you for your attention!**

**Project Repository:** https://github.com/softboyai/AI-based-study

**Demo Login Credentials:**
- Student: uwimana@mku.ac.rw / student123
- Lecturer: mugisha@mku.ac.rw / lecturer123

Questions?
