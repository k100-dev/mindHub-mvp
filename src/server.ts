import { createServer, type IncomingMessage } from 'node:http';
import type { AddressInfo } from 'node:net';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import type { DatabaseSync } from 'node:sqlite';
import { openDatabase } from './db.ts';
import { AppError, MindHub, type Input } from './domain.ts';
import { hashPassword, hashToken, randomToken, verifyPassword } from './security.ts';
import * as view from './views.ts';

type Session = { professional_id: string; name: string; csrf: string };
function cookie(req: IncomingMessage, name: string) { return (req.headers.cookie || '').split(';').map(s=>s.trim()).find(s=>s.startsWith(`${name}=`))?.slice(name.length+1) || ''; }
async function body(req: IncomingMessage): Promise<Input> {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk.toString();
    if (Buffer.byteLength(raw)>16384) throw new AppError('Formulário excede o tamanho permitido.',413);
  }
  if (req.headers['content-type']?.split(';')[0] === 'application/json') {
    let parsed: unknown;
    try { parsed = JSON.parse(raw); } catch { throw new AppError('JSON inválido.',400); }
    if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object' || Object.values(parsed).some(v=>typeof v!=='string')) throw new AppError('Campos devem ser textos.',422);
    return parsed as Input;
  }
  if (req.headers['content-type']?.split(';')[0] !== 'application/x-www-form-urlencoded') throw new AppError('Formato não suportado.',415);
  return Object.fromEntries(new URLSearchParams(raw));
}
export function createApp(db: DatabaseSync, secure = process.env.COOKIE_SECURE === '1') {
  const service = new MindHub(db);
  const failures = new Map<string,{count: number; until: number}>();
  const dummyHash = hashPassword(randomToken());
  const cookieFlags = `; Path=/; HttpOnly; SameSite=Strict${secure ? '; Secure' : ''}`;
  function session(req: IncomingMessage): Session | undefined {
    return db.prepare('SELECT s.professional_id,p.name,s.csrf FROM sessions s JOIN professionals p ON p.id=s.professional_id WHERE s.token_hash=? AND s.expires_at>? AND p.active=1').get(hashToken(cookie(req,'mindhub_session')),Date.now()) as Session | undefined;
  }
  const server = createServer(async (req,res) => {
    res.setHeader('Content-Security-Policy',"default-src 'none'; style-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'");
    res.setHeader('X-Content-Type-Options','nosniff');
    res.setHeader('Referrer-Policy','same-origin');
    res.setHeader('Cache-Control','no-store');
    const url = new URL(req.url || '/','http://localhost');
    const path = url.pathname;
    const method = req.method || 'GET';
    const api = path.startsWith('/api/');
    const html = (content: string,status=200) => { res.writeHead(status,{'Content-Type':'text/html; charset=utf-8'}); res.end(content); };
    const json = (data: unknown,status=200) => { res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'}); res.end(JSON.stringify(data)); };
    const redirect = (target: string) => { res.writeHead(303,{Location:target}); res.end(); };
    let ctx: view.ViewContext | undefined;
    let input: Input = {};
    try {
      if (method==='GET' && path==='/styles.css') { res.writeHead(200,{'Content-Type':'text/css; charset=utf-8'}); res.end(readFileSync(new URL('./styles.css',import.meta.url))); return; }
      if (method==='GET' && path==='/entrar') {
        const token=randomToken(); res.setHeader('Set-Cookie',`mindhub_login=${token}${cookieFlags}; Max-Age=600`); html(view.login(token)); return;
      }
      if (!['GET','POST','PATCH'].includes(method)) throw new AppError('Método não permitido.',405);
      const auth = session(req);
      if (!auth && path!=='/entrar') {
        if (api) { json({error:'Autenticação profissional necessária.'},401); return; }
        redirect('/entrar'); return;
      }
      if (method!=='GET') {
        // Origem esperada é configurada pelo servidor; nunca confiar em Host ou X-Forwarded-For.
        const port = (server.address() as AddressInfo).port;
        const expectedOrigin = process.env.APP_ORIGIN || `http://127.0.0.1:${port}`;
        const origin = req.headers.origin;
        if (origin && origin !== expectedOrigin) throw new AppError('Origem não permitida.',403);
        if (req.headers['sec-fetch-site']==='cross-site') throw new AppError('Origem não permitida.',403);
        input = await body(req);
        const token = String(req.headers['x-csrf-token'] || input.csrf || '');
        const expected = path==='/entrar' ? cookie(req,'mindhub_login') : auth?.csrf;
        if (!expected || token!==expected) throw new AppError('Sessão do formulário expirada. Atualize a página.',403);
      }
      if (path==='/entrar' && method==='POST') {
        const ip = req.socket.remoteAddress || 'local';
        for (const [key,value] of failures) if (value.until<Date.now()) failures.delete(key);
        const attempts = failures.get(ip);
        if (attempts && attempts.count>=5) throw new AppError('Muitas tentativas. Aguarde 15 minutos.',429);
        const professional = db.prepare('SELECT id,password_hash,active FROM professionals WHERE email=?').get((input.email || '').trim().toLowerCase()) as {id:string;password_hash:string;active:number}|undefined;
        if ((input.password || '').length>128 || !verifyPassword(input.password || '',professional?.password_hash || dummyHash) || !professional?.active) {
          failures.set(ip,{count:(attempts?.count||0)+1,until:attempts?.until || Date.now()+900000});
          html(view.login(cookie(req,'mindhub_login'),'E-mail ou senha inválidos.'),401); return;
        }
        failures.delete(ip);
        db.prepare('DELETE FROM sessions WHERE expires_at<=? OR token_hash=?').run(Date.now(),hashToken(cookie(req,'mindhub_session')));
        const token=randomToken();
        db.prepare('INSERT INTO sessions(token_hash,professional_id,csrf,expires_at) VALUES (?,?,?,?)').run(hashToken(token),professional.id,randomToken(),Date.now()+28800000);
        res.setHeader('Set-Cookie',[`mindhub_session=${token}${cookieFlags}; Max-Age=28800`,`mindhub_login=${cookieFlags}; Max-Age=0`]); redirect('/pacientes'); return;
      }
      if (!auth) {
        if (api) { json({error:'Autenticação profissional necessária.'},401); return; }
        redirect('/entrar'); return;
      }
      ctx = {owner:auth.professional_id,name:auth.name,csrf:auth.csrf,service,query:url.searchParams};
      const owner = auth.professional_id;
      if (path==='/sair' && method==='POST') { db.prepare('DELETE FROM sessions WHERE token_hash=?').run(hashToken(cookie(req,'mindhub_session'))); res.setHeader('Set-Cookie',`mindhub_session=${cookieFlags}; Max-Age=0`); redirect('/entrar'); return; }
      if (api) {
        if (path==='/api/session' && method==='GET') { json({csrf:auth.csrf,name:auth.name}); return; }
        if (path==='/api/patients' && method==='GET') { json(service.patients(owner,url.searchParams.get('q') || '')); return; }
        if (path==='/api/patients' && method==='POST') { json(service.savePatient(owner,input),201); return; }
        if (path==='/api/appointments' && method==='GET') { json(service.appointments(owner)); return; }
        if (path==='/api/appointments' && method==='POST') { json(service.saveAppointment(owner,input),201); return; }
        const match = path.match(/^\/api\/(patients|appointments)\/([\w-]+)(?:\/(status|cancel))?$/);
        if (match) {
          const [,entity,id,action] = match;
          if (entity==='patients') {
            if (method==='GET' && !action) { json({patient:service.patient(owner,id),history:service.history(owner,'patient',id)}); return; }
            if (method==='PATCH' && !action) { json(service.savePatient(owner,input,id)); return; }
            if (method==='POST' && action==='status') { json(service.setPatientStatus(owner,id,input.status)); return; }
          } else {
            if (method==='GET' && !action) { json({appointment:service.appointment(owner,id),history:service.history(owner,'appointment',id)}); return; }
            if (method==='PATCH' && !action) { json(service.saveAppointment(owner,input,id)); return; }
            if (method==='POST' && action==='cancel') { json(service.cancelAppointment(owner,id)); return; }
          }
        }
        throw new AppError('Rota não encontrada.',404);
      }
      if (path==='/' && method==='GET') { redirect('/pacientes'); return; }
      if (path==='/pacientes' && method==='GET') { html(view.patients(ctx)); return; }
      if (path==='/agendamentos' && method==='GET') { html(view.appointments(ctx)); return; }
      if (path==='/pacientes/novo') {
        if (method==='POST') { const p=service.savePatient(owner,input); redirect(`/pacientes/${p.id}?ok=1`); return; }
        if (method==='GET') { html(view.patientForm(ctx)); return; }
      }
      if (path==='/agendamentos/novo') {
        if (method==='POST') { const a=service.saveAppointment(owner,input); redirect(`/agendamentos/${a.id}?ok=1`); return; }
        if (method==='GET') { html(view.appointmentForm(ctx)); return; }
      }
      const match = path.match(/^\/(pacientes|agendamentos)\/([\w-]+)(?:\/(editar|status|cancelar))?$/);
      if (match) {
        const [,entity,id,action] = match;
        if (entity==='pacientes') {
          if (method==='GET' && !action) { html(view.patientDetail(ctx,id)); return; }
          if (method==='GET' && action==='editar') { html(view.patientForm(ctx,id)); return; }
          if (method==='POST' && action==='editar') { service.savePatient(owner,input,id); redirect(`/pacientes/${id}?ok=1`); return; }
          if (method==='POST' && action==='status') { service.setPatientStatus(owner,id,input.status); redirect(`/pacientes/${id}?ok=1`); return; }
        } else {
          if (method==='GET' && !action) { html(view.appointmentDetail(ctx,id)); return; }
          if (method==='GET' && action==='editar') { html(view.appointmentForm(ctx,id)); return; }
          if (method==='POST' && action==='editar') { service.saveAppointment(owner,input,id); redirect(`/agendamentos/${id}?ok=1`); return; }
          if (method==='POST' && action==='cancelar') { service.cancelAppointment(owner,id); redirect(`/agendamentos/${id}?ok=1`); return; }
        }
      }
      throw new AppError('Página não encontrada.',404);
    } catch (error) {
      const status = error instanceof AppError ? error.status : 500;
      const message = error instanceof AppError ? error.message : 'Não foi possível concluir a operação. Tente novamente.';
      if (!(error instanceof AppError)) console.error('Falha interna:',error instanceof Error ? error.name : 'unknown');
      if (api) { json({error:message},status); return; }
      if (ctx) {
        ctx.error=message; ctx.values=input;
        if (path==='/pacientes/novo') { html(view.patientForm(ctx),status); return; }
        if (path==='/agendamentos/novo') { html(view.appointmentForm(ctx),status); return; }
        const edit=path.match(/^\/(pacientes|agendamentos)\/([\w-]+)\/editar$/);
        if (edit && status!==404) {
          html(edit[1]==='pacientes' ? view.patientForm(ctx,edit[2]) : view.appointmentForm(ctx,edit[2]),status); return;
        }
      }
      html(view.shell('Aviso',`<section class="card"><h1>Operação não concluída</h1><p role="alert">${message}</p><a href="/pacientes">Voltar para pacientes</a> · <a href="/agendamentos">Voltar para agendamentos</a></section>`,ctx),status);
    }
  });
  server.requestTimeout=30000;
  server.headersTimeout=15000;
  return server;
}

if (process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const db=openDatabase();
  const server=createApp(db);
  const host=process.env.HOST || '127.0.0.1';
  const port=Number(process.env.PORT || '3100');
  server.listen(port,host,()=>console.log(`MindHub: http://${host}:${port}`));
  for (const signal of ['SIGINT','SIGTERM'] as const) process.on(signal,()=>server.close(()=>{db.close();process.exit(0);}));
}
