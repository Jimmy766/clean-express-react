import { Request, Response, NextFunction } from 'express';
import { httpService } from '../services/httpService.js';
import { emailService } from '../services/emailService.js';
import Joi from 'joi';


const createClientSchema = Joi.object({
  documento: Joi.string().min(5).max(20).required(),
  nombres: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  celular: Joi.string().min(10).max(15).required()
});

const updateClientSchema = Joi.object({
  nombres: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
  celular: Joi.string().min(10).max(15).optional()
});

export class ClientController {

  static async createClient(req: Request, res: Response, next: NextFunction) {
    try {
      const { error, value } = createClientSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          error: error.details[0].message
        });
      }


      const response = await httpService.post('/db/clients', value);
      

      try {
        await emailService.sendWelcomeEmail(value.email, value.nombres);
      } catch (emailError) {
        console.warn('⚠️ No se pudo enviar email de bienvenida:', emailError);
      }

      res.status(201).json(response.data);
    } catch (error) {
      next(error);
    }
  }


  static async getClientById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const response = await httpService.get(`/db/clients/${id}`);
      res.json(response.data);
    } catch (error) {
      next(error);
    }
  }


  static async getClientByDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { documento } = req.params;
      const response = await httpService.get(`/db/clients/document/${documento}`);
      res.json(response.data);
    } catch (error) {
      next(error);
    }
  }


  static async getAllClients(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = req.query;
      const response = await httpService.get('/db/clients', { page, limit });
      res.json(response.data);
    } catch (error) {
      next(error);
    }
  }


  static async updateClient(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { error, value } = updateClientSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          error: error.details[0].message
        });
      }

      const response = await httpService.put(`/db/clients/${id}`, value);
      res.json(response.data);
    } catch (error) {
      next(error);
    }
  }


  static async deleteClient(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const response = await httpService.delete(`/db/clients/${id}`);
      res.json(response.data);
    } catch (error) {
      next(error);
    }
  }
}