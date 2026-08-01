# AI Prompt Library for Development
## SpendWise — Student Expense Tracker

This document contains standardized prompts for use with AI coding assistants (like Cursor, GitHub Copilot, or Antigravity) to ensure consistent code generation that adheres to SpendWise project rules.

---

## 1. Feature Implementation Prompts

Use these when asking the AI to build a new feature end-to-end.

**Prompt: Create a new UI Component**
> "Create a new React component called `[ComponentName]` in `src/components/[folder]/`. It should accept `[props]` as props. Follow the UI/UX spec for this component. Use Tailwind CSS for styling, exclusively utilizing the CSS variables defined in `src/styles/tokens.css`. Ensure it is fully typed with TypeScript and includes a loading skeleton state if it fetches data."

**Prompt: Create a new Zustand Slice**
> "Create a new Zustand slice in `src/store/` for `[domain]`. Include the interface for the state, initial state values, and actions to update the state. Ensure the actions handle optimistic UI updates and use standard error handling if they perform async Firebase operations. Finally, integrate this slice into the main store in `src/store/index.ts`."

**Prompt: Implement a Firebase CRUD Operation**
> "Write a utility function in `src/lib/[folder]/` to `[Create/Read/Update/Delete]` a `[DocumentType]` in Firestore. The function must:
> 1. Accept `userId` as a parameter.
> 2. Ensure security by querying/writing with `userId`.
> 3. Use `serverTimestamp()` for time fields.
> 4. Handle Firebase errors using our standard `getErrorMessage` utility.
> 5. Be fully typed returning a Promise with the expected shape."

---

## 2. Refactoring & Code Quality Prompts

**Prompt: Clean up a Component**
> "Refactor `[filename.tsx]` to adhere to the SpendWise coding standards defined in `AGENTS.md`. Specifically:
> 1. Ensure all types are explicitly defined.
> 2. Move any complex business logic into a custom hook.
> 3. Reorder Tailwind classes according to our standard (Layout -> Sizing -> Spacing -> Typography -> Colors -> Effects).
> 4. Replace any hardcoded colors with tokens from `tokens.css`."

**Prompt: Add Error Boundaries and Loading States**
> "Review `[page.tsx]`. Add robust error handling by wrapping the async data fetching in a try-catch, and use the `showToast` action from `useUIStore` to display errors to the user. Also, implement a `loading.tsx` file in the same directory using our standard `Skeleton` components to match the layout of this page."

---

## 3. Testing Prompts

**Prompt: Generate Unit Tests for Utility**
> "Write comprehensive Vitest unit tests for the functions in `[filename.ts]`. Create the test file alongside it as `[filename.test.ts]`. Test the happy path, edge cases (zero, negative, very large numbers, null inputs), and verify that standard errors are thrown when expected. Use the mock factories from `src/test/factories.ts`."

**Prompt: Generate Playwright E2E Test**
> "Write a Playwright E2E test in `e2e/tests/` for the following user flow: `[Describe Flow]`. Start by logging in the test user using the fixture. Navigate to `[route]`. Interact with the UI using `data-testid` attributes. Assert that `[Expected Outcome]` occurs within `[timeout]`. Ensure the test cleans up any created data afterward."

---

## 4. UI Vibe-Coding Prompts

For generating polished, modern UI layouts from scratch.

**Prompt: Generate Modern Dashboard Layout**
> "Design a modern, mobile-first dashboard layout for an expense tracker. Use a 'glassmorphism' aesthetic with a deep purple gradient background (`bg-gradient-to-br from-primary-900 to-primary-800`). The hero section should be a large, rounded card showing the remaining budget with a smooth progress bar. Below that, place a 2x2 grid of smaller insight cards. Use 'Inter' font, large bold numbers, and ensure high contrast. Do not write the logic, just generate the JSX and Tailwind classes."

**Prompt: Generate Empty State**
> "Create an empty state component for when the user has no expenses. It should feature a large, friendly emoji or SVG in the center, a reassuring headline ('Nothing here yet!'), and a prominent, pulsing CTA button ('Add First Expense'). Center everything vertically and horizontally. Use subtle gray text for the subheadline."
