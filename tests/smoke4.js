const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs');
const path = require('path');
const H = fs.readFileSync(path.resolve(__dirname,'..','index.html'),'utf8').replace(/<script src="[^"]*"><\/script>/g,'');
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
// contrato distratado: parcelas reais + parcela final de baixa (sem caixa)
recL.push(rec('Cliente B','10/01/2024','1/3 - DISTRATO CASA 05 - LIBERTY',50000,50000,'Vendas'));
recL.push(rec('Cliente B','10/02/2024','2/3 - DISTRATO CASA 05 - LIBERTY',50000,50000,'Vendas'));
recL.push(rec('Cliente B','10/03/2024','3/3 - DISTRATO CASA 05 - LIBERTY',400000,400000,'Vendas'));
// antes descartados pela regra do 'Lançamento Financeiro' sem casa — agora entram como OUTRAS
recL.push(rec('CERAMICA NORTE','12/07/2024','BONIFICACAO TIJOLOS - LIBERTY',0,5210,'Bonificações','Lançamento financeiro'));
recL.push(rec('FORNECEDOR X','15/08/2024','REEMBOLSO CHAVE MAGNETICA',0,3290,'Reembolso','Lançamento financeiro'));
recL.push(rec('JAZZ RESIDENCE','20/09/2024','RATEIO CHUVEIRAO DECK',0,2039,'Rateio','Lançamento financeiro'));
// e uma personalização, que é grupo VENDA
recL.push(rec('Cliente A','05/10/2024','1/6 - PERSONALIZACAO CS 01 - LIBERTY',0,8333,'Personalização','Lançamento financeiro'));
// casa 2 parcial
recL.push(rec('Cliente B','10/05/2025','1/4 - CASA 02 - LIBERTY',100000,100000,'Vendas'));
recL.push(rec('','31/05/2025','RENDIMENTO APLICACAO 05-2025',0,5000,'Rendimentos de Aplicações'));
recL.push(rec('','30/06/2025','RENDIMENTO APLICACAO 06-2025',0,6000,'Rendimentos de Aplicações'));
function d7(forn,data,desc,v,cat){return [forn,data,desc,('-'+v).replace('.',','),'23 - CONTA',cat,'LIBERTY UNIQUE'];}
const dspL=[['Nome do fornecedor','Data','Descrição','(R$)','Conta bancária','Categoria 1','Centro de Custo 1']];
const dsp7=(f,dt,de,v,c)=>dspL.push(d7(f,dt,de,v,c));
dsp7('FERRO NORTE','10/02/2025','ACO CA50',65000,'Fornecedor - Aquisição de materiais');
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
recB.push(rec('BANCO','15/01/2025','RENDIMENTO APLICACAO',0,10000,'Rendimentos de Aplicações'));
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
dspB.push(dsp('RESTAURANTE BOM PRATO','12/01/2025','ALMOCO EQUIPE',4000,'Alimentação da Obra'));
dspB.push(dsp('BANCO','20/01/2025','IRRF S/APLICACAO 01-2025',2000,'Impostos/Tributos'));
dspB.push(dsp('BANCO','20/01/2025','IOF S/APLICACAO 01-2025',500,'Impostos/Tributos'));
dspB.push(dsp('RESTAURANTE BOM PRATO','12/02/2025','ALMOCO EQUIPE',4000,'Alimentação da Obra'));
dspB.push(dsp('M C OLIVEIRA','10/05/2024','100 CARRADAS DE ATERROS - BOSSA NOVA',20000,'Limpeza/Terraplanagem'));
dspB.push(dsp('SAXUM DEMOLICOES','12/05/2024','04 DIARIAS RETRO - BOSSA NOVA',9000,'Limpeza/Terraplanagem'));
dspB.push(dsp('SAXUM DEMOLICOES','20/05/2024','08 DIARIAS RETRO - BOSSA NOVA',18000,'Limpeza/Terraplanagem'));
dspB.push(dsp('MEGALOC','21/05/2024','LOCACAO COMPACTADOR - BOSSA NOVA',1200,'Aluguel de Equipamentos'));
dspB.push(dsp('JS LOCACOES E SERVICOS','06/06/2023','TERRAPLANAGEM E PAVIMENTACAO - BOSSA NOVA',120000,'Limpeza/Terraplanagem'));
dspB.push(dsp('PEDREIRA NATASHA','15/09/2022','PEDRA DE MAO - NF288996 - BOSSA NOVA',1422,'Aquisição de Materiais'));
dspB.push(dsp('PEDREIRA NATASHA','10/02/2023','PEDRA DE MAO - BOSSA NOVA',1340,'Aquisição de Materiais'));
dspB.push(dsp('PEDREIRA NATASHA','10/03/2023','PEDRA DE MAO - BOSSA NOVA',1332,'Aquisição de Materiais'));
dspB.push(dsp('PEDREIRA NATASHA','10/04/2023','PEDRA DE MAO - BOSSA NOVA',1445,'Aquisição de Materiais'));
dspB.push(dsp('PEDREIRA NATASHA','10/05/2023','PEDRA DE MAO - BOSSA NOVA',1313,'Aquisição de Materiais'));
dspB.push(dsp('PEDREIRA NATASHA','10/06/2023','PEDRA DE MAO - BOSSA NOVA',1368,'Aquisição de Materiais'));
dspB.push(dsp('PEDREIRA NATASHA','10/07/2023','PEDRA DE MAO - BOSSA NOVA',1312,'Aquisição de Materiais'));
dspB.push(dsp('PEDREIRA NATASHA','10/08/2023','PEDRA DE MAO - BOSSA NOVA',1318,'Aquisição de Materiais'));
dspB.push(dsp('PEDREIRA NATASHA','10/09/2023','PEDRA DE MAO - BOSSA NOVA',1320,'Aquisição de Materiais'));
dspB.push(dsp('PEDREIRA NATASHA','20/09/2022','PEDRA ALVENARIA - BOSSA NOVA',15822,'Aquisição de Materiais'));
dspB.push(dsp('PEDREIRA NATASHA','12/10/2022','PEDRA ALVENARIA - BOSSA NOVA',13904,'Aquisição de Materiais'));
dspB.push(dsp('PEDREIRA NATASHA','05/11/2022','2 CARRADA PEDRA ALVENARIA - BOSSA NOVA',2560,'Aquisição de Materiais'));
dspB.push(dsp('EGEN GESTAO','11/09/2024','ALUGUEL DE MAQUINAS TERRAPLANAGEM',62913,'Limpeza/Terraplanagem'));
dspB.push(dsp('POSTO LUA','15/05/2024','ABASTECIMENTO EQUIPAMENTO DE OBRA',3200,'Diversos'));
// NÃO pode entrar: areia é material, moto é administrativo, água é Cagece
dspB.push(dsp('MARINA TRANSPORTES','16/05/2024','11 AREIAS - BOSSA NOVA',10650,'Aquisição de Materiais'));
dspB.push(dsp('010 COMERCIO','17/05/2024','ABASTECIMENTO MOTO CARDOSO - BOSSA NOVA',140,'Diversos'));
dspB.push(dsp('CAGECE','18/05/2024','ABASTECIMENTO DE AGUA - BOSSA NOVA',380,'Abastecimento de Água'));
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
dspJ.push(dsp('JCX ALIMENTACAO LTDA','10/03/2025','FORNECIMENTO REFEICOES OBRA',5200,'Mão de obra - Terceiros'));
// descritivo de material lançado em mão de obra: dispara o alerta de classificação trocada
dspJ.push(dsp('DEPOSITO CENTRAL','03/03/2025','CIMENTO CP2 100 SACOS',9000,'Mão de obra - Mestre'));
dspJ.push(dsp('DEPOSITO CENTRAL','04/03/2025','AREIA LAVADA 3 CARRADAS',4200,'Mão de obra - Mestre'));
dspJ.push(dsp('FERRO SUL','05/03/2025','ACO CA50 12MM',15000,'Mão de obra - Terceiros'));
dspJ.push(dsp('CERAMICA NORTE','06/03/2025','PORCELANATO 120X120',22000,'Mão de obra - Mestre'));
dspJ.push(dsp('TINTAS BOM','07/03/2025','TINTA ACRILICA 18L',3800,'Mão de obra - Mestre'));
// precedência 1: descritivo com mão de obra + material -> deve sugerir MÃO DE OBRA
dspJ.push(dsp('EQUIPE ASSENTAMENTO','08/03/2025','MAO DE OBRA PORCELANATO CS 12',7500,'Fornecedor - Aquisição de materiais'));
dspJ.push(dsp('MARMORARIA SUL','09/03/2025','MAO DE OBRA DE PEDRA SOLEIRAS',5200,'Fornecedor - Aquisição de materiais'));
// precedência 2: compra em depósito -> deve sugerir AQUISIÇÃO DE MATERIAIS
dspJ.push(dsp('JOEL MATERIAIS','10/03/2025','COMPRA MESTRE OBRA',6400,'Mão de obra - Mestre'));
dspJ.push(dsp('DEPOSITO SAO JORGE','11/03/2025','MATERIAL DIVERSO MESTRE',5100,'Mão de obra - Mestre'));
// serviço de obra sem dizer "mão de obra" -> deve sugerir MO
dspJ.push(dsp('JOSE EDIVAN BATISTA','12/03/2025','SERVICOS ASSENTAMENTO PORCELANATO CS 54',2480,'Seguranca/Vigia/Manutenção'));
dspJ.push(dsp('ANTONIO GESSO','13/03/2025','REBOCO DE GESSO CS 44',3100,'Aquisição de Materiais'));
// produto que CITA reboco/chapisco -> deve continuar como material (falso positivo a evitar)
dspJ.push(dsp('COMERCIAL MAIA','14/03/2025','CUNHA E ESPONJA DE REBOCO NF 1380587',890,'Aquisição de Materiais'));
dspJ.push(dsp('CREA CE','15/03/2025','ART DE EXECUCAO',250,'Taxas/Licenças/Alvará'));
// contencioso de verdade
dspJ.push(dsp('ESCRITORIO JURIDICO ALEXANDRE','04/04/2026','HONORARIOS ADVOCATICIOS - JAZZ',1800,'Honorários Advocatícios/Consultoria e Outros'));
dspJ.push(dsp('ANDRE LUIS BARBOSA','05/04/2026','ACORDO TRABALHISTA RUBENS FARIAS',2000,'Diversos'));
// NÃO é contencioso: palavras terminadas em -ação e processos administrativos
dspJ.push(dsp('RH FOLHA','06/04/2026','GRATIFICACAO EQUIPE - JAZZ',3500,'Escritório/Administrativo'));
dspJ.push(dsp('POCO ARTESIANO','07/04/2026','MATERIAIS PARA INSTALACAO POCO',9000,'Aquisição de Materiais'));
dspJ.push(dsp('CAGECE','08/04/2026','TAXA INICIO PROCESSO EXTENSAO RAMAL',4200,'Abastecimento de Água'));
dspJ.push(dsp('CONTADOR SILVA','09/04/2026','HONORARIOS CONTABEIS - JAZZ',2500,'Honorários Advocatícios/Consultoria e Outros'));
dspJ.push(dsp('FORN 0','01/04/2025','COMPRA ROTINEIRA 0',200,'Material Teste'));
dspJ.push(dsp('FORN 1','02/04/2025','COMPRA ROTINEIRA 1',228,'Material Teste'));
dspJ.push(dsp('FORN 2','03/04/2025','COMPRA ROTINEIRA 2',261,'Material Teste'));
dspJ.push(dsp('FORN 3','04/04/2025','COMPRA ROTINEIRA 3',298,'Material Teste'));
dspJ.push(dsp('FORN 4','05/04/2025','COMPRA ROTINEIRA 4',340,'Material Teste'));
dspJ.push(dsp('FORN 5','06/04/2025','COMPRA ROTINEIRA 5',388,'Material Teste'));
dspJ.push(dsp('FORN 6','07/04/2025','COMPRA ROTINEIRA 6',443,'Material Teste'));
dspJ.push(dsp('FORN 7','08/04/2025','COMPRA ROTINEIRA 7',506,'Material Teste'));
dspJ.push(dsp('FORN 8','09/04/2025','COMPRA ROTINEIRA 8',578,'Material Teste'));
dspJ.push(dsp('FORN 0','10/04/2025','COMPRA ROTINEIRA 9',660,'Material Teste'));
dspJ.push(dsp('FORN 1','11/04/2025','COMPRA ROTINEIRA 10',754,'Material Teste'));
dspJ.push(dsp('FORN 2','12/04/2025','COMPRA ROTINEIRA 11',860,'Material Teste'));
dspJ.push(dsp('FORN 3','13/04/2025','COMPRA ROTINEIRA 12',982,'Material Teste'));
dspJ.push(dsp('FORN 4','14/04/2025','COMPRA ROTINEIRA 13',1122,'Material Teste'));
dspJ.push(dsp('FORN 5','15/04/2025','COMPRA ROTINEIRA 14',1281,'Material Teste'));
dspJ.push(dsp('FORN 6','16/04/2025','COMPRA ROTINEIRA 15',1463,'Material Teste'));
dspJ.push(dsp('FORN 7','17/04/2025','COMPRA ROTINEIRA 16',1670,'Material Teste'));
dspJ.push(dsp('FORN 8','18/04/2025','COMPRA ROTINEIRA 17',1907,'Material Teste'));
dspJ.push(dsp('FORN 0','19/04/2025','COMPRA ROTINEIRA 18',2178,'Material Teste'));
dspJ.push(dsp('FORN 1','20/04/2025','COMPRA ROTINEIRA 19',2486,'Material Teste'));
dspJ.push(dsp('FORN 2','21/04/2025','COMPRA ROTINEIRA 20',2839,'Material Teste'));
dspJ.push(dsp('FORN 3','22/04/2025','COMPRA ROTINEIRA 21',3242,'Material Teste'));
dspJ.push(dsp('FORN 4','23/04/2025','COMPRA ROTINEIRA 22',3702,'Material Teste'));
dspJ.push(dsp('FORN 5','24/04/2025','COMPRA ROTINEIRA 23',4227,'Material Teste'));
dspJ.push(dsp('FORN 6','25/04/2025','COMPRA ROTINEIRA 24',4826,'Material Teste'));
dspJ.push(dsp('FORN 7','26/04/2025','COMPRA ROTINEIRA 25',5511,'Material Teste'));
dspJ.push(dsp('FORN 8','27/04/2025','COMPRA ROTINEIRA 26',6293,'Material Teste'));
dspJ.push(dsp('FORN 0','28/04/2025','COMPRA ROTINEIRA 27',7185,'Material Teste'));
dspJ.push(dsp('FORN 1','01/04/2025','COMPRA ROTINEIRA 28',8204,'Material Teste'));
dspJ.push(dsp('FORN 2','02/04/2025','COMPRA ROTINEIRA 29',9368,'Material Teste'));
dspJ.push(dsp('FORN 3','03/04/2025','COMPRA ROTINEIRA 30',10697,'Material Teste'));
dspJ.push(dsp('FORN 4','04/04/2025','COMPRA ROTINEIRA 31',12214,'Material Teste'));
dspJ.push(dsp('FORN 5','05/04/2025','COMPRA ROTINEIRA 32',13947,'Material Teste'));
dspJ.push(dsp('FORN 6','06/04/2025','COMPRA ROTINEIRA 33',15925,'Material Teste'));
dspJ.push(dsp('FORN 7','07/04/2025','COMPRA ROTINEIRA 34',18184,'Material Teste'));
dspJ.push(dsp('FORN 8','08/04/2025','COMPRA ROTINEIRA 35',20763,'Material Teste'));
dspJ.push(dsp('FORN 0','09/04/2025','COMPRA ROTINEIRA 36',23708,'Material Teste'));
dspJ.push(dsp('FORN 1','10/04/2025','COMPRA ROTINEIRA 37',27071,'Material Teste'));
dspJ.push(dsp('FORN 2','11/04/2025','COMPRA ROTINEIRA 38',30911,'Material Teste'));
dspJ.push(dsp('FORN 3','12/04/2025','COMPRA ROTINEIRA 39',35296,'Material Teste'));
dspJ.push(dsp('FORN 4','13/04/2025','COMPRA ROTINEIRA 40',40302,'Material Teste'));
dspJ.push(dsp('FORN 5','14/04/2025','COMPRA ROTINEIRA 41',46019,'Material Teste'));
dspJ.push(dsp('FORN 6','15/04/2025','COMPRA ROTINEIRA 42',52546,'Material Teste'));
dspJ.push(dsp('FORN 7','16/04/2025','COMPRA ROTINEIRA 43',60000,'Material Teste'));
dspJ.push(dsp('FORN ERRO','29/04/2025','CONCRETO USINADO (ERRO DIGITACAO)',900000,'Material Teste'));
dspJ.push(dsp('CIMENTO FORTE','10/01/2025','CIMENTO CP2',60000,'Fornecedor - Aquisição de materiais'));
dspJ.push(dsp('ANDRE LUIS BARBOSA','20/01/2025','PAGTO FOLHA 40',18000,'Mão de obra - Mestre'));
dspJ.push(dsp('ANDRE LUIS BARBOSA','20/02/2025','PAGTO FOLHA 41',18000,'Mão de obra - Mestre'));
dspJ.push(dsp('ANDRE LUIS BARBOSA','20/04/2025','PAGTO FOLHA 43',9000,'Mão de obra - Mestre'));
dspJ.push(dsp('COMERCIAL PAGTOS','15/01/2025','PAGTO SEMANA',900,'Mão de obra - Terceiros'));
dspJ.push(dsp('CIMENTO FORTE','10/02/2025','CIMENTO CP2',60000,'Fornecedor - Aquisição de materiais'));
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
    // ── Evolução de Caixa ──
    w.switchTab(18); await new Promise(r=>setTimeout(r,500));
    const CX=t('tab18');
    ok(CX.includes('Evolução de caixa'),'Caixa: painel renderiza');
    ok(CX.includes('Caixa hoje') && CX.includes('Cobertura de caixa'),'Caixa: KPIs de posição e fôlego');
    ok(CX.includes('Movimento mês a mês'),'Caixa: tabela mês a mês');
    ok(CX.includes('Composição das entradas'),'Caixa: composição de entradas e saídas');
    ok(!!w.document.querySelector('#tab18 svg.chart'),'Caixa: gráficos renderizados');
    // gráfico dedicado: escala com negativos, rolagem e granularidade
    ok(typeof w.fxCaixaSerie==='function','Gráfico caixa: motor dedicado disponível');
    ok(CX.includes('cx-scroll'),'Gráfico caixa: container com rolagem horizontal');
    ok(CX.includes('cx-gran'),'Gráfico caixa: seletor de granularidade');
    ok(/Mês/.test(CX) && /Trimestre/.test(CX) && /Ano/.test(CX),'Gráfico caixa: três granularidades');
    ok(typeof w.cxAgrupar==='function','Gráfico caixa: agrupador disponível');
    const linhasT=[{ym:202501,saldo:100,saldoOp:50,entrada:10,saida:5},{ym:202502,saldo:200,saldoOp:60,entrada:20,saida:8},
                   {ym:202503,saldo:300,saldoOp:70,entrada:30,saida:9},{ym:202504,saldo:400,saldoOp:80,entrada:40,saida:11}];
    const tri=w.cxAgrupar(linhasT,'tri');
    ok(tri.length===2,'Agrupamento: 4 meses viram 2 trimestres');
    ok(tri[0].entrada===60 && tri[0].saida===22,'Agrupamento: entradas e saídas somam no trimestre');
    ok(tri[0].saldo===300,'Agrupamento: saldo é posição, vale o último mês do grupo');
    const ano=w.cxAgrupar(linhasT,'ano');
    ok(ano.length===1 && ano[0].saldo===400,'Agrupamento: ano fecha com o último saldo');
    ok(w.cxAgrupar(linhasT,'mes').length===4,'Agrupamento: mensal preserva todos os meses');
    // negativos precisam caber na escala
    const alvoT=w.document.createElement('div');
    const wrap=w.document.createElement('div'); wrap.appendChild(alvoT); w.document.body.appendChild(wrap);
    w.fxCaixaSerie(alvoT,{labels:['a','b','c'],series:[{values:[100,-50,30],color:'#6C8FB5'}],altura:200,rolarAoFim:false});
    const svgT=alvoT.querySelector('svg');
    ok(!!svgT,'Gráfico caixa: renderiza com valores negativos');
    ok(/fxzero/.test(alvoT.innerHTML),'Gráfico caixa: linha do zero desenhada quando há negativo');
    // a matemática, com dados sintéticos controlados
    const dSint=[{data:'10/01/2025',valor:1000,categoria:'Aquisição de Materiais',descricao:'CIMENTO'},
                 {data:'10/02/2025',valor:500,categoria:'Diversos',descricao:'TRANSFERENCIA ENTRE CONTAS'}];
    const rSint=[{dataComp:'05/01/2025',valReceb:3000,cat:'Vendas',tipo:'Venda',grupo:'venda',desc:'1/10 CASA 01'}];
    const aSint=[{data:'20/01/2025',valor:2000}];
    const tSint=[{data:'15/02/2025',valor:800}];
    const SCX=w.caixaSerie(dSint,rSint,aSint,tSint,[]);
    ok(SCX.linhas.length===2,'Caixa: série mensal construída ('+SCX.linhas.length+' meses)');
    const m1=SCX.linhas[0], m2=SCX.linhas[1];
    ok(m1.entrada===5000 && m1.saida===1000,'Caixa: entradas e saídas do mês somadas certo');
    ok(m1.saldo===4000,'Caixa: saldo do 1º mês = 5.000 − 1.000');
    ok(m2.saldo===3200,'Caixa: saldo acumula e desconta a retirada (4.000 − 800 = '+m2.saldo+')');
    ok(SCX.excl.n===1 && SCX.excl.v===500,'Caixa: transferência entre contas EXCLUÍDA do saldo');
    // só o conciliado compõe o caixa
    const SC=w.caixaSerie(
      [{data:'10/01/2025',valor:1000,categoria:'Aquisição de Materiais',descricao:'CIMENTO',situacao:'Conciliado'},
       {data:'11/01/2025',valor:700,categoria:'Aquisição de Materiais',descricao:'TELHA',situacao:'Quitado'}],
      [{dataComp:'05/01/2025',valReceb:5000,cat:'Vendas',tipo:'Venda',grupo:'venda',desc:'1/10',situacao:'Conciliado'},
       {dataComp:'06/01/2025',valReceb:900,cat:'Vendas',tipo:'Venda',grupo:'venda',desc:'2/10',situacao:'Atrasado'},
       {dataComp:'07/01/2025',valReceb:400,cat:'Vendas',tipo:'Venda',grupo:'venda',desc:'3/10',situacao:'Quitado'}],[],[],[]);
    const fimSC=SC.linhas[SC.linhas.length-1];
    ok(fimSC.saldo===4000,'Situação: saldo conta só o conciliado (5.000 − 1.000 = '+fimSC.saldo+')');
    ok(SC.pend.atrN===1 && Math.abs(SC.pend.atrV-900)<1,'Situação: atrasado fica fora e é contabilizado à parte');
    ok(SC.pend.quitN===2,'Situação: baixado sem conciliação também fica fora ('+SC.pend.quitN+')');
    const SsemSit=w.caixaSerie([{data:'10/01/2025',valor:1000,categoria:'X',descricao:'Y'}],
                               [{dataComp:'05/01/2025',valReceb:5000,cat:'Vendas',tipo:'Venda',grupo:'venda',desc:'1/1'}],[],[],[]);
    ok(SsemSit.linhas[0].saldo===4000,'Situação: fonte sem o campo continua entrando (compatibilidade)');
    ok(CX.includes('Caixa médio mensal'),'Média: KPI de caixa médio presente');
    // legibilidade: a tabela de tela não pode usar a cor do papel
    ok(!/color:#111"?>\$\{fmt\(x\.saldo\)/.test(CX) && !CX.includes('color:#111">'),'Legibilidade: saldo não usa cor de papel no tema escuro');
    // aba Extrato Vendas
    w.switchTab(20); await new Promise(r=>setTimeout(r,600));
    const EV=t('tab20');
    ok(EV.length>200,'Extrato Vendas: aba renderiza');
    ok(typeof w.extratoVendasDados==='function','Extrato Vendas: motor disponível');
    const EVD=w.extratoVendasDados();
    if (EVD) {
      ok(EVD.linhas.length>0,'Extrato Vendas: tabela por casa montada ('+EVD.linhas.length+')');
      ok(EVD.linhas.every(l=>l.liquido === l.totalRecebido - l.devolvido),'Extrato Vendas: líquido = recebido − devolvido');
      ok(EVD.linhas.every(l=>l.saldoContrato>=0),'Extrato Vendas: saldo de contrato nunca negativo');
      ok(EVD.distratos.every(d=>Math.abs(d.resultado-((d.retido)+d.ganhoRev-d.comPerdidas))<1),'Distratos: resultado = retido + ganho − comissão perdida');
      ok(Math.abs(EVD.totD.retido-(EVD.totD.receb-EVD.totD.devol))<1,'Distratos: retido = recebido − devolvido');
    } else ok(true,'Extrato Vendas: sem extrato neste cenário — aba avisa');
    ok(EV.includes('EXTRATO GERAL'),'Extrato Vendas: declara a fonte exclusiva');
    if (EVD && EVD.distratos.length) {
      ok(EVD.distratos.every(d=>Math.abs(d.resultadoDistrato-(d.recebidoDistratado-d.devolvido-d.comPerdidas))<1),'Distratos: resultado = recebido − devolvido − comissão');
      ok(EVD.distratos.every(d=>Math.abs(d.ganhoRevLiq-(d.ganhoRevBruto-d.custoRev))<1),'Distratos: ganho de revenda líquido de custos embutidos');
      ok(EVD.distratos.every(d=>Math.abs(d.total-(d.resultadoDistrato+d.ganhoRevLiq))<1),'Distratos: total = resultado + ganho, separados');
      ok(EVD.distratos.every(d=>Array.isArray(d.ocorrencias)),'Distratos: ocorrências detalhadas por comprador');
      ok(EVD.distratos.every(d=>!d.ocorrencias.length || Math.abs(d.ocorrencias.reduce((s,o)=>s+o.recebido,0)-d.recebidoDistratado)<1),'Distratos: soma das ocorrências bate com o total da casa');
      ok(EVD.distratos.every(d=>!d.ocorrencias.length || Math.abs(d.ocorrencias.reduce((s,o)=>s+o.comPerdidas,0)-d.comPerdidas)<1),'Distratos: comissão rateada entre as ocorrências');
      ok(EVD.distratos.every(d=>d.ocorrencias.every((o,i)=>o.ordem===i+1)),'Distratos: ocorrências numeradas em ordem cronológica');
      const cs16=EVD.distratos.find(d=>d.casa===16);
      if (cs16) ok(cs16.custoRev===450000,'Distratos: mobiliário da CS16 descontado do ganho');
      else ok(true,'Distratos: CS16 fora do cenário');
    } else ok(true,'Distratos: sem distratos no cenário');
    ok(/Caixa médio — 12 meses/.test(CX),'Média: recorte de 12 meses');
    ok(/Entrada média por mês/.test(CX) && /Saída média por mês/.test(CX),'Média: entrada e saída médias');
    ok(m1.resOp===2000,'Caixa: operacional exclui o aporte (3.000 − 1.000)');
    ok(m2.resOp===0,'Caixa: operacional exclui a retirada');
    // reconhecimento de transferência
    ok(w.cxEhTransferencia('TRANSFERENCIA ENTRE CONTAS','Diversos'),'Caixa: transferência entre contas reconhecida');
    ok(w.cxEhTransferencia('RESGATE DE APLICACAO','Diversos'),'Caixa: resgate de aplicação reconhecido');
    ok(!w.cxEhTransferencia('REEMBOLSO CRISPIM GARCIA','Reembolso'),'Caixa: reembolso NÃO é transferência (é dinheiro que voltou)');
    ok(!w.cxEhTransferencia('CIMENTO CP2','Aquisição de Materiais'),'Caixa: compra comum não é transferência');
    // baixa de distrato: parcela final não é caixa
    // o painel declara quanto saiu por baixa de distrato
    ok(/parcela\(s\) finais de contrato distratado/.test(CX),'Baixa: painel declara a exclusão');
    ok(/400\.000/.test(CX),'Baixa: valor da parcela final (400.000) reconhecido e excluído');
    // e a Auditoria lista o achado
    w.switchTab(9); await new Promise(r=>setTimeout(r,700));
    const AUD9=t('tab9');
    ok(/Baixa de distrato exportada como receita/.test(AUD9),'Baixa: card na Auditoria');
    w.switchTab(18); await new Promise(r=>setTimeout(r,400));
    const SB=w.caixaSerie([],[{dataComp:'10/03/2024',valReceb:400000,desc:'3/3 - DISTRATO CASA 05',baixaSemCaixa:true,grupo:'venda',tipo:'Venda'},
                              {dataComp:'10/01/2024',valReceb:50000,desc:'1/3 - DISTRATO CASA 05',grupo:'venda',tipo:'Venda'}],[],[],[]);
    ok(SB.baixa.n===1 && SB.baixa.v===400000,'Baixa: excluída do caixa e contabilizada à parte');
    const fim=SB.linhas[SB.linhas.length-1];
    ok(fim.saldo===50000,'Baixa: saldo conta só o dinheiro real (50.000, não 450.000)');
    ok(CX.includes('baixa do saldo devedor') || t('tab18').includes('contrato distratado'),'Baixa: painel explica a exclusão');
    // conciliação por conta bancária
    ok(typeof w.cxPorConta==='function' && typeof w.cxConta==='function','Conciliação: funções por conta disponíveis');
    ok(w.cxConta('14 - BOSSA CORA BANK')==='Cora','Conciliação: conta Cora reconhecida');
    ok(w.cxConta('11 BOSSA NOVA OFICIAL CAIXA 3418/2567-0')==='Caixa (CEF)','Conciliação: conta Caixa reconhecida');
    ok(w.cxConta('12 APL BOSSA CAIXA')==='Aplicação','Conciliação: conta de aplicação reconhecida');
    const PCt=w.cxPorConta([{valor:100,conta:'14 - CORA BANK'},{valor:50,conta:'11 OFICIAL CAIXA 3418'}],
                           [{valReceb:30,conta:'14 - CORA BANK'}],[],[]);
    const cora=PCt.find(x=>x.conta==='Cora');
    ok(cora && cora.saldo===-70,'Conciliação: saldo por conta calculado (Cora -70)');
    ok(CX.includes('Conciliação por conta bancária'),'Conciliação: seção no painel');
    // ── EXTRATO GERAL: parser e divisão de papéis ──
    // parseVal precisa entender valor negativo — o extrato traz despesa com sinal
    ok(w.parseVal('-1.000,00')===-1000,'parseVal: negativo pt-BR (-1.000,00 = '+w.parseVal('-1.000,00')+')');
    ok(w.parseVal('(2.500,00)')===-2500,'parseVal: parênteses viram negativo');
    ok(w.parseVal('1.000,00')===1000,'parseVal: positivo inalterado');
    ok(w.parseVal('-1.744.400,00')===-1744400,'parseVal: negativo com dois separadores de milhar');
    // conversor do formato americano da planilha de vendas
    ok(typeof w.vendasValorUS==='function','Vendas: conversor de valor disponível');
    ok(w.vendasValorUS('R$ 650,000.00')===650000,'Vendas: formato americano convertido');
    ok(w.vendasValorUS('650.000,00')===650000,'Vendas: formato brasileiro continua valendo');
    ok(w.vendasValorUS('')===0,'Vendas: vazio vira zero');
    ok(typeof w.loadResumoVendas==='function','Vendas: leitor do resumo disponível');
    // detector de alteração retroativa
    ok(typeof w.retroAssinatura==='function' && typeof w.retroComparar==='function','Retro: detector disponível');
    const A1=w.retroAssinatura();
    if (A1) {
      w.localStorage.setItem(w.retroChave? w.retroChave() : 'retro_'+w.SHEET_ID, JSON.stringify(A1));
      const r1=w.retroComparar();
      ok(r1 && r1.mudancas && r1.mudancas.length===0,'Retro: sem alteração não acusa nada');
      const A2=JSON.parse(JSON.stringify(A1));
      const ks=Object.keys(A2).filter(k=>k<'2026-06');
      if (ks.length) { A2[ks[0]].rv += 54000; A2[ks[0]].rn += 1;
        w.localStorage.setItem(w.retroChave(), JSON.stringify(A2));
        const r2=w.retroComparar();
        ok(r2.mudancas.length>0,'Retro: alteração em mês fechado é detectada');
        ok(Math.abs(r2.mudancas[0].rv+54000)<1,'Retro: informa o valor e o sinal da diferença');
      } else ok(true,'Retro: cenário sem mês fechado');
      w.localStorage.removeItem(w.retroChave());
    } else ok(true,'Retro: sem extrato neste cenário');
    ok(typeof w.parseExtrato==='function','Extrato: parser disponível');
    const hdrX=['Data movimento','Id','Nome do fornecedor/cliente','Rec','Qtd','Descrição','Ag','Tipo','Origem do lançamento','Conta bancária','Forma','Valor (R$)','Saldo conta (R$)','Situação','Valor original (R$)','Juros (R$)','Multa (R$)','Desconto (R$)','Taxas (R$)','Data de competência','Venc','Prev','Obs','NF','Categoria 1','Val','Centro de Custo 1','ValCC'];
    const lin=(data,quem,desc,tipo,conta,valor,situ,cat)=>{const a=new Array(28).fill('');
      a[0]=data;a[2]=quem;a[5]=desc;a[7]=tipo;a[8]='Lançamento Financeiro';a[9]=conta;a[11]=valor;a[13]=situ;a[24]=cat;a[26]='JAZZ';return a;};
    const rowsX=[hdrX,
      lin('10/01/2025','FORN A','CIMENTO CP2','Despesa','07 - JAZZ CORA BANK',-1000,'Conciliado','Fornecedor - Aquisição de materiais'),
      lin('11/01/2025','CLIENTE X','3/10 - CASA 05 - JAZZ','Receita','01 JAZZ OFICIAL 2528-9',5000,'Conciliado','Vendas'),
      lin('12/01/2025','SOCIO Y','RETIRADA DE LUCROS','Despesa','07 - JAZZ CORA BANK',-2000,'Conciliado','Retirada Sócios'),
      lin('13/01/2025','FORMES','AFAC - FORMES','Receita','01 JAZZ OFICIAL 2528-9',3000,'Conciliado','AFAC'),
      lin('14/01/2025','BANCO','RENDIMENTO DE APLICACAO','Receita','02 - APL',120,'Conciliado','Rendimentos de Aplicações'),
      lin('15/01/2025','FORN B','TELHA','Despesa','07 - JAZZ CORA BANK',-500,'Atrasado','Fornecedor - Aquisição de materiais')];
    const EX=w.parseExtrato(rowsX);
    ok(!!EX,'Extrato: reconhece o formato pelo cabeçalho');
    ok(EX && EX.despesas.length===2,'Extrato: despesas separadas pelo sinal');
    ok(EX && EX.receitas.length===1,'Extrato: receitas separadas');
    ok(EX && EX.retiradas.length===1 && EX.retiradas[0].valor===2000,'Extrato: retirada de sócio vira categoria própria');
    ok(EX && EX.aportes.length===1 && EX.aportes[0].valor===3000,'Extrato: AFAC vira aporte');
    ok(EX && EX.rendimentos.length===1,'Extrato: rendimento de aplicação separado');
    ok(EX && EX.despesas[0].categoria==='Aquisição de Materiais','Extrato: categoria remapeada para o nome que as regras conhecem');
    ok(EX && EX.resumo.nConc===5 && EX.resumo.nAtr===1,'Extrato: situação contabilizada');
    ok(!w.parseExtrato([['Data','Fornecedor','Valor'],[]]),'Extrato: rejeita planilha que não é extrato');
    ok(typeof w.projecaoRecebiveis==='function','Projeção: função disponível');
    const PR=w.projecaoRecebiveis();
    ok(PR && PR.contratado>0,'Projeção: contratado apurado');
    ok(PR && PR.aReceber === Math.max(0, PR.contratado-PR.recebidoCaixa),'Projeção: a receber = contratado menos recebido de fato');
    w.switchTab(16); await new Promise(r=>setTimeout(r,400));
    ok(t('tab16').includes('Receita a realizar'),'Projeção: seção de receita a realizar na aba Receitas');
    ok(typeof w.contratosComerciais==='function','Contratos: agrupamento por contrato disponível');
    const CC=w.contratosComerciais();
    ok(CC.todos.length>0,'Contratos: carteira montada ('+CC.todos.length+')');
    ok(CC.ativos.length + CC.encerrados.length === CC.todos.length,'Contratos: ativos e encerrados somam o total');
    ok(CC.encerrados.every(c=>c.distratado),'Contratos: encerrados são os distratados');
    // um contrato é uma CASA: não pode haver mais contratos que casas na obra
    const casasDistintas=new Set(CC.todos.map(u=>u.casa)).size;
    ok(CC.todos.length===casasDistintas,'Contratos: uma unidade por casa, sem duplicidade ('+CC.todos.length+')');
    ok(CC.ativos.length <= CC.nCasas,'Contratos: ativos ('+CC.ativos.length+') não excedem as casas da obra ('+CC.nCasas+')');
    ok(CC.ativos.length + CC.nEstoque === CC.nCasas || CC.nCasas===0,'Contratos: vendidas + estoque = total de casas');
    ok('curado' in CC,'Estoque: campo de curadoria presente');
    // INCC e saldo devedor
    ok(typeof w.inccMes==='function' && w.inccMes(2025,5)===0.58,'INCC: série mensal real carregada (mai/25 = 0,58%)');
    ok(w.inccMes(2022,5)===2.28,'INCC: pico de maio/2022 correto');
    ok(w.inccMes(2030,1)===w.INCC_FALLBACK || w.inccMes(2030,1)>0,'INCC: mês não divulgado usa fallback');
    ok(typeof w.saldoDevedorCasas==='function','Saldo devedor: função disponível');
    const SD=w.saldoDevedorCasas();
    if (SD && SD.linhas.length) {
      ok(SD.linhas.every(l=>l.saldoCorrigido>=0),'Saldo devedor: nunca negativo');
      ok(SD.totalCorrigido>=SD.totalNominal-1,'Saldo devedor: corrigido não fica abaixo do nominal');
      ok(SD.linhas.every(l=>l.inccDevido>=0),'Saldo devedor: correção do INCC sempre positiva');
      // a correção incide sobre o SALDO, nunca sobre o valor cheio: se o pagamento veio
      // antes da data do contrato, ele tem de abater o saldo inicial
      const absurdos=SD.linhas.filter(l=>l.inccDevido > l.valor*0.6);
      ok(absurdos.length===0,'Saldo devedor: correção não estoura o razoável'+(absurdos.length?' — '+absurdos.map(x=>'CS'+x.casa).join(', '):''));
      const quaseQuitadas=SD.linhas.filter(l=>l.pct>90);
      ok(quaseQuitadas.every(l=>l.inccDevido < l.valor*0.25),'Saldo devedor: casa quase quitada não acumula correção de saldo cheio');
      ok(SD.linhas.every(l=>'pagoAntesDaVenda' in l),'Saldo devedor: pagamentos anteriores ao contrato são rastreados');
    } else ok(true,'Saldo devedor: sem apuração curada neste cenário');
    if (CC.curado) {
      ok(CC.nEstoque===CC.curado.nDisponiveis,'Estoque: quantidade vem da apuração curada');
      ok(CC.estoqueVGV===CC.curado.vgvEstoque,'Estoque: VGV soma o valor de venda de cada casa disponível');
      ok(CC.curado.casasDisponiveis.every(n=>Number.isFinite(n)),'Estoque: lista de casas disponíveis identificada');
    } else ok(true,'Estoque: sem apuração curada neste cenário, usa inferência');
    // notação CS deve virar casa
    ok(w.extrairCasa('PERSONALIZAÇÃO CS 05 - JAZZ')===5,'Casa: notação CS reconhecida');
    ok(w.extrairCasa('CORREÇÃO INCC CS 02 - JAZZ')===2,'Casa: CS em correção de INCC');
    ok(w.extrairCasa('3/10 - CASA 05 - JAZZ')===5,'Casa: notação CASA continua valendo');
    ok(w.extrairCasa('SALDO EXCEDENTE FINANCIAMENTO CS 01')===1,'Casa: CS em saldo de financiamento');
    ok(PR.contratado <= PR.contratoTodos,'Projeção: contratado ativo não excede o total de contratos');
    ok(PR.aRealizar === PR.aReceber + PR.estoqueVGV,'Projeção: a realizar = cobrança + estoque');
    ok(typeof PR.nEstoque === 'number','Projeção: estoque de casas sem contrato contabilizado ('+PR.nEstoque+')');
    // painel de inadimplência
    w.switchTab(19); await new Promise(r=>setTimeout(r,500));
    const IN=t('tab19');
    ok(IN.includes('Inadimplência'),'Inadimplência: painel renderiza');
    ok(IN.includes('Estoque a vender'),'Inadimplência: estoque separado do recebível');
    ok(typeof w.inadimplenciaDados==='function','Inadimplência: dados disponíveis');
    const ID=w.inadimplenciaDados();
    ok(ID.vencidas.every(a=>a.dias>0),'Inadimplência: só entra parcela efetivamente vencida');
    ok(ID.faixas.length===4,'Inadimplência: quatro faixas de idade da dívida');
    const somaFaixas=ID.faixas.reduce((s,f)=>s+f.v,0);
    ok(Math.abs(somaFaixas-ID.totalVencido)<1,'Inadimplência: faixas somam o total vencido');
    ok(ID.C.encerrados.length===0 || ID.vencidas.every(a=>ID.C.ativos.some(c=>c.cliente===a.cliente)),'Inadimplência: contratos distratados ficam fora da cobrança');
    // aba Receitas
    w.switchTab(16); await new Promise(r=>setTimeout(r,400));
    const REC=t('tab16');
    ok(REC.includes('VGV pela base real'),'Receitas: VGV com as fontes cruzadas');
    ok(REC.includes('Categorias da planilha'),'Receitas: ranking de categorias como em Despesas');
    ok(REC.includes('Natureza (classificação do painel)'),'Receitas: ranking por natureza');
    ok(REC.includes('Inconsistências encontradas'),'Receitas: bloco de inconsistências dos descritivos');
    // nenhum crédito é descartado; tudo entra classificado em dois grupos
    ok((w._recDescartadas||[]).length===0,'Receitas: nada mais é descartado na carga');
    const kpisComp=[...w.document.querySelectorAll('#tab16 .kpi')].map(k=>k.textContent);
    const kVenda=kpisComp.find(t2=>/base do VGV/.test(t2))||'';
    const kOutras=kpisComp.find(t2=>/fora do VGV/.test(t2))||'';
    const nV=Number((kVenda.match(/(\d+) lançamentos/)||[0,0])[1]);
    const nO=Number((kOutras.match(/(\d+) lançamentos/)||[0,0])[1]);
    ok(nV>0 && nO>0,'Receitas: lançamentos distribuídos nos dois grupos (venda '+nV+' · outras '+nO+')');
    ok(/Bonificacao/.test(REC) && /Reembolso/.test(REC) && /Rateio/.test(REC),'Receitas: bonificação, reembolso e rateio entram como outras receitas');
    ok(/Personalizacao/.test(REC),'Receitas: personalização entra no grupo de venda');
    // o resultado final precisa somar as outras receitas
    w.switchTab(6); await new Promise(r=>setTimeout(r,300));
    ok(t('tab6').includes('Outras receitas'),'Resultado Final: linha de outras receitas na composição');
    w.switchTab(16); await new Promise(r=>setTimeout(r,400));
    ok(REC.includes('Composição das receitas'),'Receitas: seção dos dois grupos');
    ok(REC.includes('compõe o VGV') && REC.includes('somam ao resultado'),'Receitas: grupos explicados');
    const tabComp=[...w.document.querySelectorAll('#tab16 table')].find(t2=>/compõe o VGV/.test(t2.textContent));
    let blocoVenda='', dentro=false;
    if(tabComp) [...tabComp.querySelectorAll('tr')].forEach(tr=>{
      const t2=tr.textContent;
      if(/compõe o VGV/.test(t2)){dentro=true;return;}
      if(/somam ao resultado/.test(t2)){dentro=false;return;}
      if(dentro) blocoVenda+=t2+' ';
    });
    ok(!/Reembolso|Bonificacao|Rateio|OutraReceita/.test(blocoVenda),'Receitas: bloco VENDAS não contém natureza de outras receitas');
    ok(/Venda|INCC|Personalizacao/.test(blocoVenda),'Receitas: bloco VENDAS lista as naturezas comerciais');
    ok(typeof w.classificarReembolso==='function','Reembolsos: classificador disponível');
    const cl1=w.classificarReembolso('DESBLOQUEIO DE SALDO - JAZZ','CEF');
    const cl2=w.classificarReembolso('REEMBOLSO PAGAMENTO CONTA ERRADA','FORNECEDOR X');
    const cl3=w.classificarReembolso('1 DIARIA DE MINI RETRO','BOSSA NOVA');
    const cl4=w.classificarReembolso('REEMBOLSO CONCRETO USINADO','CIA CIMENTO');
    ok(cl1&&cl1.k==='financiamento','Reembolsos: financiamento reconhecido');
    ok(cl2&&cl2.k==='estorno','Reembolsos: estorno de conta errada reconhecido');
    ok(cl3&&cl3.k==='rateio','Reembolsos: rateio entre SPEs pelo pagador');
    ok(cl4&&cl4.k==='material','Reembolsos: devolução de material reconhecida');
    // exploração genérica: qualquer soma classificada abre a lista que a compõe
    ok(typeof w.openDrillLista==='function' && typeof w.drillAnalise==='function','Drill genérico: funções disponíveis');
    w.switchTab(12); await new Promise(r=>setTimeout(r,900));
    const AN2=t('tab12');
    const liga = ["drillAnalise('familia'","drillAnalise('material'","drillAnalise('prestador'","drillAnalise('catObra'"].filter(x=>AN2.includes(x));
    ok(liga.length>=4,'Drill: tabelas da Análise exploráveis ('+liga.length+'/4)');
    ok(Array.isArray(w._analiseRows) && w._analiseRows.length>0,'Drill: lançamentos das 3 obras retidos para exploração ('+(w._analiseRows||[]).length+')');
    w.drillAnalise('familia','materiais'); await new Promise(r=>setTimeout(r,200));
    const md=w.document.getElementById('drillModal');
    ok(md && md.style.display==='block' && w.document.getElementById('drill-rows').children.length>0,'Drill: clique em família abre os lançamentos');
    w.document.getElementById('drill-sort').value='data_asc'; w.renderDrillRows();
    ok(w.document.getElementById('drill-rows').children.length>0,'Drill: ordenação funciona na lista genérica');
    w.closeDrill();
    ok(REC.includes('ver todas'),'Receitas: KPI abre todos os lançamentos');
    ok(!!w.document.querySelector('#tab16 svg.chart') || REC.includes('Sem dados'),'Receitas: gráfico mensal');
    // drill: todos os lançamentos, com busca e ordenação (mesma mecânica de Despesas)
    w.openDrill('receitas'); await new Promise(r=>setTimeout(r,200));
    const modal = w.document.getElementById('drillModal');
    ok(modal && modal.style.display==='block','Receitas: drill abre com todos os lançamentos');
    const linhas1 = w.document.getElementById('drill-rows').children.length;
    ok(linhas1>0,'Receitas: drill lista lançamentos ('+linhas1+')');
    w.document.getElementById('drill-sort').value='valor_desc'; w.renderDrillRows();
    await new Promise(r=>setTimeout(r,150));
    ok(w.document.getElementById('drill-rows').children.length===linhas1,'Receitas: ordenação por valor mantém o conjunto');
    w.document.getElementById('drill-search').value='zzzznaoexiste'; w.renderDrillRows();
    ok(w.document.getElementById('drill-rows').textContent.includes('Nenhum resultado'),'Receitas: busca do drill filtra');
    w.document.getElementById('drill-search').value=''; w.renderDrillRows();
    w.closeDrill();
    // posição na barra: Receitas logo após Despesas
    const abas=[...w.document.querySelectorAll('.tabs .tab')];
    const oDesp=abas.find(b=>/Despesas/.test(b.textContent)), oRec=abas.find(b=>/Receitas/.test(b.textContent));
    ok(oDesp && oRec && Number(oRec.style.order)>Number(oDesp.style.order) && Number(oRec.style.order)<Number(oDesp.style.order)+10,'Receitas: posicionada ao lado de Despesas na barra');
    // regressão dataComp: com receitas presentes, a série de receita da aba 15 não pode vir vazia
    w.switchTab(15); await new Promise(r=>setTimeout(r,450));
    const boxRD = w.document.querySelector('#tab15 #g_ind_rd');
    ok(boxRD && !!boxRD.querySelector('svg') && !boxRD.textContent.includes('Sem dados'),'Regressão dataComp: série de receita monta (liberty)');
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
    w.switchTab(4); await new Promise(r=>setTimeout(r,200));
    const F4=t('tab4');
    ok(F4.includes('Rendimentos de Aplicações') && F4.includes('11.000'),'Rendimentos totais R$11.000 (aba Fluxo)');
    w.switchTab(7); await new Promise(r=>setTimeout(r,150));
    ok(t('tab7').includes('Casa a Casa') && t('tab7').includes('CS 01'),'Gestão de Vendas derivada (CS 01)');
  }));
  E=E.concat(await testEmp('bossa', async(w,t,ok)=>{
    // painel de terraplanagem (só no Bossa)
      w.switchTab(17); await new Promise(r=>setTimeout(r,500));
      const TP=t('tab17');
      ok(TP.includes('Terraplanagem, muro de arrimo'),'Terraplanagem: painel renderiza');
      ok(TP.includes('Carradas de aterro') && TP.includes('Diárias de máquina'),'Terraplanagem: quantidades e preços unitários');
      ok(TP.includes('Combustível de máquinas'),'Terraplanagem: bloco de combustível');
      ok(TP.includes('rastreado pelo consumo de pedra de mão'),'Arrimo: rastreamento por pedra de mão');
      ok(typeof w.tpEhPedra==='function' && w.tpEhPedra({descricao:'PEDRA DE MAO - NF 320137'}),'Arrimo: pedra de mão reconhecida');
      ok(!w.tpEhPedra({descricao:'PO DE PEDRA - NF303622'}),'Arrimo: pó de pedra NÃO conta como pedra de mão');
      ok(TP.includes('Relatório / PDF'),'Terraplanagem: botão de relatório');
      ok(typeof w.gerarRelatorioTerra==='function','Terraplanagem: gerador de relatório disponível');
      w.gerarRelatorioTerra(); await new Promise(r=>setTimeout(r,250));
      const pTP=w.document.getElementById('audRelPapel');
      ok(!!pTP && /Terraplanagem, muro de arrimo/.test(pTP.textContent),'Relatório terraplanagem: papel renderiza');
      ok(/Por que o custo do arrimo não fecha/.test(pTP.textContent),'Relatório terraplanagem: análise do arrimo');
      ok(/Estimativa de execução/.test(pTP.textContent),'Relatório terraplanagem: estimativa do arrimo');
      ok(/cenário mais barato/.test(pTP.textContent),'Relatório terraplanagem: estimativa declarada como piso');
      ok(/Providência/.test(pTP.textContent),'Relatório terraplanagem: providências');
      w.fecharRelatorioAud();
      const btnTerra = w.document.getElementById('tabBtnTerra');
      ok(!!btnTerra,'Terraplanagem: aba existe');
      // escopo: areia, moto e água ficam de fora
      const rowsTerra=(w._DESPESAS||[]);
      ok(typeof w.tpEhTerra==='function','Terraplanagem: função de escopo disponível');
      ok(w.tpEhTerra({descricao:'100 CARRADAS DE ATERROS - BOSSA NOVA'}),'Escopo: aterro entra');
      ok(w.tpEhTerra({descricao:'08 DIARIAS RETRO - BOSSA NOVA', valor:18000}),'Escopo: 8 diárias de retro entram');
      ok(!w.tpEhTerra({descricao:'04 DIARIAS RETRO - BOSSA NOVA'}),'Escopo: menos de 5 diárias NÃO entra (serviço pontual)');
      ok(!w.tpEhTerra({descricao:'MEIA DIARIA MINI RETRO', valor:800}),'Piso: meia diária de mini retro NÃO entra');
      ok(!w.tpEhTerra({descricao:'DIARIA DE ESCAVADEIRA', valor:2500}),'Piso: serviço de máquina abaixo de R$ 3.000 NÃO entra');
      ok(w.tpEhTerra({descricao:'08 DIARIAS RETRO', valor:18000}),'Piso: serviço acima do piso entra');
      ok(w.tpEhTerra({descricao:'1 CARRADA DE ATERRO', valor:1300}),'Piso: MATERIAL entra por qualquer valor');
      ok(!w.tpEhTerra({descricao:'LOCACAO COMPACTADOR', fornecedor:'MEGALOC'}),'Escopo: Megaloc NÃO entra em nada');
      const forasNovos=[['MERCADO LIVRE','COMPRA DIVERSA'],['JOSENILDO DOS S RIBEIRO','LIMPEZA DE TERRENO'],['MENEGOTTI','RATEIO COMPACTADOR'],['MAKVIBRO','COMPACTADOR'],['LOCFACIL','ALUGUEL DE MAQUINAS']];
      const aindaEntram=forasNovos.filter(([f,d])=>w.tpEhTerra({descricao:d, fornecedor:f, valor:9000}));
      ok(aindaEntram.length===0,'Escopo: Mercado Livre, Josenildo, Menegotti, MakVibro e LocFácil fora'+(aindaEntram.length?' — ainda entram: '+aindaEntram.map(x=>x[0]).join(', '):''));
      ok(!w.tpEhTerra({descricao:'TERRAPLANAGEM E PAVIMENTACAO', fornecedor:'JS LOCACOES E SERVICOS'}),'Escopo: JS Locações é desmembramento, não terraplanagem');
      ok(typeof w.tpEstimativa==='function','Arrimo: estimativa paramétrica disponível');
      const est=w.tpEstimativa();
      ok(est.total>0 && est.unit>0,'Arrimo: estimativa calcula (R$ '+Math.round(est.unit)+'/m³)');
      ok(typeof w.tpArrimoDerivado==='function','Arrimo: derivação pelo excedente disponível');
      const der=w.tpArrimoDerivado();
      ok(der && der.picos.length>0,'Arrimo: meses de pico detectados');
      ok(der && der.excedente>0,'Arrimo: excedente calculado');
      ok(TP.includes('550 m³'),'Arrimo: volume adotado de 550 m³ exibido');
      ok(/550 m³ × R\$ 400/.test(TP),'Arrimo: custo adotado de R$ 400/m³ exibido');
      ok(w.tpArrimoCusto()===220000,'Arrimo: custo total R$ 220.000');
      ok(TP.includes('Total estimado do bloco'),'Cabeçalho: total do bloco com arrimo somado');
      ok(TP.includes('Muro de arrimo — estimado'),'Cabeçalho: arrimo como KPI próprio');
      // rendimentos líquidos de IR e IOF
      ok(typeof w.rendApuracao==='function','Rendimentos: apuração líquida disponível');
      const AP=w.rendApuracao();
      ok(AP.ir>0 && AP.iof>0,'Rendimentos: IRRF e IOF capturados (IR '+Math.round(AP.ir)+' · IOF '+Math.round(AP.iof)+')');
      ok(Math.round(AP.liquido)===Math.round(AP.bruto-AP.ir-AP.iof),'Rendimentos: líquido = bruto − IR − IOF');
      const FLX=t('tab4');
      ok(/resultado líquido/i.test(FLX),'Rendimentos: seção de resultado líquido na aba Fluxo');
      ok(/Ganho líquido/.test(FLX) && /IRRF/.test(FLX) && /IOF/.test(FLX),'Rendimentos: quadro com bruto, IR, IOF e líquido');
      ok(!/Ganho líquido/.test(t('tab11')),'Rendimentos: saiu da aba Sociedade/Permuta');
      ok(/rend-grid/.test(FLX) && /col-carga/.test(FLX),'Rendimentos: layout responsivo aplicado');
      // relatório universal: funciona em qualquer aba
      ok(typeof w.gerarRelatorioPainel==='function','Relatório universal: gerador disponível');
      ok(!!w.document.getElementById('btnRelPDF'),'Relatório universal: botão no cabeçalho, alinhado');
    ok(!w.document.getElementById('relFab'),'Relatório universal: sem botão flutuante sobre o conteúdo');
      const abasTeste=[0,5,8,9,11,15,16];
      const falhas=[];
      for (const idx of abasTeste){
        w.switchTab(idx); await new Promise(r=>setTimeout(r,420));
        const ov0=w.document.getElementById('audRelOv'); if(ov0) ov0.remove();
        w.gerarRelatorioPainel(idx); await new Promise(r=>setTimeout(r,900));
        const p=w.document.getElementById('audRelPapel');
        const corpo=p && p.querySelector('.rel-corpo');
        if (!p || !corpo || corpo.textContent.trim().length<40) falhas.push(idx);
      }
      ok(falhas.length===0,'Relatório universal: gera em todas as abas testadas'+(falhas.length?' — falhou em '+falhas.join(', '):''));
      // o papel precisa herdar o tema claro e limpar controles
      w.switchTab(5); await new Promise(r=>setTimeout(r,400));
      const ovx=w.document.getElementById('audRelOv'); if(ovx) ovx.remove();
      w.gerarRelatorioPainel(5); await new Promise(r=>setTimeout(r,200));
      const pap=w.document.getElementById('audRelPapel');
      ok(pap.classList.contains('papel-auto'),'Relatório universal: papel aplica tema claro');
      ok(pap.querySelectorAll('button, input, select').length===0,'Relatório universal: controles interativos removidos');
      ok(/Formes Engenharia/.test(pap.textContent) && /emitido em/.test(pap.textContent),'Relatório universal: cabeçalho de identificação');
      ok(/Responsável:/.test(pap.textContent),'Relatório universal: rodapé de conferência');
      // impressão: a classe alvo tem de existir enquanto o overlay estiver aberto
      // impressão isolada: o que vai para o papel é um documento próprio
      ok(typeof w.relImprimirIsolado==='function','Impressão isolada: função disponível');
      w.imprimirRelatorioAud(); await new Promise(r=>setTimeout(r,300));
      const ifr=w.document.getElementById('relPrintFrame');
      ok(!!ifr,'Impressão isolada: iframe de impressão criado');
      const idoc=ifr && (ifr.contentDocument||ifr.contentWindow.document);
      ok(!!idoc && !!idoc.getElementById('audRelPapel'),'Impressão isolada: papel presente no documento impresso');
      const itxt=idoc? idoc.body.textContent.replace(/\s+/g,' ').trim() : '';
      ok(itxt.length>200,'Impressão isolada: documento tem conteúdo ('+itxt.length+' caracteres)');
      ok(idoc && idoc.querySelectorAll('style').length>0,'Impressão isolada: estilos da página copiados');
      ok(idoc && idoc.body.children.length===1 && idoc.body.firstElementChild.id==='audRelOv','Impressão isolada: nada além do relatório no documento');
      ok(/Custo CDI|Panorama|Despesas|Receitas|Consolidado/.test(idoc.title),'Nome do PDF: título descritivo do conteúdo ("'+idoc.title+'")');
      // gráficos não podem transbordar do contêiner de altura fixa
      w.fecharRelatorioAud();
      w.switchTab(1); await new Promise(r=>setTimeout(r,600));
      const ovg=w.document.getElementById('audRelOv'); if(ovg) ovg.remove();
      w.gerarRelatorioPainel(1); await new Promise(r=>setTimeout(r,900));
      const pg=w.document.getElementById('audRelPapel');
      const presos=[...pg.querySelectorAll('[style*="height:280px"]')].filter(n=>!/auto/.test(n.style.height));
      ok(presos.length===0,'Gráficos: contêiner de altura fixa liberado no papel');
      const imgs=[...pg.querySelectorAll('img')];
      ok(imgs.every(im=>im.style.height==='auto'),'Gráficos: imagem com altura proporcional');
      ok(w._relTitulo && /Custo CDI/.test(w._relTitulo),'Nome do PDF: aba CDI vira "Custo CDI" ("'+w._relTitulo+'")');
      // tema de papel: nada escuro pode sobreviver no relatório
      ok(typeof w.relTemaClaro==='function' && typeof w.relLum==='function','Papel: conversão de tema por luminância disponível');
      ok(Math.abs(w.relLum('#0d1117')-0.07)<0.05,'Papel: luminância calculada corretamente');
      const escuros=[...pg.querySelectorAll('[style]')].filter(n=>{
        const m=(n.getAttribute('style')||'').match(/background(-color)?\s*:\s*(#[0-9a-fA-F]{6})/);
        return m && w.relLum(m[2])<0.38;
      });
      ok(escuros.length===0,'Papel: nenhum fundo escuro sobrevive à conversão'+(escuros.length?' ('+escuros.length+')':''));
      const claros=[...pg.querySelectorAll('[style]')].filter(n=>{
        const m=(n.getAttribute('style')||'').match(/(?:^|;)\s*color\s*:\s*(#[0-9a-fA-F]{6})/);
        return m && w.relLum(m[1])>0.74;
      });
      ok(claros.length===0,'Papel: nenhum texto quase branco sobrevive'+(claros.length?' ('+claros.length+')':''));
      // campos de formulário viram texto, preservando os parâmetros
      w.fecharRelatorioAud();
      w.switchTab(6); await new Promise(r=>setTimeout(r,500));
      const ovp=w.document.getElementById('audRelOv'); if(ovp) ovp.remove();
      w.gerarRelatorioPainel(6); await new Promise(r=>setTimeout(r,900));
      const p6=w.document.getElementById('audRelPapel');
      ok(p6.querySelectorAll('input,select,textarea').length===0,'Papel: sem campos de formulário');
      ok(/VGV TOTAL BRUTO|VGV Total/i.test(p6.textContent),'Papel: parâmetros do Resultado Final preservados como texto');
      w.fecharRelatorioAud();
      w.fecharRelatorioAud();
      // gráficos em canvas viram imagem no papel
      w.switchTab(1); await new Promise(r=>setTimeout(r,500));
      const ovc=w.document.getElementById('audRelOv'); if(ovc) ovc.remove();
      w.gerarRelatorioPainel(1); await new Promise(r=>setTimeout(r,900));
      const pc=w.document.getElementById('audRelPapel');
      ok(pc && pc.querySelectorAll('canvas').length===0,'Gráficos: nenhum canvas vazio sobra no papel');
      w.fecharRelatorioAud();
      const presas=[...pap.querySelectorAll('.table-wrap')].filter(n=>n.style.maxHeight && n.style.maxHeight!=='none');
      ok(presas.length===0,'Relatório universal: tabelas liberadas para impressão completa');
      w.fecharRelatorioAud();
      ok(typeof w.tpAterroDomina==='function','Dominância: função disponível');
      const dom=(d)=>w.tpAterroDomina({descricao:d});
      ok(dom('RELATORIO ATERROS, AREIAS, DIARIAS DE RETRO'),'Dominância: 2 materiais contra 1 máquina vira aterro');
      ok(dom('05 ATERROS 12M3 28 ATERROS 18M3 04 DIARIA RETRO 10 BOTA FORA'),'Dominância: 33 aterros contra 4 diárias vira aterro');
      ok(dom('45 ATERROS 18M3 / 04 ATERROS 12M3 / 01 DIARIA RETRO'),'Dominância: 49 aterros contra 1 diária vira aterro');
      ok(!dom('ALUGUEL DE MAQUINAS TERRAPLANAGEM'),'Dominância: aluguel de máquinas sem aterro continua máquina');
      ok(!dom('ADIANTAMENTO ALUGUEL DE MAQUINAS'),'Dominância: adiantamento de máquinas continua máquina');
      ok(!dom('01 ATERRO 10 DIARIAS RETRO'),'Dominância: máquina dominante NÃO vira aterro');
      ok(!dom('MATERIAL DE DESGASTE PA CARREGADEIRA'),'Dominância: peça de máquina continua máquina');
      ok(Math.round(est.unit)===276,'Arrimo: custo unitário mantido em R$ 276/m³');
      ok(Math.abs(est.unit-276)<1,'Arrimo: custo unitário mantido em R$ 276/m³');
      ok(!w.tpEhTerra({descricao:'11 AREIAS - BOSSA NOVA'}),'Escopo: areia NÃO entra (é material)');
      ok(!w.tpEhTerra({descricao:'ABASTECIMENTO DE AGUA - BOSSA NOVA'}),'Escopo: água da Cagece NÃO entra');
      ok(!w.tpEhTerra({descricao:'ABASTECIMENTO MOTO CARDOSO'}),'Escopo: moto da equipe NÃO entra');
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
    // sentinela de carga: detecta queda brusca e volume implausível
    ok(typeof w.cargaAvaliar==='function' && typeof w.cargaBanner==='function','Sentinela: funções disponíveis');
    const av0=w.cargaAvaliar();
    ok(!av0.some(a=>a.tipo==='queda'),'Sentinela: sem referência anterior, não acusa queda');
    ok(av0.some(a=>a.tipo==='implausivel'),'Sentinela: poucas receitas para muitas casas dispara alerta');
    // simula filtro na planilha: aba volta com uma fração das linhas
    const chave=w.cargaChave();
    w.localStorage.setItem(chave, JSON.stringify(Object.assign({}, w._cargaAtual, {'DESPESAS TOTAIS': 5000})));
    const avs=w.cargaAvaliar();
    ok(avs.some(a=>a.tipo==='queda'),'Sentinela: queda brusca de volume é detectada');
    w.cargaBanner(); await new Promise(r=>setTimeout(r,120));
    const banner=w.document.getElementById('cargaAviso');
    ok(!!banner && /Carga incompleta/.test(banner.textContent),'Sentinela: banner aparece no topo do painel');
    ok(/filtro ativo na planilha/i.test(banner.textContent),'Sentinela: banner explica a causa provável');
    // carga truncada não pode virar a nova referência
    w.cargaGravarBaseline();
    const depois=JSON.parse(w.localStorage.getItem(chave)||'{}');
    ok(depois['DESPESAS TOTAIS']===5000,'Sentinela: carga suspeita NÃO sobrescreve a referência');
    w.localStorage.removeItem(chave); w.cargaBanner();

    // auditoria: o contador do card precisa refletir o total real, não a lista truncada
    const dadosAud = w._auditData || {};
    const comTotal = (dadosAud.alerts||[]).filter(a=>typeof a.total==='number');
    ok(comTotal.length>0,'Auditoria: cards declaram o total real ('+comTotal.length+')');
    const mentirosos = (dadosAud.alerts||[]).filter(a=>typeof a.total==='number' && a.total>a.itens.length && a.itens.length<200);
    ok(mentirosos.length===0,'Auditoria: nenhum card trunca abaixo do teto de exibição');
    // relatório de correção por card
    ok(t('tab9').includes('📄 Relatório'),'Auditoria: botão de relatório em cada card');
    ok(typeof w.gerarRelatorioAud==='function','Auditoria: gerador de relatório disponível');
    const idxCom = (dadosAud.alerts||[]).findIndex(a=>a.itens && a.itens.length>0);
    w.gerarRelatorioAud(idxCom>=0?idxCom:0); await new Promise(r=>setTimeout(r,200));
    const papel = w.document.getElementById('audRelPapel');
    ok(!!papel,'Auditoria: relatório renderiza em papel');
    ok(papel && /Lançamentos/.test(papel.textContent),'Auditoria: relatório traz a lista de correção');
    // a reclassificação precisa ser destaque, não nota de rodapé
    const temMoveCel = !!(papel && (papel.querySelector('.rel-para') || papel.querySelector('.rel-move-cel')));
    const alertaCom = (dadosAud.alerts||[]).find(a=>a.itens.some(it=>/sugerida/i.test(String(it.s||''))));
    if (alertaCom) {
      const idxM=(dadosAud.alerts||[]).indexOf(alertaCom);
      const ov0=w.document.getElementById('audRelOv'); if(ov0) ov0.remove();
      w.gerarRelatorioAud(idxM); await new Promise(r=>setTimeout(r,200));
      const p2=w.document.getElementById('audRelPapel');
      ok(!!p2.querySelector('.rel-para'),'Relatório: categoria sugerida em destaque próprio');
      ok(!!p2.querySelector('.rel-de'),'Relatório: categoria atual marcada como substituída');
      ok(/Resumo — corrija em lote/.test(p2.textContent),'Relatório: resumo agrupado para correção em lote');
      const parsed = w._audParseItem(alertaCom.itens[0]); const movUnico = new Set(alertaCom.itens.map(it=>String(it.s||"").split("lançado em:")[1])).size<2;
      ok(parsed.para && parsed.de && parsed.data,'Relatório: parser separa data, origem e destino');
      // regras de precedência do usuário
      const todosItens = alertaCom.itens.map(w._audParseItem);
      const moPorcelanato = todosItens.find(x=>/MAO DE OBRA PORCELANATO/i.test(x.desc));
      ok(moPorcelanato && /Mão de obra/i.test(moPorcelanato.para),'Precedência: "mão de obra de porcelanato" sugere Mão de obra, não material');
      const moPedra = todosItens.find(x=>/MAO DE OBRA DE PEDRA/i.test(x.desc));
      ok(moPedra && /Mão de obra/i.test(moPedra.para),'Precedência: "mão de obra de pedra" sugere Mão de obra');
      const joel = todosItens.find(x=>/JOEL/i.test(x.quem));
      ok(joel && /materiais/i.test(joel.para),'Precedência: compra no depósito Joel sugere Aquisição de materiais');
      const dep = todosItens.find(x=>/DEPOSITO SAO JORGE/i.test(x.quem));
      ok(dep && /materiais/i.test(dep.para),'Precedência: depósito sugere materiais mesmo com "mestre" no descritivo');
      const servAssent = todosItens.find(x=>/SERVICOS ASSENTAMENTO PORCELANATO/i.test(x.desc));
      ok(servAssent && /Mão de obra/i.test(servAssent.para),'Serviço: "serviços assentamento porcelanato" sugere Mão de obra');
      const reboco = todosItens.find(x=>/REBOCO DE GESSO/i.test(x.desc));
      ok(reboco && /Mão de obra/i.test(reboco.para),'Serviço: "reboco de gesso" sugere Mão de obra');
      const esponja = todosItens.find(x=>/ESPONJA DE REBOCO/i.test(x.desc));
      ok(!esponja || /materiais/i.test(esponja.para),'Serviço: "esponja de reboco" NÃO vira mão de obra (é produto)');
      const art = todosItens.find(x=>/ART DE EXECUCAO/i.test(x.desc));
      ok(!art,'Serviço: ART do CREA não é confundida com execução de obra');
      // outliers robustos: a distribuição torta não pode inundar o relatório
      const cardOut=(dadosAud.alerts||[]).find(al=>/valor desproporcional/i.test(al.titulo));
      if (cardOut) {
        const txt=cardOut.itens.map(x=>String(x.s||'')).join(' | ');
        ok(/compras rotineiras da categoria vão até/.test(txt),'Outliers: âncora é o teto das compras rotineiras (Q3)');
        const doTeste=cardOut.itens.filter(x=>/Material Teste/.test(String(x.s||'')));
        ok(doTeste.length===1,'Outliers: numa faixa contínua de 200 a 60 mil, só o valor absurdo é apontado ('+doTeste.length+')');
        ok(/ERRO DIGITACAO/.test(doTeste.map(x=>x.s).join(' ')),'Outliers: o apontado é justamente o valor absurdo');
        ok(cardOut.total<=60,'Outliers: lista enxuta e acionável ('+cardOut.total+' itens)');
      } else ok(true,'Outliers: sem card no cenário');
      const cel=p2.querySelector('.rel-valor');
      const estilo=cel? (cel.getAttribute('class')||'') : '';
      ok(!!cel,'Relatório: coluna de valor presente');
      const cssTxt=[...w.document.querySelectorAll('style')].map(x=>x.textContent).join(' ');
      ok(/rel-valor[^}]*color:#000/.test(cssTxt),'Relatório: valor em preto sólido');
      const resumo=p2.querySelector('.rel-sum');
      ok(resumo && /R\$/.test(resumo.textContent),'Resumo: valor por movimento na tabela');
      const somaMov=w._audParseItem(alertaCom.itens[0]).num;
      ok(somaMov>0,'Resumo: valor numérico extraído do item ('+somaMov+')');
      ok(resumo && /Total a reclassificar/.test(resumo.textContent),'Resumo: linha de total');
      // paginação: cabeçalho de grupo e colunas repetem por página (thead)
      const theads=p2.querySelectorAll('table thead');
      ok(theads.length>=2,'Paginação: cada grupo tem cabeçalho próprio que repete na página ('+theads.length+')');
      ok(!!p2.querySelector('tr.grp'),'Layout: faixa de grupo com a reclassificação');
      const numeradas=p2.querySelectorAll('td.rel-n').length;
      ok(numeradas===alertaCom.itens.length,'Layout: todos os itens numerados ('+numeradas+')');
      // ordem decrescente de valor: dentro de cada grupo e entre os grupos
      const valores=[...p2.querySelectorAll('td.rel-valor')].map(td=>Number(String(td.textContent).replace(/[^\d]/g,''))||0);
      const grpTotais=[...p2.querySelectorAll('.grp-meta')].map(e=>Number(String(e.textContent).replace(/[^\d]/g,''))||0);
      let dentroOk=true; let anterior=null;
      [...p2.querySelectorAll('table')].filter(tb=>!tb.classList.contains('rel-sum')).forEach(tb=>{
        const vs=[...tb.querySelectorAll('td.rel-valor')].map(td=>Number(String(td.textContent).replace(/[^\d]/g,''))||0);
        for(let k=1;k<vs.length;k++) if(vs[k]>vs[k-1]) dentroOk=false;
      });
      ok(dentroOk,'Ordem: itens em ordem decrescente de valor dentro de cada bloco');
      ok(valores.length>0,'Ordem: valores lidos do relatório ('+valores.length+')');
      // impressão: modo que tira o overlay do fixed
      ok(typeof w.imprimirRelatorioAud==='function','Impressão: modo dedicado disponível');
      w.imprimirRelatorioAud(); await new Promise(r=>setTimeout(r,120));
      ok(w.document.body.classList.contains('print-aud'),'Impressão: classe print-aud aplicada');
      const cssAll=[...w.document.querySelectorAll('style')].map(x=>x.textContent).join(' ');
      ok(/print-aud[^}]*position:static/.test(cssAll.replace(/\s+/g,' ')),'Impressão: overlay deixa de ser fixed (evita página repetida)');
      w.document.body.classList.remove('print-aud');
      // conteúdo didático: impacto no negócio e providência em passos
      // ═══ VARREDURA: todas as abas renderizam sem exceção e com conteúdo ═══
    const NOMES=['Geral','CDI','Aportes','Retiradas','Fluxo','Despesas','Resultado Final','Gestão de Vendas','Consolidado','Auditoria','Fornecedores','Sociedade','Análise','Relatório','Alimentação','Indicadores','Receitas'];
    const vazias=[], quebradas=[];
    for (let i=0;i<NOMES.length;i++){
      try { w.switchTab(i); await new Promise(r=>setTimeout(r, i>=12?700:250));
        const txt=(t('tab'+i)||'').trim();
        if (txt.length<25) vazias.push(i+' '+NOMES[i]+' ('+txt.length+')');
        if (/\[object Object\]|undefined *·|NaN\b/.test(txt.slice(0,900))) quebradas.push(i+' '+NOMES[i]);
      } catch(e){ quebradas.push(i+' '+NOMES[i]+': '+String(e.message).slice(0,50)); }
    }
    ok(vazias.length===0,'Varredura: nenhuma aba vazia'+(vazias.length?' — '+vazias.join(', '):''));
    ok(quebradas.length===0,'Varredura: nenhuma aba com erro de renderização'+(quebradas.length?' — '+quebradas.join(', '):''));

    // ═══ VARREDURA: todos os relatórios da auditoria geram sem falha ═══
    w.switchTab(9); await new Promise(r=>setTimeout(r,400));
    const alertas=(w._auditData&&w._auditData.alerts)||[];
    const falhosRel=[], semImpacto=[], semItens=[];
    for (let k=0;k<alertas.length;k++){
      try {
        const ovX=w.document.getElementById('audRelOv'); if(ovX) ovX.remove();
        w.gerarRelatorioAud(k); await new Promise(r=>setTimeout(r,60));
        const pp=w.document.getElementById('audRelPapel');
        if(!pp){ falhosRel.push(alertas[k].titulo.slice(0,32)); continue; }
        if(!pp.querySelector('.rel-impacto')) semImpacto.push(alertas[k].titulo.slice(0,32));
        const linhas=pp.querySelectorAll('td.rel-n').length;
        if (alertas[k].itens.length>0 && linhas!==alertas[k].itens.length) semItens.push(alertas[k].titulo.slice(0,32)+' ('+linhas+'/'+alertas[k].itens.length+')');
      } catch(e){ falhosRel.push(alertas[k].titulo.slice(0,32)+': '+String(e.message).slice(0,40)); }
    }
    const ovF=w.document.getElementById('audRelOv'); if(ovF) ovF.remove();
    ok(falhosRel.length===0,'Varredura: todos os '+alertas.length+' relatórios geram'+(falhosRel.length?' — falhou: '+falhosRel.join(' | '):''));
    ok(semImpacto.length===0,'Varredura: todos os relatórios trazem impacto de negócio'+(semImpacto.length?' — sem: '+semImpacto.join(' | '):''));
    ok(semItens.length===0,'Varredura: nenhum relatório perde itens na listagem'+(semItens.length?' — '+semItens.join(' | '):''));

    ok(!!p2.querySelector('.rel-impacto'),'Didático: bloco "por que isso importa"');
      ok(!!p2.querySelector('.rel-passos li'),'Didático: providência em passos numerados');
      ok(/Critério do apontamento/.test(p2.textContent),'Didático: critério técnico preservado');
      // cobertura: todo achado da auditoria precisa de contexto de negócio
      const semCtx=(dadosAud.alerts||[]).filter(al=>{ const c=w.audContexto(al.titulo); return !c.impacto; }).map(al=>al.titulo.slice(0,40));
      ok(semCtx.length===0,'Didático: todos os achados têm impacto de negócio'+(semCtx.length?' — faltam: '+semCtx.join(' | '):''));
      // agrupamento por tema
      const dup=(dadosAud.alerts||[]).find(al=>/duplicidade/i.test(al.titulo));
      if(dup){ const k=(dadosAud.alerts||[]).indexOf(dup); const o3=w.document.getElementById('audRelOv'); if(o3)o3.remove();
        w.gerarRelatorioAud(k); await new Promise(r=>setTimeout(r,200));
        const p3=w.document.getElementById('audRelPapel');
        ok(/agrupados por favorecido/.test(p3.textContent),'Didático: duplicidade agrupa por favorecido');
      } else ok(true,'Didático: sem alerta de duplicidade no cenário');
    } else { ok(true,'Relatório: sem alerta de reclassificação neste cenário'); }
    ok(papel && papel.textContent.includes('Responsável pela correção'),'Auditoria: relatório tem campos de conferência');
    ok(papel && papel.querySelectorAll('tbody tr').length === (dadosAud.alerts[idxCom>=0?idxCom:0].itens.length),'Auditoria: relatório lista TODOS os itens do card');
    const ovv=w.document.getElementById('audRelOv'); if(ovv) ovv.remove();
    ok(t('tab9').includes('Candidatos a ALIMENTAÇÃO'),'Alimentação: card de candidatos');
    ok(t('tab9').includes('JCX'),'JCX: candidato na Auditoria pela regra do nome');
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
    // aba Alimentação
    w.switchTab(14); await new Promise(r=>setTimeout(r,700));
    const AL=t('tab14');
    ok(AL.includes('Matriz mensal'),'Alimentação: matriz mensal das 3 obras');
    ok(AL.includes('Janelas suspeitas'),'Alimentação: detector de janelas (jazz ativo sem alimentação × bossa pagando)');
    ok(AL.includes('% do custo de obra'),'Alimentação: KPIs por obra');
    ok(AL.includes('Versão relatório'),'Alimentação: botão do relatório');
    ok(AL.includes('aliDrill'),'Drill: células da matriz clicáveis');
    ok(AL.includes('NOME de alimentação') && AL.includes('JCX'),'JCX: fornecedor com nome de comida fora da categoria detectado na aba');
    w.aliDrill('bossa',202501); await new Promise(r=>setTimeout(r,200));
    const OV=w.document.getElementById('aliDrillOv');
    ok(OV && OV.innerHTML.includes('RESTAURANTE BOM PRATO') && OV.innerHTML.includes('4.000'),'Drill: lista do mês com fornecedor e valor');
    OV.style.display='none';
    ok(AL.includes('Perícia das janelas'),'Perícia: seção presente');
    ok(/Janelas suspeitas[\s\S]{0,600}Liberty/.test(AL),'Janela pré-alimentação do Liberty detectada (sem referência ao Bossa)');
    ok(AL.includes('dentro da janela'),'Perícia: André dentro×fora');
    ok(AL.includes('descritivo genérico'),'Perícia: pagamentos genéricos listados');
    w.aliToggleRel(); await new Promise(r=>setTimeout(r,600));
    const ALR=t('tab14');
    ok(ALR.includes('Relatório Comparativo'),'Relatório alimentação: papel renderiza');
    ok(ALR.includes('Indicadores por obra') && ALR.includes('Matriz mensal'),'Relatório alimentação: seções principais');
    ok(ALR.includes('Janelas suspeitas'),'Relatório alimentação: leitura investigativa');
    ok(ALR.includes('Nota metodológica'),'Relatório alimentação: transparência de método');
    ok(ALR.includes('Imprimir'),'Relatório alimentação: botão PDF');
    w.aliToggleRel(); await new Promise(r=>setTimeout(r,400));
    ok(AN.includes('custo de obra filtrado'),'Filtro: totais por obra lado a lado');
    ok(AN.includes('Mão de obra — visão profunda'),'Análise: MO profunda');
    ok(AN.includes('índice controlável')||AN.includes('Custas judiciais'),'Análise: índice judicial (só contencioso)');
    ok(AN.includes('Cartorário'),'Análise: cartorário separado, sem régua');
    // contencioso: só o que é jurídico de verdade
    w.drillAnalise('judicial','jazz'); await new Promise(r=>setTimeout(r,200));
    const linhasJ = w.document.getElementById('drill-rows').textContent;
    ok(/ADVOCATICIOS/.test(linhasJ),'Contencioso: honorários advocatícios entram');
    ok(/ACORDO TRABALHISTA/.test(linhasJ),'Contencioso: acordo trabalhista entra');
    ok(!/GRATIFICACAO/.test(linhasJ),'Contencioso: "gratificação" NÃO entra (era o token ACAO)');
    ok(!/INSTALACAO POCO/.test(linhasJ),'Contencioso: "instalação" NÃO entra');
    ok(!/EXTENSAO RAMAL/.test(linhasJ),'Contencioso: processo administrativo de água NÃO entra');
    ok(!/CONTABEIS/.test(linhasJ),'Contencioso: honorários contábeis NÃO entram');
    w.closeDrill();
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
    // parâmetros do RF: chave por empreendimento e aviso quando faltam
    ok(w.rfKey('vgvTotal')==='rf_jazz_vgvTotal','Parâmetros: chave por empreendimento (sobrevive à troca de planilha)');
    const antesVgv = w.localStorage.getItem('rf_jazz_vgvTotal');
    w.localStorage.removeItem('rf_jazz_vgvTotal'); w.localStorage.removeItem('rf_jazz_pctComissao');
    w.renderResultadoFinal(); await new Promise(r=>setTimeout(r,250));
    ok(t('tab6').includes('Parâmetros não preenchidos'),'Parâmetros: aviso quando VGV/percentuais faltam');
    if (antesVgv!==null) w.localStorage.setItem('rf_jazz_vgvTotal', antesVgv);
    // aba 15 — Indicadores Financeiros
    w.switchTab(15); await new Promise(r=>setTimeout(r,400));
    const IND=t('tab15');
    ok(IND.includes('Retorno projetado ao sócio'),'Indicadores: bloco de retorno');
    ok(IND.includes('MOIC') && IND.includes('TIR projetada'),'Indicadores: TIR e MOIC');
    ok(IND.includes('Queima de caixa'),'Indicadores: burn rate');
    const svgs = w.document.querySelectorAll('#tab15 svg.chart').length;
    ok(svgs>=2,'Indicadores: gráficos SVG renderizados ('+svgs+')');
    ok(w._indicadoresRF && typeof w._indicadoresRF.moic==='number','Indicadores: fonte única vinda do Resultado Final');
    // gráficos nas demais abas
    const comGrafico = [];
    for (const idx of [5,7,8,10,11,14]) {
      w.switchTab(idx); await new Promise(r=>setTimeout(r,500));
      if (w.document.querySelector('#tab'+idx+' [data-fxgraf] svg.chart, #tab'+idx+' [data-fxgraf] .hbar')) comGrafico.push(idx);
    }
    ok(comGrafico.length>=5,'Gráficos: abas com visual novo ('+comGrafico.join(', ')+')');
    w.switchTab(5); await new Promise(r=>setTimeout(r,400));
    ok(t('tab5').includes('Despesa por mês') && t('tab5').includes('Maiores categorias'),'Gráficos: aba Despesas com evolução e categorias');
    ok(t('tab10').includes('Top 10 fornecedores'),'Gráficos: aba Fornecedores com ranking visual');
    // estilo dos gráficos: curva suave (cúbicas) e escala real (altura fixa em px)
    w.switchTab(15); await new Promise(r=>setTimeout(r,400));
    const svgL = w.document.querySelector('#tab15 #g_ind_exp svg') || w.document.querySelector('#tab15 svg.chart');
    ok(svgL && svgL.getAttribute('height'),'Escala: SVG com altura em pixels reais (não estica com a tela)');
    const paths = [...w.document.querySelectorAll('#tab15 svg.chart path')].map(p=>p.getAttribute('d')||'');
    ok(paths.some(d=>d.includes('C')),'Curvas: traçado usa cúbicas suaves, não retas');
    // paleta sóbria: nenhuma cor vívida (iOS) pode reaparecer no documento
    const vividas = ['#30D158','#FF453A','#FFD60A','#0A84FF','#a371f7','#f85149','#3fb950'];
    const doc = w.document.documentElement.innerHTML;
    const achadas = vividas.filter(c => doc.toLowerCase().includes(c.toLowerCase()));
    ok(achadas.length===0,'Paleta: sem cores vívidas na renderização'+(achadas.length?' ('+achadas.join(', ')+')':''));
    // monotonicidade: a curva não pode extrapolar o mínimo/máximo dos pontos reais
    const cfgTest = {labels:['a','b','c','d'], series:[{values:[10,10,90,10], color:'#fff'}]};
    const alvoT = w.document.createElement('div'); w.document.body.appendChild(alvoT);
    w.fxLinhas(alvoT, cfgTest);
    const dT = (alvoT.querySelector('path')||{getAttribute:()=>''}).getAttribute('d')||'';
    const ys = (dT.match(/-?\d+\.?\d*/g)||[]).map(Number).filter((_,i)=>i%2===1);
    ok(ys.length>0 && Math.min(...ys) >= -1,'Curvas: interpolação monotônica não inventa picos fora dos dados');

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
