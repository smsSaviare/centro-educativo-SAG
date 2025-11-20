CREATE TABLE CourseBlocks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  courseId INTEGER NOT NULL,
  type TEXT NOT NULL,
  content TEXT NOT NULL, -- JSON string
  position INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY(courseId) REFERENCES Courses(id) ON DELETE CASCADE
);
INSERT INTO "CourseBlocks" VALUES(3097,47,'text','{''text''":''"Inducción Sistema de Gestión en Seguridad y Salud en el Trabajo''"','''"url''":''"''"}"');
INSERT INTO "CourseBlocks" VALUES(3098,47,'text','{''text''":''"En este módulo visualizarás un video introductorio sobre el SG-SST. Después del video',' deberás responder unas preguntas de verificación para confirmar la comprensión de los temas presentados.''"');
INSERT INTO "CourseBlocks" VALUES(3099,47,'video','{''text''":''"''"','''"url''":''"https://www.youtube.com/watch?v=_e9BPKsbeiA''"}"');
INSERT INTO "CourseBlocks" VALUES(3100,47,'quiz','{''question''":''"La empresa SERVICIOS AÉREOS DEL GUAVIARE LTDA. “SAVIARE LTDA.” únicamente protege la salud y seguridad de los trabajadores vinculados directamente',' sin incluir contratistas ni partes interesadas.''"');
INSERT INTO "CourseBlocks" VALUES(3101,47,'quiz','{''question''":''"SERVICIOS AÉREOS DEL GUAVIARE LTDA. “SAVIARE LTDA.” asume la responsabilidad de proteger la salud y seguridad de todos los trabajadores independientemente de su tipo de vinculación laboral.''"','''"options''":[''"Verdadero''"');
INSERT INTO "CourseBlocks" VALUES(3102,47,'quiz','{''question''":''"La empresa permite el consumo de bebidas alcohólicas durante la jornada laboral siempre y cuando sea fuera de sus instalaciones.''"','''"options''":[''"Verdadero''"');
INSERT INTO "CourseBlocks" VALUES(3103,47,'quiz','{''question''":''"Es responsabilidad de cada trabajador asegurarse de no estar bajo los efectos de alcohol o drogas al momento de realizar su actividad laboral.''"','''"options''":[''"Verdadero''"');
INSERT INTO "CourseBlocks" VALUES(3104,47,'quiz','{''question''":''"El alcoholismo',' tabaquismo y la farmacodependencia pueden afectar la seguridad');
INSERT INTO "CourseBlocks" VALUES(3105,47,'quiz','{''question''":''"El objetivo central de su pertenencia al Comité paritario de SST',' es apoyar las obligaciones del empleador y generar compromiso');
INSERT INTO "CourseBlocks" VALUES(3106,47,'quiz','{''question''":''"Es un grupo de vigilancia de conformación obligatoria por parte de los empleadores públicos y privados',' cuya finalidad es contribuir a proteger a los trabajadores contra los riesgos psicosociales que puedan afectar su salud');
INSERT INTO "CourseBlocks" VALUES(3107,47,'quiz','{''question''":''"Según la normatividad legal vigente',' cuantas modalidades de Accidentes de trabajo existen? ''"');
INSERT INTO "CourseBlocks" VALUES(3527,48,'text','{''text''":''"Hábitos y Estilos de Vida Saludable''"','''"url''":''"''"}"');
INSERT INTO "CourseBlocks" VALUES(3528,48,'text','{''text''":''"En este módulo verás un video introductorio sobre hábitos saludables. Al finalizar',' deberás responder unas preguntas de verificación para asegurar la comprensión de los conceptos presentados.''"');
INSERT INTO "CourseBlocks" VALUES(3529,48,'video','{''text''":''"''"','''"url''":''"https://www.youtube.com/watch?v=Hw9zk7jlcV8''"}"');
INSERT INTO "CourseBlocks" VALUES(3530,48,'quiz','{''question''":''"¿Cuál de los siguientes se considera un hábito saludable?''"','''"options''":[''"Sedentarismo''"');
INSERT INTO "CourseBlocks" VALUES(3531,48,'quiz','{''question''":''"Según las recomendaciones',' ¿Cuánto tiempo mínimo de actividad física aeróbica moderada se necesita por semana para mantener un peso saludable?''"');
INSERT INTO "CourseBlocks" VALUES(3532,48,'quiz','{''question''":''"La actividad física regular de intensidad moderada (30 minutos',' 5 veces por semana) puede reducir el riesgo de desarrollar:''"');
INSERT INTO "CourseBlocks" VALUES(3533,48,'quiz','{''question''":''"En el síndrome metabólico',' la actividad física recomendada de intensidad moderada para reducir sus efectos es de:''"');
INSERT INTO "CourseBlocks" VALUES(3534,48,'quiz','{''question''":''"El tabaquismo y el consumo de sustancias psicoactivas forman parte de los hábitos de vida saludables.''"','''"options''":[''"Verdadero''"');
INSERT INTO "CourseBlocks" VALUES(3535,48,'quiz','{''question''":''"La actividad física de tipo aeróbico',' fuerza');
INSERT INTO "CourseBlocks" VALUES(3536,48,'quiz','{''question''":''"El descanso adecuado y la relajación ayudan a disminuir el estrés y forman parte de los hábitos saludables.''"','''"options''":[''"Verdadero''"');
INSERT INTO "CourseBlocks" VALUES(3537,48,'quiz','{''question''":''"Se recomienda iniciar la actividad física con altas cargas de intensidad',' incluso en personas sedentarias.''"');
INSERT INTO "CourseBlocks" VALUES(3979,49,'text','{''text''":''"Uso de EPPs''"','''"url''":''"''"}"');
INSERT INTO "CourseBlocks" VALUES(3980,49,'text','{''text''":''"En este módulo verás un video sobre el uso adecuado de los EPPs. Después de reproducirlo',' deberás responder unas preguntas de verificación para confirmar la comprensión de los conceptos presentados.''"');
INSERT INTO "CourseBlocks" VALUES(3981,49,'video','{''text''":''"''"','''"url''":''"https://www.youtube.com/watch?v=leHPOfAUxwQ''"}"');
INSERT INTO "CourseBlocks" VALUES(3982,49,'quiz','{''question''":''"¿Qué son los Elementos de Protección Personal (EPP)?''"','''"options''":[''"Equipos diseñados para mejorar la productividad laboral''"');
INSERT INTO "CourseBlocks" VALUES(3983,49,'quiz','{''question''":''"¿Cuál de las siguientes NO es una lesión común por el no uso de EPP?''"','''"options''":[''"Lesiones en los ojos''"');
INSERT INTO "CourseBlocks" VALUES(3984,49,'quiz','{''question''":''"Según la normativa',' el no uso de los EPP puede considerarse:''"');
INSERT INTO "CourseBlocks" VALUES(3985,49,'quiz','{''question''":''"¿Por qué se considera grave el no uso de los EPP en la empresa?''"','''"options''":[''"Porque genera incomodidad en el trabajador''"');
INSERT INTO "CourseBlocks" VALUES(3986,49,'quiz','{''question''":''"El uso de EPP únicamente protege al trabajador',' sin beneficiar a la empresa.''"');
INSERT INTO "CourseBlocks" VALUES(3987,49,'quiz','{''question''":''"El prevenir accidentes mediante el uso de EPP compensa las molestias que pueda causar portarlos.''"','''"options''":[''"Verdadero''"');
INSERT INTO "CourseBlocks" VALUES(3988,49,'quiz','{''question''":''"El Código Sustantivo del Trabajo contempla sanciones por incumplimiento en el uso de EPP.''"','''"options''":[''"Verdadero''"');
INSERT INTO "CourseBlocks" VALUES(3989,49,'quiz','{''question''":''"No usar EPP solo afecta a quien los omite',' sin poner en riesgo a otros compañeros.''"');
INSERT INTO "CourseBlocks" VALUES(3999,46,'text','{''text''":''"Inducción SMS SAVIARE''"','''"url''":''"''"}"');
INSERT INTO "CourseBlocks" VALUES(4000,46,'text','{''text''":''"En este módulo verás un video introductorio sobre el SMS de SAVIARE. Una vez finalice',' deberás responder unas preguntas de verificación para confirmar la comprensión de los conceptos presentados.''"');
INSERT INTO "CourseBlocks" VALUES(4001,46,'video','{''text''":''"''"','''"url''":''"https://www.youtube.com/watch?v=0Obdr0dBCE4''"}"');
INSERT INTO "CourseBlocks" VALUES(4002,46,'text','{''text''":''"QUIZ''"','''"url''":''"''"}"');
INSERT INTO "CourseBlocks" VALUES(4003,46,'quiz','{''question''":''"¿Cuáles son los pilares de seguridad operacional?''"','''"options''":[''"Documental');
INSERT INTO "CourseBlocks" VALUES(4004,46,'quiz','{''question''":''"¿La alerta de seguridad operacional es de uso obligatorio?''"','''"options''":[''"Verdadero''"');
INSERT INTO "CourseBlocks" VALUES(4005,46,'quiz','{''question''":''"¿La gestión del riesgo se encarga de darle tratamiento al peligro entendiéndose como cualquier objeto',' animal');
INSERT INTO "CourseBlocks" VALUES(4006,46,'quiz','{''question''":''"¿Cuáles son los manuales fundamentales?''"','''"options''":[''"Manual SMS');
INSERT INTO "CourseBlocks" VALUES(4007,46,'quiz','{''question''":''" ¿Los indicadores SPI se presentan ante la aeronáutica civil cada dos años?''"','''"options''":[''"Verdadero''"');
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
INSERT INTO "Courses" VALUES(46,'Inducción SMS SAVIARE','Este curso introduce a los colaboradores al Sistema de Gestión de Seguridad Operacional (SMS) de SAVIARE. Aquí aprenderás los principios básicos del SMS, tus responsabilidades dentro del sistema y el uso de la plataforma para reportar, gestionar y dar seguimiento a eventos. Al finalizar, estarás preparado para participar activamente en la cultura de seguridad de la organización.',NULL,'[]','user_34TWX7M13fgqVw9cYoYgcfotRNP','2025-11-18 15:59:16.398+00','2025-11-18 15:59:16.398+00');
INSERT INTO "Courses" VALUES(47,'Inducción Sistema de Gestión en Seguridad y Salud en el Trabajo','Este curso presenta los conceptos esenciales del Sistema de Gestión en Seguridad y Salud en el Trabajo (SG-SST). Conocerás tus responsabilidades, las prácticas básicas de prevención y los procedimientos que garantizan un entorno laboral seguro y saludable. Al finalizar, estarás preparado para participar activamente en el cumplimiento y mejora continua del sistema.',NULL,'[]','user_34TWX7M13fgqVw9cYoYgcfotRNP','2025-11-18 16:28:11.603+00','2025-11-18 16:28:11.603+00');
INSERT INTO "Courses" VALUES(48,'Hábitos y Estilos de Vida Saludable','Este curso ofrece una introducción práctica a los hábitos y estilos de vida saludable que contribuyen al bienestar físico y mental. Aprenderás recomendaciones clave sobre alimentación, actividad física, manejo del estrés y autocuidado para mejorar tu calidad de vida dentro y fuera del trabajo.',NULL,'[]','user_34TWX7M13fgqVw9cYoYgcfotRNP','2025-11-18 16:39:22.572+00','2025-11-18 16:39:22.572+00');
INSERT INTO "Courses" VALUES(49,'Uso de EPPs','Este curso brinda una guía clara y práctica sobre el uso correcto de los Equipos de Protección Personal (EPPs). Conocerás su importancia, los tipos de EPP según el riesgo, y las responsabilidades del trabajador para garantizar una protección adecuada en cada actividad. Al finalizar, tendrás las bases para seleccionar, utilizar y mantener correctamente tus elementos de protección.',NULL,'[]','user_34TWX7M13fgqVw9cYoYgcfotRNP','2025-11-18 16:55:21.634+00','2025-11-18 16:55:21.634+00');
CREATE TABLE Enrollments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  courseId INTEGER NOT NULL,
  clerkId TEXT NOT NULL,
  assignedAt TEXT,
  FOREIGN KEY(courseId) REFERENCES Courses(id)
);
INSERT INTO "Enrollments" VALUES(25,46,'user_35ezQuuguqBsea8SOW9XuBPQNAZ','2025-11-19 14:35:51.879+00');
INSERT INTO "Enrollments" VALUES(26,47,'user_35ezQuuguqBsea8SOW9XuBPQNAZ','2025-11-19 15:03:12.371+00');
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
INSERT INTO "QuizResults" VALUES(1,32,'user_34nxV1NiX0YxjR5OHaieh6M69D6',1779,1.0,'{''selectedIndex''":0}"','2025-11-18 00:17:24.469+00','2025-11-18 00:17:57.488+00','user_34TWX7M13fgqVw9cYoYgcfotRNP','2025-11-18 00:17:57.488+00');
INSERT INTO "QuizResults" VALUES(2,33,'user_34nxV1NiX0YxjR5OHaieh6M69D6',1850,1.0,'{''selectedIndex''":0}"','2025-11-18 00:22:20.607+00','2025-11-18 00:22:40.598+00','user_34TWX7M13fgqVw9cYoYgcfotRNP','2025-11-18 00:22:40.598+00');
INSERT INTO "QuizResults" VALUES(3,35,'user_34nxV1NiX0YxjR5OHaieh6M69D6',1995,NULL,NULL,'2025-11-18 00:37:32.372+00','2025-11-18 00:37:32.372+00','user_34TWX7M13fgqVw9cYoYgcfotRNP',1);
INSERT INTO "QuizResults" VALUES(4,35,'user_34nxV1NiX0YxjR5OHaieh6M69D6',2010,1.0,'{''selectedIndex''":0}"','2025-11-18 00:42:48.769+00','2025-11-18 00:46:24.269+00','user_34TWX7M13fgqVw9cYoYgcfotRNP','2025-11-18 00:46:24.269+00');
INSERT INTO "QuizResults" VALUES(5,36,'user_35d5tAZnupX1AFfWcqFERhX0P3t',2044,1.0,'{''selectedIndex''":0}"','2025-11-18 01:04:50.927+00','2025-11-18 01:05:25.525+00','user_35d5jj4R11WODVErFNghhoEzJ4Z','2025-11-18 01:05:25.525+00');
INSERT INTO "QuizResults" VALUES(6,36,'user_35d5tiawCrY6tlletI6691ZpASd',2044,1.0,'{''selectedIndex''":0}"','2025-11-18 01:04:55.28+00','2025-11-18 01:05:21.394+00','user_35d5jj4R11WODVErFNghhoEzJ4Z','2025-11-18 01:05:21.394+00');
INSERT INTO "QuizResults" VALUES(7,37,'user_35d5tiawCrY6tlletI6691ZpASd',2046,NULL,NULL,'2025-11-18 01:04:56.337+00','2025-11-18 01:04:56.337+00','user_35d5rFuXkMHc4AgH2kT3CH4Vm0M',1);
INSERT INTO "QuizResults" VALUES(8,37,'user_35d5tAZnupX1AFfWcqFERhX0P3t',2046,NULL,NULL,'2025-11-18 01:05:00.852+00','2025-11-18 01:05:00.852+00','user_35d5rFuXkMHc4AgH2kT3CH4Vm0M',1);
INSERT INTO "QuizResults" VALUES(9,38,'user_35d8pLayPGvC0ZvpqRFCK3ZEBVn',2054,1.0,'{''selectedIndex''":0}"','2025-11-18 01:28:44.35+00','2025-11-18 01:28:58.661+00','user_35d7stH4VJDLRr0zTy08SMYXVEH','2025-11-18 01:28:58.661+00');
INSERT INTO "QuizResults" VALUES(10,46,'user_35hMFfFL7xh0yuSOBwpbex6oCiO',4003,0.0,'{''selectedIndex''":1}"','2025-11-19 13:20:37.232+00','2025-11-19 13:21:01.936+00','user_34TWX7M13fgqVw9cYoYgcfotRNP','2025-11-19 13:21:01.936+00');
INSERT INTO "QuizResults" VALUES(11,46,'user_35ezQuuguqBsea8SOW9XuBPQNAZ',4003,1.0,'{''selectedIndex''":0}"','2025-11-19 14:36:51.591+00','2025-11-19 15:03:59.94+00','user_34TWX7M13fgqVw9cYoYgcfotRNP','2025-11-19 15:03:59.94+00');
INSERT INTO "QuizResults" VALUES(12,46,'user_35ezQuuguqBsea8SOW9XuBPQNAZ',4004,0.0,'{''selectedIndex''":1}"','2025-11-19 15:00:49.13+00','2025-11-19 15:04:23.512+00','user_34TWX7M13fgqVw9cYoYgcfotRNP','2025-11-19 15:04:23.511+00');
INSERT INTO "QuizResults" VALUES(13,46,'user_35ezQuuguqBsea8SOW9XuBPQNAZ',4005,NULL,NULL,'2025-11-19 15:00:57.139+00','2025-11-19 15:00:57.139+00','user_34TWX7M13fgqVw9cYoYgcfotRNP',1);
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
INSERT INTO "Users" VALUES(1,'admin_default','admin@saviare.com','Administrador','Sistema','admin','2025-10-31 00:52:21.567+00','2025-10-31 00:52:21.567+00');
INSERT INTO "Users" VALUES(2,'user_34TWX7M13fgqVw9cYoYgcfotRNP','jctibqduiza@gmail.com','Juan Camilo','Tibaduiza','teacher','2025-10-31 01:44:10.486+00','2025-10-31 01:44:10.486+00');
INSERT INTO "Users" VALUES(13,'user_35ezQuuguqBsea8SOW9XuBPQNAZ','librosayc@gmail.com','Libros','A&C','student','2025-11-18 17:01:56.248+00','2025-11-18 17:01:56.248+00');
DELETE FROM "sqlite_sequence";
