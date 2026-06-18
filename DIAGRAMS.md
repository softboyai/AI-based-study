# System Diagrams — AI-Based Study Planner System
## Mount Kigali University (MKU)

Paste these Mermaid diagrams into https://mermaid.live to generate images for your book.

---

## 1. Context Diagram (Level 0 DFD)

Shows the entire system as ONE box and who interacts with it.

```mermaid
graph LR
    S((Student)) -->|Register, Add Courses,<br/>Generate Plan, Log Progress| SYS[AI-Based Study<br/>Planner System]
    L((Lecturer)) -->|Add Courses, Set Exams,<br/>View Students, Download Report| SYS
    A((Admin)) -->|Manage Users, Manage Courses,<br/>View Reports, Download PDF| SYS
    SYS -->|Study Plan, Reminders,<br/>Calendar, Progress Stats| S
    SYS -->|Student List, Progress Data,<br/>PDF Report| L
    SYS -->|User List, System Stats,<br/>PDF Report| A
    SYS -->|Read/Write Data| DB[(MongoDB<br/>Database)]
```

---

## 2. Data Flow Diagram — Level 1 (DFD Level 1)

Shows the main processes inside the system and how data flows between them.

```mermaid
graph TD
    S((Student)) --> P1[1.0 Authentication<br/>& Registration]
    L((Lecturer)) --> P1
    A((Admin)) --> P1

    P1 -->|User Data| D1[(users)]
    P1 -->|JWT Token| S
    P1 -->|JWT Token| L
    P1 -->|JWT Token| A

    S -->|Course Info| P2[2.0 Course<br/>Management]
    L -->|Course Info| P2
    A -->|Course Info| P2
    P2 -->|Store/Retrieve| D2[(courses)]

    S -->|Generate Request| P3[3.0 AI Study Plan<br/>Generator]
    P3 -->|Read Courses| D2
    P3 -->|Read Profile| D1
    P3 -->|Store Plan| D3[(studyplans)]
    P3 -->|Study Plan| S

    S -->|Log Session| P4[4.0 Progress<br/>Tracking]
    P4 -->|Store Progress| D4[(progress)]
    P4 -->|Stats| S
    L -->|View Progress| P4
    P4 -->|Student Progress| L

    L -->|Request Report| P5[5.0 Report<br/>Generation]
    A -->|Request Report| P5
    P5 -->|Read All Data| D1
    P5 -->|Read All Data| D2
    P5 -->|Read All Data| D4
    P5 -->|PDF File| L
    P5 -->|PDF File| A

    A -->|Manage Users| P6[6.0 User<br/>Management]
    P6 -->|CRUD Users| D1
```

---

## 3. Use Case Diagram — Student Role

```mermaid
graph LR
    subgraph "AI-Based Study Planner System"
        UC1[Register Account]
        UC2[Login]
        UC3[Setup Profile]
        UC4[Add Courses]
        UC5[Edit/Delete Course]
        UC6[Generate AI Study Plan]
        UC7[View Weekly Calendar]
        UC8[View Full Study Plan]
        UC9[View Exam Reminders]
        UC10[Log Study Progress]
        UC11[View Progress Statistics]
        UC12[Reset Password]
    end

    Student((Student))
    Student --- UC1
    Student --- UC2
    Student --- UC3
    Student --- UC4
    Student --- UC5
    Student --- UC6
    Student --- UC7
    Student --- UC8
    Student --- UC9
    Student --- UC10
    Student --- UC11
    Student --- UC12
```

---

## 4. Use Case Diagram — Lecturer Role

```mermaid
graph LR
    subgraph "AI-Based Study Planner System"
        UC1[Register Account]
        UC2[Login]
        UC3[Add Course with Code & Exam Date]
        UC4[Set Difficulty Level]
        UC5[Edit/Delete Course]
        UC6[View Enrolled Students<br/>auto-linked by course code]
        UC7[View Student Progress]
        UC8[View Student Study Plans]
        UC9[Download PDF Report]
        UC10[Reset Password]
    end

    Lecturer((Lecturer))
    Lecturer --- UC1
    Lecturer --- UC2
    Lecturer --- UC3
    Lecturer --- UC4
    Lecturer --- UC5
    Lecturer --- UC6
    Lecturer --- UC7
    Lecturer --- UC8
    Lecturer --- UC9
    Lecturer --- UC10
```

---

## 5. Use Case Diagram — Admin Role

```mermaid
graph LR
    subgraph "AI-Based Study Planner System"
        UC1[Login]
        UC2[View System Statistics]
        UC3[Create User Account]
        UC4[Edit User Account]
        UC5[Delete User Account]
        UC6[Activate/Deactivate User]
        UC7[View All Courses]
        UC8[Delete Any Course]
        UC9[View All Study Plans]
        UC10[Download System PDF Report]
        UC11[Search/Filter Users]
    end

    Admin((Admin))
    Admin --- UC1
    Admin --- UC2
    Admin --- UC3
    Admin --- UC4
    Admin --- UC5
    Admin --- UC6
    Admin --- UC7
    Admin --- UC8
    Admin --- UC9
    Admin --- UC10
    Admin --- UC11
```

---

## 6. Combined Use Case Diagram — All Roles

```mermaid
graph TB
    subgraph Actors
        S((Student))
        L((Lecturer))
        A((Admin))
    end

    subgraph "Authentication"
        UC_REG[Register]
        UC_LOGIN[Login]
        UC_FORGOT[Reset Password]
    end

    subgraph "Student Features"
        UC_PROFILE[Setup Profile]
        UC_ADD_COURSE[Add Courses]
        UC_GEN_PLAN[Generate AI Study Plan]
        UC_CALENDAR[View Weekly Calendar]
        UC_REMIND[View Exam Reminders]
        UC_PROGRESS[Log & Track Progress]
    end

    subgraph "Lecturer Features"
        UC_L_COURSE[Manage Courses & Exams]
        UC_L_STUDENTS[View Enrolled Students]
        UC_L_PROGRESS[View Student Progress]
        UC_L_PDF[Download PDF Report]
    end

    subgraph "Admin Features"
        UC_A_USERS[Manage All Users]
        UC_A_COURSES[Manage All Courses]
        UC_A_STATS[View System Statistics]
        UC_A_PDF[Download System Report]
    end

    S --- UC_REG
    S --- UC_LOGIN
    S --- UC_FORGOT
    S --- UC_PROFILE
    S --- UC_ADD_COURSE
    S --- UC_GEN_PLAN
    S --- UC_CALENDAR
    S --- UC_REMIND
    S --- UC_PROGRESS

    L --- UC_REG
    L --- UC_LOGIN
    L --- UC_FORGOT
    L --- UC_L_COURSE
    L --- UC_L_STUDENTS
    L --- UC_L_PROGRESS
    L --- UC_L_PDF

    A --- UC_LOGIN
    A --- UC_A_USERS
    A --- UC_A_COURSES
    A --- UC_A_STATS
    A --- UC_A_PDF
```

---

## 7. Activity Diagram — Complete System Flow

```mermaid
flowchart TD
    START((Start)) --> A[User opens website]
    A --> B{Has account?}
    B -->|No| C[Register with name, email,<br/>reg number, role, password]
    C --> D[System validates password<br/>must have letters + numbers]
    D --> E[System hashes password<br/>with bcrypt]
    E --> F[Save user to database]
    F --> G[Generate JWT token]
    B -->|Yes| H[Login with email + password]
    H --> I{Credentials valid?}
    I -->|No| J[Show error message]
    J --> H
    I -->|Yes| G

    G --> K{What is user role?}

    K -->|Student| L[Student Dashboard]
    L --> L1[View Exam Reminders<br/>exams within 7 days]
    L --> L2[View Weekly Calendar]
    L --> L3[Setup Profile<br/>program, year, study hours]
    L --> L4[Add Courses<br/>name, code, credits,<br/>difficulty, grade, exam date]
    L4 --> L5[Generate AI Study Plan]
    L5 --> L6[AI scores each course<br/>35% urgency + 25% grade +<br/>25% difficulty + 15% credits]
    L6 --> L7[AI creates day-by-day<br/>schedule until last exam]
    L7 --> L8[Display study plan<br/>with priority scores]
    L --> L9[Log study progress<br/>hours, completion, understanding]
    L --> L10[View progress statistics]

    K -->|Lecturer| M[Lecturer Dashboard]
    M --> M1[Add courses with<br/>code, exam date, difficulty]
    M --> M2[View My Students<br/>auto-linked by course code]
    M --> M3[View Student Progress]
    M --> M4[Download PDF Report]

    K -->|Admin| N[Admin Dashboard]
    N --> N1[View system statistics]
    N --> N2[Create/Edit/Delete users]
    N --> N3[Activate/Deactivate accounts]
    N --> N4[View all courses]
    N --> N5[Delete any course]
    N --> N6[Download system PDF report]
```

---

## 8. Activity Diagram — AI Study Plan Generation

```mermaid
flowchart TD
    START((Start)) --> A[Student clicks<br/>Generate New Plan]
    A --> B[Server receives request]
    B --> C[Fetch student profile<br/>get preferred study hours]
    C --> D[Fetch all student courses]
    D --> E{Any courses with<br/>future exam dates?}
    E -->|No| F[Return error:<br/>No upcoming exams]
    E -->|Yes| G[Deactivate previous plan]
    G --> H[Set start date = today<br/>Set end date = last exam]

    H --> I[Loop: For each day<br/>from today to last exam]
    I --> J[Get courses still<br/>having upcoming exams]
    J --> K[Calculate score for each course]

    K --> K1[Exam urgency score<br/>= 1/daysLeft × 100 × 3<br/>weight: 35%]
    K --> K2[Grade score<br/>= 100 - previousGrade<br/>weight: 25%]
    K --> K3[Difficulty score<br/>= difficulty/5 × 100<br/>weight: 25%]
    K --> K4[Credit score<br/>= credits/6 × 100<br/>weight: 15%]

    K1 --> L[Total = K1×0.35 + K2×0.25<br/>+ K3×0.25 + K4×0.15]
    K2 --> L
    K3 --> L
    K4 --> L

    L --> M[Sort courses by<br/>total score descending]
    M --> N[Allocate study hours<br/>proportionally based on scores]
    N --> O[Assign study topic<br/>based on days remaining]
    O --> P[Add day to plan]
    P --> Q{More days?}
    Q -->|Yes| I
    Q -->|No| R[Save plan to database]
    R --> S[Return plan to student]
    S --> END((End))
```

---

## 9. Activity Diagram — Student-Lecturer Linking

```mermaid
flowchart TD
    START((Start)) --> A[Lecturer creates course<br/>Code: CSC 4101]
    A --> B[Course saved with<br/>lecturer userId + code]
    B --> C[Student registers same course<br/>Code: CSC 4101]
    C --> D[Course saved with<br/>student userId + code]
    D --> E[Lecturer opens<br/>My Students tab]
    E --> F[System queries database:<br/>Find MY course codes]
    F --> G[System queries database:<br/>Find OTHER users with<br/>same course codes]
    G --> H{Students found?}
    H -->|Yes| I[Display student names,<br/>emails, reg numbers,<br/>and their enrolled courses]
    H -->|No| J[Show: No students<br/>linked yet]
    I --> END((End))
    J --> END
```

---

## 10. Activity Diagram — Forgot Password

```mermaid
flowchart TD
    START((Start)) --> A[User clicks<br/>Forgot Password]
    A --> B[Enter email address]
    B --> C[Enter registration/staff number]
    C --> D[Enter new password]
    D --> E{Password has<br/>letters AND numbers?}
    E -->|No| F[Show error:<br/>Password too weak]
    F --> D
    E -->|Yes| G[Enter confirm password]
    G --> H{Passwords match?}
    H -->|No| I[Show error:<br/>Passwords dont match]
    I --> G
    H -->|Yes| J[Send to server]
    J --> K{Email + RegNo<br/>exist in database?}
    K -->|No| L[Show error:<br/>Account not found]
    L --> B
    K -->|Yes| M[Hash new password<br/>with bcrypt 10 rounds]
    M --> N[Update password<br/>in database]
    N --> O[Show success message]
    O --> P[Redirect to login page]
    P --> END((End))
```

---

## 11. Activity Diagram — Admin User Management

```mermaid
flowchart TD
    START((Start)) --> A[Admin logs in]
    A --> B[Admin Dashboard loads<br/>shows statistics]
    B --> C[Click Users tab]
    C --> D[System fetches all users<br/>from database]
    D --> E[Display users table]

    E --> F{Admin action?}
    F -->|Create User| G[Fill form: name, email,<br/>regNo, role, password]
    G --> H[Validate password strength]
    H --> I[Save to database]
    I --> E

    F -->|Deactivate| J[Click Deactivate button]
    J --> K[Set isActive = false]
    K --> L[User cannot login anymore]
    L --> E

    F -->|Activate| M[Click Activate button]
    M --> N[Set isActive = true]
    N --> E

    F -->|Delete| O[Confirm deletion]
    O --> P[Delete user + their<br/>courses + plans + progress]
    P --> E

    F -->|Filter| Q[Select role filter<br/>or type search text]
    Q --> R[System filters users]
    R --> E
```

---

## 12. Sequence Diagram — Login Flow

```mermaid
sequenceDiagram
    actor U as User
    participant B as Browser
    participant S as Server
    participant MW as Auth Middleware
    participant DB as MongoDB

    U->>B: Enter email & password
    B->>S: POST /api/auth/login
    S->>DB: Find user by email
    DB-->>S: User document (with hashed password)
    S->>S: bcrypt.compare(password, hashedPassword)
    
    alt Password incorrect
        S-->>B: 401 Invalid credentials
        B-->>U: Show error message
    else Password correct
        S->>S: Check user.isActive
        alt Account deactivated
            S-->>B: 403 Account deactivated
            B-->>U: Show deactivated message
        else Account active
            S->>S: jwt.sign(userId, role, secret)
            S-->>B: 200 {token, user: {role}}
            B->>B: localStorage.setItem(token)
            alt role = admin
                B-->>U: Redirect admin-dashboard.html
            else role = lecturer
                B-->>U: Redirect lecturer-dashboard.html
            else role = student
                B-->>U: Redirect dashboard.html
            end
        end
    end
```

---

## 13. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USERS {
        ObjectId _id PK
        String fullName
        String email UK
        String password
        String registrationNumber UK
        String role "admin | lecturer | student"
        String program
        String faculty
        Number yearOfStudy
        Number semester
        Number preferredStudyHours
        Boolean profileCompleted
        Boolean isActive
        Date createdAt
    }

    COURSES {
        ObjectId _id PK
        ObjectId user FK "References USERS._id"
        String courseName
        String courseCode "Links lecturer to student"
        Number creditHours "1-6"
        Number difficultyLevel "1-5"
        Number previousGrade "0-100"
        Date examDate
        String instructor
        Date createdAt
    }

    STUDYPLANS {
        ObjectId _id PK
        ObjectId user FK "References USERS._id"
        Array dailyPlans "Array of day objects"
        Date startDate
        Date endDate
        Boolean isActive
        Date generatedAt
    }

    PROGRESS {
        ObjectId _id PK
        ObjectId user FK "References USERS._id"
        ObjectId course FK "References COURSES._id"
        Date date
        Number hoursStudied
        Boolean completed
        Number understandingLevel "1-5"
        String notes
        Date createdAt
    }

    USERS ||--o{ COURSES : "owns"
    USERS ||--o{ STUDYPLANS : "has"
    USERS ||--o{ PROGRESS : "logs"
    COURSES ||--o{ PROGRESS : "tracked by"
```

---

## 14. System Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer - Browser"
        A[index.html<br/>Login/Register]
        B[dashboard.html<br/>Student Dashboard]
        C[lecturer-dashboard.html<br/>Lecturer Dashboard]
        D[admin-dashboard.html<br/>Admin Dashboard]
        E[studyplan.html<br/>Full Study Plan]
        F[progress.html<br/>Progress Tracking]
        G[profile.html<br/>Profile Setup]
    end

    subgraph "Application Layer - Node.js Server"
        H[Express.js<br/>Port 3000]
        I[JWT Middleware<br/>Token Verification]
        J[Role Middleware<br/>Access Control]
        K[Routes:<br/>auth, courses, studyPlan,<br/>progress, admin, lecturer]
        L[AI Planner Module<br/>Weighted Scoring Algorithm]
        M[PDFKit<br/>Report Generator]
    end

    subgraph "Data Layer - MongoDB"
        N[(users collection)]
        O[(courses collection)]
        P[(studyplans collection)]
        Q[(progress collection)]
    end

    A & B & C & D & E & F & G -->|fetch API<br/>HTTP/JSON| H
    H --> I --> J --> K
    K --> L
    K --> M
    K -->|Mongoose ODM| N & O & P & Q
```

---

## 15. Deployment Diagram

```mermaid
graph LR
    subgraph "User Device"
        A[Web Browser<br/>Chrome / Firefox / Edge]
    end

    subgraph "Server Machine"
        B[Node.js Runtime v14+]
        C[Express.js Application]
        D[MongoDB Server v4+]
    end

    A -->|HTTP Port 3000| C
    C -->|Mongoose Port 27017| D
    B --- C
```

---

## Color Customization Guide

The entire system's colors are controlled from **ONE file**: `public/css/style.css`

All colors are defined as variables at the very top. Change them once and the ENTIRE system updates — navbar, buttons, cards, titles, everything.

### Where to Find (Top of style.css):

```css
:root {
    --primary-blue: #1a56db;       /* Main brand — navbar, buttons, links, titles */
    --primary-dark: #1e3a5f;       /* Dark shade — navbar gradient, headings */
    --primary-light: #3b82f6;      /* Light shade — button hover, active links */
    --secondary-blue: #60a5fa;     /* Secondary — progress bars, accents */
    --accent-blue: #dbeafe;        /* Very light — backgrounds, table headers */
    --white: #ffffff;              /* White — page/card backgrounds */
    --light-gray: #f8fafc;        /* Light gray — body background */
    --gray: #e2e8f0;              /* Gray — borders, dividers */
    --dark-gray: #64748b;         /* Dark gray — secondary text */
    --text-dark: #1e293b;         /* Near black — main text */
    --text-medium: #475569;       /* Medium — descriptions */
    --text-light: #94a3b8;        /* Light — hints, placeholders */
    --success: #10b981;           /* Green — success, completed */
    --warning: #f59e0b;           /* Orange — warnings, reminders */
    --danger: #ef4444;            /* Red — delete, errors, urgent */
}
```

### What Each Variable Controls:

| Variable | What Changes When You Edit It |
|----------|-------------------------------|
| `--primary-blue` | Login button, Generate Plan button, Save buttons, active nav links, stat card numbers, progress bar, all links, calendar highlights |
| `--primary-dark` | Navbar background, page titles (h2), card header text, study plan day headers, login page gradient |
| `--primary-light` | Button hover effect, link hover color, active tab underline |
| `--secondary-blue` | Progress bar gradient end color |
| `--accent-blue` | Table header background, AI scoring boxes, info alert background, badge backgrounds, calendar session items |
| `--white` | Card backgrounds, input field backgrounds, modal backgrounds |
| `--light-gray` | Page body background color |
| `--gray` | Input field borders, table borders, card dividers, tab underlines, progress bar track |
| `--dark-gray` | Secondary button color |
| `--text-dark` | All main text, table data, course names, strong text |
| `--text-medium` | Form labels, descriptions, subtitle text |
| `--text-light` | Placeholder text, hints, empty state text |
| `--success` | Save Course button, Activate button, success alerts, "Completed" badge, green stat cards |
| `--warning` | Exam reminder cards border, "Partial" badge, understanding stars, medium difficulty badges |
| `--danger` | Delete buttons, Deactivate button, Logout button, error alerts, "Urgent" text, high difficulty badge |

### Complete Ready-to-Use Color Themes:

**🔵 Default Blue (Current — Professional University):**
```css
--primary-blue: #1a56db;
--primary-dark: #1e3a5f;
--primary-light: #3b82f6;
--secondary-blue: #60a5fa;
--accent-blue: #dbeafe;
```

**🟢 Green (Nature/Growth):**
```css
--primary-blue: #059669;
--primary-dark: #064e3b;
--primary-light: #10b981;
--secondary-blue: #6ee7b7;
--accent-blue: #d1fae5;
```

**🟣 Purple (Modern/Creative):**
```css
--primary-blue: #7c3aed;
--primary-dark: #4c1d95;
--primary-light: #8b5cf6;
--secondary-blue: #c4b5fd;
--accent-blue: #ede9fe;
```

**🔴 Maroon/Red (Traditional University):**
```css
--primary-blue: #b91c1c;
--primary-dark: #7f1d1d;
--primary-light: #dc2626;
--secondary-blue: #fca5a5;
--accent-blue: #fee2e2;
```

**🟠 Orange (Warm/Energetic):**
```css
--primary-blue: #ea580c;
--primary-dark: #7c2d12;
--primary-light: #f97316;
--secondary-blue: #fdba74;
--accent-blue: #fff7ed;
```

**🫐 Navy (Corporate/Serious):**
```css
--primary-blue: #1e40af;
--primary-dark: #172554;
--primary-light: #2563eb;
--secondary-blue: #93c5fd;
--accent-blue: #dbeafe;
```

**🩷 Pink (Soft/Friendly):**
```css
--primary-blue: #db2777;
--primary-dark: #831843;
--primary-light: #ec4899;
--secondary-blue: #f9a8d4;
--accent-blue: #fce7f3;
```

**🩶 Dark/Charcoal (Sleek/Minimalist):**
```css
--primary-blue: #374151;
--primary-dark: #111827;
--primary-light: #4b5563;
--secondary-blue: #9ca3af;
--accent-blue: #f3f4f6;
```

### How to Change (3 Steps):
1. Open `public/css/style.css`
2. Replace the 5 color values under `:root {` with any theme above
3. Save and refresh browser (Ctrl + Shift + R)

### Change Individual Parts Only:

**Navbar only:**
```css
.header {
    background: linear-gradient(135deg, var(--primary-dark), var(--primary-blue));
}
```

**Login page background only:**
```css
.auth-container {
    background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-blue) 100%);
}
```

**All primary buttons only:**
```css
.btn-primary {
    background-color: var(--primary-blue);
}
.btn-primary:hover {
    background-color: var(--primary-dark);
}
```

**Study plan day headers only:**
```css
.plan-day-header {
    background: linear-gradient(135deg, var(--primary-dark), var(--primary-blue));
}
```

**Stat card top border only:**
```css
.stat-card {
    border-top: 4px solid var(--primary-blue);
}
```

**Logout button only:**
```css
.nav-links .btn-logout {
    background-color: rgba(239, 68, 68, 0.8);
}
```

---

## How to Generate Images from These Diagrams

1. Go to **https://mermaid.live**
2. Delete the example code on the left side
3. Paste ONE diagram code block (without the ``` marks)
4. The image appears on the right side
5. Click the download button (PNG or SVG)
6. Insert the image into your Word document or PowerPoint

**Alternative:** Install "Mermaid Preview" extension in VS Code — diagrams render right inside the editor.
