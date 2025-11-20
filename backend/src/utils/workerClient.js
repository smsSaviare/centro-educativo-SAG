const WORKER_URL = process.env.WORKER_URL || '';
const WORKER_SECRET = process.env.WORKER_SECRET || '';

if (!WORKER_URL) {
  console.warn('workerClient: WORKER_URL not set; calls will fail until configured');
}

async function callWorker(path, method = 'GET', body = null) {
  if (!WORKER_URL) throw new Error('WORKER_URL not configured');
  const url = new URL(path, WORKER_URL).toString();
  const headers = { 'x-internal-secret': WORKER_SECRET, 'content-type': 'application/json' };
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Worker error ${res.status}: ${txt}`);
  }
  return res.json();
}

module.exports = {
  get: async (path) => callWorker(path, 'GET'),
  post: async (path, body) => callWorker(path, 'POST', body),
  put: async (path, body) => callWorker(path, 'PUT', body),
  delete: async (path) => callWorker(path, 'DELETE'),
};
