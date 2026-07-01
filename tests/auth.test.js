import { describe, test, expect, beforeAll, afterAll, vi } from 'vitest';
import supertest from 'supertest';
import { getTestDbPath, initTestDb, cleanTestDb, seedUsuario } from './helper.js';

let request;
let dbPath;
let db;

beforeAll(async () => {
  dbPath = getTestDbPath('auth');
  db = initTestDb(dbPath);
  process.env.DATABASE_PATH = dbPath;
  process.env.JWT_SECRET = 'test_secret_auth';

  vi.resetModules();
  const createApp = (await import('../backend/app.js')).default;
  const app = createApp();
  request = supertest(app);
});

afterAll(() => {
  db?.close();
  cleanTestDb(dbPath);
});

describe('POST /api/auth/signup', () => {
  test('cria usuario com dados validos', async () => {
    const res = await request.post('/api/auth/signup').send({
      nome: 'Novo Usuario',
      email: 'novo@test.com',
      senha: 'Senha123',
    });
    expect(res.status).toBe(201);
    expect(res.body.mensagem).toContain('Cadastro realizado');
  });

  test('rejeita email duplicado', async () => {
    await request.post('/api/auth/signup').send({
      nome: 'Outro',
      email: 'dup@test.com',
      senha: 'Senha123',
    });
    const res = await request.post('/api/auth/signup').send({
      nome: 'Outro',
      email: 'dup@test.com',
      senha: 'Senha123',
    });
    expect(res.status).toBe(400);
    expect(res.body.erro).toContain('Email já cadastrado');
  });

  test('rejeita dados invalidos (email vazio)', async () => {
    const res = await request.post('/api/auth/signup').send({
      nome: 'Teste',
      email: '',
      senha: 'Senha123',
    });
    expect(res.status).toBe(400);
    expect(res.body.erro).toContain('são obrigatórios');
  });

  test('rejeita email mal formatado', async () => {
    const res = await request.post('/api/auth/signup').send({
      nome: 'Teste',
      email: 'invalido',
      senha: 'Senha123',
    });
    expect(res.status).toBe(400);
    expect(res.body.erro).toContain('Email inválido');
  });

  test('rejeita senha curta', async () => {
    const res = await request.post('/api/auth/signup').send({
      nome: 'Teste',
      email: 'senha@test.com',
      senha: '123',
    });
    expect(res.status).toBe(400);
    expect(res.body.erro).toContain('no mínimo 6 caracteres');
  });
});

describe('POST /api/auth/verificar-email', () => {
  test('verifica usuario com codigo valido', async () => {
    const row = seedUsuario(db, {
      email: 'verificar@test.com',
      verificado: false,
      codigo_verificacao: '123456',
    });
    const res = await request.post('/api/auth/verificar-email').send({
      email: row.email,
      codigo: '123456',
    });
    expect(res.status).toBe(200);
    expect(res.body.mensagem).toContain('verificado');
  });

  test('rejeita codigo invalido', async () => {
    const row = seedUsuario(db, {
      email: 'codigo_inv@test.com',
      verificado: false,
      codigo_verificacao: '654321',
    });
    const res = await request.post('/api/auth/verificar-email').send({
      email: row.email,
      codigo: '000000',
    });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  test('login com credenciais validas', async () => {
    seedUsuario(db, {
      email: 'login@test.com',
      senha: 'MinhaSenha1',
      verificado: true,
    });
    const res = await request.post('/api/auth/login').send({
      email: 'login@test.com',
      senha: 'MinhaSenha1',
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.usuario.email).toBe('login@test.com');
    expect(res.headers['set-cookie']).toBeDefined();
    expect(res.headers['set-cookie'][0]).toContain('token=');
  });

  test('rejeita credenciais invalidas', async () => {
    const res = await request.post('/api/auth/login').send({
      email: 'naoexiste@test.com',
      senha: 'Seila123',
    });
    expect(res.status).toBe(401);
    expect(res.body.erro).toContain('Credenciais inválidas');
  });

  test('rejeita usuario nao verificado', async () => {
    seedUsuario(db, {
      email: 'naoverif@test.com',
      senha: 'Senha1234',
      verificado: false,
    });
    const res = await request.post('/api/auth/login').send({
      email: 'naoverif@test.com',
      senha: 'Senha1234',
    });
    expect(res.status).toBe(403);
    expect(res.body.erro).toContain('não verificada');
  });

  test('rejeita senha errada', async () => {
    seedUsuario(db, {
      email: 'senerrada@test.com',
      senha: 'SenhaCorreta1',
      verificado: true,
    });
    const res = await request.post('/api/auth/login').send({
      email: 'senerrada@test.com',
      senha: 'SenhaErrada1',
    });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  test('retorna usuario autenticado', async () => {
    const row = seedUsuario(db, {
      email: 'me_test@test.com',
      senha: 'Senha1234',
      verificado: true,
    });
    const loginRes = await request.post('/api/auth/login').send({
      email: 'me_test@test.com',
      senha: 'Senha1234',
    });
    const token = loginRes.body.token;

    const res = await request.get('/api/auth/me').set('Cookie', `token=${token}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('me_test@test.com');
  });

  test('rejeita sem token', async () => {
    const res = await request.get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/logout', () => {
  test('limpa cookie e retorna sucesso', async () => {
    const row = seedUsuario(db, {
      email: 'logout@test.com',
      senha: 'Senha1234',
      verificado: true,
    });
    const loginRes = await request.post('/api/auth/login').send({
      email: 'logout@test.com',
      senha: 'Senha1234',
    });
    const token = loginRes.body.token;

    const res = await request.post('/api/auth/logout').set('Cookie', `token=${token}`);
    expect(res.status).toBe(200);
    expect(res.body.mensagem).toContain('Logout realizado');
  });
});
