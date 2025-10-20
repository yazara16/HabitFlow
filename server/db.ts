import prisma from "./prisma";

// Lightweight DB helper to match previous API (async)
export async function all(sql: string, ...params: any[]) {
  // Prisma returns an array for $queryRawUnsafe
  return await prisma.$queryRawUnsafe(sql, ...params);
}

export async function get(sql: string, ...params: any[]) {
  const rows: any[] = await prisma.$queryRawUnsafe(sql, ...params);
  return rows && rows.length > 0 ? rows[0] : undefined;
}

export async function run(sql: string, ...params: any[]) {
  return await prisma.$executeRawUnsafe(sql, ...params);
}

export default { all, get, run };
