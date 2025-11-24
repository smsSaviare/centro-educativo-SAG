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
    // Normalize secret: strip possible UTF-8 BOM that can be introduced by some
    // Windows/Powershell piping flows when uploading secrets.
    const rawSecret = env.WORKER_SECRET || ''
    const secret = rawSecret.replace(/^\uFEFF/, '')
    const incomingSecret = request.headers.get('x-internal-secret') || ''

    // Note: removed debug logging and debug_probe endpoint for production.
    // We keep BOM normalization above to avoid secret mismatches on Windows.

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

      // DELETE course and related records (CourseBlocks, Enrollments, QuizResults)
      if (request.method === 'DELETE' && path.startsWith('/courses/')) {
        const id = parseInt(path.split('/')[2], 10)
        // Delete dependent rows first to satisfy FK constraints
        await env.SAG_DB.prepare('DELETE FROM CourseBlocks WHERE courseId = ?').bind(id).run()
        await env.SAG_DB.prepare('DELETE FROM Enrollments WHERE courseId = ?').bind(id).run()
        await env.SAG_DB.prepare('DELETE FROM QuizResults WHERE courseId = ?').bind(id).run()
        const res = await env.SAG_DB.prepare('DELETE FROM Courses WHERE id = ?').bind(id).run()
        return jsonResponse({ success: true, deleted: res.changes || res.rowsAffected || 0 })
      }

      if (request.method === 'GET' && path === '/courseblocks') {
        const courseId = url.searchParams.get('courseId')
        if (!courseId) return jsonResponse([])
        const res = await env.SAG_DB.prepare('SELECT * FROM CourseBlocks WHERE courseId = ? ORDER BY position ASC').bind(courseId).all()
        return jsonResponse(res.results)
      }

      // Replace course blocks for a course (delete existing + insert new)
      if (request.method === 'POST' && path === '/courseblocks') {
        const b = await request.json();
        const courseId = b.courseId;
        const blocks = Array.isArray(b.blocks) ? b.blocks : [];
        if (!courseId) return jsonResponse({ error: 'missing courseId' }, 400);

        // Delete existing blocks for course
        await env.SAG_DB.prepare('DELETE FROM CourseBlocks WHERE courseId = ?').bind(courseId).run();

        const inserted = [];
        const now = new Date().toISOString();
        for (let i = 0; i < blocks.length; i++) {
          const block = blocks[i] || {};
          const type = block.type || 'text';
          let contentObj = {};
          if (type === 'quiz') {
            contentObj = {
              question: block.question || '',
              options: Array.isArray(block.options) ? block.options : [],
              correct: block.correct ?? 0,
            };
          } else {
            contentObj = {
              text: block.content || '',
              url: block.url || '',
            };
          }

          // Note: the D1 `CourseBlocks` table may not have `createdAt`/`updatedAt` columns
          // (they were not present in the migrated schema). Insert only the columns that exist.
          const stmt = await env.SAG_DB.prepare('INSERT INTO CourseBlocks (courseId, type, content, position) VALUES (?, ?, ?, ?)')
            .bind(courseId, type, JSON.stringify(contentObj), block.position ?? i);
          const r = await stmt.run();
          const id = r && (r.lastRowId || r.lastInsertRowid || r.insertId || r.id);
          const fetched = id ? await env.SAG_DB.prepare('SELECT * FROM CourseBlocks WHERE id = ?').bind(id).all() : null;
          inserted.push(fetched ? (fetched.results[0] || null) : null);
        }

        return jsonResponse(inserted);
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

      // Create or update user (upsert) — used by backend /sync-user when in WORKER mode
      if (request.method === 'POST' && path === '/users') {
        const b = await request.json();
        const { clerkId, email, firstName, lastName, role } = b;
        if (!clerkId) return jsonResponse({ error: 'missing clerkId' }, 400);

        // Check if user exists
        const exists = await env.SAG_DB.prepare('SELECT id FROM Users WHERE clerkId = ?').bind(clerkId).all();
        if (Array.isArray(exists.results) && exists.results.length > 0) {
          await env.SAG_DB.prepare('UPDATE Users SET email = ?, firstName = ?, lastName = ?, role = ? WHERE clerkId = ?')
            .bind(email || '', firstName || '', lastName || '', role || 'student', clerkId).run();
        } else {
          await env.SAG_DB.prepare('INSERT INTO Users (clerkId, email, firstName, lastName, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)')
            .bind(clerkId, email || '', firstName || '', lastName || '', role || 'student', new Date().toISOString(), new Date().toISOString()).run();
        }

        const res = await env.SAG_DB.prepare('SELECT * FROM Users WHERE clerkId = ?').bind(clerkId).all();
        return jsonResponse(res.results[0] || null);
      }

      // Create a new course
      if (request.method === 'POST' && path === '/courses') {
        const b = await request.json();
        // Basic validation
        if (!b || !b.title || !b.creatorClerkId) {
          return jsonResponse({ error: 'missing title or creatorClerkId' }, 400);
        }

        const now = new Date().toISOString();
        const stmt = await env.SAG_DB.prepare(
          'INSERT INTO Courses (title, description, image, resources, creatorClerkId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).bind(
          b.title || '',
          b.description || '',
          b.image || null,
          JSON.stringify(b.resources ?? []),
          b.creatorClerkId || null,
          now,
          now
        );
        const r = await stmt.run();
        // D1 driver may return different keys for last inserted id
        const id = r && (r.lastRowId || r.lastInsertRowid || r.insertId || r.id);
        if (!id) {
          // fallback: try to find by unique fields (createdAt + title + creator)
          const fetchedFallback = await env.SAG_DB.prepare('SELECT * FROM Courses WHERE title = ? AND creatorClerkId = ? ORDER BY createdAt DESC LIMIT 1')
            .bind(b.title, b.creatorClerkId).all();
          return jsonResponse(fetchedFallback.results[0] || null, 201);
        }
        const fetched = await env.SAG_DB.prepare('SELECT * FROM Courses WHERE id = ?').bind(id).all();
        return jsonResponse(fetched.results[0] || null, 201);
      }

      // Update an existing course
      if (request.method === 'PUT' && path.startsWith('/courses/')) {
        const id = parseInt(path.split('/')[2], 10);
        const b = await request.json();
        // Only update allowed fields
        const now = new Date().toISOString();
        await env.SAG_DB.prepare(
          'UPDATE Courses SET title = ?, description = ?, image = ?, resources = ?, updatedAt = ? WHERE id = ?'
        ).bind(
          b.title || '',
          b.description || '',
          b.image || null,
          JSON.stringify(b.resources ?? []),
          now,
          id
        ).run();

        const fetched = await env.SAG_DB.prepare('SELECT * FROM Courses WHERE id = ?').bind(id).all();
        return jsonResponse(fetched.results[0] || null);
      }

      return jsonResponse({ error: 'not_found' }, 404)
    } catch (err) {
      // Log full error to worker logs and return stack for debugging
      try { console.error('Worker error', err); } catch (e) {}
      return jsonResponse({ error: err && err.message ? err.message : String(err), stack: err && err.stack ? err.stack : null }, 500)
    }
  }
}
