import { buildAssessAnswerPrompt } from '../prompts/assessAnswer';
import { buildExpandNodePrompt } from '../prompts/expandNode';
import { buildGenerateConceptGraphPrompt } from '../prompts/generateConceptGraph';
import { buildGeneratePracticePrompt } from '../prompts/generatePractice';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const DEFAULT_MODEL = 'claude-3-5-sonnet-latest';

function getApiKey() {
  return import.meta.env.VITE_CLAUDE_API_KEY?.trim();
}

async function callClaude(prompt) {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error('Missing VITE_CLAUDE_API_KEY in .env.local');
  }

  const response = await fetch(CLAUDE_API_URL, {
    body: JSON.stringify({
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
      model: DEFAULT_MODEL,
    }),
    headers: {
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'x-api-key': apiKey,
    },
    method: 'POST',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Claude request failed: ${errorText}`);
  }

  const data = await response.json();
  return data.content?.map((item) => item.text).join('\n').trim() ?? '';
}

export function requestConceptGraph(topic) {
  return callClaude(buildGenerateConceptGraphPrompt(topic));
}

export function requestNodeExpansion(topic, nodeTitle) {
  return callClaude(buildExpandNodePrompt(topic, nodeTitle));
}

export function requestPractice(topic, nodeTitle) {
  return callClaude(buildGeneratePracticePrompt(topic, nodeTitle));
}

export function requestAssessment(question, answer) {
  return callClaude(buildAssessAnswerPrompt(question, answer));
}
