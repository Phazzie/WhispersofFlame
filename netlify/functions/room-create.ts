import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { neon } from '@neondatabase/serverless';
import { z } from 'zod';

/**
 * WHAT: Create a new game room in Neon database
 * WHY: Enable persistent multi-device gameplay
 * HOW: Generate unique room code, create room and host player records
 */

// Input validation schema
const CreateRoomSchema = z.object({
  hostName: z.string().min(1).max(50),
  playMode: z.enum(['multi-device', 'same-device']).optional().default('multi-device')
});

// CORS headers
const headers = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS?.split(',')[0] || '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // Get database connection
  const DATABASE_URL = process.env.NEON_DATABASE_URL;
  if (!DATABASE_URL) {
    console.error('NEON_DATABASE_URL not configured');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Database not configured' }),
    };
  }

  const sql = neon(DATABASE_URL);

  try {
    // Parse and validate input
    const body = JSON.parse(event.body || '{}');
    const input = CreateRoomSchema.parse(body);

    // Generate unique room code (6 letters, no I/O for clarity)
    const generateCode = (): string => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };

    // Try up to 10 times to get unique code
    let roomCode = '';
    let attempts = 0;
    while (attempts < 10) {
      roomCode = generateCode();
      const existing = await sql`
        SELECT id FROM rooms WHERE code = ${roomCode} AND is_active = true
      `;
      if (existing.length === 0) break;
      attempts++;
    }

    if (attempts >= 10) {
      throw new Error('Failed to generate unique room code');
    }

    // Start transaction to create room and host player
    const result = await sql.transaction(async (tx) => {
      // Create room
      const [room] = await tx`
        INSERT INTO rooms (code, host_id, play_mode, step)
        VALUES (${roomCode}, uuid_generate_v4(), ${input.playMode}, 'Lobby')
        RETURNING *
      `;

      // Create host player
      const [player] = await tx`
        INSERT INTO players (room_id, name, is_host)
        VALUES (${room.id}, ${input.hostName}, true)
        RETURNING *
      `;

      // Update room with actual host_id
      await tx`
        UPDATE rooms SET host_id = ${player.id} WHERE id = ${room.id}
      `;

      // Log event
      await tx`
        INSERT INTO game_events (room_id, event_type, payload)
        VALUES (${room.id}, 'room_created', ${JSON.stringify({ hostName: input.hostName })})
      `;

      return {
        room: { ...room, host_id: player.id },
        player
      };
    });

    // Return room data in format matching frontend expectations
    const response = {
      code: roomCode,
      hostId: result.player.id,
      players: [{
        id: result.player.id,
        name: input.hostName,
        isHost: true,
        isReady: false
      }],
      step: 'Lobby',
      spicyLevel: 'Mild',
      categories: [],
      answers: [],
      playMode: input.playMode,
      createdAt: Date.now(),
      expiresAt: Date.now() + 86400000 // 24 hours
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error('Room creation error:', error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Invalid input',
          details: error.errors
        }),
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to create room'
      }),
    };
  }
};

export { handler };