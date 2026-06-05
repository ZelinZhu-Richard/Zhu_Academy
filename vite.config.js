import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { handleClaudeProxyRequest } from './api/claude.js';

function claudeDevProxy(apiKey) {
  return {
    name: 'claude-dev-proxy',
    configureServer(server) {
      server.middlewares.use('/api/claude', (req, res) => {
        handleClaudeProxyRequest(req, res, { apiKey });
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), claudeDevProxy(env.ANTHROPIC_API_KEY)],
  };
});
