# TASK-002: Add error handling and loading states to graph generation

**Status:** done
**Created:** 2026-04-04
**Priority:** high

## Description

Add robust error handling and visible loading states to the graph generation flow. The current implementation has a basic try/catch in `useGraphActions.js` but no structured error types, no skeleton loading UI, no retry mechanism, and a minimal status bar. This task adds all five.

1. Wrap the Claude API call in `claudeService.js` with structured error handling. Distinguish network errors, rate limits (429), and malformed JSON. Return structured error objects.
2. Add an `isGenerating` boolean to `graphStore.js`. Set true before the API call, false after (success or failure).
3. Show 3-5 pulsing `NodeSkeleton` placeholder nodes in the graph canvas area while generating.
4. Show an error message in the UI with a Retry button if generation fails.
5. Enhance `StatusBar` to show distinct labels: idle, generating, error, and node count after success.

---

## Step 1: Plan (Claude Code)

_Claude Code writes below this line. Do not delete._

<!-- CLAUDE_CODE_PLAN_START -->

### Overview

7 files modified, 0 new files. All components and styles already exist — this task enhances them.

### 1. Structured errors in `src/services/claudeService.js`

**Current state:** `callClaude()` throws plain `Error` objects. `parseClaudeJSON()` throws on invalid JSON. No error type distinction.

**Changes to `callClaude(prompt)` (lines 13-41):**

Replace the current error handling with structured error objects. Define a `ClaudeServiceError` class at the top of the file:

```js
class ClaudeServiceError extends Error {
  constructor(type, message) {
    super(message);
    this.type = type; // 'auth' | 'network' | 'rate_limit' | 'api' | 'parse'
  }
}
```

In `callClaude`:
- Missing API key → `throw new ClaudeServiceError('auth', 'Missing VITE_CLAUDE_API_KEY in .env.local')`
- `fetch()` throws (network failure) → wrap in try/catch → `throw new ClaudeServiceError('network', 'Network error: could not reach Claude API. Check your connection.')`
- `response.status === 429` → `throw new ClaudeServiceError('rate_limit', 'Rate limited by Claude API. Wait a moment and try again.')`
- Other non-ok response → `throw new ClaudeServiceError('api', \`Claude API error (${response.status}): ${errorText}\`)`

In `parseClaudeJSON`:
- JSON.parse failure → `throw new ClaudeServiceError('parse', \`Failed to parse Claude response as JSON: ${e.message}\`)`

Export the class so consumers can check `error.type`:
```js
export { ClaudeServiceError };
```

**Do NOT change** the function signatures of `requestConceptGraphParsed`, `requestConceptGraph`, etc. They continue to throw — callers catch.

### 2. `isGenerating` boolean in `src/store/graphStore.js`

**Current state:** Store has `status: 'idle'` which gets set to `'loading'`/`'ready'`/`'error'`. No dedicated boolean.

**Changes:**

Add `isGenerating: false` to `initialState` (after `error`).

Add a new action:
```js
setIsGenerating: (isGenerating) => set({ isGenerating }),
```

Include `isGenerating: false` in `resetGraph`.

**Do NOT remove or change the existing `status` field.** `isGenerating` is a dedicated boolean for UI loading states. `status` remains for general state tracking.

### 3. Skeleton loading UI in `src/App.jsx` + `src/styles/nodes.module.css`

**Current state:** `App.jsx` shows text "Generating graph…" when `status === 'loading'` and no nodes exist. `NodeSkeleton.jsx` exists but isn't used during generation. `.skeletonBar` has a static gradient with no animation.

**Changes to `src/App.jsx`:**

Import `NodeSkeleton` from `'./components/nodes/NodeSkeleton'`.

Replace the loading branch inside `<div className={styles.graphCanvas}>` (currently lines 50-57):

```jsx
{status === 'loading' && nodeCount === 0 ? (
  <div className={styles.skeletonGrid}>
    <NodeSkeleton />
    <NodeSkeleton />
    <NodeSkeleton />
    <NodeSkeleton />
    <NodeSkeleton />
  </div>
) : nodeCount > 0 ? (
  <GraphCanvas />
) : (
  <div className={styles.emptyState}>
    <h2>Generate your first topic graph</h2>
    <p>Type a subject in the sidebar and hit Generate.</p>
  </div>
)}
```

**Changes to `src/styles/nodes.module.css`:**

Add a pulse keyframe animation and apply it to `.skeletonBar`:

```css
@keyframes skeletonPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.skeletonBar {
  /* keep existing styles */
  animation: skeletonPulse 1.5s ease-in-out infinite;
}
```

Also add staggered delays to the skeleton bars. Since NodeSkeleton renders 3 bars, use `:nth-child` on `.skeleton > .skeletonBar`:

```css
.skeleton > .skeletonBar:nth-child(2) {
  animation-delay: 0.2s;
  width: 75%;
}

.skeleton > .skeletonBar:nth-child(3) {
  animation-delay: 0.4s;
  width: 50%;
}
```

### 4. Wire `isGenerating` in `src/hooks/useGraphActions.js`

**Current state:** `generateGraph` calls `setStatus('loading')` and `setStatus('ready')` but does not touch `isGenerating`.

**Changes to `generateGraph`:**

Pull `setIsGenerating` from the store (same pattern as other selectors).

At the start of `generateGraph`: `setIsGenerating(true);`
In the `try` block after `setGraph()`: `setIsGenerating(false);`
In the `catch` block: `setIsGenerating(false);`

Use a `finally` block for cleanliness:
```js
try {
  // ... existing code ...
} catch (err) {
  // Use err.type if it's a ClaudeServiceError, otherwise generic
  const message = err.message || 'Something went wrong generating the graph';
  setError(message);
} finally {
  setIsGenerating(false);
}
```

### 5. Error UI with retry in `src/components/ui/ErrorBanner.jsx` + `src/App.jsx`

**Changes to `ErrorBanner.jsx`:**

Add optional `onRetry` prop. When present, render a Retry button between the message and Dismiss:

```jsx
function ErrorBanner({ message, onDismiss, onRetry }) {
  return (
    <div className={styles.errorBanner} role="alert">
      <span>{message}</span>
      <div>
        {onRetry ? (
          <button className={styles.primaryButton} onClick={onRetry} type="button">
            Retry
          </button>
        ) : null}
        <button className={styles.secondaryButton} onClick={onDismiss} type="button">
          Dismiss
        </button>
      </div>
    </div>
  );
}
```

**Changes to `App.jsx`:**

Pass `onRetry` to ErrorBanner. The retry handler re-calls `generateGraph` with the current topic:

```jsx
{error ? (
  <ErrorBanner
    message={error}
    onDismiss={clearError}
    onRetry={topic ? () => generateGraph(topic) : undefined}
  />
) : null}
```

`onRetry` is only passed when `topic` is truthy (can't retry without a topic).

### 6. StatusBar enhancement in `src/components/ui/StatusBar.jsx`

**Current state:** Shows raw `Status: {status}` string.

**Changes:**

Map status values to user-friendly labels:

```jsx
const STATUS_LABELS = {
  idle: 'Ready',
  loading: 'Generating…',
  ready: 'Complete',
  error: 'Error',
};

function StatusBar({ topic, status, nodeCount }) {
  const label = STATUS_LABELS[status] || status;

  return (
    <footer className={styles.statusBar}>
      <span>{topic ? `Topic: ${topic}` : 'No topic selected'}</span>
      <span>{label}</span>
      {status === 'ready' && nodeCount > 0 ? (
        <span>{nodeCount} concept{nodeCount !== 1 ? 's' : ''}</span>
      ) : null}
    </footer>
  );
}
```

### Files changed summary

| File | Change | Lines |
|------|--------|-------|
| `src/services/claudeService.js` | Add `ClaudeServiceError` class, structured throws | ~20 |
| `src/store/graphStore.js` | Add `isGenerating` to state + `setIsGenerating` action | ~5 |
| `src/hooks/useGraphActions.js` | Wire `setIsGenerating`, use `finally` block | ~8 |
| `src/App.jsx` | Skeleton grid for loading, `onRetry` on ErrorBanner | ~15 |
| `src/components/ui/ErrorBanner.jsx` | Add optional `onRetry` prop + Retry button | ~8 |
| `src/components/ui/StatusBar.jsx` | Friendly status labels, conditional node count | ~10 |
| `src/styles/nodes.module.css` | Pulse animation for skeleton bars | ~12 |

### Invariants

- **ConceptNode schema** — not touched
- **graphStore single source of truth** — maintained; `isGenerating` is additive
- **claudeService.js is only API touchpoint** — maintained
- **Existing `status` field** — not removed or changed; `isGenerating` is supplementary
- **No new dependencies** — everything uses existing React, Zustand, CSS modules

### Testing

1. `npx vite build` — must compile cleanly
2. Start dev server, enter a topic, hit Generate → verify 5 skeleton nodes pulse in the canvas area
3. After graph loads → skeletons disappear, real nodes render, StatusBar shows "Complete" + node count
4. Remove API key from `.env.local`, restart, try Generate → ErrorBanner shows auth error with Retry button
5. Click Retry after restoring the key → graph generates successfully
6. StatusBar shows "Ready" on idle, "Generating…" during API call, "Error" on failure

<!-- CLAUDE_CODE_PLAN_END -->

---

## Step 2: Implement (Codex)

_Codex writes below this line. Do not delete._

### Pre-flight
<!-- CODEX_PREFLIGHT_START -->

Read in full before editing:
- `src/services/claudeService.js`
- `src/store/graphStore.js`
- `src/hooks/useGraphActions.js`
- `src/App.jsx`
- `src/components/ui/ErrorBanner.jsx`
- `src/components/ui/StatusBar.jsx`
- `src/components/nodes/NodeSkeleton.jsx`
- `src/components/layout/Sidebar.jsx`
- `src/styles/layout.module.css`
- `src/styles/nodes.module.css`

Affected modules:
- Claude API service: structured request and parse failures
- Zustand store: additive `isGenerating` UI state
- Graph generation hook: generation lifecycle wiring
- App/UI components: loading skeletons, retry action, status labels
- CSS modules: skeleton animation and error-banner action layout

Invariants that must not break:
- ConceptNode data model in `src/store/graphStore.js` remains unchanged
- Prompt templates in `src/prompts/` remain untouched
- `src/services/claudeService.js` stays the only Claude API touchpoint
- `graphStore` remains the single source of truth
- Existing graph data stays in store during generation and only gets replaced on success
- No new dependencies are added

Implementation plan:
1. Add `ClaudeServiceError` and typed failure handling in `claudeService.js`
2. Add `isGenerating` state/action in `graphStore.js`
3. Wire `generateGraph()` to set/clear `isGenerating` with `finally`
4. Update `App.jsx`, `ErrorBanner.jsx`, and `StatusBar.jsx` for loading/error/retry UX
5. Add skeleton pulse styling and minimal banner action layout styles
6. Record results in this task file and update status to `reviewing`

Validation to run:
- `npm run build`
- `npm run dev` startup check only

Notes:
- This repo currently has no `test` or `lint` script in `package.json`, so automated tests/lint cannot be run for this task without adding tooling, which is out of scope for the approved plan.

<!-- CODEX_PREFLIGHT_END -->

### Changes made
<!-- CODEX_CHANGES_START -->

Implemented the approved plan across the service, store, hook, UI, and CSS layers.

Code changes:
- `src/services/claudeService.js`
  - Added exported `ClaudeServiceError` with `type`
  - Classified auth, network, rate-limit, API, and JSON parse failures
  - Kept existing request function signatures unchanged
- `src/store/graphStore.js`
  - Added additive `isGenerating` state and `setIsGenerating` action
  - Preserved existing `status` field and reset behavior
- `src/hooks/useGraphActions.js`
  - Wired generation lifecycle to `clearError()`, `setStatus('loading')`, `setIsGenerating(true)`, and `finally`
  - Preserved existing graph data during generation and only replace on success
- `src/App.jsx`
  - Switched sidebar loading disable state to `isGenerating`
  - Rendered 5 `NodeSkeleton` placeholders during generation
  - Added retry wiring to `ErrorBanner`
- `src/components/ui/ErrorBanner.jsx`
  - Added optional `onRetry` prop and Retry button
- `src/components/ui/StatusBar.jsx`
  - Replaced raw status text with user-facing labels
  - Show node count only after successful generation
- `src/styles/layout.module.css`
  - Added grouped error-banner action layout
- `src/styles/nodes.module.css`
  - Added skeleton pulse animation and staggered bar widths/delays

Behavioral result:
- Any generation request now swaps the canvas to skeleton placeholders while keeping the previous graph in store
- On failure, previous graph content reappears automatically once `isGenerating` clears
- Errors are surfaced with dismiss/retry controls and friendlier status text

<!-- CODEX_CHANGES_END -->

### Post-change report
<!-- CODEX_REPORT_START -->

Files changed:
- `docs/tasks/active/TASK-002-api-error-handling.md`
- `src/services/claudeService.js`
- `src/store/graphStore.js`
- `src/hooks/useGraphActions.js`
- `src/App.jsx`
- `src/components/ui/ErrorBanner.jsx`
- `src/components/ui/StatusBar.jsx`
- `src/styles/layout.module.css`
- `src/styles/nodes.module.css`

What changed and why:
- Added typed Claude service errors so generation failures are more specific and easier to surface in the UI
- Added store-level `isGenerating` state so loading UI can be driven independently from the broader `status` field
- Updated graph generation flow to set/reset loading state safely in `finally`
- Replaced the text-only loading empty state with 5 `NodeSkeleton` placeholders during generation
- Added Retry support to the error banner and improved status labels after idle/loading/error/success

Tests run and results:
- `npm run build` — passed
- `npm run dev` — app boot confirmed after requesting escalated permissions because the sandbox blocked port binding on `::1:5173`; server was then stopped

Risks / open questions:
- I could not fully exercise the interactive success/failure scenarios in a browser from the terminal environment, so the visual retry/skeleton flows still need manual UI verification with a real API key or forced API failure
- No `test` or `lint` scripts currently exist in `package.json`, so there was no automated coverage beyond the production build

Invariants affected:
- ConceptNode schema: unchanged
- Prompt templates: unchanged
- API key handling: unchanged
- `graphStore` remains the single source of truth
- No new dependencies were added

<!-- CODEX_REPORT_END -->

---

## Step 3: Review (Claude Code)

_Claude Code writes below this line. Do not delete._

<!-- CLAUDE_CODE_REVIEW_START -->

### Architectural Review — 2026-04-05

**Build status:** Clean (`npx vite build` passes, 552 modules, no warnings).

---

#### What was done well

1. **`ClaudeServiceError` class** (`claudeService.js:9-15`) — Clean implementation. Sets `this.name` for stack traces, types cover all failure modes (auth/network/rate_limit/api/parse). The `fetch()` try/catch on lines 30-50 correctly isolates network errors from HTTP errors. The 429 check on line 55 fires before the generic API error on line 62 — correct ordering.

2. **Store changes** (`graphStore.js:11,66`) — `isGenerating` is additive. Included in `initialState` so `resetGraph` clears it. `setIsGenerating` is a simple setter — no over-engineering. Does not interfere with the existing `status` field.

3. **`finally` block** (`useGraphActions.js:71-73`) — Correct. `isGenerating` is always cleared regardless of success or failure. No state leak.

4. **ErrorBanner retry** (`ErrorBanner.jsx:8-12`, `App.jsx:44`) — `onRetry` is optional, only passed when `topic` is truthy. Retry button uses `primaryButton` style for visual hierarchy. Good.

5. **StatusBar** (`StatusBar.jsx`) — Clean label mapping. Node count only shows on success. Pluralization handled.

6. **Skeleton animation** (`nodes.module.css:91-118`) — Pulse keyframes, staggered delays, varied widths. Matches the plan exactly.

7. **`.errorBannerActions`** (`layout.module.css:177-181`) — Small but necessary addition to lay out the Retry + Dismiss buttons horizontally.

---

#### Issues found

**[BUG] Double-submit race condition — changes requested**

If the user clicks Retry (or somehow submits again) while a request is already in-flight, two concurrent `generateGraph` calls will race. The sequence:

1. Call 1: `setIsGenerating(true)` → fetch starts
2. Call 2: `setIsGenerating(true)` → fetch starts
3. Call 1 resolves → `finally` sets `isGenerating(false)` — **UI shows graph/empty state while Call 2 is still in-flight**
4. Call 2 resolves → `setGraph()` overwrites with potentially different data

The TopicInput `disabled` prop prevents double-submit from the form, but the Retry button on ErrorBanner is **not disabled during generation**. The error banner is only hidden when `error` is falsy — but `clearError()` at the top of `generateGraph` removes the error, which hides the banner, so the Retry button actually disappears. So in practice the race is unlikely via the UI. However, adding an early return guard is still the correct defensive fix:

**Fix for `useGraphActions.js`:** Add at the top of `generateGraph`:
```js
if (useGraphStore.getState().isGenerating) return;
```

This is a one-line fix. The store's `getState()` is synchronous and gives the authoritative value.

**[MINOR] Sidebar support text is stale**

`Sidebar.jsx:10` still says "The scaffold currently loads demo nodes for the chosen topic." — this was true when we had hardcoded data. Now it calls the Claude API. The text should say something like "Enter a subject to generate a concept graph with Claude."

This is cosmetic but worth fixing since it's user-facing and confusing.

**[MINOR] Reset button not disabled during generation**

`Sidebar.jsx:31` — the Reset button has no `disabled` prop. If the user clicks Reset while `isGenerating` is true, `resetGraph` clears all state (including `isGenerating: false` via `initialState` spread), but the in-flight API call will still resolve and call `setGraph()` / `setStatus()` after the reset. The early-return guard above would also fix this (the second call never starts), but Reset during generation is a separate path — the in-flight request will still complete and write to the store after reset.

Fix: either disable the Reset button while `isLoading`, or have `generateGraph` check that `topic` hasn't been cleared before calling `setGraph`.

---

#### Verdict summary

The implementation is architecturally sound and follows the plan closely. The `ClaudeServiceError` class, store changes, skeleton UI, retry wiring, and StatusBar are all correct. Two actionable issues:

1. **Required:** Add early-return guard in `generateGraph` when `isGenerating` is already true (1 line)
2. **Recommended:** Disable Reset button during generation or guard against stale completions
3. **Recommended:** Update stale support text in Sidebar

<!-- CLAUDE_CODE_REVIEW_END -->

### Verdict

- [ ] Approved for merge
- [x] Changes requested (see notes above)
- [ ] Rejected (see notes above)

---

## Step 4: Bug Hunt (Codex)

_Codex writes below this line. Do not delete._

<!-- CODEX_BUGHUNT_START -->

Follow-up fixes applied for the Step 3 review issues.

Files changed:
- `src/hooks/useGraphActions.js`
- `src/components/layout/Sidebar.jsx`

What changed and why:
- Added a synchronous early-return guard at the top of `generateGraph()`:
  - `if (useGraphStore.getState().isGenerating) return;`
  - This prevents re-entrant graph generation calls from racing if the action is triggered again while a request is already in flight.
- Updated the sidebar support text so it reflects the real Claude-powered generation flow instead of the old demo-node scaffold copy.
- Disabled the Reset button while `isLoading` is true so the user cannot clear the graph mid-request and then have the in-flight response repopulate the store after reset.

Verification run:
- `npm run build` — passed cleanly
- `npm run dev` — boot confirmed after starting Vite with escalated permissions because sandbox port binding on `::1:5173` is blocked in this environment

Behavior confirmed:
- Generate double-click protection is now enforced in two places:
  - `TopicInput` disables the Generate button while loading
  - `generateGraph()` now no-ops if `isGenerating` is already true
- Reset is disabled during generation via `disabled={isLoading}` in `Sidebar`
- Sidebar text now accurately describes Claude-based graph generation and no longer mentions demo nodes

Risks / open questions:
- I could not perform an actual browser click-through from the terminal environment, so the double-click and disabled-button behavior is confirmed from the running app startup plus direct code-path inspection rather than interactive browser automation
- Reset is prevented at the UI layer only in this pass; no request cancellation or stale-response invalidation was added

Invariants preserved:
- ConceptNode data model unchanged
- Prompt templates unchanged
- API key handling unchanged
- No new dependencies added
- `graphStore` remains the single source of truth

<!-- CODEX_BUGHUNT_END -->

---

## Final Decision

- [x] All steps passed -- merge
- [ ] Needs another round (update status to "planning" and repeat)

**Merged by:** Claude Code / 2026-04-05
**Notes:**
- Follow-up for Session 2: Add request cancellation via AbortController so that Reset during generation can abort the in-flight fetch rather than just disabling the button. Current fix is UI-layer only.
- Follow-up: Consider adding a toast/snackbar for transient status messages instead of relying solely on ErrorBanner for errors and StatusBar for state.
- No test coverage exists yet — graph state management tests (per CLAUDE.md priorities) should be the next Codex task.
