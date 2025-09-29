import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Configurando Prisma...');

try {
  // Generar cliente de Prisma
  console.log('📦 Generando cliente de Prisma...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  console.log('✅ Cliente de Prisma generado exitosamente');
  
  // Verificar si DATABASE_URL está configurada
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    console.log('⚠️  Archivo .env no encontrado. Creando plantilla...');
    const envTemplate = `# Configuración del servidor
PORT=8080
NODE_ENV=development
FRONTEND_URL=http://localhost:8080

# Base de datos PostgreSQL
# Opción 1: PostgreSQL local
DATABASE_URL="postgresql://postgres:password@localhost:5432/habitflow?schema=public"

# Opción 2: PostgreSQL en la nube (Supabase, Railway, etc.)
# DATABASE_URL="postgresql://username:password@host:port/database?schema=public"

# JWT
JWT_SECRET=your-secret-key-change-this-in-production

# Admin
ADMIN_TOKEN=CHANGE_ME_ADMIN_TOKEN

# Google OAuth (opcional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8080/api/auth/google/callback

# Mensaje de ping
PING_MESSAGE=pong`;

    fs.writeFileSync(envPath, envTemplate);
    console.log('✅ Archivo .env creado');
  }
  
  console.log('');
  console.log('🎯 Próximos pasos:');
  console.log('1. Configura tu DATABASE_URL en el archivo .env');
  console.log('2. Ejecuta: npx prisma db push (para crear las tablas)');
  console.log('3. Ejecuta: pnpm dev (para iniciar la aplicación)');
  console.log('');
  console.log('💡 Opciones de base de datos:');
  console.log('   - PostgreSQL local: Instala PostgreSQL en tu máquina');
  console.log('   - Supabase: https://supabase.com (gratis)');
  console.log('   - Railway: https://railway.app (gratis)');
  console.log('   - Neon: https://neon.tech (gratis)');
  
} catch (error) {
  console.error('❌ Error configurando Prisma:', error);
  process.exit(1);
}
