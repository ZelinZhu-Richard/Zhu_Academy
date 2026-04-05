export function buildAssessAnswerPrompt(question, answer) {
  return `Assess the learner answer below and provide structured feedback.

Question:
${question}

Answer:
${answer}

Return JSON with:
- score from 0 to 1
- what was correct
- what needs improvement
- next best review action`;
}
