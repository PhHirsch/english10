/* IFK – gemeinsamer Spiel-Motor für die If-clause-Spiele (english10).
   Aufgabentypen: quiz, choose, dial, type, order, sort, spot. */
window.IFK = function (cfg) {
  const $ = id => document.getElementById(id);
  const KEY = cfg.key;
  let S = null;

  /* ---------- Hilfen ---------- */
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function esc(s) { return String(s).replace(/[<>&"]/g, ""); }
  function save() { try { sessionStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } }
  function load() { try { const x = JSON.parse(sessionStorage.getItem(KEY)); if (x && x.name) S = x; } catch (e) { } }
  function me() { const s = window.E8 && E8.getSession(); return s ? s.nr : null; }
  function count(st) { return st.type === "spot" ? 1 : st.items.length; }
  function norm(s) {
    s = " " + String(s).toLowerCase().replace(/[’‘`´]/g, "'").replace(/[.!?,]/g, " ").replace(/\s+/g, " ").trim() + " ";
    s = s.replace(/ won't /g, " will not ").replace(/ can't /g, " cannot ").replace(/(\w)n't /g, "$1 not ")
         .replace(/(\w)'d /g, "$1 would ").replace(/ 'd /g, " would ").replace(/(\w)'ll /g, "$1 will ").replace(/ 'll /g, " will ");
    return s.replace(/\s+/g, " ").trim();
  }
  function alts(a) { return String(a).split("|"); }
  function isRight(a, v) { return alts(a).some(x => norm(x) === norm(v)); }
  function hint(right, val, ty) {
    const r = norm(alts(right)[0]), v = norm(val);
    if (!v) return "Please write something. <span class='de'>Bitte etwas eintragen.</span>";
    const rMain = /^(will|would)\b/.test(r), vWill = /\bwill\b/.test(v), vWould = /\bwould\b/.test(v);
    if (!rMain) {
      if (vWill || vWould) return "No <b>will / would</b> in the if-clause! <span class='de'>Im if-Satz steht nie will oder would.</span>";
      if (ty === 2) return "Unreal situation (type II): if-clause → <b>simple past</b> (had, knew, were, didn't …). <span class='de'>Unwirklich: if-Satz im simple past.</span>";
      if (r.split(" ")[0] === v.split(" ")[0] && r.split(" ").length === v.split(" ").length) return "Check the spelling. <span class='de'>Prüfe die Rechtschreibung.</span>";
      return "Possible situation (type I): if-clause → <b>simple present</b> (he/she/it → -s · don't / doesn't). <span class='de'>Möglich: if-Satz im simple present.</span>";
    }
    if (r.startsWith("will") && vWould) return "This is possible / real → <b>will</b> (type I), not would. <span class='de'>Mögliche Situation → will.</span>";
    if (r.startsWith("would") && vWill) return "This is unreal → <b>would</b> (type II), not will. <span class='de'>Unwirkliche Situation → would.</span>";
    if (r.split(" ")[0] === v.split(" ")[0] && r.split(" ").length === v.split(" ").length) return "Check the spelling of the verb and the word <b>not</b>. <span class='de'>Prüfe Rechtschreibung und Verneinung.</span>";
    if (r.startsWith("will")) return "Main clause (type I): <b>will / won't + verb</b>. <span class='de'>Hauptsatz: will + Grundform.</span>";
    return "Main clause (type II): <b>would / wouldn't + verb</b>. <span class='de'>Hauptsatz: would + Grundform.</span>";
  }
  function fb(m, g) { const f = $("fb"); if (f) { f.className = "feedback " + (g ? "good" : "bad"); f.innerHTML = m; } }
  function shake(el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }

  function mistake() { S.mistakes++; S.err = true; if (cfg.onMistake) cfg.onMistake(S); save(); hud(); }

  /* ---------- HUD ---------- */
  function hud() {
    const h = $("hdr");
    h.style.display = S && S.st >= 0 ? "block" : "none";
    if (!S || S.st < 0) return;
    h.innerHTML = `<div class="hin"><span class="meav">${E8.myAvatar()}</span><div class="res">${cfg.hud(S)}</div>
      <div class="steps">${cfg.stages.map((st, i) => `<span class="${i < S.st || S.done ? "done" : i === S.st ? "now" : ""}">${st.icon}</span>`).join("")}</div>
      <button class="hbtn" id="rulesBtn">📘 Rules</button></div>`;
    $("rulesBtn").onclick = showRules;
  }
  function closeOv() { $("ov").classList.remove("show"); }
  function showRules() {
    const lvl = S ? S.rl : 0;
    $("ovc").innerHTML = (lvl ? cfg.rules(lvl) : `<h2>📘 Rules</h2><p>You will discover the rules yourself in a moment! <span class="de">Die Regeln findest du gleich selbst heraus.</span></p>`) + `<button class="btn primary" id="okRules">Got it!</button>`;
    $("ov").classList.add("show");
    $("okRules").onclick = closeOv;
  }

  /* ---------- Ablauf ---------- */
  function newState(name) {
    const s = { name: name, nr: me(), st: 0, q: [], err: false, rep: [], mistakes: 0, start: Date.now(), end: 0, done: false, rl: 0, doneIn: 0, intro: true, total: cfg.stages.reduce((a, st) => a + count(st), 0) };
    Object.assign(s, cfg.init ? cfg.init() : {});
    return s;
  }
  function startStage() { const st = cfg.stages[S.st]; S.q = st.type === "spot" ? [0] : st.items.map((_, i) => i); S.err = false; S.doneIn = 0; S.intro = false; save(); }
  function render() {
    hud();
    if (!S || S.st < 0) return startScreen();
    if (S.done) return finish();
    if (S.intro) startStage();
    const st = cfg.stages[S.st], n = count(st);
    const read = st.read ? `<div class="read">${st.read}</div>` : "";
    const code = st.digits ? `<div class="code">${st.digits.split("").map((d, i) => `<span>${i < S.doneIn ? d : "?"}</span>`).join("")}</div>` : "";
    $("app").innerHTML = `<div class="panel">
      <span class="tag">${st.tag}</span><h2>${st.icon} ${st.title}</h2>
      <div class="npc"><div class="ic">${cfg.npcIcon}</div><div><b>${cfg.npcName}:</b> “${st.npc}”</div></div>${read}${code}
      <div class="task">${st.task}</div><div class="de">${st.taskDe}</div>
      ${st.type === "spot" ? "" : `<div class="prog">${S.doneIn < n ? `Task ${S.doneIn + 1} of ${n}` : "🔁 Once more: a task you got wrong – Noch einmal eine Aufgabe, die falsch war"}</div>`}
      <div id="ex"></div><div class="feedback" id="fb"></div></div>`;
    ({ quiz: rQuiz, choose: rQuiz, dial: rDial, type: rType, order: rOrder, sort: rSort, spot: rSpot })[st.type](st, st.items[S.q[0]]);
  }
  function itemDone() {
    const i = S.q.shift(), tag = S.st + ":" + i;
    if (S.err && S.rep.indexOf(tag) < 0) { S.rep.push(tag); S.q.push(i); }
    if (!wasCounted(tag)) { markCounted(tag); S.doneIn++; }
    S.err = false; save();
    setTimeout(() => { if (S.q.length) { render(); } else stageDone(); }, 900);
  }
  /* zählt jede Aufgabe nur einmal für den Fortschritt (z. B. Code-Ziffern) */
  function wasCounted(tag) { return (S.cnt || []).indexOf(tag) >= 0; }
  function markCounted(tag) { S.cnt = S.cnt || []; S.cnt.push(tag); }

  function stageDone() {
    const st = cfg.stages[S.st];
    const last = S.st === cfg.stages.length - 1;
    if (last) { S.done = true; S.end = Date.now(); save(); render(); window.scrollTo(0, 0); return; }
    $("app").innerHTML = `<div class="panel center"><div class="big">${st.doneIcon || "✅"}</div><h2 style="color:var(--ok)">${st.doneTitle}</h2>
      <div class="npc" style="text-align:left"><div class="ic">${cfg.npcIcon}</div><div><b>${cfg.npcName}:</b> “${st.doneText}”</div></div>
      ${st.rulesAfter ? `<p class="de">Lies dir jetzt die Regelkarte durch. – Read the rule card now.</p>` : ""}
      <button class="btn primary" id="go">${st.nextLabel || "Go on →"}</button></div>`;
    window.scrollTo(0, 0);
    $("go").onclick = () => {
      if (st.rulesAfter) S.rl = st.rulesAfter;
      S.st++; S.intro = true; save(); render(); window.scrollTo(0, 0);
      if (st.rulesAfter) showRules();
    };
  }

  /* ---------- QUIZ / CHOOSE ---------- */
  function rQuiz(st, it) {
    const opts = shuffle(it.o);
    $("ex").innerHTML = `${it.sit ? `<div class="screen"><div class="sit">Situation</div>${it.sit}</div>` : `<div class="screen">${it.q}</div>`}
      <div class="opts">${opts.map((o, k) => `<button class="btn" data-k="${k}">${o}</button>`).join("")}</div>`;
    let locked = false;
    document.querySelectorAll("#ex .opts .btn").forEach(b => b.onclick = () => {
      if (locked) return;
      if (opts[+b.dataset.k] === it.o[0]) { locked = true; b.classList.add("right"); fb("✔ " + (it.why || "Correct!"), true); itemDone(); }
      else { shake(b, "wrong"); mistake(); fb("✘ " + (it.no || "Not quite. Read again. <span class='de'>Lies noch einmal genau.</span>")); }
    });
  }

  /* ---------- DIAL (Zahlenschloss: antippen = weiterdrehen) ---------- */
  function rDial(st, it) {
    const parts = it.t.split(/\{(\d)\}/), pos = it.g.map(() => -1), ok = it.g.map(() => false);
    const opts = it.g.map(g => shuffle(g));
    function txt(i) { return pos[i] < 0 ? "?" : opts[i][pos[i]]; }
    $("ex").innerHTML = `<div class="screen">${parts.map((p, k) => k % 2 ? `<button class="dial" id="d${p}">?</button>` : p).join("")}</div>
      <button class="btn primary" id="chk">${st.checkLabel || "🔓 Open the lock"}</button>`;
    it.g.forEach((_, i) => $("d" + i).onclick = () => { if (ok[i]) return; pos[i] = (pos[i] + 1) % opts[i].length; $("d" + i).textContent = txt(i); $("d" + i).classList.remove("bad"); });
    let locked = false;
    $("chk").onclick = () => {
      if (locked) return;
      if (pos.some(p => p < 0)) { fb("Tap every dial first. <span class='de'>Tippe zuerst alle Rädchen an.</span>"); return; }
      let msg = "";
      it.g.forEach((_, i) => {
        if (ok[i]) return;
        if (txt(i) === it.a[i]) { ok[i] = true; $("d" + i).classList.add("ok"); }
        else { shake($("d" + i), "bad"); if (!msg) msg = hint(it.a[i], txt(i), it.ty || st.ty); }
      });
      if (ok.every(x => x)) { locked = true; fb("✔ Click! Correct.", true); itemDone(); }
      else { mistake(); fb("✘ " + msg); }
    };
  }

  /* ---------- TYPE ---------- */
  function rType(st, it) {
    const parts = it.t.split(/\{(\d)\}/);
    $("ex").innerHTML = `<div class="screen">${parts.map((p, k) => k % 2 ? `<input class="ty" id="in${p}" autocapitalize="off" autocorrect="off" autocomplete="off" spellcheck="false"> <span class="vb">(${it.v[+p]})</span>` : p).join("")}</div>
      <button class="btn primary" id="chk">Check</button>`;
    let locked = false;
    it.a.forEach((_, i) => $("in" + i).addEventListener("keydown", e => { if (e.key === "Enter") $("chk").click(); }));
    $("chk").onclick = () => {
      if (locked) return;
      let all = true, msg = "";
      it.a.forEach((a, i) => {
        const inp = $("in" + i);
        if (inp.readOnly) return;
        if (isRight(a, inp.value)) { inp.classList.remove("bad"); inp.classList.add("ok"); inp.readOnly = true; }
        else { all = false; shake(inp, "bad"); if (!msg) msg = hint(a, inp.value, it.ty || st.ty); }
      });
      if (all) { locked = true; fb("✔ Correct!", true); itemDone(); }
      else { mistake(); fb("✘ " + msg); }
    };
  }

  /* ---------- ORDER ---------- */
  function rOrder(st, target) {
    let pool = shuffle(target.map(w => ({ w }))), t = 0, ans = [];
    while (pool.map(x => x.w).join(" ") === target.join(" ") && t++ < 10) pool = shuffle(pool);
    $("ex").innerHTML = `<div class="answerline" id="al"></div><div class="pool" id="pl"></div>
      <div class="row"><button class="btn primary" id="chk">Check</button><button class="btn" id="rs">Reset</button></div>`;
    function draw() {
      $("al").innerHTML = ans.map((x, k) => `<span class="chip" data-k="${k}">${x.w}</span>`).join("");
      $("pl").innerHTML = pool.map((x, k) => `<span class="chip" data-k="${k}">${x.w}</span>`).join("");
      document.querySelectorAll("#pl .chip").forEach(c => c.onclick = () => { ans.push(pool.splice(+c.dataset.k, 1)[0]); $("al").className = "answerline"; draw(); });
      document.querySelectorAll("#al .chip").forEach(c => c.onclick = () => { pool.push(ans.splice(+c.dataset.k, 1)[0]); $("al").className = "answerline"; draw(); });
    }
    draw();
    let locked = false;
    $("rs").onclick = () => { if (locked) return; pool = pool.concat(ans); ans = []; draw(); };
    $("chk").onclick = () => {
      if (locked) return;
      if (pool.length) { fb("Use all the words. – Benutze alle Wörter."); return; }
      if (ans.map(x => x.w).join(" ") === target.join(" ")) { locked = true; $("al").className = "answerline right"; fb("✔ Correct!", true); itemDone(); }
      else { const al = $("al"); al.className = "answerline"; void al.offsetWidth; al.className = "answerline wrong"; mistake();
        fb("✘ Not quite. Where is <b>if</b>? Where is <b>will / would</b>? Comma only if the if-clause comes first. <span class='de'>Tippe ein Wort an, um es zurückzulegen.</span>"); }
    };
  }

  /* ---------- SORT (eine Karte, zwei Körbe) ---------- */
  function rSort(st, it) {
    $("ex").innerHTML = `<div class="card">${it.s}</div><div class="bins">${st.bins.map((b, k) => `<button class="btn" data-k="${k}">${b}</button>`).join("")}</div>`;
    let locked = false;
    document.querySelectorAll(".bins .btn").forEach(b => b.onclick = () => {
      if (locked) return;
      if (+b.dataset.k === it.b) { locked = true; b.classList.add("right"); fb("✔ " + (it.why || "Correct!"), true); itemDone(); }
      else { shake(b, "wrong"); mistake(); fb("✘ " + st.hint); }
    });
  }

  /* ---------- SPOT (Fehler finden) ---------- */
  function rSpot(st) {
    const n = st.items.filter(x => x.wrong).length, sel = new Set();
    $("ex").innerHTML = `<div class="sentlist">${st.items.map((x, i) => `<button class="sent" data-i="${i}">${x.s}</button>`).join("")}</div>
      <button class="btn primary" id="chk">${st.checkLabel || "Check"}</button>`;
    let locked = false;
    document.querySelectorAll(".sent").forEach(b => b.onclick = () => {
      if (locked) return; const i = +b.dataset.i;
      if (sel.has(i)) { sel.delete(i); b.classList.remove("sel"); } else { sel.add(i); b.classList.add("sel"); } fb("");
    });
    $("chk").onclick = () => {
      if (locked) return;
      if (sel.size !== n) { fb(`You have marked ${sel.size}. Mark exactly <b>${n}</b> sentences. <span class='de'>Markiere genau ${n} Sätze.</span>`); return; }
      const right = [...sel].filter(i => st.items[i].wrong).length;
      if (right === n) {
        locked = true;
        document.querySelectorAll(".sent").forEach(b => { const x = st.items[+b.dataset.i]; if (x.wrong) { b.classList.remove("sel"); b.classList.add("ok"); b.innerHTML = `<s>${x.s}</s><span class="fix">✔ ${x.fix}</span>`; } });
        fb("✔ Perfect – all mistakes found!", true);
        $("chk").textContent = st.finalLabel || "Go on →";
        $("chk").onclick = () => { S.q = []; S.doneIn = 1; save(); stageDone(); };
      } else { mistake(); fb(`✘ ${right} of ${n} correct. Look for: <b>will / would</b> in the if-clause · will ↔ would mixed up · wrong tense. <span class='de'>Prüfe deine Auswahl noch einmal.</span>`); }
    };
  }

  /* ---------- Start / Ende ---------- */
  function startScreen() {
    $("app").innerHTML = `<div class="panel">
      <p style="margin:0 0 12px"><a href="./" style="color:inherit;opacity:.7;font-size:15px">← All exercises</a></p>
      <div class="bigav" style="width:120px;margin:0 0 10px">${E8.myAvatar()}</div>
      ${cfg.startHTML}
      <p class="task">What's your name?</p>
      <div class="row"><input class="name" id="nm" placeholder="your name" maxlength="20" autocomplete="off" value="${me() ? "No. " + me() : ""}">
        <button class="btn primary" id="go">${cfg.startLabel || "Start"}</button></div>
      <div class="feedback bad" id="fb"></div></div>`;
    $("go").onclick = () => {
      const n = $("nm").value.trim();
      if (!n) { fb("Please enter your name. – Bitte gib deinen Namen ein."); return; }
      S = newState(n); save(); render(); window.scrollTo(0, 0);
    };
  }
  function finish() {
    hud();
    const sec = Math.round((S.end - S.start) / 1000), m = Math.floor(sec / 60), s = sec % 60;
    $("app").innerHTML = `<div class="panel center"><div class="bigav">${E8.myAvatar()}</div>${cfg.finishHTML(S, esc(S.name))}
      <p>Mistakes: <b>${S.mistakes}</b> · Time: <b>${m} min ${s} s</b></p>
      <div id="coinbox" class="coinbox"></div>
      <p class="small">Show this screen to your teacher. – Zeig diesen Bildschirm deiner Lehrkraft.</p>
      <p class="row" style="justify-content:center"><button class="btn primary" id="again">New player / play again</button>
        <button class="btn" onclick="location.href='./'">← All exercises</button></p></div>`;
    $("again").onclick = reset;
    if (window.E8) E8.reportInto("coinbox", cfg.id, S, save);
  }
  function reset() { S = null; try { sessionStorage.removeItem(KEY); } catch (e) { } render(); window.scrollTo(0, 0); }
  function resumeScreen() {
    $("app").innerHTML = `<div class="panel"><span class="tag">${cfg.title}</span><h2>Welcome back!</h2>
      <p>Someone has already started this game on this iPad. – Auf diesem iPad hat schon jemand angefangen.</p>
      <div class="row"><button class="btn primary" id="cont">Continue as ${esc(S.name)}</button><button class="btn" id="newp">I'm a new player</button></div></div>`;
    $("cont").onclick = () => render();
    $("newp").onclick = reset;
  }

  document.body.insertAdjacentHTML("afterbegin", `<header id="hdr" style="display:none"></header>`);
  document.body.insertAdjacentHTML("beforeend", `<div class="overlay" id="ov"><div class="panel" id="ovc"></div></div>`);
  $("ov").onclick = e => { if (e.target === $("ov")) closeOv(); };
  load();
  if (S && me() && S.nr !== me()) { S = null; try { sessionStorage.removeItem(KEY); } catch (e) { } }
  if (S && !S.done && S.st >= 0) resumeScreen(); else render();
  return { state: () => S };
};
