/**
 * Database Seed Script
 * Mount Kigali University - AI Study Planner
 * 
 * Run this script to create default accounts and sample course data.
 * This populates the system with realistic MKU content for demo purposes.
 * Usage: node seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');

// ============ SEED USERS ============
const seedUsers = [
    {
        fullName: 'Admin User',
        email: 'admin@mku.ac.rw',
        password: 'admin123',
        registrationNumber: 'MKU/ADMIN/001',
        role: 'admin',
        faculty: 'Administration',
        profileCompleted: true,
        isActive: true
    },
    {
        fullName: 'Dr. Mugisha Jean Pierre',
        email: 'mugisha@mku.ac.rw',
        password: 'lecturer123',
        registrationNumber: 'MKU/STAFF/001',
        role: 'lecturer',
        faculty: 'School of Computing & Information Technology',
        program: 'Computer Science',
        profileCompleted: true,
        isActive: true
    },
    {
        fullName: 'Prof. Uwase Marie Claire',
        email: 'uwase@mku.ac.rw',
        password: 'lecturer123',
        registrationNumber: 'MKU/STAFF/002',
        role: 'lecturer',
        faculty: 'School of Computing & Information Technology',
        program: 'Information Technology',
        profileCompleted: true,
        isActive: true
    },
    {
        fullName: 'Uwimana Alice',
        email: 'uwimana@mku.ac.rw',
        password: 'student123',
        registrationNumber: 'MKU/BSC/2021/001',
        role: 'student',
        program: 'BSc Computer Science',
        faculty: 'School of Computing & Information Technology',
        yearOfStudy: 4,
        semester: 2,
        preferredStudyHours: 5,
        profileCompleted: true,
        isActive: true
    },
    {
        fullName: 'Habimana Eric',
        email: 'habimana@mku.ac.rw',
        password: 'student123',
        registrationNumber: 'MKU/BSC/2021/002',
        role: 'student',
        program: 'BSc Information Technology',
        faculty: 'School of Computing & Information Technology',
        yearOfStudy: 4,
        semester: 2,
        preferredStudyHours: 4,
        profileCompleted: true,
        isActive: true
    },
    {
        fullName: 'Mukamana Grace',
        email: 'mukamana@mku.ac.rw',
        password: 'student123',
        registrationNumber: 'MKU/BSC/2021/003',
        role: 'student',
        program: 'BSc Computer Science',
        faculty: 'School of Computing & Information Technology',
        yearOfStudy: 4,
        semester: 2,
        preferredStudyHours: 6,
        profileCompleted: true,
        isActive: true
    }
];

// ============ SEED COURSES (for student Uwimana Alice) ============
// Realistic final year Computer Science courses at MKU
function getStudentCourses(studentId) {
    const today = new Date();
    
    return [
        {
            user: studentId,
            courseName: 'Artificial Intelligence',
            courseCode: 'CSC 4101',
            creditHours: 4,
            difficultyLevel: 5,
            previousGrade: 58,
            examDate: new Date(today.getTime() + (5 * 24 * 60 * 60 * 1000)), // 5 days from now
            instructor: 'Dr. Mugisha Jean Pierre'
        },
        {
            user: studentId,
            courseName: 'Database Administration',
            courseCode: 'CSC 4102',
            creditHours: 3,
            difficultyLevel: 4,
            previousGrade: 62,
            examDate: new Date(today.getTime() + (8 * 24 * 60 * 60 * 1000)), // 8 days from now
            instructor: 'Prof. Uwase Marie Claire'
        },
        {
            user: studentId,
            courseName: 'Software Engineering Project',
            courseCode: 'CSC 4103',
            creditHours: 5,
            difficultyLevel: 4,
            previousGrade: 70,
            examDate: new Date(today.getTime() + (12 * 24 * 60 * 60 * 1000)), // 12 days from now
            instructor: 'Dr. Mugisha Jean Pierre'
        },
        {
            user: studentId,
            courseName: 'Computer Networks & Security',
            courseCode: 'CSC 4104',
            creditHours: 3,
            difficultyLevel: 4,
            previousGrade: 55,
            examDate: new Date(today.getTime() + (15 * 24 * 60 * 60 * 1000)), // 15 days from now
            instructor: 'Mr. Niyonzima Patrick'
        },
        {
            user: studentId,
            courseName: 'Mobile Application Development',
            courseCode: 'CSC 4105',
            creditHours: 3,
            difficultyLevel: 3,
            previousGrade: 72,
            examDate: new Date(today.getTime() + (18 * 24 * 60 * 60 * 1000)), // 18 days from now
            instructor: 'Prof. Uwase Marie Claire'
        },
        {
            user: studentId,
            courseName: 'Research Methods & Project Writing',
            courseCode: 'CSC 4106',
            creditHours: 2,
            difficultyLevel: 2,
            previousGrade: 78,
            examDate: new Date(today.getTime() + (20 * 24 * 60 * 60 * 1000)), // 20 days from now
            instructor: 'Dr. Kamanzi David'
        }
    ];
}

// Courses for second student (Habimana Eric)
function getStudent2Courses(studentId) {
    const today = new Date();
    
    return [
        {
            user: studentId,
            courseName: 'Cloud Computing',
            courseCode: 'IT 4201',
            creditHours: 3,
            difficultyLevel: 4,
            previousGrade: 60,
            examDate: new Date(today.getTime() + (6 * 24 * 60 * 60 * 1000)),
            instructor: 'Dr. Mugisha Jean Pierre'
        },
        {
            user: studentId,
            courseName: 'Information Systems Security',
            courseCode: 'IT 4202',
            creditHours: 3,
            difficultyLevel: 5,
            previousGrade: 52,
            examDate: new Date(today.getTime() + (9 * 24 * 60 * 60 * 1000)),
            instructor: 'Mr. Niyonzima Patrick'
        },
        {
            user: studentId,
            courseName: 'Web Technologies & Frameworks',
            courseCode: 'IT 4203',
            creditHours: 4,
            difficultyLevel: 3,
            previousGrade: 68,
            examDate: new Date(today.getTime() + (13 * 24 * 60 * 60 * 1000)),
            instructor: 'Prof. Uwase Marie Claire'
        },
        {
            user: studentId,
            courseName: 'IT Project Management',
            courseCode: 'IT 4204',
            creditHours: 3,
            difficultyLevel: 3,
            previousGrade: 74,
            examDate: new Date(today.getTime() + (16 * 24 * 60 * 60 * 1000)),
            instructor: 'Dr. Kamanzi David'
        },
        {
            user: studentId,
            courseName: 'Data Science & Analytics',
            courseCode: 'IT 4205',
            creditHours: 4,
            difficultyLevel: 4,
            previousGrade: 56,
            examDate: new Date(today.getTime() + (19 * 24 * 60 * 60 * 1000)),
            instructor: 'Dr. Mugisha Jean Pierre'
        }
    ];
}

// Courses for third student (Mukamana Grace)
function getStudent3Courses(studentId) {
    const today = new Date();
    
    return [
        {
            user: studentId,
            courseName: 'Machine Learning',
            courseCode: 'CSC 4201',
            creditHours: 4,
            difficultyLevel: 5,
            previousGrade: 50,
            examDate: new Date(today.getTime() + (4 * 24 * 60 * 60 * 1000)),
            instructor: 'Dr. Mugisha Jean Pierre'
        },
        {
            user: studentId,
            courseName: 'Distributed Systems',
            courseCode: 'CSC 4202',
            creditHours: 3,
            difficultyLevel: 4,
            previousGrade: 63,
            examDate: new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000)),
            instructor: 'Prof. Uwase Marie Claire'
        },
        {
            user: studentId,
            courseName: 'Compiler Design',
            courseCode: 'CSC 4203',
            creditHours: 3,
            difficultyLevel: 5,
            previousGrade: 48,
            examDate: new Date(today.getTime() + (11 * 24 * 60 * 60 * 1000)),
            instructor: 'Mr. Niyonzima Patrick'
        },
        {
            user: studentId,
            courseName: 'Human Computer Interaction',
            courseCode: 'CSC 4204',
            creditHours: 2,
            difficultyLevel: 2,
            previousGrade: 80,
            examDate: new Date(today.getTime() + (14 * 24 * 60 * 60 * 1000)),
            instructor: 'Prof. Uwase Marie Claire'
        },
        {
            user: studentId,
            courseName: 'Operating Systems II',
            courseCode: 'CSC 4205',
            creditHours: 3,
            difficultyLevel: 4,
            previousGrade: 57,
            examDate: new Date(today.getTime() + (17 * 24 * 60 * 60 * 1000)),
            instructor: 'Dr. Mugisha Jean Pierre'
        }
    ];
}

// Lecturer courses (Dr. Mugisha)
function getLecturerCourses(lecturerId) {
    const today = new Date();
    
    return [
        {
            user: lecturerId,
            courseName: 'Artificial Intelligence',
            courseCode: 'CSC 4101',
            creditHours: 4,
            difficultyLevel: 5,
            previousGrade: 50,
            examDate: new Date(today.getTime() + (5 * 24 * 60 * 60 * 1000)),
            instructor: 'Dr. Mugisha Jean Pierre'
        },
        {
            user: lecturerId,
            courseName: 'Software Engineering Project',
            courseCode: 'CSC 4103',
            creditHours: 5,
            difficultyLevel: 4,
            previousGrade: 50,
            examDate: new Date(today.getTime() + (12 * 24 * 60 * 60 * 1000)),
            instructor: 'Dr. Mugisha Jean Pierre'
        },
        {
            user: lecturerId,
            courseName: 'Machine Learning',
            courseCode: 'CSC 4201',
            creditHours: 4,
            difficultyLevel: 5,
            previousGrade: 50,
            examDate: new Date(today.getTime() + (4 * 24 * 60 * 60 * 1000)),
            instructor: 'Dr. Mugisha Jean Pierre'
        },
        {
            user: lecturerId,
            courseName: 'Cloud Computing',
            courseCode: 'IT 4201',
            creditHours: 3,
            difficultyLevel: 4,
            previousGrade: 50,
            examDate: new Date(today.getTime() + (6 * 24 * 60 * 60 * 1000)),
            instructor: 'Dr. Mugisha Jean Pierre'
        },
        {
            user: lecturerId,
            courseName: 'Data Science & Analytics',
            courseCode: 'IT 4205',
            creditHours: 4,
            difficultyLevel: 4,
            previousGrade: 50,
            examDate: new Date(today.getTime() + (19 * 24 * 60 * 60 * 1000)),
            instructor: 'Dr. Mugisha Jean Pierre'
        }
    ];
}

// ============ MAIN SEED FUNCTION ============
async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('[Database] Connected to MongoDB\n');

        // Clear ONLY seeded data (don't delete manually created users)
        // Remove seeded users by their known emails
        const seededEmails = seedUsers.map(u => u.email);
        await User.deleteMany({ email: { $in: seededEmails } });
        
        // Remove courses belonging to seeded users only (will re-create them)
        const seededUsers = await User.find({ email: { $in: seededEmails } });
        const seededUserIds = seededUsers.map(u => u._id);
        await Course.deleteMany({ user: { $in: seededUserIds } });
        
        console.log('[Reset] Cleared seeded accounts (manually created users are preserved)\n');

        // Create users
        const createdUsers = {};
        for (const userData of seedUsers) {
            const user = new User(userData);
            await user.save();
            createdUsers[userData.email] = user;
            console.log(`[Created] ${userData.role.toUpperCase()}: ${userData.fullName} (${userData.email})`);
        }

        console.log('');

        // Create lecturer courses
        const lecturerCourses = getLecturerCourses(createdUsers['mugisha@mku.ac.rw']._id);
        for (const courseData of lecturerCourses) {
            const course = new Course(courseData);
            await course.save();
        }
        console.log(`[Courses] Added ${lecturerCourses.length} courses for Dr. Mugisha (Lecturer)`);

        // Create student 1 courses (Uwimana Alice)
        const student1Courses = getStudentCourses(createdUsers['uwimana@mku.ac.rw']._id);
        for (const courseData of student1Courses) {
            const course = new Course(courseData);
            await course.save();
        }
        console.log(`[Courses] Added ${student1Courses.length} courses for Uwimana Alice (Student)`);

        // Create student 2 courses (Habimana Eric)
        const student2Courses = getStudent2Courses(createdUsers['habimana@mku.ac.rw']._id);
        for (const courseData of student2Courses) {
            const course = new Course(courseData);
            await course.save();
        }
        console.log(`[Courses] Added ${student2Courses.length} courses for Habimana Eric (Student)`);

        // Create student 3 courses (Mukamana Grace)
        const student3Courses = getStudent3Courses(createdUsers['mukamana@mku.ac.rw']._id);
        for (const courseData of student3Courses) {
            const course = new Course(courseData);
            await course.save();
        }
        console.log(`[Courses] Added ${student3Courses.length} courses for Mukamana Grace (Student)`);

        console.log('\n══════════════════════════════════════════════════');
        console.log('  SEED COMPLETE! Login credentials:');
        console.log('══════════════════════════════════════════════════');
        console.log('  Admin:    admin@mku.ac.rw      / admin123');
        console.log('  Lecturer: mugisha@mku.ac.rw    / lecturer123');
        console.log('  Student:  uwimana@mku.ac.rw    / student123');
        console.log('  Student:  habimana@mku.ac.rw   / student123');
        console.log('  Student:  mukamana@mku.ac.rw   / student123');
        console.log('══════════════════════════════════════════════════');
        console.log('\n  After login as a student, click "Generate New Plan"');
        console.log('  on the Dashboard to see the AI algorithm in action!\n');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error.message);
        process.exit(1);
    }
}

seed();
