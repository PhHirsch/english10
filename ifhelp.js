/* Hilfen für die If-clause-Spiele (english10): Fehlerhinweise und Regelkarte */
window.IFH = (function () {
  const norm = s => (" " + String(s).toLowerCase().replace(/[’‘`´]/g, "'").replace(/[.!?,]/g, " ").replace(/\s+/g, " ").trim() + " ")
    .replace(/ won't /g, " will not ").replace(/(\w)n't /g, "$1 not ").replace(/(\w)'d /g, "$1 would ").replace(/ 'd /g, " would ").replace(/(\w)'ll /g, "$1 will ").replace(/ 'll /g, " will ").replace(/\s+/g, " ").trim();
  function hint(right, val, ty) {
    const r = norm(String(right).split("|")[0]), v = norm(val);
    const rMain = /^(will|would)\b/.test(r), vWill = /\bwill\b/.test(v), vWould = /\bwould\b/.test(v);
    const same = r.split(" ")[0] === v.split(" ")[0] && r.split(" ").length === v.split(" ").length;
    if (!rMain) {
      if (vWill || vWould) return "No <b>will / would</b> in the if-clause! – Im if-Satz steht nie will oder would.";
      if (ty === 2) return "Unreal situation (type II): if-clause → <b>simple past</b> (had, knew, were, didn't …). – Unwirklich: if-Satz im simple past.";
      if (same) return "Check the spelling. – Prüfe die Rechtschreibung.";
      return "Possible situation (type I): if-clause → <b>simple present</b> (he/she/it → -s · don't / doesn't). – Möglich: if-Satz im simple present.";
    }
    if (r.startsWith("will") && vWould) return "This is possible / real → <b>will</b> (type I), not would. – Mögliche Situation → will.";
    if (r.startsWith("would") && vWill) return "This is unreal → <b>would</b> (type II), not will. – Unwirkliche Situation → would.";
    if (same) return "Check the spelling of the verb and the word <b>not</b>. – Prüfe Rechtschreibung und Verneinung.";
    if (r.startsWith("will")) return "Main clause (type I): <b>will / won't + verb</b>. – Hauptsatz: will + Grundform.";
    return "Main clause (type II): <b>would / wouldn't + verb</b>. – Hauptsatz: would + Grundform.";
  }
  /* Lückensatz mit Verben in Klammern: F(1, "If you ___ …, you ___ …", ["look","see"], ["look","will see|'ll see"]) */
  function F(ty, q, v, a) { return { t: "fill", q: q, v: v, a: a, ty: ty, check: (g, i) => hint(a[i], g, ty) }; }
  const RULES1 = `<div class="rule"><b>Type I – real / possible</b> <span class="de">(möglich, kann wirklich passieren)</span><br>
      if-clause: <b>simple present</b> &nbsp;|&nbsp; main clause: <b>will / won't + verb</b><br><span class="ex">If you touch the paintings, the alarm will ring.</span></div>`;
  const RULES2 = `<div class="rule"><b>Type II – unreal / unlikely</b> <span class="de">(unwirklich, nur vorgestellt)</span><br>
      if-clause: <b>simple past</b> &nbsp;|&nbsp; main clause: <b>would / wouldn't + verb</b><br><span class="ex">If I had more money, I would build a museum.</span><br>
      ⚠️ The past form does <b>not</b> mean past time! · If I / he / she / it <b>were</b> … (also: was) · can → <b>could</b></div>`;
  const RULESX = `<div class="rule">⚠️ <b>Never will or would in the if-clause!</b><br><span class="ex">✗ If you will press … ✓ If you press … · ✗ If I would have … ✓ If I had …</span></div>
    <div class="rule">If-clause first → <b>comma</b>. If-clause second → no comma.<br><span class="ex">If it rains, we will stay. · We will stay if it rains.</span></div>
    <p class="de">Typ I: möglich – simple present + will. Typ II: unwirklich – simple past + would. Nie will/would im if-Satz.</p>`;
  return { hint, F, norm, RULES: `<h2>If clauses</h2>${RULES1}${RULES2}${RULESX}`, RULES1, RULES2, RULESX };
})();
