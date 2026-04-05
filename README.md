# Zhu Academy

AI-powered explorable knowledge graph for learning. Type a subject, get a concept network, click to go deeper, test yourself, track mastery.

## Setup

```bash
git clone <your-repo-url>
cd zhu_academy
npm install
cp .env.example .env.local
# Add your Claude API key to .env.local
npm run dev
```

## Development workflow

This project uses a Claude Code + Codex loop with shared task files for communication.

### The loop

1. **Plan** (Claude Code) -- tell it to create a task file and plan the work. It writes the plan to `docs/tasks/active/TASK-XXX.md`.

2. **Implement** (Codex) -- tell it to read the task file and implement. It reads the plan, writes its changes and report back to the same file.

3. **Review** (Claude Code) -- tell it to read the task file. It reads Codex's report, reviews the code, writes its verdict back to the file.

4. **Bug-hunt** (Codex) -- tell it to read the task file and try to break the code. It reads everything, writes what could fail.

5. **Merge** when all steps pass. Move the task file to `docs/tasks/done/`.

### Why task files?

No copy-pasting between tools. Both tools read from and write to the same file. You can see the full conversation -- plan, implementation, review, bug report -- in one place.

### Reference prompts

See `prompts/workflow/` for the exact prompts to use at each step.

### Config files

| File | Read by | Purpose |
|------|---------|---------|
| `CLAUDE.md` | Claude Code (auto) | Project context, architecture, role |
| `AGENTS.md` | Codex (auto) | Execution rules, patterns, constraints |
| `docs/ARCHITECTURE.md` | Both (referenced) | Data flow, components, decisions |
| `docs/tasks/TEMPLATE.md` | Both | Task file template |
| `prompts/workflow/*.md` | You | Prompts for each loop step |

## Tech stack

- React 18+ (Vite)
- React Flow + Dagre
- Zustand (state)
- Claude API (Sonnet)
- localStorage (persistence)