import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Puxa das variáveis de ambiente na nuvem OU usa o padrão para testes locais
  const adminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@empresa.com';
  const adminPassword = process.env.SUPER_ADMIN_PASSWORD || 'admin123';
  
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

  // 1. Criação do Admin
  const existingAdmin = await prisma.usuario.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    await prisma.usuario.create({
      data: {
        nome: 'Super Administrador',
        email: adminEmail,
        senha_hash: hashedAdminPassword,
        perfil: 'ADMIN',
      },
    });
    console.log(`Superuser ADMIN criado com sucesso: ${adminEmail}`);
  } else {
    console.log('Superuser ADMIN já existe.');
  }

  // 2. Criação do Usuário Técnico (Para o botão de Demo Local)
  const tecnicoEmail = 'igor@helpdesk.com';
  const existingTecnico = await prisma.usuario.findUnique({
    where: { email: tecnicoEmail },
  });

  if (!existingTecnico) {
    const hashedTecnicoPassword = await bcrypt.hash('Senha@123', 10);
    await prisma.usuario.create({
      data: {
        nome: 'Igor Técnico',
        email: tecnicoEmail,
        senha_hash: hashedTecnicoPassword,
        perfil: 'TECNICO',
      },
    });
    console.log(`Usuário TECNICO de testes criado com sucesso: ${tecnicoEmail}`);
  }

  // 3. Criação do Usuário Comum (Para o botão de Demo Local)
  const comumEmail = 'usuario@empresa.com';
  const existingComum = await prisma.usuario.findUnique({
    where: { email: comumEmail },
  });

  if (!existingComum) {
    const hashedComumPassword = await bcrypt.hash('SenhaForte@123', 10);
    await prisma.usuario.create({
      data: {
        nome: 'Usuário Comum',
        email: comumEmail,
        senha_hash: hashedComumPassword,
        perfil: 'COMUM',
      },
    });
    console.log(`Usuário COMUM de testes criado com sucesso: ${comumEmail}`);
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