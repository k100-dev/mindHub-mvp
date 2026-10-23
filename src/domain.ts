import type { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';

export class AppError extends Error {
  status: number;
  constructor(message: string, status = 422) { super(message); this.status = status; }
}
export type Patient = { id: string; professional_id: string; name: string; email: string; phone: string; birth_date: string; status: 'ATIVO' | 'INATIVO'; created_at: string; updated_at: string };
export type Appointment = { id: string; professional_id: string; patient_id: string; starts_at: string; ends_at: string; status: 'AGENDADO' | 'CANCELADO'; created_at: string; updated_at: string; patient_name?: string };
export type Input = Record<string, string>;
const now = () => new Date().toISOString();

function calendarDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value;
}
export function validatePatient(input: Input) {
  const name = (input.name || '').trim();
  const email = (input.email || '').trim().toLowerCase();
  const digits = (input.phone || '').replace(/\D/g, '');
  const phone = digits.length === 10 || digits.length === 11 ? `+55${digits}` : `+${digits}`;
  const birth_date = input.birth_date || '';
  if (name.length < 3 || name.length > 120) throw new AppError('Nome deve ter de 3 a 120 caracteres.');
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new AppError('Informe um e-mail válido.');
  if (!/^\+[1-9]\d{9,14}$/.test(phone)) throw new AppError('Informe um telefone válido com DDD.');
  if (birth_date && (!calendarDate(birth_date) || birth_date > now().slice(0,10))) throw new AppError('Data de nascimento inválida ou futura.');
  return { name, email, phone, birth_date };
}
export function validateStart(value: string) {
  // Horário da clínica em São Paulo (UTC-03), sem depender do fuso do computador.
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value) || !calendarDate(value.slice(0,10)) || Number(value.slice(11,13)) > 23 || Number(value.slice(14)) > 59) throw new AppError('Data ou horário inválido.');
  const start = new Date(`${value}:00-03:00`);
  if (start.getTime() <= Date.now()) throw new AppError('Escolha um horário futuro.');
  return { starts_at: start.toISOString(), ends_at: new Date(start.getTime()+3600000).toISOString() };
}

export class MindHub {
  db: DatabaseSync;
  constructor(db: DatabaseSync) { this.db = db; }
  transaction<T>(operation: () => T): T {
    this.db.exec('BEGIN IMMEDIATE');
    try { const result = operation(); this.db.exec('COMMIT'); return result; }
    catch (error) {
      this.db.exec('ROLLBACK');
      if (error instanceof Error && error.message.includes('SLOT_CONFLICT')) throw new AppError('Conflito de horário. Escolha outro intervalo.', 409);
      if (error instanceof Error && error.message.includes('UNIQUE constraint failed: patients')) throw new AppError('E-mail já cadastrado nesta carteira.', 409);
      throw error;
    }
  }
  event(owner: string, entity: string, id: string, action: string, before: unknown, after: unknown) {
    this.db.prepare('INSERT INTO events(professional_id,entity,entity_id,action,before_json,after_json) VALUES (?,?,?,?,?,?)').run(owner,entity,id,action,JSON.stringify(before),JSON.stringify(after));
  }
  patients(owner: string, q = '') {
    const rows = this.db.prepare('SELECT * FROM patients WHERE professional_id=? ORDER BY name').all(owner) as Patient[];
    const normalized = q.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase();
    return rows.filter(p => `${p.name} ${p.email} ${p.phone}`.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase().includes(normalized));
  }
  patient(owner: string, id: string) {
    const p = this.db.prepare('SELECT * FROM patients WHERE professional_id=? AND id=?').get(owner,id) as Patient | undefined;
    if (!p) throw new AppError('Paciente não encontrado.',404);
    return p;
  }
  savePatient(owner: string, input: Input, id?: string) {
    const p = validatePatient(input);
    return this.transaction(() => {
      const before = id ? this.patient(owner,id) : null;
      const key = id || randomUUID();
      if (id) this.db.prepare('UPDATE patients SET name=?,email=?,phone=?,birth_date=?,updated_at=? WHERE id=? AND professional_id=?').run(p.name,p.email,p.phone,p.birth_date,now(),key,owner);
      else this.db.prepare('INSERT INTO patients(id,professional_id,name,email,phone,birth_date) VALUES (?,?,?,?,?,?)').run(key,owner,p.name,p.email,p.phone,p.birth_date);
      const after = this.patient(owner,key);
      this.event(owner,'patient',key,id ? 'ATUALIZAR' : 'CADASTRAR',before,after);
      return after;
    });
  }
  setPatientStatus(owner: string, id: string, status: string) {
    if (!['ATIVO','INATIVO'].includes(status)) throw new AppError('Status inválido.');
    return this.transaction(() => {
      const before = this.patient(owner,id);
      if (before.status === status) throw new AppError('Paciente já está nesse estado.',409);
      this.db.prepare('UPDATE patients SET status=?,updated_at=? WHERE id=? AND professional_id=?').run(status,now(),id,owner);
      const after = this.patient(owner,id);
      this.event(owner,'patient',id,status === 'ATIVO' ? 'REATIVAR' : 'INATIVAR',before,after);
      return after;
    });
  }
  appointments(owner: string) {
    return this.db.prepare('SELECT a.*,p.name patient_name FROM appointments a JOIN patients p ON p.id=a.patient_id AND p.professional_id=a.professional_id WHERE a.professional_id=? ORDER BY a.starts_at').all(owner) as Appointment[];
  }
  appointment(owner: string, id: string) {
    const a = this.db.prepare('SELECT * FROM appointments WHERE professional_id=? AND id=?').get(owner,id) as Appointment | undefined;
    if (!a) throw new AppError('Agendamento não encontrado.',404);
    return a;
  }
  saveAppointment(owner: string, input: Input, id?: string) {
    const times = validateStart(input.starts_at || '');
    return this.transaction(() => {
      const before = id ? this.appointment(owner,id) : null;
      if (before?.status === 'CANCELADO') throw new AppError('Agendamento cancelado não pode ser alterado.',409);
      const patientId = before?.patient_id || input.patient_id;
      const p = this.patient(owner,patientId);
      if (p.status !== 'ATIVO') throw new AppError('Reative o paciente antes de agendar ou remarcar.',409);
      const key = id || randomUUID();
      if (id) this.db.prepare('UPDATE appointments SET starts_at=?,ends_at=?,updated_at=? WHERE id=? AND professional_id=?').run(times.starts_at,times.ends_at,now(),key,owner);
      else this.db.prepare('INSERT INTO appointments(id,professional_id,patient_id,starts_at,ends_at) VALUES (?,?,?,?,?)').run(key,owner,patientId,times.starts_at,times.ends_at);
      const after = this.appointment(owner,key);
      this.event(owner,'appointment',key,id ? 'REMARCAR' : 'AGENDAR',before,after);
      return after;
    });
  }
  cancelAppointment(owner: string,id: string) {
    return this.transaction(() => {
      const before = this.appointment(owner,id);
      if (before.status === 'CANCELADO') throw new AppError('Agendamento já cancelado.',409);
      this.db.prepare("UPDATE appointments SET status='CANCELADO',updated_at=? WHERE professional_id=? AND id=?").run(now(),owner,id);
      const after = this.appointment(owner,id);
      this.event(owner,'appointment',id,'CANCELAR',before,after);
      return after;
    });
  }
  history(owner: string, entity: string, id: string) {
    return this.db.prepare('SELECT action,created_at,before_json,after_json FROM events WHERE professional_id=? AND entity=? AND entity_id=? ORDER BY id DESC').all(owner,entity,id);
  }
}
