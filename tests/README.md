# WorkNest Test Suite

Comprehensive automated tests for critical business logic.

## Quick Start

```bash
# 1. Setup test database
createdb worknest_test

# 2. Set environment
export DATABASE_URL="postgresql://user:password@localhost:5432/worknest_test"

# 3. Run tests
npm test
```

## Test Structure

- `rbac/` - Role-based access control tests (28 tests)
- `multi-tenancy/` - Workspace isolation tests (8 tests)
- `validation/` - Input validation tests (21 tests)
- `activity-log/` - Activity logging tests (12 tests)
- `error-handling/` - Error handling tests (16 tests)

**Total: 85 tests**

## Documentation

- See root `TEST_IMPLEMENTATION.md` for detailed documentation
- See root `TESTING_SUMMARY.md` for implementation summary
- See root `TEST_CHECKLIST.md` for implementation checklist

## Commands

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
npm run test:ui       # Interactive UI
```

## Test Coverage

✅ **RBAC Enforcement** - All roles tested (OWNER, ADMIN, MEMBER, VIEWER)  
✅ **Multi-Tenancy** - Complete workspace isolation  
✅ **Task Operations** - Full CRUD with permissions  
✅ **Input Validation** - All fields and edge cases  
✅ **Activity Logging** - Complete audit trail  
✅ **Error Handling** - All error scenarios

## Key Features

- Real PostgreSQL database testing
- Automatic cleanup between tests
- Type-safe with TypeScript
- Fast execution (~10-15 seconds)
- CI/CD ready
