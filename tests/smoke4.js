const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs');
const H = fs.readFileSync('/home/claude/formes-paineis/index.html','utf8').replace(/<script src="[^"]*"><\/script>/g,'');
const csvify = rows => rows.map(r=>r.map(v=>{
  const t = v==null? '' : String(v);
  return (/[",\n]/.test(t)) ? '"'+t.replace(/"/g,'""')+'"' : t;
}).join(',')).join('\n');
const gviz = rows => 'google.visualization.Query.setResponse('+JSON.stringify({table:{rows:rows.map(r=>({c:r.map(v=>v==null?null:(typeof v==='number'?{v,t:'n'}:{v:String(v)}))}))}})+')';
const R = n => new Array(n).fill('');
function rec(cliente,data,desc,valOrig,valReceb,cat,origem){const r=R(32);r[1]=cliente;r[3]=data;r[8]=desc;r[9]=origem||'Venda';r[10]='PAGO';r[12]=valOrig;r[14]=valReceb;r[18]=valReceb;r[28]=cat;return r;}
function dsp(forn,data,desc,v,cat){const r=R(32);r[1]=forn;r[3]=data;r[8]=desc;r[18]=-v;r[28]=cat;return r;}

// ── LIBERTY: AFACs, retiradas simétricas, permutantes 22%, rendimentos, INCC
const recL=[R(32)];
recL.push(rec('FORMES ENGENHARIA','10/01/2022','AFAC - FORMES',0,300000,'AFAC - FORMES ENGENHARIA','Lançamento financeiro'));
recL.push(rec('ALVES MENDES CONSTRUÇÕES','10/01/2022','AFAC - ALVES MENDES',0,300000,'AFAC - ALVES MENDES','Lançamento financeiro'));
// casa 1 quitada: 2 parcelas 200k cada + INCC 20k
recL.push(rec('Cliente A','10/03/2024','1/2 - CASA 01 - LIBERTY',200000,200000,'Vendas'));
recL.push(rec('Cliente A','10/06/2024','2/2 - CASA 01 - LIBERTY',200000,200000,'Vendas'));
recL.push(rec('Cliente A','10/06/2024','INCC CASA 01',0,20000,'INCC / IGPM'));
// casa 2 parcial
recL.push(rec('Cliente B','10/05/2025','1/4 - CASA 02 - LIBERTY',100000,100000,'Vendas'));
recL.push(rec('','31/05/2025','RENDIMENTO APLICACAO 05-2025',0,5000,'Rendimentos de Aplicações'));
recL.push(rec('','30/06/2025','RENDIMENTO APLICACAO 06-2025',0,6000,'Rendimentos de Aplicações'));
function d7(forn,data,desc,v,cat){return [forn,data,desc,('-'+v).replace('.',','),'23 - CONTA',cat,'LIBERTY UNIQUE'];}
const dspL=[['Nome do fornecedor','Data','Descrição','(R$)','Conta bancária','Categoria 1','Centro de Custo 1']];
const dsp7=(f,dt,de,v,c)=>dspL.push(d7(f,dt,de,v,c));
dsp7('ITALO MAGALHAES SILVA','10/01/2026','RETIRADA SOCIO',100000,'Retirada Sócios');
dsp7('ITALO MAGALHAES SILVA','18/12/2024','EQUILIBRIO DE APORTES',107500,'Equilibrio de Aportes');
dsp7('ITALO MAGALHAES SILVA','22/01/2026','RETIRADA SOCIO',100000,'Retirada Sócios');
dsp7('DANIEL FELIPE ALVES GUILHERME','10/01/2026','RETIRADA SOCIO',100000,'Retirada Sócios');
dsp7('ITALO MAGALHAES SILVA','28/12/2024','RETIRADA SOCIO, FINAL DE ANO','10000,00','Retirada Sócios');
dsp7('DANIEL FELIPE ALVES GUILHERME','16/03/2026','RETIRADA "EXTRA", MARCO',200000,'Retirada Sócios');
dsp7('ADALBERTO MACHADO PORTELA JUNIOR','15/07/2024','PAGTO PERMUTANTE',30000,'Permuta');
dsp7('Loja','05/01/2025','CIMENTO',80000,'Fornecedor - Aquisição de materiais');
dsp7('Mestre','05/01/2025','PAGTO MAO DE OBRA FOLHA 10',40000,'Mão de obra - Mestre');
dsp7('Corretor','05/01/2025','COMISSAO CASA 1',10000,'Comissão Corretor');

// ── BOSSA: permuta Harmony (casa 7 quitada, paga ALÉM do devido), devolução AFAC > AFACs
const recB=[R(32)];
recB.push(rec('CZ SECURITIZADORA S/A','01/02/2022','AFAC CZ',0,10000,'AFAC - CZ SECURITIZADORA','Lançamento financeiro'));
recB.push(rec('Cliente X','10/01/2024','1/2 - CASA 07 - BOSSA',150000,150000,'Vendas'));
recB.push(rec('Cliente X','10/04/2024','2/2 - CASA 07 - BOSSA',150000,150000,'Vendas'));
recB.push(rec('Cliente X','10/04/2024','INCC CASA 07',0,10000,'INCC / IGPM'));
recB.push(rec('Cliente Y','10/05/2025','1/5 - CASA 08 - BOSSA',80000,80000,'Vendas'));
for(let p=2;p<=5;p++) recB.push(rec('Cliente Y','10/0'+p+'/2026','' + p + '/5 - CASA 08 - BOSSA',80000,0,'Vendas'));
recB.push(rec('Cliente Z','12/05/2025','CRED PIX',50000,50000,'Vendas')); // sem casa!
recB.push(rec('Cliente W','15/03/2024','ENTRADA CASA 24 - BOSSA',50000,50000,'Vendas'));
recB.push(rec('','30/04/2025','RENDIMENTO APLICACAO',0,3000,'Rendimentos de Aplicações'));
const dspB=[R(32)];
dspB.push(dsp('HARMONY EMPREENDIMENTOS IMOBILIARIOS LTDA','05/07/2024','1 PAGTO PERMUTANTE - BOSSA',400000,'Permuta')); // devido ~367k → antecipação
dspB.push(dsp('CZ SECURITIZADORA S/A','10/03/2025','DEVOLUCAO AFAC CZ',750000,'Devolução de Afac'));
dspB.push(dsp('Loja','05/02/2025','ACO',60000,'Fornecedor - Aquisição de materiais'));
dspB.push(dsp('Mestre','05/02/2025','PAGTO MAO DE OBRA FOLHA 22',30000,'Mão de obra - Mestre'));

// ── JAZZ: mock mínimo 2 abas
const recJ=[R(32)];
recJ.push(rec('FORMES ENGENHARIA','23/04/2021','AFAC - FORMES ENGENHARIA',0,61105,'','Lançamento financeiro'));
recJ.push(rec('ALVES MENDES CONSTRUÇÕES','23/04/2021','AFAC - ALVES MENDES - JAZZ',0,61418,'','Lançamento financeiro'));
recJ.push(rec('CLIENTE J / ESPOSA DELE','10/03/2025','1/13 - CASA 05',10000,10000,'Vendas'));
recJ.push(rec('JOANA DISTRATADA','10/02/2024','1/10 - CASA 05',5000,5000,'Vendas'));
recJ.push(rec('CLIENTE FANTASMA','10/04/2026','1/8 - CASA 07',80000,80000,'Vendas'));
const dspJ=[R(32)];
dspJ.push(dsp('ITALO MAGALHAES SILVA','10/12/2024','RETIRADA',50000,'Retirada Sócios'));
dspJ.push(dsp('DANIEL FELIPE ALVES GUILHERME','15/03/2025','RETIRADA',50000,'Retirada Sócios'));
for(let i=0;i<6;i++) dspJ.push(dsp('Loja','0'+(i+1)+'/0'+(i+1)+'/2025','CIMENTO LOTE '+i,10000+i*500,'Fornecedor - Aquisição de materiais'));
dspJ.push(dsp('Mestre','05/03/2025','FOLHA 100',20000,'Mão de obra - Mestre'));
dspJ.push(dsp('RAFAEL SANTOS CLIMATIZACAO','10/04/2025','INFRA AR CONDICIONADO CASAS 1-6',15000,'Fornecedor - Aquisição de materiais'));
dspJ.push(dsp('ANDRE LUIS BARBOSA','05/05/2025','ADIANTAMENTO DE CAIXA OBRA',2000,'Mão de obra - Terceiros'));
dspJ.push(dsp('ANDRE LUIS BARBOSA','12/05/2025','PAGTO SEMANA',1260,'Mão de obra - Terceiros'));
dspJ.push(dsp('MESTRE','20/05/2025','COMPRAS SUPERMERCADO SAO LUIS',450,'Fornecedor - Aquisição de materiais'));
dspJ.push(dsp('ANDRE LIMA VERDE','01/06/2025','FRETE PORCELANATO',540,'Mão de obra - Terceiros'));
dspJ.push(dsp('ASSAI ATACADISTA','02/06/2025','MATERIAL DE LIMPEZA',45,'Diversos'));

const DATA={ '1mvNNh2r43GeEmW9h90B_NeyfXWkyoc8k2QHnbVZyUH0':{rec:recL,dsp:dspL},
             '1B-AG_5lU9JW8TAjybn4OGwK2E3b676xVIE6Yoz9CRjI':{rec:recB,dsp:dspB},
             '1D660xfizv39rn0pxDJA2Whqeye3bp4hB4vxCAxrXRvw':{rec:recJ,dsp:dspJ} };

async function testEmp(emp, checks){
  let html = H;
  const stub = `<script>
    window.firebase={initializeApp(){},firestore(){return{collection(){return{doc(){return{set:async()=>{},onSnapshot(){return()=>{};}};}};}};}};
    class C{constructor(){}destroy(){}}C.defaults={color:'',font:{}};window.Chart=C;
    const DATA=${JSON.stringify(DATA)};
    const gv=rows=>'google.visualization.Query.setResponse('+JSON.stringify({table:{rows:rows.map(r=>({c:r.map(v=>v==null?null:(typeof v==='number'?{v:v,t:'n'}:{v:String(v)}))}))}})+')';
    window.fetch=async(u)=>{const q=decodeURIComponent(u);
      const sid=Object.keys(DATA).find(s=>q.includes(s));
      const JAZZ='1D660xfizv39rn0pxDJA2Whqeye3bp4hB4vxCAxrXRvw';
      const cs = rows => rows.map(r=>r.map(v=>{const t=v==null?'':String(v);return /[",\\n]/.test(t)?'"'+t.replace(/"/g,'""')+'"':t;}).join(',')).join('\\n');
      let b;
      if(!sid) b=cs([[]]);
      else if(sid===JAZZ){ // caminho JSON antigo (retrocompatibilidade)
        if(q.includes('RECEITAS')) b=gv(DATA[sid].rec);
        else if(q.includes('DESPESAS')) b=gv(DATA[sid].dsp);
        else if(q.includes('GESTAO')||q.includes('GEST')||q.includes('gid=1058135064')) b=gv([
          ['CASA','CLIENTE ATUAL','STATUS','DATA VENDA','VALOR VENDA','COMISSÃO PAGA','Nº DISTRATOS','RECEBIDO DISTRATADOS','DEVOLVIDO EM DISTRATOS','COMISSÕES PERDIDAS','GANHO REVENDA','OBS'],
          ['5','Cliente J','Em andamento','10/01/2025','10000','400','1','6000','3000','360','1000',''],
          ['9','','Disponível','','','','0','0','0','0','0',''],
          ['11','Cliente Devedor','Entregue e devendo','01/02/2024','500000','20000','0','0','0','0','0','']]);
        else if(q.includes('VENDA')) b=gv([['h'],['h'],['h']]);
        else b=gv([['h']]);
      } else { // caminho CSV novo
        if(q.includes('RECEITAS')) b=cs(DATA[sid].rec);
        else if(q.includes('DESPESAS')) b=cs(DATA[sid].dsp);
        else b=cs([['h']]);
      }
      return {ok:true,status:200,text:async()=>b};};
  </script>`;
  require('fs').writeFileSync('/tmp/stub_gen.js', stub.replace(/^<script>/,'').replace(/<\/script>$/,''));
  html = html.replace('<head>','<head>'+stub);
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => console.log('JSDOM-ERROR ['+emp+']:', e.message, (e.detail&&e.detail.stack||e.stack||'').split('\n').slice(0,2).join(' | ')));
  const dom = new JSDOM(html,{url:`https://x.netlify.app/index.html?emp=${emp}&token=italogestao2026`,runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc});
  const w=dom.window; const errs=[];
  w.addEventListener('error',e=>errs.push(emp+': '+e.message));
  await new Promise(r=>setTimeout(r,600));
  const t=id=>(w.document.getElementById(id)||{}).innerHTML||'';
  const ok=(c,m)=>{console.log((c?'✅':'❌')+` [${emp}] `+m); if(!c)errs.push(m);};
  await checks(w,t,ok);
  return errs;
}

(async()=>{
  let E=[];
  E=E.concat(await testEmp('liberty', async(w,t,ok)=>{
    ok(t('tab0').includes('Total Aportado') && t('tab0').includes('600'),'Aportes derivados das receitas (R$600k)');
    ok(t('tab0').includes('617.500'),'Retiradas completas via CSV: 617,5k (inclui dia>12 que o JSON perdia)');
    w.switchTab(3); await new Promise(r=>setTimeout(r,150));
    ok(t('tab3').includes('28/12/2024') && t('tab3').includes('16/03/2026'),'Retiradas com dia>12 presentes no histórico');
    w.switchTab(0); await new Promise(r=>setTimeout(r,100));
    ok(t('tab0').includes('Rendimentos de Aplicações'),'KPI Rendimentos na aba Geral');
    w.switchTab(11); await new Promise(r=>setTimeout(r,150));
    const S=t('tab11');
    ok(S.includes('Permutantes'),'Sociedade: bloco permutantes');
    // devido: casa 1 quitada, base 400k (sem INCC) × 22% × 0.88 = 77.440
    ok(S.includes('77.440'),'Devido permutante = 22%×0,88×400k = R$77.440');
    ok(S.includes('INCC retido'),'INCC retido p/ construtores presente');
    ok(S.includes('Hipótese A') && S.includes('Hipótese B'),'IDPAX: duas hipóteses');
    ok(S.includes('160.000') || S.includes('Despesa realizada'),'Despesas do layout 7 colunas capturadas');
    w.switchTab(9); await new Promise(r=>setTimeout(r,700));
    ok(t('tab9').includes('Retiradas idênticas'),'Check de retiradas gêmeas dispara');
    w.switchTab(11); await new Promise(r=>setTimeout(r,150));
    ok(S.includes('Rendimentos de Aplicações') && S.includes('11.000'),'Rendimentos totais R$11.000');
    w.switchTab(7); await new Promise(r=>setTimeout(r,150));
    ok(t('tab7').includes('Casa a Casa') && t('tab7').includes('CS 01'),'Gestão de Vendas derivada (CS 01)');
  }));
  E=E.concat(await testEmp('bossa', async(w,t,ok)=>{
    ok(t('tab0').includes('Estrutura de capital incompleta'),'Aviso de capital incompleto no Bossa');
    w.switchTab(11); await new Promise(r=>setTimeout(r,150));
    const S=t('tab11');
    ok(S.includes('Harmony'),'Permuta: título Harmony');
    // casa 7 quitada, base 300k+10k INCC=310k ×0.1884×0.87=50.811
    ok(S.includes('270.300'),'Devido progressivo casa 7 = 93%×310k − 6%×300k = R$270.300');
    ok(S.includes('PAGO ALÉM DO DEVIDO'),'Antecipação detectada (pago 400k > devido ~367k)');
    ok(S.includes('Divergência controle'),'Divergência controle × planilha (CS 24) sinalizada');
    ok(S.includes('CS 07') && S.includes('CS 64'),'13 casas permutadas listadas');
    w.switchTab(9); await new Promise(r=>setTimeout(r,700));
    ok(t('tab9').includes('Devolução de AFAC maior'),'Auditoria: check devolução AFAC > AFACs');
    w.switchTab(7); await new Promise(r=>setTimeout(r,150));
    ok(t('tab7').includes('sem casa no descritivo'),'Vendas: alerta CRED PIX sem casa');
  }));
  E=E.concat(await testEmp('jazz', async(w,t,ok)=>{
    ok(t('tab0').includes('Total Aportado'),'Jazz: dashboard carrega no modelo 2 abas');
    w.switchTab(7); await new Promise(r=>setTimeout(r,300));
    const GVt=t('tab7');
    ok(GVt.includes('GESTÃO VENDAS'),'GV: painel lê a aba curada');
    ok(GVt.includes('Retido líquido'),'GV: retido líquido dos distratos');
    ok(GVt.includes('EM ANDAMENTO mas recebimentos cobrem'),'GV: divergência status × recebimentos (CS 05)');
    ok(GVt.includes('NÃO está na aba GESTÃO VENDAS'),'GV: casa com receitas fora da curada (CS 07)');
    ok(GVt.includes('Entregues e devendo') && GVt.includes('1 casas'),'GV: KPI entregues e devendo');
    ok(GVt.includes('2.640')||GVt.includes('2.640,00'),'GV: retido usa RECEBIDO DISTRATADOS curado (6000−3000−360=2.640)');
    w.switchTab(11); await new Promise(r=>setTimeout(r,150));
    ok(t('tab11').includes('Permutante Jazz'),'Jazz: permutante casas 01-10 configurado');
    w.switchTab(9); await new Promise(r=>setTimeout(r,700));
    ok(t('tab9').includes('Reclassificações automáticas aplicadas'),'Item 1: rastro da reclassificação Rafael Santos');
    ok(t('tab9').includes('Candidatos a ALIMENTAÇÃO'),'Alimentação: card de candidatos');
    ok(t('tab9').includes('÷R$14') || t('tab9').includes('operário·dias'),'Alimentação: divisibilidade da diária André (1260=14×90)');
    ok(t('tab9').includes('SUPERMERCADO') || t('tab9').includes('mercado'),'Alimentação: compra de mercado detectada');
    ok(!/LIMA VERDE[\s\S]{0,160}operário·dias/.test(t('tab9')),'Alimentação: homônimo (Lima Verde) fora da regra da diária');
    ok(!t('tab9').includes('MATERIAL DE LIMPEZA'),'Alimentação: limpeza no atacadista EXCLUÍDA');
    w.switchTab(6); await new Promise(r=>setTimeout(r,200));
    const rfEl=w.document.getElementById('rf_pctObraExec');
    if(rfEl){ rfEl.value='50'; rfEl.dispatchEvent(new w.Event('input')); await new Promise(r=>setTimeout(r,150)); }
    ok(t('tab6').includes('Custo por m² de obra') || t('tab6').includes('custo por m²') || t('tab6').includes('m² de obra'),'Item 4: seção custo/m² no Resultado Final');
    w.switchTab(8); await new Promise(r=>setTimeout(r,700));
    ok(t('tab8').includes('Rendimentos de Aplicações (3 SPEs)'),'Consolidado: rendimentos das 3 SPEs');
    ok(t('tab8').includes('Bossa Nova'),'Consolidado: 3 empreendimentos');
    ok(t('tab8').includes('Volume de Compras'),'Consolidado: seção Volume de Compras');
    ok(t('tab8').includes('Gasto total do grupo desde o início'),'KPI 3: gasto total do grupo');
    ok(t('tab8').includes('Ano a ano') && t('tab8').includes('Mês a mês'),'Toggle ano/mês presente');
    ok(t('tab8').includes('clique para filtrar'),'Consolidado: ranking de fornecedores');
    ok(/LOJA|Loja/.test(t('tab8')),'Fornecedor consolidado das 3 obras presente');
    // cartão de negociação: expande o primeiro fornecedor
    const row=w.document.querySelector('.forn-consol-row');
    if(row){ row.click(); await new Promise(r=>setTimeout(r,120)); }
    ok(t('tab8').includes('Total com este fornecedor desde o início'),'KPI 1: total com o fornecedor (filtro ativo)');
    ok(t('tab8').includes('Pagamentos a') && t('tab8').includes('ordenar'),'Item 2: tabela de pagamentos do fornecedor');
    w.volSort('v'); await new Promise(r=>setTimeout(r,80));
    ok(t('tab8').includes('▼') || t('tab8').includes('▲'),'Item 2: ordenação por valor ativa');
    ok(t('tab8').includes('Filtrado por:'),'Filtro por fornecedor aplicado a toda a seção');
    w.volSetGran('mes'); await new Promise(r=>setTimeout(r,80));
    ok(t('tab8').includes('Mês a mês') && /jan|fev|mar|mai|jul/.test(t('tab8')),'Visão mensal do fornecedor');
    w.volSetForn(null); await new Promise(r=>setTimeout(r,80));
    ok(!t('tab8').includes('Filtrado por:'),'Limpar filtro volta ao grupo');
    ok(t('tab8').includes('Ranking por Categoria'),'Consolidado: ranking por categoria');
    ok(t('tab8').includes('Fornecedor - Aquisição de materiais')||t('tab8').includes('Aquisição'),'Categoria real no ranking');
    // aba Análise
    w.switchTab(12); await new Promise(r=>setTimeout(r,900));
    const AN=t('tab12');
    ok(AN.includes('Famílias de custo'),'Análise: tabela de famílias');
    ok(AN.includes('Materiais ÷ Mão de obra')||AN.includes('Índice Materiais'),'Análise: índice mat/MO');
    ok(AN.includes('alinhadas pela idade'),'Análise: alinhamento por idade');
    ok(AN.includes('Tendência por família'),'Análise: tendências');
    ok(AN.includes('área EXECUTADA'),'Análise: custo/m² executado por obra');
    ok(AN.includes('projeção'),'Análise: projeção de custo final/m²');
    ok(AN.includes('Curva ABC'),'Análise: curva ABC de materiais');
    ok(AN.includes('Auditoria do filtro de custo de obra'),'Filtro: seção de auditoria');
    ok(AN.includes('custo de obra filtrado'),'Filtro: totais por obra lado a lado');
    ok(AN.includes('Mão de obra — visão profunda'),'Análise: MO profunda');
    ok(AN.includes('índice controlável')||AN.includes('Custas judiciais'),'Análise: índice judicial (só contencioso)');
    ok(AN.includes('Cartorário'),'Análise: cartorário separado, sem régua');
    ok(AN.includes('desperdício')||AN.includes('Indícios'),'Análise: indícios de desperdício');
    w.switchTab(13); await new Promise(r=>setTimeout(r,400));
    const REL=t('tab13');
    ok(REL.includes('Relatório Gerencial'),'Relatório: papel renderiza');
    ok(REL.includes('Top 10 categorias') && REL.includes('Fornecedores — Top 10'),'Relatório: tops presentes');
    ok(REL.includes('Imprimir'),'Relatório: botão de impressão');
    ok(REL.includes('dados até'),'Relatório: carimbo dados-até');
    // indicadores CFO no Resultado Final (com % preenchido no teste anterior)
    w.switchTab(6); await new Promise(r=>setTimeout(r,250));
    const RF6=t('tab6');
    ok(RF6.includes('Indicadores do Investidor'),'RF: seção CFO');
    ok(RF6.includes('TIR projetada') && RF6.includes('MOIC'),'RF: TIR e MOIC presentes');
    // busca de despesas: digitar não perde o texto (debounce re-render preserva)
    w.switchTab(5); await new Promise(r=>setTimeout(r,300));
    const inp=w.document.getElementById('despBusca');
    if(inp){ inp.value='cim'; w.despSetBusca('cim'); await new Promise(r=>setTimeout(r,600)); }
    const inp2=w.document.getElementById('despBusca');
    ok(inp2 && inp2.value==='cim','Busca despesas: texto preservado após re-render');
    // toggle: clica, confere que abriu, clica de novo e confere que fechou
    const rowT=w.document.querySelector('.forn-consol-row');
    if(rowT){ rowT.click(); await new Promise(r=>setTimeout(r,120)); }
    ok(t('tab8').includes('Filtrado por:'),'Item 2: clique reabre a lista');
    const rowT2=w.document.querySelector('.forn-consol-row');
    if(rowT2){ rowT2.click(); await new Promise(r=>setTimeout(r,120)); }
    ok(!t('tab8').includes('Filtrado por:'),'Item 2: segundo clique oculta a lista (toggle)');
  }));
  console.log('\n'+(E.length?('❌ FALHAS: '+E.length+'\n'+E.join('\n')):'🎉 TODOS OS TESTES PASSARAM'));
  process.exit(E.length?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
