/* ===== Super Pokémon — Jogo de Cartas (Campanha + Loja) ===== */
"use strict";

// Ícones SVG das habilidades (estilo Super Pokémon: anel colorido + glifo em fundo branco)
const ICONES = {
  vida:
    '<svg class="ic" viewBox="0 0 28 28"><circle cx="14" cy="14" r="13" fill="#fff" stroke="#e01f26" stroke-width="2"/>'+
    '<path d="M14 21.5C8.5 17 6 14.2 6 11.2A3.8 3.8 0 0 1 14 8.7A3.8 3.8 0 0 1 22 11.2C22 14.2 19.5 17 14 21.5Z" fill="#e01f26"/></svg>',
  forca:
    '<svg class="ic" viewBox="0 0 28 28"><circle cx="14" cy="14" r="13" fill="#fff" stroke="#ef4a1e" stroke-width="2"/>'+
    '<g fill="#ef4a1e"><rect x="8" y="13" width="11" height="6.6" rx="2"/><circle cx="9.6" cy="13" r="1.5"/>'+
    '<circle cx="12.5" cy="12.6" r="1.6"/><circle cx="15.4" cy="12.7" r="1.6"/><circle cx="18" cy="13.2" r="1.4"/>'+
    '<path d="M8 15.6l-1.9-1.2a1 1 0 0 1 1.1-1.6L9 13.6z"/></g></svg>',
  inteligencia:
    '<svg class="ic" viewBox="0 0 28 28"><circle cx="14" cy="14" r="13" fill="#fff" stroke="#23c6d6" stroke-width="2"/>'+
    '<path d="M14 5.5 15.3 10.9 20 8 17.1 12.7 22.5 14 17.1 15.3 20 20 15.3 17.1 14 22.5 12.7 17.1 8 20 10.9 15.3 5.5 14 10.9 12.7 8 8 12.7 10.9Z" fill="#23c6d6"/></svg>',
  ataque:
    '<svg class="ic" viewBox="0 0 28 28"><circle cx="14" cy="14" r="13" fill="#fff" stroke="#f15a22" stroke-width="2"/>'+
    '<g fill="#f15a22"><path d="M14 4 16 7 16 16 12 16 12 7Z"/><rect x="9.5" y="15.6" width="9" height="2.2" rx="1"/>'+
    '<rect x="13" y="17.8" width="2" height="5.2" rx="1"/></g></svg>',
  defesa:
    '<svg class="ic" viewBox="0 0 28 28"><circle cx="14" cy="14" r="13" fill="#fff" stroke="#f5a623" stroke-width="2"/>'+
    '<path d="M14 5 21 7.3V12.5C21 16.5 18 19.7 14 21.3 10 19.7 7 16.5 7 12.5V7.3Z" fill="#f5a623"/>'+
    '<path d="M14 9.5 15.5 12.5 18.8 13 16.4 15.3 17 18.6 14 17 11 18.6 11.6 15.3 9.2 13 12.5 12.5Z" fill="#fff"/></svg>',
  agilidade:
    '<svg class="ic" viewBox="0 0 28 28"><circle cx="14" cy="14" r="13" fill="#fff" stroke="#67c327" stroke-width="2"/>'+
    '<circle cx="16" cy="14" r="6" fill="#67c327"/>'+
    '<g stroke="#67c327" stroke-width="1.8" stroke-linecap="round" fill="none">'+
    '<path d="M8 10.5H5"/><path d="M8 14H3.5"/><path d="M8 17.5H5"/></g></svg>',
};

const ATRIBUTOS = [
  {chave:"vida",         nome:"VIDA",         svg:ICONES.vida},
  {chave:"forca",        nome:"FORÇA",        svg:ICONES.forca},
  {chave:"ataque",       nome:"ATAQUE",       svg:ICONES.ataque},
  {chave:"defesa",       nome:"DEFESA",       svg:ICONES.defesa},
  {chave:"agilidade",    nome:"AGILIDADE",    svg:ICONES.agilidade},
  {chave:"inteligencia", nome:"INTELIGÊNCIA", svg:ICONES.inteligencia},
];

// Cores de fundo da carta por tipo (Tipo 1 -> Tipo 2)
const CORES_TIPO = {
  GRAMA:"#4caf50", VENENO:"#9c4dcc", FOGO:"#ff7043", AGUA:"#42a5f5",
  ELETRICO:"#ffca28", GELO:"#4dd0e1", LUTADOR:"#d84343", TERRA:"#c9975b",
  VOADOR:"#90b4f0", PSIQUICO:"#f06292", INSETO:"#9ccc35", PEDRA:"#a1887f",
  FANTASMA:"#7e57c2", DRAGAO:"#5c6bc0", NORMAL:"#9e9e9e", METALICO:"#90a4ae",
  ACO:"#90a4ae", FADA:"#f48fb1", NOTURNO:"#5d4037", "":"#607d8b"
};
function corTipo(t){
  const k = (t||"").toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g,"");
  return CORES_TIPO[k] || "#607d8b";
}

const SPRITE = id =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
const SPRITE_FALLBACK = id =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

/* ===================================================================
   PROGRESSÃO / ECONOMIA
   =================================================================== */
const SAVE_KEY = "superpoke_save_v2";
const CARTAS_INICIAIS = [10, 13, 16];          // Caterpie, Weedle, Pidgey (3 fracas)

const PRECOS = {
  "Comum":60, "Incomum":150, "Raro":320, "Super Raro":650,
  "Lendário":1200, "Lendário Supremo":2200, "Mítico":2600
};
function precoCarta(p){ return PRECOS[p.raridade] || 120; }
function precoVenda(p){ return Math.floor(precoCarta(p) / 2); }   // vende por metade

// Pacotes de raridade (booster) — cada pacote dá 2 cartas conforme a distribuição
const PACOTES = [
  {id:"comum",    nome:"Pacote Comum",       emoji:"📦", preco:500,  cor:"#8c98ad",
    dist:{"Comum":50,"Incomum":30,"Raro":15,"Super Raro":5,"Lendário":0,"Lendário Supremo":0,"Mítico":0}},
  {id:"incomum",  nome:"Pacote Incomum",     emoji:"🎁", preco:1000, cor:"#4caf50",
    dist:{"Comum":30,"Incomum":35,"Raro":30,"Super Raro":5,"Lendário":0,"Lendário Supremo":0,"Mítico":0}},
  {id:"raro",     nome:"Pacote Raro",        emoji:"💎", preco:2200, cor:"#2a75bb",
    dist:{"Comum":15,"Incomum":25,"Raro":35,"Super Raro":20,"Lendário":5,"Lendário Supremo":0,"Mítico":0}},
  {id:"lendario", nome:"Pacote Lendário",    emoji:"🏆", preco:4500, cor:"#e0a800",
    dist:{"Comum":10,"Incomum":20,"Raro":22,"Super Raro":25,"Lendário":22,"Lendário Supremo":1,"Mítico":0}},
  {id:"mitico",   nome:"Pacote Mitológico",  emoji:"🌟", preco:9000, cor:"#c2185b",
    dist:{"Comum":5,"Incomum":10,"Raro":16,"Super Raro":30,"Lendário":33,"Lendário Supremo":5,"Mítico":1}},
];

// Escada de 25 oponentes (estilo Mortal Kombat) — sobe de dificuldade pela raridade
const NIVEIS = [
  {n:1,  nome:"Aprendiz Léo",       raridades:["Comum"]},
  {n:2,  nome:"Colecionador Tavo",  raridades:["Comum"]},
  {n:3,  nome:"Campista Bia",       raridades:["Comum","Incomum"]},
  {n:4,  nome:"Escoteiro Rui",      raridades:["Incomum"]},
  {n:5,  nome:"Líder Rocha",        raridades:["Incomum"]},
  {n:6,  nome:"Domador Ígor",       raridades:["Incomum","Raro"]},
  {n:7,  nome:"Nadadora Cora",      raridades:["Raro"]},
  {n:8,  nome:"Feiticeira Morgana", raridades:["Raro"]},
  {n:9,  nome:"Piromante Bruno",    raridades:["Raro","Super Raro"]},
  {n:10, nome:"Líder Volt",         raridades:["Raro","Super Raro"]},
  {n:11, nome:"Cientista Nyx",      raridades:["Super Raro"]},
  {n:12, nome:"Ninja Kaze",         raridades:["Super Raro"]},
  {n:13, nome:"Domador Fenris",     raridades:["Super Raro"]},
  {n:14, nome:"Elite Drago",        raridades:["Super Raro","Lendário"]},
  {n:15, nome:"Elite Vesper",       raridades:["Super Raro","Lendário"]},
  {n:16, nome:"Elite Aurora",       raridades:["Lendário"]},
  {n:17, nome:"Elite Ígnea",        raridades:["Lendário"]},
  {n:18, nome:"Guardião Trovão",    raridades:["Lendário"]},
  {n:19, nome:"Guardiã Maré",       raridades:["Lendário"]},
  {n:20, nome:"Campeã Régulus",     raridades:["Lendário"]},
  {n:21, nome:"Sábio do Tempo",     raridades:["Lendário","Mítico"]},
  {n:22, nome:"Oráculo Celeste",    raridades:["Lendário","Mítico"]},
  {n:23, nome:"Rainha Psíquica",    raridades:["Lendário","Lendário Supremo"]},
  {n:24, nome:"Lorde Genético",     raridades:["Lendário Supremo","Mítico"]},
  {n:25, nome:"MESTRE SUPREMO",     raridades:["Lendário","Lendário Supremo","Mítico"]},
];
const MAX_NIVEL = NIVEIS.length;

// Ouro ganho ao derrotar o oponente do nível (base; +60 na 1ª vez que passa)
function ouroBaseNivel(nivel){ return 25 + nivel*15; }
function bonusPrimeiraVez(){ return 60; }
function ehBoss(nivel){ return nivel >= 21; }   // bosses finais têm lendários garantidos

/* ===== CAMPANHA VIDA (modo pontos de vida) — 20 níveis ===== */
const NIVEIS_VIDA = [
  {n:1,  nome:"Duelista Kai",       raridades:["Comum"]},
  {n:2,  nome:"Recruta Vera",       raridades:["Comum"]},
  {n:3,  nome:"Gladiadora Sol",     raridades:["Comum","Incomum"]},
  {n:4,  nome:"Sentinela Rex",      raridades:["Incomum"]},
  {n:5,  nome:"Bruxo Aldo",         raridades:["Incomum"]},
  {n:6,  nome:"Caçadora Íris",      raridades:["Incomum","Raro"]},
  {n:7,  nome:"Templária Nara",     raridades:["Raro"]},
  {n:8,  nome:"Bárbaro Thor",       raridades:["Raro"]},
  {n:9,  nome:"Arcanista Lux",      raridades:["Raro","Super Raro"]},
  {n:10, nome:"Sombra Corvo",       raridades:["Super Raro"]},
  {n:11, nome:"Valquíria Edda",     raridades:["Super Raro"]},
  {n:12, nome:"Golem Ferro",        raridades:["Super Raro"]},
  {n:13, nome:"Feiticeiro Onix",    raridades:["Super Raro","Lendário"]},
  {n:14, nome:"Dragão Escarlate",   raridades:["Lendário"]},
  {n:15, nome:"Colosso Titânio",    raridades:["Lendário"]},
  {n:16, nome:"Fênix Solar",        raridades:["Lendário"]},
  {n:17, nome:"Leviatã Abissal",    raridades:["Lendário"]},
  {n:18, nome:"Guardião Eterno",    raridades:["Lendário","Mítico"]},
  {n:19, nome:"Imperador Astral",   raridades:["Lendário Supremo","Mítico"]},
  {n:20, nome:"AVATAR SUPREMO",     raridades:["Lendário","Lendário Supremo","Mítico"]},
];
const MAX_NIVEL_VIDA = NIVEIS_VIDA.length;
// Vida do oponente por nível: 40, 60, 85, 115, 150... (incremento sobe +5 a cada fase)
function vidaOponente(nivel){ const d = nivel - 1; return 40 + 15*d + 5*(d*(d+1)/2); }
function ouroBaseNivelVida(nivel){ return 30 + nivel*18; }
const VIDA_INICIAL = 50;
const VIDA_INCREMENTO = 10;                                  // compra de vida de 10 em 10
function custoVida(){ return Math.round(progresso.vidaMax * 0.8); }   // preço para +10 de vida

let progresso = carregarProgresso();

function progressoPadrao(){
  // owned vazio: o jogador escolhe seus 3 primeiros Pokémon na tela inicial
  return { owned: [], pontos: 0, nivel: 1, vitorias: 0, derrotas: 0,
           timeFavorito: [], nome: "Treinador", foto: "🧑",
           nivelVida: 1, vidaMax: VIDA_INICIAL, campanhaZerada: false,
           nivelSuper: 1, lpSuper: 100 };
}
function carregarProgresso(){
  try{
    const raw = localStorage.getItem(SAVE_KEY);
    if(raw){
      const o = JSON.parse(raw);
      if(o && Array.isArray(o.owned) && o.owned.length){
        if(typeof o.vitorias !== "number") o.vitorias = 0;   // saves antigos
        if(typeof o.derrotas !== "number") o.derrotas = 0;
        if(!Array.isArray(o.timeFavorito)) o.timeFavorito = [];
        if(typeof o.nome !== "string") o.nome = "Treinador";
        if(typeof o.foto !== "string") o.foto = "🧑";
        if(typeof o.nivelVida !== "number") o.nivelVida = 1;
        if(typeof o.vidaMax !== "number") o.vidaMax = VIDA_INICIAL;
        if(typeof o.campanhaZerada !== "boolean") o.campanhaZerada = (o.nivel > MAX_NIVEL);
        if(typeof o.nivelSuper !== "number") o.nivelSuper = 1;
        if(typeof o.lpSuper !== "number") o.lpSuper = 100;
        return o;
      }
    }
  }catch(e){}
  return progressoPadrao();
}
function salvarProgresso(){
  try{ localStorage.setItem(SAVE_KEY, JSON.stringify(progresso)); }catch(e){}
}
function cartaPorId(id){ return POKEMONS.find(p=>p.id===id); }
// cartas ÚNICAS que o jogador possui (owned pode ter repetidas)
function cartasPossuidas(){ return [...new Set(progresso.owned)].map(cartaPorId).filter(Boolean); }
function qtdDe(id){ return progresso.owned.filter(x=>x===id).length; }
function totalDistintas(){ return new Set(progresso.owned).size; }

/* ---------- Utilidades ---------- */
const $ = sel => document.querySelector(sel);
function mostrarTela(id){
  document.querySelectorAll(".tela").forEach(t=>t.classList.remove("ativa"));
  $("#"+id).classList.add("ativa");
}
function embaralhar(arr){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

/* ---------- Renderização de carta ---------- */
function htmlCarta(p, {interativa=false, destaque=null, resultado=null}={}){
  const c1 = corTipo(p.tipo1);
  const c2 = corTipo(p.tipo2 || p.tipo1);
  const tipos = [p.tipo1, p.tipo2].filter(Boolean)
    .map(t=>`<span class="tag-tipo">${t}</span>`).join("");
  const attrs = ATRIBUTOS.map(a=>{
    let cls = "attr attr-" + a.chave;   // contorno colorido por atributo
    if(interativa) cls += " clicavel";
    if(destaque === a.chave) cls += " escolhido";
    if(resultado && resultado.chave === a.chave)
      cls += resultado.venceu ? " venceu" : (resultado.venceu===false ? " perdeu" : "");
    return `<div class="${cls}" data-attr="${a.chave}">
        <span class="attr-nome">${a.svg}<span>${a.nome}</span></span>
        <span class="attr-val">${p[a.chave]}</span>
      </div>`;
  }).join("");
  return `<div class="carta flip-in" style="--c1:${c1};--c2:${c2}">
    <div class="carta-topo">
      <span class="carta-num">Nº ${String(p.id).padStart(3,"0")}</span>
      <span class="carta-tipos">${tipos}</span>
    </div>
    <div class="carta-img">
      <img src="${SPRITE(p.id)}" alt="${p.nome}" loading="lazy"
           onerror="this.onerror=null;this.src='${SPRITE_FALLBACK(p.id)}'">
    </div>
    <div class="carta-nome">${p.nome}</div>
    <div class="carta-rar">${(p.raridade||"").toUpperCase()} · ESTÁGIO ${p.estagio}</div>
    <div class="carta-attrs">${attrs}</div>
  </div>`;
}
const htmlVerso = () => `<div class="carta-verso"></div>`;
// Carta-mistério (lendários na loja): só um "?"
const htmlCartaMisterio = () => `<div class="carta carta-misterio"><span class="misterio-interro">?</span>
  <div class="misterio-txt">LENDÁRIO<br>MISTERIOSO</div></div>`;

/* ===================================================================
   BATALHA
   =================================================================== */
const MAX_RODADAS = 50;        // limite de rodadas -> empate
const MAX_EMPATES_SEGUIDOS = 3; // empates seguidos -> empate
const MIN_CARTAS = 3;          // regra geral: mínimo de 3 cartas no time

const estado = {
  jogador:[], cpu:[], rodada:0, eliminadas:0,
  elimJogador:[], elimCpu:[], empatesSeguidos:0,
  turnoDe:"jogador", travado:false, contexto:{tipo:"livre"},
  modoVida:false, hpJogador:0, hpCpu:0, hpJogadorMax:0, hpCpuMax:0
};

function iniciarBatalha(deckJogador, deckCpu, contexto){
  estado.jogador = deckJogador.map(c=>({...c}));
  estado.cpu     = deckCpu.map(c=>({...c}));
  estado.rodada = 0;
  estado.eliminadas = 0;
  estado.elimJogador = [];
  estado.elimCpu = [];
  estado.empatesSeguidos = 0;
  estado.turnoDe = "jogador";
  estado.travado = false;
  estado.abortado = false;
  estado.contexto = contexto;
  // modo pontos de vida
  estado.modoVida = !!contexto.modoVida;
  estado.hpJogadorMax = contexto.modoVida ? progresso.vidaMax : 0;
  estado.hpCpuMax = contexto.modoVida ? contexto.hpCpu : 0;
  estado.hpJogador = estado.hpJogadorMax;
  estado.hpCpu = estado.hpCpuMax;
  document.querySelector("#tela-jogo").classList.toggle("modo-vida", estado.modoVida);
  $("#log").innerHTML = "";
  $("#efeito-camada").className = "";
  $("#oponente-info").textContent = contexto.titulo || "";
  // avatares
  $("#avatar-jogador").textContent = progresso.foto || "🧑";
  $("#nome-jogador").textContent = progresso.nome || "VOCÊ";
  $("#avatar-oponente").textContent = contexto.avatarOp || "🤖";
  mostrarTela("tela-jogo");
  proximaRodada();
}

// Avatares de oponente por nível (visual temático da escada)
const AVATARES_OPONENTE = ["🧒","🧢","🏕️","🥾","🪨","🐎","🏊","🧙‍♀️","🔥","⚡","🔬","🥷","🐺","🐉","🦇","🌌","🌋","🌩️","🌊","👑","⏳","🌠","🔮","🧬","💀"];
function avatarDoNivel(nivel){ return AVATARES_OPONENTE[(nivel-1) % AVATARES_OPONENTE.length]; }

// Oponentes têm de 3 a 5 cartas, crescendo com o nível
function tamanhoDeckOponente(nivel){ return Math.min(5, 3 + Math.floor((nivel-1)/3)); }

/* ---------- Lendários / Míticos ---------- */
const RARIDADES_LENDARIAS = ["Lendário","Lendário Supremo","Mítico"];
function ehLendario(p){ return RARIDADES_LENDARIAS.includes(p.raridade); }

// Baralho do oponente: cartas REAIS da raridade do nível (sem inflar stats).
// A dificuldade vem da raridade/poder das cartas, não de multiplicador.
function gerarDeckOponente(info, qtd){
  let pool = POKEMONS.filter(p=>info.raridades.includes(p.raridade));
  if(pool.length === 0) pool = POKEMONS.slice();
  const emb = embaralhar(pool);
  const deck = [], ids = [];
  for(let i=0;i<qtd;i++){
    const base = emb[i % emb.length];
    deck.push({...base});
    ids.push(base.id);
  }
  return {deck, ids};
}

function iniciarNivel(nivel, meuDeck){
  const info = NIVEIS[nivel-1];
  if(!meuDeck || !meuDeck.length){
    meuDeck = embaralhar(cartasPossuidas()).slice(0, 5);
    if(meuDeck.length === 0) meuDeck = CARTAS_INICIAIS.map(cartaPorId);
  }
  const {deck:cpuDeck} = gerarDeckOponente(info, tamanhoDeckOponente(nivel));
  iniciarBatalha(meuDeck, cpuDeck, {
    tipo:"campanha", nivel,
    titulo:`Nível ${nivel} · ${info.nome}`,
    avatarOp: avatarDoNivel(nivel)
  });
}

// Campanha VIDA: duelo por pontos de vida (dano = diferença do atributo)
function iniciarNivelVida(nivel, meuDeck){
  const info = NIVEIS_VIDA[nivel-1];
  if(!meuDeck || !meuDeck.length){
    meuDeck = embaralhar(cartasPossuidas()).slice(0, 5);
    if(meuDeck.length === 0) meuDeck = CARTAS_INICIAIS.map(cartaPorId);
  }
  const {deck:cpuDeck} = gerarDeckOponente(info, tamanhoDeckOponente(nivel));
  iniciarBatalha(meuDeck, cpuDeck, {
    tipo:"campanha-vida", nivel,
    modoVida:true, hpCpu: vidaOponente(nivel),
    titulo:`Vida ${nivel} · ${info.nome}`,
    avatarOp: avatarDoNivel(nivel + 4)
  });
}

/* ---------- Batalha livre (2 modos) ---------- */
function escolherBatalhaLivre(){ $("#modal-livre").hidden = false; }
function batalhaLivre(modo){
  $("#modal-livre").hidden = true;
  let meu, cpu;
  if(modo === "meu"){
    // com SEUS Pokémon (usa time favorito se houver, senão sorteia) — ganha ouro
    let base = (progresso.timeFavorito && progresso.timeFavorito.length)
      ? progresso.timeFavorito.map(cartaPorId).filter(Boolean)
      : embaralhar(cartasPossuidas()).slice(0, 5);
    if(!base.length) base = CARTAS_INICIAIS.map(cartaPorId);
    meu = base;
    cpu = embaralhar(POKEMONS.filter(p=>!ehLendario(p))).slice(0, base.length || 5);
  } else {
    // com QUALQUER Pokémon — não ganha ouro
    const emb = embaralhar(POKEMONS).slice(0, 10);
    meu = emb.slice(0,5); cpu = emb.slice(5,10);
  }
  iniciarBatalha(meu, cpu, {tipo:"livre", modo, titulo: modo==="meu" ? "Batalha livre (seus Pokémon)" : "Batalha livre"});
}

/* ---------- Seleção de time (antes da campanha) ---------- */
let _pendingNivel = 1;
let _pendingModo = "normal";   // "normal" (cartas) ou "vida"
const _selecionadas = new Set();
function escolherTimeParaNivel(nivel, modo){
  _pendingNivel = nivel;
  _pendingModo = modo || "normal";
  _selecionadas.clear();
  // pré-seleciona o time favorito (só cartas que possui, até 5)
  (progresso.timeFavorito || []).forEach(id=>{
    if(progresso.owned.includes(id) && _selecionadas.size < 5) _selecionadas.add(id);
  });
  mostrarTela("tela-selecao");
  renderSelecao();
}
function renderSelecao(){
  const grid = $("#sel-grid");
  grid.innerHTML = "";
  const cartas = cartasPossuidas().sort((a,b)=>a.id-b.id);
  cartas.forEach(p=>{
    const sel = _selecionadas.has(p.id);
    const el = document.createElement("div");
    el.className = "sel-item" + (sel ? " sel" : "");
    el.dataset.id = p.id;
    el.innerHTML = htmlCarta(p, {}) + (sel ? '<div class="sel-check">✔</div>' : "");
    el.onclick = ()=>toggleSelecao(p.id, el);
    grid.appendChild(el);
  });
  atualizarStatsSelecao();
}
function atualizarStatsSelecao(){
  const v = progresso.vitorias||0, d = progresso.derrotas||0, part = v+d;
  $("#sel-contagem").textContent = _selecionadas.size;
  $("#btn-sel-confirmar").disabled = _selecionadas.size < MIN_CARTAS;
  $("#sel-pontos").textContent = progresso.pontos;
  $("#sel-vit").textContent = v;
  $("#sel-der").textContent = d;
  $("#sel-perc").textContent = part ? Math.round(v/part*100) : 0;
  $("#sel-part").textContent = part;
  let info, ouro, bonus, extra = "";
  if(_pendingModo === "vida"){
    info = NIVEIS_VIDA[_pendingNivel-1];
    bonus = _pendingNivel === progresso.nivelVida ? 60 : 0;
    ouro = ouroBaseNivelVida(_pendingNivel) + bonus;
    extra = ` · Oponente com <b class="ouro-txt">❤ ${vidaOponente(_pendingNivel)}</b> de vida (você: ${progresso.vidaMax})`;
  } else {
    info = NIVEIS[_pendingNivel-1];
    bonus = _pendingNivel === progresso.nivel ? bonusPrimeiraVez() : 0;
    ouro = ouroBaseNivel(_pendingNivel) + bonus;
  }
  $("#sel-recompensa").innerHTML =
    `Nível ${_pendingNivel} · <b>${info.nome}</b> — vencendo você ganha <b class="ouro-txt">💰 ${ouro} de ouro</b>${bonus?" (bônus de 1ª vez)":""}${extra}`;
}
// Atualiza SÓ a carta clicada (gira ela, sem re-renderizar as outras)
function toggleSelecao(id, el){
  if(_selecionadas.has(id)){
    _selecionadas.delete(id);
  } else {
    if(_selecionadas.size >= 5){ Som.play("erro"); return; }
    _selecionadas.add(id);
  }
  Som.play("select");
  const marcada = _selecionadas.has(id);
  el.classList.toggle("sel", marcada);
  let chk = el.querySelector(".sel-check");
  if(marcada && !chk){
    chk = document.createElement("div"); chk.className = "sel-check"; chk.textContent = "✔";
    el.appendChild(chk);
  } else if(!marcada && chk){ chk.remove(); }
  // giro só desta carta
  const carta = el.querySelector(".carta");
  if(carta){ carta.classList.remove("girar"); void carta.offsetWidth; carta.classList.add("girar"); }
  atualizarStatsSelecao();
}
function confirmarSelecao(){
  const deck = [..._selecionadas].map(cartaPorId).filter(Boolean);
  if(deck.length < MIN_CARTAS){ Som.play("erro"); return; }
  if(_pendingModo === "vida") iniciarNivelVida(_pendingNivel, deck);
  else iniciarNivel(_pendingNivel, deck);
}

function atualizarPlacar(){
  $("#rodada-info").textContent = "Rodada " + estado.rodada;
  if(estado.modoVida){
    $("#cartas-jogador").textContent = "❤ " + estado.hpJogador;
    $("#cartas-cpu").textContent     = "❤ " + estado.hpCpu;
    setBarraVida("#hp-jogador", estado.hpJogador, estado.hpJogadorMax);
    setBarraVida("#hp-cpu",     estado.hpCpu,     estado.hpCpuMax);
    $("#mesa-info").textContent = "duelo de vida";
  } else {
    $("#cartas-jogador").textContent = estado.jogador.length;
    $("#cartas-cpu").textContent     = estado.cpu.length;
    $("#mesa-info").textContent = estado.eliminadas ? `☠ ${estado.eliminadas} eliminada(s)` : "";
  }
  atualizarMao();
  atualizarMaoOponente();
}
function setBarraVida(sel, hp, max){
  const bar = $(sel);
  if(!bar) return;
  const pct = max > 0 ? Math.max(0, Math.min(100, hp/max*100)) : 0;
  const fill = bar.querySelector(".hp-fill");
  if(fill){
    fill.style.width = pct + "%";
    fill.classList.toggle("baixa", pct <= 30);
  }
}

// mini-carta virada para baixo (verso)
function miniVerso(){ return '<div class="mini-carta mini-verso"></div>'; }
// mini-carta derrotada: visível, cinza, com corte vermelho
function miniEliminada(p){
  const c1 = corTipo(p.tipo1), c2 = corTipo(p.tipo2 || p.tipo1);
  return `<div class="mini-carta eliminada" style="--c1:${c1};--c2:${c2}">
      <span class="mini-rot morto">✘ KO</span>
      <img src="${SPRITE(p.id)}" loading="lazy" alt="${p.nome}"
           onerror="this.onerror=null;this.src='${SPRITE_FALLBACK(p.id)}'">
      <span class="mini-nome">${p.nome}</span>
    </div>`;
}

// Mão do jogador: baralho (topo → fundo) + cartas eliminadas (cinza/KO)
function atualizarMao(){
  const cont = $("#mao-lista");
  if(!cont) return;
  let html = estado.jogador.map((p,i)=>{
    const c1 = corTipo(p.tipo1), c2 = corTipo(p.tipo2 || p.tipo1);
    const rot = i===0 ? '<span class="mini-rot atual">EM JOGO</span>'
              : i===1 ? '<span class="mini-rot prox">PRÓXIMA</span>' : "";
    return `<div class="mini-carta ${i===0?'atual':''} ${i===1?'proxima':''}" style="--c1:${c1};--c2:${c2}">
        ${rot}
        <img src="${SPRITE(p.id)}" loading="lazy" alt="${p.nome}"
             onerror="this.onerror=null;this.src='${SPRITE_FALLBACK(p.id)}'">
        <span class="mini-nome">${p.nome}</span>
      </div>`;
  }).join("");
  html += estado.elimJogador.map(miniEliminada).join("");
  cont.innerHTML = html;
}

// Mão do oponente: cartas restantes VIRADAS PARA BAIXO + derrotadas visíveis (cinza/KO)
function atualizarMaoOponente(){
  const cont = $("#mao-op-lista");
  if(!cont) return;
  let html = estado.cpu.map(()=>miniVerso()).join("");
  html += estado.elimCpu.map(miniEliminada).join("");
  cont.innerHTML = html;
}

/* ---------- Cronômetro circular reutilizável ---------- */
const SEGUNDOS_TIMER = 5;    // timer padrão: rodada, vitória, derrota, vez do oponente
const CRONO_CIRC = 100.53;   // 2*pi*16
// markup do cronômetro (anel que preenche + número no centro)
function htmlCrono(seg){
  return `<span class="crono">
    <svg viewBox="0 0 36 36"><circle class="cr-bg" cx="18" cy="18" r="16"></circle>`+
    `<circle class="cr-fg" cx="18" cy="18" r="16" stroke-dasharray="${CRONO_CIRC}" stroke-dashoffset="${CRONO_CIRC}"></circle></svg>`+
    `<b class="cr-num">${seg}</b></span>`;
}
// anima o anel de vazio→cheio em `segundos` e conta 5..1; chama onDone no fim
function animarCrono(host, segundos, onDone){
  const fg = host.querySelector(".cr-fg");
  const num = host.querySelector(".cr-num");
  if(fg){
    fg.style.transition = "none";
    fg.style.strokeDashoffset = CRONO_CIRC;
    void fg.getBoundingClientRect();   // força reflow p/ registrar o estado inicial
    fg.style.transition = `stroke-dashoffset ${segundos}s linear`;
    fg.style.strokeDashoffset = "0";
  }
  let restante = segundos;
  if(num) num.textContent = restante;
  return setInterval(()=>{
    restante--;
    if(num) num.textContent = Math.max(0, restante);
    if(restante <= 0){ onDone && onDone(); }
  }, 1000);
}

let _tickTimer = null;
let _fimTimer = null;
function limparTimers(){
  clearInterval(_tickTimer); _tickTimer = null;
  clearInterval(_fimTimer);  _fimTimer = null;
  pararTurnoTimerJogo();
}
function agendarProxima(segundos){
  limparTimers();
  const b = $("#btn-proxima");
  b.hidden = false;
  b.classList.add("com-crono");                       // botão redondo ▶ com anel de contagem
  b.innerHTML = `▶${htmlCrono(segundos)}`;
  b.onclick = ()=>{ limparTimers(); proximaRodada(); };
  _tickTimer = animarCrono(b, segundos, ()=>{ limparTimers(); proximaRodada(); });
}

/* ---------- Timer de turno (30s) nos modos Classic e Life ---------- */
const SEGUNDOS_TURNO = 30;
let _turnoTimer = null, _turnoRestante = 0;
function pararTurnoTimerJogo(){
  if(_turnoTimer){ clearInterval(_turnoTimer); _turnoTimer = null; }
  const barra = $("#jogo-tempo-barra"); if(barra) barra.hidden = true;
}
function iniciarTurnoTimerJogo(){
  pararTurnoTimerJogo();
  const barra = $("#jogo-tempo-barra"), fill = $("#jogo-tempo-fill");
  if(!barra || !fill) return;
  barra.hidden = false;
  _turnoRestante = SEGUNDOS_TURNO;
  fill.style.transition = "none";
  fill.style.width = "100%";
  fill.className = "sb-tempo-fill verde";
  void fill.getBoundingClientRect();
  fill.style.transition = "width 1s linear";
  _turnoTimer = setInterval(()=>{
    _turnoRestante--;
    fill.style.width = Math.max(0, (_turnoRestante / SEGUNDOS_TURNO) * 100) + "%";
    fill.className = "sb-tempo-fill " + (_turnoRestante<=8 ? "vermelho" : _turnoRestante<=15 ? "amarelo" : "verde");
    if(_turnoRestante <= 0){
      pararTurnoTimerJogo();
      if(!estado.travado && estado.turnoDe === "jogador" && estado.jogador[0]){
        const ch = ATRIBUTOS[Math.floor(Math.random() * ATRIBUTOS.length)].chave;   // tempo esgotou → joga aleatório
        jogarAtributo(ch);
      }
    }
  }, 1000);
}

function proximaRodada(){
  if(estado.abortado) return;
  limparTimers();
  if(estado.modoVida){
    if(estado.hpJogador <= 0 || estado.hpCpu <= 0) return finalizar();
  } else if(estado.jogador.length === 0 || estado.cpu.length === 0){
    return finalizar();
  }
  // empate: 3 empates seguidos ou limite de rodadas
  if(estado.empatesSeguidos >= MAX_EMPATES_SEGUIDOS || estado.rodada >= MAX_RODADAS)
    return finalizar(true);
  estado.rodada++;
  estado.travado = false;
  estado.chooserDaRodada = estado.turnoDe;   // quem escolhe nesta rodada
  atualizarPlacar();

  const meu = estado.jogador[0];
  const seu = estado.cpu[0];

  $("#carta-jogador").innerHTML = htmlCarta(meu, {interativa: estado.turnoDe==="jogador"});
  $("#carta-cpu").innerHTML     = htmlVerso();
  $("#vs-texto").textContent = "VS";
  $("#btn-proxima").hidden = true;

  if(estado.turnoDe === "jogador"){
    $("#turno-aviso").textContent = "SEU TURNO — clique num atributo da sua carta 👆";
    $("#carta-jogador").querySelectorAll(".attr.clicavel").forEach(el=>{
      el.addEventListener("click", ()=>jogarAtributo(el.dataset.attr));
    });
    iniciarTurnoTimerJogo();   // 30s para escolher um atributo
  } else {
    $("#turno-aviso").textContent = "🤖 O OPONENTE ESTÁ PENSANDO...";
    setTimeout(()=>jogarAtributo(escolhaCPU(seu), true), 1200);
  }
}

// Máximo de cada atributo (para comparar atributos de escalas diferentes)
const MAX_ATTR = {};
ATRIBUTOS.forEach(a=>{ MAX_ATTR[a.chave] = Math.max(1, ...POKEMONS.map(p=>p[a.chave])); });

// Variedade da IA: 75% a melhor, 15% a 2ª, 5% a 3ª, 5% aleatória.
// Recebe uma lista já ordenada (melhor -> pior) e devolve um item dela.
function escolhaComErro(ordenados){
  if(!ordenados || !ordenados.length) return null;
  if(ordenados.length === 1) return ordenados[0];
  const r = Math.random();
  let idx;
  if(r < 0.75) idx = 0;
  else if(r < 0.90) idx = 1;
  else if(r < 0.95) idx = 2;
  else idx = Math.floor(Math.random() * ordenados.length);
  return ordenados[Math.min(idx, ordenados.length - 1)];
}

// Oponente escolhe o atributo — com chance de errar (variedade)
function escolhaCPU(carta){
  const ord = ATRIBUTOS
    .map(a => ({ chave:a.chave, ratio: carta[a.chave] / MAX_ATTR[a.chave] }))
    .sort((a,b) => b.ratio - a.ratio);
  return escolhaComErro(ord).chave;
}

function jogarAtributo(chave, porOponente){
  if(estado.abortado || estado.travado) return;
  estado.travado = true;
  pararTurnoTimerJogo();   // encerra o timer de 30s ao jogar

  const meu = estado.jogador[0];
  const seu = estado.cpu[0];
  const attr = ATRIBUTOS.find(a=>a.chave===chave);

  Som.play("atributo");
  // realça o atributo escolhido (preenchido/contornado de amarelo) nas duas cartas
  $("#carta-jogador").innerHTML = htmlCarta(meu, {destaque:chave});
  $("#carta-cpu").innerHTML = htmlCarta(seu, {destaque:chave});
  $("#turno-aviso").innerHTML = porOponente
    ? `🤖 Oponente escolheu: ${attr.svg}<span>${attr.nome}</span>`
    : `Atributo: ${attr.svg}<span>${attr.nome}</span>`;

  const vMeu = meu[chave], vSeu = seu[chave];
  let venc;
  if(vMeu > vSeu) venc = "jogador";
  else if(vSeu > vMeu) venc = "cpu";
  else venc = "empate";

  // dá tempo de ler o atributo escolhido antes de destacar o resultado
  // (mais tempo quando foi o oponente que escolheu)
  const atraso = porOponente ? 1200 : 550;
  setTimeout(()=>{
    $("#carta-jogador").innerHTML = htmlCarta(meu, {
      resultado:{chave, venceu: venc==="jogador" ? true : (venc==="cpu"?false:null)}
    });
    $("#carta-cpu").innerHTML = htmlCarta(seu, {
      resultado:{chave, venceu: venc==="cpu" ? true : (venc==="jogador"?false:null)}
    });
    resolverRodada(venc, meu, seu, attr, vMeu, vSeu);
  }, atraso);
}

function resolverRodada(venc, meu, seu, attr, vMeu, vSeu){
  // remove as cartas do topo dos dois baralhos
  estado.jogador.shift();
  estado.cpu.shift();

  const jc = document.querySelector("#carta-jogador .carta");
  const cc = document.querySelector("#carta-cpu .carta");
  let msg, cls;

  // ===== MODO VIDA: dano = diferença do atributo; cartas voltam ao fundo (não eliminam) =====
  // Turnos ALTERNAM sempre (um do jogador, um da máquina), independente de quem venceu.
  if(estado.modoVida){
    estado.jogador.push(meu);
    estado.cpu.push(seu);
    const dano = Math.abs(vMeu - vSeu);
    if(venc === "jogador"){
      estado.hpCpu = Math.max(0, estado.hpCpu - dano);
      estado.empatesSeguidos = 0;
      msg = `✔ ${meu.nome} venceu em ${attr.nome} (${vMeu}×${vSeu}) — oponente perde ${dano} de vida!`;
      cls = "log-vitoria"; $("#vs-texto").textContent = "◀";
      if(jc) jc.classList.add("efeito-vitoria"); if(cc) cc.classList.add("efeito-derrota");
      efeitoTela("vitoria"); Som.play("vencerRodada");
    } else if(venc === "cpu"){
      estado.hpJogador = Math.max(0, estado.hpJogador - dano);
      estado.empatesSeguidos = 0;
      msg = `✘ ${seu.nome} venceu em ${attr.nome} (${vSeu}×${vMeu}) — você perde ${dano} de vida!`;
      cls = "log-derrota"; $("#vs-texto").textContent = "▶";
      if(jc) jc.classList.add("efeito-derrota"); if(cc) cc.classList.add("efeito-vitoria");
      efeitoTela("derrota"); Som.play("perderRodada");
    } else {
      estado.empatesSeguidos++;
      msg = `= Empate em ${attr.nome} (${vMeu}) — ninguém perde vida (${estado.empatesSeguidos}/${MAX_EMPATES_SEGUIDOS})`;
      cls = "log-empate"; $("#vs-texto").textContent = "="; efeitoTela("empate"); Som.play("empate");
    }
    estado.turnoDe = estado.turnoDe === "jogador" ? "cpu" : "jogador";   // sempre alterna
    addLog(msg, cls);
    atualizarPlacar();
    agendarProxima(SEGUNDOS_TIMER);
    return;
  }

  if(venc === "jogador"){
    // carta do oponente é ELIMINADA (sai do jogo); a sua volta para o fundo
    estado.jogador.push(meu);
    estado.elimCpu.push(seu);
    estado.eliminadas++;
    estado.empatesSeguidos = 0;
    msg = `✔ ${meu.nome} venceu ${seu.nome} em ${attr.nome} (${vMeu}×${vSeu}) — ${seu.nome} foi eliminado!`;
    cls = "log-vitoria";
    $("#vs-texto").textContent = "◀";
    estado.turnoDe = "jogador";
    if(jc) jc.classList.add("efeito-vitoria");
    if(cc) cc.classList.add("efeito-derrota");
    efeitoTela("vitoria");
    Som.play("vencerRodada");
  } else if(venc === "cpu"){
    // sua carta é ELIMINADA; a do oponente volta para o fundo
    estado.cpu.push(seu);
    estado.elimJogador.push(meu);
    estado.eliminadas++;
    estado.empatesSeguidos = 0;
    msg = `✘ ${seu.nome} venceu ${meu.nome} em ${attr.nome} (${vSeu}×${vMeu}) — ${meu.nome} foi eliminado!`;
    cls = "log-derrota";
    $("#vs-texto").textContent = "▶";
    estado.turnoDe = "cpu";
    if(jc) jc.classList.add("efeito-derrota");
    if(cc) cc.classList.add("efeito-vitoria");
    efeitoTela("derrota");
    Som.play("perderRodada");
  } else {
    // empate: ninguém eliminado — as duas voltam para o fundo dos baralhos
    estado.jogador.push(meu);
    estado.cpu.push(seu);
    estado.empatesSeguidos++;
    msg = `= Empate em ${attr.nome} (${vMeu}) — ninguém eliminado (${estado.empatesSeguidos}/${MAX_EMPATES_SEGUIDOS})`;
    cls = "log-empate";
    $("#vs-texto").textContent = "=";
    estado.turnoDe = estado.turnoDe === "jogador" ? "cpu" : "jogador";
    efeitoTela("empate");
    Som.play("empate");
  }

  addLog(msg, cls);
  atualizarPlacar();

  // Timer da próxima rodada: 2s quando foi o oponente que escolheu, 6s quando foi você
  agendarProxima(SEGUNDOS_TIMER);
}

/* ---------- Efeitos visuais ---------- */
function efeitoTela(tipo){
  const cam = $("#efeito-camada");
  if(!cam) return;
  cam.className = "";
  void cam.offsetWidth;   // força reflow para reiniciar a animação
  const txt = tipo === "vitoria" ? "✔ VENCEU!"
            : tipo === "derrota" ? "✘ PERDEU!" : "= EMPATE";
  cam.innerHTML = `<span class="efeito-txt">${txt}</span>`;
  cam.className = "mostra " + tipo;
  clearTimeout(efeitoTela._t);
  efeitoTela._t = setTimeout(()=>{ cam.className = ""; cam.innerHTML = ""; }, 950);
}

function confete(){
  const c = $("#confete");
  if(!c) return;
  c.innerHTML = "";
  const cores = ["#ffcb05","#2a75bb","#e3350d","#3bb54a","#23c6d6","#f48fb1"];
  for(let i=0;i<70;i++){
    const d = document.createElement("i");
    d.style.left = (Math.random()*100) + "%";
    d.style.background = cores[i % cores.length];
    d.style.animationDelay = (Math.random()*0.7) + "s";
    d.style.animationDuration = (1.6 + Math.random()*1.6) + "s";
    c.appendChild(d);
  }
  setTimeout(()=>{ c.innerHTML = ""; }, 3800);
}

function addLog(texto, cls){
  const p = document.createElement("div");
  p.className = cls;
  p.textContent = `R${estado.rodada}: ${texto}`;
  $("#log").prepend(p);
}

/* ---------- Fim de batalha ---------- */
function botaoFim(cont, texto, cls, fn){
  const b = document.createElement("button");
  b.className = "btn " + cls;
  b.innerHTML = texto;
  b.onclick = fn;
  cont.appendChild(b);
}

let _marcoPremio = null;   // prêmio de marco de vitórias a exibir no fim
function finalizar(empate){
  if(estado.abortado) return;
  limparTimers();
  _marcoPremio = null;
  const ctx = estado.contexto || {tipo:"livre"};
  const venceu = !empate && (estado.modoVida ? estado.hpCpu <= 0 : estado.cpu.length === 0);

  mostrarTela("tela-fim");
  const t = $("#fim-titulo"), s = $("#fim-sub"), acoes = $("#fim-acoes");
  t.classList.remove("venceu","perdeu","empatou");
  acoes.innerHTML = "";
  const emCampanha = ctx.tipo === "campanha";
  const emVida = ctx.tipo === "campanha-vida";
  let autoAvancar = emVida ? abrirCampanhaVida : (emCampanha ? abrirCampanha : irMenu);

  if(empate){
    Som.play("empate");
    t.textContent = "🤝 EMPATE";
    t.classList.add("empatou");
    const motivo = estado.rodada >= MAX_RODADAS
      ? `limite de ${MAX_RODADAS} rodadas atingido`
      : `${MAX_EMPATES_SEGUIDOS} empates seguidos`;
    s.innerHTML = `A batalha terminou empatada (${motivo}). Ninguém venceu.`;
    if(emVida){
      botaoFim(acoes, "↺ Tentar de novo", "btn-grande", ()=>escolherTimeParaNivel(ctx.nivel, "vida"));
      botaoFim(acoes, "❤️ Life Tournament", "btn-sec", abrirCampanhaVida);
    } else if(emCampanha){
      botaoFim(acoes, "↺ Tentar de novo", "btn-grande", ()=>escolherTimeParaNivel(ctx.nivel));
      botaoFim(acoes, "🗺️ Campanha", "btn-sec", abrirCampanha);
    } else {
      botaoFim(acoes, "↺ Jogar de novo", "btn-grande", escolherBatalhaLivre);
      botaoFim(acoes, "Menu inicial", "btn-sec", irMenu);
    }
  } else if(emVida){          // CAMPANHA VIDA (vitória ou derrota por pontos de vida)
    if(venceu){
      Som.play("vencerPartida"); confete();
      const info = NIVEIS_VIDA[ctx.nivel-1];
      const primeiraVez = ctx.nivel === progresso.nivelVida;
      const ganho = ouroBaseNivelVida(ctx.nivel) + (primeiraVez ? 60 : 0);
      progresso.pontos += ganho;
      progresso.vitorias = (progresso.vitorias||0) + 1;
      if(primeiraVez && progresso.nivelVida < MAX_NIVEL_VIDA) progresso.nivelVida++;
      salvarProgresso();
      _marcoPremio = premiarMarcoVitoria();
      const zerou = primeiraVez && ctx.nivel === MAX_NIVEL_VIDA;
      t.textContent = zerou ? "👑 LENDA!" : "🏆 VITÓRIA!"; t.classList.add("venceu");
      s.innerHTML = `Você derrotou <b>${info.nome}</b> com ${estado.hpJogador} de vida restante!<br>`+
        `<span class="ganho">+${ganho} de ouro</span>${primeiraVez?' <span class="bonus">(bônus 1ª vez)</span>':''}`+
        (zerou ? "<br>🎉 Você zerou a Campanha Vida!" : "");
    } else {
      Som.play("perderPartida");
      const info = NIVEIS_VIDA[ctx.nivel-1];
      progresso.derrotas = (progresso.derrotas||0) + 1;
      progresso.pontos += 10;
      salvarProgresso();
      t.textContent = "☠ DERROTA"; t.classList.add("perdeu");
      s.innerHTML = `<b>${info.nome}</b> esgotou sua vida...<br><span class="ganho">+10 de ouro</span> de consolação. Compre mais <b>vida</b> na loja!`;
    }
    botaoFim(acoes, "↺ Tentar de novo", "btn-grande", ()=>escolherTimeParaNivel(ctx.nivel, "vida"));
    botaoFim(acoes, "🛒 Loja", "btn-sec", abrirLoja);
    botaoFim(acoes, "❤️ Campanha Vida", "btn-sec", abrirCampanhaVida);
  } else if(emCampanha){       // CAMPANHA DE CARTAS (vitória ou derrota) — recompensa em OURO
    const info = NIVEIS[ctx.nivel-1];
    if(venceu){
      Som.play("vencerPartida"); confete();
      const primeiraVez = ctx.nivel === progresso.nivel;
      const ganho = ouroBaseNivel(ctx.nivel) + (primeiraVez ? bonusPrimeiraVez() : 0);
      progresso.pontos += ganho;
      progresso.vitorias = (progresso.vitorias||0) + 1;
      if(primeiraVez && progresso.nivel < MAX_NIVEL) progresso.nivel++;
      const zerou = primeiraVez && ctx.nivel === MAX_NIVEL;
      if(zerou) progresso.campanhaZerada = true;   // desbloqueia a loja de cartas avulsas
      salvarProgresso();
      _marcoPremio = premiarMarcoVitoria();
      t.textContent = zerou ? "👑 CAMPEÃO!" : "🏆 VITÓRIA!";
      t.classList.add("venceu");
      s.innerHTML = `Você derrotou <b>${info.nome}</b>!<br>`+
        `<span class="ganho">+${ganho} de ouro</span>${primeiraVez?' <span class="bonus">(bônus 1ª vez)</span>':''} · Saldo: <b>${progresso.pontos}</b>`+
        `<br><small>Use o ouro na <b>Loja</b> para comprar pacotes de cartas!</small>`+
        (zerou ? "<br>🎉 Você zerou a campanha — loja de cartas avulsas liberada!" : "");
    } else {
      Som.play("perderPartida");
      progresso.derrotas = (progresso.derrotas||0) + 1;
      progresso.pontos += 10;
      salvarProgresso();
      t.textContent = "☠ DERROTA";
      t.classList.add("perdeu");
      s.innerHTML = `<b>${info.nome}</b> foi forte demais...<br><span class="ganho">+10 de ouro</span> de consolação. Compre pacotes na loja!`;
    }
    botaoFim(acoes, "↺ Tentar de novo", "btn-grande", ()=>escolherTimeParaNivel(ctx.nivel));
    botaoFim(acoes, "🛒 Loja", "btn-sec", abrirLoja);
    botaoFim(acoes, "🗺️ Campanha", "btn-sec", abrirCampanha);
  } else {                     // BATALHA LIVRE (vitória ou derrota)
    Som.play(venceu ? "vencerPartida" : "perderPartida");
    if(venceu){
      t.textContent = "🏆 VOCÊ VENCEU!"; t.classList.add("venceu");
      let extra = "";
      if(ctx.modo === "meu"){
        progresso.pontos += 30;
        extra = ` <span class="ganho">+30 de ouro!</span>`;
        salvarProgresso();
      }
      s.innerHTML = `Você eliminou todas as cartas do oponente em ${estado.rodada} rodadas.${extra}`;
    } else {
      t.textContent = "☠ VOCÊ PERDEU"; t.classList.add("perdeu");
      s.textContent = `O oponente eliminou suas cartas em ${estado.rodada} rodadas.`;
    }
    botaoFim(acoes, "↺ Jogar de novo", "btn-grande", escolherBatalhaLivre);
    botaoFim(acoes, "Menu inicial", "btn-sec", irMenu);
  }

  // cronômetro circular → auto-avança
  const host = $("#fim-crono");
  host.innerHTML = htmlCrono(SEGUNDOS_TIMER);
  _fimTimer = animarCrono(host, SEGUNDOS_TIMER, ()=>{ limparTimers(); autoAvancar(); });

  mostrarMarcoNoFim(_marcoPremio);
}

// mostra o prêmio de marco de vitórias como uma CARTA DE INTERROGAÇÃO;
// o jogador clica para revelar o pacote e as cartas (pausa o auto-avanço)
function mostrarMarcoNoFim(premio){
  const host = $("#fim-marco");
  if(!premio){ if(host){ host.hidden = true; host.innerHTML = ""; } return; }
  clearInterval(_fimTimer); _fimTimer = null;   // deixa o jogador ver o prêmio sem pressa
  Som.play("premio");
  $("#fim-sub").innerHTML += `<br><span class="marco-vitoria">🎉 ${premio.marco} vitórias — um ${premio.pac.nome} apareceu!</span>`;
  host.hidden = false;
  host.innerHTML =
    `<div class="marco-carta" role="button" tabindex="0" title="Clique para revelar">
       <div class="marco-carta-face">?</div>
       <div class="marco-carta-lbl">Clique para abrir<br>${premio.pac.emoji} ${premio.pac.nome}</div>
     </div>`;
  const card = host.querySelector(".marco-carta");
  const revelar = ()=>{
    if(card.dataset.aberto) return;
    card.dataset.aberto = "1";
    host.hidden = true;
    mostrarAberturaPacote(premio.pac, premio.ganhos);
  };
  card.addEventListener("click", revelar);
  card.addEventListener("keydown", e=>{ if(e.key==="Enter"||e.key===" ") revelar(); });
}
function abrirCampanha(){ renderCampanha("normal"); }
function abrirCampanhaVida(){ renderCampanha("vida"); }
function renderCampanha(modo){
  const vida = modo === "vida";
  mostrarTela("tela-campanha");
  $("#camp-pontos").textContent = progresso.pontos;
  $("#camp-titulo").textContent = vida ? "❤️ Life Tournament" : "⚔️ Classic";
  $("#camp-desc").innerHTML = vida
    ? "<b>Life Tournament</b> — duelo por pontos de vida: o dano é a diferença do atributo. Compre mais vida na loja!"
    : "<b>Classic</b> — derrote os oponentes em ordem eliminando as cartas deles. Cada vitória rende ouro.";
  const lista = vida ? NIVEIS_VIDA : NIVEIS;
  const nivelAtual = vida ? progresso.nivelVida : progresso.nivel;
  const cont = $("#campanha-lista");
  cont.innerHTML = "";
  lista.forEach(info=>{
    const estadoNivel = info.n < nivelAtual ? "vencido"
                      : info.n === nivelAtual ? "atual" : "bloqueado";
    const el = document.createElement("button");
    el.className = "nivel-item " + estadoNivel;
    el.disabled = estadoNivel === "bloqueado";
    const tag = estadoNivel==="vencido" ? "✔ vencido"
              : estadoNivel==="atual" ? "▶ Desafiar" : "🔒 bloqueado";
    const bonus = info.n === nivelAtual ? (vida ? 60 : bonusPrimeiraVez()) : 0;
    const ouro = (vida ? ouroBaseNivelVida(info.n) : ouroBaseNivel(info.n)) + bonus;
    const infoExtra = vida
      ? `<small class="nivel-ouro">❤ ${vidaOponente(info.n)} vida · 💰 ${ouro}</small>`
      : `<small class="nivel-ouro">💰 ${ouro} de ouro${bonus?" (1ª vez)":""}</small>`;
    el.innerHTML =
      `<span class="nivel-num">${info.n}</span>`+
      `<span class="nivel-info"><b>${info.nome}</b>`+
      `<small>${info.raridades.join(" · ")}</small>${infoExtra}</span>`+
      `<span class="nivel-tag">${tag}</span>`;
    if(estadoNivel !== "bloqueado") el.onclick = ()=>escolherTimeParaNivel(info.n, modo);
    cont.appendChild(el);
  });
}

/* ===================================================================
   LOJA
   =================================================================== */
let msgTimer;
function flashLoja(txt, erro){
  const el = $("#loja-msg");
  el.textContent = txt;
  el.className = "show" + (erro ? " erro" : "");
  clearTimeout(msgTimer);
  msgTimer = setTimeout(()=>el.className = "", 1900);
}
function abrirLoja(){
  mostrarTela("tela-loja");
  $("#loja-busca").value = "";
  $("#loja-msg").className = "";
  atualizarLojaVida();
  if(typeof atualizarLojaSuper === "function") atualizarLojaSuper();
  renderPacotes();
  // loja de cartas avulsas só depois de zerar a campanha tradicional
  const desbloqueada = !!progresso.campanhaZerada;
  $("#loja-avulsa").hidden = !desbloqueada;
  $("#loja-avulsa-bloqueada").hidden = desbloqueada;
  if(desbloqueada) renderLoja("");
}

/* ---------- Pacotes (booster) ---------- */
function renderPacotes(){
  $("#loja-pontos").textContent = progresso.pontos;
  const cont = $("#pacotes-grid");
  cont.innerHTML = "";
  PACOTES.forEach(pac=>{
    const pode = progresso.pontos >= pac.preco;
    const el = document.createElement("button");
    el.className = "pacote-item" + (pode ? "" : " caro");
    el.style.setProperty("--pc", pac.cor);
    // top-2 raridades do pacote para o rótulo
    const topRar = Object.entries(pac.dist).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]).slice(0,3)
      .map(([r,v])=>`${r} ${v}%`).join(" · ");
    el.innerHTML =
      `<span class="pacote-emoji">${pac.emoji}</span>`+
      `<span class="pacote-nome">${pac.nome}</span>`+
      `<span class="pacote-chances">${topRar}</span>`+
      `<span class="pacote-preco">💰 ${pac.preco} · 2 cartas</span>`;
    el.onclick = ()=>abrirPacote(pac);
    cont.appendChild(el);
  });
}
function sortearRaridade(dist){
  const r = Math.random()*100;
  let acc = 0;
  for(const rar in dist){ acc += dist[rar]; if(r < acc) return rar; }
  // fallback: última raridade com chance > 0
  const comChance = Object.keys(dist).filter(k=>dist[k]>0);
  return comChance[comChance.length-1] || "Comum";
}
function abrirPacote(pac){
  if(progresso.pontos < pac.preco){
    Som.play("erro");
    flashLoja(`Ouro insuficiente para o ${pac.nome} — faltam ${pac.preco-progresso.pontos} pts`, true);
    return;
  }
  progresso.pontos -= pac.preco;
  const ganhos = [];
  for(let i=0;i<2;i++){
    let rar = sortearRaridade(pac.dist);
    let pool = POKEMONS.filter(p=>p.raridade===rar);
    if(!pool.length) pool = POKEMONS.filter(p=>p.raridade==="Comum");
    if(!pool.length) pool = POKEMONS;
    const p = pool[Math.floor(Math.random()*pool.length)];
    const jaTinha = progresso.owned.includes(p.id);
    progresso.owned.push(p.id);   // permite repetidas
    ganhos.push({id:p.id, repetida:jaTinha});
  }
  salvarProgresso();
  Som.play("comprar");
  mostrarAberturaPacote(pac, ganhos);
}
function mostrarAberturaPacote(pac, ganhos){
  const grid = $("#pacote-cartas");
  grid.innerHTML = "";
  ganhos.forEach(g=>{
    const p = cartaPorId(g.id);
    const el = document.createElement("div");
    el.className = "pacote-carta-rev";
    el.innerHTML = htmlCarta(p, {}) +
      (g.repetida ? `<div class="pacote-badge rep">repetida · vale ${precoVenda(p)} pts</div>`
                  : `<div class="pacote-badge nova">✨ NOVA!</div>`);
    grid.appendChild(el);
  });
  $("#pacote-titulo").textContent = `${pac.emoji} ${pac.nome}`;
  confetePacote();
  $("#modal-pacote").hidden = false;
}
function fecharPacote(){
  $("#modal-pacote").hidden = true;
  atualizarLojaVida();
  renderPacotes();
  if(progresso.campanhaZerada) renderLoja($("#loja-busca").value);
}
function confetePacote(){
  const c = $("#pacote-confete");
  if(!c) return;
  c.innerHTML = "";
  const cores = ["#ffcb05","#2a75bb","#e3350d","#3bb54a","#23c6d6","#f48fb1"];
  for(let i=0;i<40;i++){
    const d = document.createElement("i");
    d.style.left = (Math.random()*100)+"%";
    d.style.background = cores[i%cores.length];
    d.style.animationDelay = (Math.random()*0.5)+"s";
    d.style.animationDuration = (1.4+Math.random()*1.2)+"s";
    c.appendChild(d);
  }
  setTimeout(()=>{ c.innerHTML = ""; }, 3200);
}
// Prêmios por marcos de vitórias (pacote grátis ao atingir a marca)
const PREMIOS_VITORIA = {5:"comum", 15:"incomum", 50:"raro", 100:"raro", 150:"lendario", 500:"lendario", 1000:"mitico"};
// chamado ao vencer (após incrementar vitorias); devolve descrição do prêmio ou null
function premiarMarcoVitoria(){
  const packId = PREMIOS_VITORIA[progresso.vitorias];
  if(!packId) return null;
  const pac = PACOTES.find(p=>p.id===packId);
  if(!pac) return null;
  const ganhos = [];
  for(let i=0;i<2;i++){
    let rar = sortearRaridade(pac.dist);
    let pool = POKEMONS.filter(p=>p.raridade===rar);
    if(!pool.length) pool = POKEMONS.filter(p=>p.raridade==="Comum");
    if(!pool.length) pool = POKEMONS;
    const p = pool[Math.floor(Math.random()*pool.length)];
    const jaTinha = progresso.owned.includes(p.id);
    progresso.owned.push(p.id);
    ganhos.push({id:p.id, repetida:jaTinha});
  }
  salvarProgresso();
  return {pac, ganhos, marco: progresso.vitorias};
}

function atualizarLojaVida(){
  $("#loja-vidamax").textContent = progresso.vidaMax;
  $("#loja-vida-custo").textContent = custoVida();
}
function comprarVida(){
  const custo = custoVida();
  if(progresso.pontos < custo){
    Som.play("erro");
    flashLoja(`Ouro insuficiente para +${VIDA_INCREMENTO} de vida — faltam ${custo - progresso.pontos} pts`, true);
    return;
  }
  progresso.pontos -= custo;
  progresso.vidaMax += VIDA_INCREMENTO;
  salvarProgresso();
  Som.play("comprar");
  atualizarLojaVida();
  $("#loja-pontos").textContent = progresso.pontos;
  flashLoja(`❤️ Vida máxima agora é ${progresso.vidaMax}! (-${custo} pts)`);
}
let _filtroLoja = "todos";
function renderLoja(filtro){
  $("#loja-pontos").textContent = progresso.pontos;
  const f = (filtro||"").toLowerCase().trim();
  const grid = $("#loja-grid");
  const lista = POKEMONS
    .filter(p=> !f || p.nome.toLowerCase().includes(f))
    .filter(p=>{
      if(_filtroLoja === "adquiridos") return progresso.owned.includes(p.id);
      if(_filtroLoja === "faltam")     return !progresso.owned.includes(p.id);
      return true;
    })
    .sort((a,b)=> (precoCarta(a)-precoCarta(b)) || a.id-b.id);
  grid.innerHTML = "";
  lista.forEach(p=>{
    const dono  = progresso.owned.includes(p.id);
    const lendario = ehLendario(p);
    const wrap = document.createElement("div");

    // Lendários/Míticos: mistério "?" — não vendidos (só em batalha)
    if(lendario && !dono){
      wrap.className = "loja-item misterio";
      wrap.innerHTML = htmlCartaMisterio() + `<div class="loja-badge misterio">🔒 Só em pacotes</div>`;
      wrap.onclick = ()=>{ Som.play("erro"); flashLoja("🔒 Lendários e Míticos só saem nos pacotes (Raro, Lendário e Mitológico)!", true); };
      grid.appendChild(wrap);
      return;
    }

    const preco = precoCarta(p);
    const podeComprar = !dono && progresso.pontos >= preco;
    wrap.className = "loja-item " + (dono ? "tem" : (podeComprar ? "compravel" : "caro"));
    wrap.innerHTML = htmlCarta(p, {}) + (dono
      ? `<div class="loja-badge tem">✔ NA COLEÇÃO</div>`
      : `<div class="loja-badge preco">💰 ${preco} pts</div>`);
    if(!dono) wrap.onclick = ()=>comprarCarta(p.id);
    grid.appendChild(wrap);
  });
  if(!lista.length)
    grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;opacity:.7">Nenhum Pokémon encontrado.</p>`;
}
function comprarCarta(id){
  if(progresso.owned.includes(id)) return;
  const p = cartaPorId(id), preco = precoCarta(p);
  if(progresso.pontos < preco){
    Som.play("erro");
    flashLoja(`Pontos insuficientes para ${p.nome} — faltam ${preco-progresso.pontos} pts`, true);
    return;
  }
  progresso.pontos -= preco;
  progresso.owned.push(id);
  salvarProgresso();
  Som.play("comprar");
  renderLoja($("#loja-busca").value);
  flashLoja(`✔ Você comprou ${p.nome}! (-${preco} pts)`);
}

/* ===================================================================
   COLEÇÃO (só as cartas que o jogador possui)
   =================================================================== */
function abrirColecao(){
  mostrarTela("tela-colecao");
  $("#col-busca").value = "";
  renderColecao("");
}
function renderColecao(filtro){
  const f = (filtro||"").toLowerCase().trim();
  const grid = $("#col-grid");
  $("#col-contagem").textContent = totalDistintas();
  const fav = progresso.timeFavorito || [];
  $("#fav-contagem").textContent = fav.length;
  const lista = cartasPossuidas()
    .filter(p=> !f || p.nome.toLowerCase().includes(f))
    .sort((a,b)=> a.id-b.id);
  grid.innerHTML = "";
  if(!lista.length){
    grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;opacity:.8">Nenhuma carta ainda. Vença batalhas e compre na loja! 🛒</p>`;
    return;
  }
  lista.forEach(p=>{
    const naEquipe = fav.includes(p.id);
    const qtd = qtdDe(p.id);
    const el = document.createElement("div");
    el.className = "col-item" + (naEquipe ? " favorito" : "");
    el.dataset.id = p.id;
    el.innerHTML = htmlCarta(p, {}) +
      `<div class="fav-badge">${naEquipe ? "⭐ no time" : "☆ favoritar"}</div>`+
      `<button class="btn-ver" title="Ver melhor">🔍</button>`+
      (qtd > 1 ? `<div class="qtd-badge">x${qtd}</div>` : "")+
      `<button class="btn-vender" title="Vender por ${precoVenda(p)} pts">💰 ${precoVenda(p)}</button>`;
    el.querySelector(".btn-ver").onclick = (e)=>{ e.stopPropagation(); verCarta(p.id); };
    el.querySelector(".btn-vender").onclick = (e)=>{ e.stopPropagation(); venderCarta(p.id); };
    el.onclick = ()=>toggleFavorito(p.id, el);
    grid.appendChild(el);
  });
}
// Vende UMA cópia da carta por metade do preço da raridade
function venderCarta(id){
  const idx = progresso.owned.indexOf(id);
  if(idx < 0) return;
  if(progresso.owned.length <= 1){
    Som.play("erro");
    flashColecao("Você não pode vender sua última carta!");
    return;
  }
  const p = cartaPorId(id);
  const valor = precoVenda(p);
  progresso.owned.splice(idx, 1);
  progresso.pontos += valor;
  // se era a última cópia, tira do time favorito
  if(!progresso.owned.includes(id)){
    const fi = (progresso.timeFavorito||[]).indexOf(id);
    if(fi >= 0) progresso.timeFavorito.splice(fi, 1);
  }
  salvarProgresso();
  Som.play("comprar");
  renderColecao($("#col-busca").value);
  flashColecao(`💰 Vendeu ${p.nome} por ${valor} pts (saldo: ${progresso.pontos})`);
}
// Gera uma descrição a partir dos atributos (sem texto de Pokédex)
function descricaoCarta(p){
  const nomes = {vida:"Vida",forca:"Força",ataque:"Ataque",defesa:"Defesa",agilidade:"Agilidade",inteligencia:"Inteligência"};
  const ord = ATRIBUTOS.map(a=>({k:a.chave, v:p[a.chave]})).sort((a,b)=>b.v-a.v);
  const fortes = ord.slice(0,2).map(x=>nomes[x.k]).join(" e ");
  const fraco = nomes[ord[ord.length-1].k];
  const tipos = [p.tipo1, p.tipo2].filter(Boolean).join(" / ");
  const total = ATRIBUTOS.reduce((s,a)=>s+p[a.chave],0);
  let porte = total > 500 ? "um Pokémon lendário e poderosíssimo" :
              total > 420 ? "um Pokémon muito forte" :
              total > 320 ? "um Pokémon equilibrado" : "um Pokémon iniciante";
  return `<b>${p.nome}</b> é ${porte} do tipo <b>${tipos}</b> (${p.raridade}, Estágio ${p.estagio}).<br><br>`+
         `Destaca-se em <b>${fortes}</b>, mas é mais fraco em <b>${fraco}</b>.<br>`+
         `Poder total dos atributos: <b>${total}</b>.`;
}
function verCarta(id){
  const p = cartaPorId(id);
  $("#modal-carta-frente").innerHTML = htmlCarta(p, {});
  $("#modal-carta-desc").innerHTML = descricaoCarta(p);
  $("#modal-carta").hidden = false;
  Som.play("select");
}
function toggleFavorito(id, el){
  const fav = progresso.timeFavorito;
  const idx = fav.indexOf(id);
  if(idx >= 0){ fav.splice(idx,1); }
  else {
    if(fav.length >= 5){ Som.play("erro"); flashColecao("O time favorito já tem 5 cartas!"); return; }
    fav.push(id);
  }
  salvarProgresso();
  Som.play("select");
  const naEquipe = fav.includes(id);
  el.classList.toggle("favorito", naEquipe);
  el.querySelector(".fav-badge").textContent = naEquipe ? "⭐ no time" : "☆ favoritar";
  const carta = el.querySelector(".carta");
  if(carta){ carta.classList.remove("girar"); void carta.offsetWidth; carta.classList.add("girar"); }
  $("#fav-contagem").textContent = fav.length;
}
let _colMsgTimer;
function flashColecao(txt){
  const el = $("#col-msg");
  if(!el) return;
  el.textContent = txt; el.classList.add("show");
  clearTimeout(_colMsgTimer);
  _colMsgTimer = setTimeout(()=>el.classList.remove("show"), 1800);
}

/* ===================================================================
   ESCOLHA INICIAL — 3 Pokémon de uma lista de 10 comuns
   =================================================================== */
let _iniOpcoes = [];
const _iniSelec = new Set();
function abrirEscolhaInicial(){
  _iniSelec.clear();
  const comuns = POKEMONS.filter(p => p.raridade === "Comum");
  _iniOpcoes = embaralhar(comuns).slice(0, 10);
  mostrarTela("tela-inicial");
  renderInicial();
}
function renderInicial(){
  const grid = $("#ini-grid");
  grid.innerHTML = "";
  _iniOpcoes.forEach(p=>{
    const sel = _iniSelec.has(p.id);
    const el = document.createElement("div");
    el.className = "sel-item" + (sel ? " sel" : "");
    el.dataset.id = p.id;
    el.innerHTML = htmlCarta(p, {}) + (sel ? '<div class="sel-check">✔</div>' : "");
    el.onclick = ()=>toggleInicial(p.id, el);
    grid.appendChild(el);
  });
  $("#ini-contagem").textContent = _iniSelec.size;
  $("#btn-ini-confirmar").disabled = _iniSelec.size !== 3;
}
function toggleInicial(id, el){
  if(_iniSelec.has(id)){ _iniSelec.delete(id); }
  else { if(_iniSelec.size >= 3){ Som.play("erro"); return; } _iniSelec.add(id); }
  Som.play("select");
  const sel = _iniSelec.has(id);
  el.classList.toggle("sel", sel);
  let chk = el.querySelector(".sel-check");
  if(sel && !chk){ chk = document.createElement("div"); chk.className = "sel-check"; chk.textContent = "✔"; el.appendChild(chk); }
  else if(!sel && chk){ chk.remove(); }
  const carta = el.querySelector(".carta");
  if(carta){ carta.classList.remove("girar"); void carta.offsetWidth; carta.classList.add("girar"); }
  $("#ini-contagem").textContent = _iniSelec.size;
  $("#btn-ini-confirmar").disabled = _iniSelec.size !== 3;
}
function confirmarInicial(){
  if(_iniSelec.size !== 3) return;
  progresso.owned = [..._iniSelec];
  salvarProgresso();
  Som.play("comprar");
  irMenu();
}
// escolhe entre menu ou tela inicial (se ainda não tem cartas)
function iniciarApp(){
  atualizarMenu();
  if(!progresso.owned || progresso.owned.length === 0) abrirEscolhaInicial();
  else irMenu();
}

/* ---------- Abertura: intro -> como funciona -> menu ---------- */
let _introTimer = null, _introPassou = false, _comoDoInicio = true;
function abrirIntro(){
  atualizarMenu();
  _introPassou = false;
  mostrarTela("tela-intro");
  const seguir = ()=>{
    if(_introPassou) return;
    _introPassou = true;
    clearTimeout(_introTimer);
    abrirComoJogar(true);
  };
  clearTimeout(_introTimer);
  _introTimer = setTimeout(seguir, 3400);      // avança sozinha
  const sec = $("#tela-intro");
  if(sec) sec.onclick = seguir;                 // ou toque para pular
}
function abrirComoJogar(doInicio){
  _comoDoInicio = !!doInicio;
  mostrarTela("tela-como");
  const box = $("#tela-como"); if(box) box.scrollTop = 0;
}
function fecharComoJogar(){
  if(_comoDoInicio) iniciarApp();   // primeira abertura: vai p/ escolha inicial ou menu
  else irMenu();                    // aberto pelo menu: volta ao menu
}

/* ===================================================================
   MENU
   =================================================================== */
function atualizarMenu(){
  $("#chip-nivel").textContent  = progresso.nivel > MAX_NIVEL ? "MAX" : progresso.nivel;
  $("#chip-pontos").textContent = progresso.pontos;
  $("#chip-cartas").textContent = totalDistintas();
  $("#menu-avatar").textContent = progresso.foto || "🧑";
  $("#menu-nome").textContent   = progresso.nome || "Treinador";
}
function irMenu(){ mostrarTela("tela-menu"); atualizarMenu(); }

function resetProgresso(){
  if(!confirm("Reiniciar todo o progresso? Você vai escolher 3 novos Pokémon e volta a 0 de ouro.")) return;
  progresso = progressoPadrao();
  salvarProgresso();
  iniciarApp();   // owned vazio -> escolha inicial
}

/* ===================================================================
   CONFIGURAÇÕES (perfil / foto / som)
   =================================================================== */
const AVATARES = ["🧑","👦","👧","🧔","👩","🧙","🥷","👨‍🚀","🧑‍🎤","👸","🤠","🧑‍🔬","🦸","🦹","🧑‍🚀","👮","🧝","🧛"];
function abrirConfig(){
  mostrarTela("tela-config");
  $("#config-nome").value = progresso.nome || "Treinador";
  $("#config-avatar-preview").textContent = progresso.foto || "🧑";
  const grid = $("#config-avatares");
  grid.innerHTML = "";
  AVATARES.forEach(a=>{
    const el = document.createElement("button");
    el.className = "avatar-op" + (a === progresso.foto ? " sel" : "");
    el.textContent = a;
    el.onclick = ()=>{
      $("#config-avatares").querySelectorAll(".avatar-op").forEach(x=>x.classList.remove("sel"));
      el.classList.add("sel");
      $("#config-avatar-preview").textContent = a;
      el.dataset.escolhido = "1";
      _fotoEscolhida = a;
      Som.play("select");
    };
    grid.appendChild(el);
  });
  _fotoEscolhida = progresso.foto || "🧑";
  atualizarSomUI();
}
let _fotoEscolhida = "🧑";
function salvarConfig(){
  const nome = ($("#config-nome").value || "").trim() || "Treinador";
  progresso.nome = nome.slice(0,16);
  progresso.foto = _fotoEscolhida || "🧑";
  salvarProgresso();
  Som.play("comprar");
  irMenu();
}

/* ---------- Regras ---------- */
function abrirRegras(){ $("#modal-regras").hidden = false; }
function fecharRegras(){ $("#modal-regras").hidden = true; }

/* ---------- Som (mudo) ---------- */
function atualizarSomUI(){
  const on = !Som.estaMudo();
  document.querySelectorAll(".js-som").forEach(b=>{
    b.textContent = on ? "🔊" : "🔇";
    b.title = on ? "Som ligado" : "Som desligado";
  });
}

/* ---------- Ligações de UI ---------- */
document.addEventListener("DOMContentLoaded", ()=>{
  abrirIntro();   // intro -> como funciona -> menu (ou escolha inicial)
  $("#btn-como-ok").addEventListener("click", fecharComoJogar);
  $("#btn-como-jogar").addEventListener("click", ()=>abrirComoJogar(false));

  // Som: desbloqueia áudio no 1º gesto, clique geral nos botões, e botões de mudo
  document.addEventListener("pointerdown", ()=>Som.ensure(), {once:true});
  document.addEventListener("click", e=>{ if(e.target.closest(".btn:not(.js-som)")) Som.play("click"); });
  document.querySelectorAll(".js-som").forEach(b=>b.addEventListener("click", ()=>{
    Som.toggleMudo();
    atualizarSomUI();
  }));
  atualizarSomUI();
  $("#btn-campanha").addEventListener("click", abrirCampanha);
  $("#btn-campanha-vida").addEventListener("click", abrirCampanhaVida);
  $("#btn-loja").addEventListener("click", abrirLoja);
  $("#btn-colecao").addEventListener("click", abrirColecao);
  $("#btn-livre").addEventListener("click", escolherBatalhaLivre);
  $("#btn-comprar-vida").addEventListener("click", comprarVida);
  $("#btn-reset").addEventListener("click", resetProgresso);

  // modal de batalha livre (2 modos)
  $("#btn-livre-meu").addEventListener("click", ()=>batalhaLivre("meu"));
  $("#btn-livre-qualquer").addEventListener("click", ()=>batalhaLivre("qualquer"));
  $("#btn-livre-cancelar").addEventListener("click", ()=>{ $("#modal-livre").hidden = true; });
  $("#modal-livre").addEventListener("click", e=>{ if(e.target.id === "modal-livre") $("#modal-livre").hidden = true; });

  $("#btn-camp-voltar").addEventListener("click", irMenu);
  $("#btn-loja-voltar").addEventListener("click", irMenu);
  $("#btn-col-voltar").addEventListener("click", irMenu);

  // configurações
  $("#btn-config").addEventListener("click", abrirConfig);
  $("#menu-avatar").addEventListener("click", abrirConfig);   // clicar na foto abre troca
  $("#btn-config-voltar").addEventListener("click", irMenu);
  $("#btn-config-salvar").addEventListener("click", salvarConfig);
  $("#btn-config-reset").addEventListener("click", resetProgresso);

  // filtro da loja
  document.querySelectorAll(".filtro-btn").forEach(b=>b.addEventListener("click", ()=>{
    document.querySelectorAll(".filtro-btn").forEach(x=>x.classList.remove("ativo"));
    b.classList.add("ativo");
    _filtroLoja = b.dataset.filtro;
    renderLoja($("#loja-busca").value);
  }));

  // modal de abertura de pacote
  $("#btn-pacote-fechar").addEventListener("click", fecharPacote);
  $("#modal-pacote").addEventListener("click", e=>{ if(e.target.id === "modal-pacote") fecharPacote(); });

  // modal detalhe da carta
  $("#btn-carta-fechar").addEventListener("click", ()=>{ $("#modal-carta").hidden = true; });
  $("#modal-carta").addEventListener("click", e=>{ if(e.target.id === "modal-carta") $("#modal-carta").hidden = true; });

  // escolha inicial de 3 Pokémon
  $("#btn-ini-confirmar").addEventListener("click", confirmarInicial);

  // seleção de time
  $("#btn-sel-confirmar").addEventListener("click", confirmarSelecao);
  $("#btn-sel-voltar").addEventListener("click", ()=> _pendingModo==="vida" ? abrirCampanhaVida() : abrirCampanha());

  // regras
  $("#btn-regras").addEventListener("click", abrirRegras);
  $("#btn-regras-fechar").addEventListener("click", fecharRegras);
  $("#modal-regras").addEventListener("click", e=>{ if(e.target.id === "modal-regras") fecharRegras(); });

  $("#loja-busca").addEventListener("input", e=>renderLoja(e.target.value));
  $("#col-busca").addEventListener("input", e=>renderColecao(e.target.value));

  // Sair: encerra a batalha IMEDIATAMENTE (sem confirmação)
  $("#btn-sair").addEventListener("click", ()=>{
    limparTimers();
    estado.abortado = true; estado.travado = true;   // encerra o duelo imediatamente
    const ctx = estado.contexto || {};
    if(ctx.tipo === "campanha-vida") abrirCampanhaVida();
    else if(ctx.tipo === "campanha") abrirCampanha();
    else irMenu();
  });
});
