#!/usr/bin/env node
/**
 * WHAT: Validates no persistent data storage (privacy requirement)
 * WHY: WhispersofFlame must not persist user data beyond session
 * HOW: Scans for database connections, file writes, and persistent storage
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface PersistenceViolation {
  file: string;
  line: number;
  issue: string;
  code: string;
}

function checkFileForPersistence(filePath: string): PersistenceViolation[] {
  // Skip test and mock files early
  if (filePath.includes('.spec.') || filePath.includes('.test.') || filePath.includes('.mock.')) {
    return [];
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const violations: PersistenceViolation[] = [];

  // Patterns to detect
  const patterns = [
    {
      regex: /\bfs\.write(?!.*test|.*mock)/i,
      issue: 'File system write detected - data persistence violation',
    },
    {
      regex: /\blocalStorage\.setItem(?!.*expir|.*ttl)/i,
      issue: 'localStorage without expiration - must use session-only storage',
    },
    {
      regex: /\bsessionStorage\.setItem/i,
      issue: 'sessionStorage usage - verify data expires with session',
    },
    {
      regex: /\bIndexedDB|IDBDatabase(?!.*test|.*mock)/i,
      issue: 'IndexedDB usage - must have expiration mechanism',
    },
    {
      regex: /\bmongoose\.connect|mongoose\.createConnection/i,
      issue: 'MongoDB connection - persistent database usage forbidden',
    },
    {
      regex: /\bpg\.connect|new\s+Pool\(/i,
      issue: 'PostgreSQL connection - persistent database usage forbidden',
    },
    {
      regex: /\bredis\.createClient(?!.*session)/i,
      issue: 'Redis connection - verify session-only usage',
    },
    {
      regex: /\bCookie.*expires|maxAge(?!.*session)/i,
      issue: 'Cookie with long expiration - must be session-only',
    },
  ];

  lines.forEach((line, index) => {
    patterns.forEach(({ regex, issue }) => {
      if (regex.test(line)) {
        violations.push({
          file: filePath,
          line: index + 1,
          issue,
          code: line.trim(),
        });
      }
    });
  });

  return violations;
}

async function main(): Promise<void> {
  console.log('🔒 Checking for data persistence violations...\n');

  const srcDir = path.join(process.cwd(), 'src');

  if (!fs.existsSync(srcDir)) {
    console.log('⚠️  No src/ directory found, skipping validation');
    process.exit(0);
  }

  const tsFiles = await glob('**/*.ts', {
    cwd: srcDir,
  });

  const allViolations: PersistenceViolation[] = [];

  for (const file of tsFiles) {
    const fullPath = path.join(srcDir, file);
    const violations = checkFileForPersistence(fullPath);
    allViolations.push(...violations);
  }

  console.log(`📊 Scanned ${tsFiles.length} files\n`);

  if (allViolations.length === 0) {
    console.log('✅ No data persistence violations detected!');
    console.log('   All storage appears to be session-only or properly managed.');
    process.exit(0);
  }

  console.log(`⚠️  ${allViolations.length} potential persistence issues found:\n`);

  allViolations.forEach(violation => {
    const relativePath = path.relative(process.cwd(), violation.file);
    console.log(`   ${relativePath}:${violation.line}`);
    console.log(`      Issue: ${violation.issue}`);
    console.log(`      Code: ${violation.code}`);
    console.log('');
  });

  console.log('🔒 WhispersofFlame Privacy Rules:');
  console.log('   • No data persistence beyond session');
  console.log('   • No database connections for user data');
  console.log('   • localStorage/cookies must expire with session');
  console.log('   • All game state must be ephemeral');
  console.log('');

  // Warning only, manual review needed
  console.log('⚠️  These are potential issues. Please review each case manually.');
  process.exit(0);
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
