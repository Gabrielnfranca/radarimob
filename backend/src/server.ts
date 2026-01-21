import app from './app';
import dotenv from 'dotenv';
import './worker'; // Inicia o worker junto com a API (nop MVP é aceitável rodar no mesmo processo)

dotenv.config();

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`\n📡 API RadarImob rodando na porta ${PORT}`);
  console.log(`🔗 http://localhost:${PORT}/api`);
});
