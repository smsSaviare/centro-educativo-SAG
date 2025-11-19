import { useEffect, useState, useCallback } from "react";
import { useUser, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import { getMyCourses, getStudents, getCourseBlocks, getQuizResults, getEnrollments } from "../api";
import { BarChart3, Users, BookOpen, CheckCircle2 } from "lucide-react";

export default function Dashboard() {
  const { user } = useUser();
  const clerkId = user?.id;
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [allResults, setAllResults] = useState([]);
  const [activeTab, setActiveTab] = useState("overview"); // overview, courses, students, results
  const [loading, setLoading] = useState(true);
  const [courseStats, setCourseStats] = useState({}); // cursos con count de estudiantes/quizzes

  const role = user?.publicMetadata?.role || "student";

  const loadDashboardData = useCallback(async () => {
    if (!clerkId || role !== "teacher") return;
    try {
      setLoading(true);

      // Obtener mis cursos
      const coursesData = await getMyCourses(clerkId);
      setCourses(coursesData || []);

      // Obtener todos los estudiantes
      const studentsData = await getStudents(clerkId);
      setStudents(studentsData || []);

      // Obtener stats de cada curso
      const stats = {};
      const allQuizResults = [];

      for (const course of coursesData || []) {
        // Contar quizzes en el curso
        const blocks = await getCourseBlocks(course.id);
        const quizCount = (blocks.blocks || []).filter((b) => b.type === "quiz").length;

        // Obtener resultados del curso
        const results = await getQuizResults(course.id);
        allQuizResults.push(...(results || []));

        // Obtener enrollments para contar inscripciones que no tienen quiz asignado aún
        let enrollments = [];
        try {
          enrollments = await getEnrollments(course.id);
        } catch (e) {
          // si falla, seguimos con los resultados como fallback
          console.warn("No se pudo obtener enrollments:", e);
          enrollments = [];
        }

        // combinar clerkIds de results y enrollments para obtener inscritos únicos
        const enrolledIds = new Set([
          ...(results || []).map((r) => r.clerkId),
          ...(enrollments || []).map((e) => e.clerkId),
        ]);

        stats[course.id] = {
          quizCount,
          enrolledStudents: enrolledIds.size,
          completedQuizzes: (results || []).filter((r) => r.completedAt).length,
        };
      }

      setCourseStats(stats);
      setAllResults(allQuizResults);
    } catch (e) {
      console.error("❌ Error cargando dashboard:", e);
    } finally {
      setLoading(false);
    }
  }, [clerkId, role]);

  // carga inicial y cuando cambian clerkId/role
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Escuchar evento global que indica que un usuario fue sincronizado
  useEffect(() => {
    function onUserSynced() {
      // recargar datos del dashboard
      loadDashboardData();
    }
    window.addEventListener("userSynced", onUserSynced);
    return () => window.removeEventListener("userSynced", onUserSynced);
  }, [loadDashboardData]);

  if (role !== "teacher") {
    return (
      <div className="p-6 min-h-screen text-center">
        <p className="text-red-600 font-semibold">Acceso denegado. Solo docentes pueden acceder al panel.</p>
      </div>
    );
  }

  // Usar la lista `students` (pestaña Estudiantes) como fuente única de verdad
  const totalStudents = Array.isArray(students) ? students.length : 0;
  const totalQuizzesCompleted = allResults.filter(r => r.completedAt).length;
  const totalCourses = courses.length;

  return (
    <>
      <SignedOut><RedirectToSignIn/></SignedOut>
      <SignedIn>
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6 pt-24">
          <div className="max-w-7xl mx-auto">
            
            {/* Encabezado */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-green-800 mb-2">
                📊 Panel Docente
              </h1>
              <p className="text-gray-600">
                Bienvenido, {user?.firstName || user?.emailAddresses?.[0]?.emailAddress}
              </p>
            </div>

            {/* Botón crear curso */}
            <div className="mb-6">
              <button
                onClick={() => (window.location.href = "#/editor")}
                className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg font-semibold transition shadow-md"
              >
                ➕ Crear nuevo curso
              </button>
            </div>

            {/* Cards de estadísticas */}
            {!loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Mis Cursos</p>
                      <p className="text-3xl font-bold text-green-700">{totalCourses}</p>
                    </div>
                    <BookOpen className="text-green-500" size={40} />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Estudiantes Inscritos</p>
                      <p className="text-3xl font-bold text-blue-700">{totalStudents}</p>
                    </div>
                    <Users className="text-blue-500" size={40} />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Quizzes Completados</p>
                      <p className="text-3xl font-bold text-purple-700">{totalQuizzesCompleted}</p>
                    </div>
                    <CheckCircle2 className="text-purple-500" size={40} />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Tasa Compleción</p>
                      <p className="text-3xl font-bold text-orange-700">
                        {totalQuizzesCompleted > 0 
                          ? ((totalQuizzesCompleted / (Object.values(courseStats).reduce((sum, s) => sum + s.quizCount, 0) * totalStudents || 1)) * 100).toFixed(1)
                          : "0"
                        }%
                      </p>
                    </div>
                    <BarChart3 className="text-orange-500" size={40} />
                  </div>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-300">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-4 py-2 font-semibold transition ${
                  activeTab === "overview"
                    ? "text-green-600 border-b-2 border-green-600"
                    : "text-gray-600 hover:text-green-600"
                }`}
              >
                Resumen
              </button>
              <button
                onClick={() => setActiveTab("courses")}
                className={`px-4 py-2 font-semibold transition ${
                  activeTab === "courses"
                    ? "text-green-600 border-b-2 border-green-600"
                    : "text-gray-600 hover:text-green-600"
                }`}
              >
                Mis Cursos
              </button>
              <button
                onClick={() => setActiveTab("students")}
                className={`px-4 py-2 font-semibold transition ${
                  activeTab === "students"
                    ? "text-green-600 border-b-2 border-green-600"
                    : "text-gray-600 hover:text-green-600"
                }`}
              >
                Estudiantes
              </button>
              <button
                onClick={() => setActiveTab("results")}
                className={`px-4 py-2 font-semibold transition ${
                  activeTab === "results"
                    ? "text-green-600 border-b-2 border-green-600"
                    : "text-gray-600 hover:text-green-600"
                }`}
              >
                Resultados
              </button>
            </div>

            {/* Contenido de tabs */}
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Cargando dashboard...</p>
              </div>
            ) : (
              <>
                {/* TAB: Resumen */}
                {activeTab === "overview" && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-2xl font-bold text-green-600 mb-4">Resumen General</h2>
                    {courses.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-600 mb-4">No tienes cursos creados aún.</p>
                        <button
                          onClick={() => (window.location.href = "#/editor")}
                          className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-semibold"
                        >
                          Crear mi primer curso
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {courses.map((course) => {
                          return (
                            <div key={course.id} className="border rounded-lg p-4 hover:shadow-md transition">
                              <h3 className="text-lg font-semibold text-green-600 mb-1">{course.title}</h3>
                              <p className="text-xs text-gray-500 mb-2">📌 Curso disponible</p>
                              <p className="text-gray-600 text-sm mb-3">{course.description}</p>
                              <div className="flex justify-between text-sm text-gray-700 mb-3">
                                <span>👥 {courseStats[course.id]?.enrolledStudents || 0} estudiantes</span>
                                <span>📋 {courseStats[course.id]?.quizCount || 0} quizzes</span>
                              </div>
                              <div className="flex gap-2">
                                <a
                                  href={`#/course/${course.id}`}
                                  className="text-green-600 hover:text-green-500 font-semibold inline-block"
                                >
                                  Ver curso →
                                </a>
                                <a
                                  href={`#/editor?courseId=${course.id}`}
                                  className="text-blue-600 hover:text-blue-500 font-semibold inline-block"
                                >
                                  Editar
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB: Mis Cursos */}
                {activeTab === "courses" && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-2xl font-bold text-green-600 mb-4">Mis Cursos</h2>
                    {courses.length === 0 ? (
                      <p className="text-gray-600 text-center py-8">No hay cursos.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-green-100 text-green-800 font-semibold">
                            <tr>
                              <th className="px-4 py-2 text-left">Curso</th>
                              <th className="px-4 py-2 text-left">Creado por</th>
                              <th className="px-4 py-2 text-center">Estudiantes</th>
                              <th className="px-4 py-2 text-center">Quizzes</th>
                              <th className="px-4 py-2 text-center">Completados</th>
                              <th className="px-4 py-2 text-center">Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {courses.map((course) => {
                              return (
                                <tr key={course.id} className="border-b hover:bg-gray-50">
                                  <td className="px-4 py-3 font-semibold">{course.title}</td>
                                  <td className="px-4 py-3 text-sm text-gray-600">Docente</td>
                                  <td className="px-4 py-3 text-center">{courseStats[course.id]?.enrolledStudents || 0}</td>
                                  <td className="px-4 py-3 text-center">{courseStats[course.id]?.quizCount || 0}</td>
                                  <td className="px-4 py-3 text-center">{courseStats[course.id]?.completedQuizzes || 0}</td>
                                  <td className="px-4 py-3 text-center">
                                    <a
                                      href={`#/course/${course.id}`}
                                      className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-xs font-semibold"
                                    >
                                      Ver
                                    </a>
                                    <a
                                      href={`#/editor?courseId=${course.id}`}
                                      className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-xs font-semibold"
                                    >
                                      Editar
                                    </a>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB: Estudiantes */}
                {activeTab === "students" && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-2xl font-bold text-green-600 mb-4">Estudiantes Inscritos</h2>
                    {students.length === 0 ? (
                      <p className="text-gray-600 text-center py-8">No hay estudiantes inscritos.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-blue-100 text-blue-800 font-semibold">
                            <tr>
                              <th className="px-4 py-2 text-left">Nombre</th>
                              <th className="px-4 py-2 text-left">Email</th>
                              <th className="px-4 py-2 text-center">Cursos Inscritos</th>
                              <th className="px-4 py-2 text-center">Quizzes Completados</th>
                            </tr>
                          </thead>
                          <tbody>
                            {students.map((student) => {
                              const studentResults = allResults.filter(r => r.clerkId === student.clerkId);
                              const enrolledCourses = new Set(studentResults.map(r => r.courseId)).size;
                              const completedCount = studentResults.filter(r => r.completedAt).length;
                              return (
                                <tr key={student.clerkId} className="border-b hover:bg-gray-50">
                                  <td className="px-4 py-3 font-semibold">{student.firstName} {student.lastName}</td>
                                  <td className="px-4 py-3">{student.email}</td>
                                  <td className="px-4 py-3 text-center">{enrolledCourses}</td>
                                  <td className="px-4 py-3 text-center">{completedCount}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB: Resultados */}
                {activeTab === "results" && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-2xl font-bold text-green-600 mb-4">Resultados de Quizzes</h2>
                    {allResults.length === 0 ? (
                      <p className="text-gray-600 text-center py-8">No hay resultados aún.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-purple-100 text-purple-800 font-semibold">
                            <tr>
                              <th className="px-4 py-2 text-left">Estudiante</th>
                              <th className="px-4 py-2 text-left">Curso</th>
                              <th className="px-4 py-2 text-center">Quiz ID</th>
                              <th className="px-4 py-2 text-center">Nota</th>
                              <th className="px-4 py-2 text-center">Intentos</th>
                              <th className="px-4 py-2 text-center">Estado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {allResults.map((result, idx) => {
                              const course = courses.find(c => c.id === result.courseId);
                              const student = students.find(s => s.clerkId === result.clerkId);
                              return (
                                <tr key={idx} className="border-b hover:bg-gray-50">
                                  <td className="px-4 py-3 font-semibold">
                                    {student ? `${student.firstName} ${student.lastName}` : result.clerkId}
                                  </td>
                                  <td className="px-4 py-3">{course?.title || `Curso ${result.courseId}`}</td>
                                  <td className="px-4 py-3 text-center text-gray-600">#{result.quizBlockId}</td>
                                  <td className="px-4 py-3 text-center font-bold">
                                    {result.score !== null ? `${(result.score * 100).toFixed(0)}%` : "—"}
                                  </td>
                                  <td className="px-4 py-3 text-center">{result.attempts}/{result.maxAttempts}</td>
                                  <td className="px-4 py-3 text-center">
                                    {result.completedAt ? (
                                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                                        ✅ Completado
                                      </span>
                                    ) : result.score !== null ? (
                                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold">
                                        ⏳ En Progreso
                                      </span>
                                    ) : (
                                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-semibold">
                                        📌 Asignado
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </SignedIn>
    </>
  );
}
