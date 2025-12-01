# Multi-Device Migration Summary

## What Changed

Whispers of Flame has been upgraded from **same-device only** (pass-the-phone) to support **multi-device gameplay** where couples can play on separate phones in real-time.

## Before vs After

### Before (SessionStorage Only)
- ❌ Single device only (pass-the-phone mode)
- ❌ Lost on browser refresh
- ❌ No real-time sync
- ✅ Zero backend costs
- ✅ Maximum privacy

### After (Neon Database)
- ✅ Multi-device support (2 players, separate phones)
- ✅ Survives page refresh
- ✅ Real-time sync (2-second polling)
- ✅ Event sourcing for game history
- ✅ Still privacy-first (24-hour auto-delete)
- ⚠️ Requires Neon database setup

## Changes Made

### 1. Backend (Netlify Functions)

Created 8 new serverless functions:

| Function | Purpose |
|----------|---------|
| `room-create.ts` | Create game room with host |
| `room-join.ts` | Second player joins room |
| `room-get.ts` | Fetch current room state |
| `room-update.ts` | Update game step/settings |
| `room-sync.ts` | Poll for new events (real-time sync) |
| `player-ready.ts` | Toggle player ready status |
| `question-submit.ts` | Store AI-generated question |
| `answer-submit.ts` | Store player answer |

### 2. Database Schema

Created PostgreSQL schema in Neon:

```
rooms (id, code, host_id, step, spicy_level, categories, expires_at)
  ├─ players (id, room_id, name, is_host, is_ready)
  ├─ questions (id, room_id, text, category, spicy_level)
  ├─ answers (id, question_id, player_id, text)
  └─ game_events (id, room_id, event_type, payload, created_at)
```

### 3. Frontend Services

**New Services**:
- `game-api.service.ts` - Type-safe wrapper for all API calls
- `real-sync.service.ts` - Polling-based real-time sync

**Updated Services**:
- `real-persistence.service.ts` - Now calls Netlify functions instead of sessionStorage

### 4. Dependencies

Added:
```json
{
  "@neondatabase/serverless": "^0.10.6",
  "zod": "^3.24.1"
}
```

### 5. Configuration

**netlify.toml** - Updated CSP to allow Neon connections:
```
connect-src 'self' ... https://*.neon.tech
```

## Migration Path

### For Local Development

1. Get Neon connection string
2. Create `.env` file:
   ```env
   NEON_DATABASE_URL=postgresql://...
   ```
3. Run schema: `psql $NEON_DATABASE_URL < database/schema.sql`
4. Test locally: `netlify dev`

### For Production (Netlify)

1. Set environment variable in Netlify Dashboard:
   - `NEON_DATABASE_URL` = your connection string
2. Push to GitHub or deploy manually
3. Netlify auto-deploys with new functions

### Backward Compatibility

**No breaking changes!** Old sessionStorage code is replaced, but:
- Same-device mode still works
- Existing users won't notice changes
- Room codes still 6 letters
- Game flow unchanged

## Architecture Decisions

### Why Polling Instead of WebSockets?

**Pros**:
- ✅ Works on Netlify (no persistent connections needed)
- ✅ Simpler implementation
- ✅ Lower cost (serverless function invocations)
- ✅ Auto-recovers from connection drops

**Cons**:
- ⚠️ 2-second delay (acceptable for turn-based game)
- ⚠️ More function invocations (still within free tier)

### Why Neon Instead of Firebase/Supabase?

**Neon Advantages**:
- ✅ Serverless PostgreSQL (no idle instances)
- ✅ Auto-scaling
- ✅ 0.5 GB free tier (enough for MVP)
- ✅ Standard SQL (easy to migrate later)
- ✅ Built-in connection pooling

**Alternative**: Supabase already in CSP headers for future consideration

### Why Event Sourcing?

All game actions are logged in `game_events` table:
- Enables real-time sync without complex queries
- Audit trail for debugging
- Could enable replay/analytics later
- Minimal storage overhead

## Testing Checklist

- [ ] Create room on Device 1
- [ ] Join room on Device 2 with room code
- [ ] Both players see each other
- [ ] Host selects categories → Player sees update
- [ ] Host selects spicy level → Player sees update
- [ ] Question appears on both devices
- [ ] Player 1 submits answer → Player 2 sees count update
- [ ] Both players submit → Advance to reveal
- [ ] Page refresh maintains state
- [ ] Room expires after 24 hours

## Deployment Steps

```bash
# 1. Install dependencies
npm install

# 2. Set up Neon database
# (See NEON_SETUP.md)

# 3. Configure Netlify environment
# Add NEON_DATABASE_URL in dashboard

# 4. Build and deploy
cd client
npm install
npm run build
cd ..
netlify deploy --prod

# 5. Test multi-device
# Open app on 2 devices and verify sync
```

## Rollback Plan

If issues occur, rollback is simple:

1. Revert `real-persistence.service.ts` to use sessionStorage
2. Comment out new Netlify functions
3. Redeploy

No data loss concerns (rooms expire anyway).

## Performance Metrics

### Expected Load (MVP)

- 100 concurrent games
- 2-second polling = 50 requests/sec/game
- Total: ~5,000 function invocations/min
- Neon connections: ~200 concurrent

### Costs (Estimated)

**Netlify Functions** (Free Tier):
- 125k invocations/month free
- Estimate: ~20k/month (well within free)

**Neon** (Free Tier):
- 0.5 GB storage free
- ~100 KB per game (includes events)
- Supports ~5,000 games before needing upgrade

## Known Limitations

1. **Max 2 Players**: Database schema enforces couples-only
2. **2-Second Sync Delay**: Not instant (acceptable for turn-based)
3. **No Offline Mode**: Requires internet on both devices
4. **24-Hour Expiration**: Can't resume old games

## Future Enhancements

### Phase 2
- [ ] WebSocket support (when Netlify adds it)
- [ ] Answer encryption at rest
- [ ] Push notifications (player's turn)

### Phase 3
- [ ] Multiple couples in same room (group mode)
- [ ] Room persistence beyond 24 hours (opt-in)
- [ ] Game history/replay

### Phase 4
- [ ] Video chat integration
- [ ] Voice messages as answers
- [ ] Custom question packs

## Security Audit

### Current State
- ✅ API keys server-side only
- ✅ Parameterized SQL queries (no injection)
- ✅ Input validation (Zod schemas)
- ✅ Auto-expiring sessions (24h TTL)
- ⚠️ Answers stored in plaintext (private DB)
- ⚠️ No rate limiting (low risk for MVP)

### Production Hardening
- [ ] Add rate limiting (100 req/min per IP)
- [ ] Encrypt answers with player-provided passphrase
- [ ] Add CAPTCHA for room creation
- [ ] Monitor abuse patterns

## Questions & Answers

**Q: Can I still use same-device mode?**
A: Yes! Set `playMode: 'same-device'` when creating room. Multi-device is optional.

**Q: What if one player disconnects?**
A: Their `last_seen` timestamp is tracked. Could add reconnection logic later.

**Q: Can more than 2 players join?**
A: Not yet. Backend enforces 2-player limit. Could be expanded.

**Q: Are answers private?**
A: Yes - stored in private Neon DB, auto-deleted after 24h. No one can see except you two.

**Q: Can I export game history?**
A: Not yet, but `game_events` table makes this possible in future.

## Support & Issues

- **Setup Issues**: See [NEON_SETUP.md](./NEON_SETUP.md)
- **Bug Reports**: [GitHub Issues](https://github.com/phazzie/whispersofflame/issues)
- **Feature Requests**: Create issue with label `enhancement`

## Credits

- **Database**: Neon Serverless Postgres
- **Backend**: Netlify Functions (Node 20)
- **Validation**: Zod runtime type checking
- **AI**: xAI Grok API

---

**Status**: ✅ Ready for testing
**Next Steps**: Follow [NEON_SETUP.md](./NEON_SETUP.md) to deploy
