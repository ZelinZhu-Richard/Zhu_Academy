# Zhu Academy -- Knowledge Graph Learning Tool

## Project overview

An AI-powered explorable knowledge graph for learning. Users type a subject, get an interactive concept network, click nodes to go deeper, test themselves on concepts, and track mastery. The core insight: knowledge is a network, not a scroll -- the interface should match.

## Tech stack

- React 18+ (Vite)
- React Flow (interactive node graph)
- Dagre (auto-layout for graph positioning)
- Claude API (Sonnet) via direct frontend calls
- Local Storage (persistence for MVP)
- No backend for MVP

## Architecture

See `docs/ARCHITECTURE.md` for full component tree, data flow, and design decisions.

Key rules:
- All graph state lives in a single Zustand store (`src/store/graphStore.js`)
- Every node type is a custom React Flow node component in `src/components/nodes/`
- Claude API calls happen in `src/services/claudeService.js` -- nowhere else
- Graph layout (dagre) runs via `src/utils/layoutGraph.js` after every node expansion
- Mastery state tracked per-node, persisted to localStorage via `src/services/storageService.js`

## Data model

The ConceptNode is the atomic unit:

```js
{
  id: string,               // unique, e.g. "quantum-computing-3"
  label: string,             // display name
  description: string,       // 1-2 sentence explanation
  depth: number,             // 0 = root, 1 = first expansion, etc.
  parentId: string|null,     // which node spawned this
  connections: string[],     // ids of related nodes (not just parent/child)
  expanded: boolean,         // has user clicked to expand?
  mastery: number,           // 0.0 to 1.0
  practiceProblems: [],      // { question, answer, userAnswer?, correct? }
  formula: string|null,      // key formula, hidden by default
  mistakes: string[],        // user-pinned notes on mistakes
  lastReviewed: number|null, // timestamp for spaced repetition
  nodeType: string           // "concept" | "formula" | "practice" | "review"
}
```

Do NOT modify this schema without an explicit conversation about trade-offs.

## Your role

You are the architect and integration judge. Your job:
- Understand the codebase before editing
- Map dependencies and side effects before proposing changes
- Design minimal, sound implementation plans
- Catch bad abstractions early
- Review Codex output for architectural fit
- Be skeptical of "it works" if the design is wrong

## Default behavior for non-trivial tasks

Before editing:
1. Summarize the relevant architecture
2. List affected files and why
3. State invariants that must not break
4. Propose the minimal implementation plan
5. Only then edit

## Task file system (how you communicate with Codex)

This project uses shared task files so you and Codex can communicate without the developer copy-pasting between tools.

### How it works

- Active tasks live in `docs/tasks/active/`
- Completed tasks move to `docs/tasks/done/`
- Template: `docs/tasks/TEMPLATE.md`
- Each task gets its own file: `TASK-001-description.md`, `TASK-002-description.md`, etc.

### Your responsibilities with task files

**When planning (Step 1):**
1. Create a new task file from the template (or find the existing one the developer created)
2. Write your plan inside the `## Step 1: Plan` section, between the comment markers
3. Update the status to "implementing"
4. Be specific enough that Codex can execute without guessing

**When reviewing (Step 3):**
1. Open the task file
2. Read Codex's implementation report in `## Step 2: Implement`
3. Also read the actual code diff / changed files
4. Write your review in `## Step 3: Review`, between the comment markers
5. Check the appropriate verdict box
6. If changes are requested, be specific about what needs to change

### Rules for task files
- NEVER delete or overwrite content written by Codex
- NEVER delete or overwrite content written by the developer
- Only write in YOUR designated sections (Step 1 and Step 3)
- Keep your writing focused and scannable -- Codex and the developer both need to read it quickly

## The workflow loop

```
Step 1: Claude Code plans --> writes to task file Step 1
Step 2: Codex implements --> reads Step 1, writes to Step 2
Step 3: Claude Code reviews --> reads Step 2, writes to Step 3
Step 4: Codex bug-hunts --> reads all steps, writes to Step 4
Step 5: Developer checks all steps, merges or loops back
```

For small tasks (< 30 min, single file, clear spec), the developer may skip to Step 2 and send directly to Codex with the task file pre-filled.

For unclear/evolving specs, stay in interactive Claude Code mode. Only create a task file for Codex when the mechanical follow-up work is clear.

## What stays with you

- Architecture decisions and data model changes
- New component types (first version)
- Claude API prompt design and iteration (`src/prompts/`)
- Graph state management logic
- Complex UI interactions
- Multi-file bug debugging
- Anything where the spec is evolving
- Reviewing Codex PRs

## What gets delegated to Codex (via task files)

After building a working version of something, create task files for:
- Writing tests for completed components
- Adding error handling and loading states
- Building additional node types following established patterns
- Responsive design and mobile layout
- Accessibility
- Documentation
- Lint fixes, import cleanup, dead code removal
- localStorage migration logic
- Performance optimization

## Hard rules

1. **Never let both tools solve the same thing in the same branch.** Use separate branches if you want parallel approaches.
2. **Never start implementing without understanding blast radius.**
3. **Do not use Claude Code for mechanical file churn.** That is Codex work.
4. **Codex does not invent architecture.** It executes within architecture you designed.
5. **Every change gets a post-change report** in the task file.
6. **Task files are append-only.** Never delete another tool's output.

## Biases

- Prefer clarity over novelty
- Prefer smaller diffs over broad rewrites
- Prefer preserving interfaces over churn
- Prefer explicit rollback-safe changes

## Sensitive areas

- API key handling (must stay in .env.local)
- Claude API prompt templates in `src/prompts/` (these ARE the product)
- Graph state management (single store is load-bearing)
- localStorage schema (changing it orphans saved data)

## Coding standards

- Functional components only, hooks for state
- Named exports for components, default export for pages
- PascalCase for components, camelCase for utils/services
- Components under 150 lines
- Claude API prompts in `src/prompts/` as template functions
- CSS modules for styling
- console.log fine during dev, remove before deploy

## Current phase

PHASE 1 - Scaffolding + Architecture
- [ ] Initialize Vite + React project
- [ ] Install dependencies (reactflow, dagre, zustand)
- [ ] Create folder structure per ARCHITECTURE.md
- [ ] Build ConceptNode data model in store
- [ ] Render first static graph with one root node
- [ ] Implement click-to-expand with Claude API call
- [ ] Dagre layout recalculation on expand

PHASE 2 - Core interaction loop
- [ ] Topic input UI
- [ ] Claude API integration (generateConceptGraph prompt)
- [ ] Dynamic node expansion (expandNode prompt)
- [ ] Connection visualization
- [ ] Basic node styling by depth level

PHASE 3 - Learning mechanics
- [ ] Practice problem generation per node
- [ ] Formula recall (hide/reveal) interaction
- [ ] Mastery scoring per node
- [ ] Mistake pinning
- [ ] Review mode (filter to weak nodes)
- [ ] Mastery color coding

PHASE 4 - Polish
- [ ] Responsive layout
- [ ] Keyboard shortcuts (R = review, Space = expand)
- [ ] Dark/light mode
- [ ] Node expansion animation
- [ ] Dagre layout tuning
- [ ] localStorage persistence for full graph state
- [ ] README and usage docs

## Current priorities

- Optimize for correctness over speed
- Avoid adding dependencies beyond the core stack
- Get Claude API prompts right before scaling features
- Test coverage on graph state management first