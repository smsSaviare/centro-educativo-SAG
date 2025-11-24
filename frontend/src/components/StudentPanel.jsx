import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { getMyCourses, getQuizResults } from '../api';

export default function StudentPanel() {
  const { user, isSignedIn } = useUser();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resultsByCourse, setResultsByCourse] = useState({});
  const [latestResultByCourse, setLatestResultByCourse] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function load() {
      if (!isSignedIn || !user) return setLoading(false);
      setLoading(true);
      try {
        const my = await getMyCourses(user.id).catch(() => []);
        setCourses(Array.isArray(my) ? my : []);
        const map = {};
        const latestMap = {};
        for (const c of (my || [])) {
          try {
            const r = await getQuizResults(c.id, user.id).catch(() => []);
            const arr = Array.isArray(r) ? r : [];
            map[c.id] = arr;

            // choose latest result: prefer completedAt desc, fallback to id desc
            let latest = null;
            if (arr.length > 0) {
              latest = arr.slice().sort((a,b) => {
                const ta = a.completedAt ? new Date(a.completedAt).getTime() : 0;
                const tb = b.completedAt ? new Date(b.completedAt).getTime() : 0;
                if (ta !== tb) return tb - ta;
                return (b.id || 0) - (a.id || 0);
              })[0];
            }
            latestMap[c.id] = latest;
          } catch (err) {
            map[c.id] = [];
            latestMap[c.id] = null;
          }
        }
        setResultsByCourse(map);
        setLatestResultByCourse(latestMap);
      } catch (err) {
        console.error(err);
        setMessage('Error cargando datos');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [isSignedIn, user]);

  if (loading) return <div className="p-6">Cargando panel...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold mb-4 text-green-700">Panel del estudiante</h2>
      <p className="mb-6 text-gray-600">Resumen rápido: para cada curso verás el último quiz asignado y su nota.</p>

      {message && <div className="mb-4 text-red-600">{message}</div>}

      {courses.length === 0 ? (
        <div className="p-4 bg-white rounded shadow">No estás inscrito en cursos o no hay cursos disponibles.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((c) => {
            const latest = latestResultByCourse[c.id] || null;
            return (
              <div key={c.id} className="bg-white p-5 rounded-xl shadow-md flex items-center gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">{c.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{c.description}</p>
                  <div className="mt-3 text-sm text-gray-600">
                    {latest ? (
                      <>
                        <div>Último quiz: <strong>{`Quiz (${c.title})`}</strong></div>
                        <div className="text-xs text-gray-500">{latest.completedAt ? `Completado: ${new Date(latest.completedAt).toLocaleString()}` : 'Asignado (sin completar)'}</div>
                      </>
                    ) : (
                      <div className="text-sm text-gray-500">No tienes quizzes asignados en este curso.</div>
                    )}
                  </div>
                </div>

                <div className="w-36 text-center">
                  {latest ? (
                    <div className="inline-block bg-green-50 rounded-xl px-4 py-3">
                      <div className="text-xs text-gray-500">Nota</div>
                      <div className="text-2xl font-bold text-green-700">{latest.score === null || latest.score === undefined ? '—' : Math.round(latest.score * 100) + '%'}</div>
                      <div className="text-xs text-gray-500 mt-1">{latest.attempts != null ? `Intentos: ${latest.attempts}/${latest.maxAttempts ?? 1}` : ''}</div>
                    </div>
                  ) : (
                    <div className="inline-block bg-gray-50 rounded-xl px-3 py-2">
                      <div className="text-sm text-gray-500">Sin nota</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
