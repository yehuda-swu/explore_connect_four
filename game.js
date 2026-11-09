/*
  EXPLORE CONNECT FOUR
  Plain JavaScript, deliberately easy to edit on GitHub.
  See questions.js for the question data and styles.css for the design.
*/
(() => {
  'use strict';

  const CFG = window.EXPLORE_CONFIG;
  const DEMO = window.DEMO_QUESTIONS;
  const STORAGE_KEY = 'explore_connect_four_questions_v1';
  const PREF_KEY = 'explore_connect_four_settings_v1';
  const BACKUP_KEY = 'explore_connect_four_last_sheet_v1';
  const $ = (id) => document.getElementById(id);
  const qs = (selector) => document.querySelectorAll(selector);
  const state = {
    cols: 7, rows: 6, target: 4,
    board: [], gravity: Boolean(CFG.defaultGravity),
    currentTeam: 0, selection: null,
    questions: [...DEMO], queue: [], drawn: 0, cycle: 1,
    source: 'demo', active: true, winner: null, winningCells: [],
    history: [], moves: [], theme: CFG.defaultTheme,
    teamNames: [...CFG.teamNames], syncInProgress: false
  };
  let toastTimer = null;

  function safeRead(key) {
    try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
  }
  function safeWrite(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
  }
  function escapeForCSV(value) { return '"' + String(value ?? '').replace(/"/g, '""') + '"'; }
  function clean(value) {
    const text = String(value ?? '').replace(/<br\s*\/?\s*>/gi, '\n');
    return text.replace(/<[^>]*>/g, '').replace(/\r/g, '').trim();
  }
  function tidyQuestions(items) {
    const seen = new Set();
    return items.map(item => ({
      question: clean(item.question || item.prompt || ''),
      answer: clean(item.answer || '')
    })).filter(item => {
      const key = item.question.toLowerCase();
      if (!key || seen.has(key) || item.question.length > 4000) return false;
      seen.add(key);
      return true;
    });
  }
  function shuffle(input) {
    const result = [...input];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  function nextQuestion() {
    if (!state.questions.length) return null;
    if (!state.queue.length) {
      state.queue = shuffle(state.questions.map((_, i) => i));
      state.drawn = 0;
      state.cycle += 1;
    }
    state.drawn += 1;
    return state.questions[state.queue.pop()];
  }
  function replaceBank(questions, source, saveMode) {
    const cleaned = tidyQuestions(questions);
    if (!cleaned.length) throw new Error('No questions were found. Please check the format.');
    state.questions = cleaned;
    state.source = source;
    state.queue = shuffle(cleaned.map((_, i) => i));
    state.cycle = 1;
    state.drawn = 0;
    if (saveMode === 'local') safeWrite(STORAGE_KEY, { questions: cleaned });
    if (saveMode === 'sheet') {
      safeWrite(BACKUP_KEY, { questions: cleaned });
      try { localStorage.removeItem(STORAGE_KEY); } catch {}
    }
    updateQuestionPanel();
    return cleaned.length;
  }
  function updateQuestionPanel() {
    $('questionCount').textContent = state.questions.length.toString();
    const label = $('sourceBadge');
    const desc = $('sourceDescription');
    label.classList.remove('loaded', 'warning');
    if (state.syncInProgress) {
      label.innerHTML = '<span class="source-dot"></span> SYNCING SHEET';
      desc.textContent = 'Checking the published Google Sheet for questions.';
    } else if (state.source === 'sheet') {
      label.classList.add('loaded');
      label.innerHTML = '<span class="source-dot"></span> GOOGLE SHEET LOADED';
      desc.textContent = 'Questions loaded from your published Explore spreadsheet.';
    } else if (state.source === 'local') {
      label.classList.add('loaded');
      label.innerHTML = '<span class="source-dot"></span> YOUR EDITED QUESTIONS';
      desc.textContent = 'Your custom question bank is saved in this browser.';
    } else if (state.source === 'backup') {
      label.classList.add('warning');
      label.innerHTML = '<span class="source-dot"></span> SAVED SHEET COPY';
      desc.textContent = 'Showing the last questions successfully loaded from your sheet.';
    } else {
      label.classList.add('warning');
      label.innerHTML = '<span class="source-dot"></span> DEMO QUESTIONS';
      desc.textContent = 'Sample questions only. Sync your Google Sheet or import its CSV.';
    }
  }

  function updateTheme() {
    document.body.dataset.theme = state.theme;
    $('themeText').textContent = state.theme === 'night' ? 'Light mode' : 'Dark mode';
    $('themeButton').setAttribute('aria-label', state.theme === 'night' ? 'Switch to light mode' : 'Switch to dark mode');
  }
  function updateNames() {
    for (let i = 0; i < 2; i++) {
      $('teamLabel' + i).textContent = state.teamNames[i];
      $('awardLabel' + i).textContent = state.teamNames[i];
    }
  }
  function getTarget() { return Math.min(4, state.cols, state.rows); }
  function createEmptyBoard() { return Array.from({ length: state.rows }, () => Array(state.cols).fill(null)); }
  function countOwned(team) { return state.board.flat().filter(item => item === team).length; }
  function recordHistory() {
    state.history.push({
      board: state.board.map(row => [...row]),
      currentTeam: state.currentTeam,
      winner: state.winner,
      winningCells: state.winningCells.map(item => [...item]),
      moves: state.moves.map(move => ({ ...move })),
      active: state.active
    });
    if (state.history.length > 200) state.history.shift();
  }
  function startGame(size = CFG.defaultBoard, skipConfirm = false) {
    const currentlyPlayed = state.board.flat().some(cell => cell !== null);
    if (!skipConfirm && currentlyPlayed && !window.confirm('Start a new game? The current board will be cleared.')) return false;
    const [cols, rows] = size.split('x').map(Number);
    state.cols = cols;
    state.rows = rows;
    state.target = getTarget();
    state.board = createEmptyBoard();
    state.currentTeam = 0;
    state.selection = null;
    state.active = true;
    state.winner = null;
    state.winningCells = [];
    state.history = [];
    state.moves = [];
    $('winBanner').hidden = true;
    $('boardSize').value = size;
    $('gravityToggle').checked = state.gravity;
    savePreferences();
    closeModal('questionModal');
    render();
    return true;
  }
  function savePreferences() {
    safeWrite(PREF_KEY, { size: state.cols + 'x' + state.rows, gravity: state.gravity, theme: state.theme });
  }
  function canSelect(r, c) {
    if (!state.active || state.board[r][c] !== null) return false;
    if (!state.gravity) return true;
    for (let below = r + 1; below < state.rows; below++) if (state.board[below][c] === null) return false;
    return true;
  }
  function findLowestAvailable(c) {
    for (let r = state.rows - 1; r >= 0; r--) if (state.board[r][c] === null) return r;
    return -1;
  }
  function coordinate(r, c) { return String.fromCharCode(65 + c) + (r + 1); }
  function render() {
    $('boardDescription').textContent = state.cols + ' COLUMNS / ' + state.rows + ' ROWS';
    $('boardFooterText').textContent = state.gravity ? 'SELECT A COLUMN TO DROP A PIECE' : 'SELECT ANY OPEN SQUARE';
    $('movesCount').textContent = String(state.moves.length).padStart(2, '0') + ' MOVES PLAYED';
    const columnLabels = $('columnLetters');
    columnLabels.textContent = '';
    columnLabels.style.gridTemplateColumns = `repeat(${state.cols}, minmax(0, 1fr))`;
    for (let c = 0; c < state.cols; c++) {
      const span = document.createElement('span');
      span.textContent = String.fromCharCode(65 + c);
      columnLabels.append(span);
    }
    const grid = $('gameGrid');
    grid.replaceChildren();
    grid.style.gridTemplateColumns = `repeat(${state.cols}, minmax(0, 1fr))`;
    const winningSet = new Set(state.winningCells.map(([r,c]) => r + ':' + c));
    for (let r = 0; r < state.rows; r++) for (let c = 0; c < state.cols; c++) {
      const cell = document.createElement('button');
      const value = state.board[r][c];
      const isOwned = value !== null;
      const clickable = state.active && !isOwned && (!state.gravity || findLowestAvailable(c) >= 0);
      cell.className = 'cell' + (isOwned ? ' claimed ' + (value === 0 ? 'blue' : 'orange') : '');
      if (winningSet.has(r + ':' + c)) cell.classList.add('winning');
      const slot = document.createElement('span');
      slot.className = 'cell-disc';
      cell.append(slot);
      cell.disabled = !clickable;
      const coord = coordinate(r, c);
      cell.setAttribute('aria-label', isOwned ? `${coord}: ${state.teamNames[value]}` : `${coord}: available`);
      cell.title = isOwned ? `${coord} · ${state.teamNames[value]}` : `Choose ${state.gravity ? 'column ' + String.fromCharCode(65+c) : coord}`;
      cell.addEventListener('click', () => chooseSquare(r, c));
      grid.append(cell);
    }
    for (let team = 0; team < 2; team++) {
      $('teamScore' + team).textContent = String(countOwned(team)).padStart(2, '0');
      $('teamCard' + team).classList.toggle('active', state.currentTeam === team && state.winner === null);
      $('turnChip' + team).hidden = state.currentTeam !== team || state.winner !== null;
    }
    $('turnMessage').textContent = state.winner !== null
      ? state.teamNames[state.winner] + ' connected ' + state.target + '!'
      : state.active ? state.teamNames[state.currentTeam] + ', choose your square.' : 'The board is full.';
    $('undoButton').disabled = !state.history.length;
  }
  function chooseSquare(r, c) {
    if (!state.active) return;
    if (state.gravity) r = findLowestAvailable(c);
    if (r < 0 || !canSelect(r, c)) return;
    state.selection = { r, c, item: nextQuestion() };
    if (!state.selection.item) { showToast('Import some questions to begin.'); openEditor(); return; }
    presentQuestion();
  }
  function presentQuestion() {
    if (!state.selection) return;
    const { r, c, item } = state.selection;
    $('promptKicker').textContent = `QUESTION ${String(state.drawn).padStart(2, '0')} · SQUARE ${coordinate(r,c)}`;
    $('questionTitle').textContent = item.question;
    $('answerText').textContent = item.answer || 'No suggested answer has been provided. The teacher makes the decision.';
    $('answerPanel').hidden = true;
    $('revealButton').textContent = '◉  Reveal answer';
    $('revealButton').disabled = false;
    openModal('questionModal');
  }
  function revealAnswer() {
    $('answerPanel').hidden = false;
    $('revealButton').textContent = '✓  Answer revealed';
    $('revealButton').disabled = true;
  }
  function checkWinner(board, team) {
    const directions = [[0,1],[1,0],[1,1],[1,-1]];
    for (let r=0; r<state.rows; r++) for (let c=0; c<state.cols; c++) {
      if (board[r][c] !== team) continue;
      for (const [dr,dc] of directions) {
        const positions = [];
        for (let step=0;step<state.target;step++) {
          const rr=r+step*dr,cc=c+step*dc;
          if (rr<0||rr>=state.rows||cc<0||cc>=state.cols||board[rr][cc]!==team) break;
          positions.push([rr,cc]);
        }
        if (positions.length === state.target) return positions;
      }
    }
    return null;
  }
  function awardSquare(team) {
    if (!state.selection || !state.active) return;
    const {r,c} = state.selection;
    if (state.board[r][c] !== null) return;
    recordHistory();
    state.board[r][c] = team;
    state.moves.push({team, square:coordinate(r,c)});
    const win = checkWinner(state.board,team);
    if (win) {
      state.winner = team;
      state.winningCells = win;
      state.active = false;
      $('winText').textContent = `${state.teamNames[team]} WINS!`;
      $('winBanner').hidden = false;
    } else if (state.board.flat().every(value => value !== null)) {
      state.active = false;
      showToast('It is a draw. Every square is claimed.');
    } else {
      state.currentTeam = team === 0 ? 1 : 0;
    }
    state.selection = null;
    closeModal('questionModal');
    render();
  }
  function skipQuestion() {
    if (!state.selection) return;
    state.currentTeam = state.currentTeam === 0 ? 1 : 0;
    state.selection = null;
    closeModal('questionModal');
    render();
    showToast('Square left open. Next team to choose.');
  }
  function undoMove() {
    if (!state.history.length) return;
    const last = state.history.pop();
    state.board = last.board;
    state.currentTeam = last.currentTeam;
    state.winner = last.winner;
    state.winningCells = last.winningCells;
    state.moves = last.moves;
    state.active = last.active;
    $('winBanner').hidden = true;
    render();
    showToast('Last move undone.');
  }
  function showToast(message) {
    $('toast').textContent = message;
    $('toast').classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $('toast').classList.remove('show'), 4200);
  }
  function openModal(id) {
    $(id).classList.add('open');
    $(id).setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    $(id).querySelector('button')?.focus();
  }
  function closeModal(id) {
    $(id).classList.remove('open');
    $(id).setAttribute('aria-hidden', 'true');
    if (!document.querySelector('.modal-backdrop.open')) document.body.style.overflow = '';
  }
  function openEditor() {
    $('editorText').value = state.questions.map(item => item.question + (item.answer ? ' || ' + item.answer : '')).join('\n');
    $('editorAlert').hidden = true;
    $('sheetSourceHint').textContent = state.source === 'sheet' ? 'Currently using questions from the published sheet.' : 'The original published sheet is configured in questions.js.';
    countEditorLines();
    openModal('editorModal');
  }
  function parseEditorText(text) {
    return tidyQuestions(String(text).split(/\r?\n/).map(line => {
      const point = line.indexOf('||');
      return point === -1 ? {question: line.trim(), answer:''} : {question:line.slice(0,point).trim(),answer:line.slice(point+2).trim()};
    }));
  }
  function countEditorLines() {
    const parsed = parseEditorText($('editorText').value);
    $('editorLineCount').textContent = parsed.length + (parsed.length === 1 ? ' question' : ' questions');
  }
  function editorMessage(text) {
    $('editorAlert').hidden = false;
    $('editorAlert').textContent = text;
  }
  function saveEditor() {
    const items = parseEditorText($('editorText').value);
    if (items.length === 0) return editorMessage('Please add at least one question before saving.');
    replaceBank(items, 'local', 'local');
    closeModal('editorModal');
    showToast(`${items.length} questions saved on this device. For permanent changes, edit questions.js on GitHub.`);
  }
  function downloadCSV() {
    const items = parseEditorText($('editorText').value);
    if (!items.length) return editorMessage('There are no questions to export.');
    const rows = [['Prompt','Answer'], ...items.map(x=>[x.question,x.answer])];
    const csv = '\uFEFF' + rows.map(row=>row.map(escapeForCSV).join(',')).join('\r\n');
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'explore_questions.csv';
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
  function parseCSV(text, delimiter = ',') {
    const rows=[];let row=[],cell='',quoted=false;
    for(let i=0;i<text.length;i++) {
      const char=text[i];
      if(char==='"') {if(quoted&&text[i+1]==='"') {cell+='"';i++;}else quoted=!quoted;}
      else if(char===delimiter&&!quoted) {row.push(cell);cell='';}
      else if((char==='\n'||char==='\r')&&!quoted) {
        if(char==='\r'&&text[i+1]==='\n')i++;
        row.push(cell);rows.push(row);row=[];cell='';
      }else cell+=char;
    }
    if(cell!==''||row.length){row.push(cell);rows.push(row);}
    return rows;
  }
  function parseTable(rows) {
    const matrix = rows.map(row => Array.isArray(row) ? row.map(clean) : []);
    const promptHeader = /^(prompts?|questions?|terms?|clues?|front|side\s*1)$/i;
    const answerHeader = /^(answers?|responses?|back|side\s*2)$/i;
    const candidates=[];
    for(let i=0;i<Math.min(matrix.length,45);i++) {
      const row=matrix[i];
      for(let c=0;c<row.length;c++) {
        if(!promptHeader.test(row[c]))continue;
        let a=row.findIndex((v,j)=>j!==c&&answerHeader.test(v));
        if(a<0)a=c+1;
        const result=[];
        for(let r=i+1;r<matrix.length;r++){
          const question=matrix[r][c]||'';
          const answer=matrix[r][a]||'';
          if(!question||promptHeader.test(question))continue;
          if(/^(get the link here|Flippity(?:\.net)?|template version|click here|options|share|publish to web)$/i.test(question))continue;
          result.push({question,answer});
        }
        candidates.push(result);
      }
    }
    if(candidates.length) {
      candidates.sort((a,b)=>b.length-a.length);
      const result=tidyQuestions(candidates[0]);
      if(result.length) return result;
    }
    // The older Flippity template sometimes uses a prompt column without
    // a recognised header. Do not silently import its settings as questions.
    // A heuristic is only accepted if enough entries are found.
    const skip = /^(options|gravity|size|title|template|flippity|prompt|answer|connecto|spreadsheet|source|yes|no|board|light|dark|reset|7x6|6x5|5x4|4x4|3x3)/i;
    let best=[];
    for(let c=0;c<Math.min(4,Math.max(...matrix.map(r=>r.length),0));c++) {
      const entries=matrix.slice(2).map(r=>({question:r[c]||'',answer:r[c+1]||''}))
        .filter(x=>x.question.length>=10&&!skip.test(x.question)&&!x.question.includes('docs.google.com/spreadsheets'));
      if(entries.length>best.length)best=entries;
    }
    return best.length>=8?tidyQuestions(best):[];
  }
  function importRows(rows) {
    const data = parseTable(rows);
    if (!data.length) throw new Error('The file did not contain recognised Prompt and Answer columns. Please export the question tab as CSV.');
    $('editorText').value = data.map(item=>item.question + (item.answer ? ' || ' + item.answer : '')).join('\n');
    countEditorLines();
    editorMessage(`Imported ${data.length} questions into the editor. Select Save question bank to use them.`);
  }
  async function importCSVFile(file) {
    if (!file) return;
    try {
      const text = await file.text();
      const lines = parseCSV(text.replace(/^\uFEFF/, ''), file.name.toLowerCase().endsWith('.tsv')?'\t':',');
      importRows(lines);
    } catch(error) { editorMessage(error.message); }
  }
  async function fetchWithTimeout(url, milliseconds) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), milliseconds);
    try {
      const res = await fetch(url, {signal:controller.signal,redirect:'follow',cache:'no-store'});
      if(!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } finally { clearTimeout(timer); }
  }
  function jsonpGviz(sheetId, timeoutMs = 7000) {
    return new Promise((resolve,reject)=>{
      const callbackName='__exploreSheet_'+Math.random().toString(36).slice(2);
      const src = 'https://docs.google.com/spreadsheets/d/'+encodeURIComponent(sheetId)+'/gviz/tq?headers=0&tqx='+encodeURIComponent('out:json;responseHandler:'+callbackName);
      const script=document.createElement('script');
      let finished=false;
      const cleanup=()=>{clearTimeout(timer);script.remove();delete window[callbackName];};
      const done=(error,value)=>{if(finished)return;finished=true;cleanup();error?reject(error):resolve(value);};
      window[callbackName]=(response)=>{
        if(response.status==='error')return done(new Error(response.errors?.[0]?.message||'Google returned a sheet error.'));
        const rows=(response.table?.rows||[]).map(r=>(r.c||[]).map(c=>c?(c.f??c.v??''):''));
        done(null,rows);
      };
      script.onerror=()=>done(new Error('The sheet did not allow a Google data connection.'));
      const timer=setTimeout(()=>done(new Error('The Google Sheet connection timed out.')),timeoutMs);
      script.src=src;
      document.head.appendChild(script);
    });
  }
  async function getPublishedQuestions() {
    const csvUrl=CFG.publishedUrl.replace(/\/pubhtml(?:\?.*)?$/, '/pub?output=csv');
    let csvError;
    try {
      const csv=await fetchWithTimeout(csvUrl,4200);
      const parsed=parseTable(parseCSV(csv.replace(/^\uFEFF/,'')));
      if(parsed.length)return parsed;
      csvError=new Error('The published CSV did not contain a recognised question table.');
    } catch(error) {csvError=error;}
    try {
      const rows=await jsonpGviz(CFG.sheetId);
      const parsed=parseTable(rows);
      if(parsed.length)return parsed;
      throw new Error('The original sheet did not contain recognised prompt columns.');
    } catch(error) {
      throw new Error(`Could not read the sheet automatically. ${error.message} Export its question tab to CSV and use Import CSV. (${csvError?.message||'CSV unavailable'})`);
    }
  }
  async function syncSheet(fromEditor = false, automatic = false) {
    if(state.syncInProgress)return;
    if(!automatic && state.source==='local' && !window.confirm('Replace the questions saved in this browser with those from the published Google Sheet?'))return;
    state.syncInProgress = true;
    updateQuestionPanel();
    $('syncButton').disabled=true;
    $('editorSyncButton').disabled=true;
    try {
      const questions=await getPublishedQuestions();
      const count=replaceBank(questions,'sheet','sheet');
      if(fromEditor) {
        $('editorText').value=questions.map(item=>item.question+(item.answer?' || '+item.answer:'')).join('\n');
        countEditorLines();
        editorMessage(`${count} questions loaded and saved from Google Sheet.`);
      }
      showToast(`${count} questions loaded from your published Google Sheet.`);
    }catch(error) {
      if(fromEditor)editorMessage(error.message);
      else if(!automatic)showToast('Unable to sync the sheet. Open Edit question bank and import a CSV instead.');
      if(automatic && state.source==='demo') console.info('Explore Connect Four:',error.message);
    }finally {
      state.syncInProgress=false;
      $('syncButton').disabled=false;
      $('editorSyncButton').disabled=false;
      updateQuestionPanel();
    }
  }
  function wireEvents() {
    $('boardSize').addEventListener('change',e=>{
      const previous=state.cols+'x'+state.rows;
      if(!startGame(e.target.value))e.target.value=previous;
    });
    $('gravityToggle').addEventListener('change',e=>{state.gravity=e.target.checked;savePreferences();render();showToast(state.gravity?'Gravity enabled. Choose a column.':'Gravity disabled. Choose any open square.');});
    $('resetButton').addEventListener('click',()=>startGame(state.cols+'x'+state.rows));
    $('undoButton').addEventListener('click',undoMove);
    $('helpButton').addEventListener('click',()=>openModal('helpModal'));
    $('themeButton').addEventListener('click',()=>{state.theme=state.theme==='night'?'day':'night';updateTheme();savePreferences();});
    $('editButton').addEventListener('click',openEditor);
    $('syncButton').addEventListener('click',()=>syncSheet(false,false));
    $('editorSyncButton').addEventListener('click',()=>syncSheet(true,false));
    $('revealButton').addEventListener('click',revealAnswer);
    $('nextQuestionButton').addEventListener('click',()=>{if(state.selection){state.selection.item=nextQuestion();presentQuestion();}});
    $('awardButton0').addEventListener('click',()=>awardSquare(0));
    $('awardButton1').addEventListener('click',()=>awardSquare(1));
    $('skipButton').addEventListener('click',skipQuestion);
    $('editorText').addEventListener('input',countEditorLines);
    $('saveQuestionsButton').addEventListener('click',saveEditor);
    $('csvImportButton').addEventListener('click',()=>$('csvFileInput').click());
    $('csvFileInput').addEventListener('change',e=>{importCSVFile(e.target.files?.[0]);e.target.value='';});
    $('exportButton').addEventListener('click',downloadCSV);
    $('restoreDemoButton').addEventListener('click',()=>{
      if(!window.confirm('Show the example question bank in the editor? Save afterwards to use it.'))return;
      $('editorText').value=DEMO.map(q=>q.question+' || '+q.answer).join('\n');
      countEditorLines();
      editorMessage('Example questions loaded into the editor. They are not from your original spreadsheet.');
    });
    $('winRestartButton').addEventListener('click',()=>startGame(state.cols+'x'+state.rows,true));
    $('winDismissButton').addEventListener('click',()=>$('winBanner').hidden=true);
    qs('[data-close]').forEach(button=>button.addEventListener('click',()=>{
      const id=button.dataset.close;
      if(id==='questionModal')state.selection=null;
      closeModal(id);
    }));
    qs('.modal-backdrop').forEach(backdrop=>backdrop.addEventListener('click',event=>{
      if(event.target===backdrop){if(backdrop.id==='questionModal')state.selection=null;closeModal(backdrop.id);}
    }));
    document.addEventListener('keydown',e=>{
      if(e.key==='Escape'){
        qs('.modal-backdrop.open').forEach(el=>{
          if(el.id==='questionModal')state.selection=null;
          closeModal(el.id);
        });
      }
    });
  }
  function init() {
    const prefs=safeRead(PREF_KEY)||{};
    state.theme=['day','night'].includes(prefs.theme)?prefs.theme:CFG.defaultTheme;
    state.gravity=typeof prefs.gravity==='boolean'?prefs.gravity:CFG.defaultGravity;
    updateTheme();updateNames();wireEvents();
    const local=safeRead(STORAGE_KEY);
    const lastSheet=safeRead(BACKUP_KEY);
    if(local?.questions?.length) replaceBank(local.questions,'local');
    else if(lastSheet?.questions?.length) replaceBank(lastSheet.questions,'backup');
    else replaceBank(DEMO,'demo');
    startGame(/^(7x6|6x5|5x4|4x4|3x3)$/.test(prefs.size)?prefs.size:CFG.defaultBoard,true);
    if(!local?.questions?.length) syncSheet(false,true);
  }
  init();
})();
