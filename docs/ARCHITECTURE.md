# Architecture -- Zhu Academy

## System overview

```
User Input (topic)
    |
    v
Claude API (generateConceptGraph prompt)
    |
    v
Zustand Store (graphStore) <---> localStorage (persistence)
    |
    v
Dagre Layout (layoutGraph utility)
    |
    v
React Flow Canvas (renders nodes + edges)
    |
    v
User clicks node --> Claude API (expandNode) --> store update --> re-layout --> re-render
```

## Component tree

```
App
  TopBar
    TopicInput              # text input + "Generate" button
    ReviewButton            # filters graph to mastery < 0.7
    ThemeToggle             # dark/light mode
  GraphCanvas               # React Flow wrapper, full viewport
    ConceptNode             # primary node: label, description, expand button
    FormulaNode             # formula hidden by default, reveal on click
    PracticeNode            # question, answer input, scoring
    ReviewNode              # weak concepts with mistake history
    NodeSkeleton            # loading placeholder during API calls
  Sidebar                   # collapsible, detail for selected node
    NodeDetail              # full description, connections list
    PracticePanel           # practice problems for selected node
    MistakeLog              # user-pinned mistakes
  StatusBar                 # bottom bar: node count, mastery average, API status
```

## Data flow

### Graph generation (initial)

1. User types topic in TopicInput, hits Enter
2. TopicInput calls `claudeService.generateConceptGraph(topic)`
3. Claude returns JSON: array of ConceptNode objects with connections
4. `graphStore.setGraph(nodes, edges)` updates Zustand store
5. `layoutGraph(nodes, edges)` runs dagre for x,y positions
6. React Flow re-renders

### Node expansion

1. User clicks expand on ConceptNode
2. Component calls `graphStore.expandNode(nodeId)`
3. Store sets `node.expanded = true`, `isLoading = true`
4. `claudeService.expandNode(node, parentContext)` calls Claude
5. Claude returns child ConceptNodes
6. Store merges new nodes + edges
7. `layoutGraph()` recalculates all positions
8. React Flow re-renders

### Practice flow

1. User clicks "Practice" on a node
2. Node switches to PracticeNode display
3. Problems were pre-generated at expand time
4. User types answer, submits
5. `claudeService.assessAnswer(question, userAnswer)` evaluates
6. Store updates `node.mastery`
7. Node color updates

### Mastery tracking

- Float 0.0 to 1.0 per node, starts at 0.0
- Correct answer: `min(1.0, mastery + 0.2)`
- Wrong answer: `max(0.0, mastery - 0.1)`
- Color scale: red (0.0) -> yellow (0.5) -> green (1.0)
- Review mode: nodes with mastery < 0.7

### Persistence

- graphStore debounce-writes to localStorage on changes
- Key: `zhuacademy_${topicSlug}`
- On load: check for saved graph, offer to resume
- All state persists: mastery, expanded, mistakes, practice history

## Folder structure

```
zhu_academy/
  CLAUDE.md                       # Claude Code auto-config
  AGENTS.md                       # Codex auto-config
  README.md
  .env.local                      # VITE_CLAUDE_API_KEY (never commit)
  .env.example                    # template
  .gitignore
  package.json
  vite.config.js
  index.html
  docs/
    ARCHITECTURE.md               # this file
    tasks/
      TEMPLATE.md                 # task file template
      active/                     # current tasks (shared dialog files)
        TASK-001-description.md
        TASK-002-description.md
      done/                       # completed tasks (archive)
  prompts/
    workflow/                     # human-facing workflow prompts
      plan.md                     # prompt for Claude Code planning step
      implement.md                # prompt for Codex implementation step
      review.md                   # prompt for Claude Code review step
      bug-hunt.md                 # prompt for Codex adversarial review
  src/
    main.jsx
    App.jsx
    components/
      nodes/
        ConceptNode.jsx
        FormulaNode.jsx
        PracticeNode.jsx
        ReviewNode.jsx
        NodeSkeleton.jsx
      ui/
        TopicInput.jsx
        ReviewButton.jsx
        ThemeToggle.jsx
        ErrorBanner.jsx
        StatusBar.jsx
      layout/
        TopBar.jsx
        Sidebar.jsx
        GraphCanvas.jsx
    store/
      graphStore.js               # Zustand, single source of truth
    services/
      claudeService.js            # all Claude API calls
      storageService.js           # localStorage read/write
    prompts/
      generateConceptGraph.js     # initial graph generation
      expandNode.js               # node expansion
      generatePractice.js         # practice problem generation
      assessAnswer.js             # answer evaluation
    utils/
      layoutGraph.js              # dagre layout
      masteryColor.js             # score to color mapping
      slugify.js                  # topic to storage key
    hooks/
      useGraphActions.js
      useKeyboardShortcuts.js
    styles/
      global.css
      nodes.module.css
      layout.module.css
```

## Design decisions

| Decision | Choice | Why |
|----------|--------|-----|
| State management | Zustand | Lightweight, no boilerplate, works with React Flow |
| Graph library | React Flow | Purpose-built for interactive node UIs |
| Layout engine | Dagre | Automatic directed graph layout |
| API architecture | Direct frontend calls | No backend for MVP |
| Persistence | localStorage | No accounts for MVP |
| Styling | CSS Modules | Scoped by default |
| Node expansion | Lazy (on click) | Don't waste API calls on unexplored nodes |
| Practice generation | At expand time | Feels instant when user clicks |
| Tool communication | Shared task files | No copy-paste between Claude Code and Codex |

## API call budget

Per 30-minute session (1 topic, 3 levels deep):
- ~1 initial + ~8 expansions + ~5 assessments = ~14 calls
- Cheap at Sonnet pricing

## Invariants (never change silently)

1. ConceptNode schema -- breaks localStorage and every component
2. graphStore is single source of truth -- no component-local graph state
3. claudeService.js is the only Claude API touchpoint
4. Prompt templates in src/prompts/ are manually tuned
5. localStorage key format `zhuacademy_${slug}` -- changing orphans data
6. Task files are append-only -- tools never delete each other's output