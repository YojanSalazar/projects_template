import 'dotenv/config';

const config = {
  schema: 'prisma/schema.prisma',
  migrate: {
    async adapter() {
      const { PrismaLibSql } = await import('@prisma/adapter-libsql');
      return new PrismaLibSql({
        url: process.env.DATABASE_URL!,
      });
    },
  },
};

export default config;