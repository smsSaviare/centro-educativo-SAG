-- Schema adaptado para Cloudflare D1 (SQLite dialect)
-- Basado en los modelos Sequelize del proyecto

PRAGMA foreign_keys = ON;

CREATE TABLE Users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clerkId TEXT UNIQUE,
  email TEXT NOT NULL,
  firstName TEXT,
  lastName TEXT,
  role TEXT NOT NULL DEFAULT 'student',
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE Courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  image TEXT,
  resources TEXT, -- JSON string
  creatorClerkId TEXT,
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE CourseBlocks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  courseId INTEGER NOT NULL,
  type TEXT NOT NULL,
  content TEXT NOT NULL, -- JSON string
  position INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY(courseId) REFERENCES Courses(id) ON DELETE CASCADE
);

CREATE TABLE Enrollments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  courseId INTEGER NOT NULL,
  clerkId TEXT NOT NULL,
  assignedAt TEXT,
  FOREIGN KEY(courseId) REFERENCES Courses(id)
);

CREATE TABLE QuizResults (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  courseId INTEGER NOT NULL,
  clerkId TEXT NOT NULL,
  quizBlockId INTEGER NOT NULL,
  score REAL,
  answers TEXT, -- JSON string
  assignedBy TEXT,
  completedAt TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  maxAttempts INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY(courseId) REFERENCES Courses(id)
);
