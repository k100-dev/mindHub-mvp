import { readFileSync,writeFileSync,mkdirSync,readdirSync } from 'node:fs';
import { resolve,dirname,basename } from 'node:path';
import { pathToFileURL } from 'node:url';
import { launchBrowser } from './browser.mjs';
const root='docs/estagio/fase-2';
const output=`${root}/06-evidencias/pdf-previa`;
const htmlDir=`${root}/06-evidencias/previas-html`;
mkdirSync(output,{recursive:true});mkdirSync(htmlDir,{recursive:true});
mkdirSync(`${root}/07-entrega-pdf`,{recursive:true});
const e=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
function render(source,file) {
  const inline=s=>e(s).replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');
  const lines=source.split(/\r?\n/);let html='';let list=false;let table=false;let code=false;
  for(const line of lines) {
    if(line.startsWith('```')){html+=code?'</code></pre>':'<pre><code>';code=!code;continue;}
    if(code){html+=e(line)+'\n';continue;}
    if(line.startsWith('|')) {
      if(list){html+='</ul>';list=false;}
      if(!table){html+='<table>';table=true;}
      if(/^\|[\s:|-]+\|$/.test(line))continue;
      html+='<tr>'+line.split('|').slice(1,-1).map(c=>`<td>${inline(c.trim())}</td>`).join('')+'</tr>';continue;
    }
    if(table){html+='</table>';table=false;}
    const img=line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if(img){html+=`<figure><img src="${e(pathToFileURL(resolve(dirname(file),img[2])).href)}" alt="${e(img[1])}"></figure>`;continue;}
    const h=line.match(/^(#{1,4}) (.+)$/);
    if(h){if(list){html+='</ul>';list=false;}html+=`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`;continue;}
    if(/^[-*] |^\d+\. /.test(line)){if(!list){html+='<ul>';list=true;}html+=`<li>${inline(line.replace(/^[-*] |^\d+\. /,''))}</li>`;continue;}
    if(list){html+='</ul>';list=false;}
    if(line.trim())html+=`<p>${inline(line)}</p>`;
  }
  return html+(list?'</ul>':'')+(table?'</table>':'');
}
const folders=['01-requisitos','02-casos-de-uso','03-diagramas','04-telas','05-relatorio'];
const files=folders.flatMap(folder=>readdirSync(`${root}/${folder}`).filter(f=>/^EST-\d+.*\.md$/.test(f)).map(f=>`${root}/${folder}/${f}`)).sort((a,b)=>basename(a).localeCompare(basename(b)));
const browser=await launchBrowser(9228);const manifest=[];
try {
  for(const file of files) {
    const name=basename(file,'.md');const diagram=file.includes('03-diagramas');const screens=file.includes('04-telas');
    const html=`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${e(name)}</title><style>@page{size:A4 ${diagram?'landscape':'portrait'};margin:15mm 14mm 18mm}*{box-sizing:border-box}body{font:10.5pt/1.5 "Segoe UI",Arial,sans-serif;color:#17233c;margin:0}h1{font-size:20pt;line-height:1.2;color:#0b5f57;margin:0 0 16pt}h2{font-size:13pt;margin-top:22pt;break-after:avoid}h3{font-size:11.5pt;break-after:avoid}p,li{orphans:3;widows:3}table{width:100%;border-collapse:collapse;font-size:9pt;table-layout:fixed;margin:14pt 0}tr{break-inside:avoid}tr:first-child{background:#e7f5f2;font-weight:700}td{border:1px solid #c1d1d5;padding:7pt;vertical-align:top;overflow-wrap:anywhere}code{font-size:9pt;overflow-wrap:anywhere}figure{margin:14pt 0;break-inside:avoid;text-align:center}img{max-width:100%;max-height:${diagram?'153mm':screens?'205mm':'180mm'};object-fit:contain}pre{white-space:pre-wrap}ul{padding-left:18pt}.draft{font-size:8pt;color:#8a3434;border-bottom:1px solid #d9b7b7;padding:0 0 7pt;margin-bottom:12pt}${screens?'h2{break-before:page}h2:first-of-type{break-before:auto}':''}</style></head><body><p class="draft">PRÉVIA PARA REVISÃO · v0.1 · 23/10/2026 · MVP 923f5b0 · NÃO SUBMETER COMO FINAL</p>${render(readFileSync(file,'utf8'),file)}</body></html>`;
    let printHtml = diagram ? html.replace('</style>','h1{font-size:15pt;margin:0 0 3pt}p:not(.draft){font-size:8pt;line-height:1.3;margin:3pt 0}figure{margin:0}img{max-height:135mm}.draft{margin-bottom:4pt;padding-bottom:4pt}</style>') : html;
    if(name==='EST-08-UC02') printHtml=printHtml.replace('</style>','body{font-size:10pt;line-height:1.4}h2{margin-top:17pt}</style>');
    const target=resolve(htmlDir,`${name}.html`);writeFileSync(target,printHtml);
    await browser.navigate(pathToFileURL(target).href);
    await browser.wait('Array.from(document.images).every(i=>i.complete && i.naturalWidth>0)');
    const pdf=await browser.send('Page.printToPDF',{printBackground:true,preferCSSPageSize:true,displayHeaderFooter:true,headerTemplate:'<span></span>',footerTemplate:'<div style="width:100%;font-size:8px;color:#53647a;text-align:center">MindHub MVP · PRÉVIA PARA REVISÃO · <span class="pageNumber"></span> / <span class="totalPages"></span></div>',marginTop:0.6,marginBottom:0.7,marginLeft:0.55,marginRight:0.55});
    writeFileSync(`${output}/${name}.pdf`,Buffer.from(pdf.data,'base64'));
    // Imagem da fonte de impressão serve à revisão editorial; não é rasterização do PDF.
    await browser.send('Emulation.setDeviceMetricsOverride',{width:diagram?1120:850,height:1000,deviceScaleFactor:1,mobile:false});
    const capture=await browser.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});
    writeFileSync(`${htmlDir}/${name}.png`,Buffer.from(capture.data,'base64'));
    manifest.push({file:`${name}.pdf`,source:file,status:['EST-01','EST-02','EST-03','EST-13','EST-18','EST-19'].some(id=>name.startsWith(id))?'EM ELABORAÇÃO':'AGUARDANDO REVISÃO',code:'923f5b0'});console.log('PRÉVIA',name);
  }
} finally {await browser.close();}
writeFileSync(`${root}/06-evidencias/previas.json`,JSON.stringify(manifest,null,2)+'\n');
console.log(`${manifest.length} PDFs individuais de revisão; nenhum colocado em 07-entrega-pdf.`);
