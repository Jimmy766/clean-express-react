import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, Plus, CreditCard, History, TrendingUp, DollarSign } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useAuthStore } from '../store/authStore';
import { useWalletStore } from '../store/walletStore';

export const Dashboard: React.FC = () => {
  const { client } = useAuthStore();
  const { balance, transactions, isLoading, fetchBalance, fetchTransactions } = useWalletStore();

  useEffect(() => {
    if (client?.id) {
      fetchBalance(client.id);
      fetchTransactions(client.id);
    }
  }, [client?.id, fetchBalance, fetchTransactions]);

  if (!client) {
    return <LoadingSpinner text="Cargando información del usuario..." />;
  }

  const recentTransactions = transactions.slice(0, 5);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string) => {
    return type === 'RECHARGE' ? (
      <TrendingUp className="w-4 h-4 text-green-600" />
    ) : (
      <DollarSign className="w-4 h-4 text-red-600" />
    );
  };

  const getTransactionColor = (type: string) => {
    return type === 'RECHARGE' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">

      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          ¡Hola, {client.nombres}! 👋
        </h1>
        <p className="text-blue-100">
          Bienvenido a tu billetera virtual. Aquí puedes ver tu saldo y realizar transacciones.
        </p>
      </div>


      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wallet className="w-6 h-6 text-blue-600" />
            <span>Saldo Actual</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingSpinner text="Cargando saldo..." />
          ) : (
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {formatCurrency(balance)}
              </div>
              <p className="text-gray-600">Disponible en tu billetera</p>
            </div>
          )}
        </CardContent>
      </Card>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/recharge">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex items-center space-x-4 p-4">
              <div className="bg-green-100 p-3 rounded-full">
                <Plus className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Recargar</h3>
                <p className="text-sm text-gray-600">Añadir dinero a tu billetera</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/payment">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex items-center space-x-4 p-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Pagar</h3>
                <p className="text-sm text-gray-600">Realizar un pago con token</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/history">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex items-center space-x-4 p-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <History className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Historial</h3>
                <p className="text-sm text-gray-600">Ver todas tus transacciones</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <History className="w-5 h-5 text-gray-600" />
              <span>Transacciones Recientes</span>
            </CardTitle>
            <Link to="/history">
              <Button variant="outline" size="sm">
                Ver todas
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingSpinner text="Cargando transacciones..." />
          ) : recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <p className="font-medium text-gray-900">
                        {transaction.type === 'RECHARGE' ? 'Recarga' : 'Pago'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatDate(transaction.createdAt)}
                      </p>
                      {transaction.description && (
                        <p className="text-xs text-gray-500">
                          {transaction.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                    {transaction.type === 'RECHARGE' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No tienes transacciones aún</p>
              <p className="text-sm text-gray-500 mt-1">
                Realiza tu primera recarga o pago para ver el historial
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};