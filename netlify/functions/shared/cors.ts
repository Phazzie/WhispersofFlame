/**
 * WHAT: CORS configuration with origin validation
 * WHY: Prevent CSRF attacks and unauthorized API access
 * HOW: Whitelist specific origins, validate against allowed list
 */

export function getCorsHeaders(origin: string | undefined): Record<string, string> {
  // Get allowed origins from environment or use defaults
  const allowedOriginsStr = process.env.ALLOWED_ORIGINS || 'http://localhost:4200,http://localhost:8888';
  const allowedOrigins = allowedOriginsStr.split(',').map(o => o.trim());

  // Check if origin is allowed
  const isAllowed = origin && allowedOrigins.some(allowed => {
    // Allow exact match or wildcard subdomain match
    if (allowed === origin) return true;
    if (allowed.startsWith('*.')) {
      const domain = allowed.slice(1); // Remove *
      return origin.endsWith(domain);
    }
    return false;
  });

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json',
  };
}

export function handlePreflight(origin: string | undefined) {
  return {
    statusCode: 204,
    headers: getCorsHeaders(origin),
    body: ''
  };
}
