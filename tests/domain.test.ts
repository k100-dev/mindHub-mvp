import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openDatabase } from '../src/db.ts';
import { MindHub, validatePatient, validateStart } from '../src/domain.ts';
import { Worker } from 'node:worker_threads';

const patientInput = {name:'Ana Sintética', email:'ana@example.invalid', phone:'43999990001',birth_date:'1995-01-01'};
function fixture(path=':memory:') {
  const db=openDatabase(path);
  for (const id of ['a','b']) db.prepare('INSERT OR IGNORE INTO professionals(id,name,email,password_hash) VALUES (?,?,?,?)').run(id,`Prof ${id}`,`${id}@example.invalid`,'not-a-login');
  return {db,service:new MindHub(db)};
}
test('T01 UC01 cadastro, pesquisa sem acento, edição, inativação, reativação e auditoria',()=>{
  const {db,service:s}=fixture();
  const p=s.savePatient('a',patientInput);
  assert.equal(s.patients('a','sintetica')[0].id,p.id);
  assert.equal(s.savePatient('a',{...patientInput,name:'Ana Atualizada'},p.id).name,'Ana Atualizada');
  assert.equal(s.setPatientStatus('a',p.id,'INATIVO').status,'INATIVO');
  assert.equal(s.setPatientStatus('a',p.id,'ATIVO').status,'ATIVO');
  assert.equal(s.history('a','patient',p.id).length,4);
  assert.throws(()=>db.prepare('DELETE FROM patients WHERE id=?').run(p.id),/LOGICAL_DELETE_ONLY/);
  db.close();
});
test('T02 rejeita entradas inválidas, datas inexistentes, passadas e e-mail duplicado',()=>{
  for (const input of [{...patientInput,name:' A '},{...patientInput,email:'x'},{...patientInput,phone:'123'},{...patientInput,birth_date:'2025-02-30'},{...patientInput,birth_date:'2999-01-01'}]) assert.throws(()=>validatePatient(input));
  for (const start of ['2099-02-30T10:00','2099-01-01T24:00','2099-01-01T10:70','2020-01-01T10:00','abc']) assert.throws(()=>validateStart(start));
  const {db,service:s}=fixture(); s.savePatient('a',patientInput);
  assert.throws(()=>s.savePatient('a',patientInput),/E-mail já cadastrado/);
  db.close();
});
test('T03 isolamento de leitura, mutações, FK composta e conflito por profissional',()=>{
  const {db,service:s}=fixture(); const p=s.savePatient('a',patientInput);
  assert.equal(s.patients('b').length,0);
  assert.throws(()=>s.patient('b',p.id),/não encontrado/);
  assert.throws(()=>s.savePatient('b',patientInput,p.id),/não encontrado/);
  assert.throws(()=>s.setPatientStatus('b',p.id,'INATIVO'),/não encontrado/);
  assert.throws(()=>s.saveAppointment('b',{patient_id:p.id,starts_at:'2099-01-05T09:00'}),/não encontrado/);
  assert.throws(()=>db.prepare("INSERT INTO appointments(id,professional_id,patient_id,starts_at,ends_at) VALUES ('bad','b',?,'2099-01-05T12:00:00.000Z','2099-01-05T13:00:00.000Z')").run(p.id),/FOREIGN KEY/);
  const a=s.saveAppointment('a',{patient_id:p.id,starts_at:'2099-01-05T09:00'});
  assert.throws(()=>s.appointment('b',a.id),/não encontrado/);
  assert.throws(()=>s.cancelAppointment('b',a.id),/não encontrado/);
  assert.throws(()=>s.saveAppointment('b',{starts_at:'2099-01-05T11:00'},a.id),/não encontrado/);
  const pb=s.savePatient('b',patientInput);
  assert.ok(s.saveAppointment('b',{patient_id:pb.id,starts_at:'2099-01-05T09:00'}));
  db.close();
});
test('T04 UC02 conflito atômico, adjacência, remarcação e cancelamento terminal',()=>{
  const {db,service:s}=fixture();const p=s.savePatient('a',patientInput);
  const a=s.saveAppointment('a',{patient_id:p.id,starts_at:'2099-01-05T09:00'});
  const count=s.history('a','appointment',a.id).length;
  for (const start of ['2099-01-05T09:00','2099-01-05T09:30','2099-01-05T08:30']) assert.throws(()=>s.saveAppointment('a',{patient_id:p.id,starts_at:start}),/Conflito/);
  const b=s.saveAppointment('a',{patient_id:p.id,starts_at:'2099-01-05T10:00'});
  assert.throws(()=>s.saveAppointment('a',{starts_at:'2099-01-05T10:00'},a.id),/Conflito/);
  assert.equal(s.appointment('a',a.id).starts_at,a.starts_at);
  assert.equal(s.history('a','appointment',a.id).length,count);
  const moved=s.saveAppointment('a',{starts_at:'2099-01-06T09:00'},a.id);
  assert.equal(moved.id,a.id);
  assert.equal(s.cancelAppointment('a',a.id).status,'CANCELADO');
  assert.throws(()=>s.saveAppointment('a',{starts_at:'2099-01-07T09:00'},a.id),/cancelado/);
  assert.throws(()=>s.cancelAppointment('a',a.id),/já cancelado/);
  assert.ok(s.saveAppointment('a',{patient_id:p.id,starts_at:'2099-01-06T09:00'}));
  assert.equal(s.appointment('a',b.id).status,'AGENDADO');
  assert.throws(()=>db.prepare('DELETE FROM appointments WHERE id=?').run(a.id),/LOGICAL_DELETE_ONLY/);
  db.close();
});
test('T05 inativação preserva agenda e bloqueia criação e remarcação, permite cancelar',()=>{
  const {db,service:s}=fixture();const p=s.savePatient('a',patientInput);
  const a=s.saveAppointment('a',{patient_id:p.id,starts_at:'2099-01-05T09:00'});
  s.setPatientStatus('a',p.id,'INATIVO');
  assert.equal(s.appointments('a').length,1);
  assert.throws(()=>s.saveAppointment('a',{patient_id:p.id,starts_at:'2099-01-06T09:00'}),/Reative/);
  assert.throws(()=>s.saveAppointment('a',{starts_at:'2099-01-06T09:00'},a.id),/Reative/);
  assert.equal(s.cancelAppointment('a',a.id).status,'CANCELADO'); db.close();
});
test('T06 persistência após fechamento, migração idempotente e integridade SQLite',()=>{
  const dir=mkdtempSync(join(tmpdir(),'mindhub-test-'));const path=join(dir,'test.sqlite');
  try {
    const first=fixture(path);const p=first.service.savePatient('a',patientInput);
    const a=first.service.saveAppointment('a',{patient_id:p.id,starts_at:'2099-01-05T09:00'});first.db.close();
    const second=fixture(path);
    assert.equal(second.service.patient('a',p.id).email,patientInput.email);
    assert.equal(second.service.appointment('a',a.id).status,'AGENDADO');
    assert.equal(second.db.prepare('SELECT COUNT(*) n FROM schema_migrations').get()!.n,1);
    assert.deepEqual(second.db.prepare('PRAGMA foreign_key_check').all(),[]);
    assert.equal(second.db.prepare('PRAGMA integrity_check').get()!.integrity_check,'ok');second.db.close();
  } finally {rmSync(dir,{recursive:true,force:true});}
});
test('T07 duas conexões não inserem intervalos sobrepostos',()=>{
  const dir=mkdtempSync(join(tmpdir(),'mindhub-race-')); const path=join(dir,'db.sqlite');
  try {
    const first=fixture(path);const p=first.service.savePatient('a',patientInput);const second=fixture(path);
    first.service.saveAppointment('a',{patient_id:p.id,starts_at:'2099-01-05T09:00'});
    assert.throws(()=>second.service.saveAppointment('a',{patient_id:p.id,starts_at:'2099-01-05T09:30'}),/Conflito/);
    first.db.close(); second.db.close();
  } finally {rmSync(dir,{recursive:true,force:true});}
});
test('T10 concorrência real com dois workers: exatamente uma reserva e um conflito',async()=>{
  const dir=mkdtempSync(join(tmpdir(),'mindhub-workers-'));const path=join(dir,'db.sqlite');
  const workers: Worker[]=[];
  try {
    const {db,service}=fixture(path);const patient=service.savePatient('a',patientInput).id;
    const ready: Promise<unknown>[]=[];
    for(let i=0;i<2;i++) {const worker=new Worker(new URL('./concurrent-worker.ts',import.meta.url),{workerData:{path,patient}});workers.push(worker);ready.push(new Promise((r,j)=>{worker.once('message',r);worker.once('error',j);}));}
    await Promise.all(ready);
    const complete=workers.map(w=>new Promise<string>((r,j)=>{w.once('message',r);w.once('error',j);}));
    for(const w of workers)w.postMessage('go');
    const outcomes=await Promise.all(complete);
    assert.equal(outcomes.filter(x=>x==='created').length,1);
    assert.equal(outcomes.filter(x=>x.includes('Conflito')).length,1);
    assert.equal(service.appointments('a').length,1);
    assert.equal(db.prepare("SELECT count(*) n FROM events WHERE entity='appointment'").get()!.n,1);db.close();
  } finally {await Promise.all(workers.map(w=>w.terminate()));rmSync(dir,{recursive:true,force:true});}
});
