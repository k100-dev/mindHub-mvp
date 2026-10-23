import { openDatabase } from '../src/db.ts';
import { hashPassword } from '../src/security.ts';
import { MindHub } from '../src/domain.ts';
const db = openDatabase();
const owner = 'prof-demo';
if (!db.prepare('SELECT id FROM professionals WHERE id=?').get(owner)) {
  db.prepare('INSERT INTO professionals(id,name,email,password_hash) VALUES (?,?,?,?)').run(owner,'Profissional Demonstração','demo@mindhub.test',hashPassword('DemoMindHub2026!'));
  const service = new MindHub(db);
  service.savePatient(owner,{ name: 'Ana Exemplo', email:'ana@example.invalid', phone:'43999990001',birth_date:'1995-05-20' });
  service.savePatient(owner,{ name: 'Bruno Fictício', email:'bruno@example.invalid', phone:'43999990002',birth_date:'1990-10-10' });
  console.log('Dados fictícios criados. Login local: demo@mindhub.test / DemoMindHub2026!');
} else console.log('Seed já aplicado; nenhum dado sobrescrito.');
db.close();
