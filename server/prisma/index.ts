import { PrismaClient } from "@prisma/client";

console.log(process.cwd());
export const prisma = new PrismaClient({datasourceUrl: `file:${process.cwd()}/prisma/dev.db`});
