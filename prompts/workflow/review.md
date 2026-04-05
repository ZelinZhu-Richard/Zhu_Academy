# Review prompt -- say this to Claude Code

Read the task file at docs/tasks/active/TASK-[NUMBER]-[description].md

Codex's implementation is in Step 2. Also read the actual changed files.

Write your review in Step 3. Check for:
1. Architectural fit
2. Violations of AGENTS.md or CLAUDE.md rules
3. Hidden side effects beyond the stated scope
4. Missing edge cases
5. Missing or weak tests
6. Wrong design (works but solves the problem badly)

Check the appropriate verdict box. Be blunt.

Do not delete or overwrite anything in Steps 1 or 2.

Update the task status to "bug-hunting" if approved, or back to "implementing" if changes requested.