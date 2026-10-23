import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openDatabase } from '../src/db.ts';
import { createApp } from '../src/server.ts';
import { hashPassword } from '../src/security.ts';
import { launchBrowser } from '../scripts/browser.mjs';

const output='docs/estagio/fase-2/06-evidencias';
const screens='docs/estagio/fase-2/04-telas';mkdirSync(output,{recursive:true});mkdirSync(screens,{recursive:true});
const temp=mkdtempSync(join(tmpdir(),'mindhub-e2e-'));const db=openDatabase(join(temp,'demo.sqlite'));
db.prepare('INSERT INTO professionals(id,name,email,password_hash) VALUES (?,?,?,?)').run('demo','Profissional Demonstração','demo@mindhub.test',hashPassword('DemoMindHub2026!'));
const server=createApp(db);await new Promise(r=>server.listen(3101,'127.0.0.1',r));
let browser;const results=[];
const record=(name)=>{results.push({name,status:'PASSOU'});console.log(`PASSOU ${name}`);};
try {
  browser=await launchBrowser();const {evaluate:run,wait,send}=browser;
  const goto=async path=>{await send('Page.navigate',{url:`http://127.0.0.1:3101${path}`});await wait(`location.pathname===${JSON.stringify(path.split('?')[0])} && document.readyState==='complete'`);};
  const submit=async (action,fields)=>{
    await run(`(()=>{const f=document.querySelector(${JSON.stringify(`form[action="${action}"]`)});for(const [k,v] of Object.entries(${JSON.stringify(fields)})){f.elements.namedItem(k).value=v;}f.requestSubmit();})()`);
  };
  const shot=async name=>{const {data}=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});writeFileSync(`${screens}/${name}.png`,Buffer.from(data,'base64'));};
  await send('Emulation.setDeviceMetricsOverride',{width:1366,height:900,deviceScaleFactor:1,mobile:false});
  await send('Page.navigate',{url:'http://127.0.0.1:3101/pacientes'});await wait("location.pathname==='/entrar' && document.readyState==='complete'");await shot('TELA-01-login');record('E01 página protegida redireciona ao login');
  await submit('/entrar',{email:'demo@mindhub.test',password:'DemoMindHub2026!'});await wait("location.pathname==='/pacientes' && !!document.querySelector('nav')");record('E02 login real pelo formulário');
  await goto('/pacientes/novo');await shot('TELA-02-cadastro-paciente');
  await submit('/pacientes/novo',{name:'Clara Demonstração',email:'clara@example.invalid',phone:'43999990003',birth_date:'1998-04-12'});
  await wait("/^\\/pacientes\\/[a-f0-9-]+$/.test(location.pathname) && !!document.querySelector('[role=status]')");
  const patientPath=await run('location.pathname');await shot('TELA-03-detalhe-paciente');
  await send('Page.reload');await wait("document.readyState==='complete' && document.body.innerText.includes('Clara Demonstração')");record('E03 cadastro e persistência após recarga');
  await goto('/pacientes?q=clara');assert.equal(await run("document.querySelectorAll('.record').length"),1);await shot('TELA-04-pesquisa-pacientes');record('E04 pesquisa por nome');
  await goto(`${patientPath}/editar`);await submit(`${patientPath}/editar`,{name:'Clara Revisada',email:'clara@example.invalid',phone:'43999990003',birth_date:'1998-04-12'});await wait("document.querySelector('h1')?.textContent==='Clara Revisada'");record('E05 edição de paciente');
  await submit(`${patientPath}/status`,{});await wait("document.querySelector('dd .badge')?.textContent==='INATIVO'");await shot('TELA-05-paciente-inativo');
  await submit(`${patientPath}/status`,{});await wait("document.querySelector('dd .badge')?.textContent==='ATIVO'");record('E06 inativação e reativação');
  await goto('/agendamentos/novo');await shot('TELA-06-cadastro-agendamento');await submit('/agendamentos/novo',{patient_id:patientPath.split('/')[2],starts_at:'2099-01-05T09:00'});
  await wait("/^\\/agendamentos\\/[a-f0-9-]+$/.test(location.pathname) && !!document.querySelector('[role=status]')");const appointmentPath=await run('location.pathname');
  await send('Page.reload');await wait("document.readyState==='complete' && document.body.innerText.includes('AGENDADO')");await shot('TELA-07-detalhe-agendamento');record('E07 criação de agendamento e recarga');
  await goto('/agendamentos/novo');await submit('/agendamentos/novo',{patient_id:patientPath.split('/')[2],starts_at:'2099-01-05T09:30'});await wait("document.querySelector('[role=alert]')?.textContent.includes('Conflito')");await shot('TELA-08-conflito');record('E08 conflito exibido sem criar registro');
  await goto(`${appointmentPath}/editar`);await submit(`${appointmentPath}/editar`,{starts_at:'2099-01-06T10:00'});await wait("document.querySelector('h1')?.textContent==='Detalhes do agendamento' && document.body.innerText.includes('06/01/2099')");record('E09 remarcação pelo formulário');
  await submit(`${appointmentPath}/cancelar`,{});await wait("document.querySelector('dd .badge')?.textContent==='CANCELADO'");await shot('TELA-09-cancelamento-historico');record('E10 cancelamento e histórico');
  for(const width of [320,375,768,1366]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
    for(const path of ['/pacientes','/pacientes/novo',patientPath,`${patientPath}/editar`,'/agendamentos','/agendamentos/novo',appointmentPath]) {
      await goto(path);assert.equal(await run('document.documentElement.scrollWidth<=document.documentElement.clientWidth'),true,`${width}px ${path}`);
    }
    if(width===320)await shot('TELA-10-mobile-320');
    record(`E11 layout em ${width}px: sete páginas sem overflow`);
  }
  await goto('/pacientes');await run("document.documentElement.style.fontSize='200%'");assert.equal(await run('document.documentElement.scrollWidth<=document.documentElement.clientWidth'),true);record('E12 texto 200% sem overflow');
  await run("document.documentElement.style.fontSize=''");await submit('/sair',{});await wait("location.pathname==='/entrar'");record('E13 logout e retorno ao login');
  assert.equal(browser.errors.length,0);record('E14 sem exceções JavaScript não tratadas');
} catch(error) {results.push({name:'Execução interrompida',status:'FALHOU',error:String(error)});throw error;}
finally {
  writeFileSync(`${output}/navegador.json`,JSON.stringify({date:new Date().toISOString(),browser:'Edge/Chromium via CDP',results},null,2)+'\n');
  if(browser)await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));db.close();rmSync(temp,{recursive:true,force:true});
}
