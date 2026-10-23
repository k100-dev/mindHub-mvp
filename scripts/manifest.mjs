import { readFileSync,writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const root='docs/estagio/fase-2';
const entries=JSON.parse(readFileSync(`${root}/06-evidencias/previas.json`,'utf8'));
const date='2026-10-23';
const lines=['# Manifesto de entrega — controle, não comprovante de submissão','',`Versão 0.1 · ${date} · referência de código 923f5b0844113a3863b1e5fa9231cd9fadad7a83.`, '', 'Os arquivos abaixo são prévias individuais em 06-evidencias/pdf-previa. Não foram aprovados para submissão. A pasta 07-entrega-pdf está vazia. Fontes editáveis identificadas no índice. Nenhum ZIP foi produzido.','', '| Arquivo de prévia | Versão | Estado | Data | Commit de código | SHA-256 |','| --- | --- | --- | --- | --- | --- |'];
for(const item of entries){const checksum=createHash('sha256').update(readFileSync(`${root}/06-evidencias/pdf-previa/${item.file}`)).digest('hex');lines.push(`| ${item.file} | 0.1 | ${item.status} | ${date} | 923f5b0 | ${checksum} |`);}
lines.push('| EST-15 — RPOD, sem arquivo | — | EM ELABORAÇÃO: impedimento institucional | '+date+' | 923f5b0 | Não aplicável: arquivo não produzido |','','Para promover uma prévia a PRONTO PARA ENVIO: incorporar modelos oficiais quando aplicáveis, confirmar As-Is/RPOD, revisar texto/diagramas, obter aprovação do aluno e atualizar versão/checksum; somente então colocar o PDF final individual em 07-entrega-pdf. ENVIADO e ACEITO exigem comprovantes.','');
writeFileSync(`${root}/00-controle/MANIFESTO-ENTREGA.md`,lines.join('\n'));
console.log('Manifesto atualizado com SHA-256 de 18 prévias.');
