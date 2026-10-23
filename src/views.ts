import { escapeHtml as e } from './security.ts';
import type { MindHub, Input } from './domain.ts';

export type ViewContext = { owner: string; name: string; csrf: string; service: MindHub; query: URLSearchParams; error?: string; values?: Input };
export const localTime = (iso: string) => new Date(new Date(iso).getTime()-10800000).toISOString().slice(0,16);
const time = (iso: string) => new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo', dateStyle:'short',timeStyle:'short'}).format(new Date(iso));
const csrf = (token: string) => `<input type="hidden" name="csrf" value="${e(token)}">`;
const badge = (status: string) => `<span class="badge ${status === 'INATIVO' || status === 'CANCELADO' ? 'quiet' : ''}">${e(status)}</span>`;
const field = (label: string, name: string, value = '', type = 'text', required = true, attrs = '') => `<label>${label}<input name="${name}" type="${type}" value="${e(value)}" ${required ? 'required' : ''} ${attrs}></label>`;
export function shell(title: string, body: string, ctx?: ViewContext) {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="csrf-token" content="${e(ctx?.csrf || '')}"><title>${e(title)} · MindHub MVP</title><link rel="stylesheet" href="/styles.css"></head><body><a class="skip" href="#conteudo">Pular para o conteúdo</a><header><a class="brand" href="/pacientes"><span class="brand-mark">m</span> MindHub <small>MVP acadêmico</small></a>${ctx ? `<nav aria-label="Principal"><a href="/pacientes" ${title.includes('aciente') ? 'aria-current="page"' : ''}>Pacientes</a><a href="/agendamentos" ${title.includes('gendamento') ? 'aria-current="page"' : ''}>Agendamentos</a></nav><form method="post" action="/sair">${csrf(ctx.csrf)}<button class="secondary" type="submit">Sair</button></form>` : ''}</header><main id="conteudo">${ctx ? `<p class="eyebrow">Área profissional · ${e(ctx.name)}</p>` : ''}${ctx?.error ? `<p class="notice error" role="alert">${e(ctx.error)}</p>` : ''}${ctx?.query.has('ok') ? '<p class="notice" role="status">Operação concluída com sucesso.</p>' : ''}${body}</main><footer>MindHub · Fase 2 · Demonstração com dados fictícios</footer></body></html>`;
}
export function login(token: string, error = '') {
  return shell('Entrar',`<section class="login card"><p class="eyebrow">Organização para cuidar</p><h1>Acesso profissional</h1><p class="muted">Entre para gerenciar pacientes e agendamentos.</p>${error ? `<p role="alert" class="notice error">${e(error)}</p>` : ''}<form method="post" action="/entrar" class="form-grid">${csrf(token)}${field('E-mail','email','','email',true,'autocomplete="username" maxlength="254"')}${field('Senha','password','','password',true,'autocomplete="current-password" maxlength="128"')}<button type="submit">Entrar</button></form></section>`);
}
const heading = (title: string, subtitle: string, action = '') => `<div class="heading"><div><h1>${title}</h1><p class="muted">${subtitle}</p></div>${action}</div>`;
export function patients(ctx: ViewContext) {
  const q = ctx.query.get('q') || '';
  const rows = ctx.service.patients(ctx.owner,q);
  return shell('Pacientes',`${heading('Pacientes','Cadastro administrativo e histórico preservado.','<a class="button" href="/pacientes/novo">Cadastrar paciente</a>')}<section class="card"><form class="toolbar" method="get" action="/pacientes"><label class="grow">Pesquisar pacientes<input name="q" value="${e(q)}" placeholder="Nome, e-mail ou telefone" maxlength="254"></label><button type="submit">Pesquisar</button><a href="/pacientes">Limpar</a></form><p class="muted">${rows.length} paciente(s) encontrado(s)</p><div class="record-grid">${rows.map(p=>`<article class="record"><div class="record-head"><h2><a href="/pacientes/${p.id}">${e(p.name)}</a></h2>${badge(p.status)}</div><p>${e(p.email)}</p><p class="muted">${e(p.phone)}</p><a class="button secondary" href="/pacientes/${p.id}">Consultar paciente</a></article>`).join('') || '<p>Nenhum paciente encontrado. Cadastre um paciente ou ajuste a pesquisa.</p>'}</div></section>`,ctx);
}
export function patientForm(ctx: ViewContext, id?: string) {
  const p = ctx.values || (id ? ctx.service.patient(ctx.owner,id) : {} as Input);
  return shell(id ? 'Editar paciente' : 'Cadastrar paciente',`${heading(id ? 'Editar paciente' : 'Cadastrar paciente','Somente dados administrativos. Não registre informações clínicas.')}<section class="card narrow"><form method="post" action="${id ? `/pacientes/${id}/editar` : '/pacientes/novo'}" class="form-grid">${csrf(ctx.csrf)}${field('Nome completo','name',p.name,'text',true,'minlength="3" maxlength="120" autocomplete="name"')}${field('E-mail','email',p.email,'email',true,'maxlength="254" autocomplete="email"')}${field('Telefone com DDD','phone',p.phone,'tel',true,'maxlength="20" autocomplete="tel"')}${field('Data de nascimento (opcional)','birth_date',p.birth_date,'date',false,`max="${new Date().toISOString().slice(0,10)}"`)}<div class="actions"><button type="submit">Salvar paciente</button><a href="${id ? `/pacientes/${id}` : '/pacientes'}">Voltar</a></div></form></section>`,ctx);
}
function history(ctx: ViewContext, entity: string, id: string) {
  return `<section class="card"><h2>Histórico de alterações</h2><ol class="history">${ctx.service.history(ctx.owner,entity,id).map(row => {
    const before = JSON.parse(String(row.before_json));
    const after = JSON.parse(String(row.after_json));
    return `<li><strong>${e(row.action)}</strong> · ${time(String(row.created_at))}${entity === 'appointment' && before?.starts_at && before.starts_at !== after.starts_at ? `<p>De ${time(before.starts_at)} para ${time(after.starts_at)}</p>` : ''}</li>`;
  }).join('')}</ol></section>`;
}
export function patientDetail(ctx: ViewContext,id: string) {
  const p = ctx.service.patient(ctx.owner,id);
  const appointments = ctx.service.appointments(ctx.owner).filter(a=>a.patient_id===id);
  return shell('Detalhes do paciente',`${heading(e(p.name),'Dados administrativos do paciente.',`<a class="button" href="/pacientes/${id}/editar">Editar paciente</a>`)}<section class="card"><dl><dt>Status</dt><dd>${badge(p.status)}</dd><dt>E-mail</dt><dd>${e(p.email)}</dd><dt>Telefone</dt><dd>${e(p.phone)}</dd><dt>Nascimento</dt><dd>${e(p.birth_date || 'Não informado')}</dd></dl><form method="post" action="/pacientes/${id}/status">${csrf(ctx.csrf)}<input type="hidden" name="status" value="${p.status === 'ATIVO' ? 'INATIVO' : 'ATIVO'}"><p class="muted">Inativar preserva o cadastro e os agendamentos existentes.</p><button class="secondary" type="submit">${p.status === 'ATIVO' ? 'Inativar paciente' : 'Reativar paciente'}</button></form></section><section class="card"><h2>Agendamentos vinculados</h2>${appointments.map(a=>`<p><a href="/agendamentos/${a.id}">${time(a.starts_at)}</a> ${badge(a.status)}</p>`).join('') || '<p>Nenhum agendamento.</p>'}</section>${history(ctx,'patient',id)}`,ctx);
}
export function appointments(ctx: ViewContext) {
  const rows = ctx.service.appointments(ctx.owner);
  return shell('Agendamentos',`${heading('Agendamentos','Sessões de 60 minutos · horário de São Paulo (UTC−03).','<a class="button" href="/agendamentos/novo">Cadastrar agendamento</a>')}<section class="card"><div class="record-grid">${rows.map(a=>`<article class="record"><div class="record-head"><h2>${e(a.patient_name)}</h2>${badge(a.status)}</div><p>${time(a.starts_at)}–${time(a.ends_at).split(' ').at(-1)}</p><a class="button secondary" href="/agendamentos/${a.id}">Consultar agendamento</a></article>`).join('') || '<p>Nenhum agendamento. Cadastre um paciente ativo para começar.</p>'}</div></section>`,ctx);
}
export function appointmentForm(ctx: ViewContext,id?: string) {
  const a = id ? ctx.service.appointment(ctx.owner,id) : null;
  const values = ctx.values || {};
  const active = ctx.service.patients(ctx.owner).filter(p=>p.status==='ATIVO');
  const patient = a ? `<p>Paciente: <strong>${e(ctx.service.patient(ctx.owner,a.patient_id).name)}</strong></p>` : `<label>Paciente<select name="patient_id" required><option value="">Selecione um paciente ativo</option>${active.map(p=>`<option value="${p.id}" ${values.patient_id===p.id ? 'selected' : ''}>${e(p.name)}</option>`).join('')}</select></label>`;
  return shell(id ? 'Alterar agendamento' : 'Cadastrar agendamento',`${heading(id ? 'Alterar agendamento' : 'Cadastrar agendamento','Duração fixa de 60 minutos. Horário de São Paulo (UTC−03).')}<section class="card narrow">${!a && !active.length ? '<p>Cadastre ou reative um paciente antes de agendar.</p><a href="/pacientes/novo">Cadastrar paciente</a>' : `<form method="post" action="${a ? `/agendamentos/${id}/editar` : '/agendamentos/novo'}" class="form-grid">${csrf(ctx.csrf)}${patient}${field('Data e horário','starts_at',values.starts_at || (a ? localTime(a.starts_at) : ''),'datetime-local',true)}<div class="actions"><button type="submit">Salvar agendamento</button><a href="/agendamentos">Voltar</a></div></form>`}</section>`,ctx);
}
export function appointmentDetail(ctx: ViewContext,id: string) {
  const a = ctx.service.appointment(ctx.owner,id);
  const p = ctx.service.patient(ctx.owner,a.patient_id);
  return shell('Detalhes do agendamento',`${heading('Detalhes do agendamento','Histórico preservado mesmo após o cancelamento.')}<section class="card"><dl><dt>Paciente</dt><dd><a href="/pacientes/${p.id}">${e(p.name)}</a></dd><dt>Início</dt><dd>${time(a.starts_at)}</dd><dt>Fim</dt><dd>${time(a.ends_at)}</dd><dt>Status</dt><dd>${badge(a.status)}</dd></dl>${a.status === 'AGENDADO' ? `<div class="actions"><a class="button secondary" href="/agendamentos/${id}/editar">Alterar data e horário</a><form method="post" action="/agendamentos/${id}/cancelar">${csrf(ctx.csrf)}<button class="danger" type="submit">Cancelar agendamento</button></form></div>` : '<p>Cancelamento concluído. Este registro não pode ser reaberto.</p>'}</section>${history(ctx,'appointment',id)}`,ctx);
}
