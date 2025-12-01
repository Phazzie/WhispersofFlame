/**
 * WHAT: Database connection management and common queries
 * WHY: Centralize DB access, reduce duplication
 * HOW: Cached connection with helper functions
 */

import { neon, NeonQueryFunction } from '@neondatabase/serverless';

let cachedSql: NeonQueryFunction<false, false> | null = null;

/**
 * Get database connection (cached)
 */
export function getDb(): NeonQueryFunction<false, false> {
  const DATABASE_URL = process.env.NEON_DATABASE_URL;
  if (!DATABASE_URL) {
    throw new Error('NEON_DATABASE_URL not configured');
  }

  if (cachedSql) return cachedSql;

  cachedSql = neon(DATABASE_URL, {
    fetchOptions: {
      cache: 'no-store',
    },
  });

  return cachedSql;
}

/**
 * Find active room by code
 */
export async function findRoomByCode(sql: NeonQueryFunction<false, false>, roomCode: string) {
  const rooms = await sql`
    SELECT * FROM rooms
    WHERE code = ${roomCode}
      AND is_active = true
      AND expires_at > NOW()
  `;

  return rooms.length > 0 ? rooms[0] : null;
}

/**
 * Generate unique room code (6 uppercase letters, no I/O)
 */
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Exclude I, O for clarity
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
