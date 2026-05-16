'use strict';
/* ══════════════════════════════════════════════════════
   STUDYOS
   © Indraneel Mandal
   ML-powered academic workspace
══════════════════════════════════════════════════════ */

/* ── STORAGE ─────────────────────────────────────── */
const LS = {
  get(k, d = null) { try { const v = localStorage.getItem(k); return v != null ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};
const sv = (k, v) => { st[k] = v; LS.set('sos2_' + k, v); };

/* ── STATE ───────────────────────────────────────── */
const st = {
  name:       LS.get('sos2_name', ''),
  streak:     LS.get('sos2_streak', 0),
  last:       LS.get('sos2_last', ''),
  exam:       LS.get('sos2_exam', null),
  goals:      LS.get('sos2_goals', []),
  notes:      LS.get('sos2_notes', []),
  journal:    LS.get('sos2_journal', {}),
  papers:     LS.get('sos2_papers', []),
  tasks:      LS.get('sos2_tasks', []),
  sessions:   LS.get('sos2_sessions', 0),
  todaySess:  LS.get('sos2_todaySess', 0),
  focusMins:  LS.get('sos2_focusMins', 0),
  perfHist:   LS.get('sos2_perfHist', []),
  schedule:   LS.get('sos2_schedule', {}),
  theme:      LS.get('sos2_theme', 'dark'),
  pinnedGoal: LS.get('sos2_pinnedGoal', null),
  sec: 'dashboard',
};

/* ── UTILS ───────────────────────────────────────── */
const esc = s => { const d = document.createElement('div'); d.textContent = String(s ?? ''); return d.innerHTML; };
const pad = n => String(n).padStart(2, '0');
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
const todayStr = () => new Date().toDateString();
const isoDay = () => new Date().toISOString().split('T')[0];
const $ = id => document.getElementById(id);

const COLORS = {
  blue: '#2997ff',
  green: '#30d158',
  amber: '#ffd60a',
  red: '#ff453a',
  purple: '#bf5af2',
  cyan: '#5ac8fa'
};
const COLOR_DIMS = {
  blue: 'rgba(41,151,255,.10)',
  green: 'rgba(48,209,88,.10)',
  amber: 'rgba(255,214,10,.10)',
  red: 'rgba(255,69,58,.10)',
  purple: 'rgba(191,90,242,.10)',
  cyan: 'rgba(90,200,250,.10)'
};
const COLOR_BDS = {
  blue: 'rgba(41,151,255,.22)',
  green: 'rgba(48,209,88,.22)',
  amber: 'rgba(255,214,10,.22)',
  red: 'rgba(255,69,58,.22)',
  purple: 'rgba(191,90,242,.22)',
  cyan: 'rgba(90,200,250,.22)'
};

/* ── TOAST ───────────────────────────────────────── */
const TCOLS = { a: '#2997ff', g: '#30d158', y: '#ffd60a', r: '#ff453a', p: '#bf5af2', c: '#5ac8fa' };
function toast(msg, c = 'a') {
  const tc = $('toastContainer');
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<span class="toast-dot" style="background:${TCOLS[c] || TCOLS.a};color:${TCOLS[c] || TCOLS.a}"></span><span>${esc(msg)}</span>`;
  tc.appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 280); }, 3600);
}

/* ── CONFETTI ────────────────────────────────────── */
function confetti() {
  const cols = ['#FFFFFF', '#22C55E', '#EAB308', '#EF4444', '#A855F7', '#06B6D4'];
  for (let i = 0; i < 70; i++) {
    setTimeout(() => {
      const p = document.createElement('div');
      p.className = 'confetti-piece';
      p.style.cssText = `left:${Math.random() * 100}vw;background:${cols[Math.floor(Math.random() * cols.length)]};width:${5 + Math.random() * 7}px;height:${5 + Math.random() * 7}px;border-radius:${Math.random() < .4 ? '50%' : '2px'};animation-duration:${1.6 + Math.random() * 2.2}s;animation-delay:${Math.random() * .35}s;`;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 5000);
    }, i * 8);
  }
}

/* ── THEME ───────────────────────────────────────── */
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  sv('theme', t);
  const icon = $('themeIcon');
  if (icon) icon.innerHTML = t === 'dark'
    ? '<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>'
    : '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
}
$('themeToggle').onclick = () => {
  applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  setTimeout(() => {
    if (st.sec === 'goals') renderPerfDashboard();
    if (st.sec === 'journal') renderMoodViz();
  }, 80);
};

/* ── QUOTES ──────────────────────────────────────── */
const QUOTES = [
  { t: "The secret of getting ahead is getting started.", a: "Mark Twain" },
  { t: "It always seems impossible until it's done.", a: "Nelson Mandela" },
  { t: "An investment in knowledge pays the best interest.", a: "Benjamin Franklin" },
  { t: "You don't rise to your goals. You fall to your systems.", a: "James Clear" },
  { t: "Study hard what interests you most in the most undisciplined way.", a: "Richard Feynman" },
  { t: "Discipline is the bridge between goals and accomplishment.", a: "Jim Rohn" },
  { t: "Small daily improvements over time lead to stunning results.", a: "Robin Sharma" },
  { t: "Do something today that your future self will thank you for.", a: "Sean Patrick Flanery" },
  { t: "The expert in anything was once a beginner.", a: "Helen Hayes" },
  { t: "Education is not the filling of a pail, but the lighting of a fire.", a: "W. B. Yeats" },
  { t: "Believe you can and you're halfway there.", a: "Theodore Roosevelt" },
  { t: "Your future is created by what you do today, not tomorrow.", a: "Robert Kiyosaki" },
  { t: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", a: "Will Durant" },
  { t: "The beautiful thing about learning is that nobody can take it away from you.", a: "B. B. King" },
  { t: "Simplicity is the ultimate sophistication.", a: "Leonardo da Vinci" },
];
function renderQuote() {
  const d = new Date();
  const idx = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000) % QUOTES.length;
  const q = QUOTES[idx];
  const qt = $('quoteText'), qa = $('quoteAuthor');
  if (qt) qt.textContent = q.t;
  if (qa) qa.textContent = '— ' + q.a;
}

/* ── CLOCK ───────────────────────────────────────── */
const DAYS_S = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS_S = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function tickClock() {
  const n = new Date(), el = $('clock');
  if (el) el.textContent = `${pad(n.getHours())}:${pad(n.getMinutes())}:${pad(n.getSeconds())}`;
}
setInterval(tickClock, 1000); tickClock();

/* ── GREETING ────────────────────────────────────── */
function setGreeting(name) {
  const h = new Date().getHours();
  const g = h < 5 ? 'Good night' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : h < 21 ? 'Good evening' : 'Good night';
  const el = $('tbGreet'); if (el) el.textContent = `${g}, ${name}`;
  const dt = $('dashTitle'); if (dt) dt.textContent = `Hello, ${name}`;
  const tod = $('todayDate'); if (tod) tod.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const jdt = $('journalDateLabel'); if (jdt) jdt.textContent = `Today — ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`;
  const sbMeta = $('sbMeta'); if (sbMeta) sbMeta.textContent = `Active · ${DAYS_S[new Date().getDay()]}`;
}

/* ── STREAK ──────────────────────────────────────── */
function checkStreak() {
  const t = todayStr(), y = new Date(Date.now() - 86400000).toDateString();
  if (st.last === t) return;
  sv('streak', st.last === y ? st.streak + 1 : 1);
  sv('last', t);
}
function updateStreakUI() {
  const n = $('tbStreakNum'); if (n) n.textContent = st.streak;
}
setInterval(() => { if (st.last !== todayStr()) { checkStreak(); updateStreakUI(); } }, 60000);

/* ── COUNTDOWN ───────────────────────────────────── */
let cdTimer = null;
function startCD() {
  if (cdTimer) clearInterval(cdTimer);
  cdTimer = setInterval(updateCD, 1000); updateCD();
}
function updateCD() {
  const set = (id, v) => { const el = $(id); if (el) el.textContent = v; };
  if (!st.exam?.date) { set('cdName', 'No exam set'); ['cdD', 'cdH', 'cdM', 'cdS'].forEach(i => set(i, '--')); return; }
  let diff = new Date(st.exam.date) - new Date();
  set('cdName', st.exam.name || 'Exam Countdown');
  const eb = $('examBadge');
  if (diff <= 0) {
    ['cdD', 'cdH', 'cdM', 'cdS'].forEach(i => set(i, '00'));
    if (eb) { eb.textContent = 'Exam Day'; eb.style.display = ''; } return;
  }
  const dd = Math.floor(diff / 86400000); diff -= dd * 86400000;
  const hh = Math.floor(diff / 3600000); diff -= hh * 3600000;
  const mm = Math.floor(diff / 60000); diff -= mm * 60000;
  set('cdD', pad(dd)); set('cdH', pad(hh)); set('cdM', pad(mm)); set('cdS', pad(Math.floor(diff / 1000)));
  if (eb) { eb.textContent = `${st.exam.name || 'Exam'} · ${dd}d`; eb.style.display = ''; }
}

/* ── NAVIGATION ──────────────────────────────────── */
function nav(sec) {
  document.querySelectorAll('.nav-item').forEach(i => i.classList.toggle('active', i.dataset.pane === sec));
  document.querySelectorAll('.pane').forEach(p => p.classList.toggle('active', p.id === 'p-' + sec));
  st.sec = sec;
  if (window.innerWidth <= 700) { $('sidebar').classList.remove('open'); $('mobOverlay').style.display = 'none'; }
  if (sec === 'dashboard') renderDashboard();
  if (sec === 'studyplan') { renderTasks(); renderSchedule(); }
  if (sec === 'goals') { renderGoals(); renderPerfDashboard(); }
  if (sec === 'notes') renderNotes();
  if (sec === 'papers') { renderSATPapers(); renderRefSheets(); renderPapers(); }
  if (sec === 'practice') { renderPracticeRefs(); }
  if (sec === 'journal') { renderJournal(); renderMoodViz(); }
  if (sec === 'focus') updatePomoUI();  setTimeout(initMotionLayer, 60);
}

document.querySelectorAll('.nav-item[data-pane]').forEach(i => i.addEventListener('click', () => nav(i.dataset.pane)));
$('mobToggle').onclick = () => { const o = !$('sidebar').classList.contains('open'); $('sidebar').classList.toggle('open', o); $('mobOverlay').style.display = o ? 'block' : 'none'; };
$('mobOverlay').onclick = () => { $('sidebar').classList.remove('open'); $('mobOverlay').style.display = 'none'; };

/* ── MODALS ──────────────────────────────────────── */
function openModal(id) { $(id).classList.add('on'); }
function closeModal(id) { $(id).classList.remove('on'); }
document.querySelectorAll('.modal-overlay').forEach(m => m.addEventListener('click', e => { if (e.target === m) m.classList.remove('on'); }));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.on').forEach(m => m.classList.remove('on'));
    const vm = $('noteViewModal'); if (vm) vm.classList.remove('on');
  }
});

/* ══════════════════════════════════════════════════
   DASHBOARD
══════════════════════════════════════════════════ */
function updateStatsUI() {
  const s = (id, v) => { const el = $(id); if (el) el.textContent = v; };
  s('statSessions', st.sessions);
  s('statTasks', st.tasks.filter(t => t.done).length);
  s('statNotes', st.notes.length);
  s('statTests', st.perfHist.length);
  const cnt = st.tasks.filter(t => !t.done).length;
  const b = $('taskBadge'); if (b) { b.textContent = cnt; b.style.display = cnt > 0 ? '' : 'none'; }
}
function renderDashboard() {
  updateStatsUI();
  renderDashTasks();
  renderDashScores();
  renderDashInsights();
  renderQuote();
}
function renderDashTasks() {
  const el = $('dashTasks'); if (!el) return;
  const today = todayStr();
  const arr = st.tasks.filter(t => !t.done && (!t.due || new Date(t.due).toDateString() === today || new Date(t.due) < new Date())).slice(0, 4);
  if (!arr.length) { el.innerHTML = `<div style="font-family:var(--font);font-style:italic;font-size:.85rem;color:var(--t4);padding:10px 0">All clear for today.</div>`; return; }
  el.innerHTML = arr.map(t => `<div class="task-mini-item"><div class="task-mini-check${t.done ? ' done' : ''}" onclick="toggleTask('${t.id}')"></div><span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(t.text)}</span>${t.subject ? `<span class="tag tag-a">${esc(t.subject)}</span>` : ''}</div>`).join('');
}
function renderDashScores() {
  const el = $('dashScores'); if (!el) return;
  const scores = [...st.perfHist].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
  if (!scores.length) {
    el.innerHTML = `<div style="font-family:var(--font);font-style:italic;font-size:.85rem;color:var(--t4);padding:14px 0;text-align:center">No scores logged yet.</div>`;
    return;
  }
  el.innerHTML = scores.map(h => {
    const gr = getGrade(h.pct);
    const col = COLORS[gr.c] || COLORS.blue;
    const dateStr = new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `<div class="score-item"><span class="score-subj">${esc(h.subject)}</span><span class="score-date">${dateStr}</span><span class="score-pct" style="color:${col}">${h.pct}%</span></div>`;
  }).join('');
  el.style.cssText = 'display:flex;flex-direction:column;gap:8px';
}

function renderDashInsights() {
  const el = $('dashInsights'); if (!el) return;
  if (st.perfHist.length < 3) { el.innerHTML = ''; return; }

  const strengths = getSubjectStrengths();
  const weakest = strengths[0]; // sorted by avg ascending
  const strongest = strengths[strengths.length - 1];
  const totalAvg = Math.round(st.perfHist.reduce((a, h) => a + h.pct, 0) / st.perfHist.length);

  // Build recommendations
  const recs = [];
  if (weakest && weakest.avg < 60) recs.push(`<strong>${esc(weakest.name)}</strong> is your weakest subject at ${weakest.avg}%. Focus extra study time here.`);
  if (weakest && weakest.trend === 'declining') recs.push(`<strong>${esc(weakest.name)}</strong> scores are declining. Consider changing your study approach.`);
  if (strongest && strongest.trend === 'improving') recs.push(`<strong>${esc(strongest.name)}</strong> is trending upward. Your current methods are working well.`);
  if (totalAvg >= 80) recs.push('Your overall average is strong. Focus on consistency and tackling harder problems.');
  else if (totalAvg >= 60) recs.push('Solid foundation. Target your weakest areas for the biggest score gains.');
  else recs.push('Focus on fundamentals. Short daily sessions are more effective than long cramming.');

  // Predict overall trajectory
  const sorted = [...st.perfHist].sort((a, b) => new Date(a.date) - new Date(b.date));
  const reg = linearRegression(sorted.map((_, i) => i), sorted.map(h => h.pct));
  const predicted = Math.round(Math.min(100, Math.max(0, reg.slope * (sorted.length + 3) + reg.intercept)));
  const trendWord = reg.slope > 0.5 ? 'improving' : reg.slope < -0.5 ? 'declining' : 'stable';

  el.innerHTML = `<div class="glass-card" style="margin-top:20px">
    <div class="card-label"><span>Smart Insights</span><span class="card-label-meta">${st.perfHist.length} data points</span></div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px">
      <div class="tstat"><span class="tstat-val" style="color:var(--t1)">${totalAvg}%</span><span class="tstat-lbl">Overall Avg</span></div>
      <div class="tstat"><span class="tstat-val" style="color:${reg.slope > 0 ? 'var(--green)' : reg.slope < 0 ? 'var(--rose)' : 'var(--t2)'}">${trendWord}</span><span class="tstat-lbl">Trajectory</span></div>
      <div class="tstat"><span class="tstat-val" style="color:var(--purple)">${predicted}%</span><span class="tstat-lbl">Predicted Next</span></div>
    </div>
    <div style="display:flex;flex-direction:column;gap:8px">
      ${strengths.map(s => {
        const col = s.avg >= 80 ? 'var(--green)' : s.avg >= 60 ? 'var(--amber)' : 'var(--rose)';
        const tIcon = s.trend === 'improving' ? '+' : s.trend === 'declining' ? '-' : '=';
        return `<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:8px;background:var(--bg3);border:1px solid var(--bd)"><span style="flex:1;font-size:.82rem;font-weight:600;color:var(--t1)">${esc(s.name)}</span><span style="font-family:var(--mono);font-size:.70rem;font-weight:700;color:${col}">${s.avg}%</span><span style="font-family:var(--mono);font-size:.60rem;color:var(--t3)">${s.count} tests</span><span style="font-family:var(--mono);font-size:.70rem;font-weight:700;color:${s.trend === 'improving' ? 'var(--green)' : s.trend === 'declining' ? 'var(--rose)' : 'var(--t3)'}">${tIcon}</span></div>`;
      }).join('')}
    </div>
    <div style="margin-top:16px;padding-top:14px;border-top:1px solid var(--bd)">
      <div style="font-family:var(--mono);font-size:.48rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--t1);margin-bottom:8px">Recommendations</div>
      ${recs.map(r => `<div style="font-size:.82rem;color:var(--t2);line-height:1.6;padding:4px 0">${r}</div>`).join('')}
    </div>
  </div>`;
}

/* ══════════════════════════════════════════════════
   TASKS
══════════════════════════════════════════════════ */
let taskFilter = 'all';
function renderTasks(f) {
  if (f !== undefined) taskFilter = f;
  document.querySelectorAll('#taskChips .chip').forEach(c => c.classList.toggle('active', c.dataset.f === taskFilter));
  const el = $('taskList'); if (!el) return;
  const today = todayStr();
  let arr = [...st.tasks];
  if (taskFilter === 'today') arr = arr.filter(t => t.due && new Date(t.due).toDateString() === today);
  else if (taskFilter === 'pending') arr = arr.filter(t => !t.done);
  else if (taskFilter === 'done') arr = arr.filter(t => t.done);
  if (!arr.length) {
    el.innerHTML = `<div class="ai-empty" style="padding:40px 20px"><div class="ai-empty-glyph"></div><p>No tasks here yet.</p></div>`;
    return;
  }
  el.innerHTML = [...arr].reverse().map(t => {
    const pc = t.priority === 'high' ? COLORS.red : t.priority === 'medium' ? COLORS.amber : COLORS.green;
    return `<div class="task-item"><div class="task-check${t.done ? ' done' : ''}" onclick="toggleTask('${t.id}')"></div><div class="task-content"><div class="task-text${t.done ? ' done' : ''}">${esc(t.text)}</div><div class="task-meta">${t.subject ? `<span class="tag tag-a">${esc(t.subject)}</span>` : ''}${t.due ? `<span class="tag" style="background:var(--bg3);border-color:var(--bd);color:var(--t3)">${new Date(t.due).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>` : ''}</div></div><div class="task-prio" style="background:${pc}" title="${t.priority}"></div><div class="task-del" onclick="delTask('${t.id}')">&times;</div></div>`;
  }).join('');
}
$('taskChips').addEventListener('click', e => { const c = e.target.closest('.chip'); if (c) renderTasks(c.dataset.f); });
$('saveTaskBtn').onclick = () => {
  const text = $('taskText').value.trim();
  if (!text) { toast('Please enter a task', 'r'); return; }
  sv('tasks', [...st.tasks, { id: uid(), text, due: $('taskDue').value, priority: $('taskPriority').value, subject: $('taskSubject').value.trim(), done: false }]);
  closeModal('taskModal');
  ['taskText', 'taskDue', 'taskSubject'].forEach(id => { const el = $(id); if (el) el.value = ''; });
  renderTasks(); updateStatsUI(); toast('Task added', 'g');
};
function toggleTask(id) {
  sv('tasks', st.tasks.map(t => { if (t.id === id) return { ...t, done: !t.done }; return t; }));
  renderTasks(); renderDashTasks(); updateStatsUI();
}
function delTask(id) { sv('tasks', st.tasks.filter(t => t.id !== id)); renderTasks(); updateStatsUI(); }

/* ── EXAM + CALENDAR ─────────────────────────────── */
$('saveExamBtn').onclick = () => {
  const dt = $('exDate').value;
  if (!dt) { toast('Please select a date', 'r'); return; }
  const name = $('exName').value.trim();
  sv('exam', { name, date: dt });
  const msg = $('examSavedMsg');
  msg.textContent = `${name || 'Exam'} — ${new Date(dt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}`;
  msg.style.display = ''; startCD(); toast('Exam saved', 'g');
};
$('gcBtn').onclick = () => {
  const t = $('gcTitle').value.trim(), s = $('gcStart').value;
  if (!t || !s) { toast('Fill title and start time', 'r'); return; }
  const fmt = dt => dt.replace(/[-:]/g, '').replace('T', 'T').padEnd(15, '0');
  const url = new URL('https://calendar.google.com/calendar/render');
  url.searchParams.set('action', 'TEMPLATE'); url.searchParams.set('text', t);
  url.searchParams.set('dates', `${fmt(s)}/${fmt($('gcEnd').value || s)}`);
  window.open(url.toString(), '_blank'); toast('Opening Google Calendar', 'g');
};
function renderSchedule() {
  const el = $('scheduleGrid'); if (!el) return;
  const now = new Date(), nowH = now.getHours();
  const DOW = [1, 2, 3, 4, 5, 6, 0];
  const SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monday = new Date(now); const dow = now.getDay() === 0 ? 6 : now.getDay() - 1; monday.setDate(now.getDate() - dow);
  const weekDates = DOW.map((_, i) => { const d = new Date(monday); d.setDate(monday.getDate() + i); return d; });
  const SLOTS = [
    { l: '6 AM', h: 6 }, { l: '7 AM', h: 7 }, { l: '8 AM', h: 8 }, { l: '9 AM', h: 9 },
    { l: '10 AM', h: 10 }, { l: '11 AM', h: 11 }, { l: '12 PM', h: 12 }, { l: '1 PM', h: 13 },
    { l: '2 PM', h: 14 }, { l: '3 PM', h: 15 }, { l: '4 PM', h: 16 }, { l: '5 PM', h: 17 },
    { l: '6 PM', h: 18 }, { l: '7 PM', h: 19 }, { l: '8 PM', h: 20 }, { l: '9 PM', h: 21 }, { l: '10 PM', h: 22 }
  ];
  let h = '<div></div>';
  weekDates.forEach((d, i) => { const dow2 = DOW[i], isT = d.toDateString() === now.toDateString(); h += `<div class="sch-day-hd${isT ? ' today' : ''}"><div class="sch-day-name">${SHORT[dow2]}</div><div class="sch-day-date">${d.getDate()}</div></div>`; });
  SLOTS.forEach(slot => {
    const isNow = slot.h === nowH, isPast = slot.h < nowH;
    h += `<div class="sch-time${isNow ? ' sch-row-now' : ''}" style="${isPast ? 'opacity:.35' : ''}">${slot.l}</div>`;
    weekDates.forEach((d, i) => { const dow2 = DOW[i], k = `${SHORT[dow2]}_${slot.l}`, val = esc(st.schedule[k] || ''); h += `<div class="sch-cell${isNow ? ' sch-row-now' : ''}" contenteditable="true" data-k="${k}" onblur="saveSch(this)" onkeydown="if(event.key==='Enter'){event.preventDefault();this.blur()}">${val}</div>`; });
  });
  el.innerHTML = h;
  requestAnimationFrame(() => { const nr = el.querySelector('.sch-row-now'); if (nr) { const w = el.closest('.cal-wrap'); if (w) w.scrollTo({ top: nr.offsetTop - 80, behavior: 'smooth' }); } });
}
function saveSch(el) { sv('schedule', { ...st.schedule, [el.dataset.k]: el.textContent.trim() }); }

/* ══════════════════════════════════════════════════
   GOALS
══════════════════════════════════════════════════ */
let editGoalSlot = -1;
function renderGoals() {
  const el = $('goalsGrid'); if (!el) return;
  const arr = [...(st.goals || [])]; while (arr.length < 4) arr.push(null);
  el.innerHTML = arr.map((g, i) => {
    const pin = st.pinnedGoal === i;
    if (!g) return `<div class="goal-slot empty" onclick="openGoal(${i})"><div class="goal-empty-inner"><div class="goal-add-ico">+</div><div class="goal-add-lbl">Slot ${i + 1}</div></div></div>`;
    const pct = Math.min(100, Math.round(g.current / g.target * 100));
    const col = COLORS[g.color] || COLORS.blue;
    const done = pct >= 100;
    return `<div class="goal-slot filled" style="border-color:${pin ? COLOR_BDS.amber : COLOR_BDS[g.color] || COLOR_BDS.blue};background:${COLOR_DIMS[g.color] || COLOR_DIMS.blue}">
      ${pin ? `<div class="goal-pinned-badge">Pinned</div>` : ''}
      <div class="goal-head">
        <div><div class="goal-name" style="color:${col}">${esc(g.subject)}</div><div class="goal-score-txt">${g.current} / ${g.target}</div></div>
        <div class="goal-actions">
          <button class="goal-action-btn" onclick="pinGoal(${i})" title="${pin ? 'Unpin' : 'Pin'}" aria-label="${pin ? 'Unpin' : 'Pin'}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5M5 3h14l-2 9H7L5 3zM7 12l-2 4h14l-2-4"/></svg></button>
          <button class="goal-action-btn" onclick="editGoal(${i})" title="Edit" aria-label="Edit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
          <button class="goal-action-btn del" onclick="delGoal(${i})" title="Delete" aria-label="Delete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg></button>
        </div>
      </div>
      <div class="goal-bar"><div class="goal-bar-fill" style="width:${pct}%;background:${done ? COLORS.green : col}"></div></div>
      <div class="goal-pct" style="color:${done ? COLORS.green : col}">${done ? 'Achieved' : pct + '% of target'}</div>
    </div>`;
  }).join('');
}
function openGoal(slot) { editGoalSlot = slot; $('goalModalTitle').textContent = `New Goal — Slot ${slot + 1}`; $('goalName').value = ''; $('goalCurrent').value = ''; $('goalTarget').value = '100'; $('goalColor').value = 'blue'; openModal('goalModal'); }
function editGoal(slot) { editGoalSlot = slot; const g = st.goals[slot]; $('goalModalTitle').textContent = `Edit — ${g.subject}`; $('goalName').value = g.subject; $('goalCurrent').value = g.current; $('goalTarget').value = g.target; $('goalColor').value = g.color || 'blue'; openModal('goalModal'); }
function pinGoal(slot) { if (st.pinnedGoal === slot) { sv('pinnedGoal', null); toast('Goal unpinned', 'y'); } else { sv('pinnedGoal', slot); toast(`${st.goals[slot].subject} pinned`, 'g'); } renderGoals(); }
function delGoal(slot) { const arr = [...(st.goals || [])]; while (arr.length < 4) arr.push(null); arr[slot] = null; sv('goals', arr); if (st.pinnedGoal === slot) sv('pinnedGoal', null); renderGoals(); updateStatsUI(); toast('Goal removed', 'y'); }
$('saveGoalBtn').onclick = () => {
  const name = $('goalName').value.trim();
  if (!name) { toast('Please enter a name', 'r'); return; }
  const arr = [...(st.goals || [])]; while (arr.length < 4) arr.push(null);
  const isNew = !arr[editGoalSlot];
  arr[editGoalSlot] = { id: arr[editGoalSlot]?.id || uid(), subject: name, current: +$('goalCurrent').value || 0, target: +$('goalTarget').value || 100, color: $('goalColor').value };
  sv('goals', arr); closeModal('goalModal'); renderGoals(); updateStatsUI();
  if (Math.round(arr[editGoalSlot].current / arr[editGoalSlot].target * 100) >= 100) { confetti(); toast('Goal achieved', 'g'); }
  else toast(isNew ? 'Goal added' : 'Goal updated', 'g');
};

/* ══════════════════════════════════════════════════
   PERFORMANCE BREAKDOWN
══════════════════════════════════════════════════ */
const GRADES = [
  { min: 90, g: 'A+', c: 'green' }, { min: 80, g: 'A', c: 'green' },
  { min: 70, g: 'B+', c: 'blue' }, { min: 60, g: 'B', c: 'blue' },
  { min: 40, g: 'C', c: 'amber' }, { min: 0, g: 'D', c: 'red' }
];
function getGrade(p) { return GRADES.find(g => p >= g.min) || GRADES[GRADES.length - 1]; }

$('logScoreBtn').onclick = () => {
  const btn = $('logScoreBtn');
  if (btn.disabled) return;
  const subj = $('perfSubject').value.trim(), score = +$('perfScore').value, total = +$('perfTotal').value || 100;
  if (!subj || isNaN(score)) { toast('Fill in subject and score', 'r'); return; }
  const pct = Math.round(score / total * 100), gr = getGrade(pct);
  const weak = $('perfWeak').value.trim().split(',').map(x => x.trim()).filter(Boolean);
  const notes = $('perfNotes').value.trim();
  const entry = { id: uid(), subject: subj, score, total, pct, grade: gr.g, weak, notes, date: new Date().toISOString() };
  sv('perfHist', [...st.perfHist, entry]);
  updateStatsUI(); toast(`${subj}: ${pct}% (${gr.g})`, 'g');
  ['perfSubject', 'perfScore', 'perfWeak', 'perfNotes'].forEach(id => { const el = $(id); if (el) el.value = ''; });
  $('perfTotal').value = '100';
  renderPerfDashboard();
  renderAICoach(entry);
};

/* ── ML API Configuration ── */
const ML_API_URL = 'https://studyos-api-k9bz.onrender.com'; 

async function renderAICoach(entry) {
  const card = $('aiCoachContent'); if (!card) return;
  const gr = getGrade(entry.pct);
  const col = COLORS[gr.c] || COLORS.blue;
  const colD = COLOR_DIMS[gr.c] || COLOR_DIMS.blue;
  const colB = COLOR_BDS[gr.c] || COLOR_BDS.blue;

  // Show loading
  card.innerHTML = `<div class="ai-score-hero" style="background:${colD};border:1px solid ${colB}">
    <div style="font-family:var(--mono);font-size:.54rem;font-weight:600;letter-spacing:.15em;text-transform:uppercase;color:${col}">${esc(entry.subject)}</div>
    <span class="ai-score-big" style="color:${col}">${entry.pct}%</span>
    <span class="tag" style="background:${colD};border-color:${colB};color:${col}">${gr.g}</span>
  </div>
  <div class="ai-section"><div class="ai-section-label">Generating AI Report</div>
  <div class="ai-section-body" style="display:flex;align-items:center;gap:12px"><div style="width:18px;height:18px;border:2px solid var(--accent);border-top-color:transparent;border-radius:50%;animation:spin .8s linear infinite"></div>Analyzing your performance and preparing personalized recommendations...</div></div>`;

  // Prepare data for API
  const payload = {
    scores: st.perfHist.map(h => ({ subject: h.subject, pct: h.pct, date: h.date, weak: h.weak || [] })),
    current: { subject: entry.subject, pct: entry.pct, score: entry.score, total: entry.total, weak: entry.weak || [] },
    target: 90
  };

  try {
    const res = await fetch(ML_API_URL + '/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('API error ' + res.status);
    const data = await res.json();
    if (data.status !== 'ok') throw new Error(data.message || 'Analysis failed');
    card.innerHTML = renderMLReport(data.report, entry);
    toast('ML report generated', 'g');
  } catch (e) {
    console.warn('ML API unavailable, using local analysis:', e.message);
    card.innerHTML = generateDataReport(entry);
    toast('Report generated (local)', 'g');
  }
}

function renderMLReport(r, entry) {
  const gr = getGrade(entry.pct);
  const col = COLORS[gr.c] || COLORS.blue;
  const colD = COLOR_DIMS[gr.c] || COLOR_DIMS.blue;
  const colB = COLOR_BDS[gr.c] || COLOR_BDS.blue;
  const S = (title, body) => `<div class="ai-section"><div class="ai-section-label">${title}</div><div class="ai-section-body">${body}</div></div>`;
  let html = '';

  // Hero
  html += `<div class="ai-score-hero" style="background:${colD};border:1px solid ${colB}">
    <div style="font-family:var(--mono);font-size:.54rem;font-weight:600;letter-spacing:.15em;text-transform:uppercase;color:${col}">${esc(entry.subject)}</div>
    <span class="ai-score-big" style="color:${col}">${entry.pct}%</span>
    <div style="display:flex;gap:8px;justify-content:center;align-items:center;flex-wrap:wrap;margin-top:6px">
      <span class="tag" style="background:${colD};border-color:${colB};color:${col}">${gr.g}</span>
      <span style="font-family:var(--mono);font-size:.72rem;color:var(--t3)">${entry.score} / ${entry.total}</span>
    </div>
  </div>`;

  // 1. Identified Weak Areas
  if (entry.weak?.length) {
    html += `<div class="ai-section" style="background:var(--amber-dim);border-color:var(--amber-bd)">
      <div class="ai-section-label" style="color:var(--amber)">Identified Weak Areas</div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px">${entry.weak.map(w => `<span class="tag tag-y">${esc(w)}</span>`).join('')}</div>
      <div style="margin-top:14px;font-size:.84rem;color:var(--t2);line-height:1.65">These are the topics where you struggled the most. Prioritize revising them first &mdash; even 30 minutes per topic over a few days will significantly improve your next score.</div>
    </div>`;
  }

  // 2. Optimal Review Schedule (spaced repetition)
  const sr = r.spaced_rep;
  if (sr && entry.weak?.length) {
    const today = new Date();
    const dateFor = (days) => {
      const d = new Date(today);
      d.setDate(d.getDate() + days);
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };
    let b = `<div style="font-size:.86rem;color:var(--t2);line-height:1.65;margin-bottom:14px">Based on the SM-2 spaced repetition algorithm, here's when you should revisit each weak topic for maximum retention:</div>`;
    b += `<div style="display:flex;gap:8px;flex-wrap:wrap">${sr.intervals_days.map((d, i) => `
      <div style="text-align:center;padding:14px 12px;border-radius:12px;background:var(--bg3);border:1px solid var(--bd);flex:1;min-width:96px">
        <div style="font-family:var(--mono);font-size:.46rem;color:var(--t3);text-transform:uppercase;letter-spacing:.1em;margin-bottom:6px">Review ${i+1}</div>
        <div style="font-family:var(--font);font-size:1.1rem;font-weight:700;color:var(--t1);letter-spacing:-.02em">${d === 0 ? 'Today' : d === 1 ? 'Tomorrow' : `${d} days`}</div>
        <div style="font-family:var(--mono);font-size:.62rem;color:var(--accent);margin-top:4px;font-weight:500">${dateFor(d)}</div>
      </div>`).join('')}</div>`;
    html += S('Optimal Review Schedule', b);
  }

  // 3. Recommendations (elaborate, valuable, human-friendly)
  const recs = (r.recommendations || []).filter(rec => rec.text && rec.text.length > 8);
  const elaborateRecs = buildElaborateRecommendations(entry, r, recs);
  if (elaborateRecs.length) {
    let b = `<div style="font-size:.86rem;color:var(--t2);line-height:1.65;margin-bottom:14px">Concrete, actionable steps tailored to your performance pattern:</div>`;
    b += elaborateRecs.map(rec => {
      const pc2 = rec.priority === 'high' ? 'var(--rose)' : (rec.priority === 'medium' ? 'var(--amber)' : 'var(--green)');
      const pl = rec.priority === 'high' ? 'PRIORITY' : (rec.priority === 'medium' ? 'IMPORTANT' : 'KEEP GOING');
      return `<div style="padding:16px 18px;border-radius:14px;background:var(--bg3);border:1px solid var(--bd);margin-bottom:10px;border-left:3px solid ${pc2}">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
          <span style="font-family:var(--mono);font-size:.5rem;font-weight:700;color:${pc2};padding:3px 9px;border-radius:99px;border:1px solid ${pc2};letter-spacing:.12em">${pl}</span>
          <span style="font-family:var(--font);font-size:.94rem;font-weight:600;color:var(--t1);letter-spacing:-.01em">${esc(rec.title)}</span>
        </div>
        <div style="font-size:.86rem;color:var(--t2);line-height:1.7;letter-spacing:-.005em">${rec.body}</div>
      </div>`;
    }).join('');
    html += S('Recommendations', b);
  }

  return html;
}

function buildElaborateRecommendations(entry, r, apiRecs) {
  const recs = [];
  const pct = entry.pct;
  const subj = entry.subject;
  const weak = entry.weak || [];
  const lr = r.linear || {};
  const stats = r.statistics || {};
  const risk = r.risk || {};
  const mom = r.momentum || {};

  // Score-based recommendation
  if (pct < 50) {
    recs.push({
      priority: 'high',
      title: 'Build the foundation first',
      body: `A score of ${pct}% in ${subj} usually means key concepts haven't fully clicked yet. Don't rush to advanced practice — go back to your textbook chapter summaries, watch one or two clear explanation videos (Khan Academy or YouTube), and rewrite the core formulas/definitions in your own words. Aim for 20 minutes a day on fundamentals before attempting harder problems. You'll see quick gains.`
    });
  } else if (pct < 70) {
    recs.push({
      priority: 'high',
      title: 'You\'re close — fix specific gaps',
      body: `${pct}% means you understand a lot but specific topics are dragging your average down. Look at where you lost marks: was it silly errors, missing formulas, or unfamiliar question types? Make a one-page "mistake log" and review it before every study session. Practicing 5 targeted problems daily on your weak areas is more effective than re-reading entire chapters.`
    });
  } else if (pct < 85) {
    recs.push({
      priority: 'medium',
      title: 'Sharpen the edges',
      body: `Solid score at ${pct}%. To push past this plateau, focus on the question types that made you hesitate. Time yourself on past papers — speed under pressure is what separates 80% from 90%+. Also, teach a tricky concept to someone else (even out loud to yourself); if you can explain it cleanly, you've truly mastered it.`
    });
  } else {
    recs.push({
      priority: 'low',
      title: 'Maintain the momentum',
      body: `Excellent work — ${pct}% shows you've genuinely mastered most of ${subj}. Now focus on consistency and tricky edge cases. Try harder past papers, look for unusual question framings, and explore one application or extension topic that goes beyond the syllabus. This depth will help you stand out in competitive exams and interviews.`
    });
  }

  // Weak areas
  if (weak.length) {
    const topicList = weak.slice(0, 3).map(w => `<strong style="color:var(--t1)">${esc(w)}</strong>`).join(', ');
    recs.push({
      priority: 'high',
      title: `Target your weak topics: ${weak.length} identified`,
      body: `Specifically work on: ${topicList}${weak.length > 3 ? `, and ${weak.length - 3} more` : ''}. For each topic: (1) re-read the relevant section, (2) solve 5-10 practice problems of increasing difficulty, (3) note down any pattern in mistakes you make. Use the spaced-repetition schedule above to revisit them at the right intervals so you actually remember them long-term.`
    });
  }

  // Trend-based
  if (lr.available && lr.trend === 'declining') {
    recs.push({
      priority: 'high',
      title: 'Reverse the downward trend',
      body: `Your scores in ${subj} have been declining over recent tests. This is usually a sign of either burnout, accumulating gaps from earlier topics, or a method that worked before but doesn't fit current material. Take one full day off ${subj}, then come back fresh. Try a different approach: switch from passive reading to active problem-solving, or find a study partner. Don't let two more tests pass without addressing this.`
    });
  } else if (lr.available && lr.trend === 'improving' && lr.slope > 2) {
    recs.push({
      priority: 'low',
      title: 'You\'re trending up — keep the system',
      body: `Your scores have been climbing steadily (${lr.slope > 0 ? '+' : ''}${lr.slope} points per test on average). Whatever you've been doing in the last few weeks is working. Don't change the routine right before a major exam. Document what's been different — study time, technique, sleep, environment — so you can replicate it for other subjects.`
    });
  }

  // Consistency
  if (stats.available && stats.std_dev > 12) {
    recs.push({
      priority: 'medium',
      title: 'Reduce score volatility',
      body: `Your scores swing quite a bit (best: ${stats.best}%, worst: ${stats.worst}%). Inconsistency usually comes from (a) anxiety on test day, (b) variable preparation depending on topic, or (c) careless mistakes. Before each test, do a 10-minute warm-up with 2-3 easy problems to calm nerves. Always re-read your final answers — even 90 seconds of checking catches a surprising number of slips.`
    });
  }

  // High risk
  if (risk.available && risk.risk_level === 'high') {
    recs.push({
      priority: 'high',
      title: 'Address the risk pattern',
      body: `Your performance pattern in ${subj} shows elevated risk of further drops. This isn't a verdict — it's an early warning. Block out 3 focused study sessions this week (45 minutes each, no phone). Pick one weak topic per session, work through it from basics to application, and end each session by attempting 2-3 questions from a past paper. Small consistent input beats marathon cramming.`
    });
  }

  // Add API recommendations that aren't already covered (text-based merge)
  apiRecs.forEach(rec => {
    const priority = rec.priority || 'medium';
    if (rec.text && rec.text.length > 20 && !recs.find(r => r.body.includes(rec.text.slice(0, 20)))) {
      // Convert short API rec into a fuller form
      recs.push({
        priority,
        title: rec.source || 'Insight',
        body: rec.text
      });
    }
  });

  // Always end with a positive habit nudge
  recs.push({
    priority: 'low',
    title: 'Build a daily habit',
    body: `Beyond exam prep, the single biggest predictor of long-term performance is daily consistency. Aim for 25-50 minutes of focused study on ${subj} every day, ideally at the same time and place. Use the Pomodoro timer in StudyOS to stay focused. Sleep matters: 7+ hours significantly improves memory consolidation. And pause every 2-3 days to review what you've learned — review beats re-learning.`
  });

  return recs.slice(0, 6); // cap at 6 recommendations
}

function generateDataReport(entry) {
  const gr = getGrade(entry.pct);
  const col = COLORS[gr.c] || COLORS.blue;
  const colD = COLOR_DIMS[gr.c] || COLOR_DIMS.blue;
  const colB = COLOR_BDS[gr.c] || COLOR_BDS.blue;
  const subj = entry.subject;
  const pct = entry.pct;

  const allHist = [...st.perfHist].sort((a, b) => new Date(a.date) - new Date(b.date));
  const subjHist = allHist.filter(h => h.subject === subj);
  const subjScores = subjHist.map(h => h.pct);
  const mean = subjScores.length ? subjScores.reduce((a, b) => a + b, 0) / subjScores.length : pct;
  const variance = subjScores.length > 1 ? subjScores.reduce((a, s) => a + Math.pow(s - mean, 2), 0) / (subjScores.length - 1) : 0;
  const stdDev = Math.round(Math.sqrt(variance) * 10) / 10;
  const best = subjScores.length ? Math.max(...subjScores) : pct;
  const worst = subjScores.length ? Math.min(...subjScores) : pct;

  let regData = null, trendWord = 'stable';
  if (subjScores.length >= 2) {
    regData = linearRegression(subjScores.map((_, i) => i), subjScores);
    trendWord = regData.slope > 1 ? 'improving' : regData.slope < -1 ? 'declining' : 'stable';
  }

  const intervals = computeSpacedIntervalsArr(pct);
  const today = new Date();
  const dateFor = (days) => {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // Build fake "r" object for buildElaborateRecommendations
  const fakeR = {
    linear: regData ? { available: true, trend: trendWord, slope: Math.round(regData.slope * 10) / 10 } : { available: false },
    statistics: subjScores.length >= 2 ? { available: true, std_dev: stdDev, best, worst } : { available: false },
    risk: { available: false },
    momentum: { available: false }
  };

  const S = (title, body) => `<div class="ai-section"><div class="ai-section-label">${title}</div><div class="ai-section-body">${body}</div></div>`;
  let html = '';

  // Hero
  html += `<div class="ai-score-hero" style="background:${colD};border:1px solid ${colB}">
    <div style="font-family:var(--mono);font-size:.54rem;font-weight:600;letter-spacing:.15em;text-transform:uppercase;color:${col}">${esc(subj)}</div>
    <span class="ai-score-big" style="color:${col}">${pct}%</span>
    <div style="display:flex;gap:8px;justify-content:center;align-items:center;flex-wrap:wrap;margin-top:6px">
      <span class="tag" style="background:${colD};border-color:${colB};color:${col}">${gr.g}</span>
      <span style="font-family:var(--mono);font-size:.72rem;color:var(--t3)">${entry.score} / ${entry.total}</span>
    </div>
  </div>`;

  // 1. Identified Weak Areas
  if (entry.weak?.length) {
    html += `<div class="ai-section" style="background:var(--amber-dim);border-color:var(--amber-bd)">
      <div class="ai-section-label" style="color:var(--amber)">Identified Weak Areas</div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px">${entry.weak.map(w => `<span class="tag tag-y">${esc(w)}</span>`).join('')}</div>
      <div style="margin-top:14px;font-size:.84rem;color:var(--t2);line-height:1.65">These are the topics where you struggled the most. Prioritize revising them first &mdash; even 30 minutes per topic over a few days will significantly improve your next score.</div>
    </div>`;
  }

  // 2. Optimal Review Schedule
  if (entry.weak?.length) {
    let b = `<div style="font-size:.86rem;color:var(--t2);line-height:1.65;margin-bottom:14px">Based on the SM-2 spaced repetition algorithm, here's when you should revisit each weak topic for maximum retention:</div>`;
    b += `<div style="display:flex;gap:8px;flex-wrap:wrap">${intervals.map((d, i) => `
      <div style="text-align:center;padding:14px 12px;border-radius:12px;background:var(--bg3);border:1px solid var(--bd);flex:1;min-width:96px">
        <div style="font-family:var(--mono);font-size:.46rem;color:var(--t3);text-transform:uppercase;letter-spacing:.1em;margin-bottom:6px">Review ${i+1}</div>
        <div style="font-family:var(--font);font-size:1.1rem;font-weight:700;color:var(--t1);letter-spacing:-.02em">${d === 0 ? 'Today' : d === 1 ? 'Tomorrow' : `${d} days`}</div>
        <div style="font-family:var(--mono);font-size:.62rem;color:var(--accent);margin-top:4px;font-weight:500">${dateFor(d)}</div>
      </div>`).join('')}</div>`;
    html += S('Optimal Review Schedule', b);
  }

  // 3. Elaborate Recommendations
  const elaborateRecs = buildElaborateRecommendations(entry, fakeR, []);
  if (elaborateRecs.length) {
    let b = `<div style="font-size:.86rem;color:var(--t2);line-height:1.65;margin-bottom:14px">Concrete, actionable steps tailored to your performance pattern:</div>`;
    b += elaborateRecs.map(rec => {
      const pc2 = rec.priority === 'high' ? 'var(--rose)' : (rec.priority === 'medium' ? 'var(--amber)' : 'var(--green)');
      const pl = rec.priority === 'high' ? 'PRIORITY' : (rec.priority === 'medium' ? 'IMPORTANT' : 'KEEP GOING');
      return `<div style="padding:16px 18px;border-radius:14px;background:var(--bg3);border:1px solid var(--bd);margin-bottom:10px;border-left:3px solid ${pc2}">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
          <span style="font-family:var(--mono);font-size:.5rem;font-weight:700;color:${pc2};padding:3px 9px;border-radius:99px;border:1px solid ${pc2};letter-spacing:.12em">${pl}</span>
          <span style="font-family:var(--font);font-size:.94rem;font-weight:600;color:var(--t1);letter-spacing:-.01em">${esc(rec.title)}</span>
        </div>
        <div style="font-size:.86rem;color:var(--t2);line-height:1.7;letter-spacing:-.005em">${rec.body}</div>
      </div>`;
    }).join('');
    html += S('Recommendations', b);
  }

  return html;
}

// Helper: Returns interval days as numbers (used by both ML and local report)
function computeSpacedIntervalsArr(scorePct) {
  const ease = Math.max(1.3, 1.3 + (scorePct - 50) * 0.02);
  const base = scorePct >= 80 ? 3 : scorePct >= 60 ? 2 : 1;
  return [
    base,
    Math.round(base * ease),
    Math.round(base * ease * ease),
    Math.round(base * ease * ease * ease)
  ];
}

/* ── ALGORITHMIC INTELLIGENCE ──────────────────── */

// Simple linear regression: y = slope * x + intercept
function linearRegression(xs, ys) {
  const n = xs.length;
  if (n < 2) return { slope: 0, intercept: ys[0] || 0, r2: 0 };
  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((a, x, i) => a + x * ys[i], 0);
  const sumX2 = xs.reduce((a, x) => a + x * x, 0);
  const sumY2 = ys.reduce((a, y) => a + y * y, 0);
  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return { slope: 0, intercept: sumY / n, r2: 0 };
  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  // R-squared
  const yMean = sumY / n;
  const ssRes = ys.reduce((a, y, i) => a + Math.pow(y - (slope * xs[i] + intercept), 2), 0);
  const ssTot = ys.reduce((a, y) => a + Math.pow(y - yMean, 2), 0);
  const r2 = ssTot === 0 ? 1 : Math.max(0, 1 - ssRes / ssTot);
  return { slope, intercept, r2 };
}

// SM-2 inspired spaced repetition intervals based on score
function computeSpacedIntervals(scorePct) {
  // Lower score = shorter intervals (more review needed)
  const ease = Math.max(1.3, 1.3 + (scorePct - 50) * 0.02); // 1.3 to 2.3
  const base = scorePct >= 80 ? 3 : scorePct >= 60 ? 2 : 1; // days
  return [
    `${base} day${base > 1 ? 's' : ''}`,
    `${Math.round(base * ease)} days`,
    `${Math.round(base * ease * ease)} days`,
    `${Math.round(base * ease * ease * ease)} days`
  ];
}

// Subject strength analysis for dashboard
function getSubjectStrengths() {
  const subjects = {};
  st.perfHist.forEach(h => {
    if (!subjects[h.subject]) subjects[h.subject] = { scores: [], dates: [] };
    subjects[h.subject].scores.push(h.pct);
    subjects[h.subject].dates.push(new Date(h.date));
  });
  return Object.entries(subjects).map(([name, data]) => {
    const avg = Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length);
    const recent = data.scores.slice(-3);
    const recentAvg = Math.round(recent.reduce((a, b) => a + b, 0) / recent.length);
    let trend = 'stable';
    if (data.scores.length >= 3) {
      const reg = linearRegression(data.scores.map((_, i) => i), data.scores);
      trend = reg.slope > 1 ? 'improving' : reg.slope < -1 ? 'declining' : 'stable';
    }
    return { name, avg, recentAvg, count: data.scores.length, trend };
  }).sort((a, b) => a.avg - b.avg);
}

/* ══════════════════════════════════════════════════
   CHARTS
══════════════════════════════════════════════════ */
const SChart = {
  dpr: Math.min(window.devicePixelRatio || 1, 2),
  setup(cv, w, h) {
    cv.width = Math.round(w * this.dpr); cv.height = Math.round(h * this.dpr);
    cv.style.width = w + 'px'; cv.style.height = h + 'px';
    const c = cv.getContext('2d'); c.scale(this.dpr, this.dpr); c.clearRect(0, 0, w, h); return c;
  },
  th() {
    const d = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
      grid: d ? 'rgba(160,178,255,.05)' : 'rgba(35,40,80,.05)',
      label: d ? 'rgba(190,205,255,.42)' : 'rgba(35,40,80,.38)',
      lbl2: d ? 'rgba(220,228,255,.70)' : 'rgba(35,40,80,.60)'
    };
  },
  font() { return getComputedStyle(document.body).fontFamily; },
  line(cv, labels, datasets, opts = {}) {
    const W = cv.parentElement?.offsetWidth || 400, H = opts.height || 190;
    const pd = { t: 20, r: 18, b: 38, l: opts.yLabel ? 44 : 26 };
    const cw = W - pd.l - pd.r, ch = H - pd.t - pd.b;
    const ctx = this.setup(cv, W, H), t = this.th(), n = labels.length;
    if (!n) { this._empty(ctx, W, H); return; }
    const all = datasets.flatMap(d => d.data.filter(v => v != null));
    if (!all.length) { this._empty(ctx, W, H); return; }
    const minV = opts.min ?? Math.max(0, Math.floor(Math.min(...all) - 5));
    const maxV = opts.max ?? Math.ceil(Math.max(...all) + 5);
    const range = maxV - minV || 1;
    const xp = i => pd.l + (i / Math.max(n - 1, 1)) * cw;
    const yp = v => pd.t + ch - ((v - minV) / range) * ch;
    ctx.strokeStyle = t.grid; ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const gy = pd.t + (i / 4) * ch;
      ctx.beginPath(); ctx.moveTo(pd.l, gy); ctx.lineTo(pd.l + cw, gy); ctx.stroke();
      if (opts.yLabel) {
        ctx.fillStyle = t.label; ctx.font = `500 10px ${this.font()}`; ctx.textAlign = 'right';
        ctx.fillText(Math.round(maxV - (i / 4) * range), pd.l - 6, gy + 4);
      }
    }
    ctx.fillStyle = t.label; ctx.font = `500 10px ${this.font()}`; ctx.textAlign = 'center';
    const step = Math.max(1, Math.floor(n / 7));
    for (let i = 0; i < n; i += step) { if (labels[i]) ctx.fillText(labels[i], xp(i), H - 8); }
    datasets.forEach(ds => {
      const pts = ds.data.map((v, i) => v != null ? { x: xp(i), y: yp(v) } : null);
      const valid = pts.filter(Boolean); if (!valid.length) return;
      if (ds.fill !== false) {
        const g = ctx.createLinearGradient(0, pd.t, 0, pd.t + ch);
        g.addColorStop(0, ds.color + '55'); g.addColorStop(1, ds.color + '05');
        ctx.fillStyle = g; ctx.beginPath();
        let s = false;
        pts.forEach(p => { if (!p) return; if (!s) { ctx.moveTo(p.x, p.y); s = true; } else ctx.lineTo(p.x, p.y); });
        const last = [...pts].reverse().find(Boolean), first = pts.find(Boolean);
        if (last && first) { ctx.lineTo(last.x, pd.t + ch); ctx.lineTo(first.x, pd.t + ch); ctx.closePath(); ctx.fill(); }
      }
      ctx.strokeStyle = ds.color; ctx.lineWidth = 2.2; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      ctx.beginPath();
      let ss = false;
      pts.forEach(p => { if (!p) return; if (!ss) { ctx.moveTo(p.x, p.y); ss = true; } else ctx.lineTo(p.x, p.y); });
      ctx.stroke();
      pts.forEach(p => {
        if (!p) return;
        ctx.beginPath(); ctx.arc(p.x, p.y, 3.8, 0, Math.PI * 2);
        ctx.fillStyle = ds.color; ctx.fill();
        ctx.strokeStyle = document.documentElement.getAttribute('data-theme') === 'dark' ? '#000000' : '#FFFFFF';
        ctx.lineWidth = 2; ctx.stroke();
      });
    });
  },
  hbar(cv, labels, values, colors, opts = {}) {
    const W = cv.parentElement?.offsetWidth || 400;
    const bH = 26, gap = 11, pL = 115, pR = 54, pT = 10;
    const H = pT + labels.length * (bH + gap) + 14;
    const ctx = this.setup(cv, W, H), t = this.th();
    const maxV = Math.max(...values, 1);
    const barW = W - pL - pR;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    labels.forEach((lbl, i) => {
      const y = pT + i * (bH + gap);
      ctx.fillStyle = t.lbl2; ctx.font = `600 11px ${this.font()}`; ctx.textAlign = 'right';
      ctx.fillText(lbl.length > 14 ? lbl.slice(0, 13) + '…' : lbl, pL - 8, y + bH / 2 + 4);
      ctx.fillStyle = isDark ? 'rgba(160,178,255,.05)' : 'rgba(35,40,80,.05)';
      ctx.beginPath(); this._rr(ctx, pL, y, barW, bH, bH / 2); ctx.fill();
      const fw = Math.max(values[i] > 0 ? 6 : 0, (values[i] / maxV) * barW);
      if (fw > 0) {
        const g = ctx.createLinearGradient(pL, 0, pL + fw, 0);
        g.addColorStop(0, colors[i] || '#FFFFFF'); g.addColorStop(1, (colors[i] || '#FFFFFF') + 'BB');
        ctx.fillStyle = g; ctx.beginPath(); this._rr(ctx, pL, y, fw, bH, bH / 2); ctx.fill();
      }
      ctx.fillStyle = t.lbl2; ctx.font = `700 11px ${this.font()}`; ctx.textAlign = 'left';
      ctx.fillText(Math.round(values[i]) + (opts.suffix || '%'), pL + barW + 7, y + bH / 2 + 4);
    });
  },
  _rr(c, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    c.moveTo(x + r, y); c.lineTo(x + w - r, y);
    c.quadraticCurveTo(x + w, y, x + w, y + r); c.lineTo(x + w, y + h - r);
    c.quadraticCurveTo(x + w, y + h, x + w - r, y + h); c.lineTo(x + r, y + h);
    c.quadraticCurveTo(x, y + h, x, y + h - r); c.lineTo(x, y + r);
    c.quadraticCurveTo(x, y, x + r, y); c.closePath();
  },
  _empty(c, w, h, m = 'No data yet') {
    c.fillStyle = 'rgba(160,178,255,.2)'; c.font = `italic 500 13px ${this.font()}`;
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(m, w / 2, h / 2);
    c.textBaseline = 'alphabetic';
  }
};

let perfSubjectFilter = 'All';

function renderPerfDashboard() {
  const dash = $('perfDashboard'); if (!dash) return;
  const data = st.perfHist;
  if (!data.length) {
    dash.innerHTML = `<div class="glass-card" style="margin-bottom:36px"><div class="ai-empty" style="padding:44px 20px"><div class="ai-empty-glyph"></div><p>No scores tracked yet. Log your first test score above to see analytics.</p></div></div>`;
    return;
  }
  const subjects = [...new Set(data.map(h => h.subject))];
  // Filter data by selected subject
  const filteredData = perfSubjectFilter === 'All' ? data : data.filter(h => h.subject === perfSubjectFilter);
  const sorted = [...filteredData].sort((a, b) => new Date(a.date) - new Date(b.date));
  const avg = filteredData.length ? Math.round(filteredData.reduce((s, h) => s + h.pct, 0) / filteredData.length) : 0;
  const best = filteredData.length ? filteredData.reduce((a, b) => a.pct >= b.pct ? a : b) : {pct: 0};
  const recent5 = [...filteredData].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  const rAvg = recent5.length ? Math.round(recent5.reduce((s, h) => s + h.pct, 0) / recent5.length) : 0;
  const trend = filteredData.length >= 2 ? rAvg - Math.round((filteredData.slice(0, -5).reduce((s, h, _, a) => s + h.pct / a.length, 0) || avg)) : 0;
  const tStr = trend > 0 ? `+${trend}%` : trend < 0 ? `${trend}%` : '—';
  const tCol = trend > 0 ? 'var(--green)' : trend < 0 ? 'var(--rose)' : 'var(--t3)';
  const SUB_C = ['#FFFFFF', '#22C55E', '#06B6D4', '#EAB308', '#A855F7', '#EF4444'];
  const sAvgs = subjects.map(s => {
    const sd = data.filter(h => h.subject === s);
    return { subject: s, avg: Math.round(sd.reduce((a, h) => a + h.pct, 0) / sd.length) };
  }).sort((a, b) => b.avg - a.avg);

  // Subject dropdown options
  const subjectOptions = ['All', ...subjects].map(s => `<option value="${esc(s)}" ${s === perfSubjectFilter ? 'selected' : ''}>${esc(s)}</option>`).join('');

  dash.innerHTML = `<div class="tracker-stats">
    <div class="tstat"><span class="tstat-val" style="color:var(--t1)">${filteredData.length}</span><span class="tstat-lbl">Tests</span></div>
    <div class="tstat"><span class="tstat-val" style="color:${avg >= 70 ? 'var(--green)' : avg >= 50 ? 'var(--amber)' : 'var(--rose)'}">${avg}%</span><span class="tstat-lbl">Average</span></div>
    <div class="tstat"><span class="tstat-val" style="color:var(--green)">${best.pct}%</span><span class="tstat-lbl">Best</span></div>
    <div class="tstat"><span class="tstat-val" style="color:${tCol}">${tStr}</span><span class="tstat-lbl">Trend</span></div>
    <div class="tstat"><span class="tstat-val" style="color:var(--cyan)">${subjects.length}</span><span class="tstat-lbl">Subjects</span></div>
  </div>
  <div class="chart-card" style="margin-bottom:16px">
    <div class="chart-header">
      <div class="chart-card-title">Score Trend${perfSubjectFilter !== 'All' ? ' — ' + esc(perfSubjectFilter) : ' — All Subjects'}</div>
      <select class="select-sm" onchange="setPerfSubject(this.value)">${subjectOptions}</select>
    </div>
    <div class="chart-wrap"><canvas id="pc-trend"></canvas></div>
  </div>
  <div class="charts-2col" style="margin-bottom:36px">
    <div class="chart-card"><div class="chart-card-title">Subject Averages</div><div class="chart-wrap"><canvas id="pc-subj"></canvas></div></div>
    <div class="chart-card"><div class="chart-card-title">Recent Scores</div><div class="recent-scores-list">${[...data].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6).map(h => {
      const gr = getGrade(h.pct);
      const col = COLORS[gr.c] || COLORS.blue;
      const cd = COLOR_DIMS[gr.c] || COLOR_DIMS.blue;
      const cb = COLOR_BDS[gr.c] || COLOR_BDS.blue;
      return `<div class="score-item"><div style="flex:1;min-width:0"><div class="score-subj">${esc(h.subject)}</div><div class="score-date">${new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div></div><span class="score-pct" style="color:${col}">${h.pct}%</span><span class="tag" style="background:${cd};border-color:${cb};color:${col}">${gr.g}</span><button class="score-del" onclick="delPerf('${h.id}')" aria-label="Delete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg></button></div>`;
    }).join('')}</div></div>
  </div>`;
  requestAnimationFrame(() => {
    const tc = $('pc-trend');
    if (tc) {
      const tLabels = sorted.map((h, i) => {
        const d = new Date(h.date);
        return i % Math.max(1, Math.floor(sorted.length / 8)) === 0 ? (d.getMonth() + 1) + '/' + d.getDate() : '';
      });
      SChart.line(tc, tLabels, [{ data: sorted.map(h => h.pct), color: '#888888', fill: true }], { height: 190, min: 0, max: 100, yLabel: true });
    }
    const sc = $('pc-subj');
    if (sc) SChart.hbar(sc, sAvgs.map(s => s.subject), sAvgs.map(s => s.avg), sAvgs.map((_, i) => SUB_C[i % SUB_C.length]), { suffix: '%' });
  });
}

function setPerfSubject(s) {
  perfSubjectFilter = s;
  renderPerfDashboard();
}

/* ══════════════════════════════════════════════════
   NOTES
══════════════════════════════════════════════════ */
let noteEditIdx = -1, noteSubjectFilter = 'all', noteSearchQ = '', noteSortMode = 'newest';

function initNoteEditor() {
  $('newNoteBtn').onclick = e => {
    e.preventDefault(); noteEditIdx = -1;
    $('neSubject').value = ''; $('neTitle').value = ''; $('neBody').innerHTML = '';
    $('noteEditorWrap').style.display = 'block';
    setTimeout(() => $('neBody').focus(), 100);
  };
  $('neCancelBtn').onclick = e => { e.preventDefault(); $('noteEditorWrap').style.display = 'none'; noteEditIdx = -1; };
  $('neToolbar').addEventListener('mousedown', e => e.preventDefault());
  $('neToolbar').addEventListener('click', e => {
    e.preventDefault();
    const btn = e.target.closest('.ne-tool[data-cmd]');
    const sw = e.target.closest('.ne-swatch');
    $('neBody').focus();
    if (btn) { document.execCommand(btn.dataset.cmd, false, btn.dataset.val || null); updateNeToolbar(); }
    if (sw) { document.execCommand('foreColor', false, sw.dataset.color); }
  });
  $('neBody').addEventListener('keyup', updateNeToolbar);
  $('neBody').addEventListener('mouseup', updateNeToolbar);
  $('neBody').addEventListener('paste', e => {
    e.preventDefault();
    document.execCommand('insertText', false, (e.clipboardData || window.clipboardData).getData('text/plain'));
  });
  $('neSaveBtn').onclick = e => {
    e.preventDefault();
    const subj = $('neSubject').value.trim() || 'General';
    const title = $('neTitle').value.trim();
    const content = $('neBody').innerHTML.trim();
    if (!content || content === '<br>') { toast('Write something first', 'r'); return; }
    const obj = {
      id: uid(), subject: subj, title, content, isHtml: true,
      date: new Date().toISOString(), pinned: false,
      wordCount: content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').length
    };
    const arr = [...st.notes];
    if (noteEditIdx >= 0) arr[noteEditIdx] = { ...arr[noteEditIdx], ...obj, id: arr[noteEditIdx].id, pinned: arr[noteEditIdx].pinned || false };
    else arr.push(obj);
    sv('notes', arr);
    $('noteEditorWrap').style.display = 'none';
    noteEditIdx = -1;
    renderNotes(); updateStatsUI(); toast('Note saved', 'g');
  };
  $('noteSearch').addEventListener('input', function () { noteSearchQ = this.value.trim().toLowerCase(); renderNotes(); });
  $('noteSort').addEventListener('change', function () { noteSortMode = this.value; renderNotes(); });
}

function updateNeToolbar() {
  document.querySelectorAll('.ne-tool[data-cmd]').forEach(btn => {
    try {
      const c = btn.dataset.cmd;
      if (['bold', 'italic', 'underline', 'strikeThrough'].includes(c)) btn.classList.toggle('active', document.queryCommandState(c));
    } catch {}
  });
}

function ntcFor(s) {
  const C = ['#FFFFFF', '#06B6D4', '#22C55E', '#EAB308', '#A855F7', '#EF4444'];
  const idx = [...(s || '')].reduce((a, c) => a + c.charCodeAt(0), 0) % C.length;
  const h = C[idx];
  return { bg: h + '22', c: h, bd: h + '44' };
}

function renderNotes(f) {
  if (f !== undefined) noteSubjectFilter = f;
  const chips = $('noteSubjectChips'), el = $('notesGrid'); if (!chips || !el) return;
  const subs = ['All', ...new Set(st.notes.map(n => n.subject || 'General'))];
  chips.innerHTML = subs.map(s => `<button class="chip${(s === 'All' && noteSubjectFilter === 'all') || s === noteSubjectFilter ? ' active' : ''}" onclick="renderNotes('${s === 'All' ? 'all' : s.replace(/'/g, "\\'")}')">${esc(s)}</button>`).join('');
  let arr = [...st.notes];
  if (noteSubjectFilter !== 'all') arr = arr.filter(n => (n.subject || 'General') === noteSubjectFilter);
  if (noteSearchQ) arr = arr.filter(n => ((n.title || '') + (n.subject || '') + (n.content || '').replace(/<[^>]*>/g, ' ')).toLowerCase().includes(noteSearchQ));
  if (noteSortMode === 'newest') arr.sort((a, b) => new Date(b.date) - new Date(a.date));
  else if (noteSortMode === 'oldest') arr.sort((a, b) => new Date(a.date) - new Date(b.date));
  else if (noteSortMode === 'az') arr.sort((a, b) => (a.title || a.subject || '').localeCompare(b.title || b.subject || ''));
  if (!arr.length) {
    el.innerHTML = `<div style="column-span:all;text-align:center;padding:44px 20px;color:var(--t4);font-family:var(--font);font-style:italic;font-size:.88rem">${noteSearchQ ? 'No results found.' : 'No notes yet. Click "New Note" to begin.'}</div>`;
    return;
  }
  el.innerHTML = arr.map(n => {
    const ri = st.notes.indexOf(n);
    const tc = ntcFor(n.subject || 'General');
    const body = n.isHtml ? (n.content || '').replace(/<script[\s\S]*?<\/script>/gi, '') : esc(n.content || '');
    return `<div class="note-card${n.pinned ? ' pinned' : ''}">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;gap:6px">
        <span class="note-tag" style="background:${tc.bg};color:${tc.c};border-color:${tc.bd}">${esc(n.subject || 'General')}</span>
        ${n.pinned ? `<span style="font-family:var(--mono);font-size:.52rem;color:var(--amber);font-weight:600;letter-spacing:.08em;text-transform:uppercase">Pinned</span>` : ''}
      </div>
      ${n.title ? `<div class="note-title">${esc(n.title)}</div>` : ''}
      <div class="note-body">${body}</div>
      <div class="note-foot">
        <div class="note-date">${new Date(n.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · ${n.wordCount || 0} words</div>
        <div class="note-acts">
          <button class="note-act-btn" onclick="pinNote(${ri})" title="${n.pinned ? 'Unpin' : 'Pin'}" aria-label="Pin"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5M5 3h14l-2 9H7L5 3zM7 12l-2 4h14l-2-4"/></svg></button>
          <button class="note-act-btn" onclick="viewNote(${ri})" title="View" aria-label="View"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
          <button class="note-act-btn" onclick="exportNote(${ri})" title="Export" aria-label="Export"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></button>
          <button class="note-act-btn" onclick="editNote(${ri})" title="Edit" aria-label="Edit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
          <button class="note-act-btn del" onclick="delNote(${ri})" title="Delete" aria-label="Delete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg></button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function pinNote(i) { const arr = [...st.notes]; arr[i] = { ...arr[i], pinned: !arr[i].pinned }; sv('notes', arr); toast(arr[i].pinned ? 'Pinned' : 'Unpinned', 'y'); renderNotes(); }
function editNote(i) { const n = st.notes[i]; if (!n) return; noteEditIdx = i; $('neSubject').value = n.subject || ''; $('neTitle').value = n.title || ''; $('neBody').innerHTML = n.content || ''; $('noteEditorWrap').style.display = 'block'; $('neBody').focus(); }
function delNote(i) { if (!confirm('Delete this note?')) return; sv('notes', st.notes.filter((_, j) => j !== i)); renderNotes(); updateStatsUI(); }
function exportNote(i) {
  const n = st.notes[i]; if (!n) return;
  const text = `${n.title || '(Untitled)'}\n${n.subject || 'General'} · ${new Date(n.date).toLocaleDateString()}\n${'─'.repeat(40)}\n\n${(n.content || '').replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')}`;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
  a.download = (n.title || 'note').replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.txt';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  toast('Exported', 'g');
}
function viewNote(i) {
  const n = st.notes[i]; if (!n) return;
  const tc = ntcFor(n.subject || 'General');
  let vm = $('noteViewModal');
  if (!vm) {
    vm = document.createElement('div');
    vm.id = 'noteViewModal';
    vm.className = 'modal-overlay';
    vm.innerHTML = `<div class="modal" style="max-width:720px;max-height:88vh;display:flex;flex-direction:column;padding:0;overflow:hidden"><div class="nvh-header"><div style="flex:1;min-width:0"><div id="nvTag" style="display:inline-block;padding:3px 10px;border-radius:99px;font-family:var(--mono);font-size:.56rem;font-weight:600;letter-spacing:.06em;text-transform:uppercase;margin-bottom:10px;border:1px solid"></div><div id="nvTitle" style="font-family:var(--font);font-size:1.5rem;font-weight:500;color:var(--t1);letter-spacing:-.025em;margin-bottom:6px"></div><div id="nvMeta" style="font-family:var(--mono);font-size:.60rem;color:var(--t4);letter-spacing:.04em"></div></div><button type="button" class="modal-close" onclick="document.getElementById('noteViewModal').classList.remove('on')">&times;</button></div><div id="nvBody" class="nvh-body"></div></div>`;
    document.body.appendChild(vm);
    vm.addEventListener('click', e => { if (e.target === vm) vm.classList.remove('on'); });
  }
  $('nvTag').textContent = n.subject || 'General';
  $('nvTag').style.cssText += `;background:${tc.bg};color:${tc.c};border-color:${tc.bd}`;
  $('nvTitle').textContent = n.title || '(Untitled)';
  $('nvMeta').textContent = `${new Date(n.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} · ${n.wordCount || 0} words`;
  $('nvBody').innerHTML = n.isHtml ? (n.content || '').replace(/<script[\s\S]*?<\/script>/gi, '') : `<p>${esc(n.content || '')}</p>`;
  vm.classList.add('on');
}

/* ══════════════════════════════════════════════════
   PAPERS
══════════════════════════════════════════════════ */
const SAT_TESTS = [
  { n: 1, label: 'SAT Practice Test 1', year: 'Paper Format', url: 'https://360031.fs1.hubspotusercontent-na1.net/hubfs/360031/PrepScholar-sat-practice-test-1.pdf' },
  { n: 2, label: 'SAT Practice Test 2', year: 'Paper Format', url: 'https://360031.fs1.hubspotusercontent-na1.net/hubfs/360031/PrepScholar-sat-practice-test-2.pdf' },
  { n: 3, label: 'SAT Practice Test 3', year: 'Paper Format', url: 'https://360031.fs1.hubspotusercontent-na1.net/hubfs/360031/PrepScholar-sat-practice-test-3.pdf' },
  { n: 4, label: 'Digital SAT Practice 4', year: 'Digital 2024–25', url: 'https://satsuite.collegeboard.org/media/pdf/sat-practice-test-4-digital.pdf' },
  { n: 5, label: 'Digital SAT Practice 5', year: 'Digital 2024–25', url: 'https://satsuite.collegeboard.org/media/pdf/sat-practice-test-5-digital.pdf' },
  { n: 6, label: 'Digital SAT Practice 6', year: 'Digital 2024–25', url: 'https://satsuite.collegeboard.org/media/pdf/sat-practice-test-6-digital.pdf' },
  { n: 7, label: 'Digital SAT Practice 7', year: 'Digital 2024–25', url: 'https://satsuite.collegeboard.org/media/pdf/sat-practice-test-7-digital.pdf' },
  { n: 8, label: 'Digital SAT Practice 8', year: 'Digital 2024–25', url: 'https://satsuite.collegeboard.org/media/pdf/sat-practice-test-8-digital.pdf' },
  { n: 9, label: 'Digital SAT Practice 9', year: 'Digital 2024–25', url: 'https://satsuite.collegeboard.org/media/pdf/sat-practice-test-9-digital.pdf' },
  { n: 10, label: 'Digital SAT Practice 10', year: 'Digital 2024–25', url: 'https://satsuite.collegeboard.org/media/pdf/sat-practice-test-10-digital.pdf' },
];
function renderSATPapers() {
  const el = $('satGrid'); if (!el) return;
  el.innerHTML = SAT_TESTS.map(t => `<div class="sat-row"><div class="sat-num">${pad(t.n)}</div><div class="sat-info"><div class="sat-title">${esc(t.label)}</div><div class="sat-meta">College Board · ${esc(t.year)}</div></div><a class="sat-link" href="${t.url}" target="_blank" rel="noopener">Open</a></div>`).join('');
}

const REFERENCE_SHEETS = [
  { n: 1, label: 'Math Formula Sheet', sub: 'AP / SAT / General', url: 'https://apcentral.collegeboard.org/media/pdf/ap-calculus-ab-bc-formula-sheet.pdf' },
  { n: 2, label: 'Physics Formula Sheet', sub: 'AP Physics 1 & 2', url: 'https://apcentral.collegeboard.org/media/pdf/ap-physics-1-2-equations-table.pdf' },
  { n: 3, label: 'Chemistry Reference Tables', sub: 'AP Chemistry', url: 'https://apcentral.collegeboard.org/media/pdf/ap-chemistry-equations-and-constants.pdf' },
  { n: 4, label: 'Periodic Table (Printable)', sub: 'PubChem · NIH', url: 'https://pubchem.ncbi.nlm.nih.gov/periodic-table/pdf/Periodic_Table_of_Elements_w_Chemical_Group_Block_PubChem.pdf' },
  { n: 5, label: 'Trigonometry Cheat Sheet', sub: 'Lamar University', url: 'https://tutorial.math.lamar.edu/pdf/Trig_Cheat_Sheet.pdf' },
  { n: 6, label: 'Algebra Cheat Sheet', sub: 'Lamar University', url: 'https://tutorial.math.lamar.edu/pdf/Algebra_Cheat_Sheet.pdf' },
  { n: 7, label: 'Calculus Cheat Sheet', sub: 'Lamar University', url: 'https://tutorial.math.lamar.edu/pdf/Calculus_Cheat_Sheet_All.pdf' },
  { n: 8, label: 'Common Derivatives & Integrals', sub: 'Reference Card', url: 'https://tutorial.math.lamar.edu/pdf/Common_Derivatives_Integrals.pdf' },
  { n: 9, label: 'Statistics & Probability Sheet', sub: 'AP Statistics', url: 'https://apcentral.collegeboard.org/media/pdf/statistics-formulas-and-tables-sticker.pdf' },
  { n: 10, label: 'Biology Reference Guide', sub: 'AP Biology', url: 'https://apcentral.collegeboard.org/media/pdf/ap-biology-equations-and-formulas-sheet.pdf' },
  { n: 11, label: 'Verbs & Tenses Reference', sub: 'English Grammar', url: 'https://owl.purdue.edu/owl/general_writing/grammar/verb_tenses/index.html' },
  { n: 12, label: 'World History Timeline', sub: 'Khan Academy', url: 'https://www.khanacademy.org/humanities/world-history' },
  { n: 13, label: 'Indian Constitution Reference', sub: 'Govt of India', url: 'https://legislative.gov.in/constitution-of-india/' },
  { n: 14, label: 'Greek Alphabet & Math Symbols', sub: 'Quick Reference', url: 'https://www.rapidtables.com/math/symbols/Basic_Math_Symbols.html' },
  { n: 15, label: 'SI Units & Constants', sub: 'NIST Reference', url: 'https://physics.nist.gov/cuu/Constants/Table/allascii.txt' },
  { n: 16, label: 'Big-O Complexity Cheat Sheet', sub: 'Algorithms', url: 'https://www.bigocheatsheet.com/' },
  { n: 17, label: 'Python Cheat Sheet', sub: 'Beginner-Friendly', url: 'https://www.pythoncheatsheet.org/' },
  { n: 18, label: 'JavaScript Cheat Sheet', sub: 'Quick Reference', url: 'https://htmlcheatsheet.com/js/' },
  { n: 19, label: 'Geography Atlas (Free)', sub: 'CIA Factbook', url: 'https://www.cia.gov/the-world-factbook/about/archives/' },
  { n: 20, label: 'Periodic Table Trends', sub: 'Visual Guide', url: 'https://ptable.com/' },
  { n: 21, label: 'Common Logarithms Table', sub: 'Math Reference', url: 'https://www.rapidtables.com/math/algebra/Logarithm.html' },
  { n: 22, label: 'Financial Accounting Quick Ref', sub: 'AccountingCoach', url: 'https://www.accountingcoach.com/' },
];

function renderRefSheets() {
  const el = $('refSheetsGrid'); if (!el) return;
  el.innerHTML = REFERENCE_SHEETS.map(s => `<div class="sat-row"><div class="sat-num" style="background:var(--blue);color:#fff">${pad(s.n)}</div><div class="sat-info"><div class="sat-title">${esc(s.label)}</div><div class="sat-meta">${esc(s.sub)}</div></div><a class="sat-link" href="${s.url}" target="_blank" rel="noopener">Open</a></div>`).join('');
}


function renderPapers(f) {
  const chips = $('paperChips'), el = $('paperList'); if (!chips || !el) return;
  const subs = ['All', ...new Set(st.papers.map(p => p.subject || 'Other'))];
  const cur = f || 'all';
  chips.innerHTML = subs.map(s => `<button class="chip${(s === 'All' && cur === 'all') || s === cur ? ' active' : ''}" onclick="renderPapers('${s === 'All' ? 'all' : s}')">${esc(s)}</button>`).join('');
  const arr = cur === 'all' ? st.papers : st.papers.filter(p => p.subject === cur);
  if (!arr.length) {
    el.innerHTML = `<div style="padding:24px;font-family:var(--font);font-style:italic;font-size:.84rem;color:var(--t4);text-align:center">No papers saved yet. Add papers using the button above.</div>`;
    return;
  }
  const PICO = { Mathematics: 'M', Physics: 'P', Chemistry: 'C', Biology: 'B', English: 'E', History: 'H', 'Computer Science': 'CS', Other: '—' };
  el.innerHTML = [...arr].reverse().map(p => `<div class="paper-item"><div class="paper-ico">${PICO[p.subject] || '—'}</div><div style="flex:1;min-width:0"><div class="paper-name">${esc(p.name)}</div><div class="paper-sub">${esc(p.subject || 'Other')}${p.year ? ' · ' + p.year : ''}</div></div>${p.url ? `<a href="${esc(p.url)}" target="_blank" rel="noopener" class="btn-outline btn-sm">Open</a>` : ''}<button class="btn-outline btn-sm" onclick="delPaper('${p.id}')" style="color:var(--rose);border-color:var(--rose-bd)">&times;</button></div>`).join('');
}
$('savePaperBtn').onclick = () => {
  const n = $('paperName').value.trim();
  if (!n) { toast('Enter a name', 'r'); return; }
  sv('papers', [...st.papers, { id: uid(), subject: $('paperSubject').value, name: n, url: $('paperUrl').value.trim(), year: $('paperYear').value.trim(), date: new Date().toISOString() }]);
  closeModal('paperModal');
  ['paperName', 'paperUrl', 'paperYear'].forEach(id => { const el = $(id); if (el) el.value = ''; });
  renderPapers();
  toast('Paper added', 'g');
};
function delPaper(id) { sv('papers', st.papers.filter(p => p.id !== id)); renderPapers(); }

/* ══════════════════════════════════════════════════
   PRACTICE QUESTIONS
══════════════════════════════════════════════════ */
const QUESTION_BANK = (function buildQuestionBank() {
  const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  // ── MATHEMATICS (700) ──
  const mathQs = [];
  for (let i = 0; i < 100; i++) {
    const a = rand(2, 12), b = rand(1, 30), c = rand(20, 90);
    const x = ((c - b) / a).toFixed(2);
    mathQs.push({ q: `Solve for x: ${a}x + ${b} = ${c}`, a: `x = ${x}`, topic: "Linear Equations" });
  }
  const quads = [
    { q: "Solve x² - 5x + 6 = 0", a: "x = 2 or x = 3 (factor: (x-2)(x-3))" },
    { q: "Solve x² - 7x + 12 = 0", a: "x = 3 or x = 4" },
    { q: "Solve x² + 5x + 6 = 0", a: "x = -2 or x = -3" },
    { q: "Solve x² - 9 = 0", a: "x = 3 or x = -3" },
    { q: "Solve x² + 6x + 9 = 0", a: "x = -3 (double root)" },
    { q: "Solve 2x² - 8x = 0", a: "x = 0 or x = 4" },
    { q: "Find roots of x² - 4x - 5 = 0", a: "x = 5 or x = -1" },
    { q: "Solve x² + 2x - 15 = 0", a: "x = 3 or x = -5" },
    { q: "Solve x² - 10x + 25 = 0", a: "x = 5 (double root)" },
    { q: "Solve x² - 4 = 0", a: "x = 2 or x = -2" },
    { q: "Find roots of 2x² - 5x - 3 = 0", a: "x = 3 or x = -1/2" },
    { q: "Solve 3x² - 12 = 0", a: "x = 2 or x = -2" },
  ];
  for (let i = 0; i < 80; i++) mathQs.push({ ...pick(quads), topic: "Quadratic Equations" });
  for (let i = 0; i < 50; i++) {
    const r = rand(2, 20);
    mathQs.push({ q: `Find the area of a circle with radius ${r} cm.`, a: `A = π × ${r}² = ${(3.14159 * r * r).toFixed(2)} cm²`, topic: "Geometry" });
  }
  for (let i = 0; i < 50; i++) {
    const l = rand(3, 25), w = rand(3, 25);
    mathQs.push({ q: `Find the area of a rectangle with length ${l} cm and width ${w} cm.`, a: `A = ${l} × ${w} = ${l * w} cm²`, topic: "Geometry" });
  }
  const triples = [[3,4,5],[5,12,13],[8,15,17],[7,24,25],[9,40,41],[20,21,29],[6,8,10]];
  for (let i = 0; i < 50; i++) {
    const t = pick(triples);
    mathQs.push({ q: `A right triangle has legs ${t[0]} and ${t[1]}. Find the hypotenuse.`, a: `Hypotenuse = √(${t[0]}² + ${t[1]}²) = ${t[2]}`, topic: "Pythagorean Theorem" });
  }
  for (let i = 0; i < 60; i++) {
    const p = rand(5, 95), n = rand(20, 1000);
    mathQs.push({ q: `What is ${p}% of ${n}?`, a: `${p}% × ${n} = ${(p * n / 100).toFixed(2)}`, topic: "Percentages" });
  }
  const calc = [
    { q: "Find dy/dx if y = 3x⁴", a: "dy/dx = 12x³" },
    { q: "Find dy/dx if y = x² + 5x - 7", a: "dy/dx = 2x + 5" },
    { q: "Find dy/dx if y = sin(x)", a: "dy/dx = cos(x)" },
    { q: "Find dy/dx if y = e^x", a: "dy/dx = e^x" },
    { q: "Find dy/dx if y = ln(x)", a: "dy/dx = 1/x" },
    { q: "Find dy/dx if y = x³ - 6x² + 9x", a: "dy/dx = 3x² - 12x + 9" },
    { q: "Evaluate ∫ x² dx", a: "x³/3 + C" },
    { q: "Evaluate ∫ 2x dx", a: "x² + C" },
    { q: "Evaluate ∫ cos(x) dx", a: "sin(x) + C" },
    { q: "Evaluate ∫ e^x dx", a: "e^x + C" },
    { q: "Evaluate ∫ 1/x dx", a: "ln|x| + C" },
    { q: "Find the limit: lim x→0 (sin x)/x", a: "1" },
    { q: "Find the limit: lim x→∞ (1/x)", a: "0" },
    { q: "Find the derivative of f(x) = (x²+1)²", a: "f'(x) = 2(x²+1)(2x) = 4x³+4x" },
    { q: "Evaluate ∫ sin(x) dx", a: "-cos(x) + C" },
    { q: "Find dy/dx if y = tan(x)", a: "dy/dx = sec²(x)" },
  ];
  for (let i = 0; i < 80; i++) mathQs.push({ ...pick(calc), topic: "Calculus" });
  const trig = [
    { q: "Evaluate sin(30°)", a: "1/2 = 0.5" },
    { q: "Evaluate cos(60°)", a: "1/2 = 0.5" },
    { q: "Evaluate tan(45°)", a: "1" },
    { q: "Evaluate sin(90°)", a: "1" },
    { q: "Evaluate cos(0°)", a: "1" },
    { q: "Evaluate sin(0°)", a: "0" },
    { q: "What is sin²(x) + cos²(x)?", a: "1 (Pythagorean identity)" },
    { q: "Evaluate cos(180°)", a: "-1" },
    { q: "Convert 90° to radians", a: "π/2 ≈ 1.5708 rad" },
    { q: "Convert π radians to degrees", a: "180°" },
    { q: "Evaluate sin(60°)", a: "√3/2 ≈ 0.866" },
    { q: "Evaluate cos(30°)", a: "√3/2 ≈ 0.866" },
  ];
  for (let i = 0; i < 60; i++) mathQs.push({ ...pick(trig), topic: "Trigonometry" });
  const stats = [
    { q: "Find the mean of: 12, 15, 18, 21, 24", a: "Mean = (12+15+18+21+24)/5 = 18" },
    { q: "Find the median of: 3, 7, 9, 12, 15", a: "Median = 9" },
    { q: "If P(A) = 0.4, what is P(not A)?", a: "P(not A) = 1 - 0.4 = 0.6" },
    { q: "A die is rolled. Probability of even number?", a: "3/6 = 1/2 = 0.5" },
    { q: "A coin is tossed twice. P(both heads)?", a: "1/2 × 1/2 = 1/4 = 0.25" },
    { q: "Find the mode of: 2, 3, 3, 5, 7, 7, 7, 9", a: "Mode = 7 (most frequent)" },
    { q: "Standard deviation measures what?", a: "Spread/variability of data from the mean" },
    { q: "What is the range of: 4, 8, 15, 16, 23, 42?", a: "Range = 42 - 4 = 38" },
    { q: "Two coins tossed. P(at least one head)?", a: "3/4 = 0.75 (HH, HT, TH)" },
    { q: "Find variance of: 2, 4, 4, 4, 5, 5, 7, 9", a: "Mean=5; Var = ((9+1+1+1+0+0+4+16))/8 = 4" },
  ];
  for (let i = 0; i < 70; i++) mathQs.push({ ...pick(stats), topic: "Statistics" });
  const alg = [
    { q: "Simplify: (3x²)(4x³)", a: "12x⁵" },
    { q: "Expand: (x+3)²", a: "x² + 6x + 9" },
    { q: "Expand: (x-5)(x+2)", a: "x² - 3x - 10" },
    { q: "Factor: x² - 16", a: "(x+4)(x-4)" },
    { q: "Factor: x² + 7x + 12", a: "(x+3)(x+4)" },
    { q: "Solve: 3(x-2) = 12", a: "x = 6" },
    { q: "If f(x) = 2x+3, find f(5)", a: "f(5) = 13" },
    { q: "If f(x) = x², g(x) = x+1, find f(g(2))", a: "f(g(2)) = f(3) = 9" },
    { q: "Solve: 2/x = 4", a: "x = 1/2" },
    { q: "Solve: log₂(x) = 3", a: "x = 8" },
    { q: "Simplify: x³ × x⁴", a: "x⁷" },
    { q: "Simplify: x⁶ / x²", a: "x⁴" },
    { q: "What is the slope of y = 2x + 5?", a: "Slope = 2" },
    { q: "Find the y-intercept of y = -3x + 7", a: "y-intercept = 7" },
    { q: "Solve: 5x - 7 = 3x + 9", a: "x = 8" },
    { q: "Find the slope between (1,2) and (4,11)", a: "(11-2)/(4-1) = 3" },
  ];
  for (let i = 0; i < 100; i++) mathQs.push({ ...pick(alg), topic: "Algebra" });

  // ── PHYSICS (650) ──
  const physQs = [];
  for (let i = 0; i < 100; i++) {
    const d = rand(50, 500), t = rand(2, 20);
    physQs.push({ q: `A car travels ${d} km in ${t} hours. Find average speed.`, a: `v = d/t = ${d}/${t} = ${(d/t).toFixed(2)} km/h`, topic: "Kinematics" });
  }
  for (let i = 0; i < 80; i++) {
    const m = rand(1, 50), v = rand(2, 30);
    physQs.push({ q: `Find KE of a ${m} kg object moving at ${v} m/s.`, a: `KE = ½mv² = ½ × ${m} × ${v}² = ${(0.5 * m * v * v).toFixed(1)} J`, topic: "Energy" });
  }
  const forces = [
    { q: "What is the SI unit of force?", a: "Newton (N) = kg·m/s²" },
    { q: "State Newton's First Law of motion.", a: "An object at rest stays at rest, and an object in motion stays in motion at constant velocity unless acted upon by a net external force." },
    { q: "State Newton's Second Law of motion.", a: "F = ma. Force equals mass times acceleration." },
    { q: "State Newton's Third Law of motion.", a: "For every action there is an equal and opposite reaction." },
    { q: "What is the weight of a 10 kg object on Earth? (g = 9.8 m/s²)", a: "W = mg = 10 × 9.8 = 98 N" },
    { q: "A 2 kg block is pushed with 10 N. Find acceleration.", a: "a = F/m = 10/2 = 5 m/s²" },
    { q: "Define friction.", a: "Force opposing relative motion between two surfaces in contact." },
    { q: "What is centripetal force?", a: "Force directed toward the center of a circular path; F_c = mv²/r" },
    { q: "Define momentum.", a: "p = mv (mass × velocity); SI unit: kg·m/s" },
    { q: "State the law of conservation of momentum.", a: "Total momentum of an isolated system is constant." },
    { q: "What is impulse?", a: "Impulse = F × t = change in momentum" },
    { q: "What is inertia?", a: "Tendency of an object to resist changes in its motion." },
  ];
  for (let i = 0; i < 80; i++) physQs.push({ ...pick(forces), topic: "Forces & Newton's Laws" });
  for (let i = 0; i < 60; i++) {
    const f = rand(100, 2000), v = rand(300, 400);
    physQs.push({ q: `Find wavelength of a wave with frequency ${f} Hz and speed ${v} m/s.`, a: `λ = v/f = ${v}/${f} = ${(v/f).toFixed(3)} m`, topic: "Waves" });
  }
  for (let i = 0; i < 80; i++) {
    const v = rand(3, 30), iA = (rand(1, 10) / 2).toFixed(1);
    physQs.push({ q: `Find resistance if V = ${v}V and I = ${iA}A.`, a: `R = V/I = ${v}/${iA} = ${(v/parseFloat(iA)).toFixed(2)} Ω`, topic: "Electric Circuits" });
  }
  const optics = [
    { q: "What is the speed of light in vacuum?", a: "c = 3 × 10⁸ m/s" },
    { q: "State Snell's law.", a: "n₁ sin(θ₁) = n₂ sin(θ₂)" },
    { q: "What is total internal reflection?", a: "When light travels from denser to less dense medium and angle exceeds critical angle, it reflects entirely." },
    { q: "Define refractive index.", a: "n = c/v (speed of light in vacuum / speed in medium)" },
    { q: "What is dispersion?", a: "Splitting of white light into component colors when passing through a prism." },
    { q: "What lens forms a virtual, upright image?", a: "A concave (diverging) lens, or a convex lens with object inside focal length." },
    { q: "State the lens formula.", a: "1/f = 1/v - 1/u" },
    { q: "What is power of a lens?", a: "P = 1/f (in meters); SI unit: dioptre (D)" },
  ];
  for (let i = 0; i < 50; i++) physQs.push({ ...pick(optics), topic: "Optics" });
  const thermo = [
    { q: "State the first law of thermodynamics.", a: "Energy cannot be created or destroyed (ΔU = Q - W)." },
    { q: "State the second law of thermodynamics.", a: "The total entropy of an isolated system can never decrease." },
    { q: "Define specific heat capacity.", a: "Heat required to raise 1 kg of substance by 1 K (or 1°C)." },
    { q: "What is absolute zero?", a: "0 K = -273.15°C; theoretically all molecular motion ceases." },
    { q: "Convert 27°C to Kelvin.", a: "K = °C + 273 = 300 K" },
    { q: "Define entropy.", a: "Measure of disorder in a system; tends to increase in spontaneous processes." },
    { q: "What is latent heat?", a: "Heat absorbed/released during phase change at constant temperature." },
  ];
  for (let i = 0; i < 50; i++) physQs.push({ ...pick(thermo), topic: "Thermodynamics" });
  const modern = [
    { q: "What is Einstein's mass-energy equivalence formula?", a: "E = mc²" },
    { q: "What did the photoelectric effect demonstrate?", a: "Light has particle nature (photons); energy depends on frequency, not intensity." },
    { q: "What is the de Broglie wavelength formula?", a: "λ = h/p (Planck's constant / momentum)" },
    { q: "Define Heisenberg's uncertainty principle.", a: "Δx·Δp ≥ ℏ/2; you cannot precisely know both position and momentum simultaneously." },
    { q: "What are the four fundamental forces?", a: "Gravitational, electromagnetic, strong nuclear, weak nuclear." },
    { q: "What is half-life?", a: "Time for half of a radioactive substance to decay." },
  ];
  for (let i = 0; i < 50; i++) physQs.push({ ...pick(modern), topic: "Modern Physics" });
  const grav = [
    { q: "State Newton's law of universal gravitation.", a: "F = G(m₁m₂)/r²; G = 6.674 × 10⁻¹¹ N·m²/kg²" },
    { q: "What is escape velocity from Earth?", a: "Approximately 11.2 km/s" },
    { q: "Why does an astronaut feel weightless in orbit?", a: "Free-fall: both astronaut and spacecraft fall toward Earth at the same rate." },
    { q: "State Kepler's third law.", a: "T² ∝ r³ (square of orbital period proportional to cube of semi-major axis)" },
    { q: "What is gravitational potential energy near Earth?", a: "U = mgh" },
  ];
  for (let i = 0; i < 50; i++) physQs.push({ ...pick(grav), topic: "Gravitation" });
  const mag = [
    { q: "State the right-hand rule for magnetic force on a moving charge.", a: "F = qv × B; thumb = velocity, fingers = B field, palm = force direction (positive charge)." },
    { q: "What does Faraday's law of induction state?", a: "EMF = -dΦ/dt (rate of change of magnetic flux)" },
    { q: "What is Lenz's law?", a: "Induced current opposes the change in flux causing it." },
    { q: "What is the SI unit of magnetic flux?", a: "Weber (Wb) = T·m²" },
    { q: "What is Ampère's circuital law?", a: "∮B·dl = μ₀I_enclosed" },
  ];
  for (let i = 0; i < 50; i++) physQs.push({ ...pick(mag), topic: "Electromagnetism" });

  // ── CHEMISTRY (600) ──
  const chemQs = [];
  const elements = [
    {n:"Hydrogen",s:"H",p:1},{n:"Helium",s:"He",p:2},{n:"Lithium",s:"Li",p:3},{n:"Beryllium",s:"Be",p:4},
    {n:"Boron",s:"B",p:5},{n:"Carbon",s:"C",p:6},{n:"Nitrogen",s:"N",p:7},{n:"Oxygen",s:"O",p:8},
    {n:"Fluorine",s:"F",p:9},{n:"Neon",s:"Ne",p:10},{n:"Sodium",s:"Na",p:11},{n:"Magnesium",s:"Mg",p:12},
    {n:"Aluminum",s:"Al",p:13},{n:"Silicon",s:"Si",p:14},{n:"Phosphorus",s:"P",p:15},{n:"Sulfur",s:"S",p:16},
    {n:"Chlorine",s:"Cl",p:17},{n:"Argon",s:"Ar",p:18},{n:"Potassium",s:"K",p:19},{n:"Calcium",s:"Ca",p:20},
    {n:"Iron",s:"Fe",p:26},{n:"Copper",s:"Cu",p:29},{n:"Zinc",s:"Zn",p:30},{n:"Silver",s:"Ag",p:47},
    {n:"Gold",s:"Au",p:79},{n:"Mercury",s:"Hg",p:80},{n:"Lead",s:"Pb",p:82},{n:"Uranium",s:"U",p:92}
  ];
  for (let i = 0; i < 50; i++) {
    const e = pick(elements);
    chemQs.push({ q: `What is the chemical symbol for ${e.n}?`, a: `${e.s}`, topic: "Periodic Table" });
  }
  for (let i = 0; i < 50; i++) {
    const e = pick(elements);
    chemQs.push({ q: `How many protons does ${e.n} (${e.s}) have?`, a: `${e.p} protons (atomic number = ${e.p})`, topic: "Atomic Structure" });
  }
  for (let i = 0; i < 30; i++) {
    const exp = rand(1, 7);
    chemQs.push({ q: `What is the pH of a 1 × 10⁻${exp} M HCl solution?`, a: `pH = -log(10⁻${exp}) = ${exp}`, topic: "Acids & Bases" });
  }
  for (let i = 0; i < 30; i++) {
    const ph = rand(2, 10);
    chemQs.push({ q: `What is the pOH of a solution with pH = ${ph}?`, a: `pOH = 14 - pH = ${14 - ph}`, topic: "Acids & Bases" });
  }
  const balanced = [
    { q: "Balance: H₂ + O₂ → H₂O", a: "2H₂ + O₂ → 2H₂O" },
    { q: "Balance: Fe + O₂ → Fe₂O₃", a: "4Fe + 3O₂ → 2Fe₂O₃" },
    { q: "Balance: CH₄ + O₂ → CO₂ + H₂O", a: "CH₄ + 2O₂ → CO₂ + 2H₂O" },
    { q: "Balance: N₂ + H₂ → NH₃", a: "N₂ + 3H₂ → 2NH₃" },
    { q: "Balance: Na + Cl₂ → NaCl", a: "2Na + Cl₂ → 2NaCl" },
    { q: "Balance: KClO₃ → KCl + O₂", a: "2KClO₃ → 2KCl + 3O₂" },
    { q: "Balance: Al + O₂ → Al₂O₃", a: "4Al + 3O₂ → 2Al₂O₃" },
    { q: "Balance: C₃H₈ + O₂ → CO₂ + H₂O", a: "C₃H₈ + 5O₂ → 3CO₂ + 4H₂O" },
  ];
  for (let i = 0; i < 60; i++) chemQs.push({ ...pick(balanced), topic: "Balancing Equations" });
  for (let i = 0; i < 80; i++) {
    const m = rand(1, 50), mw = rand(18, 200);
    chemQs.push({ q: `Calculate moles in ${m} g of a substance with molar mass ${mw} g/mol.`, a: `n = m/M = ${m}/${mw} = ${(m/mw).toFixed(4)} mol`, topic: "Stoichiometry" });
  }
  const bond = [
    { q: "What type of bond forms between Na and Cl in NaCl?", a: "Ionic bond (electron transfer from Na to Cl)" },
    { q: "What type of bond holds H₂O molecules together?", a: "Covalent bond (shared electrons)" },
    { q: "Define electronegativity.", a: "Tendency of an atom to attract bonding electrons." },
    { q: "What is a hydrogen bond?", a: "Weak intermolecular bond between H attached to electronegative atom (N, O, F) and another electronegative atom." },
    { q: "Draw the Lewis structure of CO₂.", a: "O=C=O (each O has 2 lone pairs, double bonds to C)" },
    { q: "Draw the Lewis structure of H₂O.", a: "H-O-H with 2 lone pairs on O; bent shape." },
    { q: "How many bonds can carbon form?", a: "4 covalent bonds" },
    { q: "What is metallic bonding?", a: "Electrostatic attraction between metal cations and a sea of delocalized electrons." },
  ];
  for (let i = 0; i < 60; i++) chemQs.push({ ...pick(bond), topic: "Chemical Bonding" });
  const org = [
    { q: "What is the general formula of alkanes?", a: "CₙH₂ₙ₊₂" },
    { q: "What is the general formula of alkenes?", a: "CₙH₂ₙ" },
    { q: "What is the IUPAC name of CH₃-CH₂-CH₃?", a: "Propane" },
    { q: "What is the IUPAC name of CH₃-CH₂-OH?", a: "Ethanol" },
    { q: "What functional group is -COOH?", a: "Carboxylic acid" },
    { q: "What functional group is -OH?", a: "Hydroxyl" },
    { q: "What is the difference between alkanes and alkenes?", a: "Alkanes are saturated (single bonds), alkenes have C=C double bonds." },
    { q: "What is benzene's molecular formula?", a: "C₆H₆" },
    { q: "Define isomers.", a: "Compounds with same molecular formula but different structures." },
    { q: "What is polymerization?", a: "Joining many monomers to form a polymer chain." },
  ];
  for (let i = 0; i < 80; i++) chemQs.push({ ...pick(org), topic: "Organic Chemistry" });
  for (let i = 0; i < 60; i++) {
    const m = rand(1, 50), v = (rand(100, 2000) / 1000).toFixed(2), mw = pick([18, 40, 58, 98, 100]);
    const moles = (m / mw).toFixed(3);
    chemQs.push({ q: `Calculate molarity of solution with ${m} g substance (MW = ${mw}) in ${(parseFloat(v) * 1000).toFixed(0)} mL.`, a: `Moles = ${m}/${mw} = ${moles} mol. M = ${moles}/${v} = ${(parseFloat(moles)/parseFloat(v)).toFixed(3)} M`, topic: "Solutions" });
  }
  const tchem = [
    { q: "What is enthalpy?", a: "Heat content of a system at constant pressure (H)." },
    { q: "Define exothermic reaction.", a: "Releases heat to surroundings (ΔH < 0)." },
    { q: "Define endothermic reaction.", a: "Absorbs heat from surroundings (ΔH > 0)." },
    { q: "State Hess's law.", a: "Total enthalpy change is independent of the path taken." },
    { q: "What is activation energy?", a: "Minimum energy required to start a chemical reaction." },
    { q: "What is a catalyst?", a: "Substance that speeds up a reaction without being consumed." },
  ];
  for (let i = 0; i < 50; i++) chemQs.push({ ...pick(tchem), topic: "Thermochemistry" });
  const eq = [
    { q: "State Le Chatelier's principle.", a: "When a system at equilibrium is disturbed, it shifts to counteract the disturbance." },
    { q: "What is dynamic equilibrium?", a: "Forward and reverse rates are equal; concentrations remain constant." },
    { q: "What does a large K_eq value indicate?", a: "Reaction favors products." },
    { q: "Effect of catalyst on equilibrium?", a: "No shift; only reaches equilibrium faster." },
    { q: "Effect of temperature on exothermic equilibrium?", a: "Increasing T shifts equilibrium to reactants (left)." },
  ];
  for (let i = 0; i < 50; i++) chemQs.push({ ...pick(eq), topic: "Chemical Equilibrium" });

  // ── BIOLOGY (600) ──
  const bioQs = [];
  const cell = [
    { q: "What organelle is known as the powerhouse of the cell?", a: "Mitochondria - produce ATP via cellular respiration." },
    { q: "What is the function of the nucleus?", a: "Stores DNA, controls cell activities, and manages gene expression." },
    { q: "What is the function of ribosomes?", a: "Synthesize proteins from amino acids using mRNA template." },
    { q: "What is the function of the cell membrane?", a: "Selectively permeable barrier that controls movement in/out of cell." },
    { q: "Difference between prokaryotic and eukaryotic cells?", a: "Prokaryotes lack a true nucleus and membrane-bound organelles; eukaryotes have both." },
    { q: "Function of the Golgi apparatus?", a: "Modifies, packages, and ships proteins from the ER." },
    { q: "What is the rough ER?", a: "Endoplasmic reticulum with ribosomes; involved in protein synthesis." },
    { q: "Function of lysosomes?", a: "Contain digestive enzymes that break down waste, debris, and pathogens." },
    { q: "What are chloroplasts?", a: "Organelles in plant cells that perform photosynthesis." },
    { q: "Define cytoplasm.", a: "Gel-like substance inside the cell membrane containing organelles." },
    { q: "What is mitosis?", a: "Cell division producing 2 identical diploid daughter cells." },
    { q: "What is meiosis?", a: "Cell division producing 4 genetically unique haploid gametes." },
    { q: "What are stem cells?", a: "Undifferentiated cells able to develop into various specialized cell types." },
  ];
  for (let i = 0; i < 100; i++) bioQs.push({ ...pick(cell), topic: "Cell Biology" });
  const gen = [
    { q: "What are the 4 bases in DNA?", a: "Adenine (A), Thymine (T), Guanine (G), Cytosine (C). A-T, G-C." },
    { q: "What does DNA stand for?", a: "Deoxyribonucleic acid" },
    { q: "What is a gene?", a: "Segment of DNA that codes for a specific protein or trait." },
    { q: "What is a chromosome?", a: "Threadlike structure of DNA wrapped around proteins (histones)." },
    { q: "How many chromosomes do humans have?", a: "46 chromosomes (23 pairs)" },
    { q: "What is genotype vs phenotype?", a: "Genotype = genetic makeup. Phenotype = observable traits." },
    { q: "What is a dominant allele?", a: "Allele that masks the recessive allele in heterozygous condition." },
    { q: "Punnett square Aa × Aa - ratio?", a: "1 AA : 2 Aa : 1 aa (3:1 dominant:recessive phenotype)" },
    { q: "What is DNA replication?", a: "Process where DNA produces two identical copies; semi-conservative." },
    { q: "What is transcription?", a: "DNA is read to produce mRNA in the nucleus." },
    { q: "What is translation?", a: "mRNA is read by ribosomes to assemble proteins from amino acids." },
    { q: "What is a mutation?", a: "Change in DNA sequence; can be neutral, harmful, or beneficial." },
    { q: "Who were Watson and Crick?", a: "Discovered the double-helix structure of DNA (1953)." },
    { q: "Define heredity.", a: "Passing of traits from parents to offspring through genes." },
  ];
  for (let i = 0; i < 100; i++) bioQs.push({ ...pick(gen), topic: "Genetics" });
  const evol = [
    { q: "Who proposed the theory of natural selection?", a: "Charles Darwin (and Alfred Russel Wallace), 1859." },
    { q: "What is natural selection?", a: "Organisms better adapted survive and reproduce more, passing on their traits." },
    { q: "What is adaptation?", a: "Heritable trait that increases an organism's fitness in its environment." },
    { q: "Define species.", a: "Group of organisms that can interbreed and produce fertile offspring." },
    { q: "What is speciation?", a: "Formation of new species, often through reproductive isolation." },
    { q: "What is evidence for evolution?", a: "Fossils, comparative anatomy, embryology, biogeography, DNA similarity." },
    { q: "What is convergent evolution?", a: "Unrelated species evolve similar traits independently (e.g. wings of birds and bats)." },
  ];
  for (let i = 0; i < 60; i++) bioQs.push({ ...pick(evol), topic: "Evolution" });
  const eco = [
    { q: "Define ecosystem.", a: "Community of organisms interacting with each other and their physical environment." },
    { q: "What is a food chain?", a: "Linear sequence of organisms each feeding on the next; energy flow." },
    { q: "What is a producer?", a: "Organism (typically plant) that makes its own food via photosynthesis." },
    { q: "What is a decomposer?", a: "Organism (bacteria, fungi) that breaks down dead matter, recycling nutrients." },
    { q: "Define biodiversity.", a: "Variety of life: genes, species, and ecosystems on Earth." },
    { q: "What is the carbon cycle?", a: "Circulation of carbon through atmosphere, biosphere, oceans, and geosphere." },
    { q: "What is symbiosis?", a: "Long-term interaction between two species: mutualism, commensalism, or parasitism." },
    { q: "Define carrying capacity.", a: "Maximum population an environment can sustain indefinitely." },
    { q: "What causes greenhouse effect?", a: "Gases (CO₂, CH₄, H₂O) trap heat in atmosphere; warming Earth." },
    { q: "Difference between herbivore and omnivore?", a: "Herbivore eats only plants; omnivore eats both plants and animals." },
  ];
  for (let i = 0; i < 80; i++) bioQs.push({ ...pick(eco), topic: "Ecology" });
  const human = [
    { q: "What is the function of red blood cells?", a: "Transport oxygen via hemoglobin to body tissues." },
    { q: "What is the function of white blood cells?", a: "Fight infection and disease (immune response)." },
    { q: "What is the largest organ in the human body?", a: "The skin." },
    { q: "How many chambers does the human heart have?", a: "4 chambers - 2 atria and 2 ventricles." },
    { q: "What is the function of the lungs?", a: "Gas exchange - bring oxygen in, expel carbon dioxide." },
    { q: "What does the liver do?", a: "Detoxifies blood, produces bile, stores glycogen, metabolizes nutrients." },
    { q: "What is the function of the kidneys?", a: "Filter blood, remove waste as urine, regulate fluid balance." },
    { q: "What is the digestive role of the stomach?", a: "Mechanical churning + chemical digestion via HCl and pepsin (proteins)." },
    { q: "What does the small intestine do?", a: "Most nutrient absorption; villi increase surface area." },
    { q: "What is the role of insulin?", a: "Hormone from pancreas; lowers blood glucose by promoting uptake into cells." },
    { q: "What is homeostasis?", a: "Maintaining stable internal conditions despite external changes." },
    { q: "What are the 4 types of tissue?", a: "Epithelial, connective, muscle, nervous." },
    { q: "What is a neuron?", a: "Nerve cell that transmits electrical impulses." },
    { q: "Function of the brain's cerebrum?", a: "Higher thinking, memory, voluntary movement, sensory processing." },
    { q: "Where is hemoglobin found?", a: "In red blood cells; binds O₂ for transport." },
  ];
  for (let i = 0; i < 100; i++) bioQs.push({ ...pick(human), topic: "Human Anatomy" });
  const plant = [
    { q: "What is photosynthesis?", a: "Plants convert sunlight, CO₂ and water into glucose and oxygen. 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂" },
    { q: "What is transpiration?", a: "Loss of water vapor from plant leaves through stomata." },
    { q: "What does chlorophyll do?", a: "Absorbs light energy (mainly red and blue) for photosynthesis." },
    { q: "What is the role of roots?", a: "Anchor plant; absorb water and minerals from soil." },
    { q: "What is xylem?", a: "Vascular tissue that transports water and minerals from roots upward." },
    { q: "What is phloem?", a: "Vascular tissue that transports sugars throughout the plant." },
    { q: "What is pollination?", a: "Transfer of pollen from male anther to female stigma." },
    { q: "What is germination?", a: "Process by which a seed develops into a new plant." },
  ];
  for (let i = 0; i < 80; i++) bioQs.push({ ...pick(plant), topic: "Plant Biology" });
  const micro = [
    { q: "What is a virus?", a: "Non-cellular infectious agent; genetic material in protein coat; needs host to replicate." },
    { q: "Difference between bacteria and viruses?", a: "Bacteria are living single-celled organisms; viruses are non-living particles needing hosts." },
    { q: "What are antibiotics?", a: "Drugs that kill or inhibit bacterial growth (do NOT work on viruses)." },
    { q: "What is the immune system?", a: "Body's defense against pathogens; involves white blood cells and antibodies." },
    { q: "What is a vaccine?", a: "Preparation that stimulates immune response without causing disease." },
    { q: "What is a pathogen?", a: "Microorganism that causes disease (bacteria, viruses, fungi, parasites)." },
  ];
  for (let i = 0; i < 50; i++) bioQs.push({ ...pick(micro), topic: "Microbiology" });
  const misc = [
    { q: "What is a hypothesis?", a: "Testable, falsifiable explanation for an observation.", topic: "Scientific Method" },
    { q: "What does ATP stand for?", a: "Adenosine triphosphate - the cell's main energy currency.", topic: "Biochemistry" },
    { q: "What are enzymes?", a: "Biological catalysts (mostly proteins) that speed up reactions in cells.", topic: "Biochemistry" },
  ];
  for (let i = 0; i < 30; i++) bioQs.push(pick(misc));

  // ── COMPUTER SCIENCE (600) ──
  const csQs = [];
  const csA = [
    { q: "What does CPU stand for?", a: "Central Processing Unit - executes instructions and computations.", topic: "Hardware" },
    { q: "What does RAM stand for?", a: "Random Access Memory - volatile, fast memory used by running programs.", topic: "Hardware" },
    { q: "Time complexity of accessing array element by index?", a: "O(1) - constant time.", topic: "Data Structures" },
    { q: "Difference between stack and queue?", a: "Stack: LIFO. Queue: FIFO.", topic: "Data Structures" },
    { q: "What is recursion?", a: "Function that calls itself with a smaller subproblem; needs a base case.", topic: "Algorithms" },
    { q: "Time complexity of binary search?", a: "O(log n) - must be on a sorted array.", topic: "Algorithms" },
    { q: "Time complexity of linear search?", a: "O(n) - checks each element once.", topic: "Algorithms" },
    { q: "Time complexity of bubble sort?", a: "O(n²) average and worst case.", topic: "Sorting" },
    { q: "Time complexity of merge sort?", a: "O(n log n) in all cases.", topic: "Sorting" },
    { q: "Time complexity of quicksort?", a: "Average O(n log n), worst O(n²).", topic: "Sorting" },
    { q: "What is Big O notation?", a: "Describes upper bound of algorithm growth rate as input grows.", topic: "Complexity" },
    { q: "What is a hash table?", a: "Data structure mapping keys to values via hash function; avg O(1) lookup.", topic: "Data Structures" },
    { q: "What is a binary tree?", a: "Hierarchical structure where each node has at most 2 children.", topic: "Data Structures" },
    { q: "Pre-order traversal?", a: "Root → Left subtree → Right subtree", topic: "Trees" },
    { q: "In-order traversal?", a: "Left → Root → Right (gives sorted output for BST)", topic: "Trees" },
    { q: "Post-order traversal?", a: "Left → Right → Root", topic: "Trees" },
    { q: "What is BFS?", a: "Breadth-First Search; level-by-level; uses a queue.", topic: "Graph Algorithms" },
    { q: "What is DFS?", a: "Depth-First Search; explores far before backtracking; uses stack/recursion.", topic: "Graph Algorithms" },
    { q: "Dijkstra's algorithm purpose?", a: "Shortest path from source to all vertices in weighted graph.", topic: "Graph Algorithms" },
    { q: "What is dynamic programming?", a: "Solve complex problems by breaking into overlapping subproblems and storing results.", topic: "DP" },
    { q: "Fibonacci recurrence?", a: "F(n) = F(n-1) + F(n-2), F(0)=0, F(1)=1.", topic: "DP" },
    { q: "Insertion at end of dynamic array - amortized?", a: "O(1) amortized; O(n) when resizing.", topic: "Data Structures" },
    { q: "Insertion at head of linked list?", a: "O(1) - just adjust pointers.", topic: "Data Structures" },
    { q: "What is a function in programming?", a: "Reusable block of code that performs a specific task.", topic: "Programming" },
    { q: "Difference between == and === in JS?", a: "== compares values with type coercion; === compares value AND type strictly.", topic: "JavaScript" },
    { q: "What is OOP?", a: "Object-Oriented Programming - code organized around objects with attributes/methods.", topic: "OOP" },
    { q: "Four pillars of OOP?", a: "Encapsulation, Inheritance, Polymorphism, Abstraction.", topic: "OOP" },
    { q: "What is encapsulation?", a: "Bundling data and methods within a class; data hiding.", topic: "OOP" },
    { q: "What is inheritance?", a: "Mechanism where one class derives properties from another.", topic: "OOP" },
    { q: "What is polymorphism?", a: "Same interface, different implementations.", topic: "OOP" },
    { q: "What is HTTP?", a: "HyperText Transfer Protocol - application protocol for the web.", topic: "Networking" },
    { q: "Difference between GET and POST?", a: "GET retrieves data (visible URL); POST sends data in request body.", topic: "Networking" },
    { q: "What is REST?", a: "Architectural style for web APIs using HTTP methods.", topic: "Web" },
    { q: "What is SQL?", a: "Structured Query Language - manages relational databases.", topic: "Databases" },
    { q: "SQL: select all from users table.", a: "SELECT * FROM users;", topic: "SQL" },
    { q: "What is normalization?", a: "Organizing data to reduce redundancy and improve integrity.", topic: "Databases" },
    { q: "What is a primary key?", a: "Unique identifier for each row; non-null and unique.", topic: "Databases" },
    { q: "What is a foreign key?", a: "Field referencing primary key of another table; enforces integrity.", topic: "Databases" },
    { q: "Python: check if number is prime.", a: "def is_prime(n):\\n  if n<2: return False\\n  for i in range(2, int(n**0.5)+1):\\n    if n%i==0: return False\\n  return True", topic: "Python" },
    { q: "Python: reverse a string.", a: "def reverse(s): return s[::-1]", topic: "Python" },
    { q: "What is a palindrome?", a: "String that reads same forward and backward.", topic: "Strings" },
    { q: "What is git?", a: "Distributed version control system for tracking source code changes.", topic: "Git" },
    { q: "What does 'git commit' do?", a: "Records staged changes to local repo with a message.", topic: "Git" },
    { q: "What does 'git push' do?", a: "Sends committed changes to remote repository.", topic: "Git" },
    { q: "Recursion's base case?", a: "Condition that stops recursive calls; prevents infinite recursion.", topic: "Recursion" },
    { q: "Define API.", a: "Application Programming Interface - rules for software components to communicate.", topic: "Software Eng" },
    { q: "What is an array?", a: "Contiguous memory storing elements of same type, accessed by index.", topic: "Data Structures" },
    { q: "What is a linked list?", a: "Linear structure where each node points to next; dynamic size.", topic: "Data Structures" },
    { q: "HashMap.get() time complexity?", a: "Average O(1), worst O(n) with collisions.", topic: "Data Structures" },
    { q: "Worst-case time of insertion sort?", a: "O(n²) when array is reverse-sorted.", topic: "Sorting" },
    { q: "Best-case time of insertion sort?", a: "O(n) on already-sorted input.", topic: "Sorting" },
    { q: "What is a deadlock?", a: "Two processes waiting on each other indefinitely; no progress.", topic: "OS" },
    { q: "What is virtual memory?", a: "Memory abstraction allowing programs to use more memory than physical; uses disk swap.", topic: "OS" },
    { q: "Thread vs process?", a: "Process: independent with own memory. Thread: lightweight unit within a process; shares memory.", topic: "OS" },
  ];
  for (let i = 0; i < 600; i++) csQs.push(pick(csA));

  // ── ENGLISH (500) ──
  const engQs = [];
  const engA = [
    { q: "What is a noun?", a: "A word that names a person, place, thing, or idea.", topic: "Parts of Speech" },
    { q: "What is a verb?", a: "A word that expresses an action or state of being.", topic: "Parts of Speech" },
    { q: "What is an adjective?", a: "A word that describes or modifies a noun.", topic: "Parts of Speech" },
    { q: "What is an adverb?", a: "A word that modifies a verb, adjective, or another adverb.", topic: "Parts of Speech" },
    { q: "Define a metaphor.", a: "Direct comparison between two unlike things.", topic: "Literary Devices" },
    { q: "Define a simile.", a: "Comparison using 'like' or 'as'.", topic: "Literary Devices" },
    { q: "Define alliteration.", a: "Repetition of initial consonant sounds in nearby words.", topic: "Literary Devices" },
    { q: "Define personification.", a: "Giving human characteristics to non-human things.", topic: "Literary Devices" },
    { q: "What is hyperbole?", a: "Deliberate exaggeration for emphasis.", topic: "Literary Devices" },
    { q: "What is irony?", a: "Contrast between expected and actual outcome.", topic: "Literary Devices" },
    { q: "Synonym for 'happy'?", a: "Joyful, glad, delighted, cheerful, content, elated.", topic: "Vocabulary" },
    { q: "Antonym for 'difficult'?", a: "Easy, simple, effortless, straightforward.", topic: "Vocabulary" },
    { q: "Synonym for 'big'?", a: "Large, huge, enormous, immense, massive, gigantic.", topic: "Vocabulary" },
    { q: "Synonym for 'sad'?", a: "Sorrowful, mournful, dejected, melancholy, gloomy.", topic: "Vocabulary" },
    { q: "Define onomatopoeia.", a: "Word that imitates the sound it represents.", topic: "Literary Devices" },
    { q: "What is a thesis statement?", a: "Single sentence summarizing the main argument of an essay.", topic: "Writing" },
    { q: "What is a topic sentence?", a: "First sentence of paragraph introducing main idea.", topic: "Writing" },
    { q: "Active vs passive voice?", a: "Active: subject performs action. Passive: subject receives action.", topic: "Grammar" },
    { q: "Their vs there vs they're?", a: "Their = possessive. There = location. They're = they are.", topic: "Grammar" },
    { q: "Your vs you're?", a: "Your = possessive. You're = you are.", topic: "Grammar" },
    { q: "Its vs it's?", a: "Its = possessive. It's = it is.", topic: "Grammar" },
    { q: "What is a conjunction?", a: "Word connecting clauses, phrases, or words (and, but, or).", topic: "Parts of Speech" },
    { q: "What is a preposition?", a: "Word showing relationship between noun and another word (in, on, under).", topic: "Parts of Speech" },
    { q: "Who wrote 'Romeo and Juliet'?", a: "William Shakespeare", topic: "Literature" },
    { q: "Who wrote 'Pride and Prejudice'?", a: "Jane Austen", topic: "Literature" },
    { q: "Who wrote '1984'?", a: "George Orwell", topic: "Literature" },
    { q: "Who wrote 'To Kill a Mockingbird'?", a: "Harper Lee", topic: "Literature" },
    { q: "What is a sonnet?", a: "14-line poem, typically iambic pentameter with specific rhyme scheme.", topic: "Poetry" },
    { q: "What is iambic pentameter?", a: "Line with 5 metrical feet, each unstressed-stressed.", topic: "Poetry" },
    { q: "What is a protagonist?", a: "Main character around whom the plot revolves.", topic: "Literature" },
    { q: "What is an antagonist?", a: "Character or force opposing the protagonist.", topic: "Literature" },
    { q: "Define foreshadowing.", a: "Hint or clue about future events in a story.", topic: "Literary Devices" },
    { q: "Define symbolism.", a: "Using objects/characters to represent larger ideas or themes.", topic: "Literary Devices" },
    { q: "What is a soliloquy?", a: "Speech where character speaks thoughts aloud, alone on stage.", topic: "Drama" },
    { q: "Difference between simile and metaphor?", a: "Simile uses 'like' or 'as'; metaphor compares directly.", topic: "Literary Devices" },
  ];
  for (let i = 0; i < 500; i++) engQs.push(pick(engA));

  // ── HISTORY (500) ──
  const histQs = [];
  const histA = [
    { q: "When did World War II end?", a: "1945 (May in Europe, September in Pacific)", topic: "WWII" },
    { q: "When did World War I begin?", a: "1914", topic: "WWI" },
    { q: "First President of the USA?", a: "George Washington (1789-1797)", topic: "US History" },
    { q: "First PM of independent India?", a: "Jawaharlal Nehru (1947-1964)", topic: "Indian History" },
    { q: "When did India gain independence?", a: "August 15, 1947", topic: "Indian History" },
    { q: "Who led India's nonviolent independence movement?", a: "Mahatma Gandhi", topic: "Indian History" },
    { q: "When was Indian Constitution adopted?", a: "January 26, 1950 (Republic Day)", topic: "Indian History" },
    { q: "Architect of Indian Constitution?", a: "Dr. B. R. Ambedkar", topic: "Indian History" },
    { q: "First emperor of Mughal Empire?", a: "Babur (1526)", topic: "Indian History" },
    { q: "Emperor who built the Taj Mahal?", a: "Shah Jahan (memory of Mumtaz Mahal)", topic: "Indian History" },
    { q: "When did the French Revolution begin?", a: "1789", topic: "European History" },
    { q: "Who was Napoleon Bonaparte?", a: "French military leader and Emperor; 1769-1821.", topic: "European History" },
    { q: "What was the Industrial Revolution?", a: "Period (~1760-1840) of major industrialization beginning in Britain.", topic: "Industrial Revolution" },
    { q: "What was the Cold War?", a: "Geopolitical tension between USA and USSR (1947-1991).", topic: "Cold War" },
    { q: "When did the Berlin Wall fall?", a: "November 9, 1989", topic: "Cold War" },
    { q: "When did the Soviet Union dissolve?", a: "December 1991", topic: "Cold War" },
    { q: "Who wrote the Declaration of Independence?", a: "Thomas Jefferson (1776, USA)", topic: "US History" },
    { q: "When was the American Civil War?", a: "1861-1865", topic: "US History" },
    { q: "Who was the 16th US President?", a: "Abraham Lincoln (1861-1865)", topic: "US History" },
    { q: "What was the Renaissance?", a: "Cultural rebirth in Europe (~14th-17th centuries) starting in Italy.", topic: "Renaissance" },
    { q: "Who painted the Mona Lisa?", a: "Leonardo da Vinci", topic: "Renaissance Art" },
    { q: "Who was Christopher Columbus?", a: "Italian explorer who sailed to the Americas in 1492.", topic: "Exploration" },
    { q: "What was the Roman Empire?", a: "Empire centered in Rome, ~27 BCE-476 CE; influenced law, language, architecture.", topic: "Ancient" },
    { q: "Who was Julius Caesar?", a: "Roman general/dictator, assassinated 44 BCE.", topic: "Ancient Rome" },
    { q: "Who was Alexander the Great?", a: "King of Macedonia (356-323 BCE); built one of largest empires.", topic: "Ancient Greece" },
    { q: "What was the Holocaust?", a: "Genocide by Nazi Germany (~1941-1945); ~6 million Jews killed.", topic: "WWII" },
    { q: "Who was Adolf Hitler?", a: "Leader of Nazi Germany (1933-1945); initiated WWII and Holocaust.", topic: "WWII" },
    { q: "When did Mauryan Empire flourish?", a: "~322-185 BCE in ancient India.", topic: "Indian History" },
    { q: "Who was Ashoka the Great?", a: "Mauryan emperor (~268-232 BCE); promoted Buddhism after Kalinga War.", topic: "Indian History" },
    { q: "Founder of Buddhism?", a: "Siddhartha Gautama (Buddha), ~6th century BCE", topic: "Religion" },
    { q: "Founder of Sikhism?", a: "Guru Nanak Dev Ji (1469-1539)", topic: "Religion" },
    { q: "What was the Magna Carta?", a: "1215 English charter limiting king's power.", topic: "European History" },
    { q: "What was the Battle of Plassey?", a: "1757 battle in Bengal; British East India Company victory began British rule in India.", topic: "Indian History" },
    { q: "What was the Sepoy Mutiny / Revolt of 1857?", a: "First major Indian uprising against British East India Company rule.", topic: "Indian History" },
    { q: "What was the Quit India Movement?", a: "1942 mass civil disobedience movement against British rule, led by Gandhi.", topic: "Indian History" },
  ];
  for (let i = 0; i < 500; i++) histQs.push(pick(histA));

  // ── GEOGRAPHY (500) ──
  const geoQs = [];
  const geoA = [
    { q: "Largest continent by area?", a: "Asia", topic: "Continents" },
    { q: "Smallest continent?", a: "Australia (Oceania)", topic: "Continents" },
    { q: "Name all 7 continents.", a: "Asia, Africa, North America, South America, Antarctica, Europe, Australia/Oceania", topic: "Continents" },
    { q: "Longest river in the world?", a: "The Nile (~6,650 km)", topic: "Rivers" },
    { q: "Largest ocean?", a: "Pacific Ocean", topic: "Oceans" },
    { q: "Name all 5 oceans.", a: "Pacific, Atlantic, Indian, Southern (Antarctic), Arctic.", topic: "Oceans" },
    { q: "Highest mountain in the world?", a: "Mount Everest (8,848 m)", topic: "Mountains" },
    { q: "Continent of the Sahara Desert?", a: "Africa", topic: "Deserts" },
    { q: "Capital of France?", a: "Paris", topic: "Capitals" },
    { q: "Capital of Japan?", a: "Tokyo", topic: "Capitals" },
    { q: "Capital of India?", a: "New Delhi", topic: "Capitals" },
    { q: "Capital of Australia?", a: "Canberra", topic: "Capitals" },
    { q: "Capital of Brazil?", a: "Brasília", topic: "Capitals" },
    { q: "Capital of Canada?", a: "Ottawa", topic: "Capitals" },
    { q: "Capital of Russia?", a: "Moscow", topic: "Capitals" },
    { q: "Capital of China?", a: "Beijing", topic: "Capitals" },
    { q: "Capital of South Africa?", a: "Pretoria (executive), Cape Town (legislative), Bloemfontein (judicial)", topic: "Capitals" },
    { q: "Country with largest population?", a: "India (recently overtook China)", topic: "Population" },
    { q: "Smallest country in the world?", a: "Vatican City (~0.49 km²)", topic: "Countries" },
    { q: "Country with largest area?", a: "Russia (~17.1 million km²)", topic: "Countries" },
    { q: "What is the equator?", a: "0° latitude line dividing Earth into Northern and Southern Hemispheres.", topic: "Concepts" },
    { q: "What is the prime meridian?", a: "0° longitude line through Greenwich, England.", topic: "Concepts" },
    { q: "What causes seasons?", a: "Earth's axial tilt (~23.5°) as it orbits the Sun.", topic: "Earth Science" },
    { q: "What is a tsunami?", a: "Giant ocean wave caused by earthquake, volcano, or landslide.", topic: "Disasters" },
    { q: "What is a volcano?", a: "Vent in Earth's crust through which magma erupts.", topic: "Geology" },
    { q: "What are tectonic plates?", a: "Massive slabs of lithosphere; their interactions cause quakes/volcanoes.", topic: "Geology" },
    { q: "What is the Ring of Fire?", a: "Region around Pacific Ocean with high seismic and volcanic activity.", topic: "Geology" },
    { q: "What is the Amazon rainforest?", a: "World's largest tropical rainforest, mostly in Brazil; rich biodiversity.", topic: "Biomes" },
    { q: "What is climate?", a: "Long-term average weather pattern (over 30+ years).", topic: "Climate" },
    { q: "What is weather?", a: "Day-to-day atmospheric conditions (temperature, precipitation, wind).", topic: "Climate" },
    { q: "What causes tides?", a: "Gravitational pull of the Moon (and Sun) on oceans.", topic: "Oceanography" },
    { q: "What is latitude?", a: "Angular distance north or south of the equator (0° to 90°).", topic: "Concepts" },
    { q: "What is longitude?", a: "Angular distance east or west of the prime meridian (0° to 180°).", topic: "Concepts" },
    { q: "Name the layers of Earth.", a: "Crust, mantle, outer core, inner core.", topic: "Earth Structure" },
    { q: "What is GDP?", a: "Gross Domestic Product - total value of goods and services in a country.", topic: "Economic Geo" },
  ];
  for (let i = 0; i < 500; i++) geoQs.push(pick(geoA));

  // ── PSYCHOLOGY (500) ──
  const psyQs = [];
  const psyA = [
    { q: "Father of psychology?", a: "Wilhelm Wundt - established first psychology lab in 1879 (Leipzig).", topic: "History" },
    { q: "Who founded psychoanalysis?", a: "Sigmund Freud (late 19th-early 20th century).", topic: "Psychoanalysis" },
    { q: "Freud's three components of personality?", a: "Id (instinct), Ego (rational), Superego (moral).", topic: "Personality" },
    { q: "What is operant conditioning?", a: "Learning where behavior is shaped by consequences; B.F. Skinner.", topic: "Learning" },
    { q: "What is classical conditioning?", a: "Learning by association - Pavlov's dogs salivating at a bell.", topic: "Learning" },
    { q: "Who was Ivan Pavlov?", a: "Russian physiologist who discovered classical conditioning.", topic: "Learning" },
    { q: "Maslow's hierarchy of needs?", a: "Pyramid: physiological → safety → love/belonging → esteem → self-actualization.", topic: "Motivation" },
    { q: "What is cognitive dissonance?", a: "Mental discomfort from holding contradictory beliefs/actions; Festinger (1957).", topic: "Social Psych" },
    { q: "What is the bystander effect?", a: "People less likely to help when others are present.", topic: "Social Psych" },
    { q: "What is confirmation bias?", a: "Tendency to seek information confirming existing beliefs.", topic: "Cognitive Bias" },
    { q: "What is the placebo effect?", a: "Improvement from a treatment with no active ingredient.", topic: "Research" },
    { q: "Erikson's stages of psychosocial development?", a: "8 stages: trust vs mistrust through ego integrity vs despair.", topic: "Development" },
    { q: "Piaget's theory of cognitive development?", a: "4 stages: sensorimotor, preoperational, concrete operational, formal operational.", topic: "Development" },
    { q: "Short-term memory capacity (Miller's law)?", a: "About 7 ± 2 items.", topic: "Memory" },
    { q: "What is long-term memory?", a: "Memory store with practically unlimited capacity and duration.", topic: "Memory" },
    { q: "What is working memory?", a: "System holding/manipulating info temporarily for cognitive tasks.", topic: "Memory" },
    { q: "What is depression (clinical)?", a: "Mood disorder with persistent sadness, loss of interest, fatigue.", topic: "Disorders" },
    { q: "What is anxiety disorder?", a: "Excessive worry/fear that interferes with daily life.", topic: "Disorders" },
    { q: "Define neuroplasticity.", a: "Brain's ability to reorganize by forming new neural connections.", topic: "Neuroscience" },
    { q: "What is a neurotransmitter?", a: "Chemical messenger transmitting signals across synapses.", topic: "Neuroscience" },
    { q: "What does dopamine do?", a: "Involved in reward, motivation, motor control.", topic: "Neuroscience" },
    { q: "What does serotonin do?", a: "Regulates mood, appetite, sleep; SSRI target.", topic: "Neuroscience" },
    { q: "What is REM sleep?", a: "Rapid Eye Movement - sleep stage with vivid dreaming.", topic: "Sleep" },
    { q: "Difference between IQ and EQ?", a: "IQ = cognitive intelligence. EQ = emotional intelligence.", topic: "Intelligence" },
    { q: "Stanford prison experiment?", a: "1971 study by Zimbardo showing how role assignments affect behavior.", topic: "Social Psych" },
    { q: "Milgram experiment?", a: "1961 study showing people obey authority even commanded to harm others.", topic: "Social Psych" },
    { q: "What is groupthink?", a: "Group desire for harmony leads to poor decisions.", topic: "Social Psych" },
    { q: "Define schema in psychology.", a: "Mental framework helping organize and interpret information.", topic: "Cognitive" },
    { q: "What is reinforcement?", a: "Anything that increases likelihood of a behavior.", topic: "Learning" },
    { q: "What is punishment in operant conditioning?", a: "Consequence that decreases likelihood of behavior.", topic: "Learning" },
    { q: "What is fight-or-flight?", a: "Physiological reaction to threat; sympathetic nervous system activation.", topic: "Stress" },
    { q: "What is empathy?", a: "Ability to understand and share feelings of another.", topic: "Social Psych" },
  ];
  for (let i = 0; i < 500; i++) psyQs.push(pick(psyA));

  // ── ECONOMICS (500) ──
  const econQs = [];
  const econA = [
    { q: "What is economics?", a: "Study of how individuals/societies allocate scarce resources to satisfy unlimited wants.", topic: "Basics" },
    { q: "Microeconomics vs macroeconomics?", a: "Micro: individuals, firms, markets. Macro: economy as a whole.", topic: "Basics" },
    { q: "What is GDP?", a: "Gross Domestic Product - total value of goods/services produced within a country.", topic: "Macro" },
    { q: "What is inflation?", a: "General rise in prices over time; reduces purchasing power.", topic: "Macro" },
    { q: "What is deflation?", a: "Sustained fall in general price levels.", topic: "Macro" },
    { q: "What is supply and demand?", a: "Market force; equilibrium where quantity supplied equals demanded.", topic: "Micro" },
    { q: "Law of demand?", a: "Other factors equal, as price rises, quantity demanded falls.", topic: "Micro" },
    { q: "Law of supply?", a: "Other factors equal, as price rises, quantity supplied rises.", topic: "Micro" },
    { q: "What is opportunity cost?", a: "Cost of next best alternative forgone.", topic: "Basics" },
    { q: "What is a recession?", a: "Significant decline in economic activity for two+ consecutive quarters.", topic: "Macro" },
    { q: "What is fiscal policy?", a: "Government's spending and taxation actions to influence the economy.", topic: "Policy" },
    { q: "What is monetary policy?", a: "Central bank actions to control money supply and interest rates.", topic: "Policy" },
    { q: "Who is Adam Smith?", a: "18th-century Scottish philosopher; 'father of modern economics'.", topic: "History" },
    { q: "What is the 'invisible hand'?", a: "Smith's concept that self-interest leads to societal benefit.", topic: "History" },
    { q: "What is capitalism?", a: "Economic system based on private ownership and market production.", topic: "Systems" },
    { q: "What is socialism?", a: "Economic system where production is regulated by community or state.", topic: "Systems" },
    { q: "What is a monopoly?", a: "Single seller controls entire market for a good/service.", topic: "Market Structure" },
    { q: "What is an oligopoly?", a: "Market dominated by a small number of large firms.", topic: "Market Structure" },
    { q: "What is perfect competition?", a: "Many firms, identical products, free entry/exit, perfect information.", topic: "Market Structure" },
    { q: "What is elasticity of demand?", a: "How much quantity demanded changes with price changes.", topic: "Micro" },
    { q: "What is unemployment?", a: "% of labor force actively seeking but unable to find work.", topic: "Macro" },
    { q: "What is the Federal Reserve?", a: "USA central bank - controls monetary policy.", topic: "Institutions" },
    { q: "What does RBI stand for?", a: "Reserve Bank of India - India's central bank.", topic: "Institutions" },
    { q: "What is GST in India?", a: "Goods and Services Tax (introduced 2017).", topic: "Indian Economy" },
    { q: "Define inflation rate.", a: "Annual percentage change in a price index (e.g., CPI).", topic: "Macro" },
    { q: "What is CPI?", a: "Consumer Price Index - measures average price change in a basket of goods.", topic: "Macro" },
    { q: "What are exports?", a: "Goods/services produced domestically and sold abroad.", topic: "Trade" },
    { q: "What are imports?", a: "Goods/services bought from abroad.", topic: "Trade" },
    { q: "What is trade deficit?", a: "When imports exceed exports.", topic: "Trade" },
    { q: "What is a tariff?", a: "Tax on imported goods.", topic: "Trade" },
  ];
  for (let i = 0; i < 500; i++) econQs.push(pick(econA));

  // ── POLITICAL SCIENCE (500) ──
  const polQs = [];
  const polA = [
    { q: "What is democracy?", a: "Government by the people, typically through elected representatives.", topic: "Government" },
    { q: "Democracy vs dictatorship?", a: "Democracy: power from people. Dictatorship: power concentrated in one person/group.", topic: "Government" },
    { q: "What is a republic?", a: "Government where head of state is elected (not hereditary).", topic: "Government" },
    { q: "What is separation of powers?", a: "Dividing government into legislative, executive, judicial for checks and balances.", topic: "Structure" },
    { q: "Three branches of Indian government?", a: "Legislature (Parliament), Executive (President/PM), Judiciary (Supreme Court).", topic: "Indian Govt" },
    { q: "How many states in India?", a: "28 states and 8 union territories.", topic: "Indian Govt" },
    { q: "Components of Indian Parliament?", a: "Lok Sabha (lower), Rajya Sabha (upper), and the President.", topic: "Indian Govt" },
    { q: "What is Lok Sabha?", a: "House of the People - directly elected; 543 members.", topic: "Indian Govt" },
    { q: "What is Rajya Sabha?", a: "Council of States - indirectly elected; up to 250 members.", topic: "Indian Govt" },
    { q: "Head of state in India?", a: "The President of India.", topic: "Indian Govt" },
    { q: "Head of government in India?", a: "The Prime Minister of India.", topic: "Indian Govt" },
    { q: "Fundamental rights in Indian Constitution?", a: "6 rights: equality, freedom, against exploitation, religion, cultural/educational, constitutional remedies.", topic: "Constitution" },
    { q: "Right to equality?", a: "Article 14-18: equality before law, no discrimination on religion/caste/sex.", topic: "Constitution" },
    { q: "Right to freedom?", a: "Article 19-22: speech, assembly, association, movement, etc.", topic: "Constitution" },
    { q: "Right to constitutional remedies?", a: "Article 32: approach courts for enforcement of fundamental rights.", topic: "Constitution" },
    { q: "What are the 5 writs?", a: "Habeas corpus, mandamus, prohibition, certiorari, quo warranto.", topic: "Constitution" },
    { q: "Define federalism.", a: "Power divided between central government and constituent units.", topic: "Concepts" },
    { q: "Unitary vs federal government?", a: "Unitary: power centralized. Federal: power divided.", topic: "Concepts" },
    { q: "What is the United Nations?", a: "Intergovernmental organization (1945) for international cooperation.", topic: "International" },
    { q: "5 permanent UN Security Council members?", a: "USA, UK, France, China, Russia (have veto power).", topic: "International" },
    { q: "What is NATO?", a: "North Atlantic Treaty Organization - military alliance (1949).", topic: "International" },
    { q: "Preamble to Indian Constitution?", a: "Declares India a sovereign, socialist, secular, democratic republic.", topic: "Constitution" },
    { q: "What is secularism (India)?", a: "State has no official religion; treats all religions equally.", topic: "Concepts" },
    { q: "What is sovereignty?", a: "Supreme authority of a state to govern itself.", topic: "Concepts" },
    { q: "What is a constitution?", a: "Fundamental document outlining principles, structure, and powers of government.", topic: "Concepts" },
    { q: "What is the Westminster system?", a: "Parliamentary democracy modeled after Britain.", topic: "Government" },
    { q: "What is universal adult franchise?", a: "Right to vote granted to all adult citizens regardless of caste/religion/gender.", topic: "Concepts" },
    { q: "What is judicial review?", a: "Court's power to review legislative/executive actions for constitutionality.", topic: "Judiciary" },
  ];
  for (let i = 0; i < 500; i++) polQs.push(pick(polA));

  // ── PHILOSOPHY (500) ──
  const phiQs = [];
  const phiA = [
    { q: "Who was Socrates?", a: "Ancient Greek philosopher (470-399 BCE); known for the Socratic method.", topic: "Ancient" },
    { q: "Who was Plato?", a: "Greek philosopher; student of Socrates, teacher of Aristotle.", topic: "Ancient" },
    { q: "Who was Aristotle?", a: "Greek philosopher; tutor to Alexander the Great; founded formal logic.", topic: "Ancient" },
    { q: "What is the Socratic method?", a: "Inquiry using probing questions to stimulate critical thinking.", topic: "Methods" },
    { q: "What is metaphysics?", a: "Branch concerning fundamental nature of reality and existence.", topic: "Branches" },
    { q: "What is epistemology?", a: "Study of knowledge - its nature, sources, scope, and limits.", topic: "Branches" },
    { q: "What is ethics?", a: "Branch concerning right and wrong conduct, moral values.", topic: "Branches" },
    { q: "What is logic?", a: "Study of valid reasoning and inference.", topic: "Branches" },
    { q: "What is aesthetics?", a: "Study of beauty, art, and taste.", topic: "Branches" },
    { q: "What is utilitarianism?", a: "Actions are right if they maximize overall happiness (Bentham, Mill).", topic: "Ethics" },
    { q: "What is deontology?", a: "Ethics based on rules/duties regardless of consequences (Kant).", topic: "Ethics" },
    { q: "What is virtue ethics?", a: "Ethics focused on character traits and virtues (Aristotle).", topic: "Ethics" },
    { q: "Who said 'I think, therefore I am'?", a: "René Descartes (Cogito, ergo sum).", topic: "Modern" },
    { q: "What is existentialism?", a: "Emphasizes individual existence, freedom, and choice (Sartre, Camus).", topic: "Existentialism" },
    { q: "Who was Friedrich Nietzsche?", a: "German philosopher (1844-1900); will to power, 'God is dead'.", topic: "Modern" },
    { q: "Plato's allegory of the cave?", a: "Metaphor for ignorance vs enlightenment.", topic: "Plato" },
    { q: "What is the categorical imperative?", a: "Kant's principle: act only according to maxims you'd will to be universal laws.", topic: "Kant" },
    { q: "What is rationalism?", a: "Reason as chief source of knowledge (Descartes, Spinoza, Leibniz).", topic: "Schools" },
    { q: "What is empiricism?", a: "Knowledge primarily from sensory experience (Locke, Hume).", topic: "Schools" },
    { q: "What is Stoicism?", a: "Ancient philosophy emphasizing virtue, reason, and acceptance.", topic: "Schools" },
    { q: "Buddhism's central teaching?", a: "Four Noble Truths and Eightfold Path.", topic: "Eastern" },
    { q: "What is Confucianism?", a: "Chinese philosophy emphasizing ethics, family, social harmony.", topic: "Eastern" },
    { q: "What is karma in Indian philosophy?", a: "Law of cause and effect; actions affect future ones.", topic: "Indian" },
    { q: "What is dharma?", a: "Sanskrit concept of duty, righteousness, moral order.", topic: "Indian" },
    { q: "What is moksha?", a: "Liberation from cycle of rebirth (samsara) in Hindu philosophy.", topic: "Indian" },
  ];
  for (let i = 0; i < 500; i++) phiQs.push(pick(phiA));

  // ── SOCIOLOGY (500) ──
  const socQs = [];
  const socA = [
    { q: "What is sociology?", a: "Scientific study of society, social behavior, and institutions.", topic: "Basics" },
    { q: "Founder of sociology?", a: "Auguste Comte (1798-1857); coined the term.", topic: "History" },
    { q: "Who was Emile Durkheim?", a: "French sociologist; studied social facts, suicide, religion.", topic: "Theorists" },
    { q: "Who was Max Weber?", a: "German sociologist; studied bureaucracy, Protestant ethic.", topic: "Theorists" },
    { q: "Who was Karl Marx?", a: "Sociologist; class conflict theory; materialist conception of history.", topic: "Theorists" },
    { q: "What is socialization?", a: "Process by which individuals learn norms, values, behaviors.", topic: "Concepts" },
    { q: "What is culture?", a: "Shared beliefs, values, customs of a group/society.", topic: "Concepts" },
    { q: "What is a norm?", a: "Established standard of behavior shared by members of a group.", topic: "Concepts" },
    { q: "Mores vs folkways?", a: "Mores: strict moral standards. Folkways: everyday customs.", topic: "Concepts" },
    { q: "What is social stratification?", a: "Hierarchical arrangement based on wealth, power, prestige.", topic: "Stratification" },
    { q: "What is the caste system?", a: "Rigid social stratification based on birth, especially in Hindu Indian society.", topic: "Stratification" },
    { q: "Class in Marxist terms?", a: "Group defined by relationship to means of production.", topic: "Marxism" },
    { q: "What is gender?", a: "Socially constructed roles/behaviors associated with being male/female/non-binary.", topic: "Gender" },
    { q: "Sex vs gender?", a: "Sex: biological. Gender: social/cultural construct.", topic: "Gender" },
    { q: "What is feminism?", a: "Movement advocating gender equality.", topic: "Gender" },
    { q: "What is patriarchy?", a: "Social system in which men hold primary power.", topic: "Gender" },
    { q: "What is a socialization agent?", a: "Person/group/institution teaching norms (family, school, peers, media).", topic: "Concepts" },
    { q: "What is deviance?", a: "Behavior that violates social norms.", topic: "Deviance" },
    { q: "What is anomie (Durkheim)?", a: "Breakdown of social norms; sense of normlessness.", topic: "Deviance" },
    { q: "Symbolic interactionism?", a: "Society constructed through interactions and shared symbols (Mead, Blumer).", topic: "Theories" },
    { q: "What is functionalism?", a: "Society as a system of interrelated parts working together (Durkheim, Parsons).", topic: "Theories" },
    { q: "What is conflict theory?", a: "Society as struggle between groups for resources/power (Marx, Weber).", topic: "Theories" },
    { q: "What is globalization?", a: "Increasing interconnectedness through trade, technology, culture.", topic: "Modern" },
    { q: "What is urbanization?", a: "Population shift from rural to urban areas.", topic: "Modern" },
    { q: "What is a social institution?", a: "Established system meeting societal needs (family, education, religion).", topic: "Concepts" },
    { q: "What is the nuclear family?", a: "Family unit consisting of parents and their children only.", topic: "Family" },
    { q: "What is the joint family?", a: "Extended family living together (parents, children, grandparents).", topic: "Family" },
  ];
  for (let i = 0; i < 500; i++) socQs.push(pick(socA));

  // ── STATISTICS (500) ──
  const statsQs = [];
  const statsA = [
    { q: "What is the mean?", a: "Sum of all values divided by the count; arithmetic average.", topic: "Central Tendency" },
    { q: "What is the median?", a: "Middle value in an ordered dataset.", topic: "Central Tendency" },
    { q: "What is the mode?", a: "Most frequently occurring value in a dataset.", topic: "Central Tendency" },
    { q: "What is variance?", a: "Average of squared deviations from the mean; measures spread.", topic: "Spread" },
    { q: "What is standard deviation?", a: "Square root of variance; spread in same units as data.", topic: "Spread" },
    { q: "What is the range?", a: "Difference between maximum and minimum values.", topic: "Spread" },
    { q: "What is the IQR?", a: "Q3 - Q1; spread of middle 50% of data.", topic: "Spread" },
    { q: "What is a p-value?", a: "Probability of observing data as extreme as observed, assuming null is true.", topic: "Hypothesis" },
    { q: "Common significance level?", a: "α = 0.05 (5%) is most common.", topic: "Hypothesis" },
    { q: "What is the null hypothesis (H₀)?", a: "Statement of no effect or no difference.", topic: "Hypothesis" },
    { q: "What is the alternative hypothesis?", a: "Statement that there IS an effect or difference.", topic: "Hypothesis" },
    { q: "Type I error?", a: "Rejecting H₀ when it's true (false positive).", topic: "Errors" },
    { q: "Type II error?", a: "Failing to reject H₀ when it's false (false negative).", topic: "Errors" },
    { q: "What is correlation?", a: "Measure of linear relationship between two variables (-1 to +1).", topic: "Correlation" },
    { q: "Does correlation imply causation?", a: "No. Correlation only indicates association.", topic: "Correlation" },
    { q: "What is regression?", a: "Statistical method to model relationship between variables.", topic: "Regression" },
    { q: "What is R² in regression?", a: "Proportion of variance in dependent variable explained by independent variables (0-1).", topic: "Regression" },
    { q: "What is a normal distribution?", a: "Symmetric bell-shaped distribution; described by mean and SD.", topic: "Distributions" },
    { q: "Empirical rule (68-95-99.7)?", a: "In normal: 68% within 1σ, 95% within 2σ, 99.7% within 3σ of mean.", topic: "Distributions" },
    { q: "What is a z-score?", a: "Number of standard deviations a value is from the mean.", topic: "Distributions" },
    { q: "What is sampling?", a: "Process of selecting subset of population.", topic: "Sampling" },
    { q: "Population vs sample?", a: "Population: entire group. Sample: subset.", topic: "Sampling" },
    { q: "Central Limit Theorem?", a: "Sampling distribution of mean approaches normal as sample size grows.", topic: "CLT" },
    { q: "What is a confidence interval?", a: "Range likely to contain population parameter with specified confidence.", topic: "Inference" },
    { q: "What is bias in sampling?", a: "Systematic error making sample unrepresentative.", topic: "Sampling" },
    { q: "What is a histogram?", a: "Bar graph showing frequency distribution of continuous data.", topic: "Visualization" },
    { q: "What is skewness?", a: "Measure of asymmetry. Positive: tail right. Negative: tail left.", topic: "Shape" },
    { q: "What is kurtosis?", a: "Measure of 'tailedness' of a distribution.", topic: "Shape" },
    { q: "What is probability?", a: "Numerical measure (0 to 1) of likelihood of an event.", topic: "Probability" },
    { q: "P(A and B) = P(A)P(B) implies?", a: "Events A and B are independent.", topic: "Probability" },
  ];
  for (let i = 0; i < 500; i++) statsQs.push(pick(statsA));

  // ── BUSINESS STUDIES (500) ──
  const bizQs = [];
  const bizA = [
    { q: "What is business?", a: "Activity of producing/selling goods or services for profit.", topic: "Basics" },
    { q: "What is sole proprietorship?", a: "Business owned and run by one person; unlimited liability.", topic: "Forms" },
    { q: "What is a partnership?", a: "Business owned by two+ people sharing profits, losses, liability.", topic: "Forms" },
    { q: "What is a corporation?", a: "Legal entity separate from owners; limited liability.", topic: "Forms" },
    { q: "What is an LLC?", a: "Limited Liability Company - combines partnership flexibility with limited liability.", topic: "Forms" },
    { q: "What is marketing?", a: "Activities to promote, sell, and distribute products/services.", topic: "Marketing" },
    { q: "4 Ps of marketing?", a: "Product, Price, Place, Promotion.", topic: "Marketing" },
    { q: "What is segmentation?", a: "Dividing market into distinct groups with similar needs.", topic: "Marketing" },
    { q: "What is target market?", a: "Specific group of consumers a business aims to reach.", topic: "Marketing" },
    { q: "What is SWOT analysis?", a: "Strengths, Weaknesses, Opportunities, Threats - strategic framework.", topic: "Strategy" },
    { q: "What is HRM?", a: "Human Resource Management - managing people in organizations.", topic: "HRM" },
    { q: "Leader vs manager?", a: "Manager: plans, organizes, controls. Leader: inspires, drives change.", topic: "Management" },
    { q: "Functions of management?", a: "Planning, Organizing, Staffing, Directing, Controlling (POSDC).", topic: "Management" },
    { q: "What is entrepreneurship?", a: "Process of starting and running a new business.", topic: "Entrepreneurship" },
    { q: "What is a business plan?", a: "Document outlining business goals, strategies, market analysis, financials.", topic: "Planning" },
    { q: "What is supply chain management?", a: "Coordination of activities involved in producing/delivering goods.", topic: "Operations" },
    { q: "What is inventory management?", a: "Process of ordering, storing, and using inventory.", topic: "Operations" },
    { q: "What are assets?", a: "Resources owned with economic value (cash, inventory, equipment).", topic: "Accounting" },
    { q: "What are liabilities?", a: "Debts/obligations a business owes.", topic: "Accounting" },
    { q: "What is equity?", a: "Owners' stake: Equity = Assets - Liabilities.", topic: "Accounting" },
    { q: "Accounting equation?", a: "Assets = Liabilities + Equity.", topic: "Accounting" },
    { q: "What is profit?", a: "Revenue minus expenses; positive net income.", topic: "Accounting" },
    { q: "What is gross profit?", a: "Revenue minus cost of goods sold (COGS).", topic: "Accounting" },
    { q: "What is net profit?", a: "Revenue minus all expenses including taxes.", topic: "Accounting" },
    { q: "What is ROI?", a: "Return on Investment - (gain - cost) / cost.", topic: "Finance" },
    { q: "What is depreciation?", a: "Allocation of an asset's cost over its useful life.", topic: "Accounting" },
    { q: "What is a balance sheet?", a: "Statement showing assets, liabilities, equity at a point in time.", topic: "Accounting" },
    { q: "What is income statement?", a: "Statement showing revenues, expenses, profits over a period.", topic: "Accounting" },
    { q: "What is cash flow statement?", a: "Statement showing cash inflows/outflows (operating, investing, financing).", topic: "Accounting" },
  ];
  for (let i = 0; i < 500; i++) bizQs.push(pick(bizA));

  // ── ACCOUNTANCY (500) ──
  const acctQs = [];
  const acctA = [
    { q: "What is debit?", a: "Entry on left side of an account; increases assets/expenses.", topic: "Basics" },
    { q: "What is credit?", a: "Entry on right side of an account; opposite of debit.", topic: "Basics" },
    { q: "What is double-entry bookkeeping?", a: "Each transaction recorded with equal debits and credits.", topic: "Bookkeeping" },
    { q: "What is a journal?", a: "Book of original entry where transactions are first recorded.", topic: "Bookkeeping" },
    { q: "What is a ledger?", a: "Book containing accounts where transactions are posted from journal.", topic: "Bookkeeping" },
    { q: "What is a trial balance?", a: "List of all account balances to verify debits equal credits.", topic: "Bookkeeping" },
    { q: "What is GAAP?", a: "Generally Accepted Accounting Principles.", topic: "Standards" },
    { q: "What is IFRS?", a: "International Financial Reporting Standards.", topic: "Standards" },
    { q: "What is accrual accounting?", a: "Records revenues/expenses when earned/incurred, not when cash changes.", topic: "Methods" },
    { q: "What is cash accounting?", a: "Records transactions only when cash is received/paid.", topic: "Methods" },
    { q: "What is revenue?", a: "Income from sale of goods/services.", topic: "Income" },
    { q: "What is an expense?", a: "Cost incurred to generate revenue.", topic: "Income" },
    { q: "What are current assets?", a: "Assets convertible to cash within one year.", topic: "Assets" },
    { q: "What are fixed assets?", a: "Long-term assets used in operations (buildings, machinery).", topic: "Assets" },
    { q: "What is goodwill?", a: "Intangible asset representing premium paid in acquisition.", topic: "Intangibles" },
    { q: "What is amortization?", a: "Systematic write-off of intangible assets' cost.", topic: "Adjustments" },
    { q: "Straight-line depreciation formula?", a: "(Cost - Salvage Value) / Useful Life", topic: "Depreciation" },
    { q: "What is bad debts?", a: "Amount of credit sales unlikely to be collected; expense.", topic: "Receivables" },
    { q: "What is the accounting equation?", a: "Assets = Liabilities + Equity.", topic: "Basics" },
    { q: "What is a balance sheet?", a: "Snapshot of assets, liabilities, equity at a point in time.", topic: "Statements" },
    { q: "What is an income statement?", a: "Shows revenues and expenses over a period.", topic: "Statements" },
    { q: "What is a contra account?", a: "Account paired with another to reduce its balance (e.g., accumulated depreciation).", topic: "Adjustments" },
  ];
  for (let i = 0; i < 500; i++) acctQs.push(pick(acctA));

  return {
    Mathematics: mathQs,
    Physics: physQs,
    Chemistry: chemQs,
    Biology: bioQs,
    "Computer Science": csQs,
    English: engQs,
    History: histQs,
    Geography: geoQs,
    Psychology: psyQs,
    Economics: econQs,
    "Political Science": polQs,
    Philosophy: phiQs,
    Sociology: socQs,
    Statistics: statsQs,
    "Business Studies": bizQs,
    Accountancy: acctQs
  };
})();

const REFERENCE_LINKS = (function() {
  const KA = (path, name) => ({ name, url: `https://www.khanacademy.org/${path}`, type: "Course" });
  const MIT = (path, name) => ({ name, url: `https://ocw.mit.edu/${path}`, type: "Lectures" });
  const COUR = (path, name) => ({ name, url: `https://www.coursera.org/${path}`, type: "Course" });
  const EDX = (path, name) => ({ name, url: `https://www.edx.org/${path}`, type: "Course" });

  return {
    Mathematics: [
      KA("math", "Khan Academy Math"),
      MIT("courses/mathematics/", "MIT OCW Mathematics"),
      { name: "Paul's Online Math Notes", url: "https://tutorial.math.lamar.edu/", type: "Notes" },
      { name: "Desmos Graphing Calculator", url: "https://www.desmos.com/calculator", type: "Tool" },
      { name: "Wolfram Alpha", url: "https://www.wolframalpha.com/", type: "Tool" },
      { name: "Brilliant Math", url: "https://brilliant.org/courses/math/", type: "Course" },
      { name: "Art of Problem Solving", url: "https://artofproblemsolving.com/", type: "Course" },
      { name: "Project Euler", url: "https://projecteuler.net/", type: "Practice" },
      { name: "3Blue1Brown YouTube", url: "https://www.youtube.com/c/3blue1brown", type: "Videos" },
      { name: "Numberphile YouTube", url: "https://www.youtube.com/user/numberphile", type: "Videos" },
      { name: "Mathway Solver", url: "https://www.mathway.com/", type: "Tool" },
      { name: "Symbolab", url: "https://www.symbolab.com/", type: "Tool" },
      { name: "GeoGebra", url: "https://www.geogebra.org/", type: "Tool" },
      { name: "OpenStax Math", url: "https://openstax.org/subjects/math", type: "Textbook" },
      COUR("browse/math-and-logic", "Coursera Math"),
      EDX("learn/math", "edX Mathematics"),
      { name: "AoPS Online", url: "https://artofproblemsolving.com/online", type: "Course" },
      { name: "Better Explained", url: "https://betterexplained.com/", type: "Articles" },
      { name: "Math is Fun", url: "https://www.mathsisfun.com/", type: "Reference" },
      { name: "PatrickJMT", url: "http://patrickjmt.com/", type: "Videos" },
      { name: "Professor Leonard", url: "https://www.youtube.com/user/professorleonard57", type: "Videos" },
      { name: "OEIS Integer Sequences", url: "https://oeis.org/", type: "Reference" },
      { name: "Mathigon", url: "https://mathigon.org/", type: "Course" },
      { name: "Brilliant Daily Problems", url: "https://brilliant.org/daily-problems/", type: "Practice" },
      { name: "AMC Past Problems", url: "https://artofproblemsolving.com/wiki/index.php/AMC_Problems_and_Solutions", type: "Practice" },
    ],
    Physics: [
      KA("science/physics", "Khan Academy Physics"),
      MIT("courses/physics/", "MIT OCW Physics"),
      { name: "HyperPhysics", url: "http://hyperphysics.phy-astr.gsu.edu/", type: "Reference" },
      { name: "PhET Simulations", url: "https://phet.colorado.edu/", type: "Simulations" },
      { name: "Walter Lewin Lectures", url: "https://www.youtube.com/c/lecturesbywalterlewin", type: "Videos" },
      { name: "MinutePhysics", url: "https://www.youtube.com/user/minutephysics", type: "Videos" },
      { name: "Veritasium", url: "https://www.youtube.com/user/1veritasium", type: "Videos" },
      { name: "PBS Space Time", url: "https://www.youtube.com/c/pbsspacetime", type: "Videos" },
      { name: "OpenStax Physics", url: "https://openstax.org/subjects/science", type: "Textbook" },
      { name: "Feynman Lectures (free online)", url: "https://www.feynmanlectures.caltech.edu/", type: "Textbook" },
      { name: "The Physics Classroom", url: "https://www.physicsclassroom.com/", type: "Tutorial" },
      { name: "Brilliant Classical Mechanics", url: "https://brilliant.org/courses/classical-mechanics/", type: "Course" },
      EDX("learn/physics", "edX Physics"),
      COUR("browse/physical-science-and-engineering/physics-and-astronomy", "Coursera Physics"),
      { name: "Physics Galaxy", url: "https://www.physicsgalaxy.com/", type: "Course" },
      { name: "NPTEL Physics", url: "https://nptel.ac.in/courses/115", type: "Lectures" },
      { name: "Isaac Physics", url: "https://isaacphysics.org/", type: "Practice" },
      { name: "AP Physics 1", url: "https://apstudents.collegeboard.org/courses/ap-physics-1-algebra-based", type: "Course" },
      { name: "Physics Stack Exchange", url: "https://physics.stackexchange.com/", type: "Q&A" },
      { name: "Compadre Resources", url: "https://www.compadre.org/", type: "Reference" },
      { name: "arXiv Physics", url: "https://arxiv.org/list/physics/recent", type: "Papers" },
      { name: "Khan Academy AP Physics", url: "https://www.khanacademy.org/science/ap-physics-1", type: "Course" },
      { name: "Physics Aviary", url: "https://www.thephysicsaviary.com/", type: "Simulations" },
      { name: "FlippingPhysics", url: "https://www.flippingphysics.com/", type: "Videos" },
      { name: "Crash Course Physics", url: "https://www.youtube.com/playlist?list=PL8dPuuaLjXtN0ge7yDk_UA0ldZJdhwkoV", type: "Videos" },
    ],
    Chemistry: [
      KA("science/chemistry", "Khan Academy Chemistry"),
      { name: "LibreTexts Chemistry", url: "https://chem.libretexts.org/", type: "Textbook" },
      { name: "Periodic Table (ptable)", url: "https://ptable.com/", type: "Tool" },
      { name: "PubChem Database", url: "https://pubchem.ncbi.nlm.nih.gov/", type: "Database" },
      { name: "Royal Society of Chemistry", url: "https://edu.rsc.org/", type: "Resources" },
      MIT("courses/chemistry/", "MIT OCW Chemistry"),
      { name: "OpenStax Chemistry", url: "https://openstax.org/subjects/science", type: "Textbook" },
      { name: "Crash Course Chemistry", url: "https://www.youtube.com/playlist?list=PL8dPuuaLjXtPHzzYuWy6fYEaX9mQQ8oGr", type: "Videos" },
      { name: "Tyler DeWitt YouTube", url: "https://www.youtube.com/user/tdewitt451", type: "Videos" },
      { name: "Periodic Videos", url: "http://www.periodicvideos.com/", type: "Videos" },
      { name: "ChemCollective Virtual Labs", url: "http://chemcollective.org/", type: "Simulations" },
      { name: "Brilliant Chemistry", url: "https://brilliant.org/courses/chemistry-essentials/", type: "Course" },
      EDX("learn/chemistry", "edX Chemistry"),
      COUR("browse/physical-science-and-engineering/chemistry", "Coursera Chemistry"),
      { name: "NPTEL Chemistry", url: "https://nptel.ac.in/courses/104", type: "Lectures" },
      { name: "Master Organic Chemistry", url: "https://www.masterorganicchemistry.com/", type: "Tutorial" },
      KA("science/organic-chemistry", "Khan Academy Organic"),
      { name: "Bozeman Chemistry", url: "https://www.bozemanscience.com/chemistry", type: "Videos" },
      { name: "ACS Education", url: "https://www.acs.org/education.html", type: "Resources" },
      { name: "ChemAxon Tools", url: "https://chemaxon.com/", type: "Tool" },
      { name: "Chembuddy Calculators", url: "https://www.chembuddy.com/", type: "Tool" },
      { name: "AP Chemistry", url: "https://apstudents.collegeboard.org/courses/ap-chemistry", type: "Course" },
      { name: "Chemguide", url: "https://www.chemguide.co.uk/", type: "Reference" },
    ],
    Biology: [
      KA("science/biology", "Khan Academy Biology"),
      { name: "NCBI Bookshelf", url: "https://www.ncbi.nlm.nih.gov/books/", type: "Reference" },
      { name: "iBiology Lectures", url: "https://www.ibiology.org/", type: "Lectures" },
      MIT("courses/biology/", "MIT OCW Biology"),
      { name: "OpenStax Biology", url: "https://openstax.org/subjects/science", type: "Textbook" },
      { name: "Crash Course Biology", url: "https://www.youtube.com/playlist?list=PL3EED4C1D684D3ADF", type: "Videos" },
      { name: "Bozeman Biology", url: "https://www.bozemanscience.com/biology-main-page", type: "Videos" },
      { name: "Amoeba Sisters", url: "https://www.youtube.com/c/AmoebaSisters", type: "Videos" },
      { name: "Brilliant", url: "https://brilliant.org/", type: "Course" },
      EDX("learn/biology", "edX Biology"),
      COUR("browse/life-sciences", "Coursera Biology"),
      { name: "Biology Online", url: "https://www.biologyonline.com/", type: "Reference" },
      { name: "Biology Corner", url: "https://www.biologycorner.com/", type: "Tutorial" },
      { name: "HHMI BioInteractive", url: "https://www.biointeractive.org/", type: "Resources" },
      { name: "Cells Alive", url: "https://www.cellsalive.com/", type: "Animations" },
      { name: "Learn Genetics (Utah)", url: "https://learn.genetics.utah.edu/", type: "Tutorials" },
      { name: "PBS Eons", url: "https://www.youtube.com/c/eons", type: "Videos" },
      { name: "Genome.gov", url: "https://www.genome.gov/", type: "Reference" },
      { name: "BioRender Tutorials", url: "https://learn.biorender.com/", type: "Tutorials" },
      { name: "AP Biology", url: "https://apstudents.collegeboard.org/courses/ap-biology", type: "Course" },
      KA("science/health-and-medicine", "Khan Academy Health"),
      { name: "NPTEL Biology", url: "https://nptel.ac.in/courses/102", type: "Lectures" },
      { name: "Khan Academy MCAT", url: "https://www.khanacademy.org/test-prep/mcat", type: "Course" },
    ],
    "Computer Science": [
      { name: "CS50 (Harvard)", url: "https://cs50.harvard.edu/", type: "Course" },
      { name: "LeetCode", url: "https://leetcode.com/", type: "Practice" },
      { name: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/", type: "Reference" },
      { name: "Visualgo", url: "https://visualgo.net/", type: "Visualizations" },
      { name: "MDN Web Docs", url: "https://developer.mozilla.org/", type: "Reference" },
      { name: "Stack Overflow", url: "https://stackoverflow.com/", type: "Q&A" },
      { name: "freeCodeCamp", url: "https://www.freecodecamp.org/", type: "Course" },
      { name: "Codecademy", url: "https://www.codecademy.com/", type: "Course" },
      MIT("courses/electrical-engineering-and-computer-science/", "MIT OCW CS"),
      COUR("browse/computer-science", "Coursera CS"),
      EDX("learn/computer-science", "edX CS"),
      { name: "HackerRank", url: "https://www.hackerrank.com/", type: "Practice" },
      { name: "CodeForces", url: "https://codeforces.com/", type: "Practice" },
      { name: "Project Euler", url: "https://projecteuler.net/", type: "Practice" },
      { name: "TopCoder", url: "https://www.topcoder.com/", type: "Practice" },
      { name: "GitHub", url: "https://github.com/", type: "Tool" },
      { name: "W3Schools", url: "https://www.w3schools.com/", type: "Tutorial" },
      { name: "Real Python", url: "https://realpython.com/", type: "Tutorial" },
      { name: "Python.org Docs", url: "https://docs.python.org/3/", type: "Reference" },
      { name: "JavaScript.info", url: "https://javascript.info/", type: "Tutorial" },
      { name: "FullStackOpen", url: "https://fullstackopen.com/", type: "Course" },
      { name: "The Odin Project", url: "https://www.theodinproject.com/", type: "Course" },
      { name: "Exercism", url: "https://exercism.org/", type: "Practice" },
      { name: "AlgoExpert", url: "https://www.algoexpert.io/", type: "Practice" },
      { name: "NeetCode", url: "https://neetcode.io/", type: "Practice" },
      { name: "Cracking the Coding Interview", url: "https://www.crackingthecodinginterview.com/", type: "Book" },
    ],
    English: [
      KA("humanities/grammar", "Khan Academy Grammar"),
      { name: "Purdue OWL", url: "https://owl.purdue.edu/", type: "Reference" },
      { name: "Grammarly Blog", url: "https://www.grammarly.com/blog/", type: "Articles" },
      { name: "Project Gutenberg", url: "https://www.gutenberg.org/", type: "Library" },
      { name: "SparkNotes", url: "https://www.sparknotes.com/", type: "Study Guide" },
      { name: "CliffsNotes", url: "https://www.cliffsnotes.com/", type: "Study Guide" },
      { name: "Shmoop Literature", url: "https://www.shmoop.com/study-guides/literature", type: "Study Guide" },
      { name: "Poetry Foundation", url: "https://www.poetryfoundation.org/", type: "Library" },
      { name: "British Library", url: "https://www.bl.uk/", type: "Reference" },
      { name: "BBC Bitesize English", url: "https://www.bbc.co.uk/bitesize/subjects/zfk74xs", type: "Course" },
      { name: "Crash Course Literature", url: "https://www.youtube.com/playlist?list=PL8dPuuaLjXtOeEc9ME62zTfqc0h6Pe8vb", type: "Videos" },
      { name: "Oxford Dictionaries", url: "https://www.oxfordlearnersdictionaries.com/", type: "Dictionary" },
      { name: "Merriam-Webster", url: "https://www.merriam-webster.com/", type: "Dictionary" },
      { name: "Thesaurus.com", url: "https://www.thesaurus.com/", type: "Tool" },
      { name: "Vocabulary.com", url: "https://www.vocabulary.com/", type: "Practice" },
      EDX("learn/english", "edX English Courses"),
      COUR("browse/language-learning", "Coursera English"),
      { name: "Folger Shakespeare", url: "https://www.folger.edu/", type: "Reference" },
      { name: "Open Library", url: "https://openlibrary.org/", type: "Library" },
      { name: "Hemingway Editor", url: "https://hemingwayapp.com/", type: "Tool" },
      { name: "Quill.org", url: "https://www.quill.org/", type: "Practice" },
      { name: "AP English Lit", url: "https://apstudents.collegeboard.org/courses/ap-english-literature-and-composition", type: "Course" },
      { name: "ReadWriteThink", url: "https://www.readwritethink.org/", type: "Resources" },
    ],
    History: [
      KA("humanities/world-history", "Khan Academy World History"),
      KA("humanities/us-history", "Khan Academy US History"),
      { name: "Crash Course World History", url: "https://www.youtube.com/playlist?list=PLBDA2E52FB1EF80C9", type: "Videos" },
      { name: "Crash Course US History", url: "https://www.youtube.com/playlist?list=PL8dPuuaLjXtMwmepBjTSG593eG7ObzO7s", type: "Videos" },
      { name: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/history/", type: "Articles" },
      { name: "History.com", url: "https://www.history.com/", type: "Reference" },
      { name: "BBC History", url: "https://www.bbc.co.uk/history", type: "Reference" },
      { name: "Internet History Sourcebooks", url: "https://sourcebooks.fordham.edu/", type: "Library" },
      MIT("courses/history/", "MIT OCW History"),
      { name: "Yale Open Courses History", url: "https://oyc.yale.edu/history", type: "Lectures" },
      { name: "TimeMaps", url: "https://www.timemaps.com/", type: "Visualizations" },
      { name: "JSTOR Daily History", url: "https://daily.jstor.org/category/history/", type: "Articles" },
      { name: "AP World History", url: "https://apstudents.collegeboard.org/courses/ap-world-history-modern", type: "Course" },
      { name: "AP US History", url: "https://apstudents.collegeboard.org/courses/ap-united-states-history", type: "Course" },
      { name: "Perseus Digital Library", url: "https://www.perseus.tufts.edu/hopper/", type: "Library" },
      { name: "Oxford Reference History", url: "https://www.oxfordreference.com/page/history", type: "Reference" },
      { name: "TED-Ed History", url: "https://ed.ted.com/lessons?category=history", type: "Videos" },
      { name: "World History Encyclopedia", url: "https://www.worldhistory.org/", type: "Reference" },
      { name: "Library of Congress", url: "https://www.loc.gov/", type: "Library" },
      { name: "British Museum", url: "https://www.britishmuseum.org/", type: "Reference" },
      { name: "National Geographic History", url: "https://www.nationalgeographic.com/history/", type: "Articles" },
      EDX("learn/history", "edX History"),
      COUR("browse/arts-and-humanities/history", "Coursera History"),
    ],
    Geography: [
      { name: "National Geographic Education", url: "https://education.nationalgeographic.org/", type: "Resources" },
      KA("humanities/geography", "Khan Academy Geography"),
      { name: "Crash Course Geography", url: "https://www.youtube.com/playlist?list=PL8dPuuaLjXtNYIkZX36fjBpxsihwLG_qb", type: "Videos" },
      { name: "Worldometer", url: "https://www.worldometers.info/", type: "Data" },
      { name: "CIA World Factbook", url: "https://www.cia.gov/the-world-factbook/", type: "Reference" },
      { name: "Geography of the World (BBC Bitesize)", url: "https://www.bbc.co.uk/bitesize/subjects/zrw76sg", type: "Course" },
      { name: "Sporcle Geography", url: "https://www.sporcle.com/games/category/geography", type: "Practice" },
      { name: "Seterra Map Quizzes", url: "https://online.seterra.com/", type: "Practice" },
      { name: "Geoguessr", url: "https://www.geoguessr.com/", type: "Practice" },
      { name: "Google Earth", url: "https://earth.google.com/", type: "Tool" },
      { name: "OpenStreetMap", url: "https://www.openstreetmap.org/", type: "Tool" },
      { name: "Maptastic.org", url: "https://maptastic.org/", type: "Tool" },
      { name: "USGS Earthquakes", url: "https://earthquake.usgs.gov/", type: "Data" },
      { name: "NOAA Climate", url: "https://www.climate.gov/", type: "Data" },
      { name: "ESA Climate", url: "https://climate.esa.int/", type: "Data" },
      { name: "World Bank Data", url: "https://data.worldbank.org/", type: "Data" },
      { name: "AP Human Geography", url: "https://apstudents.collegeboard.org/courses/ap-human-geography", type: "Course" },
      EDX("learn/geography", "edX Geography"),
      COUR("browse/social-sciences", "Coursera Social Sciences"),
      { name: "Royal Geographical Society", url: "https://www.rgs.org/", type: "Resources" },
      { name: "Geography Realm", url: "https://www.geographyrealm.com/", type: "Articles" },
    ],
    Psychology: [
      KA("test-prep/mcat/social-sciences", "Khan Academy Psychology"),
      { name: "Crash Course Psychology", url: "https://www.youtube.com/playlist?list=PL8dPuuaLjXtOPRKzVLY0jJY-uHOH9KVU6", type: "Videos" },
      MIT("courses/brain-and-cognitive-sciences/", "MIT OCW Psychology"),
      { name: "Yale Intro Psych", url: "https://oyc.yale.edu/psychology/psyc-110", type: "Lectures" },
      { name: "Simply Psychology", url: "https://www.simplypsychology.org/", type: "Reference" },
      { name: "Psychology Today", url: "https://www.psychologytoday.com/", type: "Articles" },
      { name: "American Psychological Association", url: "https://www.apa.org/", type: "Reference" },
      { name: "PsycNET", url: "https://psycnet.apa.org/", type: "Database" },
      { name: "OpenStax Psychology", url: "https://openstax.org/details/books/psychology", type: "Textbook" },
      EDX("learn/psychology", "edX Psychology"),
      COUR("browse/social-sciences/psychology", "Coursera Psychology"),
      { name: "Verywell Mind", url: "https://www.verywellmind.com/", type: "Articles" },
      { name: "TED-Ed Psychology", url: "https://ed.ted.com/lessons?category=psychology", type: "Videos" },
      { name: "AP Psychology", url: "https://apstudents.collegeboard.org/courses/ap-psychology", type: "Course" },
      { name: "BBC Psychology", url: "https://www.bbc.co.uk/programmes/articles/4Yn9j0M5Z8H6N9zNX9zNX/psychology", type: "Articles" },
      { name: "Brain Facts", url: "https://www.brainfacts.org/", type: "Reference" },
      { name: "Stanford Encyclopedia of Philosophy (Mind)", url: "https://plato.stanford.edu/entries/philosophy-mind/", type: "Reference" },
      { name: "Coursera Yale Science of Wellbeing", url: "https://www.coursera.org/learn/the-science-of-well-being", type: "Course" },
      { name: "TheSchoolofLife", url: "https://www.theschooloflife.com/", type: "Articles" },
      { name: "Psychology Tools", url: "https://www.psychologytools.com/", type: "Tools" },
      { name: "AllPsych", url: "https://allpsych.com/", type: "Reference" },
      { name: "Big Think Psychology", url: "https://bigthink.com/topic/psychology/", type: "Articles" },
    ],
    Economics: [
      KA("economics-finance-domain", "Khan Academy Economics"),
      { name: "Crash Course Economics", url: "https://www.youtube.com/playlist?list=PL8dPuuaLjXtPNZwz5_o_5uirJ8gQXnhEO", type: "Videos" },
      MIT("courses/economics/", "MIT OCW Economics"),
      { name: "OpenStax Economics", url: "https://openstax.org/subjects/social-sciences", type: "Textbook" },
      { name: "Investopedia", url: "https://www.investopedia.com/", type: "Reference" },
      { name: "Federal Reserve Education", url: "https://www.federalreserveeducation.org/", type: "Resources" },
      { name: "World Bank", url: "https://www.worldbank.org/", type: "Data" },
      { name: "IMF Data", url: "https://www.imf.org/en/Data", type: "Data" },
      { name: "OECD Data", url: "https://data.oecd.org/", type: "Data" },
      EDX("learn/economics", "edX Economics"),
      COUR("browse/business/economics", "Coursera Economics"),
      { name: "Marginal Revolution University", url: "https://mru.org/", type: "Course" },
      { name: "Economics Network", url: "https://www.economicsnetwork.ac.uk/", type: "Resources" },
      { name: "Council on Foreign Relations", url: "https://www.cfr.org/", type: "Articles" },
      { name: "AP Microeconomics", url: "https://apstudents.collegeboard.org/courses/ap-microeconomics", type: "Course" },
      { name: "AP Macroeconomics", url: "https://apstudents.collegeboard.org/courses/ap-macroeconomics", type: "Course" },
      { name: "EconlowDown", url: "https://www.econlowdown.org/", type: "Course" },
      { name: "The Economist", url: "https://www.economist.com/", type: "News" },
      { name: "FiveThirtyEight Economics", url: "https://fivethirtyeight.com/tag/economics/", type: "Articles" },
      { name: "Reserve Bank of India", url: "https://www.rbi.org.in/", type: "Reference" },
      { name: "NPTEL Economics", url: "https://nptel.ac.in/courses/110", type: "Lectures" },
    ],
    "Political Science": [
      KA("humanities/us-government-and-civics", "Khan Academy Civics"),
      { name: "Crash Course Government", url: "https://www.youtube.com/playlist?list=PL8dPuuaLjXtOfse2ncvffeelTrqvhrz8H", type: "Videos" },
      { name: "Indian Polity (Laxmikanth) Notes", url: "https://www.byjus.com/free-ias-prep/indian-polity-notes/", type: "Notes" },
      { name: "PRS India Legislative Research", url: "https://prsindia.org/", type: "Reference" },
      { name: "Constitution of India PDF", url: "https://legislative.gov.in/constitution-of-india/", type: "Document" },
      { name: "UN.org", url: "https://www.un.org/", type: "Reference" },
      { name: "Stanford Encyclopedia (Political)", url: "https://plato.stanford.edu/contents.html", type: "Reference" },
      { name: "Council on Foreign Relations", url: "https://www.cfr.org/", type: "Articles" },
      { name: "Foreign Policy Magazine", url: "https://foreignpolicy.com/", type: "Articles" },
      MIT("courses/political-science/", "MIT OCW Political Science"),
      EDX("learn/political-science", "edX Political Science"),
      COUR("browse/social-sciences/governance-and-society", "Coursera Politics"),
      { name: "AP US Government", url: "https://apstudents.collegeboard.org/courses/ap-united-states-government-and-politics", type: "Course" },
      { name: "AP Comparative Government", url: "https://apstudents.collegeboard.org/courses/ap-comparative-government-and-politics", type: "Course" },
      { name: "Yale Open Political Science", url: "https://oyc.yale.edu/political-science", type: "Lectures" },
      { name: "BBC News Politics", url: "https://www.bbc.com/news/politics", type: "News" },
      { name: "The Hindu Politics", url: "https://www.thehindu.com/news/national/", type: "News" },
      { name: "Election Commission of India", url: "https://eci.gov.in/", type: "Reference" },
      { name: "Brookings Institution", url: "https://www.brookings.edu/", type: "Articles" },
      { name: "Pew Research Center", url: "https://www.pewresearch.org/", type: "Data" },
    ],
    Philosophy: [
      { name: "Stanford Encyclopedia of Philosophy", url: "https://plato.stanford.edu/", type: "Reference" },
      { name: "Internet Encyclopedia of Philosophy", url: "https://iep.utm.edu/", type: "Reference" },
      { name: "Crash Course Philosophy", url: "https://www.youtube.com/playlist?list=PL8dPuuaLjXtNgK6MZucdYldNkMybYIHKR", type: "Videos" },
      MIT("courses/linguistics-and-philosophy/", "MIT OCW Philosophy"),
      { name: "Yale Open Philosophy", url: "https://oyc.yale.edu/philosophy", type: "Lectures" },
      { name: "Philosophy Now Magazine", url: "https://philosophynow.org/", type: "Articles" },
      { name: "The Philosophers' Magazine", url: "https://www.philosophersmag.com/", type: "Articles" },
      { name: "Aeon Essays", url: "https://aeon.co/", type: "Articles" },
      { name: "PhilPapers", url: "https://philpapers.org/", type: "Database" },
      EDX("learn/philosophy", "edX Philosophy"),
      COUR("browse/arts-and-humanities/philosophy", "Coursera Philosophy"),
      { name: "Wireless Philosophy", url: "https://www.wi-phi.com/", type: "Videos" },
      { name: "TED-Ed Philosophy", url: "https://ed.ted.com/lessons?category=philosophy", type: "Videos" },
      { name: "The School of Life - Philosophy", url: "https://www.theschooloflife.com/article-categories/philosophy/", type: "Articles" },
      { name: "Project Gutenberg Philosophy", url: "https://www.gutenberg.org/ebooks/bookshelf/57", type: "Library" },
      { name: "Philosophy Talk", url: "https://www.philosophytalk.org/", type: "Podcast" },
      { name: "Daily Nous", url: "https://dailynous.com/", type: "News" },
      { name: "Philosophy Bites Podcast", url: "https://philosophybites.com/", type: "Podcast" },
      { name: "1000-Word Philosophy", url: "https://1000wordphilosophy.com/", type: "Articles" },
      { name: "Big Think Philosophy", url: "https://bigthink.com/topic/philosophy/", type: "Articles" },
    ],
    Sociology: [
      { name: "Crash Course Sociology", url: "https://www.youtube.com/playlist?list=PL8dPuuaLjXtMJ-AfB_7J1538YKWkZAnGA", type: "Videos" },
      { name: "OpenStax Sociology", url: "https://openstax.org/details/books/introduction-sociology-3e", type: "Textbook" },
      KA("humanities/us-history", "Khan Academy Society"),
      MIT("courses/anthropology/", "MIT OCW Anthropology"),
      { name: "American Sociological Association", url: "https://www.asanet.org/", type: "Reference" },
      { name: "Sociology.com.au", url: "https://www.sociology.com.au/", type: "Reference" },
      { name: "ThoughtCo Sociology", url: "https://www.thoughtco.com/sociology-4133515", type: "Articles" },
      EDX("learn/sociology", "edX Sociology"),
      COUR("browse/social-sciences", "Coursera Social Sciences"),
      { name: "Sociology Source", url: "https://sociologysource.org/", type: "Resources" },
      { name: "Yale Open Sociology", url: "https://oyc.yale.edu/sociology", type: "Lectures" },
      { name: "JSTOR Sociology", url: "https://www.jstor.org/subject/sociology", type: "Database" },
      { name: "Pew Research", url: "https://www.pewresearch.org/", type: "Data" },
      { name: "World Values Survey", url: "https://www.worldvaluessurvey.org/", type: "Data" },
      { name: "Social Theory Re-wired", url: "https://routledgesoc.com/category/profile-tags/social-theory-re-wired", type: "Reference" },
      { name: "Sociology Stack Exchange", url: "https://sociology.stackexchange.com/", type: "Q&A" },
      { name: "Annual Review of Sociology", url: "https://www.annualreviews.org/journal/soc", type: "Journal" },
      { name: "TED Talks Sociology", url: "https://www.ted.com/topics/sociology", type: "Videos" },
      { name: "Open Sociology Library", url: "https://opensociologylibrary.com/", type: "Resources" },
      { name: "Sage Sociology", url: "https://us.sagepub.com/en-us/nam/sociology", type: "Reference" },
    ],
    Statistics: [
      KA("math/statistics-probability", "Khan Academy Statistics"),
      MIT("courses/mathematics/", "MIT OCW Statistics"),
      { name: "OpenIntro Statistics", url: "https://www.openintro.org/book/os/", type: "Textbook" },
      { name: "StatQuest YouTube", url: "https://www.youtube.com/c/joshstarmer", type: "Videos" },
      { name: "Crash Course Statistics", url: "https://www.youtube.com/playlist?list=PL8dPuuaLjXtNM_Y-bUAhblSAdWRnmBUcr", type: "Videos" },
      { name: "Stat Trek", url: "https://stattrek.com/", type: "Tutorial" },
      { name: "OnlineStatBook", url: "http://onlinestatbook.com/", type: "Textbook" },
      { name: "Seeing Theory (visual stats)", url: "https://seeing-theory.brown.edu/", type: "Visualizations" },
      EDX("learn/statistics", "edX Statistics"),
      COUR("browse/data-science/probability-and-statistics", "Coursera Statistics"),
      { name: "Brilliant Statistics", url: "https://brilliant.org/courses/statistics/", type: "Course" },
      { name: "Stats StackExchange", url: "https://stats.stackexchange.com/", type: "Q&A" },
      { name: "Real Statistics Excel", url: "https://www.real-statistics.com/", type: "Tool" },
      { name: "R Project", url: "https://www.r-project.org/", type: "Tool" },
      { name: "RStudio", url: "https://posit.co/", type: "Tool" },
      { name: "Python pandas docs", url: "https://pandas.pydata.org/docs/", type: "Reference" },
      { name: "Towards Data Science", url: "https://towardsdatascience.com/", type: "Articles" },
      { name: "AP Statistics", url: "https://apstudents.collegeboard.org/courses/ap-statistics", type: "Course" },
      { name: "Math Is Fun Statistics", url: "https://www.mathsisfun.com/data/", type: "Tutorial" },
      { name: "DataCamp", url: "https://www.datacamp.com/", type: "Practice" },
      { name: "Kaggle Learn", url: "https://www.kaggle.com/learn", type: "Course" },
    ],
    "Business Studies": [
      { name: "Khan Academy Entrepreneurship", url: "https://www.khanacademy.org/college-careers-more/entrepreneurship2", type: "Course" },
      { name: "Crash Course Business", url: "https://www.youtube.com/playlist?list=PL8dPuuaLjXtNM6mqA9fgrlhpHewQ74xZ6", type: "Videos" },
      MIT("courses/sloan-school-of-management/", "MIT Sloan OCW"),
      { name: "Harvard Business School Online", url: "https://online.hbs.edu/", type: "Course" },
      { name: "Harvard Business Review", url: "https://hbr.org/", type: "Articles" },
      { name: "Investopedia Business", url: "https://www.investopedia.com/business-essentials-4689829", type: "Reference" },
      { name: "Bloomberg", url: "https://www.bloomberg.com/", type: "News" },
      { name: "Wall Street Journal", url: "https://www.wsj.com/", type: "News" },
      { name: "Fortune", url: "https://fortune.com/", type: "News" },
      EDX("learn/business", "edX Business"),
      COUR("browse/business", "Coursera Business"),
      { name: "Wharton Online", url: "https://online.wharton.upenn.edu/", type: "Course" },
      { name: "Coursera Wharton Business Foundations", url: "https://www.coursera.org/specializations/wharton-business-foundations", type: "Course" },
      { name: "AP Microeconomics", url: "https://apstudents.collegeboard.org/courses/ap-microeconomics", type: "Course" },
      { name: "Y Combinator Startup School", url: "https://www.startupschool.org/", type: "Course" },
      { name: "Business Insider", url: "https://www.businessinsider.com/", type: "News" },
      { name: "Entrepreneur Magazine", url: "https://www.entrepreneur.com/", type: "Articles" },
      { name: "Forbes", url: "https://www.forbes.com/", type: "News" },
      { name: "Inc. Magazine", url: "https://www.inc.com/", type: "Articles" },
      { name: "McKinsey Insights", url: "https://www.mckinsey.com/our-insights", type: "Articles" },
      { name: "TED Business", url: "https://www.ted.com/topics/business", type: "Videos" },
      { name: "NPTEL Management", url: "https://nptel.ac.in/courses/110", type: "Lectures" },
    ],
    Accountancy: [
      { name: "Khan Academy Accounting", url: "https://www.khanacademy.org/economics-finance-domain/core-finance/accounting-and-financial-stateme", type: "Course" },
      { name: "Investopedia Accounting", url: "https://www.investopedia.com/financial-accounting-4689832", type: "Reference" },
      { name: "AccountingCoach", url: "https://www.accountingcoach.com/", type: "Course" },
      { name: "AccountingTools", url: "https://www.accountingtools.com/", type: "Reference" },
      { name: "Principles of Accounting (OpenStax)", url: "https://openstax.org/details/books/principles-financial-accounting", type: "Textbook" },
      { name: "Crash Course Business", url: "https://www.youtube.com/playlist?list=PL8dPuuaLjXtNM6mqA9fgrlhpHewQ74xZ6", type: "Videos" },
      { name: "FASB", url: "https://www.fasb.org/", type: "Reference" },
      { name: "IFRS Foundation", url: "https://www.ifrs.org/", type: "Reference" },
      { name: "ICAI India", url: "https://www.icai.org/", type: "Reference" },
      EDX("learn/accounting", "edX Accounting"),
      COUR("browse/business/business-essentials", "Coursera Accounting"),
      { name: "CFA Institute", url: "https://www.cfainstitute.org/", type: "Reference" },
      { name: "Wall Street Mojo", url: "https://www.wallstreetmojo.com/", type: "Reference" },
      { name: "AccountingVerse", url: "https://www.accountingverse.com/", type: "Reference" },
      { name: "ZipRecruiter Career: Accountant", url: "https://www.ziprecruiter.com/career/Accountant/", type: "Career" },
      { name: "AICPA", url: "https://www.aicpa.org/", type: "Reference" },
      { name: "Double Entry Bookkeeping", url: "https://www.double-entry-bookkeeping.com/", type: "Tutorial" },
      { name: "BYJUS Accountancy", url: "https://byjus.com/commerce/accountancy/", type: "Notes" },
      { name: "TaxGuru", url: "https://taxguru.in/", type: "Reference" },
      { name: "ClearTax", url: "https://cleartax.in/", type: "Reference" },
      { name: "Excel for Accountants", url: "https://www.exceljet.net/", type: "Tool" },
    ],
  };
})();


$('generatePracticeBtn').onclick = async () => {
  const subj = $('practiceSubject').value;
  const level = $('practiceLevel').value;
  if (!subj) { toast('Please select a subject', 'r'); return; }

  const el = $('practiceResults');
  el.innerHTML = `<div class="glass-card"><div style="display:flex;align-items:center;gap:12px;padding:24px;font-size:.88rem;color:var(--t2)"><div style="width:18px;height:18px;border:2px solid var(--accent);border-top-color:transparent;border-radius:50%;animation:spin .8s linear infinite"></div>Generating practice questions...</div></div>`;

  const weakAreas = [];
  st.perfHist.filter(h => h.subject === subj).forEach(h => { if (h.weak) weakAreas.push(...h.weak); });
  const uniqueWeak = [...new Set(weakAreas)];

  // Pick from local bank: 10 random questions per session
  setTimeout(() => {
    const bank = QUESTION_BANK[subj];
    if (!bank || !bank.length) {
      el.innerHTML = `<div class="glass-card"><div style="padding:24px;font-size:.84rem;color:var(--t3)">No questions available for ${esc(subj)} yet.</div></div>`;
      return;
    }
    const pool = [...bank];
    pool.sort(() => Math.random() - 0.5);
    const selected = pool.slice(0, 10);
    renderPracticeQuestions(selected, subj, level, uniqueWeak);
    toast(`${selected.length} questions generated`, 'g');
    renderPracticeRefs(subj);
  }, 400);
};

function renderPracticeQuestions(questions, subj, level, weakAreas) {
  const el = $('practiceResults');
  el.innerHTML = `<div class="glass-card">
    <div class="card-label"><span>${esc(subj)} &middot; ${esc(level)}</span><span class="card-label-meta">${questions.length} Questions</span></div>
    ${questions.map((q, i) => `<div style="padding:18px 20px;border-radius:14px;background:var(--bg3);border:1px solid var(--bd);margin-bottom:12px">
      <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:10px">
        <span style="font-family:var(--mono);font-size:.74rem;font-weight:700;color:var(--accent);min-width:28px;letter-spacing:.04em">Q${String(i+1).padStart(2,'0')}</span>
        <div style="flex:1;font-size:.92rem;font-weight:500;color:var(--t1);line-height:1.6;letter-spacing:-.005em">${esc(q.q || q.question || '')}</div>
      </div>
      ${q.topic ? `<div style="margin-bottom:10px;margin-left:40px"><span class="tag tag-a">${esc(q.topic)}</span></div>` : ''}
      <details style="margin-top:6px;margin-left:40px">
        <summary style="font-family:var(--mono);font-size:.72rem;font-weight:600;color:var(--t2);cursor:pointer;padding:6px 0;letter-spacing:.06em">Show Answer</summary>
        <div style="font-size:.86rem;color:var(--green);padding:12px 16px;margin-top:8px;border-radius:10px;background:var(--green-dim);border:1px solid var(--green-bd);line-height:1.6;font-weight:500">${esc(q.a || q.answer || '')}</div>
      </details>
    </div>`).join('')}
    ${weakAreas.length ? `<div style="padding:14px 16px;border-radius:12px;background:var(--amber-dim);border:1px solid var(--amber-bd);font-size:.84rem;color:var(--t2);line-height:1.6;margin-top:8px">Based on your history, focus on: ${weakAreas.slice(0, 3).map(w => `<strong style="color:var(--amber)">${esc(w)}</strong>`).join(', ')}</div>` : ''}
  </div>`;
}

function renderPracticeRefs(subj) {
  const el = $('practiceRefs'); if (!el) return;
  const refs = REFERENCE_LINKS[subj || ''] || [];
  if (!refs.length) {
    el.innerHTML = `<div style="font-size:.84rem;color:var(--t3);padding:8px 0;font-style:italic">No references available for this subject.</div>`;
    return;
  }
  el.innerHTML = refs.map(r => `<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;background:var(--bg3);border:1px solid var(--bd);margin-bottom:6px">
    <span style="flex:1;font-size:.84rem;font-weight:600;color:var(--t1)">${esc(r.name)}</span>
    <span class="tag tag-a">${esc(r.type)}</span>
    <a href="${esc(r.url)}" target="_blank" rel="noopener" class="btn-outline btn-sm" style="font-size:.70rem">Open</a>
  </div>`).join('');
}

/* ══════════════════════════════════════════════════
   JOURNAL
══════════════════════════════════════════════════ */
let curMood = '';
$('moodRow').addEventListener('click', e => {
  const b = e.target.closest('.mood-btn'); if (!b) return;
  $('moodRow').querySelectorAll('.mood-btn').forEach(x => x.classList.remove('on'));
  b.classList.add('on');
  curMood = b.dataset.mood;
});
$('saveJournalBtn').onclick = () => {
  const c = $('journalInput').value.trim();
  if (!c) { toast('Write something first', 'r'); return; }
  sv('journal', { ...st.journal, [isoDay()]: { content: c, mood: curMood, date: new Date().toISOString() } });
  $('journalInput').value = ''; curMood = '';
  $('moodRow').querySelectorAll('.mood-btn').forEach(x => x.classList.remove('on'));
  renderJournal(); renderMoodViz();
  toast('Entry saved', 'g');
  updateStatsUI();
};
function renderJournal() {
  const el = $('journalList'); if (!el) return;
  const entries = Object.entries(st.journal).sort((a, b) => b[0].localeCompare(a[0]));
  const tk = isoDay();
  if (st.journal[tk]) {
    $('journalInput').value = st.journal[tk].content || '';
    if (st.journal[tk].mood) {
      $('moodRow').querySelectorAll('.mood-btn').forEach(b => {
        if (b.dataset.mood === st.journal[tk].mood) { b.classList.add('on'); curMood = b.dataset.mood; }
      });
    }
  }
  if (!entries.length) {
    el.innerHTML = `<div style="font-family:var(--font);font-style:italic;font-size:.85rem;color:var(--t4);text-align:center;padding:24px">No entries yet. Write your first reflection.</div>`;
    return;
  }
  el.innerHTML = entries.map(([k, e]) => `<div class="journal-entry" onclick="viewJournalEntry('${k}')" style="cursor:pointer"><div class="j-date">${e.mood ? `${esc(e.mood)} · ` : ''}${new Date(k + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</div><div class="j-preview">${esc(e.content)}</div></div>`).join('');
}

function viewJournalEntry(key) {
  const e = st.journal[key]; if (!e) return;
  let vm = $('journalViewModal');
  if (!vm) {
    vm = document.createElement('div');
    vm.id = 'journalViewModal';
    vm.className = 'modal-overlay';
    vm.innerHTML = `<div class="modal" style="max-width:560px"><div class="modal-header"><div><div id="jvDate" style="font-family:var(--mono);font-size:.56rem;font-weight:600;letter-spacing:.10em;text-transform:uppercase;color:var(--t1);margin-bottom:6px"></div><h3 id="jvTitle" style="font-weight:800;letter-spacing:-.03em">Journal Entry</h3></div><button type="button" class="modal-close" onclick="document.getElementById('journalViewModal').classList.remove('on')">&times;</button></div><div id="jvMood" style="margin-bottom:14px"></div><div id="jvBody" style="font-size:.88rem;color:var(--t2);line-height:1.75;white-space:pre-wrap"></div></div>`;
    document.body.appendChild(vm);
    vm.addEventListener('click', ev => { if (ev.target === vm) vm.classList.remove('on'); });
  }
  $('jvDate').textContent = new Date(key + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  $('jvMood').innerHTML = e.mood ? `<span class="tag tag-a">${esc(e.mood)}</span>` : '';
  $('jvBody').textContent = e.content || '';
  vm.classList.add('on');
}
function renderMoodViz() {
  const container = $('moodVizContainer'); if (!container) return;
  const MOOD_CFG = {
    Thriving: { val: 5, c: '#22C55E' },
    Content: { val: 4, c: '#FFFFFF' },
    Neutral: { val: 3, c: '#06B6D4' },
    Stressed: { val: 2, c: '#EAB308' },
    Overwhelmed: { val: 1, c: '#EF4444' }
  };
  const days30 = [];
  for (let i = 29; i >= 0; i--) { const d = new Date(Date.now() - i * 86400000); days30.push(d.toISOString().split('T')[0]); }
  const counts = {}; Object.keys(MOOD_CFG).forEach(m => { counts[m] = 0; });
  days30.forEach(d => { if (st.journal[d]?.mood) counts[st.journal[d].mood] = (counts[st.journal[d].mood] || 0) + 1; });
  const logged = days30.filter(d => st.journal[d]).length;
  const avgVal = (() => {
    const v = days30.filter(d => st.journal[d]?.mood).map(d => MOOD_CFG[st.journal[d].mood]?.val || 3);
    return v.length ? (v.reduce((a, b) => a + b, 0) / v.length).toFixed(1) : '--';
  })();
  const WD = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const topMood = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  container.innerHTML = `<div class="glass-card" style="margin-top:16px">
    <div class="card-label"><span>30-Day Trend</span></div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px">
      <div class="tstat"><span class="tstat-val" style="color:var(--t1)">${logged}</span><span class="tstat-lbl">Logged</span></div>
      <div class="tstat"><span class="tstat-val" style="font-size:1.1rem;color:var(--t1)">${topMood?.[1] > 0 ? esc(topMood[0]) : '—'}</span><span class="tstat-lbl">Top Mood</span></div>
      <div class="tstat"><span class="tstat-val" style="color:${avgVal >= 3.5 ? 'var(--green)' : avgVal >= 2.5 ? 'var(--amber)' : 'var(--rose)'}">${avgVal}</span><span class="tstat-lbl">Avg Score</span></div>
    </div>
    <div class="chart-card-title">30-Day Strip</div>
    <div class="mood-viz-bars" id="moodBars"></div>
    <div class="mood-wd-row" id="moodWds"></div>
    <div class="mood-summary">${Object.entries(MOOD_CFG).map(([mood, cfg]) => `<div class="mood-summary-item" style="border-color:${counts[mood] ? cfg.c + '44' : 'var(--bd)'}"><span class="mood-count" style="color:${counts[mood] ? cfg.c : 'var(--t4)'}">${counts[mood]}</span><span class="mood-lbl">${mood}</span></div>`).join('')}</div>
  </div>`;
  const barsEl = $('moodBars'), wdsEl = $('moodWds');
  days30.forEach(day => {
    const entry = st.journal[day];
    const isToday = day === isoDay();
    const bar = document.createElement('div');
    bar.className = 'mood-bar';
    const d = new Date(day + 'T00:00:00');
    if (entry?.mood && MOOD_CFG[entry.mood]) {
      const cfg = MOOD_CFG[entry.mood];
      bar.style.cssText = `height:${(cfg.val / 5) * 100}%;background:${cfg.c};opacity:${isToday ? 1 : .8}`;
      bar.innerHTML = `<div class="mood-tooltip">${esc(entry.mood)} · ${day}</div>`;
    } else {
      bar.style.cssText = 'height:7%;background:var(--bd)';
    }
    barsEl.appendChild(bar);
    const wd = document.createElement('div');
    wd.className = 'mood-wd';
    wd.textContent = WD[d.getDay()];
    if (isToday) wd.style.cssText = 'color:var(--t1);font-weight:700';
    wdsEl.appendChild(wd);
  });
}

/* ══════════════════════════════════════════════════
   FOCUS TIMER
══════════════════════════════════════════════════ */
let pSt = { wm: 25, bm: 5, left: 1500, isWork: true, running: false, iv: null, sess: 0 };
const CIRC = 578;

function updatePomoUI() {
  const m = pad(Math.floor(pSt.left / 60)), s = pad(pSt.left % 60);
  const tm = $('pomoTime'); if (tm) tm.textContent = `${m}:${s}`;
  const lb = $('pomoMode'); if (lb) lb.textContent = pSt.isWork ? 'FOCUS' : 'BREAK';
  const tot = (pSt.isWork ? pSt.wm : pSt.bm) * 60;
  const ring = $('pomoRing');
  if (ring) {
    ring.setAttribute('stroke-dashoffset', CIRC * (1 - (tot - pSt.left) / tot));
    ring.setAttribute('stroke', pSt.isWork ? 'url(#pomoGrad)' : 'url(#breakGrad)');
  }
  const dots = $('pomoDots');
  if (dots) {
    const c = pSt.sess % 4;
    dots.innerHTML = Array(4).fill(0).map((_, i) => `<div class="pomo-dot${i < c ? ' on' : ''}"></div>`).join('');
  }
  const s2 = (id, v) => { const el = $(id); if (el) el.textContent = v; };
  s2('todaySessions', st.todaySess || 0);
  s2('totalSessions', st.sessions || 0);
  s2('focusMins', st.focusMins || 0);
}
$('pomoStart').onclick = togglePomo;
$('pomoReset').onclick = resetPomo;
$('pomoSkip').onclick = skipPomo;

function togglePomo() {
  if (pSt.running) {
    clearInterval(pSt.iv); pSt.running = false;
    const b = $('pomoStart'); if (b) b.textContent = 'Resume';
  } else {
    pSt.running = true;
    const b = $('pomoStart'); if (b) b.textContent = 'Pause';
    pSt.iv = setInterval(() => { pSt.left--; if (pSt.left <= 0) pomoDone(); else updatePomoUI(); }, 1000);
  }
}
function pomoDone() {
  clearInterval(pSt.iv); pSt.running = false; beep();
  if (pSt.isWork) {
    pSt.sess++;
    sv('sessions', st.sessions + 1);
    sv('todaySess', st.todaySess + 1);
    sv('focusMins', (st.focusMins || 0) + pSt.wm);
    st.sessions++;
    if (pSt.sess % 4 === 0) { confetti(); toast('Four sessions complete. Take a long break.', 'g'); }
    else toast(`Focus session done. ${pSt.bm}-min break.`, 'g');
  } else toast('Break over. Back to focus.', 'a');
  pSt.isWork = !pSt.isWork;
  pSt.left = (pSt.isWork ? pSt.wm : pSt.bm) * 60;
  const b = $('pomoStart'); if (b) b.textContent = 'Start';
  updatePomoUI();
}
function resetPomo() {
  clearInterval(pSt.iv); pSt.running = false; pSt.isWork = true;
  pSt.left = pSt.wm * 60;
  const b = $('pomoStart'); if (b) b.textContent = 'Start';
  updatePomoUI();
}
function skipPomo() {
  clearInterval(pSt.iv); pSt.running = false;
  pSt.isWork = !pSt.isWork;
  pSt.left = (pSt.isWork ? pSt.wm : pSt.bm) * 60;
  const b = $('pomoStart'); if (b) b.textContent = 'Start';
  updatePomoUI();
}
$('pomoPresets').addEventListener('click', e => {
  const b = e.target.closest('.preset[data-w]'); if (!b) return;
  $('pomoPresets').querySelectorAll('.preset').forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  pSt.wm = +b.dataset.w;
  pSt.bm = +b.dataset.b;
  resetPomo();
});
$('cwRange').oninput = function () { $('cwVal').textContent = this.value; };
$('cbRange').oninput = function () { $('cbVal').textContent = this.value; };
$('applyCustom').onclick = () => {
  pSt.wm = +$('cwRange').value; pSt.bm = +$('cbRange').value;
  $('pomoPresets').querySelectorAll('.preset').forEach(x => x.classList.remove('active'));
  resetPomo();
  toast('Custom timer applied', 'a');
};
function beep() {
  try {
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    [0, .18, .36].forEach((delay, i) => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.type = 'sine';
      o.frequency.setValueAtTime(880 / (i === 0 ? 1 : i === 1 ? 1.33 : 1.78), ac.currentTime + delay);
      g.gain.setValueAtTime(0, ac.currentTime + delay);
      g.gain.linearRampToValueAtTime(.3, ac.currentTime + delay + .02);
      g.gain.exponentialRampToValueAtTime(.001, ac.currentTime + delay + 1.2);
      o.start(ac.currentTime + delay);
      o.stop(ac.currentTime + delay + 1.3);
    });
  } catch {}
}

/* ══════════════════════════════════════════════════
   AMBIENT SOUNDS
══════════════════════════════════════════════════ */
let ambCtx = null, ambNodes = [], ambGain = null;
function stopAmb() {
  ambNodes.forEach(n => { try { if (n.stop) n.stop(0); n.disconnect(); } catch {} });
  ambNodes = [];
  if (ambGain) { try { ambGain.disconnect(); } catch {} }
  if (ambCtx) { try { ambCtx.close(); } catch {} }
  ambCtx = null; ambGain = null;
}
function makeNoise(ctx, dur = 6) {
  const sr = ctx.sampleRate, len = Math.floor(sr * dur);
  const buf = ctx.createBuffer(2, len, sr);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }
  const src = ctx.createBufferSource();
  src.buffer = buf; src.loop = true;
  return src;
}
document.getElementById('ambGrid').addEventListener('click', e => {
  const btn = e.target.closest('.amb-btn'); if (!btn) return;
  setAmb(btn.dataset.amb, btn);
});
function setAmb(type, btn) {
  document.querySelectorAll('.amb-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  if (ambGain && ambCtx) { try { ambGain.gain.linearRampToValueAtTime(0, ambCtx.currentTime + .5); } catch {} }
  setTimeout(() => {
    stopAmb();
    if (type === 'off') return;
    try {
      ambCtx = new (window.AudioContext || window.webkitAudioContext)();
      ambGain = ambCtx.createGain();
      ambGain.gain.setValueAtTime(0, ambCtx.currentTime);
      ambGain.gain.linearRampToValueAtTime(.72, ambCtx.currentTime + 1);
      ambGain.connect(ambCtx.destination);

      const doStart = () => {
        if (type === 'rain') {
          const r = makeNoise(ambCtx), rf = ambCtx.createBiquadFilter();
          rf.type = 'bandpass'; rf.frequency.value = 500; rf.Q.value = .6;
          const rg = ambCtx.createGain(); rg.gain.value = .5;
          r.connect(rf); rf.connect(rg); rg.connect(ambGain); r.start();
          const r2 = makeNoise(ambCtx), rf2 = ambCtx.createBiquadFilter();
          rf2.type = 'lowpass'; rf2.frequency.value = 90;
          const rg2 = ambCtx.createGain(); rg2.gain.value = .28;
          r2.connect(rf2); rf2.connect(rg2); rg2.connect(ambGain); r2.start();
          ambNodes.push(r, rf, rg, r2, rf2, rg2);
        }
        else if (type === 'forest') {
          const w = makeNoise(ambCtx), wf = ambCtx.createBiquadFilter();
          wf.type = 'bandpass'; wf.frequency.value = 320; wf.Q.value = .45;
          const wg = ambCtx.createGain(); wg.gain.value = .22;
          w.connect(wf); wf.connect(wg); wg.connect(ambGain); w.start();
          ambNodes.push(w, wf, wg);
          const sched = () => {
            if (!ambCtx) return;
            const t = ambCtx.currentTime;
            const nts = [1047, 1175, 1319, 1568, 1760];
            const bo = ambCtx.createOscillator(), bg = ambCtx.createGain();
            bo.type = 'sine';
            bo.frequency.value = nts[Math.floor(Math.random() * nts.length)] * (1 + (Math.random() - .5) * .1);
            bg.gain.setValueAtTime(0, t);
            bg.gain.linearRampToValueAtTime(.07 + Math.random() * .04, t + .012);
            bg.gain.exponentialRampToValueAtTime(.001, t + .12);
            bo.connect(bg); bg.connect(ambGain);
            bo.start(t); bo.stop(t + .15);
            ambNodes.push(bo, bg);
            setTimeout(sched, 1500 + Math.random() * 3000);
          };
          sched();
        }
        else if (type === 'ocean') {
          const o = makeNoise(ambCtx, 8), of2 = ambCtx.createBiquadFilter();
          of2.type = 'lowpass'; of2.frequency.value = 350; of2.Q.value = .5;
          const og = ambCtx.createGain(); og.gain.value = .3;
          o.connect(of2); of2.connect(og); og.connect(ambGain); o.start();
          ambNodes.push(o, of2, og);
          const wave = () => {
            if (!ambCtx) return;
            const dur = 3.5 + Math.random() * 2, t = ambCtx.currentTime;
            const ws = makeNoise(ambCtx, 6), wf = ambCtx.createBiquadFilter();
            wf.type = 'bandpass'; wf.frequency.value = 280 + Math.random() * 180;
            const wg = ambCtx.createGain();
            wg.gain.setValueAtTime(0, t);
            wg.gain.linearRampToValueAtTime(.5 + Math.random() * .2, t + dur * .3);
            wg.gain.exponentialRampToValueAtTime(.001, t + dur * .95);
            ws.connect(wf); wf.connect(wg); wg.connect(ambGain);
            ws.start(t); ws.stop(t + dur + .1);
            ambNodes.push(ws, wf, wg);
            setTimeout(wave, (dur + .5 + Math.random()) * 1000);
          };
          wave();
        }
        else if (type === 'cafe') {
          const m = makeNoise(ambCtx), mf = ambCtx.createBiquadFilter();
          mf.type = 'bandpass'; mf.frequency.value = 700; mf.Q.value = .3;
          const mg = ambCtx.createGain(); mg.gain.value = .2;
          m.connect(mf); mf.connect(mg); mg.connect(ambGain); m.start();
          const h = makeNoise(ambCtx), hf = ambCtx.createBiquadFilter();
          hf.type = 'highpass'; hf.frequency.value = 1800;
          const hg = ambCtx.createGain(); hg.gain.value = .07;
          h.connect(hf); hf.connect(hg); hg.connect(ambGain); h.start();
          ambNodes.push(m, mf, mg, h, hf, hg);
          const clink = () => {
            if (!ambCtx) return;
            const t = ambCtx.currentTime;
            const co = ambCtx.createOscillator(), cg = ambCtx.createGain();
            co.type = 'sine'; co.frequency.value = 1800 + Math.random() * 1400;
            cg.gain.setValueAtTime(0, t);
            cg.gain.linearRampToValueAtTime(.07, t + .003);
            cg.gain.exponentialRampToValueAtTime(.001, t + .3);
            co.connect(cg); cg.connect(ambGain);
            co.start(t); co.stop(t + .35);
            ambNodes.push(co, cg);
            setTimeout(clink, 3000 + Math.random() * 7000);
          };
          clink();
        }
        else if (type === 'lofi') {
          const cr = makeNoise(ambCtx), cf = ambCtx.createBiquadFilter();
          cf.type = 'highshelf'; cf.frequency.value = 4000; cf.gain.value = -14;
          const cg = ambCtx.createGain(); cg.gain.value = .04;
          cr.connect(cf); cf.connect(cg); cg.connect(ambGain); cr.start();
          [130.81, 155.56, 174.61].forEach(f => {
            [0, .005, -.005].forEach(det => {
              const o = ambCtx.createOscillator(), g = ambCtx.createGain();
              o.type = 'triangle'; o.frequency.value = f * (1 + det); g.gain.value = .025;
              o.connect(g); g.connect(ambGain); o.start();
              ambNodes.push(o, g);
            });
          });
          const kick = () => {
            if (!ambCtx) return;
            const t = ambCtx.currentTime;
            const ko = ambCtx.createOscillator(), kg = ambCtx.createGain();
            ko.type = 'sine';
            ko.frequency.setValueAtTime(90, t);
            ko.frequency.exponentialRampToValueAtTime(30, t + .12);
            kg.gain.setValueAtTime(.14, t);
            kg.gain.exponentialRampToValueAtTime(.001, t + .14);
            ko.connect(kg); kg.connect(ambGain);
            ko.start(t); ko.stop(t + .15);
            ambNodes.push(ko, kg);
            setTimeout(kick, 480);
          };
          kick();
          ambNodes.push(cr, cf, cg);
        }
        else if (type === 'white') {
          const s = makeNoise(ambCtx, 6), f = ambCtx.createBiquadFilter();
          f.type = 'highshelf'; f.frequency.value = 4000; f.gain.value = -8;
          const g = ambCtx.createGain(); g.gain.value = .55;
          s.connect(f); f.connect(g); g.connect(ambGain); s.start();
          ambNodes.push(s, f, g);
        }
        else if (type === 'thunder') {
          const r = makeNoise(ambCtx), rf = ambCtx.createBiquadFilter();
          rf.type = 'bandpass'; rf.frequency.value = 400; rf.Q.value = .55;
          const rg = ambCtx.createGain(); rg.gain.value = .45;
          r.connect(rf); rf.connect(rg); rg.connect(ambGain); r.start();
          ambNodes.push(r, rf, rg);
          const thunder = () => {
            if (!ambCtx) return;
            const t = ambCtx.currentTime;
            const dur = 2 + Math.random() * 3;
            const tn = makeNoise(ambCtx, dur + 1), tf = ambCtx.createBiquadFilter();
            tf.type = 'lowpass'; tf.frequency.value = 120;
            const tg = ambCtx.createGain();
            tg.gain.setValueAtTime(0, t);
            tg.gain.linearRampToValueAtTime(.7 + Math.random() * .4, t + .05);
            tg.gain.exponentialRampToValueAtTime(.001, t + dur);
            tn.connect(tf); tf.connect(tg); tg.connect(ambGain);
            tn.start(t); tn.stop(t + dur + .1);
            ambNodes.push(tn, tf, tg);
            setTimeout(thunder, (4 + Math.random() * 8) * 1000);
          };
          thunder();
        }
        const labels = {
          rain: 'Rain', forest: 'Forest', ocean: 'Ocean',
          cafe: 'Café', lofi: 'Lo-Fi', white: 'White Noise', thunder: 'Thunder'
        };
        toast(labels[type] || type, 'a');
      };
      if (ambCtx.state === 'suspended') ambCtx.resume().then(doStart).catch(() => toast('Click anywhere to enable audio', 'y'));
      else doStart();
    } catch (e) { console.warn('Ambient audio error:', e); }
  }, ambGain ? 700 : 50);
}

/* ══════════════════════════════════════════════════
   WELCOME CANVAS — ambient orbs
══════════════════════════════════════════════════ */
function initWCanvas() {
  const cv = $('wCanvas'); if (!cv) return;
  const ctx = cv.getContext('2d');
  let W, H;
  const resize = () => { W = cv.width = cv.offsetWidth; H = cv.height = cv.offsetHeight; };
  resize();
  try { new ResizeObserver(resize).observe($('screen-welcome')); } catch {}

  // Network of connected dots (portfolio-style)
  const N = Math.min(55, Math.floor(window.innerWidth / 22));
  const pts = Array.from({ length: N }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.26,
    vy: (Math.random() - 0.5) * 0.26
  }));

  (function draw() {
    ctx.clearRect(0, 0, W, H);

    // Draw dots
    pts.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(80,140,255,0.3)';
      ctx.fill();
    });

    // Connect dots within range
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x;
        const dy = pts[i].y - pts[j].y;
        const d = Math.hypot(dx, dy);
        if (d < 130) {
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(41,100,255,${(1 - d / 130) * 0.08})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  })();
}

/* ══════════════════════════════════════════════════
   BOOT
══════════════════════════════════════════════════ */
function bootApp(name) {
  const app = $('app'), sW = $('screen-welcome');
  app.classList.add('on');
  sW.classList.add('hidden');
  setTimeout(() => sW.classList.add('gone'), 560);
  sv('name', name);
  $('sbAv').textContent = name[0].toUpperCase();
  $('sbName').textContent = name;
  setGreeting(name);
  updateStreakUI();
  startCD();
  updatePomoUI();
  updateStatsUI();
  applyTheme(st.theme);
  initNoteEditor();
  renderDashboard();
  if (st.exam?.date) {
    const msg = $('examSavedMsg');
    if (msg) {
      msg.textContent = `${st.exam.name || 'Exam'} — ${new Date(st.exam.date).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}`;
      msg.style.display = '';
    }
  }
  if (st.exam) {
    const ei = $('exDate'); if (ei) ei.value = st.exam.date || '';
    const en = $('exName'); if (en) en.value = st.exam.name || '';
  }
  toast(st.streak > 1 ? `Welcome back, ${name}. ${st.streak}-day streak.` : `Welcome, ${name}.`, st.streak > 1 ? 'y' : 'g');
  setTimeout(initMotionLayer, 200);
}

function doLaunch(name) {
  sv('name', name);
  checkStreak();
  bootApp(name);
}
function triggerLaunch() { doLaunch(($('wName').value.trim()) || 'Student'); }
$('wBtn').addEventListener('click', triggerLaunch);
$('wName').addEventListener('keydown', e => { if (e.key === 'Enter') triggerLaunch(); });

/* ── AUTO-INIT ───────────────────────────────────── */

function initCursorCompanion() {
  const CD = document.getElementById('cur-d');
  const CR = document.getElementById('cur-r');
  const TC = document.getElementById('trail-cv');
  if (!CD || !CR) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  let mx = -300, my = -300, rx = -300, ry = -300;
  const LR = 0.092;
  const trail = [];
  const MAX_TRAIL = 22;

  if (TC) {
    const tCtx = TC.getContext('2d');
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      TC.width = window.innerWidth * dpr;
      TC.height = window.innerHeight * dpr;
      TC.style.width = window.innerWidth + 'px';
      TC.style.height = window.innerHeight + 'px';
      tCtx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    (function loop() {
      rx += (mx - rx) * LR;
      ry += (my - ry) * LR;
      CR.style.transform = 'translate3d(' + (rx - 18) + 'px,' + (ry - 18) + 'px,0)';
      tCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      const now = performance.now();
      if (trail.length > 1) {
        for (let i = 1; i < trail.length; i++) {
          const age = (now - trail[i].t) / 380;
          if (age > 1) continue;
          const fade = (1 - age) * (i / trail.length);
          const a = fade * 0.55;
          const sz = (i / trail.length) * 2.4;
          tCtx.beginPath();
          tCtx.arc(trail[i].x, trail[i].y, sz * 0.42, 0, Math.PI * 2);
          tCtx.fillStyle = 'rgba(41,151,255,' + a + ')';
          tCtx.fill();
          tCtx.beginPath();
          tCtx.moveTo(trail[i-1].x, trail[i-1].y);
          tCtx.lineTo(trail[i].x, trail[i].y);
          tCtx.strokeStyle = 'rgba(41,151,255,' + (fade * 0.22) + ')';
          tCtx.lineWidth = 0.8;
          tCtx.stroke();
        }
      }
      requestAnimationFrame(loop);
    })();
  }

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    CD.style.transform = 'translate3d(' + (mx - 3) + 'px,' + (my - 3) + 'px,0)';
    trail.push({ x: mx, y: my, t: performance.now() });
    if (trail.length > MAX_TRAIL) trail.shift();
  }, { passive: true });

  const hoverSel = 'a,button,input,textarea,select,[role="button"],.nav-item,.chip,.glass-card,.stat-card,.note-card,.ref-card,.goal-slot,.task-item,.pq-item,.journal-entry,.sat-row,.paper-item,.sb-mark,.tb-icon-btn,.tb-streak,.tb-avatar,.modal-close,.preset,.pomo-preset-btn,.pomo-btn,.amb-btn,.ref-tab,.mood-btn,.w-btn,.w-input,.ne-tool,.task-mini-item';

  document.addEventListener('mouseover', e => {
    const hit = e.target.closest ? e.target.closest(hoverSel) : null;
    if (hit) {
      document.body.classList.add('ch');
      if (hit.matches('.w-btn,.btn-primary,.btn-outline,.practice-gen-btn,.pomo-btn-main,.pomo-btn-sec,.f-send,.sat-link,.nav-cta')) {
        document.body.classList.add('c-btn');
        document.body.classList.remove('c-link');
      } else if (hit.matches('a,.nav-item,.ref-card,.clink')) {
        document.body.classList.add('c-link');
        document.body.classList.remove('c-btn');
      } else {
        document.body.classList.remove('c-btn','c-link');
      }
    } else {
      document.body.classList.remove('ch','c-btn','c-link');
    }
  }, { passive: true });

  document.addEventListener('mousedown', () => document.body.classList.add('cp'), { passive: true });
  document.addEventListener('mouseup',   () => document.body.classList.remove('cp'), { passive: true });
  document.addEventListener('mouseleave', () => {
    CD.style.opacity = '0';
    CR.style.opacity = '0';
    if (TC) TC.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    CD.style.opacity = '';
    CR.style.opacity = '';
    if (TC) TC.style.opacity = '';
  });
}

function initMotionLayer() {
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('rv-show');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
    document.querySelectorAll('.glass-card,.stat-card,.note-card,.ref-card,.goal-slot,.tstat,.pq-item,.sat-row').forEach((el, i) => {
      el.classList.add('rv-item');
      el.style.transitionDelay = (Math.min(i, 6) * 35) + 'ms';
      obs.observe(el);
    });
  }
  document.querySelectorAll('.glass-card,.stat-card,.note-card,.ref-card,.goal-slot').forEach(card => {
    let raf = 0;
    card.addEventListener('mousemove', e => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = card.getBoundingClientRect();
        const mx = ((e.clientX - r.left) / r.width * 100).toFixed(1);
        const my = ((e.clientY - r.top) / r.height * 100).toFixed(1);
        card.style.setProperty('--mx', mx + '%');
        card.style.setProperty('--my', my + '%');
      });
    }, { passive: true });
  });
}

(function init() {
  initWCanvas();
  applyTheme(st.theme);
  initCursorCompanion();
  if (st.name) setTimeout(() => doLaunch(st.name), 300);
  setTimeout(initMotionLayer, 400);
})();
