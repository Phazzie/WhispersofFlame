#!/usr/bin/env node
/**
 * WHAT: Validates SDD naming conventions
 * WHY: Enforces consistent naming (I*.ts for interfaces, Mock* / Real* for implementations)
 * HOW: Scans files and checks naming patterns against SDD rules
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface NamingViolation {
  file: string;
  issue: string;
  suggestion: string;
}

async function validateNaming(): Promise<NamingViolation[]> {
  const violations: NamingViolation[] = [];
  const srcDir = path.join(process.cwd(), 'src');

  if (!fs.existsSync(srcDir)) {
    return violations;
  }

  const tsFiles = await glob('**/*.ts', {
    cwd: srcDir,
    ignore: ['**/*.spec.ts', '**/*.test.ts', '**/*.d.ts'],
  });

  for (const file of tsFiles) {
    const fullPath = path.join(srcDir, file);
    const content = fs.readFileSync(fullPath, 'utf-8');
    const fileName = path.basename(file);

    // Check interface files
    const hasInterface = /export\s+interface\s+(\w+)/.test(content);
    if (hasInterface) {
      const interfaceMatch = content.match(/export\s+interface\s+(\w+)/);
      const interfaceName = interfaceMatch?.[1];

      if (interfaceName && !interfaceName.startsWith('I')) {
        violations.push({
          file,
          issue: `Interface "${interfaceName}" doesn't start with "I"`,
          suggestion: `Rename to "I${interfaceName}"`,
        });
      }

      // Interface files should be named I*.ts or *.interface.ts
      if (!fileName.startsWith('I') && !fileName.includes('.interface.')) {
        violations.push({
          file,
          issue: 'Interface file should be named I*.ts or *.interface.ts',
          suggestion: `Rename to I${fileName} or ${fileName.replace('.ts', '.interface.ts')}`,
        });
      }
    }

    // Check Mock implementations
    const hasMockClass = /class\s+\w*Mock\w*/.test(content);
    if (hasMockClass && !fileName.includes('Mock') && !fileName.includes('.mock.')) {
      violations.push({
        file,
        issue: 'Mock class should be in a file named *Mock*.ts or *.mock.ts',
        suggestion: `Rename file to include "Mock" or ".mock"`,
      });
    }

    // Check for classes that should be Real*
    const hasClass = /class\s+(\w+)/.test(content);
    if (hasClass && !fileName.includes('Mock') && fileName.includes('.service.')) {
      const classMatch = content.match(/class\s+(\w+)/);
      const className = classMatch?.[1];

      // If there's a corresponding Mock, this should probably be Real*
      const mockExists = tsFiles.some(f => f.includes('Mock') && f.includes(className || ''));
      if (mockExists && className && !className.startsWith('Real')) {
        violations.push({
          file,
          issue: `Service "${className}" has a Mock but isn't named Real*`,
          suggestion: `Consider renaming to "Real${className}"`,
        });
      }
    }
  }

  return violations;
}

async function main(): Promise<void> {
  console.log('🏷️  Validating naming conventions...\n');

  const violations = await validateNaming();

  if (violations.length === 0) {
    console.log('✅ All files follow SDD naming conventions!');
    process.exit(0);
  }

  console.log(`⚠️  ${violations.length} naming convention issues found:\n`);

  violations.forEach(violation => {
    console.log(`   ${violation.file}`);
    console.log(`      Issue: ${violation.issue}`);
    console.log(`      Suggestion: ${violation.suggestion}`);
    console.log('');
  });

  console.log('📋 SDD Naming Rules:');
  console.log('   • Interfaces: I*.ts or *.interface.ts with interface I* name');
  console.log('   • Mock implementations: *Mock*.ts or *.mock.ts with class Mock* name');
  console.log('   • Real implementations: *Real*.ts with class Real* name (when Mock exists)');
  console.log('');

  // Warning only
  process.exit(0);
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
