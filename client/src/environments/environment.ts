/**
 * WHAT: Development environment configuration
 * WHY: Allows local development without production credentials
 * HOW: Exports environment variables for services to consume
 */
export const environment = {
  production: false,
  
  // xAI API Configuration (for Grok AI)
  xai: {
    apiKey: '', // Set via env variable or local override
    baseUrl: 'https://api.x.ai/v1',
    model: 'grok-4-1-fast-reasoning', // Grok model for NSFW flexibility
  },
  
  // Netlify Identity (auto-configured by Netlify)
  netlifyIdentity: {
    // Widget auto-detects site URL in production
    // For local dev, you may need to set NETLIFY_IDENTITY_URL
  },
  
  // Game Configuration
  game: {
    maxPlayers: 8,
    minPlayers: 2,
    questionTimeoutMs: 120000, // 2 minutes to answer
    roomCodeLength: 6,
  }
};
