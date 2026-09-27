import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Puxa das variáveis de ambiente na nuvem OU usa o padrão para testes locais
  const adminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@empresa.com';
  const adminPassword = process.env.SUPER_ADMIN_PASSWORD || 'admin123';
  
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const existingAdmin = await prisma.usuario.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    await prisma.usuario.create({
      data: {
        nome: 'Super Administrador',
        email: adminEmail,
        senha_hash: hashedPassword,
        perfil: 'ADMIN',
      },
    });
    console.log(`Superuser ADMIN created successfully with email: ${adminEmail}`);
  } else {
    console.log('Superuser ADMIN already exists.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });