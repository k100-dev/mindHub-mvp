import js from '@eslint/js';
import ts from 'typescript-eslint';
export default ts.config(
  { ignores: ['dist/**', 'node_modules/**', '.referencia-original/**', 'data/**'] },
  js.configs.recommended, ...ts.configs.recommended,
  { languageOptions: { globals: { process: 'readonly', console: 'readonly', Buffer: 'readonly', URL: 'readonly', URLSearchParams: 'readonly', WebSocket: 'readonly', setTimeout: 'readonly', clearTimeout: 'readonly', fetch: 'readonly' } } },
);
