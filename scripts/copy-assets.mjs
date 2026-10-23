import { cpSync } from 'node:fs';
cpSync('src/styles.css','dist/styles.css');
console.log('Build TypeScript e CSS concluído. Migrações permanecem em migrations/.');
