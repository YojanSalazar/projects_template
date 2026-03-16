import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Upsert the business (demo-barbershop)
  const business = await prisma.business.upsert({
    where: { slug: 'demo-barbershop' },
    update: {},
    create: {
      name: 'Cortes Club',
      slug: 'demo-barbershop',
      phone: '+573001234567',
      address: 'Calle 45 # 20-30, Bogotá',
    },
  });

  console.log(`✅ Business created: ${business.name} (slug: ${business.slug})`);

  // Seed services
  const servicesData = [
    { name: 'Corte Clásico + Lavado', description: 'Corte tradicional con lavado incluido', price: 15, duration: 30 },
    { name: 'Corte Fade', description: 'Corte moderno con técnica fade degradado', price: 20, duration: 40 },
    { name: 'Diseño de Barba', description: 'Perfilado y diseño de barba profesional', price: 10, duration: 20 },
    { name: 'Combo Completo', description: 'Corte + Barba + Lavado + Ceja', price: 35, duration: 60 },
  ];

  for (const serviceData of servicesData) {
    const existing = await prisma.service.findFirst({
      where: { name: serviceData.name, businessId: business.id },
    });
    if (!existing) {
      const service = await prisma.service.create({
        data: { ...serviceData, businessId: business.id },
      });
      console.log(`  ✂️ Service: ${service.name} ($${service.price})`);
    } else {
      console.log(`  ⏭️ Service already exists: ${existing.name}`);
    }
  }

  console.log('\n🎉 Seed complete!');
  console.log(`   Visit: http://localhost:3000/demo-barbershop`);
  console.log(`   Admin: http://localhost:3000/admin`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
