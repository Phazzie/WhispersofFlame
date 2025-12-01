import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { neon } from '@neondatabase/serverless';
import { z } from 'zod';

/**
 * WHAT: Update room state (step, spicy level, categories)
 * WHY: Sync game progression across devices
 * HOW: Validate and update room, log events - FIXED: Uses parameterized queries
 */

const UpdateRoomSchema = z.object({
  roomCode: z.string().length(6),
  step: z.enum(['Lobby', 'CategorySelection', 'SpicyLevel', 'Question', 'Reveal', 'Summary']).optional(),
  spicyLevel: z.enum(['Mild', 'Medium', 'Hot', 'Extra-Hot']).optional(),
  categories: z.array(z.string()).optional()
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
    const input = UpdateRoomSchema.parse(body);

    // Find room
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
    const updates: any = {};

    if (!input.step && !input.spicyLevel && !input.categories) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No updates provided' }),
      };
    }

    // Update room and log event - FIXED: Use parameterized queries
    await sql.transaction(async (tx) => {
      if (input.step) {
        await tx`UPDATE rooms SET step = ${input.step} WHERE id = ${room.id}`;
        updates.step = input.step;
      }
      if (input.spicyLevel) {
        await tx`UPDATE rooms SET spicy_level = ${input.spicyLevel} WHERE id = ${room.id}`;
        updates.spicyLevel = input.spicyLevel;
      }
      if (input.categories) {
        await tx`UPDATE rooms SET categories = ${input.categories} WHERE id = ${room.id}`;
        updates.categories = input.categories;
      }

      await tx`
        INSERT INTO game_events (room_id, event_type, payload)
        VALUES (${room.id}, 'room_updated', ${JSON.stringify(updates)})
      `;
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, updates }),
    };
  } catch (error) {
    console.error('Room update error:', error);

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
        error: error instanceof Error ? error.message : 'Failed to update room'
      }),
    };
  }
};

export { handler };
