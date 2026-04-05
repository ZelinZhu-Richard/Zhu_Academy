# Bug-hunt prompt -- say this to Codex

Read the task file at docs/tasks/active/TASK-[NUMBER]-[description].md

Read all steps (plan, implementation, review) and the actual changed files.

Write your findings in Step 4. Try to break this before merge.

Find:
1. Edge case bugs
2. Backward compatibility issues (localStorage, component APIs)
3. Race conditions or async hazards
4. Null / empty / malformed input failures
5. Test blind spots
6. Environment assumptions
7. State management inconsistencies

Do not praise the code. Focus only on what could fail.

Do not delete or overwrite anything in Steps 1, 2, or 3.