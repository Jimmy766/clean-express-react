// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Client types
export interface Client {
  id: string;
  documento: string;
  nombres: string;
  email: string;
  celular: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientRequest {
  documento: string;
  nombres: string;
  email: string;
  celular: string;
}

export interface UpdateClientRequest {
  nombres?: string;
  email?: string;
  celular?: string;
}

// Wallet types
export interface Wallet {
  id: string;
  clientId: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface RechargeWalletRequest {
  clientId: string;
  amount: number;
  description?: string;
}


export enum TransactionType {
  RECHARGE = 'RECHARGE',
  PAYMENT = 'PAYMENT'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface Transaction {
  id: string;
  clientId: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  description?: string;
  sessionId?: string;
  createdAt: string;
  updatedAt: string;
}


export interface InitiatePaymentRequest {
  clientId: string;
  amount: number;
  description?: string;
}

export interface InitiatePaymentResponse {
  sessionId: string;
  amount: number;
  description?: string;
  expiresAt: string;
  emailSent: boolean;
  clientInfo: {
    nombres: string;
    email: string;
  };
}

export interface ConfirmPaymentRequest {
  sessionId: string;
  token: string;
}

export interface ConfirmPaymentResponse {
  sessionId: string;
  amount: number;
  previousBalance: number;
  newBalance: number;
  transaction: Transaction;
  client: Client;
}


export enum TokenStatus {
  PENDING = 'PENDING',
  USED = 'USED',
  EXPIRED = 'EXPIRED'
}

export interface PaymentToken {
  id: string;
  clientId: string;
  token: string;
  amount: number;
  status: TokenStatus;
  expiresAt: string;
  sessionId: string;
  createdAt: string;
  updatedAt: string;
}


export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}


export interface LoginForm {
  documento: string;
}

export interface RegisterForm {
  documento: string;
  nombres: string;
  email: string;
  celular: string;
}

export interface RechargeForm {
  amount: number;
  description?: string;
}

export interface PaymentForm {
  amount: number;
  description?: string;
}

export interface ConfirmPaymentForm {
  token: string;
}


export interface AuthState {
  client: Client | null;
  isAuthenticated: boolean;
  login: (client: Client) => void;
  logout: () => void;
}

export interface WalletState {
  balance: number;
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  fetchBalance: (clientId: string) => Promise<void>;
  fetchTransactions: (clientId: string) => Promise<void>;
  rechargeWallet: (data: RechargeWalletRequest) => Promise<void>;
  clearError: () => void;
}

export interface PaymentState {
  currentSession: string | null;
  isLoading: boolean;
  error: string | null;
  initiatePayment: (data: InitiatePaymentRequest) => Promise<InitiatePaymentResponse>;
  confirmPayment: (data: ConfirmPaymentRequest) => Promise<ConfirmPaymentResponse>;
  clearSession: () => void;
  clearError: () => void;
}