import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import MessageController from '../controllers/MessageController.js';
import { verificarToken } from '../middlewares/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');

const storage = multer.diskStorage({
  destination: process.env.UPLOADS_DIR || path.join(root, 'uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});
function fileFilter(req, file, cb) {
  const allowed = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/webm', 'audio/mp4',
    'video/mp4', 'video/webm', 'video/ogg',
    'application/pdf', 'text/plain', 'application/zip',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/heic', 'image/heif',
  ];
  if (allowed.includes(file.mimetype)) return cb(null, true);
  cb(new Error(`Tipo de arquivo não permitido: ${file.mimetype}`));
}
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 }, fileFilter });

const router = Router();

router.get('/rooms/:id/messages', verificarToken, MessageController.listar);
router.get('/rooms/:id/messages/pinned', verificarToken, MessageController.listarFixadas);
router.post('/rooms/:id/messages', verificarToken, MessageController.enviar);
router.post('/rooms/:id/messages/upload', verificarToken, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ erro: 'Arquivo muito grande. Máximo: 50MB' });
        return res.status(400).json({ erro: err.message });
      }
      return res.status(400).json({ erro: err.message });
    }
    next();
  });
}, MessageController.upload);
router.put('/rooms/:id/messages/:idMsg', verificarToken, MessageController.editar);
router.delete('/rooms/:id/messages/:idMsg', verificarToken, MessageController.deletar);
router.post('/rooms/:id/messages/:idMsg/react', verificarToken, MessageController.reagir);
router.post('/rooms/:id/messages/:idMsg/pin', verificarToken, MessageController.fixar);

export default router;
