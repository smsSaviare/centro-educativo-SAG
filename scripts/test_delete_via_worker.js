(async () => {
  const fetch = require('node-fetch');
  const WORKER_URL = 'https://sag-worker-production.sag-worker.workers.dev';
  const WORKER_SECRET = 'H9k3vR8pX4sQ2mT6zA1bN5yW0cL7fG3uE8jU2oP6dS9hV4xZ1qM0tR7';
  const clerkId = 'user_34TWX7M13fgqVw9cYoYgcfotRNP';
  try {
    const usersRes = await fetch(`${WORKER_URL}/users?clerkId=${encodeURIComponent(clerkId)}`, { headers: { 'x-internal-secret': WORKER_SECRET } });
    console.log('users status', usersRes.status);
    const users = await usersRes.json();
    console.log('users', users);
    const delRes = await fetch(`${WORKER_URL}/courses/47`, { method: 'DELETE', headers: { 'x-internal-secret': WORKER_SECRET } });
    console.log('delete status', delRes.status);
    console.log(await delRes.text());
  } catch (e) {
    console.error('error', e);
  }
})();