import { Router } from 'express';
import AuthController from '../controllers/AuthController.js';
import { verificarToken } from '../middlewares/auth.js';

const router = Router();

router.post('/auth/signup', AuthController.signup);
router.post('/auth/login', AuthController.login);
router.post('/auth/verificar-email', AuthController.verificarEmail);
router.post('/auth/reenviar-codigo', AuthController.reenviarCodigo);
router.post('/auth/logout', verificarToken, AuthController.logout);
router.get('/auth/me', verificarToken, AuthController.me);

export default router;
