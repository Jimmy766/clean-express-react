import { Request, Response } from 'express';
import { Client, Wallet } from '../models/index.js';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';
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

  static async createClient(req: Request, res: Response) {
    try {
      const { error, value } = createClientSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          error: error.details[0].message
        });
      }

      const { documento, nombres, email, celular } = value;


      const existingClient = await Client.findOne({
        where: {
          [Op.or]: [
            { documento },
            { email }
          ]
        }
      });

      if (existingClient) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe un cliente con ese documento o email',
          error: null
        });
      }


      const client = await Client.create({
        id: uuidv4(),
        documento,
        nombres,
        email,
        celular
      });


      await Wallet.create({
        id: uuidv4(),
        clientId: client.id,
        balance: 0.00
      });

      res.status(201).json({
        success: true,
        message: 'Cliente creado exitosamente',
        data: {
          id: client.id,
          documento: client.documento,
          nombres: client.nombres,
          email: client.email,
          celular: client.celular,
          createdAt: client.createdAt
        }
      });
    } catch (error) {
      console.error('Error creando cliente:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }


  static async getClientById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const client = await Client.findByPk(id, {
        include: [{
          model: Wallet,
          as: 'wallet'
        }]
      });

      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado',
          error: null
        });
      }

      res.json({
        success: true,
        message: 'Cliente encontrado',
        data: {
          id: client.id,
          documento: client.documento,
          nombres: client.nombres,
          email: client.email,
          celular: client.celular,
          wallet: client.wallet,
          createdAt: client.createdAt,
          updatedAt: client.updatedAt
        }
      });
    } catch (error) {
      console.error('Error obteniendo cliente:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }


  static async getClientByDocument(req: Request, res: Response) {
    try {
      const { documento } = req.params;

      const client = await Client.findOne({
        where: { documento },
        include: [{
          model: Wallet,
          as: 'wallet'
        }]
      });

      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado',
          error: null
        });
      }

      res.json({
        success: true,
        message: 'Cliente encontrado',
        data: {
          id: client.id,
          documento: client.documento,
          nombres: client.nombres,
          email: client.email,
          celular: client.celular,
          wallet: client.wallet,
          createdAt: client.createdAt,
          updatedAt: client.updatedAt
        }
      });
    } catch (error) {
      console.error('Error obteniendo cliente por documento:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }


  static async getAllClients(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      const { count, rows: clients } = await Client.findAndCountAll({
        include: [{
          model: Wallet,
          as: 'wallet'
        }],
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        message: 'Clientes obtenidos exitosamente',
        data: {
          clients: clients.map(client => ({
            id: client.id,
            documento: client.documento,
            nombres: client.nombres,
            email: client.email,
            celular: client.celular,
            wallet: client.wallet,
            createdAt: client.createdAt,
            updatedAt: client.updatedAt
          })),
          pagination: {
            page,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit)
          }
        }
      });
    } catch (error) {
      console.error('Error obteniendo clientes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }


  static async updateClient(req: Request, res: Response) {
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

      const client = await Client.findByPk(id);
      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado',
          error: null
        });
      }


      if (value.email && value.email !== client.email) {
        const existingClient = await Client.findOne({
          where: { email: value.email }
        });
        if (existingClient) {
          return res.status(409).json({
            success: false,
            message: 'Ya existe un cliente con ese email',
            error: null
          });
        }
      }

      await client.update(value);

      res.json({
        success: true,
        message: 'Cliente actualizado exitosamente',
        data: {
          id: client.id,
          documento: client.documento,
          nombres: client.nombres,
          email: client.email,
          celular: client.celular,
          updatedAt: client.updatedAt
        }
      });
    } catch (error) {
      console.error('Error actualizando cliente:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }


  static async deleteClient(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const client = await Client.findByPk(id);
      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado',
          error: null
        });
      }

      await client.destroy();

      res.json({
        success: true,
        message: 'Cliente eliminado exitosamente',
        data: null
      });
    } catch (error) {
      console.error('Error eliminando cliente:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }
}