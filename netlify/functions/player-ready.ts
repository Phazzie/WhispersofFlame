import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { neon } from '@neondatabase/serverless';
import { z } from 'zod';

/**
 * WHAT: Toggle player ready status
 * WHY: Coordinate when both players are ready to start
 * HOW: Update player ready flag, log event
 */

const PlayerReadySchema = z.object({
  roomCode: z.string().length(6),
  playerId: z.string().uuid(),
  isReady: z.boolean()
});

const headers = {
  'Access-Control-Allow-Origin': '*',
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
    const input = PlayerReadySchema.parse(body);

    // Find room and player
    const rooms = await sql`
      SELECT r.*, p.name as player_name
      FROM rooms r
      JOIN players p ON p.room_id = r.id
      WHERE r.code = ${input.roomCode}
        AND p.id = ${input.playerId}
        AND r.is_active = true
        AND r.expires_at > NOW()
    `;

    if (rooms.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Room or player not found' }),
      };
    }

    const room = rooms[0];

    // Update player and log event
    await sql.transaction(async (tx) => {
      await tx`
        UPDATE players
        SET is_ready = ${input.isReady}
        WHERE id = ${input.playerId}
      `;

      await tx`
        UPDATE players
        SET last_seen = NOW()
        WHERE id = ${input.playerId}
      `;

      await tx`
        INSERT INTO game_events (room_id, event_type, payload)
        VALUES (${room.id}, 'player_ready_changed', ${JSON.stringify({
          playerId: input.playerId,
          playerName: room.player_name,
          isReady: input.isReady
        })})
      `;
    });

    // Check if all players are ready
    const players = await sql`
      SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE is_ready = true) as ready
      FROM players
      WHERE room_id = ${room.id}
    `;

    const allReady = players[0].total === players[0].ready && players[0].total > 0;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        allReady,
        playerCount: players[0].total,
        readyCount: players[0].ready
      }),
    };
  } catch (error) {
    console.error('Player ready error:', error);

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
        error: error instanceof Error ? error.message : 'Failed to update player status'
      }),
    };
  }
};

export { handler };
