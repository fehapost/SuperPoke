/* ===== Efeitos sonoros — sintetizados na hora (Web Audio API, sem arquivos) ===== */
"use strict";
const Som = (function(){
  let ctx = null;
  let mudo = localStorage.getItem("superpoke_mudo") === "1";

  function ensure(){
    if(!ctx){
      try{ ctx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch(e){ ctx = null; }
    }
    if(ctx && ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  // Uma nota com envelope suave. f2 = glide de frequência (opcional).
  function nota(freq, inicio, dur, opt){
    opt = opt || {};
    const type = opt.type || "sine";
    const gain = opt.gain != null ? opt.gain : 0.16;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, inicio);
    if(opt.f2) osc.frequency.exponentialRampToValueAtTime(Math.max(1, opt.f2), inicio + dur);
    g.gain.setValueAtTime(0.0001, inicio);
    g.gain.exponentialRampToValueAtTime(gain, inicio + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, inicio + dur);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(inicio); osc.stop(inicio + dur + 0.03);
  }

  // Estouro de ruído (para "coin"/impacto).
  function ruido(inicio, dur, gain){
    const n = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for(let i=0;i<n;i++) d[i] = (Math.random()*2 - 1) * (1 - i/n);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain || 0.12, inicio);
    g.gain.exponentialRampToValueAtTime(0.0001, inicio + dur);
    src.connect(g); g.connect(ctx.destination);
    src.start(inicio); src.stop(inicio + dur);
  }

  const efeitos = {
    click(t){ nota(680, t, 0.05, {type:"square", gain:0.06}); },
    hover(t){ nota(600, t, 0.03, {type:"sine", gain:0.04}); },
    select(t){ nota(560, t, 0.06, {type:"triangle", gain:0.12});
               nota(840, t+0.05, 0.08, {type:"triangle", gain:0.12}); },
    atributo(t){ nota(480, t, 0.05, {type:"square", gain:0.08, f2:760}); },
    comprar(t){ nota(988, t, 0.08, {type:"square", gain:0.13});
                nota(1319, t+0.075, 0.16, {type:"square", gain:0.13}); },
    erro(t){ nota(200, t, 0.14, {type:"sawtooth", gain:0.12});
             nota(150, t+0.12, 0.16, {type:"sawtooth", gain:0.12}); },
    vencerRodada(t){ nota(659, t, 0.08, {type:"triangle", gain:0.16});
                     nota(988, t+0.075, 0.14, {type:"triangle", gain:0.16}); },
    perderRodada(t){ nota(320, t, 0.16, {type:"sawtooth", gain:0.13, f2:150});
                     ruido(t, 0.08, 0.06); },
    empate(t){ nota(440, t, 0.1, {type:"sine", gain:0.1});
               nota(440, t+0.11, 0.1, {type:"sine", gain:0.08}); },
    premio(t){ [1319,1568,2093].forEach((f,i)=> nota(f, t+i*0.06, 0.13, {type:"triangle", gain:0.12})); },
    vencerPartida(t){
      [[523,0],[659,0.11],[784,0.22],[1047,0.34]].forEach(([f,dt])=>
        nota(f, t+dt, 0.16, {type:"square", gain:0.13}));
      [523,659,784,1047].forEach(f=> nota(f, t+0.5, 0.55, {type:"triangle", gain:0.09}));
    },
    perderPartida(t){
      [[440,0],[349,0.16],[262,0.34]].forEach(([f,dt])=>
        nota(f, t+dt, 0.32, {type:"sawtooth", gain:0.11, f2:f*0.9}));
    },
    abrir(t){ nota(500, t, 0.08, {type:"sine", gain:0.06, f2:760}); },
  };

  function play(nome){
    if(mudo) return;
    const c = ensure();
    if(!c || !efeitos[nome]) return;
    try{ efeitos[nome](c.currentTime + 0.01); }catch(e){}
  }
  function toggleMudo(){
    mudo = !mudo;
    localStorage.setItem("superpoke_mudo", mudo ? "1" : "0");
    if(!mudo){ ensure(); play("click"); }
    return mudo;
  }
  return { play, toggleMudo, ensure, estaMudo:()=>mudo };
})();
