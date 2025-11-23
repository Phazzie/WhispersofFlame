# SDD Validation Scripts

This directory contains automated validation scripts that enforce SEAM-Driven Development (SDD) principles.

## Scripts Overview

| Script | Purpose | SDD Rule |
|--------|---------|----------|
| `validate-mock-real-parity.ts` | Ensures Mock-Real pairs exist | Every Real must have a Mock |
| `validate-comments.ts` | Checks WHAT/WHY/HOW docs | All files need top-level comments |
| `validate-god-classes.ts` | Detects complex classes | Max 3 responsibilities per class |
| `validate-naming.ts` | Enforces naming conventions | I*.ts, Mock*, Real* patterns |
| `validate-no-persistence.ts` | Prevents data persistence | Session-only storage |
| `calculate-ccr.ts` | Calculates CCR | CCR = 1.0 requirement |

## Usage

All scripts are integrated into npm scripts in `client/package.json`:

```bash
cd client

# Run individual validations
npm run validate:mock-real-parity
npm run validate:comments
npm run validate:god-classes
npm run validate:naming
npm run validate:no-persistence

# Calculate CCR
npm run ccr:calculate
```

## Direct Execution

You can also run scripts directly with ts-node:

```bash
cd client
npx ts-node ../scripts/validate-naming.ts
```

## Script Behavior

### Exit Codes
- `0` - Validation passed or warnings only
- `1` - Validation failed (blocking)

### Current Configuration
All SDD validation scripts currently **output warnings only** to allow gradual adoption. They won't block builds or commits.

To make them blocking, modify the scripts to use `process.exit(1)` instead of `process.exit(0)`.

## Integration

These scripts are used in:
- **GitHub Actions** - PR validation workflows
- **Pre-commit hooks** - Local validation (when Husky is added)
- **CI/CD pipelines** - Continuous enforcement

## Adding New Validations

To add a new validation:

1. Create `validate-<name>.ts` in this directory
2. Follow the existing script structure:
   ```typescript
   /**
    * WHAT: What this script validates
    * WHY: Why this validation matters
    * HOW: How the validation works
    */

   async function main(): Promise<void> {
     // Validation logic
   }

   main().catch(error => {
     console.error('Error:', error);
     process.exit(1);
   });
   ```

3. Add npm script in `client/package.json`:
   ```json
   "validate:<name>": "ts-node ../scripts/validate-<name>.ts"
   ```

4. Add to GitHub Actions workflows if needed

## Dependencies

Required packages:
- `ts-node` - Execute TypeScript scripts
- `glob` - File pattern matching
- `typescript` - TypeScript compiler

Install:
```bash
cd client
npm install -D ts-node glob typescript
```

## Output Examples

### Mock-Real Parity
```text
🔍 Validating Mock-Real Parity...

📊 Found 5 Mock-Real pairs

✅ Valid Pairs:
   Mock: services/mocks/MockAuthService.ts
   Real: services/AuthService.service.ts

✅ Mock-Real Parity: PASSED
```

### Top-Level Comments
```text
📝 Validating top-level comments...

📊 Checked 23 TypeScript files

❌ 3 files missing proper documentation:

   src/services/auth.service.ts
      ❌ No top-level comment found

⚠️  SDD Rule: All files must have top-level WHAT/WHY/HOW comments
```

### God Classes
```text
🔍 Checking for God Classes...

📊 Analyzed 18 classes

⚠️  2 potential God Classes found:

   GameEngine in src/engine/game-engine.ts
      Methods: 18
      Properties: 12
      Estimated Responsibilities: 5
```

## Troubleshooting

### "Cannot find module 'glob'"
```bash
cd client
npm install -D glob
```

### "ts-node: command not found"
```bash
cd client
npm install -D ts-node
npx ts-node ../scripts/validate-naming.ts
```

### Script doesn't detect files
- Check that `src/` directory exists
- Verify glob patterns in script
- Run from `client/` directory

## Best Practices

1. **Run locally before pushing** - Catch issues early
2. **Review warnings** - Even non-blocking issues should be addressed
3. **Keep CCR = 1.0** - Don't let Mock-Real parity drift
4. **Document all code** - WHAT/WHY/HOW is mandatory
5. **Refactor God Classes** - Keep responsibilities focused

## Contributing

When modifying scripts:
- Keep validation logic simple and fast
- Provide clear, actionable error messages
- Include suggestions for fixing issues
- Update this README with changes
- Test against real codebase scenarios

---

**Philosophy:** "Automation > Discipline"

If a rule matters, automate it. These scripts ensure SDD compliance without relying on human memory or discipline.
