import { sequelize } from '../config/database.js';
import { syncModels } from '../models/index.js';
import dotenv from 'dotenv';

dotenv.config();

async function initializeDatabase() {
  try {
    console.log('🔄 Iniciando configuración de base de datos...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos establecida');
    
    // Sync models (create tables)
    await syncModels(false); // false = no drop existing tables
    console.log('✅ Tablas creadas/actualizadas correctamente');
    
    console.log('🎉 Base de datos inicializada exitosamente');
    
    // Close connection
    await sequelize.close();
    console.log('📝 Conexión cerrada');
    
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase();
}

export { initializeDatabase };