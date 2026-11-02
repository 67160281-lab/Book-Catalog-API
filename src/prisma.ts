import { PrismaClient } from '@prisma/client';

/**
 * อินสแตนซ์หลักของ PrismaClient สำหรับเชื่อมต่อฐานข้อมูล SQLite
 */
export const prisma = new PrismaClient();
