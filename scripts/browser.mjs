import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

// CDP nativo: testes reais no Edge/Chromium instalado, sem pacote de navegador.
export async function launchBrowser(port = 9227) {
  const executable = process.env.BROWSER_PATH || [
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    '/usr/bin/chromium', '/usr/bin/google-chrome',
  ].find(existsSync);
  if (!executable) throw new Error('Defina BROWSER_PATH para Edge/Chrome/Chromium instalado.');
  const profile = mkdtempSync(join(tmpdir(),'mindhub-browser-'));
  const processHandle = spawn(executable,[`--remote-debugging-port=${port}`,`--user-data-dir=${profile}`,'--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','about:blank'],{windowsHide:true,stdio:'ignore'});
  let target;
  for(let attempt=0;attempt<80;attempt++) {
    try { const targets=await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();target=targets.find(t=>t.type==='page');if(target)break; } catch { /* aguarda inicialização */ }
    await delay(250);
  }
  if(!target) {processHandle.kill();throw new Error('Navegador não iniciou em 20 segundos.');}
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r,j)=>{socket.addEventListener('open',r,{once:true});socket.addEventListener('error',j,{once:true});});
  let next=0;const pending=new Map();const errors=[];
  socket.addEventListener('message',event=>{
    const message=JSON.parse(String(event.data));
    if(message.method==='Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
    if(message.id && pending.has(message.id)) {
      const {resolve,reject,timer}=pending.get(message.id);clearTimeout(timer);pending.delete(message.id);
      if(message.error)reject(new Error(JSON.stringify(message.error)));else resolve(message.result);
    }
  });
  const send=(method,params={})=>new Promise((resolve,reject)=>{
    const id=++next;const timer=setTimeout(()=>{pending.delete(id);reject(new Error(`CDP timeout: ${method}`));},20000);
    pending.set(id,{resolve,reject,timer});socket.send(JSON.stringify({id,method,params}));
  });
  await send('Page.enable');await send('Runtime.enable');
  const evaluate=async(expression)=>{
    const result=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
    if(result.exceptionDetails)throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  const wait=async(expression)=>{
    for(let i=0;i<100;i++) {try{if(await evaluate(expression))return;}catch{/* contexto pode mudar durante navegação */}await delay(100);}
    throw new Error(`Condição não satisfeita: ${expression}`);
  };
  const navigate=async(url)=>{await send('Page.navigate',{url});await wait(`location.href===${JSON.stringify(url)} && document.readyState==='complete'`);};
  const close=async()=>{
    send('Browser.close').catch(()=>{});
    await delay(500);socket.close();processHandle.kill();
    for(const {timer,reject} of pending.values()){clearTimeout(timer);reject(new Error('Navegador encerrado.'));}pending.clear();
    // O diretório foi criado por mkdtemp em tmpdir; nunca remover caminho externo calculado por entrada.
    try{rmSync(profile,{recursive:true,force:true});}catch{/* navegador pode ainda estar liberando o perfil temporário */}
  };
  return {send,evaluate,wait,navigate,close,errors};
}
