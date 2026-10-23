import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { openDatabase } from '../src/db.ts';
import { createApp } from '../src/server.ts';
import { hashPassword,hashToken } from '../src/security.ts';

test('T08 HTTP: acesso fechado, login, CSRF, autorização, persistência, cookie e logout',async()=>{
  const db=openDatabase(':memory:');
  db.prepare('INSERT INTO professionals(id,name,email,password_hash) VALUES (?,?,?,?)').run('a','Demo','demo@example.invalid',hashPassword('demo-password'));
  const server=createApp(db,false);await new Promise<void>(r=>server.listen(0,'127.0.0.1',r));
  const base=`http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  try {
    assert.equal((await fetch(`${base}/api/patients`)).status,401);
    assert.equal((await fetch(`${base}/api/patients`,{method:'POST',headers:{'content-type':'application/json'},body:'{}'})).status,401);
    const protectedPage=await fetch(`${base}/pacientes`,{redirect:'manual'});assert.equal(protectedPage.status,303);
    const entry=await fetch(`${base}/entrar`);const cookie=entry.headers.get('set-cookie')!.split(';')[0]; const csrf=cookie.split('=')[1];
    assert.equal((await fetch(`${base}/entrar`,{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded',cookie},body:new URLSearchParams({csrf,email:'demo@example.invalid',password:'wrong'})})).status,401);
    const signed=await fetch(`${base}/entrar`,{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded',cookie},body:new URLSearchParams({csrf,email:'demo@example.invalid',password:'demo-password'}),redirect:'manual'});
    assert.equal(signed.status,303);const session=signed.headers.getSetCookie()[0];assert.match(session,/HttpOnly/);assert.match(session,/SameSite=Strict/);
    const authCookie=session.split(';')[0];const auth=await (await fetch(`${base}/api/session`,{headers:{cookie:authCookie}})).json() as {csrf:string};
    const headers={'content-type':'application/json',cookie:authCookie,'x-csrf-token':auth.csrf};
    const input={name:'Paciente HTTP',email:'http@example.invalid',phone:'43999990003'};
    assert.equal((await fetch(`${base}/api/patients`,{method:'POST',headers:{...headers,'x-csrf-token':'bad'},body:JSON.stringify(input)})).status,403);
    assert.equal((await fetch(`${base}/api/patients`,{method:'POST',headers:{...headers,origin:'https://evil.invalid'},body:JSON.stringify(input)})).status,403);
    assert.equal((await fetch(`${base}/api/patients`,{method:'POST',headers,body:'{bad'})).status,400);
    assert.equal((await fetch(`${base}/api/patients`,{method:'POST',headers,body:JSON.stringify({...input,name:'x'.repeat(17000)})})).status,413);
    const created=await fetch(`${base}/api/patients`,{method:'POST',headers,body:JSON.stringify(input)});assert.equal(created.status,201);
    const p=await created.json() as {id:string};
    assert.equal((await fetch(`${base}/api/patients/${p.id}`,{headers})).status,200);
    assert.equal((await fetch(`${base}/api/patients/unknown`,{headers})).status,404);
    assert.equal((await fetch(`${base}/api/patients`,{method:'DELETE',headers})).status,405);
    const xss=await fetch(`${base}/api/patients`,{method:'PATCH',headers,body:JSON.stringify(input)});assert.equal(xss.status,404);
    const token=authCookie.split('=')[1];assert.ok(db.prepare('SELECT token_hash FROM sessions WHERE token_hash=?').get(hashToken(token)));
    assert.equal(db.prepare('SELECT token_hash FROM sessions').get()!.token_hash,hashToken(token));
    const out=await fetch(`${base}/sair`,{method:'POST',headers:{cookie:authCookie,'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({csrf:auth.csrf}),redirect:'manual'});assert.equal(out.status,303);
    assert.equal((await fetch(`${base}/api/patients`,{headers})).status,401);
  } finally {await new Promise<void>((r,j)=>server.close(e=>e?j(e):r()));db.close();}
});
test('T09 bloqueio de força bruta e sessão expirada/inativa',async()=>{
  const db=openDatabase(':memory:'); const server=createApp(db);await new Promise<void>(r=>server.listen(0,'127.0.0.1',r));
  const base=`http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  try {
    const entry=await fetch(`${base}/entrar`);const cookie=entry.headers.get('set-cookie')!.split(';')[0];const csrf=cookie.split('=')[1];
    for(let i=0;i<6;i++) {
      const response=await fetch(`${base}/entrar`,{method:'POST',headers:{cookie,'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({csrf,email:'absent@example.invalid',password:'wrong'})});
      assert.equal(response.status,i===5?429:401);
    }
    db.prepare("INSERT INTO professionals VALUES ('inactive','Demo','inactive@example.invalid','x',0)").run();
    db.prepare("INSERT INTO sessions VALUES (?,'inactive','csrf',?)").run(hashToken('token'),Date.now()+10000);
    assert.equal((await fetch(`${base}/api/patients`,{headers:{cookie:'mindhub_session=token'}})).status,401);
    db.prepare("UPDATE professionals SET active=1 WHERE id='inactive'").run();db.prepare('UPDATE sessions SET expires_at=0').run();
    assert.equal((await fetch(`${base}/api/patients`,{headers:{cookie:'mindhub_session=token'}})).status,401);
  } finally {await new Promise<void>(r=>server.close(()=>r()));db.close();}
});
