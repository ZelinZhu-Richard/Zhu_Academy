# TASK-001: Implement topic input and initial graph generation

**Status:** done
**Created:** 2026-04-05
**Priority:** high

## Description

Build the TopicInput component and wire it to the Claude API so that when a user types a subject and hits Enter, a concept graph generates and renders on the React Flow canvas.

---

## Step 1: Plan (Claude Code)

_Claude Code writes below this line. Do not delete._

<!-- CLAUDE_CODE_PLAN_START -->

### Architecture context

This is the first real feature. It touches:
- `src/components/ui/TopicInput.jsx` (new)
- `src/components/layout/GraphCanvas.jsx` (new)
- `src/store/graphStore.js` (new -- Zustand store)
- `src/services/claudeService.js` (new -- API call)
- `src/prompts/generateConceptGraph.js` (new -- prompt template)
- `src/utils/layoutGraph.js` (new -- dagre layout)

### Invariants
- graphStore must be the single source of truth for all node/edge state
- claudeService must be the only file that calls the Claude API
- The prompt template must return valid JSON that maps to ConceptNode schema

### Risks
- Claude API may return malformed JSON -- need try/catch and validation
- Dagre layout may overlap nodes if the graph is dense -- need minimum spacing config
- React Flow needs nodeTypes registered before rendering custom nodes

### Implementation plan
1. Create graphStore with `setGraph`, `getNodes`, `getEdges` actions
2. Create generateConceptGraph prompt template
3. Create claudeService.generateConceptGraph function
4. Create TopicInput component (controlled input, Enter to submit)
5. Create GraphCanvas wrapping React Flow with nodeTypes registered
6. Create ConceptNode as a basic custom node (label + description)
7. Create layoutGraph utility with dagre
8. Wire it all: TopicInput -> claudeService -> graphStore -> layoutGraph -> GraphCanvas

### Tests to run
- graphStore: setGraph produces correct nodes/edges
- claudeService: mock API call, verify JSON parsing
- TopicInput: renders, fires on Enter, shows loading state

<!-- CLAUDE_CODE_PLAN_END -->

---

## Step 2: Implement (Codex)

_Codex writes below this line. Do not delete._

### Pre-flight
<!-- CODEX_PREFLIGHT_START -->

Reading the plan from Step 1. Eight files to create. Key invariants: graphStore is single source of truth, claudeService is only API touchpoint, prompt must return valid ConceptNode JSON.

I will implement in the order specified in the plan. I will NOT modify the prompt template beyond what's described. I will add try/catch to the API call with console.error logging.

Files I will create:
1. src/store/graphStore.js
2. src/prompts/generateConceptGraph.js
3. src/services/claudeService.js
4. src/components/ui/TopicInput.jsx
5. src/components/nodes/ConceptNode.jsx
6. src/utils/layoutGraph.js
7. src/components/layout/GraphCanvas.jsx
8. Updated src/App.jsx to compose them

<!-- CODEX_PREFLIGHT_END -->

### Changes made
<!-- CODEX_CHANGES_START -->

Created all 8 files as listed in pre-flight. Key decisions:
- graphStore uses Zustand with `setGraph`, `addNodes`, `getNodes`, `getEdges`
- claudeService wraps fetch in try/catch, validates response is array before passing to store
- TopicInput is a controlled input with loading state and disabled-during-fetch
- ConceptNode displays label and description, has "Expand" button (not yet wired)
- layoutGraph configures dagre with rankdir='TB', nodesep=80, ranksep=100
- GraphCanvas registers ConceptNode in nodeTypes, uses fitView on initial render

<!-- CODEX_CHANGES_END -->

### Post-change report
<!-- CODEX_REPORT_START -->

**Files changed:** 8 new files created, App.jsx modified
**Why:** Implements the initial topic-to-graph pipeline (Phase 1 / Phase 2 overlap)
**Tests run:** npm test -- 3 test files, all passing (graphStore, claudeService mock, TopicInput render)
**Risks:**
- The Claude API prompt has not been tested with diverse topics yet (only tested with "photosynthesis")
- Dagre spacing values (80/100) are guesses -- may need tuning for large graphs
- No error UI yet -- API failures only log to console

<!-- CODEX_REPORT_END -->

---

## Step 3: Review (Claude Code)

_Claude Code writes below this line. Do not delete._

<!-- CLAUDE_CODE_REVIEW_START -->

### Architectural fit
Good. Store is correctly the single source of truth. claudeService is properly isolated. Prompt template is a separate file. All patterns match ARCHITECTURE.md.

### Issues found
1. **Missing JSON validation**: claudeService checks `Array.isArray()` but doesn't validate individual nodes against ConceptNode schema. A malformed node (missing `id` or `label`) would silently enter the store and crash ConceptNode render. Add a `validateNode()` util.

2. **No loading indicator on canvas**: TopicInput shows loading, but the canvas is blank during generation. Add a centered "Generating your knowledge graph..." message in GraphCanvas when store has 0 nodes and isLoading is true.

3. **fitView timing**: fitView is called on mount, but nodes aren't positioned yet because layoutGraph runs after setGraph. Add a useEffect that calls fitView after nodes update, with a small delay for dagre to complete.

### Missing tests
- No test for malformed API response (what happens when Claude returns bad JSON?)
- No test for empty topic input (should not fire API call)

### Verdict
Changes requested -- fix the 3 issues above, then this is good to merge.

<!-- CLAUDE_CODE_REVIEW_END -->

### Verdict

- [ ] Approved for merge
- [x] Changes requested (see notes above)
- [ ] Rejected (see notes above)

---

## Step 4: Bug Hunt (Codex)

_Codex writes below this line. Do not delete._

<!-- CODEX_BUGHUNT_START -->

(Not yet run -- waiting for changes from review to be implemented first)

<!-- CODEX_BUGHUNT_END -->

---

## Final Decision

- [ ] All steps passed -- merge
- [ ] Needs another round (update status to "planning" and repeat)

**Merged by:**
**Notes:**