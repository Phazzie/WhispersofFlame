import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

/**
 * WHAT: Netlify Function proxy for xAI API calls
 * WHY: Keeps XAI_API_KEY server-side only - never exposed to client
 * HOW: Client calls /.netlify/functions/ai-proxy, this forwards to xAI with secret key
 */

interface ChatRequest {
  model: string;
  messages: { role: string; content: string }[];
  temperature?: number;
  max_tokens?: number;
}

const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  // CORS headers for preflight
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // Get API key from environment (server-side only!)
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    console.error('XAI_API_KEY not configured in Netlify environment');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'AI service not configured' }),
    };
  }

  try {
    // Parse request body
    const requestBody: ChatRequest = JSON.parse(event.body || '{}');

    // Validate required fields
    if (!requestBody.messages || !Array.isArray(requestBody.messages)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid request: messages required' }),
      };
    }

    // Forward to xAI API
    const xaiResponse = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: requestBody.model || 'grok-4-1-fast-reasoning',
        messages: requestBody.messages,
        temperature: requestBody.temperature ?? 0.9,
        max_tokens: requestBody.max_tokens ?? 300,
      }),
    });

    const responseData = await xaiResponse.text();

    // Return xAI response to client
    return {
      statusCode: xaiResponse.status,
      headers,
      body: responseData,
    };
  } catch (error) {
    console.error('AI proxy error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to process AI request' }),
    };
  }
};

export { handler };
