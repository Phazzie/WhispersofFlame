import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { neon } from '@neondatabase/serverless';

/**
 * WHAT: Get current state of a game room
 * WHY: Allow players to fetch latest room state for sync
 * HOW: Query room, players, current question, and answers
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

  // Get room code from query params
  const roomCode = event.queryStringParameters?.code;
  if (!roomCode || roomCode.length !== 6) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid room code' }),
    };
  }

  const sql = neon(DATABASE_URL);

  try {
    // Get room
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

    // Get players
    const players = await sql`
      SELECT * FROM players WHERE room_id = ${room.id} ORDER BY joined_at
    `;

    // Get current question if any
    const questions = await sql`
      SELECT * FROM questions
      WHERE room_id = ${room.id}
      ORDER BY round_number DESC
      LIMIT 1
    `;

    const currentQuestion = questions.length > 0 ? questions[0] : null;

    // Get answers for current question
    let answers: any[] = [];
    if (currentQuestion) {
      answers = await sql`
        SELECT a.*, p.name as player_name
        FROM answers a
        JOIN players p ON a.player_id = p.id
        WHERE a.question_id = ${currentQuestion.id}
        ORDER BY a.submitted_at
      `;
    }

    // Format response
    const response = {
      code: room.code,
      hostId: room.host_id,
      players: players.map((p: any) => ({
        id: p.id,
        name: p.name,
        isHost: p.is_host,
        isReady: p.is_ready
      })),
      step: room.step,
      spicyLevel: room.spicy_level,
      categories: room.categories || [],
      currentQuestion: currentQuestion ? {
        id: currentQuestion.id,
        text: currentQuestion.text,
        category: currentQuestion.category,
        spicyLevel: currentQuestion.spicy_level
      } : null,
      answers: answers.map((a: any) => ({
        questionId: a.question_id,
        playerId: a.player_id,
        playerName: a.player_name,
        text: a.text,
        timestamp: new Date(a.submitted_at).getTime()
      })),
      playMode: room.play_mode,
      createdAt: new Date(room.created_at).getTime(),
      expiresAt: new Date(room.expires_at).getTime(),
      updatedAt: new Date(room.updated_at).getTime()
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error('Room get error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to get room'
      }),
    };
  }
};

export { handler };
