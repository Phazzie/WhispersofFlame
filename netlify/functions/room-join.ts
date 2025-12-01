import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { neon } from '@neondatabase/serverless';
import { z } from 'zod';

/**
 * WHAT: Join an existing game room
 * WHY: Allow second player to join host's room for multi-device play
 * HOW: Validate room code, create player record, return room state
 */

const JoinRoomSchema = z.object({
  roomCode: z.string().length(6),
  playerName: z.string().min(1).max(50)
});

const headers = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS?.split(',')[0] || '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
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

  const DATABASE_URL = process.env.NEON_DATABASE_URL;
  if (!DATABASE_URL) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Database not configured' }),
    };
  }

  const sql = neon(DATABASE_URL);

  try {
    const body = JSON.parse(event.body || '{}');
    const input = JoinRoomSchema.parse(body);

    // Find active room
    const rooms = await sql`
      SELECT * FROM rooms
      WHERE code = ${input.roomCode}
        AND is_active = true
        AND expires_at > NOW()
    `;

    if (rooms.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Room not found or expired' }),
      };
    }

    const room = rooms[0];

    // Check if room is full (max 2 players for couples)
    const playerCount = await sql`
      SELECT COUNT(*) as count FROM players WHERE room_id = ${room.id}
    `;

    if (playerCount[0].count >= 2) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Room is full' }),
      };
    }

    // Check for name conflicts
    const existingPlayer = await sql`
      SELECT id FROM players
      WHERE room_id = ${room.id} AND name = ${input.playerName}
    `;

    if (existingPlayer.length > 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Name already taken in this room' }),
      };
    }

    // Create player and log event
    const result = await sql.transaction(async (tx) => {
      const [player] = await tx`
        INSERT INTO players (room_id, name, is_host, is_ready)
        VALUES (${room.id}, ${input.playerName}, false, false)
        RETURNING *
      `;

      await tx`
        INSERT INTO game_events (room_id, event_type, payload)
        VALUES (${room.id}, 'player_joined', ${JSON.stringify({
          playerId: player.id,
          playerName: input.playerName
        })})
      `;

      // Get all players
      const players = await tx`
        SELECT * FROM players WHERE room_id = ${room.id} ORDER BY joined_at
      `;

      return { player, players };
    });

    // Format response to match frontend expectations
    const response = {
      code: room.code,
      hostId: room.host_id,
      players: result.players.map((p: any) => ({
        id: p.id,
        name: p.name,
        isHost: p.is_host,
        isReady: p.is_ready
      })),
      step: room.step,
      spicyLevel: room.spicy_level,
      categories: room.categories || [],
      answers: [],
      playMode: room.play_mode,
      createdAt: new Date(room.created_at).getTime(),
      expiresAt: new Date(room.expires_at).getTime(),
      playerId: result.player.id // Return joined player's ID
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error('Room join error:', error);

    if (error instanceof z.ZodError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid input', details: error.errors }),
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to join room'
      }),
    };
  }
};

export { handler };
