import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { sequelize } from './config/database.js';
import clientRoutes from './routes/clients.js';
import walletRoutes from './routes/wallets.js';
import paymentRoutes from './routes/payments.js';
import healthRoutes from './routes/health.js';

dotenv.config();

const app = express();
const PORT = process.env.DB_SERVICE_PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/db/clients', clientRoutes);
app.use('/db/wallets', walletRoutes);
app.use('/db/payments', paymentRoutes);
app.use('/db/health', healthRoutes);


app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno'
  });
});


app.use('*', (req: express.Request, res: express.Response) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint no encontrado',
    error: null
  });
});


async function startServer() {
  try {

    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente');
    

    await sequelize.sync({ force: false });
    console.log('✅ Modelos de base de datos sincronizados');
    
    app.listen(PORT, () => {
      console.log(`🚀 Database Service ejecutándose en puerto ${PORT}`);
      console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

startServer();

export default app;