/**
 * WHAT: Production environment configuration
 * WHY: Provides production-safe defaults with environment variable injection
 * HOW: Build process replaces values from env vars
 */
export const environment = {
  production: true,
  
  // xAI API Configuration (for Grok AI)
  // NOTE: API key is stored server-side only in Netlify function (XAI_API_KEY env var)
  xai: {
    // apiKey removed - now server-side only via /.netlify/functions/ai-proxy
    model: 'grok-4-1-fast-reasoning',
  },
  
  // Netlify Identity (auto-configured by Netlify)
  netlifyIdentity: {
    // Auto-configured when deployed to Netlify
  },
  
  // Game Configuration
  game: {
    maxPlayers: 8,
    minPlayers: 2,
    questionTimeoutMs: 120000,
    roomCodeLength: 6,
  }
};
