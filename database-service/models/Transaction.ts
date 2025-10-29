import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.js';
import { Client } from './Client.js';

export enum TransactionType {
  RECARGA = 'recarga',
  PAGO = 'pago'
}

export enum TransactionStatus {
  PENDIENTE = 'pendiente',
  COMPLETADA = 'completada',
  FALLIDA = 'fallida'
}

interface TransactionAttributes {
  id: string;
  clientId: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  description?: string;
  sessionId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface TransactionCreationAttributes extends Optional<TransactionAttributes, 'id' | 'status' | 'createdAt' | 'updatedAt'> {}

class Transaction extends Model<TransactionAttributes, TransactionCreationAttributes> implements TransactionAttributes {
  public id!: string;
  public clientId!: string;
  public type!: TransactionType;
  public amount!: number;
  public status!: TransactionStatus;
  public description?: string;
  public sessionId?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Transaction.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    clientId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Client,
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    type: {
      type: DataTypes.ENUM(...Object.values(TransactionType)),
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        min: 0.01
      }
    },
    status: {
      type: DataTypes.ENUM(...Object.values(TransactionStatus)),
      allowNull: false,
      defaultValue: TransactionStatus.PENDIENTE
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    sessionId: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'Transaction',
    tableName: 'transactions',
    timestamps: true,
    indexes: [
      {
        fields: ['clientId']
      },
      {
        fields: ['type']
      },
      {
        fields: ['status']
      },
      {
        fields: ['sessionId']
      },
      {
        fields: ['createdAt']
      }
    ]
  }
);

Transaction.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });
Client.hasMany(Transaction, { foreignKey: 'clientId', as: 'transactions' });

export { Transaction, TransactionAttributes, TransactionCreationAttributes };