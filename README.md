# AI-Based Study Planner System - Mount Kigali University (MKU)

## Overview
This is an AI-Based Study Planner System developed for Mount Kigali University (MKU) in Kigali, Rwanda. The system uses a rule-based weighted scoring algorithm to generate personalized study plans for students based on their courses, exam dates, difficulty levels, and academic performance.

## Technology Stack
- **Frontend:** HTML & CSS (served as static files)
- **Backend:** Node.js with Express.js
- **Database:** MongoDB with Mongoose
- **AI Engine:** Rule-based weighted scoring algorithm (pure Node.js)
- **Authentication:** JWT (JSON Web Tokens) + bcrypt for password hashing
- **PDF Reports:** PDFKit for generating downloadable PDF reports

## Features

### Student Role
- Registration and login
- Profile setup with course information
- AI-generated personalized study plans
- Weekly study calendar on dashboard
- Exam reminders (7 days or less)
- Progress tracking
- Day-by-day study schedule until each exam

### Lecturer Role
- Add and manage their own courses and subjects
- Set exam dates and difficulty levels for their courses
- View students automatically linked by course code
- View student progress and study plan reports
- Generate PDF reports for their courses and students

### Admin Role
- Manage all user accounts (students and lecturers)
- Create, edit, and delete any user account
- Activate/deactivate user accounts
- Add, edit, and delete courses system-wide
- View all study plans and system reports
- Manage exam timetables for all faculties
- Generate system-wide PDF reports

## Password Policy
Passwords must meet the following requirements:
- Minimum **6 characters** long
- Must contain at least **one letter** (a-z or A-Z)
- Must contain at least **one number** (0-9)

Examples that work: `Study2024`, `admin123`, `Mku2025`  
Examples that fail: `123456` (no letters), `password` (no numbers), `abc` (too short)

## Forgot Password
If a user forgets their password:
1. Click **"Forgot Password?"** on the login page
2. Enter their **email** and **registration/staff number** (identity verification)
3. Set a **new password** (must follow the password policy above)
4. The system verifies both fields match an existing account, then resets the password

No email sending is required — the registration number serves as identity proof.

## How Student-Lecturer Linking Works
The system automatically links students to lecturers through **course codes**:

1. **Lecturer** creates a course with a code (e.g., `CSC 4101 - Artificial Intelligence`)
2. **Student** adds a course with the **same course code** (`CSC 4101`) to their profile
3. The system **automatically matches** them — no manual assignment needed
4. Lecturer clicks "My Students" tab and sees all students who registered their course codes

This means:
- If a lecturer teaches `CSC 4101` and `CSC 4103`
- And a student registers `CSC 4101` in their profile
- That student automatically appears in the lecturer's "My Students" list

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas cloud)
- npm (comes with Node.js)

## Installation

1. **Clone or download the project:**
   ```bash
   cd "AI - Based Study Planner System"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   A `.env` file is already included:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/mku_study_planner
   JWT_SECRET=mku_study_planner_secret_key_2024
   ```

4. **Start MongoDB:**
   Make sure MongoDB is running on your system.

5. **Seed the database with sample data:**
   ```bash
   npm run seed
   ```
   This creates sample accounts and courses for demo purposes.
   Note: The seed script only resets its own demo accounts — any users you create manually through the app are preserved.

6. **Run the application:**
   ```bash
   npm start
   ```
   The browser will open automatically to `http://localhost:3000`

   For development with auto-restart:
   ```bash
   npm run dev
   ```

## Login Credentials

### Lecturer Account
| Field    | Value               |
|----------|---------------------|
| Email    | mugisha@mku.ac.rw   |
| Password | lecturer123         |

### Student Accounts
| Student         | Email                | Password   |
|-----------------|----------------------|------------|
| Uwimana Alice   | uwimana@mku.ac.rw   | student123 |
| Habimana Eric   | habimana@mku.ac.rw   | student123 |
| Mukamana Grace  | mukamana@mku.ac.rw   | student123 |

### Admin Account (created via seed script only — not visible on registration page)
| Field    | Value             |
|----------|-------------------|
| Email    |    admin@mku.ac.rw|
| Password | admin123          |

## How Each Role Logs In

All roles use the **same login page** at `http://localhost:3000`. The system detects the user's role and redirects automatically:

| Role      | Redirects To               |
|-----------|----------------------------|
| Admin     | Admin Dashboard            |
| Lecturer  | Lecturer Dashboard         |
| Student   | Student Dashboard/Profile  |

## Quick Demo Steps

### Test the AI Study Plan:
1. Login as **uwimana@mku.ac.rw** / student123
2. Go to **Dashboard**
3. Click **"Generate New Plan"**
4. The AI algorithm scores each course and creates a day-by-day schedule
5. Go to **Study Plan** page to see the full plan with priority scores

### Test Lecturer-Student Link:
1. Login as **mugisha@mku.ac.rw** / lecturer123
2. Click **"My Students"** tab
3. You'll see students who registered courses with matching codes (CSC 4101, IT 4201, etc.)
4. Click **"Student Progress"** to see their study logs
5. Click **"Reports"** to download a PDF report

### Test Admin Panel:
1. Login as **admin@mku.ac.rw** / admin123
2. View all users, courses, and system statistics
3. Create/delete users, manage courses
4. Download system-wide PDF report

## Project Structure
```
AI - Based Study Planner System/
├── server.js                 # Main server entry point
├── package.json              # Dependencies and scripts
├── seed.js                   # Database seed script (sample data)
├── .env                      # Environment variables
├── README.md                 # This file
├── config/
│   └── db.js                 # Database connection
├── models/
│   ├── User.js               # User schema (with roles)
│   ├── Course.js             # Course schema
│   ├── StudyPlan.js          # Study plan schema
│   └── Progress.js           # Progress schema
├── routes/
│   ├── auth.js               # Authentication routes
│   ├── admin.js              # Admin routes (protected)
│   ├── lecturer.js           # Lecturer routes (protected)
│   ├── courses.js            # Student course routes
│   ├── studyPlan.js          # Study plan routes
│   └── progress.js           # Progress tracking routes
├── middleware/
│   └── auth.js               # JWT auth + role-based access control
├── ai/
│   └── planner.js            # AI scoring algorithm
└── public/
    ├── index.html            # Login/Register page (all roles)
    ├── admin-dashboard.html  # Admin dashboard
    ├── lecturer-dashboard.html # Lecturer dashboard
    ├── profile.html          # Student profile setup
    ├── dashboard.html        # Student dashboard with calendar
    ├── studyplan.html        # Full study plan page
    ├── progress.html         # Progress tracking page
    ├── images/
    │   └── MKUR-logo.png     # University logo
    ├── css/
    │   └── style.css         # Global styles (blue & white theme)
    └── js/
        ├── auth.js           # Authentication logic (role redirect)
        ├── admin.js          # Admin dashboard logic
        ├── lecturer.js       # Lecturer dashboard logic
        ├── profile.js        # Profile page logic
        ├── dashboard.js      # Student dashboard logic
        ├── studyplan.js      # Study plan logic
        └── progress.js       # Progress tracking logic
```

## AI Algorithm Explanation
The AI scoring algorithm assigns study priority to each subject based on four weighted factors:

| Factor | Weight | Logic |
|--------|--------|-------|
| Days Until Exam | 35% | Closer exams get higher priority |
| Previous Grade | 25% | Lower grades need more study time |
| Difficulty Level | 25% | Harder subjects get more attention |
| Credit Hours | 15% | Higher credit courses get priority |

The subject with the highest combined score receives the most study sessions. The algorithm generates a day-by-day plan from today until each exam date, distributing study hours proportionally based on scores.

### Study Topic Suggestions
The AI also suggests what to focus on based on time remaining:
- **20+ days:** Reading & Note Taking
- **10-20 days:** Deep Study & Concept Understanding
- **5-10 days:** Practice Problems & Summary Notes
- **2-5 days:** Revision & Past Papers
- **1-2 days:** Final Review & Practice Questions

## Role-Based Access Control
- All API routes are protected with JWT authentication
- Each role can only access their own endpoints:
  - `/api/admin/*` — Admin only
  - `/api/lecturer/*` — Lecturer only
  - `/api/courses`, `/api/study-plan`, `/api/progress` — Student
  - `/api/auth/*` — All roles (login, register, profile)

## PDF Reports
- **Admin** can download a system-wide PDF report with all users, courses, and exam timetables
- **Lecturer** can download a PDF report of their courses, enrolled students, and student progress
- Reports are generated using PDFKit and downloaded directly from the browser

## Sample Data (Seeded)
The seed script creates realistic MKU Computer Science final year courses:

**Dr. Mugisha's Courses:**
- CSC 4101 - Artificial Intelligence
- CSC 4103 - Software Engineering Project
- CSC 4201 - Machine Learning
- IT 4201 - Cloud Computing
- IT 4205 - Data Science & Analytics

**Student Uwimana's Courses:**
- CSC 4101 - Artificial Intelligence (exam in 5 days)
- CSC 4102 - Database Administration (exam in 8 days)
- CSC 4103 - Software Engineering Project (exam in 12 days)
- CSC 4104 - Computer Networks & Security (exam in 15 days)
- CSC 4105 - Mobile Application Development (exam in 18 days)
- CSC 4106 - Research Methods & Project Writing (exam in 20 days)

## Author
Final Year Undergraduate Project  
Mount Kigali University (MKU)  
Kigali, Rwanda

## Running on Another Computer

If you want to run this project on a different computer (e.g., during defense or on a supervisor's laptop):

**Prerequisites to install on that computer:**
1. **Node.js** - Download from https://nodejs.org (click the green button, run installer)
2. **MongoDB** - Download from https://www.mongodb.com/try/download/community (install with default settings)

**Steps:**
```bash
# 1. Copy the project folder to the computer (USB or download from GitHub)
# 2. Open Command Prompt and navigate to the folder
cd "AI - Based Study Planner System"

# 3. Install packages (needs internet first time)
npm install

# 4. Create demo accounts
npm run seed

# 5. Start the app
npm start

# 6. Browser opens at http://localhost:3000
```

**Troubleshooting:**
- "Port in use" error: Change `PORT=3001` in the `.env` file
- "MongoDB connection failed": Make sure MongoDB service is running (check Windows Services app)
- "npm not found": Node.js is not installed properly, reinstall it
- Browser does not open: Manually go to http://localhost:3000
- Old data showing: Run `npm run seed` again to reset demo data

## License
This project is developed for academic purposes at Mount Kigali University.
