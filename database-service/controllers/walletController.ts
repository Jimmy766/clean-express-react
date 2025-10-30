import { Request, Response } from 'express';
import { Wallet, Client, Transaction, TransactionType, TransactionStatus } from '../models/index.js';
import { sequelize } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';


const rechargeWalletSchema = Joi.object({
  clientId: Joi.string().uuid().required(),
  amount: Joi.number().positive().min(0.01).required(),
  description: Joi.string().max(255).optional()
});

const debitWalletSchema = Joi.object({
  clientId: Joi.string().uuid().required(),
  amount: Joi.number().positive().min(0.01).required(),
  description: Joi.string().max(255).optional(),
  sessionId: Joi.string().max(100).optional()
});

export class WalletController {

  static async getWalletBalance(req: Request, res: Response) {
    try {
      const { clientId } = req.params;

      const wallet = await Wallet.findOne({
        where: { clientId },
        include: [{
          model: Client,
          as: 'client',
          attributes: ['id', 'documento', 'nombres', 'email']
        }]
      });

      if (!wallet) {
        return res.status(404).json({
          success: false,
          message: 'Billetera no encontrada',
          error: null
        });
      }

      res.json({
        success: true,
        message: 'Saldo obtenido exitosamente',
        data: {
          walletId: wallet.id,
          clientId: wallet.clientId,
          balance: parseFloat(wallet.balance.toString()),
          client: wallet.client,
          updatedAt: wallet.updatedAt
        }
      });
    } catch (error) {
      console.error('Error obteniendo saldo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }


  static async rechargeWallet(req: Request, res: Response) {
    const transaction = await sequelize.transaction();
    
    try {
      const { error, value } = rechargeWalletSchema.validate(req.body);
      if (error) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          error: error.details[0].message
        });
      }

      const { clientId, amount, description } = value;


      const client = await Client.findByPk(clientId);
      if (!client) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado',
          error: null
        });
      }


      const wallet = await Wallet.findOne({
        where: { clientId },
        transaction
      });

      if (!wallet) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Billetera no encontrada',
          error: null
        });
      }


      const newBalance = parseFloat(wallet.balance.toString()) + amount;
      await wallet.update({ balance: newBalance }, { transaction });


      const transactionRecord = await Transaction.create({
        id: uuidv4(),
        clientId,
        type: TransactionType.RECARGA,
        amount,
        status: TransactionStatus.COMPLETADA,
        description: description || `Recarga de billetera por $${amount}`
      }, { transaction });

      await transaction.commit();

      res.json({
        success: true,
        message: 'Recarga realizada exitosamente',
        data: {
          walletId: wallet.id,
          clientId: wallet.clientId,
          previousBalance: parseFloat(wallet.balance.toString()) - amount,
          amount,
          newBalance,
          transaction: {
            id: transactionRecord.id,
            type: transactionRecord.type,
            status: transactionRecord.status,
            createdAt: transactionRecord.createdAt
          }
        }
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error recargando billetera:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }


  static async debitWallet(req: Request, res: Response) {
    const transaction = await sequelize.transaction();
    
    try {
      const { error, value } = debitWalletSchema.validate(req.body);
      if (error) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          error: error.details[0].message
        });
      }

      const { clientId, amount, description, sessionId } = value;


      const client = await Client.findByPk(clientId);
      if (!client) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado',
          error: null
        });
      }


      const wallet = await Wallet.findOne({
        where: { clientId },
        transaction
      });

      if (!wallet) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Billetera no encontrada',
          error: null
        });
      }


      const currentBalance = parseFloat(wallet.balance.toString());
      if (currentBalance < amount) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Saldo insuficiente',
          error: `Saldo actual: $${currentBalance}, Monto requerido: $${amount}`
        });
      }


      const newBalance = currentBalance - amount;
      await wallet.update({ balance: newBalance }, { transaction });


      const transactionRecord = await Transaction.create({
        id: uuidv4(),
        clientId,
        type: TransactionType.PAGO,
        amount,
        status: TransactionStatus.COMPLETADA,
        description: description || `Pago por $${amount}`,
        sessionId
      }, { transaction });

      await transaction.commit();

      res.json({
        success: true,
        message: 'Pago realizado exitosamente',
        data: {
          walletId: wallet.id,
          clientId: wallet.clientId,
          previousBalance: currentBalance,
          amount,
          newBalance,
          transaction: {
            id: transactionRecord.id,
            type: transactionRecord.type,
            status: transactionRecord.status,
            sessionId: transactionRecord.sessionId,
            createdAt: transactionRecord.createdAt
          }
        }
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error debitando billetera:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }


  static async getTransactionHistory(req: Request, res: Response) {
    try {
      const { clientId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const type = req.query.type as string;
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
      if (type && Object.values(TransactionType).includes(type as TransactionType)) {
        whereClause.type = type;
      }

      const { count, rows: transactions } = await Transaction.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        include: [{
          model: Client,
          as: 'client',
          attributes: ['id', 'documento', 'nombres']
        }]
      });

      res.json({
        success: true,
        message: 'Historial obtenido exitosamente',
        data: {
          transactions: transactions.map(t => ({
            id: t.id,
            type: t.type,
            amount: parseFloat(t.amount.toString()),
            status: t.status,
            description: t.description,
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
      console.error('Error obteniendo historial:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }
}