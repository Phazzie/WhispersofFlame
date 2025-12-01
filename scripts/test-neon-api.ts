/**
 * WHAT: Test script for Netlify Functions API
 * WHY: Verify all endpoints work before deployment
 * HOW: Simulate HTTP requests to local functions
 */

import { neon } from '@neondatabase/serverless';

const API_BASE = process.env.API_BASE || 'http://localhost:8888/.netlify/functions';
const DATABASE_URL = process.env.NEON_DATABASE_URL;

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'skip';
  error?: string;
  duration?: number;
}

const results: TestResult[] = [];

async function testEndpoint(
  name: string,
  method: string,
  endpoint: string,
  body?: any
): Promise<any> {
  const startTime = Date.now();
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    });

    const duration = Date.now() - startTime;
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`);
    }

    results.push({ name, status: 'pass', duration });
    console.log(`✅ ${name} (${duration}ms)`);
    return data;
  } catch (error) {
    const duration = Date.now() - startTime;
    results.push({
      name,
      status: 'fail',
      error: error instanceof Error ? error.message : String(error),
      duration
    });
    console.error(`❌ ${name} (${duration}ms):`, error instanceof Error ? error.message : error);
    throw error;
  }
}

async function runTests() {
  console.log('🧪 Testing Neon API Endpoints\n');
  console.log(`API Base: ${API_BASE}\n`);

  if (!DATABASE_URL) {
    console.error('❌ NEON_DATABASE_URL not set');
    process.exit(1);
  }

  let roomCode: string;
  let hostId: string;
  let playerId: string;
  let questionId: string;

  try {
    // Test 1: Create room
    console.log('📝 Test 1: Create Room');
    const createResponse = await testEndpoint(
      'POST /room-create',
      'POST',
      '/room-create',
      { hostName: 'TestHost', playMode: 'multi-device' }
    );
    roomCode = createResponse.code;
    hostId = createResponse.hostId;
    console.log(`   Room Code: ${roomCode}\n`);

    // Test 2: Join room
    console.log('👥 Test 2: Join Room');
    const joinResponse = await testEndpoint(
      'POST /room-join',
      'POST',
      '/room-join',
      { roomCode, playerName: 'TestPlayer' }
    );
    playerId = joinResponse.playerId;
    console.log(`   Player ID: ${playerId}\n`);

    // Test 3: Get room state
    console.log('📊 Test 3: Get Room');
    const getResponse = await testEndpoint(
      'GET /room-get',
      'GET',
      `/room-get?code=${roomCode}`
    );
    console.log(`   Players: ${getResponse.players.length}\n`);

    // Test 4: Player ready
    console.log('✋ Test 4: Player Ready');
    await testEndpoint(
      'POST /player-ready',
      'POST',
      '/player-ready',
      { roomCode, playerId: hostId, isReady: true }
    );

    await testEndpoint(
      'POST /player-ready (both)',
      'POST',
      '/player-ready',
      { roomCode, playerId, isReady: true }
    );
    console.log();

    // Test 5: Update room (select categories)
    console.log('🎯 Test 5: Update Room');
    await testEndpoint(
      'POST /room-update',
      'POST',
      '/room-update',
      {
        roomCode,
        step: 'CategorySelection',
        categories: ['Intimacy', 'Romance']
      }
    );
    console.log();

    // Test 6: Submit question
    console.log('❓ Test 6: Submit Question');
    const questionResponse = await testEndpoint(
      'POST /question-submit',
      'POST',
      '/question-submit',
      {
        roomCode,
        text: 'What is your favorite memory together?',
        category: 'Romance',
        spicyLevel: 'Mild'
      }
    );
    questionId = questionResponse.id;
    console.log(`   Question ID: ${questionId}\n`);

    // Test 7: Submit answers
    console.log('💬 Test 7: Submit Answers');
    await testEndpoint(
      'POST /answer-submit (host)',
      'POST',
      '/answer-submit',
      {
        roomCode,
        questionId,
        playerId: hostId,
        text: 'Our first date at the beach'
      }
    );

    const answerResponse = await testEndpoint(
      'POST /answer-submit (player)',
      'POST',
      '/answer-submit',
      {
        roomCode,
        questionId,
        playerId,
        text: 'When we watched the sunset together'
      }
    );
    console.log(`   All Answered: ${answerResponse.allAnswered}\n`);

    // Test 8: Room sync
    console.log('🔄 Test 8: Room Sync');
    const syncResponse = await testEndpoint(
      'GET /room-sync',
      'GET',
      `/room-sync?code=${roomCode}`
    );
    console.log(`   Events: ${syncResponse.events.length}\n`);

    // Cleanup: Delete test room
    console.log('🧹 Cleanup: Delete test room');
    const sql = neon(DATABASE_URL);
    await sql`DELETE FROM rooms WHERE code = ${roomCode}`;
    console.log(`   ✅ Room ${roomCode} deleted\n`);

    // Print summary
    console.log('📊 Test Summary');
    console.log('═'.repeat(50));
    const passed = results.filter(r => r.status === 'pass').length;
    const failed = results.filter(r => r.status === 'fail').length;
    const avgDuration = results.reduce((sum, r) => sum + (r.duration || 0), 0) / results.length;

    console.log(`Total Tests: ${results.length}`);
    console.log(`Passed: ${passed} ✅`);
    console.log(`Failed: ${failed} ❌`);
    console.log(`Average Duration: ${avgDuration.toFixed(0)}ms`);

    if (failed === 0) {
      console.log('\n🎉 All tests passed!');
    } else {
      console.log('\n❌ Some tests failed. Check logs above.');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n💥 Test suite failed:', error);

    // Attempt cleanup
    if (roomCode) {
      try {
        const sql = neon(DATABASE_URL);
        await sql`DELETE FROM rooms WHERE code = ${roomCode}`;
        console.log(`🧹 Cleaned up test room ${roomCode}`);
      } catch (cleanupError) {
        console.error('Failed to cleanup:', cleanupError);
      }
    }

    process.exit(1);
  }
}

runTests().catch(console.error);
