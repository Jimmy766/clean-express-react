import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('API Gateway Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });


  let error = {
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno'
  };


  if (err.response) {
    return res.status(err.response.status || 500).json(err.response.data || error);
  }


  if (err.code === 'ECONNREFUSED') {
    error.message = 'Servicio de base de datos no disponible';
    error.error = 'Database service connection refused';
    return res.status(503).json(error);
  }


  if (err.name === 'ValidationError') {
    error.message = 'Datos de entrada inválidos';
    error.error = err.message;
    return res.status(400).json(error);
  }


  if (err.name === 'JsonWebTokenError') {
    error.message = 'Token inválido';
    error.error = 'Invalid token';
    return res.status(401).json(error);
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expirado';
    error.error = 'Token expired';
    return res.status(401).json(error);
  }


  res.status(500).json(error);
};