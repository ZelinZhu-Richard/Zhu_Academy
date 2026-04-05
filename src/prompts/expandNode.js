export function buildExpandNodePrompt(topic, nodeTitle) {
  return `Expand the learning node "${nodeTitle}" inside the study topic "${topic}".

Return JSON with:
- child nodes
- suggested formulas
- a brief explanation of how the child nodes connect to the parent`;
}
