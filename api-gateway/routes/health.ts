import { Router, Request, Response } from 'express';
import { httpService } from '../services/httpService.js';
import { emailService } from '../services/emailService.js';

const router = Router();


router.get('/', async (req: Request, res: Response) => {
  try {

    let databaseStatus = 'disconnected';
    let databaseError = null;
    
    try {
      const dbResponse = await httpService.get('/db/health');
      databaseStatus = dbResponse.data.success ? 'connected' : 'error';
    } catch (error) {
      databaseError = error.message;
    }


    const emailStatus = await emailService.testConnection();
    
    const healthData = {
      status: databaseStatus === 'connected' ? 'healthy' : 'degraded',
      service: 'api-gateway',
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: databaseStatus,
          url: process.env.DATABASE_SERVICE_URL || 'http://localhost:3001',
          error: databaseError
        },
        email: {
          status: emailStatus ? 'connected' : 'disconnected',
          host: process.env.EMAIL_HOST || 'smtp.gmail.com'
        }
      },
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    };

    const statusCode = healthData.status === 'healthy' ? 200 : 503;
    
    res.status(statusCode).json({
      success: healthData.status === 'healthy',
      message: `API Gateway está ${healthData.status === 'healthy' ? 'funcionando correctamente' : 'parcialmente disponible'}`,
      data: healthData
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    const healthData = {
      status: 'unhealthy',
      service: 'api-gateway',
      timestamp: new Date().toISOString(),
      error: error.message,
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    };

    res.status(503).json({
      success: false,
      message: 'API Gateway no está disponible',
      data: healthData
    });
  }
});


router.get('/database', async (req: Request, res: Response) => {
  try {
    const response = await httpService.get('/db/health/database');
    res.json(response.data);
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Database Service no disponible',
      error: error.message
    });
  }
});


router.get('/email', async (req: Request, res: Response) => {
  try {
    const isConnected = await emailService.testConnection();
    
    res.json({
      success: isConnected,
      message: isConnected ? 'Servicio de email disponible' : 'Servicio de email no disponible',
      data: {
        status: isConnected ? 'connected' : 'disconnected',
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || '587',
        secure: process.env.EMAIL_SECURE === 'true'
      }
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Error verificando servicio de email',
      error: error.message
    });
  }
});

export default router;