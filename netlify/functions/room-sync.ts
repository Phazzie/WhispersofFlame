import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { neon } from '@neondatabase/serverless';

/**
 * WHAT: Get recent game events for polling-based sync
 * WHY: Enable multi-device real-time updates without WebSockets
 * HOW: Query events since given timestamp
 */

const headers = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS?.split(',')[0] || '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json',
};

const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
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

  const roomCode = event.queryStringParameters?.code;
  const since = event.queryStringParameters?.since; // ISO timestamp

  if (!roomCode || roomCode.length !== 6) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid room code' }),
    };
  }

  const sql = neon(DATABASE_URL);

  try {
    // Find room
    const rooms = await sql`
      SELECT * FROM rooms
      WHERE code = ${roomCode}
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

    // Get events since timestamp (or last 50 if no timestamp)
    let events;
    if (since) {
      events = await sql`
        SELECT * FROM game_events
        WHERE room_id = ${room.id}
          AND created_at > ${since}
        ORDER BY created_at ASC
        LIMIT 100
      `;
    } else {
      events = await sql`
        SELECT * FROM game_events
        WHERE room_id = ${room.id}
        ORDER BY created_at DESC
        LIMIT 50
      `;
      events = events.reverse(); // Show oldest first
    }

    // Get current players for heartbeat
    const players = await sql`
      SELECT id, name, is_host, is_ready, last_seen
      FROM players
      WHERE room_id = ${room.id}
      ORDER BY joined_at
    `;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        events: events.map((e: any) => ({
          id: e.id,
          type: e.event_type,
          payload: e.payload,
          timestamp: new Date(e.created_at).getTime()
        })),
        players: players.map((p: any) => ({
          id: p.id,
          name: p.name,
          isHost: p.is_host,
          isReady: p.is_ready,
          lastSeen: new Date(p.last_seen).getTime()
        })),
        serverTime: Date.now()
      }),
    };
  } catch (error) {
    console.error('Room sync error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to sync room'
      }),
    };
  }
};

export { handler };
