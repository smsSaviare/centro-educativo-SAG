// Module worker (ESM) required for D1 bindings
async function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function unauthorized() {
  return jsonResponse({ error: 'unauthorized' }, 401)
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const path = url.pathname.replace(/\/+$/, '')
    const secret = env.WORKER_SECRET || ''
    const incomingSecret = request.headers.get('x-internal-secret') || ''

    if (!secret || incomingSecret !== secret) {
      return unauthorized()
    }

    try {
      // Routing simple paths
      if (request.method === 'GET' && path === '/courses') {
        const res = await env.SAG_DB.prepare('SELECT * FROM Courses').all()
        return jsonResponse(res.results)
      }

      if (request.method === 'GET' && path.startsWith('/courses/')) {
        const id = parseInt(path.split('/')[2], 10)
        const res = await env.SAG_DB.prepare('SELECT * FROM Courses WHERE id = ?').bind(id).all()
        return jsonResponse(res.results[0] || null)
      }

      if (request.method === 'GET' && path === '/courseblocks') {
        const courseId = url.searchParams.get('courseId')
        if (!courseId) return jsonResponse([])
        const res = await env.SAG_DB.prepare('SELECT * FROM CourseBlocks WHERE courseId = ? ORDER BY position ASC').bind(courseId).all()
        return jsonResponse(res.results)
      }

      if (request.method === 'GET' && path === '/enrollments') {
        const clerkId = url.searchParams.get('clerkId')
        const courseId = url.searchParams.get('courseId')
        if (clerkId) {
          const res = await env.SAG_DB.prepare('SELECT * FROM Enrollments WHERE clerkId = ?').bind(clerkId).all()
          return jsonResponse(res.results)
        }
        if (courseId) {
          const res = await env.SAG_DB.prepare('SELECT * FROM Enrollments WHERE courseId = ?').bind(courseId).all()
          return jsonResponse(res.results)
        }
        return jsonResponse([])
      }

      if (request.method === 'POST' && path === '/enrollments') {
        const body = await request.json()
        const { courseId, clerkId } = body
        const res = await env.SAG_DB.prepare('INSERT INTO Enrollments (courseId, clerkId, assignedAt) VALUES (?, ?, ?)')
          .bind(courseId, clerkId, new Date().toISOString())
          .run()
        return jsonResponse({ success: true, lastRowId: res.lastRowId })
      }

      if (request.method === 'GET' && path === '/quiz-results') {
        const clerkId = url.searchParams.get('clerkId')
        const courseId = url.searchParams.get('courseId')
        if (clerkId) {
          const res = await env.SAG_DB.prepare('SELECT * FROM QuizResults WHERE clerkId = ? ORDER BY quizBlockId ASC').bind(clerkId).all()
          return jsonResponse(res.results)
        }
        if (courseId) {
          const res = await env.SAG_DB.prepare('SELECT * FROM QuizResults WHERE courseId = ? ORDER BY quizBlockId ASC').bind(courseId).all()
          return jsonResponse(res.results)
        }
        return jsonResponse([])
      }

      if (request.method === 'POST' && path === '/quiz-results') {
        const b = await request.json()
        const stmt = await env.SAG_DB.prepare(
          'INSERT INTO QuizResults (courseId, clerkId, quizBlockId, score, answers, assignedBy, completedAt, attempts, maxAttempts) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        ).bind(
          b.courseId,
          b.clerkId,
          b.quizBlockId,
          b.score ?? null,
          JSON.stringify(b.answers ?? null),
          b.assignedBy ?? null,
          b.completedAt ?? null,
          b.attempts ?? 0,
          b.maxAttempts ?? 1
        )
        const res = await stmt.run()
        return jsonResponse({ success: true, lastRowId: res.lastRowId })
      }

      if (request.method === 'GET' && path === '/users') {
        const clerkId = url.searchParams.get('clerkId')
        if (clerkId) {
          const res = await env.SAG_DB.prepare('SELECT * FROM Users WHERE clerkId = ?').bind(clerkId).all()
          return jsonResponse(res.results)
        }
        const res = await env.SAG_DB.prepare('SELECT * FROM Users').all()
        return jsonResponse(res.results)
      }

      return jsonResponse({ error: 'not_found' }, 404)
    } catch (err) {
      return jsonResponse({ error: err.message }, 500)
    }
  }
}
