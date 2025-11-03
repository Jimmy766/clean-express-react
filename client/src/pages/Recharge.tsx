import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Plus, Wallet, ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useAuthStore } from '../store/authStore';
import { useWalletStore } from '../store/walletStore';
import { RechargeForm } from '../types';
import { toast } from 'sonner';

export const Recharge: React.FC = () => {
  const { client } = useAuthStore();
  const { balance, isLoading, fetchBalance, rechargeWallet } = useWalletStore();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<RechargeForm>();

  const watchAmount = watch('amount');

  useEffect(() => {
    if (client?.id) {
      fetchBalance(client.id);
    }
  }, [client?.id, fetchBalance]);

  const onSubmit = async (data: RechargeForm) => {
    if (!client?.id) return;

    try {
      await rechargeWallet({
        clientId: client.id,
        amount: data.amount,
        description: data.description || `Recarga de ${data.amount}`
      });
      
      reset();
      toast.success('¡Recarga exitosa!');
      

      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {

    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const quickAmounts = [10000, 20000, 50000, 100000, 200000, 500000];

  if (!client) {
    return <LoadingSpinner text="Cargando información del usuario..." />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver</span>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recargar Billetera</h1>
          <p className="text-gray-600">Añade dinero a tu billetera virtual</p>
        </div>
      </div>


      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wallet className="w-5 h-5 text-blue-600" />
            <span>Saldo Actual</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(balance)}
          </div>
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="w-5 h-5 text-green-600" />
            <span>Nueva Recarga</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Montos rápidos
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {quickAmounts.map((amount) => (
                  <Button
                    key={amount}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const event = { target: { value: amount.toString() } };
                      register('amount').onChange(event);
                    }}
                    className="text-sm"
                  >
                    {formatCurrency(amount)}
                  </Button>
                ))}
              </div>
            </div>


            <Input
              label="Monto a recargar"
              type="number"
              placeholder="Ej: 50000"
              {...register('amount', {
                required: 'El monto es requerido',
                min: {
                  value: 1000,
                  message: 'El monto mínimo es $1,000'
                },
                max: {
                  value: 5000000,
                  message: 'El monto máximo es $5,000,000'
                }
              })}
              error={errors.amount?.message}
              disabled={isLoading}
              helperText="Monto entre $1,000 y $5,000,000"
            />


            <Input
              label="Descripción (opcional)"
              type="text"
              placeholder="Ej: Recarga para gastos del mes"
              {...register('description', {
                maxLength: {
                  value: 255,
                  message: 'La descripción no puede exceder 255 caracteres'
                }
              })}
              error={errors.description?.message}
              disabled={isLoading}
            />


            {watchAmount && watchAmount >= 1000 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Resumen de la recarga</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Saldo actual:</span>
                    <span className="font-medium">{formatCurrency(balance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Monto a recargar:</span>
                    <span className="font-medium text-green-600">+{formatCurrency(watchAmount)}</span>
                  </div>
                  <div className="border-t border-blue-200 pt-1 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span className="text-blue-900">Nuevo saldo:</span>
                      <span className="text-blue-900">{formatCurrency(balance + watchAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}


            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
              disabled={isLoading || !watchAmount || watchAmount < 1000}
            >
              {isLoading ? 'Procesando recarga...' : 'Recargar Billetera'}
            </Button>
          </form>
        </CardContent>
      </Card>


      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium text-gray-900 mb-2">ℹ️ Información importante</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Las recargas se procesan de forma inmediata</li>
            <li>• El monto mínimo de recarga es $1,000</li>
            <li>• El monto máximo de recarga es $5,000,000</li>
            <li>• Puedes realizar múltiples recargas al día</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};