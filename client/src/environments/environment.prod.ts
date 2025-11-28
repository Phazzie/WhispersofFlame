/**
 * WHAT: Production environment configuration
 * WHY: Provides production-safe defaults with environment variable injection
 * HOW: Build process replaces values from env vars
 */
export const environment = {
  production: true,
  
  // xAI API Configuration (for Grok AI)
  // NOTE: In production, this should be set via Netlify env vars
  // The API key should NEVER be committed to source control
  xai: {
    apiKey: '', // Injected at build time from XAI_API_KEY env var
    baseUrl: 'https://api.x.ai/v1',
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
