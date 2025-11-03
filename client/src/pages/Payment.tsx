import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { CreditCard, ArrowLeft, Mail, Clock, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useAuthStore } from '../store/authStore';
import { useWalletStore } from '../store/walletStore';
import { usePaymentStore } from '../store/paymentStore';
import { PaymentForm, ConfirmPaymentForm } from '../types';
import { toast } from 'sonner';

type PaymentStep = 'form' | 'confirm' | 'success';

export const Payment: React.FC = () => {
  const { client } = useAuthStore();
  const { balance, fetchBalance } = useWalletStore();
  const { currentSession, isLoading, initiatePayment, confirmPayment, clearSession } = usePaymentStore();
  const navigate = useNavigate();
  const [step, setStep] = useState<PaymentStep>('form');
  const [paymentData, setPaymentData] = useState<any>(null);
  
  const paymentForm = useForm<PaymentForm>();
  const confirmForm = useForm<ConfirmPaymentForm>();

  useEffect(() => {
    if (client?.id) {
      fetchBalance(client.id);
    }
  }, [client?.id, fetchBalance]);

  useEffect(() => {
    // Clear session when component unmounts
    return () => {
      clearSession();
    };
  }, [clearSession]);

  const onSubmitPayment = async (data: PaymentForm) => {
    if (!client?.id) return;

    try {
      const response = await initiatePayment({
        clientId: client.id,
        amount: data.amount,
        description: data.description
      });
      
      setPaymentData(response);
      setStep('confirm');
    } catch (error) {

    }
  };

  const onSubmitConfirm = async (data: ConfirmPaymentForm) => {
    if (!currentSession) return;

    try {
      await confirmPayment({
        sessionId: currentSession,
        token: data.token
      });
      
      setStep('success');

      if (client?.id) {
        fetchBalance(client.id);
      }
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

  const handleStartOver = () => {
    setStep('form');
    setPaymentData(null);
    clearSession();
    paymentForm.reset();
    confirmForm.reset();
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  if (!client) {
    return <LoadingSpinner text="Cargando información del usuario..." />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => step === 'form' ? navigate('/dashboard') : handleStartOver()}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{step === 'form' ? 'Volver' : 'Nuevo Pago'}</span>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Realizar Pago</h1>
          <p className="text-gray-600">
            {step === 'form' && 'Ingresa los datos del pago'}
            {step === 'confirm' && 'Confirma el pago con el token enviado por email'}
            {step === 'success' && '¡Pago realizado exitosamente!'}
          </p>
        </div>
      </div>


      <div className="flex items-center justify-center space-x-4">
        <div className={`flex items-center space-x-2 ${step === 'form' ? 'text-blue-600' : 'text-green-600'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 'form' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
          }`}>
            1
          </div>
          <span className="text-sm font-medium">Datos</span>
        </div>
        <div className="w-8 h-0.5 bg-gray-300"></div>
        <div className={`flex items-center space-x-2 ${
          step === 'confirm' ? 'text-blue-600' : step === 'success' ? 'text-green-600' : 'text-gray-400'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 'confirm' ? 'bg-blue-100 text-blue-600' : 
            step === 'success' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
          }`}>
            2
          </div>
          <span className="text-sm font-medium">Token</span>
        </div>
        <div className="w-8 h-0.5 bg-gray-300"></div>
        <div className={`flex items-center space-x-2 ${step === 'success' ? 'text-green-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 'success' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
          }`}>
            ✓
          </div>
          <span className="text-sm font-medium">Listo</span>
        </div>
      </div>


      {step === 'form' && (
        <>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Saldo disponible:</span>
                <span className="text-xl font-bold text-gray-900">
                  {formatCurrency(balance)}
                </span>
              </div>
            </CardContent>
          </Card>


          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <span>Datos del Pago</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={paymentForm.handleSubmit(onSubmitPayment)} className="space-y-4">
                <Input
                  label="Monto a pagar"
                  type="number"
                  placeholder="Ej: 25000"
                  {...paymentForm.register('amount', {
                    required: 'El monto es requerido',
                    min: {
                      value: 1000,
                      message: 'El monto mínimo es $1,000'
                    },
                    max: {
                      value: balance,
                      message: `No puedes pagar más de tu saldo disponible (${formatCurrency(balance)})`
                    }
                  })}
                  error={paymentForm.formState.errors.amount?.message}
                  disabled={isLoading}
                  helperText={`Saldo disponible: ${formatCurrency(balance)}`}
                />

                <Input
                  label="Descripción del pago"
                  type="text"
                  placeholder="Ej: Pago de servicios"
                  {...paymentForm.register('description', {
                    maxLength: {
                      value: 255,
                      message: 'La descripción no puede exceder 255 caracteres'
                    }
                  })}
                  error={paymentForm.formState.errors.description?.message}
                  disabled={isLoading}
                />

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? 'Generando token...' : 'Generar Token de Pago'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </>
      )}


      {step === 'confirm' && paymentData && (
        <>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-blue-600" />
                <span>Token Enviado</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    Token enviado a: {paymentData.clientInfo.email}
                  </span>
                </div>
                <p className="text-sm text-blue-700">
                  Revisa tu correo electrónico y ingresa el código de 6 dígitos que recibiste.
                  El token expira en 5 minutos.
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monto:</span>
                  <span className="font-medium">{formatCurrency(paymentData.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Descripción:</span>
                  <span className="font-medium">{paymentData.description || 'Sin descripción'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Expira:</span>
                  <span className="font-medium">
                    {new Date(paymentData.expiresAt).toLocaleTimeString('es-CO')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>


          <Card>
            <CardHeader>
              <CardTitle>Confirmar Pago</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={confirmForm.handleSubmit(onSubmitConfirm)} className="space-y-4">
                <Input
                  label="Código de verificación"
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  {...confirmForm.register('token', {
                    required: 'El token es requerido',
                    pattern: {
                      value: /^\d{6}$/,
                      message: 'El token debe tener exactamente 6 dígitos'
                    }
                  })}
                  error={confirmForm.formState.errors.token?.message}
                  disabled={isLoading}
                  helperText="Ingresa el código de 6 dígitos que recibiste por email"
                />

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? 'Confirmando pago...' : 'Confirmar Pago'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </>
      )}


      {step === 'success' && (
        <Card>
          <CardContent className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Pago Exitoso!
            </h2>
            <p className="text-gray-600 mb-6">
              Tu pago ha sido procesado correctamente
            </p>
            
            <div className="space-y-4">
              <Button
                onClick={handleGoToDashboard}
                className="w-full"
                size="lg"
              >
                Ir al Dashboard
              </Button>
              <Button
                onClick={handleStartOver}
                variant="outline"
                className="w-full"
              >
                Realizar Otro Pago
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};