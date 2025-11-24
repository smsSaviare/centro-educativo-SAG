import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { getMyCourses, getQuizResults } from '../api';

export default function StudentPanel() {
  const { user, isSignedIn } = useUser();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resultsByCourse, setResultsByCourse] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function load() {
      if (!isSignedIn || !user) return setLoading(false);
      setLoading(true);
      try {
        const my = await getMyCourses(user.id).catch(() => []);
        setCourses(Array.isArray(my) ? my : []);
        const map = {};
        for (const c of (my || [])) {
          try {
            const r = await getQuizResults(c.id, user.id).catch(() => []);
            map[c.id] = Array.isArray(r) ? r : [];
          } catch (err) {
            map[c.id] = [];
          }
        }
        setResultsByCourse(map);
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
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Panel del estudiante</h2>
      <p className="mb-4 text-gray-600">Aquí puedes ver tus notas en los quizzes asignados.</p>

      {message && <div className="mb-4 text-red-600">{message}</div>}

      {courses.length === 0 ? (
        <div className="p-4 bg-white rounded shadow">No estás inscrito en cursos o no hay cursos disponibles.</div>
      ) : (
        <div className="space-y-6">
          {courses.map((c) => (
            <div key={c.id} className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold">{c.title}</h3>
              <p className="text-sm text-gray-500 mb-3">{c.description}</p>

              <div>
                <h4 className="font-semibold mb-2">Resultados</h4>
                {(resultsByCourse[c.id] || []).length === 0 ? (
                  <p className="text-sm text-gray-500">No tienes resultados para este curso.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left">
                        <th>Quiz</th>
                        <th>Nota</th>
                        <th>Completado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(resultsByCourse[c.id] || []).map((r) => (
                          <tr key={`${c.id}-${r.id}`}>
                            <td>{`Quiz (${c.title})`}</td>
                            <td>{r.score === null || r.score === undefined ? '—' : Math.round(r.score * 100) + '%'}</td>
                            <td>{r.completedAt ? '✅' : '⏳'}</td>
                          </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
