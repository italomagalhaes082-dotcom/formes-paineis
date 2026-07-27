#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════
   CHECKLIST DE PRÉ-DEPLOY — roda ANTES de todo push.
   Nenhum deploy sai sem este script terminar em "PODE PUBLICAR".
   Uso:  node tests/predeploy.js
   ═══════════════════════════════════════════════════════════════════════ */
const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');

const RAIZ = path.resolve(__dirname, '..');
const ARQ = path.join(RAIZ, 'index.html');
const falhas = [], avisos = [];
const ok = (cond, nome, detalhe) => {
  if (cond) console.log('  ✅ ' + nome);
  else { console.log('  ❌ ' + nome + (detalhe ? ' — ' + detalhe : '')); falhas.push(nome); }
};
const aviso = (cond, nome, detalhe) => {
  if (!cond) { console.log('  ⚠️  ' + nome + (detalhe ? ' — ' + detalhe : '')); avisos.push(nome); }
};

const src = fs.readFileSync(ARQ, 'utf8');

console.log('\n═══ 1. INTEGRIDADE DO DOCUMENTO ═══');
ok((src.match(/<!DOCTYPE/gi) || []).length === 1, 'um único <!DOCTYPE>');
ok((src.match(/<\/html>/gi) || []).length === 1, 'um único </html>');
const depois = src.slice(src.lastIndexOf('</html>') + 7).trim();
ok(depois.length === 0, 'nada depois de </html>', depois.slice(0, 60));
const abertos = (src.match(/<script/g) || []).length, fechados = (src.match(/<\/script>/g) || []).length;
ok(abertos === fechados, 'tags <script> balanceadas', abertos + ' aberturas x ' + fechados + ' fechamentos');

console.log('\n═══ 2. SINTAXE DE TODO O JAVASCRIPT ═══');
const blocos = [...src.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
let sintaxeOk = true;
blocos.forEach((b, i) => {
  const tmp = path.join('/tmp', 'predeploy_' + i + '.js');
  fs.writeFileSync(tmp, b);
  const r = spawnSync('node', ['--check', tmp], { encoding: 'utf8' });
  if (r.status !== 0) {
    sintaxeOk = false;
    console.log('  ❌ bloco ' + i + ': ' + (r.stderr || '').split('\n').slice(0, 3).join(' ').slice(0, 160));
  }
});
ok(sintaxeOk, blocos.length + ' blocos de script sem erro de sintaxe');

console.log('\n═══ 3. DUPLICAÇÃO DE CÓDIGO ═══');
// o painel já teve o script inteiro duplicado uma vez (528KB); nunca mais em silêncio
const nomesFn = [...src.matchAll(/\n(?:async )?function ([a-zA-Z_$][\w$]*)\s*\(/g)].map(m => m[1]);
const cont = {};
nomesFn.forEach(n => cont[n] = (cont[n] || 0) + 1);
const dupes = Object.entries(cont).filter(([, c]) => c > 1).map(([n, c]) => n + '×' + c);
ok(dupes.length === 0, 'nenhuma função declarada duas vezes', dupes.slice(0, 6).join(', '));

console.log('\n═══ 4. RESÍDUOS DE DESENVOLVIMENTO ═══');
const residuos = ['TEMPMARK', 'XXXTODO', 'debugger;', 'FIXME'];
const achados = residuos.filter(t => src.includes(t));
ok(achados.length === 0, 'sem marcadores temporários no código', achados.join(', '));
const fragmentos = /else if \([A-Z_]+\.test\([a-zA-Z]+\)\s+else|\)\s*else \{/.test(src);
ok(!fragmentos, 'sem fragmentos de emenda malformados');

console.log('\n═══ 5. CARIMBO DE VERSÃO ═══');
const carimbo = (src.match(/painel v[\d.]+-[a-z]+[^<`']*/) || [null])[0];
ok(!!carimbo, 'carimbo de versão presente', 'não encontrado');
if (carimbo) console.log('     → ' + carimbo.trim());
let anterior = '';
try {
  anterior = execSync('git show HEAD:index.html', { cwd: RAIZ, encoding: 'utf8', maxBuffer: 40e6 });
} catch (e) { /* primeiro commit */ }
if (anterior) {
  const carimboAnt = (anterior.match(/painel v[\d.]+-[a-z]+[^<`']*/) || [''])[0];
  const mudouCodigo = anterior !== src;
  ok(!mudouCodigo || carimbo !== carimboAnt,
    'carimbo mudou junto com o código',
    'código alterado mas carimbo continua "' + String(carimboAnt).trim() + '"');
}

console.log('\n═══ 6. BATERIA COMPLETA (dados simulados nas 3 obras) ═══');
const dirsJsdom = ['/home/claude/st/node_modules', path.join(RAIZ, 'node_modules')]
  .filter(d => { try { return fs.existsSync(path.join(d, 'jsdom')); } catch (e) { return false; } });
if (!dirsJsdom.length) console.log('  ⚠️  jsdom não encontrado — rode: npm i jsdom');
const smoke = spawnSync('node', [path.join(RAIZ, 'tests', 'smoke4.js')],
  { encoding: 'utf8', maxBuffer: 40e6, env: Object.assign({}, process.env, { NODE_PATH: dirsJsdom.join(':') }) });
const saida = (smoke.stdout || '') + (smoke.stderr || '');
const verdes = (saida.match(/✅/g) || []).length;
const vermelhos = (saida.match(/❌/g) || []).length;
ok(smoke.status === 0, verdes + ' verificações verdes' + (vermelhos ? ', ' + vermelhos + ' falhas' : ''));
if (smoke.status !== 0) saida.split('\n').filter(l => l.includes('❌')).slice(0, 8).forEach(l => console.log('     ' + l.trim()));

console.log('\n═══ 7. TAMANHO E DESEMPENHO ═══');
const kb = Math.round(src.length / 1024);
console.log('  ℹ️  index.html: ' + kb + ' KB');
aviso(kb < 600, 'arquivo acima de 600 KB — verificar duplicação', kb + ' KB');

console.log('\n' + '─'.repeat(58));
if (falhas.length === 0) {
  console.log('🎉 PODE PUBLICAR — ' + verdes + ' verificações verdes, 0 falhas'
    + (avisos.length ? ' (' + avisos.length + ' aviso(s))' : ''));
  process.exit(0);
} else {
  console.log('🛑 NÃO PUBLICAR — ' + falhas.length + ' falha(s): ' + falhas.join(' | '));
  process.exit(1);
}
