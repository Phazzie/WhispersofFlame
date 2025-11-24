#!/usr/bin/env node
/**
 * WHAT: Validates Mock-Real Parity for SDD Compliance
 * WHY: Ensures every Real implementation has a corresponding Mock
 * HOW: Scans source files for Mock/Real patterns and verifies pairs exist
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface ParityResult {
  passed: boolean;
  missingMocks: string[];
  missingReals: string[];
  orphanedMocks: string[];
  pairs: Array<{ mock: string; real: string }>;
}

async function validateMockRealParity(): Promise<ParityResult> {
  const srcDir = path.join(process.cwd(), 'src');

  if (!fs.existsSync(srcDir)) {
    console.error('❌ src/ directory not found');
    process.exit(1);
  }

  // Find all Mock implementations
  const mockFiles = await glob('**/*Mock*.ts', {
    cwd: srcDir,
    ignore: ['**/*.spec.ts', '**/*.test.ts'],
  });

  // Find all Real/Service implementations
  const realFiles = await glob('**/*.service.ts', {
    cwd: srcDir,
    ignore: ['**/*.spec.ts', '**/*.test.ts', '**/*Mock*.ts'],
  });

  const result: ParityResult = {
    passed: true,
    missingMocks: [],
    missingReals: [],
    orphanedMocks: [],
    pairs: [],
  };

  // Check each Real has a Mock
  for (const realFile of realFiles) {
    const baseName = path.basename(realFile, '.service.ts');
    const mockPattern = `Mock${baseName}`;

    const matchingMock = mockFiles.find(m => m.includes(mockPattern));

    if (matchingMock) {
      result.pairs.push({ mock: matchingMock, real: realFile });
    } else {
      result.missingMocks.push(realFile);
      result.passed = false;
    }
  }

  // Check for orphaned Mocks
  for (const mockFile of mockFiles) {
    const isPaired = result.pairs.some(p => p.mock === mockFile);
    if (!isPaired) {
      result.orphanedMocks.push(mockFile);
    }
  }

  return result;
}

async function main(): Promise<void> {
  console.log('🔍 Validating Mock-Real Parity...\n');

  const result = await validateMockRealParity();

  console.log(`📊 Found ${result.pairs.length} Mock-Real pairs\n`);

  if (result.pairs.length > 0) {
    console.log('✅ Valid Pairs:');
    result.pairs.forEach(({ mock, real }) => {
      console.log(`   Mock: ${mock}`);
      console.log(`   Real: ${real}\n`);
    });
  }

  if (result.missingMocks.length > 0) {
    console.log('❌ Missing Mock Implementations:');
    result.missingMocks.forEach(real => {
      console.log(`   ${real} has no corresponding Mock`);
    });
    console.log('');
  }

  if (result.orphanedMocks.length > 0) {
    console.log('⚠️  Orphaned Mocks (no Real implementation):');
    result.orphanedMocks.forEach(mock => {
      console.log(`   ${mock}`);
    });
    console.log('');
  }

  if (result.passed) {
    console.log('✅ Mock-Real Parity: PASSED');
    process.exit(0);
  } else {
    console.log('❌ Mock-Real Parity: FAILED');
    console.log('\n⚠️  SDD Rule: Every Real implementation must have a Mock');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
