/* ===================================================================
   SUPER BATTLE CHAMPIONSHIP — modo estilo Yu-Gi-Oh
   Turnos com 3 ações (comprar / colocar / atacar), elementos importam,
   cartas em ataque/defesa e viradas para cima/baixo. Só ATK e DEF contam.
   =================================================================== */
"use strict";

/* ---------- Elementos (efetividade) ---------- */
function sbNormTipo(t){ return (t||"").toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g,""); }
const SB_FORTE = {
  FOGO:["GRAMA","GELO","INSETO","ACO"], AGUA:["FOGO","TERRA","PEDRA"],
  GRAMA:["AGUA","TERRA","PEDRA"], ELETRICO:["AGUA","VOADOR"],
  GELO:["GRAMA","TERRA","VOADOR","DRAGAO"], LUTADOR:["NORMAL","GELO","PEDRA","ACO"],
  VENENO:["GRAMA","FADA"], TERRA:["FOGO","ELETRICO","VENENO","PEDRA","ACO"],
  VOADOR:["GRAMA","LUTADOR","INSETO"], PSIQUICO:["LUTADOR","VENENO"],
  INSETO:["GRAMA","PSIQUICO"], PEDRA:["FOGO","GELO","VOADOR","INSETO"],
  FANTASMA:["PSIQUICO","FANTASMA"], DRAGAO:["DRAGAO"], NORMAL:[],
  ACO:["GELO","PEDRA","FADA"], FADA:["LUTADOR","DRAGAO"]
};
const SB_FRACO = {
  FOGO:["AGUA","PEDRA","FOGO","DRAGAO"], AGUA:["AGUA","GRAMA","DRAGAO"],
  GRAMA:["FOGO","GRAMA","VENENO","VOADOR","INSETO","DRAGAO","ACO"], ELETRICO:["GRAMA","ELETRICO","DRAGAO","TERRA"],
  GELO:["FOGO","AGUA","GELO","ACO"], LUTADOR:["VENENO","VOADOR","PSIQUICO","INSETO","FADA","FANTASMA"],
  VENENO:["VENENO","TERRA","PEDRA","FANTASMA"], TERRA:["GRAMA","INSETO","VOADOR"],
  VOADOR:["ELETRICO","PEDRA","ACO"], PSIQUICO:["PSIQUICO","ACO","FANTASMA"],
  INSETO:["FOGO","LUTADOR","VENENO","VOADOR","FANTASMA","ACO","FADA"], PEDRA:["LUTADOR","TERRA","ACO"],
  FANTASMA:["NORMAL"], DRAGAO:["ACO","FADA"], NORMAL:["PEDRA","ACO","FANTASMA"],
  ACO:["FOGO","AGUA","ELETRICO","ACO"], FADA:["FOGO","VENENO","ACO"]
};
function sbEfetividade(atk, def){
  atk = sbNormTipo(atk); def = sbNormTipo(def);
  if((SB_FORTE[atk]||[]).includes(def)) return 1.5;
  if((SB_FRACO[atk]||[]).includes(def)) return 0.5;
  return 1;
}

/* ---------- Campanha Super Battle — 25 níveis, cada um com sua cor temática ---------- */
// cor = [claro, escuro] usada no verso das cartas do oponente e no ícone do nível
const NIVEIS_SUPER = [
  {n:1,  nome:"Aprendiz Duel",     raridades:["Comum"],                        lp:100, cor:["#e3553d","#a02a16"]},
  {n:2,  nome:"Duelista Rex",      raridades:["Comum"],                        lp:112, cor:["#f0902c","#b45a0c"]},
  {n:3,  nome:"Colecionadora Mel", raridades:["Comum","Incomum"],              lp:125, cor:["#f5c518","#b38a06"]},
  {n:4,  nome:"Escudeiro Verde",   raridades:["Incomum"],                      lp:138, cor:["#4caf50","#25702c"]},
  {n:5,  nome:"Mago Zane",         raridades:["Incomum"],                      lp:152, cor:["#26c6a4","#0e7a63"]},
  {n:6,  nome:"Rival Kite",        raridades:["Incomum","Raro"],               lp:167, cor:["#29b6f6","#0b6ea8"]},
  {n:7,  nome:"Nadadora Íris",     raridades:["Raro"],                         lp:183, cor:["#3f6fe0","#1e3a94"]},
  {n:8,  nome:"Mestra Aki",        raridades:["Raro"],                         lp:200, cor:["#8e5ce0","#4e2a91"]},
  {n:9,  nome:"Ninja Sombra",      raridades:["Raro"],                         lp:218, cor:["#c95bd0","#722a7a"]},
  {n:10, nome:"Kaiser Ryo",        raridades:["Raro","Super Raro"],            lp:237, cor:["#ec4899","#9b1c5c"]},
  {n:11, nome:"Alquimista Ouro",   raridades:["Super Raro"],                   lp:257, cor:["#d4a017","#8a6208"]},
  {n:12, nome:"Domador Esmeralda", raridades:["Super Raro"],                   lp:278, cor:["#12a37a","#06614a"]},
  {n:13, nome:"Sombra Yubel",      raridades:["Super Raro"],                   lp:300, cor:["#6d4fd0","#2f1f78"]},
  {n:14, nome:"Barão Índigo",      raridades:["Super Raro"],                   lp:323, cor:["#4b3fd6","#221a86"]},
  {n:15, nome:"Cavaleiro Prata",   raridades:["Super Raro","Lendário"],        lp:347, cor:["#b8c4d4","#6a7788"]},
  {n:16, nome:"Senhor Carmesim",   raridades:["Lendário"],                     lp:372, cor:["#d32f2f","#7a1010"]},
  {n:17, nome:"Dama Turquesa",     raridades:["Lendário"],                     lp:398, cor:["#17b3b8","#08696c"]},
  {n:18, nome:"Faraó Atem",        raridades:["Lendário"],                     lp:425, cor:["#e0a423","#8a5d05"]},
  {n:19, nome:"Titã Bronze",       raridades:["Lendário"],                     lp:453, cor:["#c07a3e","#6f3f18"]},
  {n:20, nome:"Imperatriz Safira", raridades:["Lendário"],                     lp:482, cor:["#2f6fd0","#123a80"]},
  {n:21, nome:"Deus Obelisco",     raridades:["Lendário","Mítico"],            lp:512, cor:["#5c7fa8","#26405c"]},
  {n:22, nome:"Deus Slifer",       raridades:["Lendário","Mítico"],            lp:545, cor:["#e14a2b","#8a1f0c"]},
  {n:23, nome:"Deus Rá",           raridades:["Lendário","Lendário Supremo"],  lp:580, cor:["#ffd24a","#c08a00"]},
  {n:24, nome:"Lorde do Vazio",    raridades:["Lendário Supremo","Mítico"],    lp:618, cor:["#5b3f8f","#1a1030"]},
  {n:25, nome:"REI DOS DUELOS",    raridades:["Lendário","Lendário Supremo","Mítico"], lp:660, cor:["#ffca3a","#8a2be2"]}
];
const MAX_NIVEL_SUPER = NIVEIS_SUPER.length;
// ouro do Championship = 5x o ouro da campanha Classic (mesma escada de níveis)
function ouroNivelSuper(nivel){ return 5 * (25 + nivel*15); }
// cores da pilha de compra do jogador — sorteada de novo a cada carta comprada
const SB_CORES_BARALHO = [
  ["#e3350d","#8a1a05"], ["#f5c518","#b38a06"], ["#2a75bb","#12406e"], ["#3bb54a","#1c6b26"],
  ["#f0902c","#a8560c"], ["#8e5ce0","#4a2790"], ["#17b3b8","#0a6165"], ["#ec4899","#8f1e56"]
];
function sbSortearCorBaralho(){
  sb.corBaralho = SB_CORES_BARALHO[Math.floor(Math.random()*SB_CORES_BARALHO.length)];
}
// encerra imediatamente o duelo em andamento (botão sair/voltar)
function sbAbortarDuelo(){
  sb.abortado = true; sb.fim = true; sb.travado = true; sb.selecao = null;
  sbLimparTurnoTimer();
  if(typeof limparTimers === "function") limparTimers();
  ["#sb-combate","#modal-sb-colocar","#modal-sb-acao","#sb-fim-pop","#sb-compra","#modal-sb-rodada"].forEach(id=>{
    const e = $(id); if(e) e.hidden = true;
  });
}
const SB_LP_INICIAL = 100, SB_LP_INCREMENTO = 20;
function custoLPSuper(){ return Math.round((progresso.lpSuper||100) * 0.8); }

/* ---------- Estado da partida ---------- */
const sb = {
  nivel:1, turnoDe:"jogador", acoes:3, lpJog:100, lpCpu:100,
  maoJog:[], maoCpu:[], baralhoJog:[], baralhoCpu:[],
  campoJog:[], campoCpu:[], selecao:null, travado:false, fim:false, avatarOp:"🃏"
};

// ataque é constante (nunca debita); defesa e vida debitam durante o duelo
function sbEfAtk(s){ return Math.max(1, s.ataque); }
function sbEfDef(s){ return Math.max(0, s.defesa); }
function sbNovoSlot(carta, modo, cima){
  const s = {carta, modo, cima:!!cima, jaAtacou:false, revelada:false, focoAtk:false, focoDef:false};
  // bônus de "virada p/ cima": +10% ataque (modo ataque) ou +20% defesa (modo defesa)
  s.ataque   = Math.max(1, Math.round(carta.ataque  * (cima && modo==="ataque" ? 1.1 : 1)));
  s.defesaMax = Math.max(0, Math.round(carta.defesa * (cima && modo==="defesa" ? 1.2 : 1)));
  s.defesa   = s.defesaMax;   // defesa é um escudo que vai sendo consumido
  s.vida     = carta.vida;
  s.vidaMax  = carta.vida;
  return s;
}
// limites de posições: até 3 em ataque, até 2 em defesa
const SB_MAX_ATK = 3, SB_MAX_DEF = 2;
function sbContar(campo, modo){ return campo.filter(s=>s.modo===modo).length; }

/* ---------- Início da partida ---------- */
function abrirCampanhaSuper(){
  mostrarTela("tela-campanha");
  $("#camp-pontos").textContent = progresso.pontos;
  $("#camp-titulo").textContent = "🃏 Super Battle Championship";
  $("#camp-desc").innerHTML = "Duelo com <b>ações</b>, elementos e cartas em ataque/defesa. Seu baralho é <b>toda a sua coleção</b>. Compre <b>LP</b> na loja (Super Batalha).";
  const cont = $("#campanha-lista");
  cont.innerHTML = "";
  NIVEIS_SUPER.forEach(info=>{
    const est = info.n < progresso.nivelSuper ? "vencido"
              : info.n === progresso.nivelSuper ? "atual" : "bloqueado";
    const el = document.createElement("button");
    el.className = "nivel-item " + est;
    el.disabled = est === "bloqueado";
    const tag = est==="vencido" ? "✔ vencido" : est==="atual" ? "▶ Duelar" : "🔒 bloqueado";
    const c = info.cor || ["#5a3ea5","#432c86"];
    el.style.setProperty("--dk1", c[0]); el.style.setProperty("--dk2", c[1]);
    el.innerHTML =
      `<span class="nivel-num nivel-tema">${info.n}</span>`+
      `<span class="nivel-info"><b>${info.nome}</b>`+
      `<small>${info.raridades.join(" · ")}</small>`+
      `<small class="nivel-ouro">❤ ${info.lp} LP · 💰 ${ouroNivelSuper(info.n)}</small></span>`+
      `<span class="nivel-tag">${tag}</span>`;
    if(est !== "bloqueado") el.onclick = ()=>iniciarSuperNivel(info.n);
    cont.appendChild(el);
  });
}

function iniciarSuperNivel(nivel){
  const info = NIVEIS_SUPER[nivel-1];
  sb.nivel = nivel;
  sb.fim = false; sb.travado = false; sb.selecao = null; sb.abortado = false;
  sb.rodadaDe = {jogador:0, cpu:0};                   // nº de turnos de cada lado (ataque só a partir do 2º)
  sb.corOp = info.cor || ["#5a3ea5","#432c86"];      // cor temática do oponente
  sbSortearCorBaralho();                             // cor da pilha de compra do jogador
  sb.lpJog = progresso.lpSuper || 100;
  sb.lpCpu = info.lp;
  sb.lpJogMax = sb.lpJog; sb.lpCpuMax = sb.lpCpu;
  sb.avatarOp = (typeof avatarDoNivel === "function") ? avatarDoNivel(nivel+9) : "🃏";
  sb.nomeOp = info.nome;
  // baralho do jogador = toda a coleção (com repetidas)
  let dj = embaralhar((progresso.owned||[]).map(cartaPorId).filter(Boolean));
  if(dj.length === 0) dj = CARTAS_INICIAIS.map(cartaPorId);
  sb.baralhoJog = dj;
  sb.maoJog = sb.baralhoJog.splice(0, Math.min(4, sb.baralhoJog.length));
  // baralho do oponente pela raridade do nível
  let pool = POKEMONS.filter(p=>info.raridades.includes(p.raridade));
  if(!pool.length) pool = POKEMONS.slice();
  sb.baralhoCpu = embaralhar(pool).slice(0, 18);
  sb.maoCpu = sb.baralhoCpu.splice(0, 4);
  sb.campoJog = []; sb.campoCpu = [];
  mostrarTela("tela-super");
  $("#sb-log").innerHTML = "";
  sbLog("Duelo contra " + info.nome + " começou!");
  sbIniciarTurno("jogador");
}

/* ---------- Controle de turno ---------- */
let _sbTurnoTimer = null, _sbTurnoRestante = 60;
function sbLimparTurnoTimer(){ clearInterval(_sbTurnoTimer); _sbTurnoTimer = null; }
// ataque liberado só a partir do 2º turno de cada lado
function sbPodeAtacar(quem){ return (sb.rodadaDe && sb.rodadaDe[quem||sb.turnoDe] || 0) >= 2; }
function sbIniciarTurno(quem){
  if(sb.abortado) return;
  sbLimparTurnoTimer();
  const mr = $("#modal-sb-rodada"); if(mr) mr.hidden = true;   // fecha a pergunta de finalizar
  sb.turnoDe = quem;
  if(sb.rodadaDe) sb.rodadaDe[quem] = (sb.rodadaDe[quem] || 0) + 1;
  sb.acoes = 3;
  sb.selecao = null;
  sb.travado = quem === "cpu";
  (quem === "jogador" ? sb.campoJog : sb.campoCpu).forEach(s=>s.jaAtacou = false);
  if(quem === "jogador"){
    // snapshot do início do turno para o "cancelar ações" (desfazer)
    sb.snapshotTurno = {
      campoJog: sb.campoJog.map(s=>({...s})),
      campoCpu: sb.campoCpu.map(s=>({...s})),
      maoJog: sb.maoJog.slice(),
      lpJog: sb.lpJog, lpCpu: sb.lpCpu
    };
    sb.compradasNoTurno = [];   // cartas compradas neste turno (não são desfeitas)
  }
  sbDesenhar();
  if(quem === "cpu"){ setTimeout(sbPassoCPU, 800); return; }
  // jogador: 60s por turno, senão perde a vez
  _sbTurnoRestante = 60;
  const el = $("#sb-timer");
  const tick = ()=>{ if(el) el.textContent = `⏱ ${_sbTurnoRestante}s`; sbAtualizarBarraTempo(); };
  tick();
  _sbTurnoTimer = setInterval(()=>{
    _sbTurnoRestante--;
    tick();
    if(_sbTurnoRestante <= 0){
      sbLimparTurnoTimer();
      if(!sb.fim && sb.turnoDe === "jogador"){ sbLog("⏱ Tempo esgotado — você perdeu a vez!"); sbEncerrarTurno(); }
    }
  }, 1000);
}
function sbGastarAcao(){
  sb.acoes--;
  if(sb.acoes <= 0){ sb.selecao = null; sbDesenhar(); setTimeout(()=>{ if(!sb.fim && !sb.abortado) sbPerguntarFinalizar(); }, 500); }
  else sbDesenhar();
}
// pergunta "Finalizar rodada?" quando o jogador usou as 3 ações
function sbPerguntarFinalizar(){
  const m = $("#modal-sb-rodada"); if(!m){ sbEncerrarTurno(); return; }
  const draws = sb.compradasNoTurno ? sb.compradasNoTurno.length : 0;
  const bc = $("#sb-rodada-cancelar");
  if(bc) bc.disabled = !sb.snapshotTurno || draws >= 3;   // se as 3 ações foram compras, nada a desfazer
  m.hidden = false;
}
// desfaz as ações do turno (posicionar/atacar/sacrificar/descartar) mantendo as cartas compradas
function sbCancelarAcoes(){
  const m = $("#modal-sb-rodada"); if(m) m.hidden = true;
  const snap = sb.snapshotTurno; if(!snap) return;
  const compradas = (sb.compradasNoTurno || []).slice();
  sb.campoJog = snap.campoJog.map(s=>({...s}));
  sb.campoCpu = snap.campoCpu.map(s=>({...s}));
  sb.lpJog = snap.lpJog; sb.lpCpu = snap.lpCpu;
  sb.maoJog = snap.maoJog.slice().concat(compradas);   // mão inicial + cartas compradas
  sb.acoes = Math.max(0, 3 - compradas.length);          // ações de compra continuam gastas
  sb.selecao = null; sb.travado = false;
  Som.play("select");
  sbLog("↩️ Ações canceladas — cartas compradas mantidas.");
  sbDesenhar();
  if(sb.acoes <= 0) sbPerguntarFinalizar();               // só sobraram compras: volta a perguntar
}
function sbEncerrarTurno(){
  if(sb.fim) return;
  const m = $("#modal-sb-rodada"); if(m) m.hidden = true;
  sbIniciarTurno(sb.turnoDe === "jogador" ? "cpu" : "jogador");
}

/* ---------- Ações do jogador ---------- */
function sbComprar(){
  if(sb.travado || sb.turnoDe !== "jogador" || sb.acoes <= 0) return;
  if(sb.baralhoJog.length === 0){ Som.play("erro"); sbMsg("Seu baralho acabou — sem cartas para comprar."); return; }
  const carta = sb.baralhoJog.shift();
  sbSortearCorBaralho();          // a pilha "troca" de carta ao comprar
  sb.travado = true;              // trava durante a animação de compra
  Som.play("select");
  sbAnimarCompra(carta, ()=>{
    sb.maoJog.push(carta);
    (sb.compradasNoTurno || (sb.compradasNoTurno=[])).push(carta);
    sb.travado = false;
    sbLog(`Você comprou ${carta.nome}.`);
    sbGastarAcao();
  });
}
// carta vem virada como pop-up, vira após 1s revelando qual é, e desce para a mão
function sbAnimarCompra(carta, done){
  const ov = $("#sb-compra"), box = $("#sb-compra-carta");
  if(!ov || !box){ done(); return; }
  const cb = sb.corBaralho || SB_CORES_BARALHO[0];
  const c1 = corTipo(carta.tipo1), c2 = corTipo(carta.tipo2 || carta.tipo1);
  box.className = "sb-compra-carta";
  box.style.setProperty("--dk1", cb[0]); box.style.setProperty("--dk2", cb[1]);
  box.innerHTML = `<div class="sb-verso-pk"></div>`;   // pokébola (verso)
  ov.hidden = false;
  requestAnimationFrame(()=> box.classList.add("entrou"));
  setTimeout(()=>{ if(sb.abortado){ ov.hidden = true; return; } box.classList.add("girando"); }, 1000);
  setTimeout(()=>{
    if(sb.abortado){ ov.hidden = true; return; }
    box.classList.remove("girando"); box.classList.add("revelou");
    box.innerHTML =
      `<div class="sb-info-carta grande" style="--c1:${c1};--c2:${c2}">
         <img src="${SPRITE(carta.id)}" onerror="this.onerror=null;this.src='${SPRITE_FALLBACK(carta.id)}'">
         <div class="sb-info-nome">${carta.nome}</div>
         <div class="sb-info-tipo">${carta.tipo1}${carta.tipo2?" / "+carta.tipo2:""}</div>
         <div class="sb-info-stats"><span>⚔️ ${carta.ataque}</span><span>🛡️ ${carta.defesa}</span><span>❤ ${carta.vida}</span></div>
       </div>`;
    Som.play("atributo");
  }, 1180);
  setTimeout(()=>{ if(sb.abortado){ ov.hidden = true; return; } box.classList.add("descendo"); }, 1950);
  setTimeout(()=>{ ov.hidden = true; box.className = "sb-compra-carta"; if(!sb.abortado) done(); }, 2400);
}
// clique numa carta da mão -> abre opções de colocação
function sbClicarMao(idx){
  if(sb.travado || sb.turnoDe !== "jogador" || sb.acoes <= 0) return;
  // abre o pop-up de colocação (carta vem à frente)
  sb.selecao = {tipo:"colocar", idx};
  sbAbrirModalColocar(idx);
}
function sbColocar(idx, modo, cima){
  const carta = sb.maoJog[idx];
  if(!carta) return;
  if(modo === "ataque" && sbContar(sb.campoJog, "ataque") >= SB_MAX_ATK){ Som.play("erro"); sbFecharModalColocar(); sbMsg(`Máximo de ${SB_MAX_ATK} cartas em ataque.`); return; }
  if(modo === "defesa" && sbContar(sb.campoJog, "defesa") >= SB_MAX_DEF){ Som.play("erro"); sbFecharModalColocar(); sbMsg(`Máximo de ${SB_MAX_DEF} cartas em defesa.`); return; }
  sb.maoJog.splice(idx, 1);
  sb.campoJog.push(sbNovoSlot(carta, modo, cima));
  sb.selecao = null;
  sbFecharModalColocar();
  Som.play("comprar");
  sbLog(`Você colocou ${carta.nome} em ${modo === "ataque" ? "ATAQUE" : "DEFESA"} (${cima ? "virada p/ cima" : "virada p/ baixo"}).`);
  sbGastarAcao();
}
// clique numa carta do campo do jogador -> abre menu (atacar / descartar / sacrificar)
function sbClicarCampoJog(slot){
  if(sb.travado || sb.turnoDe !== "jogador" || !slot) return;
  // escolhendo alvo do sacrifício: fortalece a carta clicada
  if(sb.selecao && sb.selecao.tipo === "sacrificar"){
    sbAplicarSacrificio(sb.selecao.sacrificado, slot);
    return;
  }
  // já atacando: clique em outra carta de ataque troca o atacante
  if(sb.selecao && sb.selecao.tipo === "atacar"){
    if(slot.modo === "ataque" && !slot.jaAtacou){ sb.selecao.atacante = slot; sbDesenhar(); }
    return;
  }
  if(sb.acoes <= 0){ sbMsg("Sem ações restantes neste turno."); return; }
  sbAbrirModalAcao(slot);
}
/* ---------- Menu da carta no campo: atacar / descartar / sacrificar ---------- */
function sbAbrirModalAcao(slot){
  sb.selecao = {tipo:"acao", slot};
  const p = slot.carta, c1 = corTipo(p.tipo1), c2 = corTipo(p.tipo2 || p.tipo1);
  $("#modal-acao-carta").innerHTML =
    `<div class="sb-info-carta grande" style="--c1:${c1};--c2:${c2}">
       <img src="${SPRITE(p.id)}" onerror="this.onerror=null;this.src='${SPRITE_FALLBACK(p.id)}'">
       <div class="sb-info-nome">${p.nome}</div>
       <div class="sb-info-tipo">${slot.modo==="ataque"?"⚔️ Ataque":"🛡️ Defesa"}</div>
       <div class="sb-info-stats"><span>⚔️ ${slot.ataque}</span><span>🛡️ ${slot.defesa}</span><span>❤ ${slot.vida}</span></div>
     </div>`;
  const podeAtacar = slot.modo==="ataque" && !slot.jaAtacou && sbPodeAtacar("jogador");
  const outras = sb.campoJog.filter(s=>s!==slot).length > 0;
  const bAtk = $("#acao-atacar"); if(bAtk){ bAtk.disabled = !podeAtacar; bAtk.hidden = slot.modo!=="ataque"; bAtk.textContent = sbPodeAtacar("jogador") ? "⚔️ Atacar" : "⚔️ Atacar (só na 2ª rodada)"; }
  const bSac = $("#acao-sacrificar"); if(bSac) bSac.disabled = !outras;
  $("#modal-sb-acao").hidden = false;
}
function sbFecharModalAcao(){ const m = $("#modal-sb-acao"); if(m) m.hidden = true; if(sb.selecao && sb.selecao.tipo==="acao") sb.selecao = null; }
function sbAcaoEscolhida(acao){
  if(!sb.selecao || sb.selecao.tipo!=="acao") return;
  const slot = sb.selecao.slot;
  if(acao === "atacar"){
    if(slot.modo!=="ataque" || slot.jaAtacou) return;
    if(!sbPodeAtacar("jogador")){ sbMsg("Não é possível atacar na 1ª rodada — só a partir da 2ª."); return; }
    $("#modal-sb-acao").hidden = true;
    sb.selecao = {tipo:"atacar", atacante:slot};
    sbMsg("Escolha o alvo: uma carta do oponente ou ataque direto.");
    sbDesenhar();
  } else if(acao === "descartar"){
    const i = sb.campoJog.indexOf(slot); if(i>=0) sb.campoJog.splice(i,1);
    $("#modal-sb-acao").hidden = true; sb.selecao = null;
    Som.play("erro");
    sbLog(`Você descartou ${slot.carta.nome}.`);
    sbGastarAcao();
  } else if(acao === "sacrificar"){
    if(sb.campoJog.filter(s=>s!==slot).length === 0){ sbMsg("Não há outra carta para fortalecer."); return; }
    const i = sb.campoJog.indexOf(slot); if(i>=0) sb.campoJog.splice(i,1);   // remove o sacrificado
    $("#modal-sb-acao").hidden = true;
    sb.selecao = {tipo:"sacrificar", sacrificado:slot};
    sbMsg("🔥 Sacrifício: clique numa carta sua para fortalecê-la (+20%).");
    sbDesenhar();
  }
}
// aplica +20% do atributo do sacrificado no atributo em que o alvo está posicionado
function sbAplicarSacrificio(sacr, alvo){
  if(!alvo || alvo === sacr) return;
  const ehAtk = alvo.modo === "ataque";
  const base = ehAtk ? sacr.ataque : sacr.defesaMax;
  const boost = Math.max(1, Math.round(base * 0.2));
  if(ehAtk){ alvo.ataque += boost; }
  else { alvo.defesa += boost; alvo.defesaMax += boost; }
  alvo.focoAtk = ehAtk; alvo.focoDef = !ehAtk;
  sb.selecao = null;
  Som.play("vencerRodada");
  sbLog(`🔥 ${sacr.carta.nome} sacrificado: +${boost} de ${ehAtk?"ataque":"defesa"} em ${alvo.carta.nome}.`);
  sbDesenhar();
  setTimeout(()=>{ alvo.focoAtk = false; alvo.focoDef = false; sbGastarAcao(); }, 1000);
}
// clique num alvo do oponente
function sbClicarCampoCpu(slot){
  if(!sb.selecao || sb.selecao.tipo !== "atacar") return;
  const atk = sb.selecao.atacante;
  if(!atk || !slot) return;
  sbExecAtaqueCarta(atk, slot, sb.campoCpu, "cpu");
}
function sbAtaqueDireto(){
  if(!sb.selecao || sb.selecao.tipo !== "atacar") return;
  const atk = sb.selecao.atacante;
  // se o oponente tem carta em DEFESA, o ataque é redirecionado para ela
  const defensores = sb.campoCpu.filter(s=>s.modo==="defesa");
  if(defensores.length){
    defensores.sort((a,b)=>a.vida-b.vida);   // pega o defensor com menos vida
    sbMsg("O oponente tem defensor — ataque redirecionado!");
    sbExecAtaqueCarta(atk, defensores[0], sb.campoCpu, "cpu");
  } else {
    sbExecAtaqueDireto(atk, "cpu");
  }
}

/* ---------- Combate animado ---------- */
const SB_ELEM_ICON = {FOGO:"🔥",AGUA:"💧",GRAMA:"🌿",ELETRICO:"⚡",GELO:"❄️",LUTADOR:"🥊",
  VENENO:"☠️",TERRA:"⛰️",VOADOR:"🌪️",PSIQUICO:"🔮",INSETO:"🐛",PEDRA:"🪨",FANTASMA:"👻",
  DRAGAO:"🐉",NORMAL:"⭐",ACO:"⚙️",FADA:"✨"};
function sbElemIcon(t){ return SB_ELEM_ICON[sbNormTipo(t)] || "⭐"; }
function sbFormula(html){ const f = $("#combate-formula"); if(f) f.innerHTML = html; }
function sbRolarNumero(el, de, para, ms){
  if(!el) return;
  const ini = performance.now();
  const passo = (agora)=>{
    const t = Math.min(1, (agora-ini)/ms);
    el.textContent = Math.round(de + (para-de)*t);
    if(t < 1) requestAnimationFrame(passo); else el.textContent = para;
  };
  requestAnimationFrame(passo);
}

// ataque a uma carta: elemento×ataque atinge a DEFESA (que é consumida);
// o que exceder a defesa debita da VIDA; o que exceder a vida vai ao LP.
function sbExecAtaqueCarta(atkSlot, alvoSlot, campoAlvo, ladoAlvo){
  sb.travado = true;
  const eraVirada = !alvoSlot.cima && !alvoSlot.revelada;
  alvoSlot.revelada = true;    // ao ser atacada, a carta vira e FICA virada p/ cima
  atkSlot.revelada = true;     // ao atacar, a carta também se revela e fica revelada
  atkSlot.jaAtacou = true;
  sbDesenhar();

  const mult = sbEfetividade(atkSlot.carta.tipo1, alvoSlot.carta.tipo1);
  const atkVal = sbEfAtk(atkSlot);
  const elemental = Math.round(atkVal * mult);
  const defAntes = alvoSlot.defesa;
  const vidaAntes = alvoSlot.vida;
  // a defesa absorve primeiro; só o que passar dela machuca a vida
  const novaDef = Math.max(0, defAntes - elemental);
  const danoVida = Math.max(0, elemental - defAntes);
  const destrui = danoVida >= vidaAntes && danoVida > 0;
  // só cartas em DEFESA repassam o excedente aos LP; cartas em ataque não tiram LP
  const overflow = (destrui && alvoSlot.modo === "defesa") ? (danoVida - vidaAntes) : 0;

  // abre o pop-up de combate com as duas cartas grandes
  $("#combate-atk").innerHTML = sbHtmlCarta(atkSlot, true);
  $("#combate-alvo").innerHTML = sbHtmlCarta(alvoSlot, true);
  $("#combate-coracao").hidden = true;
  sbFormula("");
  const ov = $("#sb-combate"); ov.hidden = false;

  const t = eraVirada ? 1100 : 500;   // vira e espera 1s se estava p/ baixo
  const corElem = mult>1 ? "cb-forte" : mult<1 ? "cb-fraco" : "";
  // beat 1: ataque × multiplicador (ícone do elemento)
  setTimeout(()=>{
    if(sb.abortado) return;
    sbFormula(`<span class="cb-num">${atkVal}</span> <span class="cb-x">×</span> <span class="${corElem}">${mult} ${sbElemIcon(atkSlot.carta.tipo1)}</span>`);
    Som.play("atributo");
  }, t);
  // beat 2: gira para o valor elemental
  setTimeout(()=>{
    if(sb.abortado) return;
    sbFormula(`<span class="cb-giro"><b id="cb-roll">${atkVal}</b> ${sbElemIcon(atkSlot.carta.tipo1)}</span>`);
    sbRolarNumero($("#cb-roll"), atkVal, elemental, 700);
  }, t+1400);
  // beat 3: aplica na defesa; excedente na vida
  setTimeout(()=>{
    if(sb.abortado) return;
    if(danoVida > 0){
      sbFormula(`<span class="cb-num">${elemental}</span> <span class="cb-x">−</span> <span class="cb-def">🛡️${defAntes}</span> = <b class="cb-dano">${danoVida}</b> ❤`);
    } else {
      sbFormula(`🛡️ <span class="cb-def">${defAntes} → ${novaDef}</span> <span class="cb-x">(a defesa aguentou)</span>`);
    }
    alvoSlot.defesa = novaDef;
    alvoSlot.vida = Math.max(0, vidaAntes - danoVida);
    alvoSlot.focoDef = true; alvoSlot.focoAtk = false;   // destaca defesa/vida atingidas
    $("#combate-alvo").innerHTML = sbHtmlCarta(alvoSlot, true);
    const el = $("#combate-alvo .sbcard"); if(el) el.classList.add("tremendo");
    Som.play(danoVida>0 ? "vencerRodada" : "erro");
  }, t+2900);
  // beat 4: destruição + excedente no LP
  setTimeout(()=>{
    if(sb.abortado) return;
    alvoSlot.focoDef = false;
    if(destrui){
      const el = $("#combate-alvo .sbcard"); if(el){ el.classList.add("destruida"); }
      const i = campoAlvo.indexOf(alvoSlot); if(i>=0) campoAlvo.splice(i,1);
      sbLog(`${atkSlot.carta.nome} derrotou ${alvoSlot.carta.nome}!`+(alvoSlot.modo!=="defesa"?" (carta em ataque — não tira LP)":""));
      if(overflow > 0){
        setTimeout(()=>{
          if(sb.abortado) return;
          $("#combate-coracao").hidden = false;
          $("#combate-lp").textContent = "-" + overflow;
          if(ladoAlvo==="cpu") sb.lpCpu = Math.max(0, sb.lpCpu - overflow); else sb.lpJog = Math.max(0, sb.lpJog - overflow);
          sbLog(`Excedente de ${overflow} atingiu o LP!`);
          Som.play("perderRodada");
          setTimeout(sbCombateFechar, 1500);
        }, 1200);
      } else setTimeout(sbCombateFechar, 1300);
    } else {
      sbLog(`${atkSlot.carta.nome} atacou ${alvoSlot.carta.nome} — 🛡️${alvoSlot.defesa} ❤${alvoSlot.vida}/${alvoSlot.vidaMax}.`);
      setTimeout(sbCombateFechar, 1300);
    }
  }, t+4300);
}
// ataque direto ao LP (coração)
function sbExecAtaqueDireto(atkSlot, ladoAlvo){
  sb.travado = true;
  atkSlot.jaAtacou = true;
  atkSlot.revelada = true;    // ao atacar, revela e fica revelada
  const dano = sbEfAtk(atkSlot);
  $("#combate-atk").innerHTML = sbHtmlCarta(atkSlot, true);
  $("#combate-alvo").innerHTML = `<div class="combate-lp-alvo">❤️<span>LP</span></div>`;
  sbFormula("");
  $("#combate-coracao").hidden = true;
  $("#sb-combate").hidden = false;
  setTimeout(()=>{ if(sb.abortado) return; sbFormula(`⚔️ <span class="cb-num">${dano}</span> ataque direto!`); Som.play("atributo"); }, 500);
  setTimeout(()=>{
    if(sb.abortado) return;
    $("#combate-coracao").hidden = false;
    $("#combate-lp").textContent = "-" + dano;
    if(ladoAlvo==="cpu") sb.lpCpu = Math.max(0, sb.lpCpu - dano); else sb.lpJog = Math.max(0, sb.lpJog - dano);
    sbLog(`⚔️ ATAQUE DIRETO! ${atkSlot.carta.nome} causou ${dano} de dano ao LP.`);
    Som.play("perderRodada");
    setTimeout(sbCombateFechar, 1600);
  }, 1800);
}
function sbCombateFechar(){
  if(sb.abortado) return;
  const ov = $("#sb-combate"); if(ov) ov.hidden = true;
  sb.selecao = null;
  sb.travado = (sb.turnoDe === "cpu");
  sbDesenhar();
  // LP zerou: espera 1s e mostra o pop-up "você venceu / perdeu" com OK antes de mudar de tela
  if(sb.lpCpu <= 0 || sb.lpJog <= 0){ sb.travado = true; sb.fim = true; setTimeout(()=>sbMostrarFimPop(sb.lpCpu <= 0), 1000); return; }
  sbPosAtaque();
}
// pop-up de resultado: o jogador clica OK para ir à tela de fim
function sbMostrarFimPop(venceu){
  if(sb.abortado) return;
  sbLimparTurnoTimer();
  const pop = $("#sb-fim-pop"); if(!pop){ sbFim(venceu); return; }
  $("#sb-fim-pop-emoji").textContent = venceu ? "🏆" : "☠";
  $("#sb-fim-pop-titulo").textContent = venceu ? "VOCÊ VENCEU!" : "VOCÊ PERDEU";
  $("#sb-fim-pop-titulo").className = venceu ? "venceu" : "perdeu";
  $("#sb-fim-pop-sub").textContent = venceu
    ? `Você zerou o LP de ${sb.nomeOp}!`
    : `${sb.nomeOp} zerou seu LP.`;
  Som.play(venceu ? "vencerPartida" : "perderPartida");
  pop.hidden = false;
}
function sbPosAtaque(){
  if(sb.abortado) return;
  if(sb.turnoDe === "jogador"){ sbGastarAcao(); }
  else { sb.acoes--; sbDesenhar(); setTimeout(()=>{ if(!sb.fim && !sb.abortado) (sb.acoes>0 ? sbPassoCPU() : sbEncerrarTurno()); }, 900); }
}

/* ---------- IA do oponente ---------- */
// melhor carta da CPU para receber reforço: a mais forte de ataque; senão a melhor de defesa
function sbCpuAlvoReforco(excluir){
  const atk = sb.campoCpu.filter(s=>s!==excluir && s.modo==="ataque").sort((a,b)=>sbEfAtk(b)-sbEfAtk(a));
  if(atk.length) return atk[0];
  const def = sb.campoCpu.filter(s=>s!==excluir && s.modo==="defesa").sort((a,b)=>b.defesa-a.defesa);
  return def[0] || null;
}
// CPU sacrifica `sacr` para reforçar `alvo` em +20%, gasta 1 ação e segue o turno
function sbCpuSacrificar(sacr, alvo){
  const ehAtk = alvo.modo === "ataque";
  const base = ehAtk ? sacr.ataque : sacr.defesaMax;
  const boost = Math.max(1, Math.round(base * 0.2));
  const i = sb.campoCpu.indexOf(sacr); if(i>=0) sb.campoCpu.splice(i,1);
  if(ehAtk){ alvo.ataque += boost; } else { alvo.defesa += boost; alvo.defesaMax += boost; }
  alvo.focoAtk = ehAtk; alvo.focoDef = !ehAtk;
  sbLog(`🔥 Oponente sacrificou ${sacr.carta.nome}: +${boost} de ${ehAtk?"ataque":"defesa"} em ${alvo.carta.nome}.`);
  Som.play("vencerRodada");
  sb.acoes--;
  sbDesenhar();
  setTimeout(()=>{ alvo.focoAtk=false; alvo.focoDef=false; if(!sb.fim && !sb.abortado) (sb.acoes>0 ? sbPassoCPU() : sbEncerrarTurno()); }, 1000);
}
function sbPassoCPU(){
  if(sb.fim || sb.abortado) return;
  if(sb.acoes <= 0){ setTimeout(sbEncerrarTurno, 500); return; }
  const campo = sb.campoCpu, mao = sb.maoCpu;
  const atacantes = campo.filter(s=>s.modo==="ataque" && !s.jaAtacou);
  const defensores = campo.filter(s=>s.modo==="defesa");

  // 0) carta que ficou com 0 de defesa (foi atacada) é sacrificada p/ reforçar a mais forte de ataque (ou defesa)
  if(campo.length >= 2){
    const zerada = campo.find(s=> s.defesaMax>0 && s.defesa===0 && sbCpuAlvoReforco(s));
    if(zerada){ return sbCpuSacrificar(zerada, sbCpuAlvoReforco(zerada)); }
  }

  // 1) atacar (só a partir do 2º turno da CPU) — 75% mira DEFESA, 25% mira ATAQUE
  // OBS: a animação de combate chama sbPosAtaque no fim, que decrementa a ação e agenda o próximo passo.
  if(atacantes.length && sbPodeAtacar("cpu")){
    const atkOrd = atacantes.slice().sort((a,b)=>sbEfAtk(b)-sbEfAtk(a));
    const atk = escolhaComErro(atkOrd);
    const defsJog = sb.campoJog.filter(s=>s.modo==="defesa");
    const atksJog = sb.campoJog.filter(s=>s.modo==="ataque");
    const porVida = arr => arr.slice().sort((a,b)=>a.vida-b.vida);
    const querDefesa = Math.random() < 0.75;
    let alvo = null;
    if(querDefesa && defsJog.length) alvo = escolhaComErro(porVida(defsJog));
    else if(!querDefesa && atksJog.length) alvo = escolhaComErro(porVida(atksJog));
    if(!alvo && defsJog.length) alvo = escolhaComErro(porVida(defsJog));
    if(!alvo && atksJog.length) alvo = escolhaComErro(porVida(atksJog));
    if(alvo) sbExecAtaqueCarta(atk, alvo, sb.campoJog, "jogador");
    else sbExecAtaqueDireto(atk, "jogador");
    return;   // a continuação vem por sbPosAtaque após a animação
  }

  // 1b) às vezes sacrifica a carta mais fraca para reforçar a mais forte de ataque
  if(campo.length >= 2 && Math.random() < 0.18){
    const alvosAtk = campo.filter(s=>s.modo==="ataque").sort((a,b)=>sbEfAtk(b)-sbEfAtk(a));
    if(alvosAtk.length){
      const alvo = alvosAtk[0];
      const cand = campo.filter(s=>s!==alvo).sort((a,b)=>(a.ataque+a.defesa)-(b.ataque+b.defesa));
      if(cand.length){ return sbCpuSacrificar(cand[0], alvo); }
    }
  }
  // 2) colocar carta respeitando os limites (até 3 ataque, 2 defesa)
  const podeAtk = sbContar(campo,"ataque") < SB_MAX_ATK;
  const podeDef = sbContar(campo,"defesa") < SB_MAX_DEF;
  if((podeAtk || podeDef) && mao.length){
    const ordem = mao.map((c,i)=>({i, sc:Math.max(c.ataque,c.defesa)})).sort((a,b)=>b.sc-a.sc);
    const escolha = escolhaComErro(ordem);
    const melhor = escolha.i;
    let melhorModo = mao[melhor].ataque >= mao[melhor].defesa ? "ataque" : "defesa";
    if(defensores.length === 0 && podeDef && mao[melhor].defesa >= 30) melhorModo = "defesa";
    if(melhorModo === "ataque" && !podeAtk) melhorModo = "defesa";
    if(melhorModo === "defesa" && !podeDef) melhorModo = "ataque";
    const cima = Math.random() < 0.25;           // maioria virada p/ baixo
    const carta = mao.splice(melhor,1)[0];
    campo.push(sbNovoSlot(carta, melhorModo, cima));
    sbLog(`Oponente colocou uma carta${cima ? " (revelada)" : " virada para baixo"}.`);
    sb.acoes--;
    Som.play("select");
    sbDesenhar();
    return void setTimeout(sbPassoCPU, 900);
  }
  // 3) comprar
  if(sb.baralhoCpu.length && mao.length < 6){
    sb.maoCpu.push(sb.baralhoCpu.shift());
    sbLog("Oponente comprou uma carta.");
    sb.acoes--;
    sbDesenhar();
    return void setTimeout(sbPassoCPU, 700);
  }
  // nada a fazer
  setTimeout(sbEncerrarTurno, 500);
}

/* ---------- Fim ---------- */
function sbFim(venceu){
  sb.fim = true; sb.travado = true;
  sbLimparTurnoTimer();
  const info = NIVEIS_SUPER[sb.nivel-1];
  mostrarTela("tela-fim");
  const t = $("#fim-titulo"), s = $("#fim-sub"), acoes = $("#fim-acoes");
  t.classList.remove("venceu","perdeu","empatou");
  acoes.innerHTML = "";
  if(venceu){
    Som.play("vencerPartida"); confete();
    const primeiraVez = sb.nivel === progresso.nivelSuper;
    const ganho = ouroNivelSuper(sb.nivel) + (primeiraVez ? 60 : 0);
    progresso.pontos += ganho;
    progresso.vitorias = (progresso.vitorias||0) + 1;
    if(primeiraVez && progresso.nivelSuper < MAX_NIVEL_SUPER) progresso.nivelSuper++;
    salvarProgresso();
    var marco = premiarMarcoVitoria();
    const zerou = primeiraVez && sb.nivel === MAX_NIVEL_SUPER;
    t.textContent = zerou ? "👑 REI DOS DUELOS!" : "🏆 VITÓRIA!";
    t.classList.add("venceu");
    s.innerHTML = `Você derrotou <b>${info.nome}</b> com ${sb.lpJog} LP restante!<br>`+
      `<span class="ganho">+${ganho} de ouro</span>${primeiraVez?' <span class="bonus">(bônus 1ª vez)</span>':''}`;
  } else {
    Som.play("perderPartida");
    progresso.derrotas = (progresso.derrotas||0) + 1;
    progresso.pontos += 10; salvarProgresso();
    t.textContent = "☠ DERROTA";
    t.classList.add("perdeu");
    s.innerHTML = `<b>${info.nome}</b> zerou seus pontos de vida.<br><span class="ganho">+10 de ouro</span> de consolação. Compre <b>LP</b> na loja!`;
  }
  botaoFim(acoes, "↺ Duelar de novo", "btn-grande", ()=>iniciarSuperNivel(sb.nivel));
  botaoFim(acoes, "🛒 Loja", "btn-sec", abrirLoja);
  botaoFim(acoes, "🃏 Championship", "btn-sec", abrirCampanhaSuper);
  const host = $("#fim-crono");
  host.innerHTML = htmlCrono(SEGUNDOS_TIMER);
  _fimTimer = animarCrono(host, SEGUNDOS_TIMER, ()=>{ limparTimers(); abrirCampanhaSuper(); });
  if(venceu) mostrarMarcoNoFim(marco);
}

/* ---------- Render ---------- */
function sbLog(txt){
  const p = document.createElement("div");
  p.textContent = txt;
  const log = $("#sb-log");
  if(log){ log.prepend(p); }
}
function sbMsg(txt){ const m = $("#sb-msg-txt"); if(m) m.textContent = txt; }

function sbHtmlCarta(s, meu){
  const visivel = meu || s.cima || s.revelada;
  // verso na cor temática do oponente daquele nível
  if(!visivel){
    const c = sb.corOp || ["#5a3ea5","#432c86"];
    return `<div class="sbcard verso" style="--dk1:${c[0]};--dk2:${c[1]}"><div class="sb-verso-pk"></div></div>`;
  }
  const p = s.carta, c1 = corTipo(p.tipo1), c2 = corTipo(p.tipo2 || p.tipo1);
  const ehAtaque = s.modo === "ataque";
  const modo = ehAtaque ? "m-atk" : "m-def deitada";   // defesa fica deitada (só o pokémon gira)
  const atk = sbEfAtk(s), def = sbEfDef(s);
  const atkCls = s.focoAtk ? " foco" : "", defCls = s.focoDef ? " foco" : "";
  const grandeIcon = ehAtaque ? "⚔" : "🛡";
  const grandeVal  = ehAtaque ? atk : def;
  const grandeCls  = ehAtaque ? atkCls : defCls;
  const pequenoIcon = ehAtaque ? "🛡" : "⚔";
  const pequenoVal = ehAtaque ? def : atk;
  const pequenoCls = ehAtaque ? defCls : atkCls;
  return `<div class="sbcard ${modo}${s.cima?' cima':''}" style="--c1:${c1};--c2:${c2}">
      <span class="sb-vida-tag${defCls}">❤ ${s.vida}</span>
      <span class="sb-modo-tag">${ehAtaque?"⚔️":"🛡️"}${s.cima?" ⬆":""}</span>
      <img class="sb-poke" src="${SPRITE(p.id)}" loading="lazy" alt="${p.nome}" onerror="this.onerror=null;this.src='${SPRITE_FALLBACK(p.id)}'">
      <span class="sb-nome">${p.nome}</span>
      <span class="sb-stat-grande${grandeCls}">${grandeIcon} ${grandeVal}</span>
      <span class="sb-stat-peq${pequenoCls}">${pequenoIcon} ${pequenoVal}</span>
    </div>`;
}
// renderiza um campo com 3 slots de ATAQUE (em pé) e 2 de DEFESA (deitados)
function sbRenderCampo(containerId, cards, meu, atacando){
  const cont = $("#"+containerId); if(!cont) return;
  cont.innerHTML = "";
  const atk = cards.filter(s=>s.modo==="ataque");
  const def = cards.filter(s=>s.modo==="defesa");
  const gAtk = document.createElement("div"); gAtk.className = "sb-grupo grupo-atk";
  for(let i=0;i<SB_MAX_ATK;i++) gAtk.appendChild(sbSlotEl(atk[i], meu, atacando, "atk"));
  const gDef = document.createElement("div"); gDef.className = "sb-grupo grupo-def";
  for(let i=0;i<SB_MAX_DEF;i++) gDef.appendChild(sbSlotEl(def[i], meu, atacando, "def"));
  // oponente: defesa em cima, ataque perto do centro. jogador: ataque perto do centro, defesa embaixo.
  if(meu){ cont.appendChild(gAtk); cont.appendChild(gDef); }
  else   { cont.appendChild(gDef); cont.appendChild(gAtk); }
}
function sbSlotEl(slot, meu, atacando, tipoSlot){
  const div = document.createElement("div");
  const podeAtacar = meu && slot && slot.modo==="ataque" && !slot.jaAtacou && sb.turnoDe==="jogador" && sb.acoes>0 && !sb.travado && sbPodeAtacar("jogador");
  const sacrificando = sb.selecao && sb.selecao.tipo==="sacrificar";
  div.className = "sb-slot slot-" + tipoSlot + (slot ? "" : " vazio") +
    (!meu && atacando && slot ? " alvo" : "") +
    (podeAtacar && !sacrificando ? " pode-atacar" : "") +
    (meu && slot && sacrificando ? " pode-fortalecer" : "") +
    (atacando && sb.selecao.atacante === slot ? " selecionado" : "");
  div.innerHTML = slot ? sbHtmlCarta(slot, meu) : "";
  if(slot){
    if(meu && sb.turnoDe==="jogador" && !sb.travado) div.onclick = ()=>sbClicarCampoJog(slot);
    if(!meu && atacando) div.onclick = ()=>sbClicarCampoCpu(slot);
  }
  return div;
}

function sbDesenhar(){
  // placar
  $("#sb-titulo").textContent = `Nível ${sb.nivel} · ${sb.nomeOp}`;
  $("#sb-turno").textContent = sb.fim ? "" : (sb.turnoDe === "jogador" ? "SEU TURNO" : "TURNO DO OPONENTE");
  $("#sb-acoes").textContent = sb.turnoDe === "jogador" && !sb.fim ? `Ações: ${sb.acoes}/3` : "";
  $("#sb-nome-cpu").textContent = sb.nomeOp || "Oponente";
  $("#sb-avatar-cpu").textContent = sb.avatarOp;
  $("#sb-avatar-jog").textContent = progresso.foto || "🧑";
  $("#sb-nome-jog").textContent = progresso.nome || "Você";
  $("#sb-lp-cpu").textContent = sb.lpCpu;
  $("#sb-lp-jog").textContent = sb.lpJog;
  setBarraVida("#sb-lpbar-cpu-w", sb.lpCpu, sb.lpCpuMax);
  setBarraVida("#sb-lpbar-jog-w", sb.lpJog, sb.lpJogMax);
  $("#sb-mao-cpu-n").textContent = sb.maoCpu.length;
  $("#sb-deck-cpu-n").textContent = sb.baralhoCpu.length;
  $("#sb-deck-jog-n").textContent = sb.baralhoJog.length;

  const atacando = sb.selecao && sb.selecao.tipo === "atacar";
  sbRenderCampo("sb-campo-cpu", sb.campoCpu, false, atacando);
  sbRenderCampo("sb-campo-jog", sb.campoJog, true, atacando);
  // mão do jogador
  const mao = $("#sb-mao"); mao.innerHTML = "";
  sb.maoJog.forEach((carta, i)=>{
    const c1 = corTipo(carta.tipo1), c2 = corTipo(carta.tipo2 || carta.tipo1);
    const div = document.createElement("div");
    div.className = "sb-maocarta" + (sb.selecao && sb.selecao.tipo==="colocar" && sb.selecao.idx===i ? " sel" : "");
    div.style.setProperty("--c1", c1); div.style.setProperty("--c2", c2);
    div.innerHTML =
      `<img src="${SPRITE(carta.id)}" loading="lazy" onerror="this.onerror=null;this.src='${SPRITE_FALLBACK(carta.id)}'">`+
      `<span class="mc-nome">${carta.nome}</span>`+
      `<span class="mc-stats">⚔${carta.ataque} 🛡${carta.defesa}</span>`;
    div.onclick = ()=>sbClicarMao(i);
    mao.appendChild(div);
  });

  // controles / baralho lateral (clica para comprar)
  const podeComprar = !sb.travado && sb.turnoDe==="jogador" && sb.acoes>0 && sb.baralhoJog.length>0;
  const deck = $("#sb-deck-jog");
  if(deck){
    deck.className = "sb-deck" + (podeComprar ? " ativo" : "") + (sb.baralhoJog.length===0 ? " vazio" : "");
    const cb = sb.corBaralho || SB_CORES_BARALHO[0];
    deck.style.setProperty("--dk1", cb[0]);
    deck.style.setProperty("--dk2", cb[1]);
    deck.querySelector(".sb-deck-num").textContent = sb.baralhoJog.length;
    deck.onclick = podeComprar ? sbComprar : null;
  }
  $("#btn-sb-encerrar").disabled = sb.travado || sb.turnoDe!=="jogador";
  const tm = $("#sb-timer"); if(tm) tm.style.visibility = (sb.turnoDe==="jogador" && !sb.fim) ? "visible" : "hidden";

  // botão de ataque direto
  const bd = $("#sb-btn-direto");
  bd.hidden = !atacando;

  if(!sb.selecao || sb.selecao.tipo === "colocar"){
    sbMsg(sb.turnoDe==="jogador" && !sb.fim
      ? "Seu turno: compre no baralho, coloque cartas ou ataque. Você tem 3 ações."
      : (sb.fim ? "" : "O oponente está jogando..."));
  }
}

/* ---------- Pop-up de colocação (carta vem à frente) ---------- */
function sbAbrirModalColocar(idx){
  const carta = sb.maoJog[idx];
  if(!carta) return;
  const c1 = corTipo(carta.tipo1), c2 = corTipo(carta.tipo2 || carta.tipo1);
  $("#modal-colocar-carta").innerHTML =
    `<div class="sb-info-carta grande" style="--c1:${c1};--c2:${c2}">
       <img src="${SPRITE(carta.id)}" onerror="this.onerror=null;this.src='${SPRITE_FALLBACK(carta.id)}'">
       <div class="sb-info-nome">${carta.nome}</div>
       <div class="sb-info-tipo">${carta.tipo1}${carta.tipo2?" / "+carta.tipo2:""}</div>
       <div class="sb-info-stats"><span>⚔️ ${carta.ataque}</span><span>🛡️ ${carta.defesa}</span><span>❤ ${carta.vida}</span></div>
     </div>`;
  // desabilita opções conforme limites
  const semAtk = sbContar(sb.campoJog,"ataque") >= SB_MAX_ATK;
  const semDef = sbContar(sb.campoJog,"defesa") >= SB_MAX_DEF;
  document.querySelectorAll("#modal-sb-colocar .sb-opcao").forEach(op=>{
    op.disabled = (op.dataset.modo==="ataque" && semAtk) || (op.dataset.modo==="defesa" && semDef);
  });
  $("#modal-sb-colocar").hidden = false;
}
function sbFecharModalColocar(){ const m = $("#modal-sb-colocar"); if(m) m.hidden = true; sb.selecao = null; }

/* ---------- Barra de tempo do turno (sutil, verde→amarelo→vermelho) ---------- */
function sbAtualizarBarraTempo(){
  const barra = $("#sb-tempo-fill");
  if(!barra) return;
  const pct = Math.max(0, Math.min(100, (_sbTurnoRestante/60)*100));
  barra.style.width = pct + "%";
  barra.className = "sb-tempo-fill " + (_sbTurnoRestante<=10 ? "vermelho" : _sbTurnoRestante<=25 ? "amarelo" : "verde");
}

/* ---------- Loja: comprar LP ---------- */
function atualizarLojaSuper(){
  const a = $("#loja-lpmax"); if(a) a.textContent = progresso.lpSuper;
  const b = $("#loja-lp-custo"); if(b) b.textContent = custoLPSuper();
}
function comprarLPSuper(){
  const custo = custoLPSuper();
  if(progresso.pontos < custo){ Som.play("erro"); flashLoja(`Ouro insuficiente para +${SB_LP_INCREMENTO} LP — faltam ${custo-progresso.pontos} pts`, true); return; }
  progresso.pontos -= custo;
  progresso.lpSuper += SB_LP_INCREMENTO;
  salvarProgresso();
  Som.play("comprar");
  atualizarLojaSuper();
  $("#loja-pontos").textContent = progresso.pontos;
  flashLoja(`🃏 LP da Super Batalha agora é ${progresso.lpSuper}! (-${custo} pts)`);
}

/* ---------- Ligações ---------- */
document.addEventListener("DOMContentLoaded", ()=>{
  const bt = $("#btn-campanha-super"); if(bt) bt.addEventListener("click", abrirCampanhaSuper);
  const be = $("#btn-sb-encerrar"); if(be) be.addEventListener("click", ()=>{ if(!sb.travado && sb.turnoDe==="jogador") sbEncerrarTurno(); });
  const bs = $("#btn-sb-sair"); if(bs) bs.addEventListener("click", ()=>{ sbAbortarDuelo(); abrirCampanhaSuper(); });
  const bd = $("#sb-btn-direto"); if(bd) bd.addEventListener("click", sbAtaqueDireto);
  const bl = $("#btn-comprar-lp"); if(bl) bl.addEventListener("click", comprarLPSuper);
  const bcancel = $("#sb-colocar-cancelar"); if(bcancel) bcancel.addEventListener("click", sbFecharModalColocar);
  const bok = $("#sb-fim-pop-ok"); if(bok) bok.addEventListener("click", ()=>{ const p=$("#sb-fim-pop"); if(p) p.hidden=true; sbFim(sb.lpCpu <= 0); });
  const bRod = $("#sb-rodada-ok"); if(bRod) bRod.addEventListener("click", ()=>{ const m=$("#modal-sb-rodada"); if(m) m.hidden=true; sbEncerrarTurno(); });
  const bRodC = $("#sb-rodada-cancelar"); if(bRodC) bRodC.addEventListener("click", ()=>{ if(!bRodC.disabled) sbCancelarAcoes(); });
  // menu da carta no campo (atacar / descartar / sacrificar)
  const bAcCancel = $("#sb-acao-cancelar"); if(bAcCancel) bAcCancel.addEventListener("click", sbFecharModalAcao);
  const mAcao = $("#modal-sb-acao"); if(mAcao) mAcao.addEventListener("click", e=>{ if(e.target.id==="modal-sb-acao") sbFecharModalAcao(); });
  document.querySelectorAll("#modal-sb-acao .sb-opcao").forEach(op=>op.addEventListener("click", ()=>{
    if(!op.disabled) sbAcaoEscolhida(op.dataset.acao);
  }));
  const mc = $("#modal-sb-colocar"); if(mc) mc.addEventListener("click", e=>{ if(e.target.id==="modal-sb-colocar") sbFecharModalColocar(); });
  // opções de colocação (no modal)
  document.querySelectorAll("#modal-sb-colocar .sb-opcao").forEach(op=>op.addEventListener("click", ()=>{
    if(!sb.selecao || sb.selecao.tipo!=="colocar" || op.disabled) return;
    sbColocar(sb.selecao.idx, op.dataset.modo, op.dataset.cima === "1");
  }));
});
