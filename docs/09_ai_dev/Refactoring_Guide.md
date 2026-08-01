# Refactoring Guide
## SpendWise — Student Expense Tracker

---

## 1. When to Refactor (and When NOT To)

### Refactor When:
- A function is doing more than one thing (violates Single Responsibility)
- A component is over 200 lines long
- Business logic is mixed with UI rendering in a component
- The same logic is copy-pasted in 3+ places
- Types are inaccurate or missing (`any`, unclear interfaces)

### Do NOT Refactor When:
- The code works correctly and isn't being modified in the current task
- "I could make this more elegant" — elegance is not a refactoring trigger
- It's not related to the current task (violates AGENTS.md surgical changes rule)

---

## 2. Component Refactoring Pattern

### Prompt for Component Too Large:
```
The component [ComponentName] in [path] has grown too large (>200 lines) and has multiple responsibilities.

Please refactor it by:
1. Identifying the distinct concerns (data fetching, UI rendering, event handling)
2. Extracting data fetching into a custom hook: useComponentNameData.ts
3. Extracting repeated UI sections into sub-components
4. Keeping the parent component as a composition-only component

Constraints:
- All extracted components must be in the same directory
- All extracted hooks must be in src/hooks/
- Do NOT change the external interface (props) of the original component
- All types must remain explicit
```

---

## 3. Logic Extraction Patterns

### Extract Firebase Operation to Lib Function:
```
There is Firestore write logic currently in [ComponentName] that should be in the lib layer.

Please extract it to: src/lib/{domain}/operationName.ts

The extracted function should:
1. Accept typed parameters (userId: string, input: OperationInput)
2. Have a typed return value: Promise<void> or Promise<ResultType>
3. Handle all errors internally and re-throw with a friendly message
4. Use writeBatch for atomic writes
5. Include JSDoc comment describing purpose, params, and throws

After extraction:
- The component should import and call this function
- Add a test file: src/lib/{domain}/operationName.test.ts
```

---

## 4. Type Improvement Patterns

### Add Missing Types:
```
The file [path] has missing or weak TypeScript types. Please improve type safety:

1. Replace all `any` types with proper interfaces
2. Add explicit return types to all functions that are missing them
3. Create new interfaces in src/types/ if domain objects don't have types yet
4. Ensure all Firestore document reads use `as InterfaceName` type assertion (only at the read boundary)
5. Use discriminated unions instead of optional fields where possible

Do NOT change the runtime behavior. Types only.
```

---

## 5. Performance Refactoring

### Prevent Unnecessary Re-renders:
```
[ComponentName] is re-rendering too frequently, causing performance issues.

Please refactor to minimize renders:
1. Use granular Zustand selectors (select only the fields needed, not the entire store)
2. Wrap expensive computation in useMemo with correct dependencies
3. Wrap callbacks that are passed as props in useCallback
4. If the component is a list item, wrap it in React.memo
5. Verify that Framer Motion animations are not causing layout thrashing

After refactoring, add a comment explaining WHY each optimization was added.
```

---

## 6. Code Style Alignment

### Align with AGENTS.md:
```
Please refactor [path] to align with SpendWise's coding standards in AGENTS.md.

Specific issues to fix:
1. Default exports → Named exports (except page.tsx files)
2. Hardcoded colors → Design tokens from tokens.css
3. console.log → Proper error handling with showToast()
4. Implicit any → Explicit TypeScript types
5. .then() chains → async/await
6. Deeply nested conditionals → Early returns

Do NOT change functionality. Style and conventions only.
```
