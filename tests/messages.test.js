import { describe, test, expect, beforeAll, afterAll, vi } from 'vitest';
import supertest from 'supertest';
import { getTestDbPath, initTestDb, cleanTestDb, seedUsuario, createRoom, addMember, loginUser } from './helper.js';

let request;
let dbPath;
let db;

beforeAll(async () => {
  dbPath = getTestDbPath('messages');
  db = initTestDb(dbPath);
  process.env.DATABASE_PATH = dbPath;
  process.env.JWT_SECRET = 'test_secret_msgs';

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

async function criarSalaEUsuario(email, nome) {
  const user = seedUsuario(db, { email, nome });
  const token = await loginUser(request, email, 'Test1234');
  const createRes = await request.post('/api/rooms').set(auth(token)).send({ name: nome + '\'s Room' });
  return { user, token, room: createRes.body };
}

describe('POST /api/rooms/:id/messages', () => {
  test('envia mensagem com sucesso', async () => {
    const { token, room } = await criarSalaEUsuario('envia_msg@test.com', 'Remetente');

    const res = await request
      .post(`/api/rooms/${room.id}/messages`)
      .set(auth(token))
      .send({ content: 'Olá, mundo!' });

    expect(res.status).toBe(201);
    expect(res.body.content).toBe('Olá, mundo!');
    expect(res.body.user_name).toBe('Remetente');
  });

  test('rejeita mensagem vazia', async () => {
    const { token, room } = await criarSalaEUsuario('msg_vazia@test.com', 'Vazio');

    const res = await request
      .post(`/api/rooms/${room.id}/messages`)
      .set(auth(token))
      .send({ content: '' });

    expect(res.status).toBe(400);
    expect(res.body.erro).toContain('obrigatório');
  });

  test('rejeita sem token', async () => {
    const { room } = await criarSalaEUsuario('msg_sem_token@test.com', 'SemToken');

    const res = await request
      .post(`/api/rooms/${room.id}/messages`)
      .send({ content: 'Oi' });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/rooms/:id/messages', () => {
  test('lista mensagens da sala vazia', async () => {
    const { token, room } = await criarSalaEUsuario('lista_vazia@test.com', 'ListaVazia');

    const res = await request
      .get(`/api/rooms/${room.id}/messages`)
      .set(auth(token));

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  test('lista mensagens da sala', async () => {
    const { token, room } = await criarSalaEUsuario('lista_msg@test.com', 'Listador');

    await request.post(`/api/rooms/${room.id}/messages`).set(auth(token)).send({ content: 'Msg 1' });
    await request.post(`/api/rooms/${room.id}/messages`).set(auth(token)).send({ content: 'Msg 2' });
    await request.post(`/api/rooms/${room.id}/messages`).set(auth(token)).send({ content: 'Msg 3' });

    const res = await request
      .get(`/api/rooms/${room.id}/messages`)
      .set(auth(token));

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(3);
    expect(res.body[0].content).toBe('Msg 1');
    expect(res.body[2].content).toBe('Msg 3');
  });

  test('pagina com limit e before', async () => {
    const { token, room } = await criarSalaEUsuario('pagina_msg@test.com', 'Pagina');

    for (let i = 1; i <= 5; i++) {
      await request.post(`/api/rooms/${room.id}/messages`).set(auth(token)).send({ content: `Msg ${i}` });
    }

    // before = id da ultima mensagem (id 5)
    const allRes = await request.get(`/api/rooms/${room.id}/messages`).set(auth(token));
    const lastId = allRes.body[allRes.body.length - 1].id;

    const res = await request
      .get(`/api/rooms/${room.id}/messages`)
      .set(auth(token))
      .query({ limit: 2, before: lastId });

    expect(res.status).toBe(200);
    expect(res.body.length).toBeLessThanOrEqual(2);
  });
});
