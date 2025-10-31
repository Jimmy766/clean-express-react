import { Router, Request, Response } from 'express';
import { sequelize } from '../config/database.js';

const router = Router();


router.get('/', async (req: Request, res: Response) => {
  try {

    await sequelize.authenticate();
    
    const healthData = {
      status: 'healthy',
      service: 'database-service',
      timestamp: new Date().toISOString(),
      database: {
        status: 'connected',
        dialect: sequelize.getDialect(),
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'billetera_virtual'
      },
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    };

    res.json({
      success: true,
      message: 'Database Service está funcionando correctamente',
      data: healthData
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    const healthData = {
      status: 'unhealthy',
      service: 'database-service',
      timestamp: new Date().toISOString(),
      database: {
        status: 'disconnected',
        error: error.message
      },
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    };

    res.status(503).json({
      success: false,
      message: 'Database Service no está disponible',
      data: healthData
    });
  }
});


router.get('/database', async (req: Request, res: Response) => {
  try {
    await sequelize.authenticate();
    
    const dbInfo = {
      status: 'connected',
      dialect: sequelize.getDialect(),
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || '3306',
      database: process.env.DB_NAME || 'billetera_virtual',
      pool: {
        max: sequelize.options.pool?.max || 10,
        min: sequelize.options.pool?.min || 0,
        acquire: sequelize.options.pool?.acquire || 30000,
        idle: sequelize.options.pool?.idle || 10000
      }
    };

    res.json({
      success: true,
      message: 'Conexión a base de datos exitosa',
      data: dbInfo
    });
  } catch (error) {
    console.error('Database connection failed:', error);
    
    res.status(503).json({
      success: false,
      message: 'Error de conexión a base de datos',
      error: error.message
    });
  }
});

export default router;