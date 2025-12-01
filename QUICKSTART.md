# Quick Start: Multi-Device Setup

## Prerequisites

1. **Neon Account**: Sign up at [neon.tech](https://neon.tech)
2. **Netlify Account**: Sign up at [netlify.com](https://netlify.com)
3. **Node.js 20+**: Installed on your machine

## Step 1: Create Neon Database

1. Go to [https://console.neon.tech/](https://console.neon.tech/)
2. Click "New Project"
3. Name it: `whispersofflame`
4. Copy the connection string (looks like: `postgresql://user:pass@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require`)

## Step 2: Set Environment Variable

### Windows (PowerShell):
```powershell
$env:NEON_DATABASE_URL="postgresql://your-connection-string-here"
```

### Mac/Linux:
```bash
export NEON_DATABASE_URL="postgresql://your-connection-string-here"
```

## Step 3: Apply Database Schema

```bash
npm run setup:neon
```

**Expected Output:**
```
🔗 Connecting to Neon database...
✅ Connected successfully!
📄 Reading schema.sql...
   [1/15] CREATE EXTENSION IF NOT EXISTS "uuid-ossp"...
   [2/15] CREATE TABLE rooms (...
   ...
✅ Schema applied successfully!
🔍 Verifying tables...
   ✓ rooms
   ✓ players
   ✓ questions
   ✓ answers
   ✓ game_events
🧪 Testing room creation...
   ✅ Test room created: TESTXY
   🧹 Test room deleted
🎉 Database setup complete!
```

## Step 4: Set Up Netlify

### Option A: Via Netlify Dashboard

1. Push your code to GitHub (already done!)
2. Go to [https://app.netlify.com/](https://app.netlify.com/)
3. Click "Add new site" → "Import an existing project"
4. Connect to GitHub → Select `whispersofflame` repo
5. Build settings:
   - **Build command**: `cd client && npm install && npm run build`
   - **Publish directory**: `client/dist/client/browser`
6. Click "Deploy site"
7. Go to **Site settings → Environment variables**
8. Add:
   - `NEON_DATABASE_URL` = your connection string
   - `XAI_API_KEY` = your xAI API key
   - `ALLOWED_ORIGINS` = your site URL (e.g., `https://yoursite.netlify.app`)
9. Trigger redeploy

### Option B: Via Netlify CLI (Local Testing)

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Login to Netlify:
   ```bash
   netlify login
   ```

3. Link your site:
   ```bash
   netlify link
   ```

4. Set environment variables:
   ```bash
   netlify env:set NEON_DATABASE_URL "postgresql://..."
   netlify env:set XAI_API_KEY "your-key"
   netlify env:set ALLOWED_ORIGINS "http://localhost:4200,https://yoursite.netlify.app"
   ```

5. Run locally:
   ```bash
   npm run dev
   ```

6. Deploy:
   ```bash
   netlify deploy --prod
   ```

## Step 5: Test the API

With Netlify Dev running (`npm run dev`), run the test suite:

```bash
npm run test:api
```

**Expected Output:**
```
🧪 Testing Neon API Endpoints

📝 Test 1: Create Room
✅ POST /room-create (342ms)
   Room Code: ABCDEF

👥 Test 2: Join Room
✅ POST /room-join (156ms)
   Player ID: 123e4567-e89b-12d3-a456-426614174000

📊 Test 3: Get Room
✅ GET /room-get (89ms)
   Players: 2

✋ Test 4: Player Ready
✅ POST /player-ready (134ms)
✅ POST /player-ready (both) (121ms)

🎯 Test 5: Update Room
✅ POST /room-update (178ms)

❓ Test 6: Submit Question
✅ POST /question-submit (145ms)
   Question ID: 789a0123-b45c-67d8-e901-234567890abc

💬 Test 7: Submit Answers
✅ POST /answer-submit (host) (156ms)
✅ POST /answer-submit (player) (142ms)
   All Answered: true

🔄 Test 8: Room Sync
✅ GET /room-sync (98ms)
   Events: 9

🧹 Cleanup: Delete test room
   ✅ Room ABCDEF deleted

📊 Test Summary
══════════════════════════════════════════════════
Total Tests: 11
Passed: 11 ✅
Failed: 0 ❌
Average Duration: 151ms

🎉 All tests passed!
```

## Step 6: Test Multi-Device Gameplay

1. **Device 1 (Host)**:
   - Open your Netlify site URL
   - Click "Create Room"
   - Note the 6-letter room code

2. **Device 2 (Player)**:
   - Open the same URL on another device/browser
   - Click "Join Room"
   - Enter the room code

3. **Both Devices**:
   - Select categories
   - Choose spicy level
   - Answer questions
   - See answers in real-time!

## Troubleshooting

### Database Connection Error

**Error**: `NEON_DATABASE_URL not configured`

**Solution**:
- Local: Ensure environment variable is set in your terminal
- Netlify: Check environment variables in Netlify Dashboard

### Room Not Syncing

**Error**: Devices not seeing each other's updates

**Solution**:
1. Open browser DevTools → Network tab
2. Look for `/room-sync` requests every 2 seconds
3. If missing, check:
   - JavaScript errors in Console
   - `RealSyncService` is initialized
   - CORS headers allow your origin

### Function Timeout

**Error**: `Function execution timed out`

**Solution**:
- Check Neon database is responding (test with `npm run setup:neon`)
- Verify connection string has `?sslmode=require` parameter
- Check Netlify function logs for specific errors

### CORS Error

**Error**: `Access to fetch ... from origin ... has been blocked by CORS policy`

**Solution**:
- Set `ALLOWED_ORIGINS` environment variable in Netlify
- Include your site URL: `https://yoursite.netlify.app`
- Redeploy after changing environment variables

## Production Checklist

Before launching to users:

- [ ] `NEON_DATABASE_URL` set in Netlify
- [ ] `XAI_API_KEY` set in Netlify
- [ ] `ALLOWED_ORIGINS` set to your production URL (no wildcards!)
- [ ] Database schema applied successfully
- [ ] All tests passing (`npm run test:api`)
- [ ] Multi-device gameplay tested on 2 devices
- [ ] HTTPS enabled (automatic with Netlify)
- [ ] Custom domain configured (optional)
- [ ] Error monitoring set up (Sentry/Datadog recommended)

## Next Steps

- Review [CODE_REVIEW.md](docs/CODE_REVIEW.md) for security recommendations
- Read [NEON_SETUP.md](docs/NEON_SETUP.md) for detailed architecture
- Check [MULTI_DEVICE_MIGRATION.md](docs/MULTI_DEVICE_MIGRATION.md) for migration details

## Support

- **Issues**: https://github.com/phazzie/whispersofflame/issues
- **Neon Docs**: https://neon.tech/docs
- **Netlify Docs**: https://docs.netlify.com

---

**Happy Gaming! 💕🔥**
