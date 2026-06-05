const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

function getHeader(req, name) {
  if (typeof req.headers?.get === 'function') {
    return req.headers.get(name);
  }

  return req.headers?.[name.toLowerCase()] ?? req.headers?.[name];
}

async function readRequestBody(req) {
  if (req.body) {
    if (Buffer.isBuffer(req.body)) {
      return JSON.parse(req.body.toString('utf8'));
    }

    return typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  }

  const chunks = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const rawBody = Buffer.concat(chunks).toString('utf8');
  return rawBody ? JSON.parse(rawBody) : {};
}

function sendText(res, statusCode, text) {
  res.statusCode = statusCode;
  res.setHeader('content-type', 'text/plain; charset=utf-8');
  res.end(text);
}

function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

function validateClaudePayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return 'Request body must be a JSON object.';
  }

  if (!Array.isArray(payload.messages)) {
    return 'Request body must include a messages array.';
  }

  if (typeof payload.model !== 'string' || payload.model.trim() === '') {
    return 'Request body must include a model.';
  }

  if (typeof payload.max_tokens !== 'number') {
    return 'Request body must include max_tokens.';
  }

  return null;
}

export async function handleClaudeProxyRequest(req, res, options = {}) {
  if (req.method !== 'POST') {
    sendText(res, 405, 'Method not allowed.');
    return;
  }

  const contentType = getHeader(req, 'content-type') ?? '';

  if (!contentType.includes('application/json')) {
    sendText(res, 415, 'Content-Type must be application/json.');
    return;
  }

  const apiKey = options.apiKey ?? process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    sendText(res, 500, 'Missing ANTHROPIC_API_KEY on the server.');
    return;
  }

  let payload;

  try {
    payload = await readRequestBody(req);
  } catch (error) {
    console.error('[api.claude.readRequestBody]', error);
    sendText(res, 400, 'Request body must be valid JSON.');
    return;
  }

  const validationError = validateClaudePayload(payload);

  if (validationError) {
    sendText(res, 400, validationError);
    return;
  }

  let claudeResponse;
  let responseText;

  try {
    claudeResponse = await fetch(ANTHROPIC_API_URL, {
      body: JSON.stringify(payload),
      headers: {
        'anthropic-version': ANTHROPIC_VERSION,
        'content-type': 'application/json',
        'x-api-key': apiKey,
      },
      method: 'POST',
    });

    responseText = await claudeResponse.text();
  } catch (error) {
    console.error('[api.claude.fetch]', error);
    sendText(res, 502, 'Could not reach Claude API.');
    return;
  }

  if (!claudeResponse.ok) {
    sendText(res, claudeResponse.status, responseText);
    return;
  }

  try {
    sendJson(res, 200, JSON.parse(responseText));
  } catch (error) {
    console.error('[api.claude.parseResponse]', error);
    sendText(res, 502, 'Claude API returned invalid JSON.');
  }
}

export default handleClaudeProxyRequest;
