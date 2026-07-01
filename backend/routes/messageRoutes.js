import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import MessageController from '../controllers/MessageController.js';
import { verificarToken } from '../middlewares/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');

const storage = multer.diskStorage({
  destination: path.join(root, 'uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

const router = Router();

router.get('/rooms/:id/messages', verificarToken, MessageController.listar);
router.get('/rooms/:id/messages/pinned', verificarToken, MessageController.listarFixadas);
router.post('/rooms/:id/messages', verificarToken, MessageController.enviar);
router.post('/rooms/:id/messages/upload', verificarToken, upload.single('file'), MessageController.upload);
router.put('/rooms/:id/messages/:idMsg', verificarToken, MessageController.editar);
router.delete('/rooms/:id/messages/:idMsg', verificarToken, MessageController.deletar);
router.post('/rooms/:id/messages/:idMsg/react', verificarToken, MessageController.reagir);
router.post('/rooms/:id/messages/:idMsg/pin', verificarToken, MessageController.fixar);

export default router;
