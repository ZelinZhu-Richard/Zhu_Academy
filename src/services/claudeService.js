import { buildAssessAnswerPrompt } from '../prompts/assessAnswer';
import { buildExpandNodePrompt } from '../prompts/expandNode';
import { buildGenerateConceptGraphPrompt } from '../prompts/generateConceptGraph';
import { buildGeneratePracticePrompt } from '../prompts/generatePractice';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const DEFAULT_MODEL = 'claude-3-5-sonnet-latest';

export class ClaudeServiceError extends Error {
  constructor(type, message) {
    super(message);
    this.name = 'ClaudeServiceError';
    this.type = type;
  }
}

function getApiKey() {
  return import.meta.env.VITE_CLAUDE_API_KEY?.trim();
}

async function callClaude(prompt) {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new ClaudeServiceError('auth', 'Missing VITE_CLAUDE_API_KEY in .env.local');
  }

  let response;

  try {
    response = await fetch(CLAUDE_API_URL, {
      body: JSON.stringify({
        max_tokens: 4096,
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
  } catch (error) {
    console.error('[claudeService.callClaude]', error);
    throw new ClaudeServiceError(
      'network',
      'Network error: could not reach Claude API. Check your connection.'
    );
  }

  if (!response.ok) {
    const errorText = await response.text();

    if (response.status === 429) {
      throw new ClaudeServiceError(
        'rate_limit',
        'Rate limited by Claude API. Wait a moment and try again.'
      );
    }

    throw new ClaudeServiceError('api', `Claude API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.content?.map((item) => item.text).join('\n').trim() ?? '';
}

function parseClaudeJSON(text) {
  let cleaned = text.trim();
  // Strip markdown code fences if Claude wraps the JSON despite instructions
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
  }
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.error('[claudeService.parseClaudeJSON]', e);
    throw new ClaudeServiceError('parse', `Failed to parse Claude response as JSON: ${e.message}`);
  }
}

export async function requestConceptGraphParsed(topic, difficulty = 'intermediate') {
  const raw = await callClaude(buildGenerateConceptGraphPrompt(topic, difficulty));
  return parseClaudeJSON(raw);
}

export function requestConceptGraph(topic, difficulty = 'intermediate') {
  return callClaude(buildGenerateConceptGraphPrompt(topic, difficulty));
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
