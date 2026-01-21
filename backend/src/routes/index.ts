import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { AlertsController } from '../controllers/alerts.controller';

const router = Router();

// Auth
router.post('/auth/login', AuthController.login as any);
router.post('/auth/register', AuthController.register as any);

// Alerts (Público/Protegido - No MVP deixarei aberto, mas idealmente requer middleware de Token)
router.get('/alerts', AlertsController.list as any);

// Health Check
router.get('/', (req, res) => {
  res.json({ status: 'RadarImob API Online 🚀' });
});

export { router };
