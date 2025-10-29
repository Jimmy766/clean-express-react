import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.js';
import { Client } from './Client.js';

export enum TokenStatus {
  ACTIVO = 'activo',
  USADO = 'usado',
  EXPIRADO = 'expirado'
}

interface PaymentTokenAttributes {
  id: string;
  clientId: string;
  token: string;
  amount: number;
  status: TokenStatus;
  expiresAt: Date;
  sessionId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PaymentTokenCreationAttributes extends Optional<PaymentTokenAttributes, 'id' | 'status' | 'createdAt' | 'updatedAt'> {}

class PaymentToken extends Model<PaymentTokenAttributes, PaymentTokenCreationAttributes> implements PaymentTokenAttributes {
  public id!: string;
  public clientId!: string;
  public token!: string;
  public amount!: number;
  public status!: TokenStatus;
  public expiresAt!: Date;
  public sessionId!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PaymentToken.init(
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
    token: {
      type: DataTypes.STRING(6),
      allowNull: false,
      validate: {
        len: [6, 6],
        isNumeric: true
      }
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        min: 0.01
      }
    },
    status: {
      type: DataTypes.ENUM(...Object.values(TokenStatus)),
      allowNull: false,
      defaultValue: TokenStatus.ACTIVO
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    sessionId: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    }
  },
  {
    sequelize,
    modelName: 'PaymentToken',
    tableName: 'payment_tokens',
    timestamps: true,
    indexes: [
      {
        fields: ['clientId']
      },
      {
        fields: ['token']
      },
      {
        fields: ['status']
      },
      {
        fields: ['sessionId']
      },
      {
        fields: ['expiresAt']
      }
    ]
  }
);

PaymentToken.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });
Client.hasMany(PaymentToken, { foreignKey: 'clientId', as: 'paymentTokens' });

export { PaymentToken, PaymentTokenAttributes, PaymentTokenCreationAttributes };