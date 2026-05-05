// live lesson data (editable via editor panel)
// lessons registry: add new lessons here by copying the structure of defaultLessonData
const lessons = {
  'Lektion 40/3': JSON.parse(JSON.stringify(defaultLessonData))
};
let currentLessonKey = Object.keys(lessons)[0];
let lessonData = JSON.parse(JSON.stringify(lessons[currentLessonKey]));

// basic array shuffle
function shuffle(arr){ const a=[...arr]; for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TAB SWITCHING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function showTab(id) {
  ['vquiz-de','vquiz-stf'].forEach(t => {
    const panel = document.getElementById('panel-'+t);
    if(panel) panel.classList.toggle('active', t===id);
    const btn = document.getElementById('t-'+t);
    if(btn) btn.classList.toggle('active', t===id);
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VOCAB QUIZ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
let qWords=[], qIdx=0, qRight=0, qWrong=0, qSkipped=0, qAnswered=false;
let qReviewRows=[];

function shuffle2(arr){ return shuffle(arr); }

function qStart(){
  qWords = shuffle2(vocabData);
  qIdx=0; qRight=0; qWrong=0; qSkipped=0; qAnswered=false;
  qReviewRows=[];
  const done = document.getElementById('q-done'); if(done) done.classList.remove('show');
  const qm = document.getElementById('quiz-main'); if(qm) qm.style.display='';
  qLoad();
}

function qLoad(){
  if(qIdx>=qWords.length){ qDone(); return; }
  qAnswered=false;
  const w=qWords[qIdx];
  const qword = document.getElementById('qword'); if(qword) qword.textContent=w.la;
  const qtype = document.getElementById('qtype'); if(qtype) qtype.textContent=w.wt+(w.stf&&w.stf!=='—'?'':' ');
  const progLbl = document.getElementById('q-prog-lbl'); if(progLbl) progLbl.textContent=`Frage ${qIdx+1} / ${qWords.length}`;
  const pct=Math.round((qIdx/qWords.length)*100);
  const pctEl = document.getElementById('q-prog-pct'); if(pctEl) pctEl.textContent=pct+'%';
  const fill = document.getElementById('q-prog-fill'); if(fill) fill.style.width=pct+'%';
  const fb=document.getElementById('q-feedback'); if(fb) fb.className='feedback';
  const hv=document.getElementById('q-hint-val'); if(hv) hv.className='hint-val';
  const inp=document.getElementById('q-input'); if(inp){ inp.value=''; inp.disabled=false; }
  const btnsCheck=document.getElementById('q-btns-check'); if(btnsCheck) btnsCheck.style.display='';
  const btnsNext=document.getElementById('q-btns-next'); if(btnsNext) btnsNext.style.display='none';
  qUpdatePills();
  setTimeout(()=>{ const i=document.getElementById('q-input'); if(i) i.focus(); },50);
}

function qUpdatePills(){ const a=document.getElementById('qsp-right'); if(a) a.textContent='✓ '+qRight; const b=document.getElementById('qsp-wrong'); if(b) b.textContent='✗ '+qWrong; const c=document.getElementById('qsp-skip'); if(c) c.textContent='↷ '+qSkipped; }

function norm(s){ return s.trim().toLowerCase().replace(/[äöü]/g,c=>({ä:'ae',ö:'oe',ü:'ue'}[c]||c)).replace(/ß/g,'ss').replace(/[^a-z\s]/g,'').replace(/\s+/g,' '); }

function meaningInputParts(s){
  return s
    .split(/\s*(?:,|;|\/|\bund\b|\+|&)\s*/i)
    .map(p=>norm(p))
    .filter(Boolean);
}

function buildMeaningLookup(meanings){
  const exact = new Set();
  meanings.forEach(m => {
    if(typeof m !== 'string') return;
    const n = norm(m);
    if(n) exact.add(n);
    meaningInputParts(m).forEach(part => {
      if(part) exact.add(part);
    });
    m.split('/').forEach(part => {
      const pn = norm(part);
      if(pn) exact.add(pn);
    });
  });
  return exact;
}

function isMeaningMatch(part, lookup){
  if(!part) return false;
  if(lookup.has(part)) return true;

  // Akzeptiert mehrere Bedeutungen auch ohne Satzzeichen, z.B. "eid schwur".
  if(part.includes(' ')){
    const tokens = part.split(' ').filter(Boolean);
    if(tokens.length > 1 && tokens.every(tok => lookup.has(tok))) return true;
  }

  return Array.from(lookup).some(v => v.split(' ').includes(part) && part.length>3);
}

// Normalisierung für Stammformen (ignoriert Makrons und gängige Satzzeichen)
function normStf(s){
  return String(s || '')
    .trim()
    .toLowerCase()
    .replace(/[āēīōū]/g, c=>({ā:'a',ē:'e',ī:'i',ō:'o',ū:'u'}[c]||c))
    // Punkte/Kommas/ähnliche Trenner angleichen, damit z.B. "m." und "m" gleich behandelt werden.
    .replace(/[.,;:/()\[\]{}]/g, ' ')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g,' ')
    .trim();
}

function normalizeStfToken(tok){
  const t = (tok || '').trim();
  if(!t) return '';
  if(/^(m|masc|maskulin|masculinum)$/.test(t)) return 'm';
  if(/^(f|fem|feminin|femininum)$/.test(t)) return 'f';
  if(/^(n|neut|neutrum)$/.test(t)) return 'n';
  return t;
}

function stfTokens(s){
  return normStf(s)
    .split(' ')
    .map(t => normalizeStfToken(t))
    .filter(Boolean);
}

function isStfMatch(rawInput, expectedStf){
  const inputNorm = normStf(rawInput);
  const expectedNorm = normStf(expectedStf);
  if(!inputNorm || !expectedNorm) return false;
  if(inputNorm === expectedNorm) return true;

  // Akzeptiert auch Varianten ohne sichtbare Trenner wie "exercitusm".
  if(inputNorm.replace(/\s+/g,'') === expectedNorm.replace(/\s+/g,'')) return true;

  const inputTokens = stfTokens(rawInput);
  const expectedTokens = stfTokens(expectedStf);
  if(!inputTokens.length || !expectedTokens.length) return false;

  // Für Stammformen gilt: Nur vollständige Angaben zählen als richtig.
  if(inputTokens.length !== expectedTokens.length) return false;

  const remaining = [...expectedTokens];
  for(const tok of inputTokens){
    const idx = remaining.indexOf(tok);
    if(idx === -1) return false;
    remaining.splice(idx, 1);
  }
  return true;
}

function qCheck(){
  if(qAnswered) return;
  const w=qWords[qIdx];
  const raw=document.getElementById('q-input').value;
  if(!raw.trim()) return;
  const lookup = buildMeaningLookup(w.de || []);
  const parts = meaningInputParts(raw);
  const uniqueParts = [...new Set(parts)];
  const isOk = uniqueParts.length>0 && uniqueParts.every(p => isMeaningMatch(p, lookup));
  qAnswered=true;
  document.getElementById('q-input').disabled=true;
  if(isOk){ qRight++; } else { qWrong++; }
  qReviewRows.push({
    la: w.la,
    de: (w.de || []).join(', '),
    knew: isOk
  });
  qUpdatePills();
  const fb=document.getElementById('q-feedback');
  if(fb) fb.className='feedback '+(isOk?'ok':'err')+' show';
  const title = document.getElementById('q-fb-title'); if(title) title.textContent=isOk?'✓ Richtig!':'✗ Falsch – richtig wäre:';
  const detail = document.getElementById('q-fb-detail'); if(detail) detail.textContent=w.de.join(', ');
  const stfEl = document.getElementById('q-fb-stf'); if(stfEl) stfEl.innerHTML=w.stf&&w.stf!=='—'?`<b>Stammformen:</b> ${w.stf}`:'';
  document.getElementById('q-btns-check').style.display='none';
  document.getElementById('q-btns-next').style.display='';
  // show context box for this vocab (if available)
  showQContext(w.la);
}
function qSkip(){
  if(qAnswered) return;
  qSkipped++;
  const w=qWords[qIdx];
  qAnswered=true;
  document.getElementById('q-input').disabled=true;
  qReviewRows.push({
    la: w.la,
    de: (w.de || []).join(', '),
    knew: false
  });
  qUpdatePills();
  const fb=document.getElementById('q-feedback'); if(fb) fb.className='feedback err show';
  document.getElementById('q-fb-title').textContent='Übersprungen – Antwort:';
  document.getElementById('q-fb-detail').textContent=w.de.join(', ');
  const stfEl = document.getElementById('q-fb-stf'); if(stfEl) stfEl.innerHTML=w.stf&&w.stf!=='—'?`<b>Stammformen:</b> ${w.stf}`:'';
  document.getElementById('q-btns-check').style.display='none';
  document.getElementById('q-btns-next').style.display='';
  // show context box
  showQContext(w.la);
}

function qNext(){ qIdx++; qLoad(); hideQContext(); }
function qRestart(){ qStart(); }
function qShowHint(){ const w=qWords[qIdx]; const hv=document.getElementById('q-hint-val'); if(hv){ hv.textContent=w.hint; hv.className='hint-val vis'; } }

// show / hide context box for current quiz word
function showQContext(la){
  try{
    const box = document.getElementById('q-context');
    const lat = document.getElementById('q-context-latin');
    const de = document.getElementById('q-context-de');
    if(!box || !lat || !de) return;
    // try to find mapping by exact match of la (or lemma part before comma)
    const key = (la||'').split(',')[0].trim();
    const entry = (contextMap||[]).find(e => (e.la||'').toLowerCase() === key.toLowerCase());
    if(entry){
      lat.textContent = entry.context + ':';
      de.textContent = entry.translation;
      // Icon aus vocabData suchen
      let iconName = null;
      if (window.vocabData) {
        const v = window.vocabData.find(v => (v.la||'').split(',')[0].trim().toLowerCase() === key.toLowerCase());
        if (v && v.icon) iconName = v.icon;
      }
      const iconEl = document.getElementById('q-context-icon');
      if(iconEl) {
        if(iconName) {
          iconEl.innerHTML = `<img src="https://unpkg.com/lucide-static/icons/${iconName}.svg" alt="${iconName}" width="20" height="20" style="vertical-align:middle;filter:invert(0.2);margin-right:4px;">`;
        } else {
          iconEl.textContent = 'T';
        }
      }
      box.style.display = '';
      setTimeout(function(){ box.classList.add('visible'); }, 20);
    } else {
      hideQContext();
    }
  }catch(e){ console.error(e); }
}
function hideQContext(){
  const box = document.getElementById('q-context');
  if(!box) return;
  box.classList.remove('visible');
  // wait for transition to finish then remove from flow
  setTimeout(()=>{ if(box) box.style.display='none'; }, 240);
}

function ensureQReviewUI(){
  const done = document.getElementById('q-done');
  if(!done) return null;

  let body = document.getElementById('q-review-body');
  if(body) return body;

  const review = document.createElement('div');
  review.className = 'done-review';
  review.innerHTML = `
    <div class="done-review-title">Dein Durchlauf</div>
    <div class="done-review-table-wrap">
      <table class="done-review-table">
        <thead>
          <tr>
            <th>Vokabel</th>
            <th>Bedeutung</th>
            <th>Gewusst?</th>
          </tr>
        </thead>
        <tbody id="q-review-body"></tbody>
      </table>
    </div>
    <div id="q-review-empty" class="done-review-empty">Noch keine Ergebnisse vorhanden.</div>
  `;

  const restartBtn = done.querySelector('button[onclick="qRestart()"]');
  if(restartBtn) done.insertBefore(review, restartBtn);
  else done.appendChild(review);

  body = document.getElementById('q-review-body');
  return body;
}

function renderQReviewTable(){
  const body = ensureQReviewUI();
  if(!body) return;

  body.innerHTML = '';
  const sortedRows = [...qReviewRows].sort((a, b) => Number(a.knew) - Number(b.knew));

  sortedRows.forEach(row => {
    const tr = document.createElement('tr');
    tr.className = row.knew ? 'q-review-row-yes' : 'q-review-row-no';

    const tdLa = document.createElement('td');
    tdLa.textContent = row.la || '—';

    const tdDe = document.createElement('td');
    tdDe.textContent = row.de || '—';

    const tdKnew = document.createElement('td');
    tdKnew.textContent = row.knew ? 'Ja' : 'Nein';
    tdKnew.className = row.knew ? 'q-review-yes' : 'q-review-no';

    tr.appendChild(tdLa);
    tr.appendChild(tdDe);
    tr.appendChild(tdKnew);
    body.appendChild(tr);
  });

  const empty = document.getElementById('q-review-empty');
  if(empty) empty.style.display = qReviewRows.length ? 'none' : 'block';
}

function qBuildReviewPdf(rows, options){
  if(!window.jspdf || !window.jspdf.jsPDF){
    alert('PDF-Bibliothek konnte nicht geladen werden. Bitte Seite neu laden und erneut versuchen.');
    return;
  }

  const opts = options || {};
  const title = opts.title || 'Vokabelabfrage - Ergebnis';
  const includeStatus = !!opts.includeStatus;
  const filenamePrefix = opts.filenamePrefix || 'vokabelabfrage-ergebnis';

  const doc = new window.jspdf.jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
  const margin = 14;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const tableWidth = pageWidth - margin * 2;
  const colWidths = includeStatus ? [50, 106, 24] : [58, 118];
  const lineHeight = 5;
  const topY = 16;

  const today = new Date();
  const dateLabel = today.toLocaleDateString('de-DE');
  const total = qRight + qWrong + qSkipped;
  const scoreText = `${qRight} / ${total}`;

  let y = topY;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(title, margin, y);

  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(`Datum: ${dateLabel}`, margin, y);
  y += 6;
  doc.text(`Ergebnis: ${scoreText}`, margin, y);
  y += 8;

  function drawHeader(){
    doc.setFillColor(240, 236, 227);
    doc.rect(margin, y, tableWidth, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Vokabel', margin + 2, y + 5.5);
    doc.text('Bedeutung', margin + colWidths[0] + 2, y + 5.5);
    if(includeStatus){
      doc.text('Gewusst', margin + colWidths[0] + colWidths[1] + 2, y + 5.5);
    }
    doc.setDrawColor(205, 195, 180);
    doc.rect(margin, y, tableWidth, 8);
    doc.line(margin + colWidths[0], y, margin + colWidths[0], y + 8);
    if(includeStatus){
      doc.line(margin + colWidths[0] + colWidths[1], y, margin + colWidths[0] + colWidths[1], y + 8);
    }
    y += 8;
  }

  drawHeader();

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);

  rows
    .slice()
    .sort((a, b) => (a.la || '').localeCompare(b.la || '', 'de'))
    .forEach(row => {
      const leftText = row.la || '—';
      const rightText = row.de || '—';
      const statusText = row.knew ? 'Ja' : 'Nein';
      const leftLines = doc.splitTextToSize(leftText, colWidths[0] - 4);
      const rightLines = doc.splitTextToSize(rightText, includeStatus ? colWidths[1] - 4 : colWidths[1] - 4);
      const statusLines = includeStatus ? doc.splitTextToSize(statusText, colWidths[2] - 4) : [''];
      const maxLines = Math.max(leftLines.length, rightLines.length, statusLines.length, 1);
      const rowHeight = Math.max(8, maxLines * lineHeight + 2);

      if(y + rowHeight > pageHeight - margin){
        doc.addPage();
        y = topY;
        drawHeader();
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10.5);
      }

      doc.setDrawColor(222, 214, 201);
      doc.rect(margin, y, tableWidth, rowHeight);
      doc.line(margin + colWidths[0], y, margin + colWidths[0], y + rowHeight);
      if(includeStatus){
        doc.line(margin + colWidths[0] + colWidths[1], y, margin + colWidths[0] + colWidths[1], y + rowHeight);
      }
      doc.text(leftLines, margin + 2, y + 5);
      doc.text(rightLines, margin + colWidths[0] + 2, y + 5);
      if(includeStatus){
        doc.text(statusLines, margin + colWidths[0] + colWidths[1] + 2, y + 5);
      }
      y += rowHeight;
    });

  const fileDate = today.toISOString().slice(0, 10);
  doc.save(`${filenamePrefix}-${fileDate}.pdf`);
}

function qDownloadReviewPdf(){
  const knownRows = qReviewRows.filter(row => row.knew);
  if(!knownRows.length){
    alert('Du hast in diesem Durchlauf noch keine Vokabel als gewusst markiert.');
    return;
  }

  qBuildReviewPdf(knownRows, {
    title: 'Vokabelabfrage - Gewusste Vokabeln',
    includeStatus: false,
    filenamePrefix: 'gewusste-vokabeln'
  });
}

function qDownloadAllReviewPdf(){
  if(!qReviewRows.length){
    alert('Noch keine Ergebnisse vorhanden.');
    return;
  }

  qBuildReviewPdf(qReviewRows, {
    title: 'Vokabelabfrage - Gesamter Durchlauf',
    includeStatus: true,
    filenamePrefix: 'alle-vokabel-ergebnisse'
  });
}

function qDone(){
  const qm = document.getElementById('quiz-main'); if(qm) qm.style.display='none';
  const d=document.getElementById('q-done'); if(d) d.classList.add('show');
  const total=qRight+qWrong+qSkipped;
  const pct=total?Math.round((qRight/total)*100):0;
  const doneScore = document.getElementById('done-score'); if(doneScore) doneScore.textContent=`${qRight} / ${total}`;
  const doneMsg = document.getElementById('done-msg'); if(doneMsg) doneMsg.textContent=pct>=80?'Ausgezeichnet! Bene factum!':pct>=60?'Gut gemacht – weiter so!':'Noch etwas üben – du schaffst das!';
  const dsRight = document.getElementById('ds-right'); if(dsRight) dsRight.textContent=qRight;
  const dsWrong = document.getElementById('ds-wrong'); if(dsWrong) dsWrong.textContent=qWrong;
  const dsSkip = document.getElementById('ds-skip'); if(dsSkip) dsSkip.textContent=qSkipped;
  ensureQReviewUI();
  renderQReviewTable();
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TRANSLATION DRAG & DROP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
let trState={}; // blankId -> chipId
let trSel=null; // selected chip id
let trDragId=null;
let sentenceBlanks = [];
let fullLatinSentences = [];
let blankLatin = {};
let latinSegments = [];
let trSentenceIdx = 0;
let shuffledChips = [];
let trChips = [];
let solvedSentences = {};

function trRender(){
  const container = document.getElementById('lat-text-render');
  if(!container) return;
  container.innerHTML = '';

  // Render solved sentences fixed at top
  const solvedKeys = Object.keys(solvedSentences).map(k=>parseInt(k)).sort((a,b)=>a-b);
  if(solvedKeys.length){
    const solvedWrap = document.createElement('div');
    solvedWrap.style.marginBottom = '14px';
    solvedWrap.innerHTML = '<div class="eyebrow">Bereits gelöste Sätze</div>';
    solvedKeys.forEach(si => {
      const sDiv = document.createElement('div');
      sDiv.style.display = 'flex';
      sDiv.style.flexDirection = 'column';
      sDiv.style.gap = '6px';
      sDiv.style.padding = '10px';
      sDiv.style.background = 'var(--surface2)';
      sDiv.style.border = '1px solid var(--border)';
      sDiv.style.borderRadius = '8px';
      sDiv.style.marginBottom = '8px';
      const sText = document.createElement('div');
      sText.style.fontFamily = 'Playfair Display, serif';
      sText.style.fontSize = '1rem';
      sText.textContent = fullLatinSentences ? (fullLatinSentences[si] || '') : '';
      const maps = solvedSentences[si];
      const chipsRow = document.createElement('div');
      chipsRow.style.display = 'flex'; chipsRow.style.flexWrap='wrap'; chipsRow.style.gap='8px';
      Object.keys(maps).forEach(bid => {
        const cid = maps[bid];
        const chip = shuffledChips.find(c=>c.id===cid);
        const cdiv = document.createElement('div');
        cdiv.className = 'tr-chip used';
        cdiv.textContent = chip? chip.text : '';
        chipsRow.appendChild(cdiv);
      });
      sDiv.appendChild(sText);
      sDiv.appendChild(chipsRow);
      solvedWrap.appendChild(sDiv);
    });
    container.appendChild(solvedWrap);
  }

  // If all sentences solved, show completion message
  if(trSentenceIdx >= fullLatinSentences.length){
    container.insertAdjacentHTML('beforeend', `<div style="white-space:pre-wrap; margin-bottom:12px; font-style:italic">Alle Sätze wurden korrekt zugeordnet.</div>`);
    const ex = document.getElementById('tr-targets'); if(ex) ex.remove();
    const pool = document.getElementById('tr-pool'); if(pool){ pool.innerHTML=''; shuffledChips.forEach(c => { const d = document.createElement('div'); d.className='tr-chip used'; d.textContent=c.text; pool.appendChild(d); }); }
    return;
  }

  // Render only the current Latin sentence
  const currentSentence = fullLatinSentences[trSentenceIdx] || '';
  container.insertAdjacentHTML('beforeend', `<div style="white-space:pre-wrap; margin-bottom:12px; font-size:1.15rem">${currentSentence.replace(/\n/g,'<br>')}</div>`);

  // Render targets below the sentence: only for the current sentence's blanks
  const existingTargets = document.getElementById('tr-targets'); if(existingTargets) existingTargets.remove();
  const targets = document.createElement('div');
  targets.id = 'tr-targets';
  targets.style.marginTop = '1rem';

  const currentBlanks = sentenceBlanks[trSentenceIdx] || [];
  currentBlanks.forEach((bid, idx) => {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.gap = '12px';
    row.style.marginBottom = '10px';

    const label = document.createElement('div');
    label.style.minWidth = '220px';
    label.style.color = 'var(--ink3)';
    label.innerHTML = `<strong>${blankLatin[bid] || ('Lücke ' + (idx+1))}</strong>`;

    const slot = document.createElement('div');
    slot.className = 'lat-blank'+(trState[bid]?' has':'');
    slot.id = 'lbz-'+bid;
    slot.dataset.id = bid;
    slot.style.minWidth = '320px';
    slot.style.cursor = 'pointer';
    slot.draggable = false;
    slot.ondragover = e => trDzOver(e,bid);
    slot.ondragleave = e => trDzLeave(e,bid);
    slot.ondrop = e => trDzDrop(e,bid);
    slot.onclick = () => trDzClick(bid);
    const assigned = trState[bid] ? (shuffledChips.find(c=>c.id===trState[bid])?.text || '') : '';
    slot.innerHTML = assigned? assigned : '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';

    row.appendChild(label);
    row.appendChild(slot);
    targets.appendChild(row);
  });

  document.getElementById('lat-text-render').appendChild(targets);

  // Build the global chip pool on the right
  const pool = document.getElementById('tr-pool');
  if(pool){
    pool.innerHTML = '';
    const poolChips = shuffledChips.filter(c => currentBlanks.includes(c.correct));
    poolChips.forEach(c => {
      const used = Object.values(trState).includes(c.id);
      const isSel = trSel === c.id;
      const d = document.createElement('div');
      d.className = 'tr-chip' + (used ? ' used' : '') + (isSel ? ' sel' : '');
      d.id = 'trchip-'+c.id;
      d.draggable = !used;
      d.textContent = c.text;
      d.dataset.id = c.id;
      d.addEventListener('dragstart', e => { trDragId = c.id; setTimeout(() => d.classList.add('drag'), 0); e.dataTransfer.setData('text/plain', c.id); });
      d.addEventListener('dragend', () => { d.classList.remove('drag'); trDragId = null; });
      d.addEventListener('click', () => trChipClick(c.id));
      pool.appendChild(d);
    });
  }
}

function trChipClick(id){
  if(Object.values(trState).includes(id)){
    Object.keys(trState).forEach(k=>{ if(trState[k]===id) trState[k]=null; });
    trSel=null; trRender(); return;
  }
  trSel=(trSel===id)?null:id;
  trRender();
}

function trDzClick(bid){
  if(trSel){
    Object.keys(trState).forEach(k=>{ if(trState[k]===trSel) trState[k]=null; });
    trState[bid]=trSel; trSel=null;
    document.getElementById('tr-result').classList.remove('show');
    trRender();
  } else if(trState[bid]){
    trState[bid]=null; trRender();
  }
}

function trDzOver(e,bid){ e.preventDefault(); const el=document.getElementById('lbz-'+bid); if(el) el.classList.add('over'); }
function trDzLeave(e,bid){ const el=document.getElementById('lbz-'+bid); if(el) el.classList.remove('over'); }
function trDzDrop(e,bid){
  e.preventDefault(); const el=document.getElementById('lbz-'+bid); if(el) el.classList.remove('over');
  const cid=e.dataTransfer.getData('text/plain'); if(!cid) return;
  Object.keys(trState).forEach(k=>{ if(trState[k]===cid) trState[k]=null; });
  trState[bid]=cid; trSel=null;
  document.getElementById('tr-result').classList.remove('show');
  trRender();
}

function trCheck(){
  const r=document.getElementById('tr-result');
  const currentBlanks = sentenceBlanks[trSentenceIdx] || [];
  const allFilled = currentBlanks.every(bid => trState[bid]);
  if(!allFilled){ if(r){ r.innerHTML='Bitte alle Lücken dieser Aufgabe ausfüllen!'; r.className='tr-result bad show'; } return; }
  let correct = 0, total = currentBlanks.length;
  currentBlanks.forEach(bid => {
    const cid = trState[bid];
    const chip = shuffledChips.find(c=>c.id===cid);
    const dz = document.getElementById('lbz-'+bid);
    if(dz){
      if(chip && chip.correct===bid){ dz.className='lat-blank ok'; correct++; }
      else { dz.className='lat-blank bad'; }
    }
  });
  if(correct===total){
    if(r) { r.innerHTML=`<b>✓ Satz ${trSentenceIdx+1} korrekt!</b> Weiter zum nächsten Satz.`; r.className='tr-result ok show'; }
    setTimeout(()=>{
      const snapshot = {};
      currentBlanks.forEach(bid => { snapshot[bid]=trState[bid]; });
      solvedSentences[trSentenceIdx] = snapshot;
      trSentenceIdx++;
      if(trSentenceIdx >= sentenceBlanks.length){ if(r){ r.innerHTML=`<b>✓ Alle Sätze korrekt!</b> Gut gemacht!`; r.className='tr-result ok show'; } }
      trRender();
    },700);
  } else {
    if(r) { r.innerHTML=`${correct} von ${total} richtig. Rot markierte Lücken sind falsch – versuche es nochmal!`; r.className='tr-result part show'; }
  }
}

function trReset(){
  latinSegments.forEach(s=>{ if(s.blank!==undefined) trState[s.blank]=null; });
  trSel=null;
  trSentenceIdx = 0;
  Object.keys(solvedSentences).forEach(k=>delete solvedSentences[k]);
  const r=document.getElementById('tr-result'); if(r) r.classList.remove('show');
  trRender();
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STAMMFORMEN QUIZ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
let qWordsStf=[], qIdxStf=0, qRightStf=0, qWrongStf=0, qSkippedStf=0, qAnsweredStf=false;

function qStartStf(){
  qWordsStf = shuffle2(vocabData.filter(v => v.stf && v.stf !== '—'));
  qIdxStf=0; qRightStf=0; qWrongStf=0; qSkippedStf=0; qAnsweredStf=false;
  const done = document.getElementById('q-done-stf'); if(done) done.classList.remove('show');
  const qm = document.getElementById('quiz-main-stf'); if(qm) qm.style.display='';
  qLoadStf();
}

function qLoadStf(){
  if(qIdxStf>=qWordsStf.length){ qDoneStf(); return; }
  qAnsweredStf=false;
  const w=qWordsStf[qIdxStf];
  const qword = document.getElementById('qword-stf'); if(qword) qword.textContent=w.la;
  const qtype = document.getElementById('qtype-stf'); if(qtype) qtype.textContent=w.wt;
  const progLbl = document.getElementById('q-prog-lbl-stf'); if(progLbl) progLbl.textContent=`Frage ${qIdxStf+1} / ${qWordsStf.length}`;
  const pct=Math.round((qIdxStf/qWordsStf.length)*100);
  const pctEl = document.getElementById('q-prog-pct-stf'); if(pctEl) pctEl.textContent=pct+'%';
  const fill = document.getElementById('q-prog-fill-stf'); if(fill) fill.style.width=pct+'%';
  const fb=document.getElementById('q-feedback-stf'); if(fb) fb.className='feedback';
  const hv=document.getElementById('q-hint-val-stf'); if(hv) hv.className='hint-val';
  const inp=document.getElementById('q-input-stf'); if(inp){ inp.value=''; inp.disabled=false; }
  const btnsCheck=document.getElementById('q-btns-check-stf'); if(btnsCheck) btnsCheck.style.display='';
  const btnsNext=document.getElementById('q-btns-next-stf'); if(btnsNext) btnsNext.style.display='none';
  qUpdatePillsStf();
  setTimeout(()=>{ const i=document.getElementById('q-input-stf'); if(i) i.focus(); },50);
}

function qUpdatePillsStf(){ const a=document.getElementById('qsp-right-stf'); if(a) a.textContent='✓ '+qRightStf; const b=document.getElementById('qsp-wrong-stf'); if(b) b.textContent='✗ '+qWrongStf; const c=document.getElementById('qsp-skip-stf'); if(c) c.textContent='↷ '+qSkippedStf; }

function qCheckStf(){
  if(qAnsweredStf) return;
  const w=qWordsStf[qIdxStf];
  const raw=document.getElementById('q-input-stf').value;
  if(!raw.trim()) return;
  const isOk=isStfMatch(raw, w.stf);
  qAnsweredStf=true;
  document.getElementById('q-input-stf').disabled=true;
  if(isOk){ qRightStf++; } else { qWrongStf++; }
  qUpdatePillsStf();
  const fb=document.getElementById('q-feedback-stf');
  if(fb) fb.className='feedback '+(isOk?'ok':'err')+' show';
  const title = document.getElementById('q-fb-title-stf'); if(title) title.textContent=isOk?'✓ Richtig!':'✗ Falsch – richtig wäre:';
  const detail = document.getElementById('q-fb-detail-stf'); if(detail) detail.textContent=w.stf;
  const stfEl = document.getElementById('q-fb-stf-stf'); if(stfEl) stfEl.innerHTML='';
  // Show meaning (Wortbedeutung)
  const meaningEl = document.getElementById('q-fb-meaning-stf');
  if(meaningEl) {
    meaningEl.innerHTML = `<b>Bedeutung:</b> ${w.de.join(', ')}<br><b>Wortart:</b> ${w.wt}`;
  }
  document.getElementById('q-btns-check-stf').style.display='none';
  document.getElementById('q-btns-next-stf').style.display='';
  showQContextStf(w.la);
}

function qSkipStf(){
  if(qAnsweredStf) return;
  qSkippedStf++;
  const w=qWordsStf[qIdxStf];
  qAnsweredStf=true;
  document.getElementById('q-input-stf').disabled=true;
  qUpdatePillsStf();
  const fb=document.getElementById('q-feedback-stf'); if(fb) fb.className='feedback err show';
  document.getElementById('q-fb-title-stf').textContent='Übersprungen – Antwort:';
  document.getElementById('q-fb-detail-stf').textContent=w.stf;
  const stfEl = document.getElementById('q-fb-stf-stf'); if(stfEl) stfEl.innerHTML='';
  // Show meaning (Wortbedeutung)
  const meaningEl = document.getElementById('q-fb-meaning-stf');
  if(meaningEl) {
    meaningEl.innerHTML = `<b>Bedeutung:</b> ${w.de.join(', ')}<br><b>Wortart:</b> ${w.wt}`;
  }
  document.getElementById('q-btns-check-stf').style.display='none';
  document.getElementById('q-btns-next-stf').style.display='';
  showQContextStf(w.la);
}

function qNextStf(){ qIdxStf++; qLoadStf(); hideQContextStf(); }
function qRestartStf(){ qStartStf(); }
function qShowHintStf(){ const w=qWordsStf[qIdxStf]; const hv=document.getElementById('q-hint-val-stf'); if(hv) hv.textContent=w.hint; }

function showQContextStf(lat){
  try{
    const box = document.getElementById('q-context-stf');
    const latEl = document.getElementById('q-context-latin-stf');
    const deEl = document.getElementById('q-context-de-stf');
    if(!box || !latEl || !deEl) return;
    // try to find mapping by exact match of la (or lemma part before comma)
    const key = (lat||'').split(',')[0].trim();
    const entry = (contextMap||[]).find(e => (e.la||'').toLowerCase() === key.toLowerCase());
    if(entry){
      latEl.textContent = entry.context + ':';
      deEl.textContent = entry.translation;
      // Icon aus vocabData suchen
      let iconName = null;
      if (window.vocabData) {
        const v = window.vocabData.find(v => (v.la||'').split(',')[0].trim().toLowerCase() === key.toLowerCase());
        if (v && v.icon) iconName = v.icon;
      }
      const iconEl = document.getElementById('q-context-icon-stf');
      if(iconEl) {
        if(iconName) {
          iconEl.innerHTML = `<img src="https://unpkg.com/lucide-static/icons/${iconName}.svg" alt="${iconName}" width="20" height="20" style="vertical-align:middle;filter:invert(0.2);margin-right:4px;">`;
        } else {
          iconEl.textContent = 'T';
        }
      }
      box.style.display = '';
      setTimeout(function(){ box.classList.add('visible'); }, 20);
    } else {
      hideQContextStf();
    }
  }catch(e){ console.error(e); }
}

function hideQContextStf(){
  const box = document.getElementById('q-context-stf');
  if(!box) return;
  box.classList.remove('visible');
  // wait for transition to finish then remove from flow
  setTimeout(()=>{ if(box) box.style.display='none'; }, 240);
}

function qDoneStf(){
  const qm = document.getElementById('quiz-main-stf'); if(qm) qm.style.display='none';
  const done = document.getElementById('q-done-stf'); if(done) done.classList.add('show');
  const total = qRightStf + qWrongStf + qSkippedStf;
  const pct=total?Math.round((qRightStf/total)*100):0;
  const doneScore = document.getElementById('done-score-stf'); if(doneScore) doneScore.textContent=`${qRightStf} / ${total}`;
  const doneMsg = document.getElementById('done-msg-stf'); if(doneMsg) doneMsg.textContent=pct>=80?'Ausgezeichnet! Bene factum!':pct>=60?'Gut gemacht – weiter so!':'Noch etwas üben – du schaffst das!';
  const dsRight = document.getElementById('ds-right-stf'); if(dsRight) dsRight.textContent=qRightStf;
  const dsWrong = document.getElementById('ds-wrong-stf'); if(dsWrong) dsWrong.textContent=qWrongStf;
  const dsSkip = document.getElementById('ds-skip-stf'); if(dsSkip) dsSkip.textContent=qSkippedStf;
}

// initialize from lessonData (loads vocab, quiz and translation)
function initLesson(){
  // reload lesson data snapshot
  lessonData = JSON.parse(JSON.stringify(lessons[currentLessonKey]));
  // copy into globals used by the UI
  vocabData = lessonData.vocabData || [];
  window.vocabData = vocabData;
  trChips = lessonData.trChips || [];
  sentenceBlanks = lessonData.sentenceBlanks || [];
  fullLatinSentences = lessonData.fullLatinSentences || [];
  blankLatin = lessonData.blankLatin || {};
  deLatMapping = lessonData.deLatMapping || [];
  contextMap = lessonData.contextMap || [];
  latinSegments = lessonData.latinSegments || [];

  // init chips and state
  shuffledChips = shuffle(trChips);
  trState = {};
  trSel = null;
  trSentenceIdx = 0;
  solvedSentences = {};
  const maxBlank = Math.max(0, ...(latinSegments.filter(s=>s.blank!==undefined).map(s=>s.blank)));
  for(let i=0;i<=maxBlank;i++){ trState[i]=null; }

  // wire up initial UI
  if(typeof buildVocabTable === 'function') buildVocabTable(vocabData);
  if(typeof qStart === 'function') qStart();
  if(typeof qStartStf === 'function') qStartStf();
  if(typeof trRender === 'function') trRender();
}

// initialize
initLesson();
// ensure tabs visible / default to first quiz (Deutsch)
if(typeof showTab === 'function') showTab('vquiz-de');