/**
 * WHAT: Neon database setup script
 * WHY: Apply schema and test connection programmatically
 * HOW: Use @neondatabase/serverless to execute schema.sql
 */

import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { join } from 'path';

async function setupDatabase() {
  const DATABASE_URL = process.env.NEON_DATABASE_URL;

  if (!DATABASE_URL) {
    console.error('❌ NEON_DATABASE_URL environment variable not set');
    console.log('\nTo set it:');
    console.log('  1. Go to https://console.neon.tech/');
    console.log('  2. Create a new project or select existing');
    console.log('  3. Copy the connection string');
    console.log('  4. Set environment variable:');
    console.log('     export NEON_DATABASE_URL="postgresql://..."');
    process.exit(1);
  }

  console.log('🔗 Connecting to Neon database...');
  const sql = neon(DATABASE_URL);

  try {
    // Test connection
    const result = await sql`SELECT NOW() as current_time`;
    console.log('✅ Connected successfully!');
    console.log(`   Server time: ${result[0].current_time}`);

    // Read schema file
    console.log('\n📄 Reading schema.sql...');
    const schemaPath = join(__dirname, '..', 'database', 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');

    // Split into individual statements (basic splitting by semicolon)
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`   Found ${statements.length} SQL statements\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      if (stmt.length === 0) continue;

      // Log what we're executing (first 50 chars)
      const preview = stmt.substring(0, 50).replace(/\s+/g, ' ');
      console.log(`   [${i + 1}/${statements.length}] ${preview}...`);

      try {
        await sql.unsafe(stmt + ';');
      } catch (error: any) {
        // Ignore "already exists" errors
        if (error.code === '42P07' || error.message?.includes('already exists')) {
          console.log(`      ⚠️  Already exists, skipping`);
        } else {
          console.error(`      ❌ Error: ${error.message}`);
          throw error;
        }
      }
    }

    console.log('\n✅ Schema applied successfully!');

    // Verify tables were created
    console.log('\n🔍 Verifying tables...');
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;

    console.log('   Tables created:');
    tables.forEach((table: any) => {
      console.log(`     ✓ ${table.table_name}`);
    });

    // Test creating a room
    console.log('\n🧪 Testing room creation...');
    const testRoomCode = 'TEST' + Math.random().toString(36).substring(2, 4).toUpperCase();

    const [room] = await sql`
      INSERT INTO rooms (code, host_id, play_mode, step)
      VALUES (${testRoomCode}, uuid_generate_v4(), 'multi-device', 'Lobby')
      RETURNING *
    `;

    console.log(`   ✅ Test room created: ${room.code}`);

    // Clean up test room
    await sql`DELETE FROM rooms WHERE code = ${testRoomCode}`;
    console.log(`   🧹 Test room deleted`);

    console.log('\n🎉 Database setup complete!');
    console.log('\nNext steps:');
    console.log('  1. Set NEON_DATABASE_URL in Netlify dashboard');
    console.log('  2. Deploy your Netlify functions');
    console.log('  3. Test multi-device gameplay!');

  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run setup
setupDatabase().catch(console.error);
