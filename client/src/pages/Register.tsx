import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { UserPlus, Wallet } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useAuthStore } from '../store/authStore';
import { apiService } from '../services/api';
import { RegisterForm } from '../types';
import { toast } from 'sonner';

export const Register: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm<RegisterForm>();

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      const response = await apiService.createClient(data);
      
      if (response.success && response.data) {
        login(response.data);
        toast.success(`¡Cuenta creada exitosamente! Bienvenido, ${response.data.nombres}`);
        navigate('/dashboard');
      } else {
        toast.error(response.message || 'Error al crear la cuenta');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al crear la cuenta';
      

      if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (errorData.message?.includes('documento')) {
          setError('documento', {
            type: 'manual',
            message: 'Este documento ya está registrado'
          });
        } else if (errorData.message?.includes('email')) {
          setError('email', {
            type: 'manual',
            message: 'Este email ya está registrado'
          });
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-green-600 p-3 rounded-full">
              <Wallet className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Crear Cuenta
          </h1>
          <p className="text-gray-600">
            Completa tus datos para crear tu billetera virtual
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserPlus className="w-5 h-5" />
              <span>Registro</span>
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

              <Input
                label="Nombres Completos"
                type="text"
                placeholder="Ej: Juan Pérez"
                {...register('nombres', {
                  required: 'Los nombres son requeridos',
                  minLength: {
                    value: 2,
                    message: 'Los nombres deben tener al menos 2 caracteres'
                  },
                  maxLength: {
                    value: 100,
                    message: 'Los nombres no pueden exceder 100 caracteres'
                  }
                })}
                error={errors.nombres?.message}
                disabled={isLoading}
              />

              <Input
                label="Correo Electrónico"
                type="email"
                placeholder="Ej: juan@email.com"
                {...register('email', {
                  required: 'El email es requerido',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Ingresa un email válido'
                  }
                })}
                error={errors.email?.message}
                disabled={isLoading}
              />

              <Input
                label="Número de Celular"
                type="tel"
                placeholder="Ej: 3001234567"
                {...register('celular', {
                  required: 'El celular es requerido',
                  pattern: {
                    value: /^3\d{9}$/,
                    message: 'Ingresa un número de celular válido (10 dígitos, inicia con 3)'
                  }
                })}
                error={errors.celular?.message}
                disabled={isLoading}
              />

              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ¿Ya tienes una cuenta?{' '}
                <Link 
                  to="/login" 
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Inicia sesión aquí
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {isLoading && (
          <div className="mt-4">
            <LoadingSpinner text="Creando tu cuenta..." />
          </div>
        )}
      </div>
    </div>
  );
};