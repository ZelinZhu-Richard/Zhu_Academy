# Plan prompt -- say this to Claude Code

Create a task file from docs/tasks/TEMPLATE.md for this task:

[DESCRIBE YOUR TASK HERE]

Name it TASK-[NUMBER]-[short-description].md and put it in docs/tasks/active/.

In the Description section, write what needs to happen.

In the Step 1: Plan section, write:
1. Architecture summary relevant to this task
2. Files that will be affected
3. Invariants that must not break
4. Edge cases and hidden risks
5. The smallest correct implementation plan
6. Exact tests to run after the change

Set status to "implementing" when done.

If my intended approach is weak, say so and suggest a better path.