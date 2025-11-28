/**
 * WHAT: Development environment configuration
 * WHY: Allows local development without production credentials
 * HOW: Exports environment variables for services to consume
 */
export const environment = {
  production: false,
  
  // OpenRouter API Configuration (for Grok AI)
  openRouter: {
    apiKey: '', // Set via env variable or local override
    baseUrl: 'https://openrouter.ai/api/v1',
    model: 'x-ai/grok-beta', // Grok model for NSFW flexibility
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
