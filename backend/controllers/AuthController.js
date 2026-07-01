import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import Usuario from '../models/Usuario.js';
import { gerarToken, clearUserCache } from '../middlewares/auth.js';

function logCodigo(email, codigo) {
  const logPath = path.join(process.cwd(), 'data', 'codigos_verificacao.md');
  const linha = `| ${new Date().toISOString().slice(0, 19).replace('T', ' ')} | ${email} | ${codigo} |\n`;
  if (!fs.existsSync(logPath)) {
    fs.writeFileSync(logPath, '# Códigos de Verificação\n\n| Data/Hora | Email | Código |\n|-----------|-------|--------|\n');
  }
  fs.appendFileSync(logPath, linha);
}

class AuthController {
  async signup(req, res) {
    try {
      const { nome, email: rawEmail, senha } = req.body;
      const email = rawEmail ? rawEmail.toLowerCase().trim() : '';
      if (!nome || !email || !senha) {
        return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios' });
      }
      if (senha.length < 6) {
        return res.status(400).json({ erro: 'Senha deve ter no mínimo 6 caracteres' });
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ erro: 'Email inválido' });
      }

      const existente = await Usuario.buscarPorEmail(email);
      if (existente) {
        return res.status(400).json({ erro: 'Email já cadastrado' });
      }

      const senha_hash = await bcrypt.hash(senha, 10);
      const codigo_verificacao = crypto.randomInt(100000, 999999).toString();
      const codigo_expiracao = new Date(Date.now() + 30 * 60 * 1000).toISOString();

      await Usuario.criar({ nome: nome.trim(), email, senha_hash, codigo_verificacao, codigo_expiracao });
      console.log(`[DEV] Código de verificação para ${email}: ${codigo_verificacao}`);
      logCodigo(email, codigo_verificacao);

      res.status(201).json({ mensagem: 'Cadastro realizado! Verifique seu email para ativar a conta.' });
    } catch (err) {
      console.error('Erro no signup:', err);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  async verificarEmail(req, res) {
    try {
      const { email: rawEmail, codigo } = req.body;
      const email = rawEmail ? rawEmail.toLowerCase().trim() : '';
      if (!email || !codigo) {
        return res.status(400).json({ erro: 'Email e código são obrigatórios' });
      }

      const ok = await Usuario.verificarEmail(email, codigo);
      if (!ok) {
        return res.status(400).json({ erro: 'Código inválido ou email não encontrado' });
      }

      res.json({ mensagem: 'Email verificado com sucesso! Faça login.' });
    } catch (err) {
      console.error('Erro na verificação:', err);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  async login(req, res) {
    try {
      const { email: rawEmail, senha } = req.body;
      const email = rawEmail ? rawEmail.toLowerCase().trim() : '';
      if (!email || !senha) {
        return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
      }

      const usuario = await Usuario.buscarPorEmail(email);
      if (!usuario) {
        return res.status(401).json({ erro: 'Credenciais inválidas' });
      }

      const senhaOk = await bcrypt.compare(senha, usuario.senha_hash);
      if (!senhaOk) {
        return res.status(401).json({ erro: 'Credenciais inválidas' });
      }

      if (!usuario.verificado) {
        return res.status(403).json({ erro: 'Conta não verificada. Verifique seu email.' });
      }

      const token = gerarToken(usuario);

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        mensagem: 'Login realizado com sucesso',
        token,
        usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
      });
    } catch (err) {
      console.error('Erro no login:', err);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  async me(req, res) {
    try {
      const usuario = await Usuario.buscarPorId(req.usuarioId);
      if (!usuario) {
        return res.status(404).json({ erro: 'Usuário não encontrado' });
      }
      res.json(usuario);
    } catch (err) {
      console.error('Erro no me:', err);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  async reenviarCodigo(req, res) {
    try {
      const { email: rawEmail } = req.body;
      const email = rawEmail ? rawEmail.toLowerCase().trim() : '';
      if (!email) {
        return res.status(400).json({ erro: 'Email é obrigatório' });
      }

      const usuario = await Usuario.buscarPorEmail(email);
      if (!usuario) {
        return res.status(404).json({ erro: 'Email não encontrado' });
      }
      if (usuario.verificado) {
        return res.status(400).json({ erro: 'Conta já verificada' });
      }

      const codigo = crypto.randomInt(100000, 999999).toString();
      const codigo_expiracao = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      await Usuario.salvarCodigo(email, codigo, codigo_expiracao);
      console.log(`[DEV] Novo código para ${email}: ${codigo}`);
      logCodigo(email, codigo);

      res.json({ mensagem: 'Código reenviado com sucesso' });
    } catch (err) {
      console.error('Erro ao reenviar código:', err);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  async logout(req, res) {
    try {
      await Usuario.incrementarTokenVersao(req.usuarioId);
      clearUserCache(req.usuarioId);
    } catch (err) {
      console.error('Erro ao incrementar token versão:', err);
    }
    res.clearCookie('token', { path: '/' });
    res.json({ mensagem: 'Logout realizado com sucesso' });
  }
}

export default new AuthController();
