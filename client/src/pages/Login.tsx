import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Wallet, LogIn } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useAuthStore } from '../store/authStore';
import { apiService } from '../services/api';
import { LoginForm } from '../types';
import { toast } from 'sonner';

export const Login: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const response = await apiService.getClientByDocument(data.documento);
      
      if (response.success && response.data) {
        login(response.data);
        toast.success(`¡Bienvenido, ${response.data.nombres}!`);
        navigate('/dashboard');
      } else {
        setError('documento', {
          type: 'manual',
          message: 'Cliente no encontrado. Verifica tu documento o regístrate.'
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al iniciar sesión';
      setError('documento', {
        type: 'manual',
        message: errorMessage
      });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Wallet className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Billetera Virtual
          </h1>
          <p className="text-gray-600">
            Ingresa tu documento para acceder a tu cuenta
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <LogIn className="w-5 h-5" />
              <span>Iniciar Sesión</span>
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Número de Documento"
                type="text"
                placeholder="Ej: 12345678"
                {...register('documento', {
                  required: 'El documento es requerido',
                  pattern: {
                    value: /^\d{8,12}$/,
                    message: 'El documento debe tener entre 8 y 12 dígitos'
                  }
                })}
                error={errors.documento?.message}
                disabled={isLoading}
              />

              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Verificando...' : 'Iniciar Sesión'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ¿No tienes una cuenta?{' '}
                <Link 
                  to="/register" 
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Regístrate aquí
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {isLoading && (
          <div className="mt-4">
            <LoadingSpinner text="Verificando credenciales..." />
          </div>
        )}
      </div>
    </div>
  );
};