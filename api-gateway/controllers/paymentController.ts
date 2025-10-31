import { Request, Response, NextFunction } from 'express';
import { httpService } from '../services/httpService.js';
import { emailService } from '../services/emailService.js';
import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';


const initiatePaymentSchema = Joi.object({
  clientId: Joi.string().uuid().required(),
  amount: Joi.number().positive().min(0.01).required(),
  description: Joi.string().max(255).optional()
});

const confirmPaymentSchema = Joi.object({
  sessionId: Joi.string().required(),
  token: Joi.string().length(6).pattern(/^\d{6}$/).required()
});

export class PaymentController {

  static async initiatePayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { error, value } = initiatePaymentSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          error: error.details[0].message
        });
      }

      const { clientId, amount, description } = value;
      const sessionId = uuidv4();


      const tokenResponse = await httpService.post('/db/payments/tokens', {
        clientId,
        amount,
        sessionId
      });

      if (!tokenResponse.data.success) {
        return res.status(400).json(tokenResponse.data);
      }

      const { token, clientInfo } = tokenResponse.data.data;


      try {
        const emailSent = await emailService.sendPaymentToken(
          clientInfo.email,
          token,
          amount,
          clientInfo.nombres
        );

        if (!emailSent) {
          console.warn('⚠️ No se pudo enviar el email con el token');
        }
      } catch (emailError) {
        console.error('❌ Error enviando email:', emailError);
      }

      res.json({
        success: true,
        message: 'Token de pago generado y enviado por email',
        data: {
          sessionId,
          amount,
          description,
          expiresAt: tokenResponse.data.data.expiresAt,
          emailSent: true,
          clientInfo: {
            nombres: clientInfo.nombres,
            email: clientInfo.email
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }


  static async confirmPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { error, value } = confirmPaymentSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          error: error.details[0].message
        });
      }

      const { sessionId, token } = value;


      const validateResponse = await httpService.post('/db/payments/tokens/validate', {
        token,
        sessionId
      });

      if (!validateResponse.data.success) {
        return res.status(400).json(validateResponse.data);
      }

      const tokenData = validateResponse.data.data;


      const debitResponse = await httpService.post('/db/wallets/debit', {
        clientId: tokenData.clientId,
        amount: tokenData.amount,
        description: `Pago confirmado con token ${token}`,
        sessionId
      });

      if (!debitResponse.data.success) {
        return res.status(400).json(debitResponse.data);
      }


      await httpService.patch(`/db/payments/tokens/${tokenData.tokenId}/used`);

      res.json({
        success: true,
        message: 'Pago confirmado exitosamente',
        data: {
          sessionId,
          amount: tokenData.amount,
          previousBalance: debitResponse.data.data.previousBalance,
          newBalance: debitResponse.data.data.newBalance,
          transaction: debitResponse.data.data.transaction,
          client: tokenData.client
        }
      });
    } catch (error) {
      next(error);
    }
  }


  static async getTokensByClient(req: Request, res: Response, next: NextFunction) {
    try {
      const { clientId } = req.params;
      const { page, limit, status } = req.query;
      
      const response = await httpService.get(`/db/payments/tokens/client/${clientId}`, {
        page,
        limit,
        status
      });
      
      res.json(response.data);
    } catch (error) {
      next(error);
    }
  }


  static async cleanExpiredTokens(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await httpService.post('/db/payments/tokens/cleanup');
      res.json(response.data);
    } catch (error) {
      next(error);
    }
  }
}