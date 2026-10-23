import { openDatabase } from '../src/db.ts';
const db = openDatabase();
console.log('Migrações aplicadas:', db.prepare('SELECT * FROM schema_migrations').all());
db.close();
