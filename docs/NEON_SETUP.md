# Neon Database Setup Guide

## Overview

Whispers of Flame now supports **multi-device gameplay** using Neon PostgreSQL database. This guide walks you through setting up the database and configuring Netlify.

## Architecture

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────┐
│  Device 1   │────────▶│ Netlify Functions│────────▶│    Neon     │
│  (Host)     │         │  (Serverless)    │         │ PostgreSQL  │
└─────────────┘         └──────────────────┘         └─────────────┘
                                ▲
┌─────────────┐                │
│  Device 2   │────────────────┘
│  (Player)   │
└─────────────┘
```

### Key Features

- **Polling-Based Sync**: 2-second polling interval for real-time updates
- **Auto-Expiring Rooms**: 24-hour TTL for privacy
- **Event Sourcing**: All game actions logged for sync
- **No WebSockets**: Works on all hosting platforms

## Step 1: Create Neon Database

1. Go to [Neon Console](https://console.neon.tech/)
2. Create a new project: "whispers-of-flame"
3. Note your connection string (looks like: `postgresql://user:pass@host/db?sslmode=require`)

## Step 2: Initialize Database Schema

Run the schema file to create tables:

```bash
# Install Neon CLI (optional, or use Neon Console SQL Editor)
npm install -g @neondatabase/cli

# Apply schema
neon sql --connection-string "YOUR_CONNECTION_STRING" < database/schema.sql
```

**OR** use the Neon Console SQL Editor:
1. Open your Neon project
2. Click "SQL Editor"
3. Copy-paste contents of `database/schema.sql`
4. Click "Run"

## Step 3: Configure Netlify Environment Variables

1. Go to Netlify Dashboard → Your Site → Site Settings → Environment Variables
2. Add the following variable:

```
Variable Name: NEON_DATABASE_URL
Value: postgresql://user:pass@host/db?sslmode=require
```

3. Make sure `XAI_API_KEY` is also set (for AI features)

## Step 4: Deploy

```bash
# Build and deploy
npm run build
netlify deploy --prod

# OR use Git push (if connected to GitHub)
git push origin main
```

## Step 5: Test Multi-Device Play

1. **Device 1 (Host)**:
   - Open app → Create Room
   - Note the 6-letter room code

2. **Device 2 (Player)**:
   - Open app → Join Room
   - Enter room code

3. Both devices should now sync in real-time!

## API Endpoints

All endpoints are at `/.netlify/functions/`:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `room-create` | POST | Create new room |
| `room-join` | POST | Join existing room |
| `room-get` | GET | Fetch room state |
| `room-update` | POST | Update room (step, spicy level, categories) |
| `room-sync` | GET | Poll for new events |
| `player-ready` | POST | Toggle player ready status |
| `question-submit` | POST | Store AI question |
| `answer-submit` | POST | Store player answer |

## Database Schema

### Tables

- **rooms**: Game sessions with auto-expiration
- **players**: Players in each room (max 2 for couples)
- **questions**: AI-generated questions
- **answers**: Player responses
- **game_events**: Event log for real-time sync

### Privacy Features

- Rooms expire after 24 hours
- No user accounts or authentication (privacy-first)
- Answers stored temporarily (could be encrypted in production)

## Troubleshooting

### "Database not configured" error

**Cause**: `NEON_DATABASE_URL` not set in Netlify environment variables

**Fix**:
1. Check Netlify Dashboard → Environment Variables
2. Ensure variable name is exactly `NEON_DATABASE_URL`
3. Redeploy after adding

### Room not syncing

**Cause**: Polling not working or JavaScript errors

**Fix**:
1. Open browser DevTools → Console
2. Check for errors
3. Verify `RealSyncService` is initialized
4. Check Network tab for `room-sync` calls every 2 seconds

### Schema errors

**Cause**: Schema not applied or outdated

**Fix**:
```sql
-- Drop and recreate (WARNING: deletes all data)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- Then re-run database/schema.sql
```

## Local Development

For local testing with Neon:

1. Create `.env` file in project root:
```env
NEON_DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
XAI_API_KEY=your_xai_key
```

2. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

3. Run dev server:
```bash
netlify dev
```

This will run functions locally at `http://localhost:8888/.netlify/functions/`

## Cost Considerations

### Neon Free Tier

- 0.5 GB storage
- 1 GB data transfer/month
- Perfect for MVP/testing

### Estimated Usage

- ~10 KB per room (including events)
- ~100 concurrent games = ~1 MB
- Free tier supports hundreds of games/month

## Monitoring

### Neon Console

Monitor your database:
1. Go to [Neon Console](https://console.neon.tech/)
2. Select your project
3. View "Monitoring" tab for:
   - Query performance
   - Storage usage
   - Connection count

### Netlify Functions

Monitor function performance:
1. Netlify Dashboard → Functions
2. View invocations, errors, duration

## Security

### Current Implementation

- API keys stored server-side only
- CORS enabled for all origins (safe for read-only game data)
- No sensitive user data collected

### Production Recommendations

1. **Encrypt Answers**: Add PGP encryption for player answers
2. **Rate Limiting**: Add Netlify Edge rate limits
3. **Input Validation**: Zod schemas already implemented
4. **SQL Injection**: Using parameterized queries (Neon `sql` tagged template)

## Migration from SessionStorage

Old behavior: Rooms stored in browser sessionStorage (lost on browser close)
New behavior: Rooms stored in Neon (persisted, multi-device)

**No migration needed** - old sessionStorage data will be ignored. New rooms automatically use Neon.

## Future Enhancements

- [ ] WebSocket support for instant sync (when Netlify supports it)
- [ ] Answer encryption at rest
- [ ] Analytics dashboard
- [ ] Room history/replay feature
- [ ] Multiple couples in same room (group mode)

## Support

Questions? Check:
- [Neon Docs](https://neon.tech/docs)
- [Netlify Functions Docs](https://docs.netlify.com/functions/overview/)
- Project [GitHub Issues](https://github.com/phazzie/whispersofflame/issues)
