#!/usr/bin/env tsx
/**
 * WHAT: Validates top-level comments in TypeScript files
 * WHY: SDD requires all files to have WHAT/WHY/HOW documentation
 * HOW: Parses TS files and checks for proper header comments
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface CommentValidationResult {
  file: string;
  hasComment: boolean;
  hasWhat: boolean;
  hasWhy: boolean;
  hasHow: boolean;
  valid: boolean;
}

function validateFileComment(filePath: string): CommentValidationResult {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const result: CommentValidationResult = {
    file: filePath,
    hasComment: false,
    hasWhat: false,
    hasWhy: false,
    hasHow: false,
    valid: false,
  };

  // Check first 15 lines for documentation comment
  const headerLines = lines.slice(0, 15).join('\n');

  // Look for multi-line comment or JSDoc
  const hasMultiLineComment = /\/\*\*?[\s\S]*?\*\//.test(headerLines);
  
  // For single-line comments, look for explicit WHAT/WHY/HOW markers
  const singleLineComments = lines.slice(0, 15).filter(l => l.trim().startsWith('//')).join('\n').toLowerCase();
  const hasSingleLineComments = /\/\/.*what[:\s-]/.test(singleLineComments) &&
                                 /\/\/.*why[:\s-]/.test(singleLineComments) &&
                                 /\/\/.*how[:\s-]/.test(singleLineComments);

  result.hasComment = hasMultiLineComment || hasSingleLineComments;

  if (result.hasComment) {
    const commentText = headerLines.toLowerCase();
    result.hasWhat = /what:|what\s*-/.test(commentText);
    result.hasWhy = /why:|why\s*-/.test(commentText);
    result.hasHow = /how:|how\s*-/.test(commentText);
  }

  result.valid = result.hasWhat && result.hasWhy && result.hasHow;

  return result;
}

async function main(): Promise<void> {
  console.log('📝 Validating top-level comments...\n');

  const srcDir = path.join(process.cwd(), 'src');

  if (!fs.existsSync(srcDir)) {
    console.log('⚠️  No src/ directory found, skipping validation');
    process.exit(0);
  }

  const tsFiles = await glob('**/*.ts', {
    cwd: srcDir,
    ignore: ['**/*.spec.ts', '**/*.test.ts', '**/*.d.ts'],
  });

  const results: CommentValidationResult[] = [];
  const invalid: CommentValidationResult[] = [];

  for (const file of tsFiles) {
    const fullPath = path.join(srcDir, file);
    const result = validateFileComment(fullPath);
    results.push(result);

    if (!result.valid) {
      invalid.push(result);
    }
  }

  console.log(`📊 Checked ${results.length} TypeScript files\n`);

  if (invalid.length === 0) {
    console.log('✅ All files have proper WHAT/WHY/HOW comments!');
    process.exit(0);
  }

  console.log(`❌ ${invalid.length} files missing proper documentation:\n`);

  invalid.forEach(result => {
    const relativePath = path.relative(process.cwd(), result.file);
    console.log(`   ${relativePath}`);

    if (!result.hasComment) {
      console.log('      ❌ No top-level comment found');
    } else {
      if (!result.hasWhat) console.log('      ❌ Missing WHAT');
      if (!result.hasWhy) console.log('      ❌ Missing WHY');
      if (!result.hasHow) console.log('      ❌ Missing HOW');
    }
    console.log('');
  });

  console.log('⚠️  SDD Rule: All files must have top-level WHAT/WHY/HOW comments');
  console.log('Example format:');
  console.log('/**');
  console.log(' * WHAT: Brief description of what this file does');
  console.log(' * WHY: Why this file exists / problem it solves');
  console.log(' * HOW: High-level approach or architecture notes');
  console.log(' */\n');

  // Fail the build if any files are invalid to enforce documentation standards
  process.exit(1);
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
