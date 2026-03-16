import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrate: {
    async adapter() {
      const { PrismaLibSQL } = await import('@prisma/adapter-libsql');
      const { createClient } = await import('@libsql/client');
      const client = createClient({
        url: process.env.DATABASE_URL!,
      });
      return new PrismaLibSQL(client);
    },
  },
});