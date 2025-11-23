#!/usr/bin/env node
/**
 * WHAT: Calculates Contract Compliance Rate (CCR)
 * WHY: Ensures Mock and Real implementations are behaviorally identical
 * HOW: Runs tests against both Mock and Real, compares results
 */

import * as fs from 'fs';
import * as path from 'path';

interface TestResult {
  suite: string;
  test: string;
  passed: boolean;
  error?: string;
}

interface CCRReport {
  ccr: number;
  mockTests: TestResult[];
  realTests: TestResult[];
  details: Array<{
    seam: string;
    issue: string;
  }>;
  timestamp: string;
}

function loadTestResults(filePath: string): TestResult[] {
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  Test results not found: ${filePath}`);
    return [];
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);

    // Parse Vitest JSON output
    const results: TestResult[] = [];

    if (data.testResults) {
      data.testResults.forEach((suite: any) => {
        suite.assertionResults?.forEach((test: any) => {
          results.push({
            suite: suite.name,
            test: test.title,
            passed: test.status === 'passed',
            error: test.failureMessages?.[0],
          });
        });
      });
    }

    return results;
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error);
    return [];
  }
}

function calculateCCR(mockTests: TestResult[], realTests: TestResult[]): CCRReport {
  const report: CCRReport = {
    ccr: 0,
    mockTests,
    realTests,
    details: [],
    timestamp: new Date().toISOString(),
  };

  if (mockTests.length === 0 || realTests.length === 0) {
    console.warn('⚠️  No test results to compare');
    report.details.push({
      seam: 'N/A',
      issue: 'No test results available for comparison',
    });
    return report;
  }

  // Compare test results
  const mockTestMap = new Map(mockTests.map(t => [`${t.suite}:${t.test}`, t]));
  const realTestMap = new Map(realTests.map(t => [`${t.suite}:${t.test}`, t]));

  let totalTests = 0;
  let matchingTests = 0;

  // Check each Mock test has corresponding Real test with same result
  mockTestMap.forEach((mockTest, key) => {
    totalTests++;
    const realTest = realTestMap.get(key);

    if (!realTest) {
      report.details.push({
        seam: mockTest.suite,
        issue: `Test "${mockTest.test}" exists in Mock but not in Real`,
      });
      return;
    }

    if (mockTest.passed !== realTest.passed) {
      report.details.push({
        seam: mockTest.suite,
        issue: `Test "${mockTest.test}" - Mock: ${mockTest.passed ? 'PASS' : 'FAIL'}, Real: ${realTest.passed ? 'PASS' : 'FAIL'}`,
      });
      return;
    }

    matchingTests++;
  });

  // Check for Real tests not in Mock
  realTestMap.forEach((realTest, key) => {
    if (!mockTestMap.has(key)) {
      totalTests++;
      report.details.push({
        seam: realTest.suite,
        issue: `Test "${realTest.test}" exists in Real but not in Mock`,
      });
    }
  });

  // Calculate CCR
  report.ccr = totalTests > 0 ? matchingTests / totalTests : 0;

  return report;
}

async function main(): Promise<void> {
  console.log('📊 Calculating Contract Compliance Rate (CCR)...\n');

  const mockResultsPath = path.join(process.cwd(), 'mock-results.json');
  const realResultsPath = path.join(process.cwd(), 'real-results.json');

  const mockTests = loadTestResults(mockResultsPath);
  const realTests = loadTestResults(realResultsPath);

  console.log(`   Mock tests: ${mockTests.length}`);
  console.log(`   Real tests: ${realTests.length}\n`);

  const report = calculateCCR(mockTests, realTests);

  // Save report
  const reportPath = path.join(process.cwd(), 'ccr-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`📈 CCR: ${(report.ccr * 100).toFixed(1)}%\n`);

  if (report.ccr === 1.0) {
    console.log('✅ PERFECT COMPLIANCE! CCR = 1.0');
    console.log('   Mock and Real implementations are behaviorally identical.');
    process.exit(0);
  } else if (report.ccr >= 0.9) {
    console.log('⚠️  GOOD COMPLIANCE - Minor issues detected');
  } else if (report.ccr > 0) {
    console.log('❌ POOR COMPLIANCE - Significant discrepancies');
  } else {
    console.log('❌ NO COMPLIANCE DATA - Unable to calculate CCR');
  }

  if (report.details.length > 0) {
    console.log('\n📋 Issues:');
    report.details.forEach(detail => {
      console.log(`   ${detail.seam}: ${detail.issue}`);
    });
  }

  console.log('\n⚠️  SDD Requirement: CCR must be 1.0 before progression');
  console.log(`   Report saved to: ${reportPath}\n`);

  // Don't fail build, just report
  process.exit(0);
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
