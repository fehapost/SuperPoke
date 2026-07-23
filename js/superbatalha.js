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

/* ---------- Campanha Super Battle ---------- */
const NIVEIS_SUPER = [
  {n:1,  nome:"Aprendiz Duel", raridades:["Comum"],                 lp:100},
  {n:2,  nome:"Duelista Rex",  raridades:["Comum","Incomum"],       lp:110},
  {n:3,  nome:"Mago Zane",     raridades:["Incomum"],               lp:125},
  {n:4,  nome:"Rival Kite",    raridades:["Incomum","Raro"],        lp:140},
  {n:5,  nome:"Mestra Aki",    raridades:["Raro"],                  lp:160},
  {n:6,  nome:"Kaiser Ryo",    raridades:["Raro","Super Raro"],     lp:185},
  {n:7,  nome:"Sombra Yubel",  raridades:["Super Raro"],            lp:215},
  {n:8,  nome:"Faraó Atem",    raridades:["Super Raro","Lendário"], lp:250},
  {n:9,  nome:"Deus Obelisco", raridades:["Lendário"],              lp:290},
  {n:10, nome:"REI DOS DUELOS",raridades:["Lendário","Lendário Supremo","Mítico"], lp:340}
];
const MAX_NIVEL_SUPER = NIVEIS_SUPER.length;
function ouroNivelSuper(nivel){ return 40 + nivel*22; }
const SB_LP_INICIAL = 100, SB_LP_INCREMENTO = 20;
function custoLPSuper(){ return Math.round((progresso.lpSuper||100) * 0.8); }

/* ---------- Estado da partida ---------- */
const sb = {
  nivel:1, turnoDe:"jogador", acoes:3, lpJog:100, lpCpu:100,
  maoJog:[], maoCpu:[], baralhoJog:[], baralhoCpu:[],
  campoJog:[], campoCpu:[], selecao:null, travado:false, fim:false, avatarOp:"🃏"
};

function sbEfAtk(s){ return Math.max(1, Math.round(s.carta.ataque * (s.cima?1.1:1))); }
function sbEfDefMax(s){ return Math.max(1, Math.round(s.carta.defesa * (s.cima?1.2:1))); }
function sbNovoSlot(carta, modo, cima){
  const s = {carta, modo, cima:!!cima, jaAtacou:false, revelada:false};
  s.def = sbEfDefMax(s);
  return s;
}

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
    el.innerHTML =
      `<span class="nivel-num">${info.n}</span>`+
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
  sb.fim = false; sb.travado = false; sb.selecao = null;
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
function sbIniciarTurno(quem){
  sb.turnoDe = quem;
  sb.acoes = 3;
  sb.selecao = null;
  sb.travado = quem === "cpu";
  (quem === "jogador" ? sb.campoJog : sb.campoCpu).forEach(s=>s.jaAtacou = false);
  sbDesenhar();
  if(quem === "cpu") setTimeout(sbPassoCPU, 800);
}
function sbGastarAcao(){
  sb.acoes--;
  if(sb.acoes <= 0){ sb.selecao = null; sbDesenhar(); setTimeout(()=>{ if(!sb.fim) sbEncerrarTurno(); }, 700); }
  else sbDesenhar();
}
function sbEncerrarTurno(){
  if(sb.fim) return;
  sbIniciarTurno(sb.turnoDe === "jogador" ? "cpu" : "jogador");
}

/* ---------- Ações do jogador ---------- */
function sbComprar(){
  if(sb.travado || sb.turnoDe !== "jogador" || sb.acoes <= 0) return;
  if(sb.baralhoJog.length === 0){ Som.play("erro"); sbMsg("Seu baralho acabou — sem cartas para comprar."); return; }
  sb.maoJog.push(sb.baralhoJog.shift());
  Som.play("select");
  sbLog("Você comprou uma carta.");
  sbGastarAcao();
}
// clique numa carta da mão -> abre opções de colocação
function sbClicarMao(idx){
  if(sb.travado || sb.turnoDe !== "jogador" || sb.acoes <= 0) return;
  if(sb.campoJog.length >= 5){ Som.play("erro"); sbMsg("Seu campo já tem 5 cartas."); return; }
  sb.selecao = {tipo:"colocar", idx};
  sbDesenhar();
}
function sbColocar(idx, modo, cima){
  if(sb.campoJog.length >= 5) return;
  const carta = sb.maoJog.splice(idx, 1)[0];
  if(!carta) return;
  sb.campoJog.push(sbNovoSlot(carta, modo, cima));
  sb.selecao = null;
  Som.play("comprar");
  sbLog(`Você colocou uma carta em ${modo === "ataque" ? "ATAQUE" : "DEFESA"} (${cima ? "virada p/ cima" : "virada p/ baixo"}).`);
  sbGastarAcao();
}
// clique numa carta do campo do jogador -> se for ataque e não atacou, inicia alvo
function sbClicarCampoJog(idx){
  if(sb.travado || sb.turnoDe !== "jogador" || sb.acoes <= 0) return;
  const s = sb.campoJog[idx];
  if(!s) return;
  if(s.modo !== "ataque"){ sbMsg("Só cartas em ATAQUE podem atacar."); return; }
  if(s.jaAtacou){ sbMsg("Essa carta já atacou neste turno."); return; }
  sb.selecao = {tipo:"atacar", idx};
  sbMsg("Escolha o alvo: uma carta do oponente ou ataque direto.");
  sbDesenhar();
}
// clique num alvo do oponente
function sbClicarCampoCpu(idx){
  if(!sb.selecao || sb.selecao.tipo !== "atacar") return;
  const atk = sb.campoJog[sb.selecao.idx];
  const alvo = sb.campoCpu[idx];
  if(!atk || !alvo) return;
  sbExecAtaqueCarta(atk, alvo, sb.campoCpu, "cpu");
}
function sbAtaqueDireto(){
  if(!sb.selecao || sb.selecao.tipo !== "atacar") return;
  const atk = sb.campoJog[sb.selecao.idx];
  // se o oponente tem carta em DEFESA, o ataque é redirecionado para ela
  const defensores = sb.campoCpu.map((s,i)=>({s,i})).filter(x=>x.s.modo==="defesa");
  if(defensores.length){
    defensores.sort((a,b)=>a.s.def-b.s.def);   // pega o defensor mais fraco
    sbMsg("O oponente tem defensor — ataque redirecionado!");
    sbExecAtaqueCarta(atk, defensores[0].s, sb.campoCpu, "cpu");
  } else {
    sbExecAtaqueDireto(atk, "cpu");
  }
}

/* ---------- Resolução de ataques (genérica) ---------- */
function sbExecAtaqueCarta(atkSlot, alvoSlot, campoAlvo, ladoAlvo){
  const mult = sbEfetividade(atkSlot.carta.tipo1, alvoSlot.carta.tipo1);
  const dano = Math.max(1, Math.round(sbEfAtk(atkSlot) * mult));
  alvoSlot.revelada = true;
  alvoSlot.def -= dano;
  atkSlot.jaAtacou = true;
  const elem = mult > 1 ? " (super eficaz ×1.5!)" : mult < 1 ? " (pouco eficaz ×0.5)" : "";
  let txt = `${atkSlot.carta.nome} atacou ${alvoSlot.carta.nome}: ${dano} de dano${elem}.`;
  if(alvoSlot.def <= 0){
    const i = campoAlvo.indexOf(alvoSlot);
    if(i >= 0) campoAlvo.splice(i, 1);
    txt += ` ${alvoSlot.carta.nome} foi destruída!`;
    Som.play("vencerRodada");
  } else {
    txt += ` Restam ${alvoSlot.def} de defesa.`;
    Som.play("atributo");
  }
  sbLog(txt);
  sb.selecao = null;
  efeitoTela(mult > 1 ? "vitoria" : "empate");
  sbPosAtaque();
}
function sbExecAtaqueDireto(atkSlot, ladoAlvo){
  const dano = sbEfAtk(atkSlot);
  atkSlot.jaAtacou = true;
  if(ladoAlvo === "cpu"){ sb.lpCpu = Math.max(0, sb.lpCpu - dano); }
  else { sb.lpJog = Math.max(0, sb.lpJog - dano); }
  sbLog(`⚔️ ATAQUE DIRETO! ${atkSlot.carta.nome} causou ${dano} de dano aos pontos de vida.`);
  Som.play("perderRodada");
  efeitoTela(ladoAlvo === "cpu" ? "vitoria" : "derrota");
  sb.selecao = null;
  sbPosAtaque();
}
function sbPosAtaque(){
  if(sb.lpCpu <= 0 || sb.lpJog <= 0){ sbDesenhar(); return sbFim(sb.lpCpu <= 0); }
  if(sb.turnoDe === "jogador") sbGastarAcao();
  else sbDesenhar();
}

/* ---------- IA do oponente ---------- */
function sbPassoCPU(){
  if(sb.fim) return;
  if(sb.acoes <= 0){ setTimeout(sbEncerrarTurno, 500); return; }
  const campo = sb.campoCpu, mao = sb.maoCpu;
  const atacantes = campo.filter(s=>s.modo==="ataque" && !s.jaAtacou);
  const defensores = campo.filter(s=>s.modo==="defesa");

  // 1) atacar se tiver atacante
  if(atacantes.length){
    const atk = atacantes[0];
    const defsJog = sb.campoJog.filter(s=>s.modo==="defesa");
    if(defsJog.length){
      defsJog.sort((a,b)=>a.def-b.def);
      sbExecAtaqueCarta(atk, defsJog[0], sb.campoJog, "jogador");
    } else if(sb.campoJog.length && Math.random()<0.4){
      // às vezes remove um atacante do jogador
      const alvo = sb.campoJog[Math.floor(Math.random()*sb.campoJog.length)];
      sbExecAtaqueCarta(atk, alvo, sb.campoJog, "jogador");
    } else {
      sbExecAtaqueDireto(atk, "jogador");
    }
    sb.acoes--;
    return void setTimeout(sbPassoCPU, 900);
  }
  // 2) colocar carta se tiver espaço e mão
  if(campo.length < 5 && mao.length){
    // escolhe melhor carta e modo
    let melhor = 0, melhorScore = -1, melhorModo = "defesa";
    mao.forEach((c,i)=>{
      const sc = Math.max(c.ataque, c.defesa);
      if(sc > melhorScore){ melhorScore = sc; melhor = i; melhorModo = c.ataque >= c.defesa ? "ataque" : "defesa"; }
    });
    // se não tem defensor, prioriza defesa
    if(defensores.length === 0 && mao[melhor].defesa >= 30) melhorModo = "defesa";
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
  if(!visivel) return `<div class="sbcard verso"><div class="sb-verso-pk"></div></div>`;
  const p = s.carta, c1 = corTipo(p.tipo1), c2 = corTipo(p.tipo2 || p.tipo1);
  const modo = s.modo === "ataque" ? "m-atk" : "m-def";
  return `<div class="sbcard ${modo}${s.cima?' cima':''}" style="--c1:${c1};--c2:${c2}">
      <span class="sb-modo-tag">${s.modo==="ataque"?"⚔️":"🛡️"}${s.cima?" ⬆":""}</span>
      <img src="${SPRITE(p.id)}" loading="lazy" alt="${p.nome}" onerror="this.onerror=null;this.src='${SPRITE_FALLBACK(p.id)}'">
      <span class="sb-nome">${p.nome}</span>
      <span class="sb-tipo tag-tipo">${p.tipo1}</span>
      <span class="sb-stats"><span class="sb-atk">⚔ ${sbEfAtk(s)}</span><span class="sb-def">🛡 ${s.def}</span></span>
    </div>`;
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

  // campo do oponente (5 slots)
  const cCpu = $("#sb-campo-cpu"); cCpu.innerHTML = "";
  for(let i=0;i<5;i++){
    const slot = sb.campoCpu[i];
    const div = document.createElement("div");
    div.className = "sb-slot" + (slot ? "" : " vazio") + (atacando && slot ? " alvo" : "");
    div.innerHTML = slot ? sbHtmlCarta(slot, false) : "";
    if(atacando && slot) div.onclick = ()=>sbClicarCampoCpu(i);
    cCpu.appendChild(div);
  }
  // campo do jogador (5 slots)
  const cJog = $("#sb-campo-jog"); cJog.innerHTML = "";
  for(let i=0;i<5;i++){
    const slot = sb.campoJog[i];
    const podeAtacar = slot && slot.modo==="ataque" && !slot.jaAtacou && sb.turnoDe==="jogador" && sb.acoes>0 && !sb.travado;
    const div = document.createElement("div");
    div.className = "sb-slot" + (slot ? "" : " vazio") +
      (podeAtacar ? " pode-atacar" : "") +
      (atacando && sb.selecao.idx===i ? " selecionado" : "");
    div.innerHTML = slot ? sbHtmlCarta(slot, true) : "";
    if(slot && sb.turnoDe==="jogador") div.onclick = ()=>sbClicarCampoJog(i);
    cJog.appendChild(div);
  }
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

  // controles / painéis
  $("#btn-sb-comprar").disabled = sb.travado || sb.turnoDe!=="jogador" || sb.acoes<=0 || sb.baralhoJog.length===0;
  $("#btn-sb-encerrar").disabled = sb.travado || sb.turnoDe!=="jogador";

  // painel de colocação
  const pc = $("#sb-colocar");
  if(sb.selecao && sb.selecao.tipo === "colocar"){
    const carta = sb.maoJog[sb.selecao.idx];
    pc.hidden = false;
    $("#sb-colocar-nome").textContent = carta ? `Colocar ${carta.nome} — ⚔${carta.ataque} 🛡${carta.defesa}` : "";
  } else pc.hidden = true;

  // botão de ataque direto
  const bd = $("#sb-btn-direto");
  bd.hidden = !atacando;

  if(!sb.selecao){
    sbMsg(sb.turnoDe==="jogador" && !sb.fim
      ? "Seu turno: compre, coloque cartas (ataque/defesa) ou ataque. Você tem 3 ações."
      : (sb.fim ? "" : "O oponente está jogando..."));
  }
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
  const bc = $("#btn-sb-comprar"); if(bc) bc.addEventListener("click", sbComprar);
  const be = $("#btn-sb-encerrar"); if(be) be.addEventListener("click", ()=>{ if(!sb.travado && sb.turnoDe==="jogador") sbEncerrarTurno(); });
  const bs = $("#btn-sb-sair"); if(bs) bs.addEventListener("click", ()=>{ sb.fim=true; limparTimers(); abrirCampanhaSuper(); });
  const bd = $("#sb-btn-direto"); if(bd) bd.addEventListener("click", sbAtaqueDireto);
  const bl = $("#btn-comprar-lp"); if(bl) bl.addEventListener("click", comprarLPSuper);
  const bcancel = $("#sb-colocar-cancelar"); if(bcancel) bcancel.addEventListener("click", ()=>{ sb.selecao=null; sbDesenhar(); });
  // opções de colocação (delegação)
  document.querySelectorAll(".sb-opcao").forEach(op=>op.addEventListener("click", ()=>{
    if(!sb.selecao || sb.selecao.tipo!=="colocar") return;
    sbColocar(sb.selecao.idx, op.dataset.modo, op.dataset.cima === "1");
  }));
});
