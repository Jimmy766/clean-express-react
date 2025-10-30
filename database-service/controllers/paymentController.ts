import { Request, Response } from 'express';
import { PaymentToken, TokenStatus, Client, Wallet } from '../models/index.js';
import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';


const createTokenSchema = Joi.object({
  clientId: Joi.string().uuid().required(),
  amount: Joi.number().positive().min(0.01).required(),
  sessionId: Joi.string().max(100).required()
});

const validateTokenSchema = Joi.object({
  token: Joi.string().length(6).pattern(/^\d{6}$/).required(),
  sessionId: Joi.string().max(100).required()
});

export class PaymentController {

  static async generatePaymentToken(req: Request, res: Response) {
    try {
      const { error, value } = createTokenSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          error: error.details[0].message
        });
      }

      const { clientId, amount, sessionId } = value;


      const client = await Client.findByPk(clientId);
      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado',
          error: null
        });
      }


      const wallet = await Wallet.findOne({ where: { clientId } });
      if (!wallet) {
        return res.status(404).json({
          success: false,
          message: 'Billetera no encontrada',
          error: null
        });
      }

      const currentBalance = parseFloat(wallet.balance.toString());
      if (currentBalance < amount) {
        return res.status(400).json({
          success: false,
          message: 'Saldo insuficiente',
          error: `Saldo actual: $${currentBalance}, Monto requerido: $${amount}`
        });
      }


      const existingToken = await PaymentToken.findOne({
        where: {
          sessionId,
          status: TokenStatus.ACTIVO
        }
      });

      if (existingToken) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe un token activo para esta sesión',
          error: null
        });
      }


      const token = Math.floor(100000 + Math.random() * 900000).toString();


      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 5);

      const paymentToken = await PaymentToken.create({
        id: uuidv4(),
        clientId,
        token,
        amount,
        status: TokenStatus.ACTIVO,
        expiresAt,
        sessionId
      });

      res.status(201).json({
        success: true,
        message: 'Token de pago generado exitosamente',
        data: {
          tokenId: paymentToken.id,
          token: paymentToken.token,
          amount: parseFloat(paymentToken.amount.toString()),
          expiresAt: paymentToken.expiresAt,
          sessionId: paymentToken.sessionId,
          clientInfo: {
            id: client.id,
            nombres: client.nombres,
            email: client.email
          }
        }
      });
    } catch (error) {
      console.error('Error generando token:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }


  static async validatePaymentToken(req: Request, res: Response) {
    try {
      const { error, value } = validateTokenSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          error: error.details[0].message
        });
      }

      const { token, sessionId } = value;


      const paymentToken = await PaymentToken.findOne({
        where: {
          token,
          sessionId,
          status: TokenStatus.ACTIVO
        },
        include: [{
          model: Client,
          as: 'client',
          attributes: ['id', 'documento', 'nombres', 'email']
        }]
      });

      if (!paymentToken) {
        return res.status(404).json({
          success: false,
          message: 'Token no válido o no encontrado',
          error: null
        });
      }


      const now = new Date();
      if (now > paymentToken.expiresAt) {

        await paymentToken.update({ status: TokenStatus.EXPIRADO });
        
        return res.status(400).json({
          success: false,
          message: 'Token expirado',
          error: null
        });
      }

      res.json({
        success: true,
        message: 'Token válido',
        data: {
          tokenId: paymentToken.id,
          clientId: paymentToken.clientId,
          amount: parseFloat(paymentToken.amount.toString()),
          expiresAt: paymentToken.expiresAt,
          sessionId: paymentToken.sessionId,
          client: paymentToken.client,
          isValid: true
        }
      });
    } catch (error) {
      console.error('Error validando token:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }


  static async markTokenAsUsed(req: Request, res: Response) {
    try {
      const { tokenId } = req.params;

      const paymentToken = await PaymentToken.findByPk(tokenId);
      if (!paymentToken) {
        return res.status(404).json({
          success: false,
          message: 'Token no encontrado',
          error: null
        });
      }

      if (paymentToken.status !== TokenStatus.ACTIVO) {
        return res.status(400).json({
          success: false,
          message: 'Token no está activo',
          error: null
        });
      }

      await paymentToken.update({ status: TokenStatus.USADO });

      res.json({
        success: true,
        message: 'Token marcado como usado',
        data: {
          tokenId: paymentToken.id,
          status: paymentToken.status,
          updatedAt: paymentToken.updatedAt
        }
      });
    } catch (error) {
      console.error('Error marcando token como usado:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }


  static async getTokensByClient(req: Request, res: Response) {
    try {
      const { clientId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;
      const offset = (page - 1) * limit;


      const client = await Client.findByPk(clientId);
      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado',
          error: null
        });
      }

      const whereClause: any = { clientId };
      if (status && Object.values(TokenStatus).includes(status as TokenStatus)) {
        whereClause.status = status;
      }

      const { count, rows: tokens } = await PaymentToken.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        message: 'Tokens obtenidos exitosamente',
        data: {
          tokens: tokens.map(t => ({
            id: t.id,
            token: t.token,
            amount: parseFloat(t.amount.toString()),
            status: t.status,
            expiresAt: t.expiresAt,
            sessionId: t.sessionId,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt
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
      console.error('Error obteniendo tokens:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }


  static async cleanExpiredTokens(req: Request, res: Response) {
    try {
      const now = new Date();
      
      const [updatedCount] = await PaymentToken.update(
        { status: TokenStatus.EXPIRADO },
        {
          where: {
            status: TokenStatus.ACTIVO,
            expiresAt: {
              $lt: now
            }
          }
        }
      );

      res.json({
        success: true,
        message: 'Tokens expirados limpiados',
        data: {
          tokensUpdated: updatedCount,
          cleanedAt: now
        }
      });
    } catch (error) {
      console.error('Error limpiando tokens expirados:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }
}