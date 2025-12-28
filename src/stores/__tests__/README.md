# Workflow Store Tests

Comprehensive test suite for the Arazzo workflow Pinia store.

## Test Files

### `workflow.spec.ts`
Unit tests covering core store functionality:
- ✅ State initialization
- ✅ Node operations (add, remove, update, select)
- ✅ Connection operations (add, remove)
- ✅ Batch connection operations with deferred updates
- ✅ Helper methods (`_getNodeById`, `_getIncomingConnections`, `_getOutgoingConnections`)
- ✅ Operation lookup with memoization (O(1) cache)
- ✅ Workflow validation
- ✅ Step removal with reconnection
- ✅ Workflow data management
- ✅ Title and description updates

### `workflow.integration.spec.ts`
Integration tests for complex workflows:
- ✅ Connection path updates with success/failure handles
- ✅ Sequential workflow construction (linear chains)
- ✅ Branching workflows (parallel paths)
- ✅ YAML export with field pruning
- ✅ Performance verification of memoized lookups
- ✅ Source management and workflow state isolation

## Running Tests

```bash
# Run all tests once
npm test -- --run

# Watch mode (re-run on file changes)
npm test

# Run with UI
npm run test:ui

# Run with coverage
npm test -- --coverage
```

## Test Coverage

The test suite covers:
- **36 test cases** across 2 test files
- All optimizations (memoization, deferred updates, helper methods)
- Complex workflows with branching and reconnection logic
- Edge cases (empty workflows, orphaned nodes, invalid operations)
- State management across multiple sources

## Key Test Patterns

### Mocking Network Calls
```typescript
vi.stubGlobal('fetch', vi.fn(() =>
  Promise.reject(new Error('Network mocked'))
))
```

### Testing Batch Operations
```typescript
store.batchConnections(() => {
  store.addConnection(conn1)
  store.addConnection(conn2)
})
// updateConnectionPaths called only once
```

### Verifying Optimizations
```typescript
const startTime = performance.now()
for (let i = 0; i < 1000; i++) {
  store.findOperation('cached-op')
}
const endTime = performance.now()
expect(endTime - startTime).toBeLessThan(50) // Memoization ensures speed
```

## Notes

- Tests use `happy-dom` for lightweight DOM simulation
- `beforeEach` creates fresh Pinia instance for isolation
- Network requests are mocked to avoid external dependencies
- TypeScript strict mode enabled for type safety
