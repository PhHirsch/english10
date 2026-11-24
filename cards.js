/* Trading cards: jede Karte gehört fest zu einem Spiel – kein Zufall.
   Bekommen: mindestens 1 Stern · Gold: 3 Sterne · 👑: ohne Fehler (Flawless) · 🔥: Hard mode geschafft */
/* Noch nicht freigegebene Spiele (Lobby + Album blenden sie aus). Zum Freischalten die id hier löschen. */
window.LOCKED = ["passive", "final-u2"];
window.CROMOS = [
  { id: "if-museum", f: "🤖", n: "ARGUS", c: "#2a1f3a", t: "The security computer of the City History Museum. If you speak perfect English, he will open every door.", de: "aus Night at the Museum" },
  { id: "if-island", f: "🧑🏽", n: "Sam", c: "#0b4a58", t: "Your friend from the sailing course. If he had a boat, he would sail home – but he's got a mirror!", de: "aus Stranded" },
  { id: "passive", f: "👩🏽‍💼", n: "Priya", c: "#3a1e0a", t: "Manager at SpiceRoute Logistics in Mumbai. Her tea is shipped all over the world – if it isn't stolen first.", de: "aus Operation Chai" },
  { id: "final-u2", f: "⛈️", n: "The Monsoon", c: "#1a2a4a", t: "Every summer it brings the rain to India. Now it rains grammar – but you are ready!", de: "Endgegner Unit 2" },
  { id: "tele-1", f: "👧🏻", n: "Maya", c: "#2a5a5a", t: "16, from Toronto. In her great-grandmother's attic she found half a compass and a map of three oceans.", de: "aus der Serie The Map of Three Oceans" },
  { id: "tele-2", f: "🍱", n: "The Dabbawala", c: "#6a4a1a", t: "He delivers 200 lunch boxes a day in Mumbai and never makes a mistake. Or does he?", de: "aus der Serie, Folge 2" },
  { id: "verbrush", f: "🕹️", n: "Verb Rush", c: "#3a0a6a", t: "An arcade machine from 1985. Go – went – gone … or GAME OVER!", de: "Arcade" },
  { id: "adv-24", f: "🎅", n: "Father Christmas", c: "#0f3a2a", t: "In Britain he comes down the chimney on Christmas Eve. Don't forget the mince pie!", de: "Adventskalender, Türchen 24" }
];
/* Vokabel-Bosse bekommen automatisch eine Karte */
(function () {
  const E = { tornado: "🌪️", robot: "🤖", ghost: "👻", bossy: "😠", slime: "🟢", manager: "💼", locker: "🗄️" };
  Object.values(window.VOCAB || {}).forEach(u => u.sections.forEach(s => window.CROMOS.splice(window.CROMOS.length - 3, 0, { id: s.id, f: E[s.boss] || "👾", n: s.bossName, c: "#4a1a5a", t: "Vocabulary boss: " + s.title + ". Beaten – the words are yours!", de: "Vokabel-Boss " + (s.part || "") })));
})();
window.CROMOS = window.CROMOS.filter(c => window.LOCKED.indexOf(c.id) < 0);
window.cromoState = function (s, id) {
  const st = (s && s.stars) || {}, pf = (s && s.perfect) || [];
  return { got: (st[id] || 0) > 0, gold: (st[id] || 0) >= 3, crown: pf.indexOf(id) >= 0, hard: (st[id + "-hard"] || 0) > 0 };
};
window.cromoCard = function (c, s, big) {
  const k = cromoState(s, c.id), w = big ? 170 : 120;
  if (!k.got) return `<div class="cromo off" style="width:${w}px"><div class="cf">❓</div><div class="cn">???</div><div class="ct">${c.de}</div></div>`;
  return `<div class="cromo ${k.gold ? "gold" : ""}" style="width:${w}px;--c:${c.c}"><div class="cb">${k.crown ? "👑" : ""}${k.hard ? "🔥" : ""}</div><div class="cf">${c.f}</div><div class="cn">${c.n}</div><div class="ct">${c.t}</div></div>`;
};
window.CROMO_CSS = `.cromo{position:relative;flex:none;border-radius:12px;padding:10px 8px 8px;text-align:center;background:linear-gradient(160deg,var(--c,#333),#111);border:3px solid #ffffff33;box-shadow:0 6px 16px #0008;color:#fff}
  .cromo.gold{border-color:#ffd23a;background:linear-gradient(160deg,#ffd23a,var(--c,#333) 45%,#111);box-shadow:0 0 18px #ffd23a88,0 6px 16px #0008}
  .cromo.gold:before{content:"";position:absolute;inset:0;border-radius:9px;background:linear-gradient(120deg,transparent 30%,#ffffff44 45%,transparent 60%);background-size:250% 100%;animation:shine 2.6s linear infinite}
  @keyframes shine{from{background-position:150% 0}to{background-position:-100% 0}}
  .cromo.off{background:#1a1a22;border-style:dashed;color:#888}
  .cromo .cf{font-size:44px;line-height:1.2}
  .cromo .cn{font-weight:800;font-size:14px;margin-top:2px}
  .cromo .ct{font-size:11.5px;line-height:1.3;opacity:.85;margin-top:4px}
  .cromo .cb{position:absolute;top:4px;right:6px;font-size:15px}`;
