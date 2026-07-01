import { Router } from 'express';
import PreviewController from '../controllers/PreviewController.js';
import { verificarToken } from '../middlewares/auth.js';

const router = Router();
const controller = new PreviewController();

router.get('/preview', verificarToken, controller.preview);

export default router;
