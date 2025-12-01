import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { neon } from '@neondatabase/serverless';
import { z } from 'zod';

/**
 * WHAT: Submit player answer to a question
 * WHY: Store answers for multi-device sync and game summary
 * HOW: Insert answer record, log event
 */

const SubmitAnswerSchema = z.object({
  roomCode: z.string().length(6),
  questionId: z.string().uuid(),
  playerId: z.string().uuid(),
  text: z.string().min(1).max(1000)
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
    const input = SubmitAnswerSchema.parse(body);

    // Verify room, question, and player exist and match
    const validation = await sql`
      SELECT r.id as room_id, q.id as question_id, p.id as player_id, p.name as player_name
      FROM rooms r
      JOIN questions q ON q.room_id = r.id
      JOIN players p ON p.room_id = r.id
      WHERE r.code = ${input.roomCode}
        AND q.id = ${input.questionId}
        AND p.id = ${input.playerId}
        AND r.is_active = true
        AND r.expires_at > NOW()
    `;

    if (validation.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Room, question, or player not found' }),
      };
    }

    const { room_id, player_name } = validation[0];

    // Check if answer already exists
    const existing = await sql`
      SELECT id FROM answers
      WHERE question_id = ${input.questionId} AND player_id = ${input.playerId}
    `;

    if (existing.length > 0) {
      // Update existing answer
      await sql.transaction(async (tx) => {
        await tx`
          UPDATE answers
          SET text = ${input.text}, submitted_at = NOW()
          WHERE id = ${existing[0].id}
        `;

        await tx`
          INSERT INTO game_events (room_id, event_type, payload)
          VALUES (${room_id}, 'answer_updated', ${JSON.stringify({
            questionId: input.questionId,
            playerId: input.playerId,
            playerName: player_name
          })})
        `;
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, updated: true }),
      };
    }

    // Insert new answer
    const result = await sql.transaction(async (tx) => {
      const [answer] = await tx`
        INSERT INTO answers (question_id, player_id, text)
        VALUES (${input.questionId}, ${input.playerId}, ${input.text})
        RETURNING *
      `;

      await tx`
        INSERT INTO game_events (room_id, event_type, payload)
        VALUES (${room_id}, 'answer_submitted', ${JSON.stringify({
          questionId: input.questionId,
          playerId: input.playerId,
          playerName: player_name
        })})
      `;

      return answer;
    });

    // Check if all players have answered
    const answerCount = await sql`
      SELECT COUNT(*) as count FROM answers WHERE question_id = ${input.questionId}
    `;
    const playerCount = await sql`
      SELECT COUNT(*) as count FROM players WHERE room_id = ${room_id}
    `;

    const allAnswered = answerCount[0].count === playerCount[0].count;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        answerId: result.id,
        allAnswered
      }),
    };
  } catch (error) {
    console.error('Answer submit error:', error);

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
        error: error instanceof Error ? error.message : 'Failed to submit answer'
      }),
    };
  }
};

export { handler };
