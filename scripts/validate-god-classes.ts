#!/usr/bin/env node
/**
 * WHAT: Detects God Classes (classes with too many responsibilities)
 * WHY: SDD limits classes to max 3 responsibilities
 * HOW: Analyzes class methods and properties to estimate responsibility count
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface ClassAnalysis {
  file: string;
  className: string;
  methodCount: number;
  propertyCount: number;
  estimatedResponsibilities: number;
  isGodClass: boolean;
}

function analyzeClass(filePath: string): ClassAnalysis[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const results: ClassAnalysis[] = [];

  // Simple regex to find class declarations
  const classRegex = /class\s+(\w+)/g;
  const classes = [...content.matchAll(classRegex)];

  for (const classMatch of classes) {
    const className = classMatch[1];

    // Count methods (public/private/protected functions)
    const methodRegex = new RegExp(
      `class\\s+${className}[\\s\\S]*?\\{([\\s\\S]*?)(?:\\n\\s*class|$)`,
      'g'
    );
    const classBody = methodRegex.exec(content);

    if (!classBody) continue;

    const body = classBody[1];

    // Count methods
    const methods = body.match(/\b(?:public|private|protected)?\s*\w+\s*\([^)]*\)\s*[:{]/g) || [];
    const methodCount = methods.length;

    // Count properties
    const properties = body.match(/\b(?:public|private|protected)?\s+\w+\s*[:=]/g) || [];
    const propertyCount = properties.length;

    // Heuristic: Each 5 methods or 10 properties = 1 responsibility
    // Plus 1 base responsibility
    const estimatedResponsibilities =
      1 + Math.floor(methodCount / 5) + Math.floor(propertyCount / 10);

    const isGodClass = estimatedResponsibilities > 3 || methodCount > 15;

    results.push({
      file: filePath,
      className,
      methodCount,
      propertyCount,
      estimatedResponsibilities,
      isGodClass,
    });
  }

  return results;
}

async function main(): Promise<void> {
  console.log('🔍 Checking for God Classes...\n');

  const srcDir = path.join(process.cwd(), 'src');

  if (!fs.existsSync(srcDir)) {
    console.log('⚠️  No src/ directory found, skipping validation');
    process.exit(0);
  }

  const tsFiles = await glob('**/*.ts', {
    cwd: srcDir,
    ignore: ['**/*.spec.ts', '**/*.test.ts', '**/*.d.ts'],
  });

  const allAnalysis: ClassAnalysis[] = [];
  const godClasses: ClassAnalysis[] = [];

  for (const file of tsFiles) {
    const fullPath = path.join(srcDir, file);
    const analysis = analyzeClass(fullPath);
    allAnalysis.push(...analysis);

    const gods = analysis.filter(a => a.isGodClass);
    godClasses.push(...gods);
  }

  console.log(`📊 Analyzed ${allAnalysis.length} classes\n`);

  if (godClasses.length === 0) {
    console.log('✅ No God Classes detected! All classes follow SDD limits.');
    process.exit(0);
  }

  console.log(`⚠️  ${godClasses.length} potential God Classes found:\n`);

  godClasses.forEach(analysis => {
    const relativePath = path.relative(process.cwd(), analysis.file);
    console.log(`   ${analysis.className} in ${relativePath}`);
    console.log(`      Methods: ${analysis.methodCount}`);
    console.log(`      Properties: ${analysis.propertyCount}`);
    console.log(`      Estimated Responsibilities: ${analysis.estimatedResponsibilities}`);
    console.log('');
  });

  console.log('⚠️  SDD Rule: Classes should have max 3 responsibilities');
  console.log('Consider refactoring large classes into smaller, focused classes.\n');

  // Warning only for now
  process.exit(0);
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
