import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({datasourceUrl: `file:${process.cwd()}/prisma/dev.db`});
