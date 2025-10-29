import { sequelize } from '../config/database.js';
import { Client, Wallet } from '../models/index.js';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

async function seedDatabase() {
  try {
    console.log('🌱 Iniciando seed de base de datos...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');
    
    // Check if data already exists
    const existingClients = await Client.count();
    if (existingClients > 0) {
      console.log('⚠️  Ya existen datos en la base de datos. Saltando seed...');
      return;
    }
    
    // Create sample clients
    const sampleClients = [
      {
        id: uuidv4(),
        documento: '12345678',
        nombres: 'Juan Pérez',
        email: 'juan.perez@email.com',
        celular: '3001234567'
      },
      {
        id: uuidv4(),
        documento: '87654321',
        nombres: 'María García',
        email: 'maria.garcia@email.com',
        celular: '3009876543'
      },
      {
        id: uuidv4(),
        documento: '11223344',
        nombres: 'Carlos López',
        email: 'carlos.lopez@email.com',
        celular: '3005566778'
      }
    ];
    
    console.log('👥 Creando clientes de prueba...');
    
    for (const clientData of sampleClients) {
      // Create client
      const client = await Client.create(clientData);
      console.log(`✅ Cliente creado: ${client.nombres} (${client.documento})`);
      
      // Create wallet with initial balance
      const wallet = await Wallet.create({
        id: uuidv4(),
        clientId: client.id,
        balance: Math.floor(Math.random() * 100000) + 10000 // Random balance between 10,000 and 110,000
      });
      console.log(`💰 Billetera creada con saldo: $${wallet.balance}`);
    }
    
    console.log('🎉 Seed completado exitosamente');
    
    // Close connection
    await sequelize.close();
    console.log('📝 Conexión cerrada');
    
  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export { seedDatabase };