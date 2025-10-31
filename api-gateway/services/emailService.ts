import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendPaymentToken(email: string, token: string, amount: number, clientName: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@billeteravirtual.com',
        to: email,
        subject: '🔐 Token de Confirmación de Pago - Billetera Virtual',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Token de Confirmación de Pago</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .token-box { background: #fff; border: 2px solid #667eea; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
              .token { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
              .amount { font-size: 24px; color: #2c3e50; margin: 10px 0; }
              .warning { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>💳 Billetera Virtual</h1>
                <p>Token de Confirmación de Pago</p>
              </div>
              <div class="content">
                <h2>Hola ${clientName},</h2>
                <p>Has solicitado realizar un pago por el siguiente monto:</p>
                
                <div class="amount">
                  <strong>💰 Monto: $${amount.toLocaleString('es-CO')}</strong>
                </div>
                
                <p>Para confirmar esta transacción, utiliza el siguiente token de 6 dígitos:</p>
                
                <div class="token-box">
                  <div class="token">${token}</div>
                  <p><small>Token válido por 5 minutos</small></p>
                </div>
                
                <div class="warning">
                  <strong>⚠️ Importante:</strong>
                  <ul>
                    <li>Este token es válido únicamente por <strong>5 minutos</strong></li>
                    <li>No compartas este código con nadie</li>
                    <li>Si no solicitaste este pago, ignora este mensaje</li>
                  </ul>
                </div>
                
                <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.</p>
                
                <p>Saludos,<br>
                <strong>Equipo Billetera Virtual</strong></p>
              </div>
              <div class="footer">
                <p>Este es un mensaje automático, por favor no respondas a este correo.</p>
                <p>© 2024 Billetera Virtual. Todos los derechos reservados.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email enviado:', info.messageId);
      return true;
    } catch (error) {
      console.error('❌ Error enviando email:', error);
      return false;
    }
  }

  async sendWelcomeEmail(email: string, clientName: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@billeteravirtual.com',
        to: email,
        subject: '🎉 ¡Bienvenido a Billetera Virtual!',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Bienvenido a Billetera Virtual</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .features { background: #fff; border-radius: 10px; padding: 20px; margin: 20px 0; }
              .feature { margin: 15px 0; padding: 10px; border-left: 4px solid #667eea; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>💳 Billetera Virtual</h1>
                <p>¡Bienvenido a bordo!</p>
              </div>
              <div class="content">
                <h2>¡Hola ${clientName}!</h2>
                <p>¡Felicidades! Tu cuenta en Billetera Virtual ha sido creada exitosamente.</p>
                
                <div class="features">
                  <h3>🚀 ¿Qué puedes hacer ahora?</h3>
                  <div class="feature">
                    <strong>💰 Recargar tu billetera</strong><br>
                    Añade fondos a tu billetera de forma segura y rápida
                  </div>
                  <div class="feature">
                    <strong>💳 Realizar pagos</strong><br>
                    Paga con confirmación por token de 6 dígitos
                  </div>
                  <div class="feature">
                    <strong>📊 Consultar saldo</strong><br>
                    Revisa tu saldo disponible en tiempo real
                  </div>
                  <div class="feature">
                    <strong>📈 Ver historial</strong><br>
                    Consulta todas tus transacciones anteriores
                  </div>
                </div>
                
                <p>Tu billetera está lista para usar. ¡Comienza recargando fondos y disfruta de la experiencia!</p>
                
                <p>Si tienes alguna pregunta, nuestro equipo de soporte está aquí para ayudarte.</p>
                
                <p>¡Gracias por confiar en nosotros!</p>
                
                <p>Saludos,<br>
                <strong>Equipo Billetera Virtual</strong></p>
              </div>
              <div class="footer">
                <p>Este es un mensaje automático, por favor no respondas a este correo.</p>
                <p>© 2024 Billetera Virtual. Todos los derechos reservados.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email de bienvenida enviado:', info.messageId);
      return true;
    } catch (error) {
      console.error('❌ Error enviando email de bienvenida:', error);
      return false;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('✅ Conexión de email verificada');
      return true;
    } catch (error) {
      console.error('❌ Error verificando conexión de email:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();