import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..', '..');

const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ||
  'postgresql://visarun:visarun@localhost:5432/visarun_test';

const TEST_PORT = Number(process.env.TEST_PORT) || 3099;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

async function isDatabaseAvailable() {
  const pool = new pg.Pool({ connectionString: TEST_DATABASE_URL });
  try {
    await pool.query('SELECT 1');
    return true;
  } catch {
    return false;
  } finally {
    await pool.end();
  }
}

async function resetDatabase() {
  const pool = new pg.Pool({ connectionString: TEST_DATABASE_URL });
  await pool.query(`
    DROP SCHEMA public CASCADE;
    CREATE SCHEMA public;
  `);
  await pool.end();
}

async function waitForHealth(timeoutMs = 15000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(`${BASE_URL}/api/health`);
      if (response.ok) return;
    } catch {
      /* retry */
    }
    await delay(250);
  }
  throw new Error('Test server did not become healthy in time');
}

async function startServer() {
  await resetDatabase();

  const child = spawn('node', ['server/index.js'], {
    cwd: projectRoot,
    env: {
      ...process.env,
      PORT: String(TEST_PORT),
      DATABASE_URL: TEST_DATABASE_URL,
      JWT_SECRET: 'visarun-test-secret',
      CORS_ORIGIN: 'http://localhost:5173',
      NODE_ENV: 'test',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  child.stdout.on('data', (chunk) => process.stdout.write(`[test-server] ${chunk}`));
  child.stderr.on('data', (chunk) => process.stderr.write(`[test-server] ${chunk}`));

  await waitForHealth();

  return child;
}

async function stopServer(child) {
  if (!child || child.killed) return;
  child.kill('SIGTERM');
  await delay(300);
}

async function registerUser(suffix = randomUUID().slice(0, 8)) {
  const payload = {
    email: `user-${suffix}@example.com`,
    password: 'secret123',
    fullName: 'Test User',
  };

  const response = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  assert.equal(response.status, 201);
  const data = await response.json();
  return { ...payload, token: data.token, clientId: data.client.id };
}

async function authFetch(token, path, options = {}) {
  return fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  });
}

let serverProcess;
let databaseAvailable = false;

test.before(async () => {
  databaseAvailable = await isDatabaseAvailable();
  if (!databaseAvailable) {
    console.warn(
      'Skipping API tests: PostgreSQL is not available. Start PostgreSQL and create visarun_test database.',
    );
    return;
  }
  serverProcess = await startServer();
});

test.after(async () => {
  if (!databaseAvailable) return;
  await stopServer(serverProcess);
});

function requireDatabase(testFn) {
  return async (t) => {
    if (!databaseAvailable) {
      t.skip('PostgreSQL is not available');
      return;
    }
    await testFn(t);
  };
}

test('register and login work with normalized email', requireDatabase(async () => {
  const email = `Login-${randomUUID().slice(0, 6)}@Example.com`;
  const password = 'secret123';

  const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, fullName: 'Login User' }),
  });
  assert.equal(registerResponse.status, 201);

  const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.toUpperCase(), password }),
  });
  assert.equal(loginResponse.status, 200);
}));

test('tracker data is isolated between users', requireDatabase(async () => {
  const userA = await registerUser();
  const userB = await registerUser();

  const saveResponse = await authFetch(userA.token, '/api/tracker', {
    method: 'PUT',
    body: JSON.stringify({
      entryDate: '2026-01-01',
      exitDate: '',
      dayLimit: 45,
      location: 'Vietnam',
      citizenship: 'RU',
      entryType: 'visa-free',
      visaRunHistory: [],
    }),
  });
  assert.equal(saveResponse.status, 200);

  const userATracker = await authFetch(userA.token, '/api/tracker');
  const userBTracker = await authFetch(userB.token, '/api/tracker');

  const trackerA = (await userATracker.json()).tracker;
  const trackerB = (await userBTracker.json()).tracker;

  assert.equal(trackerA.entryDate, '2026-01-01');
  assert.equal(trackerB.entryDate, '');
}));

test('settings can be saved and loaded', requireDatabase(async () => {
  const user = await registerUser();

  const saveResponse = await authFetch(user.token, '/api/settings', {
    method: 'PUT',
    body: JSON.stringify({
      reminders: { days14: false, days7: true, days3: true, days1: false },
      notificationTime: '09:30',
      criticalAlerts: true,
      currency: 'VND',
      offlineCache: false,
      biometricsEnabled: true,
      partnerMode: true,
      partnerRoute: 'Da Nang — Lao Bao',
      partnerTariff: '1200000',
    }),
  });
  assert.equal(saveResponse.status, 200);

  const loadResponse = await authFetch(user.token, '/api/settings');
  const settings = (await loadResponse.json()).settings;

  assert.equal(settings.notificationTime, '09:30');
  assert.equal(settings.currency, 'VND');
  assert.equal(settings.partnerRoute, 'Da Nang — Lao Bao');
  assert.equal(settings.reminders.days14, false);
}));

test('visa run history supports create and delete', requireDatabase(async () => {
  const user = await registerUser();

  const createResponse = await authFetch(user.token, '/api/tracker/history', {
    method: 'POST',
    body: JSON.stringify({
      entryDate: '2025-12-01',
      checkpoint: 'Moc Bai',
      entryType: 'visa-free',
      exitDate: '2025-12-02',
    }),
  });
  assert.equal(createResponse.status, 201);

  const trackerAfterCreate = (await createResponse.json()).tracker;
  assert.equal(trackerAfterCreate.visaRunHistory.length, 1);

  const recordId = trackerAfterCreate.visaRunHistory[0].id;
  const deleteResponse = await authFetch(user.token, `/api/tracker/history/${recordId}`, {
    method: 'DELETE',
  });
  assert.equal(deleteResponse.status, 200);

  const trackerAfterDelete = (await deleteResponse.json()).tracker;
  assert.equal(trackerAfterDelete.visaRunHistory.length, 0);
}));
