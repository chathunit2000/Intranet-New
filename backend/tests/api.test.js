const test = require('node:test');
const assert = require('node:assert/strict');
const { createServer } = require('../server.js');

test('login returns a token and dashboard loads for authenticated users', async () => {
  const server = createServer();
  if (!server.listening) {
    await new Promise((resolve) => server.once('listening', resolve));
  }

  const { port } = server.address();

  try {
    const loginRes = await fetch(`http://127.0.0.1:${port}/api/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ service_no: '6609', password: '6609' }),
    });

    assert.equal(loginRes.status, 200);
    const loginData = await loginRes.json();
    assert.ok(loginData.token);

    const dashboardRes = await fetch(`http://127.0.0.1:${port}/api/dashboard`, {
      headers: { Authorization: `Bearer ${loginData.token}` },
    });

    assert.equal(dashboardRes.status, 200);
    const dashboard = await dashboardRes.json();
    assert.equal(dashboard.profile.service_no, '6609');
    assert.ok(Array.isArray(dashboard.quick_links));
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
