import Room from '../models/Room.js';
import Message from '../models/Message.js';
import db from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');
const uploadsDir = path.join(root, 'uploads');

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

class MessageController {
  async listar(req, res) {
    try {
      const roomId = req.params.id;
      const limit = Math.min(parseInt(req.query.limit) || 50, 200);
      const before = req.query.before ? parseInt(req.query.before) : null;

      const room = Room.buscarPorId(roomId);
      if (!room) {
        return res.status(404).json({ erro: 'Sala não encontrada' });
      }
      if (!room.is_dm && !Room.isMembro(roomId, req.usuarioId)) {
        return res.status(403).json({ erro: 'Você não é membro desta sala' });
      }

      const messages = await Message.listarPorSala(roomId, limit, before);
      res.json(messages);
    } catch (err) {
      console.error('Erro ao listar mensagens:', err);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  async listarFixadas(req, res) {
    try {
      const roomId = req.params.id;
      const room = Room.buscarPorId(roomId);
      if (!room) return res.status(404).json({ erro: 'Sala não encontrada' });
      if (!room.is_dm && !Room.isMembro(roomId, req.usuarioId)) {
        return res.status(403).json({ erro: 'Você não é membro desta sala' });
      }
      const messages = await Message.listarFixadas(roomId);
      res.json(messages);
    } catch (err) {
      console.error('Erro ao listar fixadas:', err);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  async enviar(req, res) {
    try {
      const roomId = req.params.id;
      const { content, reply_to } = req.body;

      if (!content || !content.trim()) {
        return res.status(400).json({ erro: 'Conteúdo da mensagem é obrigatório' });
      }

      const room = await Room.buscarPorId(roomId);
      if (!room) {
        return res.status(404).json({ erro: 'Sala não encontrada' });
      }

      if (!room.is_dm && !Room.isMembro(roomId, req.usuarioId)) {
        return res.status(403).json({ erro: 'Você não é membro desta sala' });
      }

      if (Message.checkMuted(roomId, req.usuarioId)) {
        return res.status(403).json({ erro: 'Você está silenciado nesta sala' });
      }

      const expires_at = room.disappear_after > 0 ? new Date(Date.now() + room.disappear_after * 1000).toISOString() : null;

      const message = await Message.criar({
        room_id: roomId,
        user_id: req.usuarioId,
        content: content.trim(),
        reply_to: reply_to || null,
        expires_at,
      });

      res.status(201).json(message);
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  async upload(req, res) {
    try {
      const roomId = req.params.id;
      if (!req.file) return res.status(400).json({ erro: 'Arquivo obrigatório' });
      const room = Room.buscarPorId(roomId);
      if (!room) return res.status(404).json({ erro: 'Sala não encontrada' });
      if (!room.is_dm && !Room.isMembro(roomId, req.usuarioId)) {
        return res.status(403).json({ erro: 'Você não é membro desta sala' });
      }
      const { originalname, filename, size, mimetype } = req.file;
      const content = `📎 **${originalname}**`;
      const message = await Message.criar({
        room_id: roomId,
        user_id: req.usuarioId,
        content,
        reply_to: null,
      });
      db.run(
        `UPDATE messages SET file_url = ?, file_name = ?, file_size = ?, file_type = ? WHERE id = ?`,
        [`/uploads/${filename}`, originalname, size, mimetype, message.id]
      );
      const updated = await Message.buscarPorId(message.id);
      res.status(201).json(updated);
    } catch (err) {
      console.error('Erro ao fazer upload:', err);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  async editar(req, res) {
    try {
      const id = req.params.idMsg;
      const { content } = req.body;
      if (!content || !content.trim()) {
        return res.status(400).json({ erro: 'Conteúdo obrigatório' });
      }
      const msg = await Message.editar(parseInt(id), req.usuarioId, content.trim());
      if (!msg) {
        return res.status(403).json({ erro: 'Não autorizado ou mensagem não encontrada' });
      }
      res.json(msg);
    } catch (err) {
      console.error('Erro ao editar mensagem:', err);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  async deletar(req, res) {
    try {
      const id = req.params.idMsg;
      await Message.deletar(parseInt(id), req.usuarioId);
      res.json({ success: true });
    } catch (err) {
      console.error('Erro ao deletar mensagem:', err);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  async reagir(req, res) {
    try {
      const id = req.params.idMsg;
      const { emoji } = req.body;
      if (!emoji) return res.status(400).json({ erro: 'Emoji obrigatório' });
      const reactions = await Message.toggleReaction(parseInt(id), req.usuarioId, emoji);
      res.json(reactions);
    } catch (err) {
      console.error('Erro ao reagir:', err);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  async fixar(req, res) {
    try {
      const id = req.params.idMsg;
      const result = await Message.togglePinned(parseInt(id), req.usuarioId);
      if (result === null) return res.status(403).json({ erro: 'Não autorizado' });
      res.json(result);
    } catch (err) {
      console.error('Erro ao fixar:', err);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }
}

export default new MessageController();
