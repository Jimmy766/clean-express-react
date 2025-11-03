import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import clientRoutes from './routes/clients.js';
import walletRoutes from './routes/wallets.js';
import paymentRoutes from './routes/payments.js';
import healthRoutes from './routes/health.js';
import { authMiddleware } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.API_GATEWAY_PORT || 3000;


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: {
    success: false,
    message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde',
    error: 'Rate limit exceeded'
  }
});

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});


app.use('/api/health', healthRoutes);


app.use('/api/clients', clientRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/payments', paymentRoutes);


app.use(errorHandler);


app.use('*', (req: express.Request, res: express.Response) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint no encontrado',
    error: null
  });
});


app.listen(PORT, () => {
  console.log(`🚀 API Gateway ejecutándose en puerto ${PORT}`);
  console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Database Service URL: ${process.env.DATABASE_SERVICE_URL || 'http://localhost:3001'}`);
  console.log(`🌐 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
});

export default app;