# AGENTS.md -- Codex Task Configuration

## Mission

Make correct, minimal, maintainable changes that fit the current architecture. Do not make flashy changes that increase complexity without a clear payoff.

## Project context

Zhu Academy is a React-based interactive knowledge graph learning tool. Users type a subject, get an AI-generated concept network via React Flow, click nodes to expand deeper, and track mastery through practice problems and formula recall.

Stack: React 18+ (Vite), React Flow, Dagre, Zustand, Claude API (Sonnet), localStorage.

Full architecture: `docs/ARCHITECTURE.md`
Data model and phases: `CLAUDE.md`

## Your role

You execute well-scoped, clearly specified tasks. Every task will reference existing patterns in the codebase. Follow those patterns exactly.

You are also used as a hostile reviewer (bug-hunt tasks). When asked to break something, be thorough and adversarial.

## Task file system (how you communicate with Claude Code)

This project uses shared task files so you and Claude Code can communicate without the developer copy-pasting between tools.

### How it works

- Active tasks: `docs/tasks/active/`
- Completed tasks: `docs/tasks/done/`
- Each task has its own file with sections for each workflow step

### Your responsibilities with task files

**When implementing (Step 2):**
1. Open the task file in `docs/tasks/active/`
2. Read the plan in `## Step 1: Plan` -- this is your spec
3. Write your pre-flight check in `## Step 2: Implement > Pre-flight`
4. After implementing, write what you changed in `## Step 2: Implement > Changes made`
5. Write your post-change report in `## Step 2: Implement > Post-change report`
6. Update the task status to "reviewing"

**When bug-hunting (Step 4):**
1. Open the task file
2. Read ALL previous steps (plan, implementation, review)
3. Read the actual changed files / diff
4. Write your findings in `## Step 4: Bug Hunt`
5. Be adversarial -- only report what could fail

### Rules for task files
- NEVER delete or overwrite content written by Claude Code
- NEVER delete or overwrite content written by the developer
- Only write in YOUR designated sections (Step 2 and Step 4)
- If the plan in Step 1 is unclear or underspecified, write your questions in your Pre-flight section and STOP -- do not guess

## Before editing (mandatory pre-flight)

Whether or not there is a task file, always do these first:
1. Read the relevant files in full
2. Identify all affected modules
3. Identify invariants that must not break
4. State your implementation plan briefly (in the task file if one exists)
5. Confirm what tests should validate the change

Do not skip this. Do not jump to editing.

## Editing rules

- Make one coherent change at a time
- Prefer the smallest change that fully solves the problem
- Do not refactor unrelated code
- Do not rename files or symbols unless the task requires it
- Do not add dependencies without explicit approval
- Follow existing naming patterns and file structure
- Write code a tired human can understand quickly
- Leave comments only for non-obvious logic
- Prefer explicitness over cleverness

## Project-specific rules

1. **Do not modify the ConceptNode data model.** The schema in `src/store/graphStore.js` is the source of truth. If a task seems to require a schema change, flag it in the task file and STOP.

2. **Do not modify prompt templates.** Files in `src/prompts/` are tuned manually. Never edit them.

3. **Do not add a backend server.** Frontend-only MVP.

4. **Do not touch API key handling.** Key lives in `.env.local`, accessed via `import.meta.env.VITE_CLAUDE_API_KEY`.

5. **Do not invent new architectural patterns.** Follow what exists.

## File structure reference

```
src/
  components/
    nodes/            # Custom React Flow node components
    ui/               # Shared UI (buttons, inputs, skeletons)
    layout/           # Page layout components
  store/
    graphStore.js     # Zustand store, single source of truth
  services/
    claudeService.js  # All Claude API calls
    storageService.js # localStorage persistence
  prompts/            # Claude API prompt templates (DO NOT EDIT)
  utils/
    layoutGraph.js    # Dagre layout calculation
    masteryColor.js   # Mastery score to color
    slugify.js        # Topic to storage key
  hooks/              # Custom React hooks
  styles/             # CSS modules
```

## Testing

Commands:
- Install: `npm install`
- Dev server: `npm run dev`
- Lint: `npm run lint`
- Unit tests: `npm test`
- Build: `npm run build`

Rules:
- Test file next to source: `ComponentName.test.jsx`
- Mock `claudeService` -- never hit real APIs in tests
- Cover: happy path, empty state, error state, loading state
- Tests must pass before submitting

## Post-change report (mandatory)

Whether in a task file or standalone, always report:
1. Files changed
2. What changed and why
3. Tests run and results
4. Risks or open questions
5. Whether any invariants were affected

## Common task types

### Writing tests
- Use Vitest (or Jest if configured)
- Mock Claude API calls
- Test rendering, interactions, and edge cases
- Reference existing test files for patterns

### Adding error handling
- Wrap API calls in try/catch
- Use existing error UI components
- Log with context: `console.error('[claudeService.expandNode]', error)`
- Add loading states matching existing patterns

### Building node type variants
- Copy `ConceptNode.jsx` structure as template
- Register in `nodeTypes` object in main graph component
- Same CSS module naming conventions

### Bug-hunt / hostile review
- Find edge case bugs
- Find backward compatibility issues
- Find async hazards and race conditions
- Find null / empty / malformed input failures
- Find test blind spots
- Find environment assumptions
- Find state management inconsistencies
- Do NOT praise the code. Focus only on what can fail.

### Responsive design
- Mobile breakpoint: 768px
- React Flow canvas fills viewport minus header
- Panels collapse to bottom sheets on mobile

### Accessibility
- Keyboard support on all interactive elements
- aria-label with concept name and mastery on nodes
- Focus management after node expansion
- Color never the sole indicator

## Commit message format

```
type(scope): description

test(ConceptNode): add unit tests for expand interaction
fix(claudeService): add error handling to expandNode
feat(nodes): add FormulaNode following ConceptNode pattern
style(layout): responsive sidebar at 768px
docs(README): setup instructions
```

## Guardrails

Stop and flag in the task file instead of guessing if:
- Requirements conflict with ARCHITECTURE.md
- A change would affect the ConceptNode data model
- A change would affect API key handling or prompt templates
- Tests fail in a way suggesting unrelated instability
- The task depends on context you don't have

## Current priorities

- Optimize for correctness over speed
- Avoid adding dependencies beyond the core stack
- Preserve backward compatibility of localStorage schema
- Improve test coverage in touched areas