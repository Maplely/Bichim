import { describe, test, expect, beforeAll, afterAll, vi } from 'vitest';
import supertest from 'supertest';
import { getTestDbPath, initTestDb, cleanTestDb, seedUsuario, createRoom, addMember, loginUser } from './helper.js';

let request;
let dbPath;
let db;

beforeAll(async () => {
  dbPath = getTestDbPath('rooms');
  db = initTestDb(dbPath);
  process.env.DATABASE_PATH = dbPath;
  process.env.JWT_SECRET = 'test_secret_rooms';

  vi.resetModules();
  const createApp = (await import('../backend/app.js')).default;
  const app = createApp();
  request = supertest(app);
});

afterAll(() => {
  db?.close();
  cleanTestDb(dbPath);
});

function auth(token) {
  return { Cookie: `token=${token}` };
}

describe('POST /api/rooms', () => {
  test('cria sala publica', async () => {
    seedUsuario(db, { email: 'cria_sala@test.com' });
    const token = await loginUser(request, 'cria_sala@test.com', 'Test1234');

    const res = await request.post('/api/rooms').set(auth(token)).send({ name: 'Minha Sala' });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Minha Sala');
    expect(res.body.code).toBeTruthy();
  });

  test('cria sala com senha', async () => {
    seedUsuario(db, { email: 'cria_senha@test.com' });
    const token = await loginUser(request, 'cria_senha@test.com', 'Test1234');

    const res = await request.post('/api/rooms').set(auth(token)).send({ name: 'Sala Protegida', password: '123' });
    expect(res.status).toBe(201);
  });

  test('rejeita sala sem nome', async () => {
    seedUsuario(db, { email: 'sem_nome@test.com' });
    const token = await loginUser(request, 'sem_nome@test.com', 'Test1234');

    const res = await request.post('/api/rooms').set(auth(token)).send({ name: '' });
    expect(res.status).toBe(400);
    expect(res.body.erro).toContain('obrigatório');
  });

  test('rejeita sem token', async () => {
    const res = await request.post('/api/rooms').send({ name: 'Sala' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/rooms', () => {
  test('lista salas do usuario', async () => {
    const user = seedUsuario(db, { email: 'lista_salas@test.com' });
    const token = await loginUser(request, 'lista_salas@test.com', 'Test1234');

    // criar salas via API para garantir que o owner seja membro
    await request.post('/api/rooms').set(auth(token)).send({ name: 'Sala A' });
    await request.post('/api/rooms').set(auth(token)).send({ name: 'Sala B' });

    const res = await request.get('/api/rooms').set(auth(token));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
  });
});

describe('POST /api/rooms/join', () => {
  test('entra em sala por codigo', async () => {
    const owner = seedUsuario(db, { email: 'dono_join@test.com', nome: 'Dono' });
    const member = seedUsuario(db, { email: 'membro_join@test.com', nome: 'Membro' });
    const memberToken = await loginUser(request, 'membro_join@test.com', 'Test1234');
    const ownerToken = await loginUser(request, 'dono_join@test.com', 'Test1234');

    const createRes = await request.post('/api/rooms').set(auth(ownerToken)).send({ name: 'Sala Join' });

    const res = await request.post('/api/rooms/join').set(auth(memberToken)).send({ code: createRes.body.code });
    expect(res.status).toBe(200);
  });

  test('rejeita codigo inexistente', async () => {
    seedUsuario(db, { email: 'cod_inv@test.com' });
    const token = await loginUser(request, 'cod_inv@test.com', 'Test1234');

    const res = await request.post('/api/rooms/join').set(auth(token)).send({ code: 'XXXXXX' });
    expect(res.status).toBe(404);
  });

  test('rejeita se ja esta na sala', async () => {
    const user = seedUsuario(db, { email: 'ja_dentro@test.com' });
    const token = await loginUser(request, 'ja_dentro@test.com', 'Test1234');

    const createRes = await request.post('/api/rooms').set(auth(token)).send({ name: 'Sala' });

    const res = await request.post('/api/rooms/join').set(auth(token)).send({ code: createRes.body.code });
    expect(res.status).toBe(409);
    expect(res.body.erro).toBe('Você já está nesta sala');
  });
});

describe('DELETE /api/rooms/:id', () => {
  test('deleta sala como dono', async () => {
    const user = seedUsuario(db, { email: 'deleta_ok@test.com' });
    const token = await loginUser(request, 'deleta_ok@test.com', 'Test1234');

    const createRes = await request.post('/api/rooms').set(auth(token)).send({ name: 'Deletar' });
    const roomId = createRes.body.id;

    const res = await request.delete(`/api/rooms/${roomId}`).set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.mensagem).toContain('deletada');
  });

  test('nao deleta sala como nao-dono', async () => {
    const owner = seedUsuario(db, { email: 'dono_del@test.com', nome: 'Dono' });
    const user = seedUsuario(db, { email: 'nao_dono@test.com', nome: 'Intruso' });
    const ownerToken = await loginUser(request, 'dono_del@test.com', 'Test1234');
    const userToken = await loginUser(request, 'nao_dono@test.com', 'Test1234');

    const createRes = await request.post('/api/rooms').set(auth(ownerToken)).send({ name: 'Nao Del' });
    const roomId = createRes.body.id;

    const res = await request.delete(`/api/rooms/${roomId}`).set(auth(userToken));
    expect(res.status).toBe(403);
  });
});

describe('GET /api/rooms/:id/members', () => {
  test('lista membros da sala', async () => {
    const user = seedUsuario(db, { email: 'membros_list@test.com' });
    const token = await loginUser(request, 'membros_list@test.com', 'Test1234');

    const createRes = await request.post('/api/rooms').set(auth(token)).send({ name: 'Membros' });
    const roomId = createRes.body.id;

    const res = await request.get(`/api/rooms/${roomId}/members`).set(auth(token));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });
});
