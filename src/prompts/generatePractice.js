export function buildGeneratePracticePrompt(topic, nodeTitle) {
  return `Generate a short practice set for "${nodeTitle}" within "${topic}".

Return JSON with:
- one warmup question
- one medium question
- one challenge question
- an answer key`;
}
