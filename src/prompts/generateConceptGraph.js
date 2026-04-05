export function buildGenerateConceptGraphPrompt(topic) {
  return `Create a concise concept graph for the study topic "${topic}".

Return JSON with:
- nodes: array of 4-8 items
- each node has id, type, title, description, mastery, and optional formula
- types should be drawn from concept, formula, practice, review
- include logical dependencies between nodes when relevant`;
}
