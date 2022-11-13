import { PrismaClient } from "@prisma/client";

// singleton -> only one instance of PrismaClient will be created

const prisma = new PrismaClient({
  log: ["query"],
});

export { prisma };
