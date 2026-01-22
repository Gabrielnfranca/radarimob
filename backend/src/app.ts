import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { router } from './routes';

const app = express();

// Middlewares Globais
app.use(helmet());
app.use(cors()); // Em produção, restringir ao domínio do frontend
app.use(express.json());

// Rotas
app.get('/', (req, res) => {
  res.send('🚀 RadarImob Backend is running! Access /api for endpoints.');
});
app.use('/api', router);

export default app;
