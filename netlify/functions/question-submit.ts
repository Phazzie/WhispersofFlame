import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { neon } from '@neondatabase/serverless';
import { z } from 'zod';

/**
 * WHAT: Submit AI-generated question to the database
 * WHY: Store questions for multi-device gameplay sync
 * HOW: Insert question record, log event
 */

const SubmitQuestionSchema = z.object({
  roomCode: z.string().length(6),
  text: z.string().min(10),
  category: z.string(),
  spicyLevel: z.enum(['Mild', 'Medium', 'Hot', 'Extra-Hot'])
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
    const input = SubmitQuestionSchema.parse(body);

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

    // Get current round number
    const questionCount = await sql`
      SELECT COUNT(*) as count FROM questions WHERE room_id = ${room.id}
    `;
    const roundNumber = (questionCount[0].count as number) + 1;

    // Insert question and log event
    const result = await sql.transaction(async (tx) => {
      const [question] = await tx`
        INSERT INTO questions (room_id, text, category, spicy_level, round_number)
        VALUES (${room.id}, ${input.text}, ${input.category}, ${input.spicyLevel}, ${roundNumber})
        RETURNING *
      `;

      await tx`
        INSERT INTO game_events (room_id, event_type, payload)
        VALUES (${room.id}, 'question_asked', ${JSON.stringify({
          questionId: question.id,
          category: input.category,
          roundNumber
        })})
      `;

      return question;
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        id: result.id,
        text: result.text,
        category: result.category,
        spicyLevel: result.spicy_level,
        roundNumber: result.round_number
      }),
    };
  } catch (error) {
    console.error('Question submit error:', error);

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
        error: error instanceof Error ? error.message : 'Failed to submit question'
      }),
    };
  }
};

export { handler };
