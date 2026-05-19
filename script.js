'use strict';
/* ══════════════════════════════════════════════════════
   STUDYOS · MMXXVI
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
const ML_API_URL = 'https://studyos-api-8eli.onrender.com'; 

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
    let b = `<div style="font-size:.86rem;color:var(--t2);line-height:1.65;margin-bottom:14px">Here's when you should revisit each weak topic for maximum retention, based on proven spaced-repetition timing:</div>`;
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
    let b = `<div style="font-size:.86rem;color:var(--t2);line-height:1.65;margin-bottom:14px">Here's when you should revisit each weak topic for maximum retention, based on proven spaced-repetition timing:</div>`;
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

  // ── MATHEMATICS · Procedural (effectively infinite variety) ──
  const mathGen = () => {
    const out = [];
    // Linear equations: 60 variants per call with random coefficients
    for (let i = 0; i < 60; i++) {
      const a = rand(2, 19), b = rand(1, 50), c = rand(30, 200);
      const x = ((c - b) / a).toFixed(2);
      out.push({ q: `Solve for x: ${a}x + ${b} = ${c}`, a: `x = ${x}`, topic: "Linear Equations" });
    }
    // Two-variable linear systems
    for (let i = 0; i < 30; i++) {
      const x = rand(-9, 9), y = rand(-9, 9);
      const a1 = rand(1, 5), b1 = rand(1, 5), c1 = a1 * x + b1 * y;
      const a2 = rand(1, 5), b2 = rand(1, 5), c2 = a2 * x + b2 * y;
      out.push({ q: `Solve the system: ${a1}x + ${b1}y = ${c1}, ${a2}x + ${b2}y = ${c2}`, a: `x = ${x}, y = ${y}`, topic: "Linear Systems" });
    }
    // Quadratic by factoring with random roots
    for (let i = 0; i < 50; i++) {
      const r1 = rand(-8, 8), r2 = rand(-8, 8);
      const b = -(r1 + r2), c = r1 * r2;
      const bSign = b >= 0 ? '+' : '';
      const cSign = c >= 0 ? '+' : '';
      out.push({ q: `Solve x² ${bSign}${b}x ${cSign}${c} = 0`, a: r1 === r2 ? `x = ${r1} (double root)` : `x = ${r1} or x = ${r2}`, topic: "Quadratic Equations" });
    }
    // Quadratic formula problems
    for (let i = 0; i < 40; i++) {
      const a = rand(1, 4), p = rand(-7, 7), q = rand(-7, 7);
      const bv = -(p + q) * a, cv = a * p * q;
      out.push({ q: `Find the roots of ${a}x² + ${bv}x + ${cv} = 0`, a: p === q ? `x = ${p}` : `x = ${p} or x = ${q}`, topic: "Quadratic Equations" });
    }
    // Discriminant
    for (let i = 0; i < 20; i++) {
      const a = rand(1, 5), b = rand(-10, 10), c = rand(-10, 10);
      const d = b * b - 4 * a * c;
      out.push({ q: `Find discriminant: ${a}x² + ${b}x + ${c} = 0`, a: `D = ${d}; ${d > 0 ? 'two real roots' : d === 0 ? 'one real root' : 'no real roots'}`, topic: "Quadratic Equations" });
    }
    // Distance formula
    for (let i = 0; i < 40; i++) {
      const x1 = rand(-10, 10), y1 = rand(-10, 10), x2 = rand(-10, 10), y2 = rand(-10, 10);
      const d = Math.sqrt((x2-x1)**2 + (y2-y1)**2).toFixed(2);
      out.push({ q: `Distance between (${x1}, ${y1}) and (${x2}, ${y2})?`, a: `√((${x2-x1})² + (${y2-y1})²) = ${d}`, topic: "Coordinate Geometry" });
    }
    // Midpoint
    for (let i = 0; i < 30; i++) {
      const x1 = rand(-15, 15), y1 = rand(-15, 15), x2 = rand(-15, 15), y2 = rand(-15, 15);
      out.push({ q: `Midpoint of (${x1}, ${y1}) and (${x2}, ${y2})?`, a: `(${(x1+x2)/2}, ${(y1+y2)/2})`, topic: "Coordinate Geometry" });
    }
    // Slope
    for (let i = 0; i < 30; i++) {
      const x1 = rand(-9, 9), y1 = rand(-9, 9);
      let x2 = rand(-9, 9); if (x2 === x1) x2 += 1;
      const y2 = rand(-9, 9);
      const m = ((y2 - y1) / (x2 - x1)).toFixed(2);
      out.push({ q: `Slope through (${x1}, ${y1}) and (${x2}, ${y2})?`, a: `m = ${m}`, topic: "Coordinate Geometry" });
    }
    // Pythagorean
    const pythTrips = [[3,4,5],[5,12,13],[8,15,17],[7,24,25],[9,40,41],[20,21,29],[12,35,37],[11,60,61],[6,8,10],[9,12,15],[10,24,26]];
    for (let i = 0; i < 30; i++) {
      const t = pick(pythTrips), k = rand(1, 5);
      out.push({ q: `Right triangle with legs ${t[0]*k} and ${t[1]*k}. Hypotenuse?`, a: `${t[2]*k} (since ${t[0]*k}² + ${t[1]*k}² = ${t[2]*k}²)`, topic: "Geometry" });
    }
    // Area & perimeter
    for (let i = 0; i < 30; i++) {
      const l = rand(3, 25), w = rand(3, 25);
      out.push({ q: `Area of rectangle with length ${l} and width ${w}?`, a: `${l * w} square units`, topic: "Geometry" });
    }
    for (let i = 0; i < 20; i++) {
      const r = rand(2, 20);
      out.push({ q: `Area of circle with radius ${r}? (Use π = 3.14)`, a: `${(3.14 * r * r).toFixed(2)} sq units`, topic: "Geometry" });
    }
    for (let i = 0; i < 20; i++) {
      const r = rand(2, 20);
      out.push({ q: `Circumference of circle with radius ${r}? (Use π = 3.14)`, a: `${(2 * 3.14 * r).toFixed(2)} units`, topic: "Geometry" });
    }
    // Volume
    for (let i = 0; i < 20; i++) {
      const l = rand(2, 12), w = rand(2, 12), h = rand(2, 12);
      out.push({ q: `Volume of cuboid ${l}×${w}×${h}?`, a: `${l*w*h} cubic units`, topic: "Geometry" });
    }
    // Percentages
    for (let i = 0; i < 30; i++) {
      const p = pick([5,10,12,15,20,25,30,35,40,45,50,60,75,80]), n = rand(40, 800);
      out.push({ q: `${p}% of ${n}?`, a: `${(p * n / 100).toFixed(2)}`, topic: "Percentages" });
    }
    for (let i = 0; i < 20; i++) {
      const part = rand(5, 90), whole = rand(100, 500);
      out.push({ q: `${part} is what percent of ${whole}?`, a: `${(part / whole * 100).toFixed(2)}%`, topic: "Percentages" });
    }
    // Ratios
    for (let i = 0; i < 20; i++) {
      const k = rand(2, 8), a = rand(2, 9), b = rand(2, 9);
      out.push({ q: `Simplify the ratio ${a*k}:${b*k}`, a: `${a}:${b}`, topic: "Ratios" });
    }
    // Simple interest
    for (let i = 0; i < 25; i++) {
      const P = rand(500, 20000), R = rand(3, 15), T = rand(1, 10);
      const SI = (P * R * T / 100).toFixed(2);
      out.push({ q: `Simple Interest: P=${P}, R=${R}%, T=${T} years?`, a: `SI = ${SI}`, topic: "Simple Interest" });
    }
    // Compound interest
    for (let i = 0; i < 20; i++) {
      const P = rand(1000, 10000), R = rand(4, 12), T = rand(2, 5);
      const CI = (P * Math.pow(1 + R/100, T) - P).toFixed(2);
      out.push({ q: `Compound Interest: P=${P}, R=${R}%, T=${T} years (annually compounded)?`, a: `CI ≈ ${CI}`, topic: "Compound Interest" });
    }
    // Statistics — mean/median/mode/range
    for (let i = 0; i < 30; i++) {
      const arr = [];
      for (let j = 0; j < 6; j++) arr.push(rand(1, 50));
      const mean = (arr.reduce((s,x) => s+x, 0) / arr.length).toFixed(2);
      out.push({ q: `Mean of ${arr.join(", ")}?`, a: mean, topic: "Statistics" });
    }
    for (let i = 0; i < 20; i++) {
      const arr = [];
      for (let j = 0; j < 5; j++) arr.push(rand(1, 50));
      const sorted = [...arr].sort((a,b)=>a-b);
      out.push({ q: `Median of ${arr.join(", ")}?`, a: `${sorted[2]} (sorted: ${sorted.join(", ")})`, topic: "Statistics" });
    }
    for (let i = 0; i < 15; i++) {
      const arr = [];
      for (let j = 0; j < 6; j++) arr.push(rand(1, 30));
      out.push({ q: `Range of ${arr.join(", ")}?`, a: `${Math.max(...arr) - Math.min(...arr)}`, topic: "Statistics" });
    }
    // Trigonometry
    const trigs = [
      { q: "sin 30°?", a: "1/2 = 0.5" }, { q: "sin 45°?", a: "√2/2 ≈ 0.707" }, { q: "sin 60°?", a: "√3/2 ≈ 0.866" }, { q: "sin 90°?", a: "1" }, { q: "sin 0°?", a: "0" },
      { q: "cos 30°?", a: "√3/2 ≈ 0.866" }, { q: "cos 45°?", a: "√2/2 ≈ 0.707" }, { q: "cos 60°?", a: "1/2 = 0.5" }, { q: "cos 90°?", a: "0" }, { q: "cos 0°?", a: "1" },
      { q: "tan 30°?", a: "1/√3 ≈ 0.577" }, { q: "tan 45°?", a: "1" }, { q: "tan 60°?", a: "√3 ≈ 1.732" }, { q: "tan 0°?", a: "0" }, { q: "tan 180°?", a: "0" },
      { q: "sin²θ + cos²θ = ?", a: "1 (Pythagorean identity)" },
      { q: "1 + tan²θ = ?", a: "sec²θ" },
      { q: "1 + cot²θ = ?", a: "csc²θ" },
      { q: "sin(2θ) = ?", a: "2 sin θ cos θ" },
      { q: "cos(2θ) = ?", a: "cos²θ - sin²θ = 1 - 2sin²θ = 2cos²θ - 1" },
      { q: "sin(A+B) = ?", a: "sin A cos B + cos A sin B" },
      { q: "cos(A+B) = ?", a: "cos A cos B - sin A sin B" },
      { q: "Convert 60° to radians", a: "π/3 ≈ 1.047 rad" },
      { q: "Convert π/4 radians to degrees", a: "45°" },
      { q: "Convert 90° to radians", a: "π/2 ≈ 1.571 rad" },
    ];
    for (let i = 0; i < 30; i++) out.push({ ...pick(trigs), topic: "Trigonometry" });
    // Logarithms
    const logs = [
      { q: "log₁₀(100)?", a: "2" }, { q: "log₁₀(1000)?", a: "3" }, { q: "log₁₀(1)?", a: "0" },
      { q: "log₂(8)?", a: "3" }, { q: "log₂(32)?", a: "5" }, { q: "log₂(64)?", a: "6" }, { q: "log₂(128)?", a: "7" }, { q: "log₂(256)?", a: "8" },
      { q: "ln(e)?", a: "1" }, { q: "ln(1)?", a: "0" }, { q: "ln(e²)?", a: "2" },
      { q: "log(ab) = ?", a: "log a + log b" },
      { q: "log(a/b) = ?", a: "log a - log b" },
      { q: "log(aⁿ) = ?", a: "n · log a" },
      { q: "Solve 2^x = 16", a: "x = 4" },
      { q: "Solve 3^x = 81", a: "x = 4" },
      { q: "Solve 10^x = 1000", a: "x = 3" },
      { q: "Change of base: log_a(b) = ?", a: "log(b)/log(a)" },
    ];
    for (let i = 0; i < 25; i++) out.push({ ...pick(logs), topic: "Logarithms" });
    // Calculus essentials
    const calcQs = [
      { q: "d/dx [x²]?", a: "2x" }, { q: "d/dx [x³]?", a: "3x²" }, { q: "d/dx [x^n]?", a: "n·x^(n-1)" },
      { q: "d/dx [sin x]?", a: "cos x" }, { q: "d/dx [cos x]?", a: "-sin x" }, { q: "d/dx [tan x]?", a: "sec²x" },
      { q: "d/dx [e^x]?", a: "e^x" }, { q: "d/dx [ln x]?", a: "1/x" }, { q: "d/dx [a^x]?", a: "a^x · ln a" },
      { q: "d/dx [constant]?", a: "0" }, { q: "Product rule?", a: "(fg)' = f'g + fg'" }, { q: "Quotient rule?", a: "(f/g)' = (f'g - fg')/g²" },
      { q: "Chain rule?", a: "(f(g(x)))' = f'(g(x)) · g'(x)" },
      { q: "∫ x dx?", a: "x²/2 + C" }, { q: "∫ x² dx?", a: "x³/3 + C" }, { q: "∫ x^n dx?", a: "x^(n+1)/(n+1) + C, n ≠ -1" },
      { q: "∫ sin x dx?", a: "-cos x + C" }, { q: "∫ cos x dx?", a: "sin x + C" }, { q: "∫ e^x dx?", a: "e^x + C" },
      { q: "∫ 1/x dx?", a: "ln|x| + C" }, { q: "∫ sec²x dx?", a: "tan x + C" },
      { q: "Fundamental Theorem of Calculus?", a: "∫[a,b] f'(x)dx = f(b) - f(a)" },
      { q: "Limit definition of derivative?", a: "f'(x) = lim[h→0] [f(x+h) - f(x)]/h" },
      { q: "L'Hôpital's rule applies when?", a: "Limit gives 0/0 or ∞/∞" },
    ];
    for (let i = 0; i < 40; i++) out.push({ ...pick(calcQs), topic: "Calculus" });
    // Sequences
    for (let i = 0; i < 20; i++) {
      const a = rand(1, 20), d = rand(2, 9), n = rand(5, 15);
      out.push({ q: `Find ${n}th term of AP: first=${a}, common diff=${d}`, a: `${a + (n-1)*d}`, topic: "Sequences" });
    }
    for (let i = 0; i < 15; i++) {
      const a = rand(1, 8), r = rand(2, 4), n = rand(3, 7);
      out.push({ q: `Find ${n}th term of GP: first=${a}, ratio=${r}`, a: `${a * Math.pow(r, n-1)}`, topic: "Sequences" });
    }
    // Probability
    for (let i = 0; i < 25; i++) {
      const tot = rand(8, 20), fav = rand(1, tot - 1);
      out.push({ q: `Bag has ${tot} balls. ${fav} are red. P(red)?`, a: `${fav}/${tot} = ${(fav/tot).toFixed(3)}`, topic: "Probability" });
    }
    return out;
  };
  const mathQs = mathGen();

  // ── PHYSICS · Procedural ──
  const physGen = () => {
    const out = [];
    // Kinematics: v = u + at
    for (let i = 0; i < 50; i++) {
      const u = rand(0, 25), a = rand(2, 12), t = rand(1, 15);
      out.push({ q: `Initial velocity ${u} m/s, acceleration ${a} m/s². Velocity after ${t}s?`, a: `v = u + at = ${u} + ${a}×${t} = ${u + a*t} m/s`, topic: "Kinematics" });
    }
    // Distance: s = ut + ½at²
    for (let i = 0; i < 40; i++) {
      const u = rand(0, 20), a = rand(2, 10), t = rand(2, 10);
      const s = (u * t + 0.5 * a * t * t).toFixed(2);
      out.push({ q: `Initial velocity ${u} m/s, acceleration ${a} m/s². Distance in ${t}s?`, a: `s = ut + ½at² = ${s} m`, topic: "Kinematics" });
    }
    // v² = u² + 2as
    for (let i = 0; i < 30; i++) {
      const u = rand(0, 20), a = rand(2, 10), s = rand(10, 100);
      const v = Math.sqrt(u*u + 2*a*s).toFixed(2);
      out.push({ q: `u = ${u} m/s, a = ${a} m/s², distance = ${s} m. Final velocity?`, a: `v² = u² + 2as = ${u*u + 2*a*s}; v = ${v} m/s`, topic: "Kinematics" });
    }
    // Newton's 2nd: F = ma
    for (let i = 0; i < 40; i++) {
      const m = rand(2, 80), a = rand(2, 25);
      out.push({ q: `Mass ${m} kg, acceleration ${a} m/s². Net force?`, a: `F = ma = ${m * a} N`, topic: "Newton's Laws" });
    }
    // Weight: W = mg (g=9.8)
    for (let i = 0; i < 30; i++) {
      const m = rand(5, 200);
      out.push({ q: `Mass ${m} kg. Weight on Earth (g=9.8)?`, a: `W = mg = ${(m * 9.8).toFixed(2)} N`, topic: "Newton's Laws" });
    }
    // Momentum
    for (let i = 0; i < 30; i++) {
      const m = rand(1, 50), v = rand(2, 40);
      out.push({ q: `Mass ${m} kg moving at ${v} m/s. Momentum?`, a: `p = mv = ${m * v} kg·m/s`, topic: "Momentum" });
    }
    // KE
    for (let i = 0; i < 30; i++) {
      const m = rand(2, 100), v = rand(2, 30);
      out.push({ q: `KE of ${m} kg object at ${v} m/s?`, a: `KE = ½mv² = ${(0.5 * m * v * v).toFixed(2)} J`, topic: "Energy" });
    }
    // PE
    for (let i = 0; i < 25; i++) {
      const m = rand(2, 60), h = rand(2, 50);
      out.push({ q: `PE of ${m} kg at height ${h} m (g=9.8)?`, a: `PE = mgh = ${(m * 9.8 * h).toFixed(2)} J`, topic: "Energy" });
    }
    // Power
    for (let i = 0; i < 20; i++) {
      const w = rand(100, 5000), t = rand(2, 60);
      out.push({ q: `${w} J of work done in ${t} s. Power?`, a: `P = W/t = ${(w / t).toFixed(2)} W`, topic: "Energy" });
    }
    // Ohm's law
    for (let i = 0; i < 40; i++) {
      const v = rand(6, 240), r = rand(2, 50);
      out.push({ q: `Voltage ${v}V, resistance ${r}Ω. Current?`, a: `I = V/R = ${(v / r).toFixed(2)} A`, topic: "Electricity" });
    }
    // Power dissipated
    for (let i = 0; i < 25; i++) {
      const v = rand(10, 240), r = rand(5, 100);
      out.push({ q: `Voltage ${v}V across ${r}Ω. Power dissipated?`, a: `P = V²/R = ${(v*v/r).toFixed(2)} W`, topic: "Electricity" });
    }
    // Conceptual
    const cQs = [
      { q: "State Newton's First Law", a: "An object remains at rest or in uniform motion unless acted on by a net external force (inertia)." },
      { q: "State Newton's Third Law", a: "For every action, there is an equal and opposite reaction." },
      { q: "Define acceleration", a: "Rate of change of velocity with respect to time; a = Δv/Δt" },
      { q: "Define work", a: "Work = Force × displacement × cos(θ); measured in joules" },
      { q: "Define power", a: "Rate of doing work; P = W/t; measured in watts" },
      { q: "What is gravitational potential energy?", a: "Energy due to position in a gravitational field; PE = mgh" },
      { q: "State law of conservation of energy", a: "Energy can neither be created nor destroyed, only transformed." },
      { q: "What is impulse?", a: "Impulse = Force × time = Change in momentum" },
      { q: "Coulomb's law?", a: "F = k·q₁q₂/r²; force between two charges" },
      { q: "Define electric field", a: "E = F/q; force per unit positive charge" },
      { q: "Speed of light?", a: "c ≈ 3 × 10⁸ m/s in vacuum" },
      { q: "What is refraction?", a: "Bending of light when passing from one medium to another due to change in speed" },
      { q: "Snell's law?", a: "n₁ sin θ₁ = n₂ sin θ₂" },
      { q: "What is total internal reflection?", a: "Light reflecting entirely back when angle exceeds critical angle" },
      { q: "Wave equation?", a: "v = fλ (speed = frequency × wavelength)" },
      { q: "Define frequency", a: "Number of oscillations per second; unit: Hertz (Hz)" },
      { q: "What is amplitude?", a: "Maximum displacement from equilibrium position" },
      { q: "What are sound waves?", a: "Longitudinal mechanical waves requiring a medium" },
      { q: "Doppler effect?", a: "Change in observed frequency due to relative motion of source/observer" },
      { q: "What is electromagnetic induction?", a: "Generation of EMF in a conductor due to changing magnetic flux (Faraday's law)" },
      { q: "Lenz's law?", a: "Induced current opposes the change that produces it" },
      { q: "What is alternating current?", a: "Current that periodically reverses direction" },
      { q: "Define magnetic flux", a: "Φ = B·A·cos(θ); measure of magnetic field through a surface" },
      { q: "What is a transformer?", a: "Device that transfers electrical energy between circuits via electromagnetic induction" },
      { q: "Photoelectric effect?", a: "Emission of electrons from a material when light strikes it (proves quantum nature of light)" },
      { q: "What is a photon?", a: "Quantum of electromagnetic radiation; E = hf" },
      { q: "Heisenberg uncertainty principle?", a: "Cannot simultaneously know position and momentum precisely: Δx·Δp ≥ ℏ/2" },
      { q: "Wave-particle duality?", a: "All particles exhibit both wave and particle properties (de Broglie hypothesis)" },
      { q: "What is radioactivity?", a: "Spontaneous decay of unstable nuclei emitting α, β, or γ radiation" },
      { q: "Half-life?", a: "Time for half of radioactive substance to decay" },
      { q: "E = mc²?", a: "Einstein's mass-energy equivalence; mass and energy are interchangeable" },
      { q: "First law of thermodynamics?", a: "ΔU = Q - W; energy conserved in heat & work transfers" },
      { q: "Second law of thermodynamics?", a: "Entropy of isolated system always increases" },
      { q: "What is entropy?", a: "Measure of disorder or randomness in a system" },
      { q: "Specific heat capacity?", a: "Heat required to raise 1 kg of substance by 1°C; Q = mcΔT" },
      { q: "What is latent heat?", a: "Heat absorbed/released during phase change at constant temperature" },
      { q: "Ideal gas law?", a: "PV = nRT" },
      { q: "Boyle's law?", a: "At constant T, P ∝ 1/V (PV = constant)" },
      { q: "Charles' law?", a: "At constant P, V ∝ T (V/T = constant)" },
      { q: "Pascal's principle?", a: "Pressure applied to enclosed fluid transmits equally in all directions" },
      { q: "Archimedes' principle?", a: "Buoyant force = weight of fluid displaced" },
      { q: "What is surface tension?", a: "Tendency of liquid surface to contract to minimum area" },
      { q: "Viscosity?", a: "Resistance of fluid to flow; internal friction" },
      { q: "Bernoulli's equation?", a: "P + ½ρv² + ρgh = constant along streamline" },
      { q: "What is centripetal force?", a: "Net inward force on object in circular motion; F = mv²/r" },
      { q: "Define angular velocity", a: "ω = dθ/dt; rate of angular displacement (rad/s)" },
      { q: "Torque formula?", a: "τ = r × F = rF sin θ" },
      { q: "Moment of inertia?", a: "I = Σmr²; resistance to angular acceleration" },
      { q: "Angular momentum?", a: "L = Iω; conserved if no external torque" },
      { q: "Hooke's law?", a: "F = -kx; restoring force proportional to displacement" },
      { q: "Period of simple pendulum?", a: "T = 2π√(L/g)" },
      { q: "Period of spring oscillator?", a: "T = 2π√(m/k)" },
    ];
    for (let i = 0; i < 200; i++) out.push({ ...pick(cQs), topic: pick(["Mechanics","Optics","Waves","Electromagnetism","Modern Physics","Thermodynamics","Fluid Mechanics","Oscillations"]) });
    return out;
  };
  const physQs = physGen();

  // ── CHEMISTRY · Procedural ──
  const chemGen = () => {
    const out = [];
    const elements = [
      { sym: "H", name: "Hydrogen", n: 1, mass: 1 }, { sym: "He", name: "Helium", n: 2, mass: 4 },
      { sym: "Li", name: "Lithium", n: 3, mass: 7 }, { sym: "Be", name: "Beryllium", n: 4, mass: 9 },
      { sym: "B", name: "Boron", n: 5, mass: 11 }, { sym: "C", name: "Carbon", n: 6, mass: 12 },
      { sym: "N", name: "Nitrogen", n: 7, mass: 14 }, { sym: "O", name: "Oxygen", n: 8, mass: 16 },
      { sym: "F", name: "Fluorine", n: 9, mass: 19 }, { sym: "Ne", name: "Neon", n: 10, mass: 20 },
      { sym: "Na", name: "Sodium", n: 11, mass: 23 }, { sym: "Mg", name: "Magnesium", n: 12, mass: 24 },
      { sym: "Al", name: "Aluminium", n: 13, mass: 27 }, { sym: "Si", name: "Silicon", n: 14, mass: 28 },
      { sym: "P", name: "Phosphorus", n: 15, mass: 31 }, { sym: "S", name: "Sulphur", n: 16, mass: 32 },
      { sym: "Cl", name: "Chlorine", n: 17, mass: 35.5 }, { sym: "Ar", name: "Argon", n: 18, mass: 40 },
      { sym: "K", name: "Potassium", n: 19, mass: 39 }, { sym: "Ca", name: "Calcium", n: 20, mass: 40 },
      { sym: "Fe", name: "Iron", n: 26, mass: 56 }, { sym: "Cu", name: "Copper", n: 29, mass: 63.5 },
      { sym: "Zn", name: "Zinc", n: 30, mass: 65 }, { sym: "Ag", name: "Silver", n: 47, mass: 108 },
      { sym: "Au", name: "Gold", n: 79, mass: 197 },
    ];
    for (let i = 0; i < 80; i++) {
      const el = pick(elements);
      const which = rand(0, 2);
      if (which === 0) out.push({ q: `Atomic number of ${el.name}?`, a: `${el.n}`, topic: "Periodic Table" });
      else if (which === 1) out.push({ q: `Symbol of ${el.name}?`, a: el.sym, topic: "Periodic Table" });
      else out.push({ q: `Atomic mass of ${el.name}?`, a: `${el.mass} u`, topic: "Periodic Table" });
    }
    // pH-based questions
    for (let i = 0; i < 25; i++) {
      const ph = rand(0, 14);
      out.push({ q: `Solution has pH = ${ph}. Is it acidic, basic, or neutral?`, a: ph < 7 ? "Acidic" : ph > 7 ? "Basic" : "Neutral", topic: "Acids & Bases" });
    }
    // Molarity
    for (let i = 0; i < 25; i++) {
      const m = rand(1, 50), v = rand(1, 10);
      out.push({ q: `${m} moles of solute in ${v} L of solution. Molarity?`, a: `M = ${(m/v).toFixed(2)} mol/L`, topic: "Solutions" });
    }
    // Moles
    for (let i = 0; i < 25; i++) {
      const mass = rand(10, 500), mm = rand(18, 200);
      out.push({ q: `Moles in ${mass} g of substance with molar mass ${mm} g/mol?`, a: `${(mass/mm).toFixed(3)} mol`, topic: "Stoichiometry" });
    }
    // Concepts
    const cQs = [
      { q: "What is an atom?", a: "Smallest unit of matter that retains element's identity" },
      { q: "Define isotope", a: "Atoms of same element with different mass numbers (same protons, different neutrons)" },
      { q: "What is a chemical bond?", a: "Force holding atoms together in molecules/compounds" },
      { q: "Ionic vs covalent?", a: "Ionic: transfer of electrons (metal+nonmetal); Covalent: sharing of electrons (nonmetals)" },
      { q: "What is electronegativity?", a: "Tendency of atom to attract bonded electrons" },
      { q: "Acid definition (Brønsted-Lowry)?", a: "Proton (H⁺) donor" },
      { q: "Base definition (Brønsted-Lowry)?", a: "Proton (H⁺) acceptor" },
      { q: "What is pH?", a: "pH = -log[H⁺]; measure of acidity (0-14 scale)" },
      { q: "Avogadro's number?", a: "6.022 × 10²³ particles per mole" },
      { q: "What is a mole?", a: "Amount of substance containing 6.022×10²³ particles" },
      { q: "Define oxidation", a: "Loss of electrons / increase in oxidation state" },
      { q: "Define reduction", a: "Gain of electrons / decrease in oxidation state" },
      { q: "What is a catalyst?", a: "Substance that speeds reaction without being consumed" },
      { q: "Le Chatelier's principle?", a: "System at equilibrium opposes change; shifts to counteract disturbance" },
      { q: "Define endothermic", a: "Absorbs heat; ΔH > 0" },
      { q: "Define exothermic", a: "Releases heat; ΔH < 0" },
      { q: "Activation energy?", a: "Minimum energy required to start a reaction" },
      { q: "What are noble gases?", a: "Group 18 elements; chemically inert with full outer shells" },
      { q: "What is electrolysis?", a: "Decomposition of compound using electric current" },
      { q: "Faraday's first law?", a: "Mass of substance deposited ∝ charge passed" },
      { q: "What is hybridization?", a: "Mixing of atomic orbitals to form equivalent hybrid orbitals" },
      { q: "sp³ hybridization shape?", a: "Tetrahedral; bond angle 109.5°" },
      { q: "sp² hybridization shape?", a: "Trigonal planar; bond angle 120°" },
      { q: "sp hybridization shape?", a: "Linear; bond angle 180°" },
      { q: "What is a buffer solution?", a: "Solution resisting pH change on adding small amounts of acid/base" },
      { q: "Define electrolyte", a: "Substance that conducts electricity when dissolved or molten" },
      { q: "What is a polymer?", a: "Large molecule from repeating subunits (monomers)" },
      { q: "Functional group of alcohols?", a: "-OH (hydroxyl)" },
      { q: "Functional group of carboxylic acids?", a: "-COOH" },
      { q: "Functional group of aldehydes?", a: "-CHO" },
      { q: "Functional group of ketones?", a: "C=O within carbon chain" },
      { q: "Functional group of esters?", a: "-COOR" },
      { q: "Functional group of amines?", a: "-NH₂ (or -NHR / -NR₂)" },
      { q: "What is isomerism?", a: "Same molecular formula but different structures" },
      { q: "Define enthalpy", a: "Total heat content; H = U + PV" },
      { q: "What is Gibbs free energy?", a: "G = H - TS; predicts reaction spontaneity (ΔG < 0 spontaneous)" },
      { q: "Solubility product (Ksp)?", a: "Equilibrium constant for dissolution of sparingly soluble salt" },
      { q: "What is osmosis?", a: "Movement of solvent through semi-permeable membrane to higher solute concentration" },
      { q: "Colligative properties?", a: "Properties depending on number of solute particles, not identity (boiling point elevation, etc.)" },
      { q: "Henry's law?", a: "Solubility of gas ∝ partial pressure above liquid" },
      { q: "Raoult's law?", a: "Vapor pressure of solution = mole fraction of solvent × vapor pressure of pure solvent" },
      { q: "What is corrosion?", a: "Deterioration of metal by chemical/electrochemical reaction with environment" },
    ];
    for (let i = 0; i < 250; i++) out.push({ ...pick(cQs), topic: pick(["Atoms","Bonding","Reactions","Thermochemistry","Equilibrium","Organic","Acids & Bases","Electrochemistry"]) });
    return out;
  };
  const chemQs = chemGen();

  // ── BIOLOGY ──
  const bioGen = () => {
    const out = [];
    const qs = [
      { q: "What is the basic unit of life?", a: "The cell.", topic: "Cell Biology" },
      { q: "Who proposed the cell theory?", a: "Schleiden and Schwann (1838-1839)", topic: "Cell Biology" },
      { q: "Function of mitochondria?", a: "Cellular respiration / ATP production (powerhouse of the cell)", topic: "Cell Biology" },
      { q: "Function of chloroplasts?", a: "Photosynthesis in plant cells", topic: "Cell Biology" },
      { q: "Function of ribosomes?", a: "Protein synthesis", topic: "Cell Biology" },
      { q: "Function of nucleus?", a: "Contains genetic material; controls cell activities", topic: "Cell Biology" },
      { q: "Function of cell membrane?", a: "Regulates passage of substances in and out of cell", topic: "Cell Biology" },
      { q: "Function of cell wall?", a: "Provides structure and protection in plant/bacterial cells", topic: "Cell Biology" },
      { q: "Function of Golgi apparatus?", a: "Modifies, sorts, and packages proteins", topic: "Cell Biology" },
      { q: "Function of endoplasmic reticulum?", a: "Synthesizes proteins (rough ER) and lipids (smooth ER)", topic: "Cell Biology" },
      { q: "Function of lysosomes?", a: "Digest waste materials and cellular debris", topic: "Cell Biology" },
      { q: "Function of vacuole?", a: "Stores water, nutrients, and waste; maintains turgor pressure", topic: "Cell Biology" },
      { q: "Difference between prokaryotic and eukaryotic cells?", a: "Eukaryotic cells have membrane-bound nucleus and organelles; prokaryotic cells don't", topic: "Cell Biology" },
      { q: "What is DNA?", a: "Deoxyribonucleic acid; genetic material in most organisms", topic: "Genetics" },
      { q: "What is RNA?", a: "Ribonucleic acid; involved in protein synthesis", topic: "Genetics" },
      { q: "Who discovered DNA structure?", a: "Watson and Crick (1953)", topic: "Genetics" },
      { q: "Shape of DNA?", a: "Double helix", topic: "Genetics" },
      { q: "What are nucleotides?", a: "Building blocks of DNA/RNA: sugar + phosphate + nitrogenous base", topic: "Genetics" },
      { q: "Name the four DNA bases", a: "Adenine, Thymine, Guanine, Cytosine (A, T, G, C)", topic: "Genetics" },
      { q: "Which base replaces thymine in RNA?", a: "Uracil (U)", topic: "Genetics" },
      { q: "What is a gene?", a: "Segment of DNA coding for a specific protein/trait", topic: "Genetics" },
      { q: "What is a chromosome?", a: "Thread-like DNA structure carrying genetic information", topic: "Genetics" },
      { q: "How many chromosomes in human cells?", a: "46 (23 pairs)", topic: "Genetics" },
      { q: "What is mitosis?", a: "Cell division producing two genetically identical daughter cells", topic: "Cell Division" },
      { q: "What is meiosis?", a: "Cell division producing four genetically diverse gametes with half chromosomes", topic: "Cell Division" },
      { q: "Phases of mitosis?", a: "Prophase, Metaphase, Anaphase, Telophase (PMAT)", topic: "Cell Division" },
      { q: "What is photosynthesis?", a: "Process by which plants convert light energy to chemical energy (glucose)", topic: "Photosynthesis" },
      { q: "Photosynthesis equation?", a: "6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂", topic: "Photosynthesis" },
      { q: "Where does photosynthesis occur?", a: "Chloroplasts (specifically thylakoids and stroma)", topic: "Photosynthesis" },
      { q: "What is cellular respiration?", a: "Process of breaking down glucose to produce ATP", topic: "Respiration" },
      { q: "Cellular respiration equation?", a: "C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP", topic: "Respiration" },
      { q: "Stages of aerobic respiration?", a: "Glycolysis, Krebs cycle, electron transport chain", topic: "Respiration" },
      { q: "What is ATP?", a: "Adenosine triphosphate; cell's energy currency", topic: "Respiration" },
      { q: "What is enzyme?", a: "Biological catalyst (protein) that speeds up reactions", topic: "Biochemistry" },
      { q: "What is denaturation?", a: "Loss of enzyme's 3D shape, usually by heat/pH, causing it to stop working", topic: "Biochemistry" },
      { q: "What is homeostasis?", a: "Maintenance of stable internal conditions", topic: "Physiology" },
      { q: "Function of red blood cells?", a: "Transport oxygen using hemoglobin", topic: "Physiology" },
      { q: "Function of white blood cells?", a: "Immune defense against pathogens", topic: "Physiology" },
      { q: "Function of platelets?", a: "Blood clotting", topic: "Physiology" },
      { q: "Components of blood?", a: "Plasma, RBCs, WBCs, platelets", topic: "Physiology" },
      { q: "Path of blood through the heart?", a: "Right atrium → right ventricle → lungs → left atrium → left ventricle → body", topic: "Physiology" },
      { q: "What is the largest organ?", a: "Skin", topic: "Physiology" },
      { q: "How many bones in adult human body?", a: "206", topic: "Anatomy" },
      { q: "Longest bone in human body?", a: "Femur (thigh bone)", topic: "Anatomy" },
      { q: "Smallest bone in human body?", a: "Stapes (in ear)", topic: "Anatomy" },
      { q: "What is the function of kidneys?", a: "Filter blood, remove waste, regulate fluids", topic: "Physiology" },
      { q: "What is the function of liver?", a: "Detoxification, bile production, metabolism, protein synthesis", topic: "Physiology" },
      { q: "What is the function of pancreas?", a: "Produces insulin/glucagon and digestive enzymes", topic: "Physiology" },
      { q: "What is insulin?", a: "Hormone that lowers blood glucose", topic: "Endocrine" },
      { q: "What causes diabetes?", a: "Insufficient insulin production or insulin resistance", topic: "Endocrine" },
      { q: "What is the central nervous system?", a: "Brain and spinal cord", topic: "Nervous System" },
      { q: "What is a neuron?", a: "Nerve cell that transmits electrical signals", topic: "Nervous System" },
      { q: "Parts of a neuron?", a: "Dendrites, cell body (soma), axon, axon terminals", topic: "Nervous System" },
      { q: "What is a synapse?", a: "Junction between two neurons", topic: "Nervous System" },
      { q: "What is a neurotransmitter?", a: "Chemical that transmits signals across synapses", topic: "Nervous System" },
      { q: "Parts of the brain?", a: "Cerebrum, cerebellum, brainstem, diencephalon", topic: "Nervous System" },
      { q: "Function of cerebrum?", a: "Higher functions: thinking, perception, voluntary movement", topic: "Nervous System" },
      { q: "Function of cerebellum?", a: "Balance, coordination, fine motor control", topic: "Nervous System" },
      { q: "What is evolution?", a: "Change in heritable traits of populations over generations", topic: "Evolution" },
      { q: "Who proposed natural selection?", a: "Charles Darwin", topic: "Evolution" },
      { q: "What is natural selection?", a: "Differential survival/reproduction of individuals based on traits", topic: "Evolution" },
      { q: "What is adaptation?", a: "Inherited trait increasing fitness in environment", topic: "Evolution" },
      { q: "What is a species?", a: "Group of organisms that can interbreed and produce fertile offspring", topic: "Evolution" },
      { q: "What is biodiversity?", a: "Variety of life at genetic, species, and ecosystem levels", topic: "Ecology" },
      { q: "What is an ecosystem?", a: "Community of organisms interacting with their physical environment", topic: "Ecology" },
      { q: "What is a food chain?", a: "Linear sequence showing energy flow from producer to consumers", topic: "Ecology" },
      { q: "What is a food web?", a: "Network of interconnected food chains", topic: "Ecology" },
      { q: "What are producers?", a: "Autotrophs (e.g., plants) that produce their own food via photosynthesis", topic: "Ecology" },
      { q: "What are consumers?", a: "Heterotrophs that feed on other organisms", topic: "Ecology" },
      { q: "What are decomposers?", a: "Organisms breaking down dead matter (bacteria, fungi)", topic: "Ecology" },
      { q: "What is carbon cycle?", a: "Movement of carbon between atmosphere, organisms, oceans, and rocks", topic: "Ecology" },
      { q: "What is nitrogen cycle?", a: "Conversion of nitrogen between atmospheric and biological forms", topic: "Ecology" },
      { q: "What is water cycle?", a: "Evaporation, condensation, precipitation, runoff", topic: "Ecology" },
      { q: "Why is biodiversity important?", a: "Ecosystem stability, services, medicine, food security", topic: "Ecology" },
      { q: "What is a virus?", a: "Non-cellular infectious agent; needs host to reproduce", topic: "Microbiology" },
      { q: "What is bacteria?", a: "Single-celled prokaryotic microorganisms", topic: "Microbiology" },
      { q: "What are antibiotics?", a: "Drugs that kill or inhibit bacteria", topic: "Microbiology" },
      { q: "Difference between virus and bacterium?", a: "Bacteria are living cells; viruses are non-cellular and need host", topic: "Microbiology" },
      { q: "What is immunity?", a: "Body's ability to resist pathogens", topic: "Immunity" },
      { q: "What is a vaccine?", a: "Substance triggering immune response to provide immunity", topic: "Immunity" },
      { q: "What are antibodies?", a: "Proteins produced by B-cells that target specific antigens", topic: "Immunity" },
      { q: "What is the immune system?", a: "Body's defense against pathogens involving WBCs, antibodies, lymph nodes", topic: "Immunity" },
      { q: "What is reproduction?", a: "Production of offspring", topic: "Reproduction" },
      { q: "Sexual vs asexual reproduction?", a: "Sexual: two parents, genetic diversity. Asexual: one parent, identical clones", topic: "Reproduction" },
      { q: "What is a gamete?", a: "Reproductive cell (sperm or egg) with half chromosomes", topic: "Reproduction" },
      { q: "What is fertilization?", a: "Fusion of male and female gametes", topic: "Reproduction" },
      { q: "What is a zygote?", a: "Cell formed when gametes fuse during fertilization", topic: "Reproduction" },
      { q: "What is an embryo?", a: "Early stage of development after fertilization", topic: "Reproduction" },
      { q: "What is photoperiodism?", a: "Plant response to length of day/night", topic: "Plant Biology" },
      { q: "What is transpiration?", a: "Loss of water vapor from plant leaves", topic: "Plant Biology" },
      { q: "What is xylem?", a: "Plant tissue conducting water from roots to leaves", topic: "Plant Biology" },
      { q: "What is phloem?", a: "Plant tissue conducting food (sugars) throughout plant", topic: "Plant Biology" },
      { q: "What is stomata?", a: "Pores in leaves for gas exchange", topic: "Plant Biology" },
      { q: "What is pollination?", a: "Transfer of pollen from anther to stigma", topic: "Plant Biology" },
      { q: "What is germination?", a: "Process where seed develops into plant", topic: "Plant Biology" },
      { q: "What is a hormone?", a: "Chemical messenger produced by glands", topic: "Endocrine" },
      { q: "What is adrenaline?", a: "Hormone for fight-or-flight response", topic: "Endocrine" },
      { q: "What is thyroxine?", a: "Thyroid hormone regulating metabolism", topic: "Endocrine" },
      { q: "What is growth hormone?", a: "Hormone from pituitary stimulating growth", topic: "Endocrine" },
      { q: "What is osmosis (biology)?", a: "Movement of water across semipermeable membrane to higher solute concentration", topic: "Cell Transport" },
      { q: "What is diffusion?", a: "Passive movement from high to low concentration", topic: "Cell Transport" },
      { q: "What is active transport?", a: "Movement against gradient using ATP", topic: "Cell Transport" },
      { q: "What is a tissue?", a: "Group of similar cells performing a function", topic: "Levels of Organization" },
      { q: "What is an organ?", a: "Group of tissues performing a specific function", topic: "Levels of Organization" },
      { q: "What is an organ system?", a: "Group of organs working together", topic: "Levels of Organization" },
      { q: "How many organ systems in humans?", a: "11 (skeletal, muscular, circulatory, respiratory, digestive, nervous, endocrine, excretory, integumentary, reproductive, lymphatic)", topic: "Levels of Organization" },
      { q: "What is Mendel's law of segregation?", a: "Allele pairs separate during gamete formation", topic: "Genetics" },
      { q: "What is Mendel's law of independent assortment?", a: "Alleles for different traits sort independently", topic: "Genetics" },
      { q: "What is genotype?", a: "Genetic makeup of organism", topic: "Genetics" },
      { q: "What is phenotype?", a: "Observable physical/biochemical traits", topic: "Genetics" },
      { q: "What is a dominant allele?", a: "Allele expressed in heterozygous state", topic: "Genetics" },
      { q: "What is a recessive allele?", a: "Allele expressed only in homozygous state", topic: "Genetics" },
      { q: "What is heterozygous?", a: "Having two different alleles for a gene", topic: "Genetics" },
      { q: "What is homozygous?", a: "Having two identical alleles for a gene", topic: "Genetics" },
      { q: "What is a mutation?", a: "Change in DNA sequence", topic: "Genetics" },
      { q: "What is transcription?", a: "Synthesis of mRNA from DNA template", topic: "Molecular Biology" },
      { q: "What is translation?", a: "Synthesis of protein from mRNA", topic: "Molecular Biology" },
      { q: "What is a codon?", a: "Three-nucleotide sequence coding for an amino acid", topic: "Molecular Biology" },
      { q: "How many amino acids exist?", a: "20 standard amino acids", topic: "Biochemistry" },
      { q: "What is a protein?", a: "Polymer of amino acids; performs many cellular functions", topic: "Biochemistry" },
      { q: "Four levels of protein structure?", a: "Primary, secondary, tertiary, quaternary", topic: "Biochemistry" },
      { q: "What is a carbohydrate?", a: "Sugar/starch molecule; primary energy source", topic: "Biochemistry" },
      { q: "What is a lipid?", a: "Fats and oils; energy storage and membrane component", topic: "Biochemistry" },
      { q: "What is a nucleic acid?", a: "DNA or RNA; stores/transmits genetic info", topic: "Biochemistry" },
      { q: "What are vitamins?", a: "Organic compounds needed in small amounts for body functions", topic: "Nutrition" },
      { q: "What are minerals?", a: "Inorganic elements needed for body functions", topic: "Nutrition" },
    ];
    for (let i = 0; i < 800; i++) out.push(pick(qs));
    return out;
  };
  const bioQs = bioGen();

  // ── COMPUTER SCIENCE ──
  const csGen = () => {
    const out = [];
    const qs = [
      { q: "What is a variable?", a: "Named storage location holding a value", topic: "Programming Basics" },
      { q: "What is a data type?", a: "Classification of data (int, string, bool, etc.)", topic: "Programming Basics" },
      { q: "Difference between int and float?", a: "int = whole numbers; float = decimals", topic: "Programming Basics" },
      { q: "What is a string?", a: "Sequence of characters", topic: "Programming Basics" },
      { q: "What is a boolean?", a: "True or False value", topic: "Programming Basics" },
      { q: "What is an array?", a: "Ordered collection of elements with same type", topic: "Data Structures" },
      { q: "What is a list?", a: "Ordered, mutable sequence (in Python: any type)", topic: "Data Structures" },
      { q: "What is a tuple?", a: "Ordered, immutable sequence", topic: "Data Structures" },
      { q: "What is a dictionary?", a: "Key-value pairs collection", topic: "Data Structures" },
      { q: "What is a set?", a: "Unordered collection of unique elements", topic: "Data Structures" },
      { q: "What is a stack?", a: "LIFO data structure (Last In, First Out)", topic: "Data Structures" },
      { q: "What is a queue?", a: "FIFO data structure (First In, First Out)", topic: "Data Structures" },
      { q: "What is a linked list?", a: "Linear data structure with nodes containing data and pointer to next node", topic: "Data Structures" },
      { q: "What is a binary tree?", a: "Tree data structure where each node has at most 2 children", topic: "Data Structures" },
      { q: "What is a graph?", a: "Collection of vertices connected by edges", topic: "Data Structures" },
      { q: "What is a hash table?", a: "Data structure mapping keys to values using a hash function", topic: "Data Structures" },
      { q: "Time complexity of array access?", a: "O(1)", topic: "Algorithms" },
      { q: "Time complexity of linear search?", a: "O(n)", topic: "Algorithms" },
      { q: "Time complexity of binary search?", a: "O(log n)", topic: "Algorithms" },
      { q: "Time complexity of bubble sort?", a: "O(n²) worst case", topic: "Algorithms" },
      { q: "Time complexity of merge sort?", a: "O(n log n)", topic: "Algorithms" },
      { q: "Time complexity of quicksort?", a: "O(n log n) average, O(n²) worst", topic: "Algorithms" },
      { q: "What is recursion?", a: "Function calling itself", topic: "Algorithms" },
      { q: "What is iteration?", a: "Repeated execution using loops", topic: "Algorithms" },
      { q: "What is Big O notation?", a: "Notation for algorithm complexity in worst case", topic: "Algorithms" },
      { q: "What is a loop?", a: "Repeated execution of code block", topic: "Programming Basics" },
      { q: "Difference between for and while?", a: "for: iterate over sequence/known count; while: until condition is false", topic: "Programming Basics" },
      { q: "What is a function?", a: "Reusable block of code performing a specific task", topic: "Programming Basics" },
      { q: "What is a parameter?", a: "Variable in function definition", topic: "Programming Basics" },
      { q: "What is an argument?", a: "Value passed to function during call", topic: "Programming Basics" },
      { q: "What is OOP?", a: "Object-Oriented Programming; paradigm using objects and classes", topic: "OOP" },
      { q: "What is a class?", a: "Blueprint for creating objects", topic: "OOP" },
      { q: "What is an object?", a: "Instance of a class", topic: "OOP" },
      { q: "What is inheritance?", a: "Class deriving properties from parent class", topic: "OOP" },
      { q: "What is encapsulation?", a: "Hiding internal state, exposing methods (data hiding)", topic: "OOP" },
      { q: "What is polymorphism?", a: "Same interface, different forms (overloading/overriding)", topic: "OOP" },
      { q: "What is abstraction?", a: "Hiding complexity, exposing essentials", topic: "OOP" },
      { q: "What is a constructor?", a: "Special method called when object created", topic: "OOP" },
      { q: "What is a method?", a: "Function defined within a class", topic: "OOP" },
      { q: "What is HTTP?", a: "HyperText Transfer Protocol for web communication", topic: "Networking" },
      { q: "What is HTTPS?", a: "Secure HTTP using TLS/SSL encryption", topic: "Networking" },
      { q: "What is TCP?", a: "Transmission Control Protocol; connection-oriented, reliable", topic: "Networking" },
      { q: "What is UDP?", a: "User Datagram Protocol; connectionless, fast", topic: "Networking" },
      { q: "What is IP?", a: "Internet Protocol; addressing and routing of packets", topic: "Networking" },
      { q: "What is DNS?", a: "Domain Name System; translates domain names to IP addresses", topic: "Networking" },
      { q: "What is an API?", a: "Application Programming Interface; allows software to communicate", topic: "Software" },
      { q: "What is REST?", a: "Representational State Transfer; architectural style for APIs", topic: "Software" },
      { q: "What is JSON?", a: "JavaScript Object Notation; lightweight data format", topic: "Software" },
      { q: "What is XML?", a: "eXtensible Markup Language; markup format for data", topic: "Software" },
      { q: "What is SQL?", a: "Structured Query Language for relational databases", topic: "Databases" },
      { q: "What is a primary key?", a: "Unique identifier for a record in database", topic: "Databases" },
      { q: "What is a foreign key?", a: "Field referencing primary key of another table", topic: "Databases" },
      { q: "Difference SQL and NoSQL?", a: "SQL: relational, structured. NoSQL: non-relational, flexible", topic: "Databases" },
      { q: "What is normalization?", a: "Organizing database to reduce redundancy", topic: "Databases" },
      { q: "What is an index?", a: "Data structure improving query speed in database", topic: "Databases" },
      { q: "What is binary?", a: "Base-2 number system using 0 and 1", topic: "Computer Basics" },
      { q: "Convert 10 (binary) to decimal", a: "2", topic: "Computer Basics" },
      { q: "Convert 1101 to decimal", a: "13 (8+4+0+1)", topic: "Computer Basics" },
      { q: "Convert 25 to binary", a: "11001", topic: "Computer Basics" },
      { q: "How many bits in a byte?", a: "8", topic: "Computer Basics" },
      { q: "What is RAM?", a: "Random Access Memory; volatile working memory", topic: "Computer Basics" },
      { q: "What is ROM?", a: "Read-Only Memory; non-volatile permanent memory", topic: "Computer Basics" },
      { q: "What is a CPU?", a: "Central Processing Unit; executes instructions", topic: "Computer Basics" },
      { q: "What is an OS?", a: "Operating System; manages hardware and software", topic: "Operating Systems" },
      { q: "Examples of OS?", a: "Windows, macOS, Linux, Android, iOS", topic: "Operating Systems" },
      { q: "What is a process?", a: "Instance of executing program", topic: "Operating Systems" },
      { q: "What is a thread?", a: "Lightweight unit of execution within a process", topic: "Operating Systems" },
      { q: "What is multitasking?", a: "Running multiple processes concurrently", topic: "Operating Systems" },
      { q: "What is deadlock?", a: "Two processes waiting on each other; neither proceeds", topic: "Operating Systems" },
      { q: "What is virtual memory?", a: "Memory abstraction using disk to extend RAM", topic: "Operating Systems" },
      { q: "What is HTML?", a: "HyperText Markup Language for web pages", topic: "Web" },
      { q: "What is CSS?", a: "Cascading Style Sheets for styling HTML", topic: "Web" },
      { q: "What is JavaScript?", a: "Programming language for web interactivity", topic: "Web" },
      { q: "Difference let, var, const?", a: "var: function-scoped; let: block-scoped; const: block-scoped immutable", topic: "JavaScript" },
      { q: "What is the DOM?", a: "Document Object Model; tree representation of HTML", topic: "Web" },
      { q: "What is encryption?", a: "Converting data to unreadable form using a key", topic: "Security" },
      { q: "Symmetric vs asymmetric encryption?", a: "Symmetric: same key. Asymmetric: public/private key pair", topic: "Security" },
      { q: "What is a firewall?", a: "Network security system controlling traffic", topic: "Security" },
      { q: "What is malware?", a: "Malicious software (viruses, trojans, ransomware)", topic: "Security" },
      { q: "What is a virus (CS)?", a: "Self-replicating malicious program", topic: "Security" },
      { q: "What is a trojan?", a: "Malware disguised as legitimate software", topic: "Security" },
      { q: "What is phishing?", a: "Deceptive attempt to steal sensitive info", topic: "Security" },
      { q: "What is two-factor authentication?", a: "Authentication using two different verification methods", topic: "Security" },
      { q: "What is machine learning?", a: "AI subset where computers learn from data", topic: "AI" },
      { q: "Supervised vs unsupervised learning?", a: "Supervised uses labeled data; unsupervised finds patterns in unlabeled", topic: "AI" },
      { q: "What is a neural network?", a: "Computing system inspired by biological brains", topic: "AI" },
      { q: "What is deep learning?", a: "ML using multi-layered neural networks", topic: "AI" },
      { q: "What is overfitting?", a: "Model fits training data too well, fails on new data", topic: "AI" },
      { q: "What is Git?", a: "Distributed version control system", topic: "Tools" },
      { q: "Git command to clone repo?", a: "git clone <url>", topic: "Tools" },
      { q: "Git command to commit?", a: "git commit -m 'message'", topic: "Tools" },
      { q: "Git command to push?", a: "git push", topic: "Tools" },
      { q: "What is a branch in Git?", a: "Independent line of development", topic: "Tools" },
      { q: "What is a compiler?", a: "Translates source code to machine code before execution", topic: "Compilers" },
      { q: "What is an interpreter?", a: "Executes source code line by line", topic: "Compilers" },
      { q: "Compiled vs interpreted language examples?", a: "Compiled: C, C++, Rust. Interpreted: Python, JavaScript, Ruby", topic: "Compilers" },
      { q: "What is debugging?", a: "Finding and fixing bugs in code", topic: "Software" },
      { q: "What is unit testing?", a: "Testing individual code units in isolation", topic: "Software" },
    ];
    for (let i = 0; i < 800; i++) out.push(pick(qs));
    return out;
  };
  const csQs = csGen();

  // ── ENGLISH ──
  const engGen = () => {
    const out = [];
    const qs = [
      { q: "What is a noun?", a: "Word naming a person, place, thing, or idea", topic: "Grammar" },
      { q: "What is a verb?", a: "Word expressing action or state", topic: "Grammar" },
      { q: "What is an adjective?", a: "Word describing/modifying a noun", topic: "Grammar" },
      { q: "What is an adverb?", a: "Word modifying verb, adjective, or other adverb", topic: "Grammar" },
      { q: "What is a pronoun?", a: "Word replacing a noun (he, she, it, they)", topic: "Grammar" },
      { q: "What is a preposition?", a: "Word showing relationship (in, on, at, by, with)", topic: "Grammar" },
      { q: "What is a conjunction?", a: "Word connecting clauses or words (and, but, or)", topic: "Grammar" },
      { q: "What is an interjection?", a: "Exclamation expressing emotion (Wow! Oh!)", topic: "Grammar" },
      { q: "What is a sentence?", a: "Group of words expressing complete thought", topic: "Grammar" },
      { q: "What is a clause?", a: "Group of words with subject and verb", topic: "Grammar" },
      { q: "What is a phrase?", a: "Group of words acting as single unit, no subject-verb", topic: "Grammar" },
      { q: "Subject vs predicate?", a: "Subject: who/what; Predicate: what subject does", topic: "Grammar" },
      { q: "Active vs passive voice?", a: "Active: subject performs action. Passive: subject receives action", topic: "Grammar" },
      { q: "Direct vs indirect speech?", a: "Direct: exact words. Indirect: reported words", topic: "Grammar" },
      { q: "What is a metaphor?", a: "Direct comparison without 'like/as'", topic: "Literature" },
      { q: "What is a simile?", a: "Comparison using 'like' or 'as'", topic: "Literature" },
      { q: "What is personification?", a: "Giving human qualities to non-human things", topic: "Literature" },
      { q: "What is alliteration?", a: "Repetition of initial consonant sounds", topic: "Literature" },
      { q: "What is onomatopoeia?", a: "Words imitating sounds (buzz, hiss)", topic: "Literature" },
      { q: "What is hyperbole?", a: "Deliberate exaggeration for effect", topic: "Literature" },
      { q: "What is irony?", a: "Difference between expected and actual outcome", topic: "Literature" },
      { q: "Types of irony?", a: "Verbal, situational, dramatic", topic: "Literature" },
      { q: "What is symbolism?", a: "Using objects/elements to represent ideas", topic: "Literature" },
      { q: "What is foreshadowing?", a: "Hints at future events in narrative", topic: "Literature" },
      { q: "What is a soliloquy?", a: "Character speaking thoughts aloud, often alone", topic: "Literature" },
      { q: "What is iambic pentameter?", a: "Verse line with 5 iambs (unstressed-stressed pairs)", topic: "Poetry" },
      { q: "What is a sonnet?", a: "14-line poem in iambic pentameter", topic: "Poetry" },
      { q: "Shakespearean sonnet structure?", a: "3 quatrains + couplet (ABAB CDCD EFEF GG)", topic: "Poetry" },
      { q: "Petrarchan sonnet structure?", a: "Octave (ABBAABBA) + sestet (CDCDCD or CDECDE)", topic: "Poetry" },
      { q: "What is rhyme scheme?", a: "Pattern of rhymes at line ends", topic: "Poetry" },
      { q: "What is a stanza?", a: "Grouped lines in poem, like paragraph", topic: "Poetry" },
      { q: "What is free verse?", a: "Poetry without regular rhyme or meter", topic: "Poetry" },
      { q: "What is haiku?", a: "Japanese poem: 5-7-5 syllable structure", topic: "Poetry" },
      { q: "What is protagonist?", a: "Main character driving the story", topic: "Literature" },
      { q: "What is antagonist?", a: "Character opposing protagonist", topic: "Literature" },
      { q: "What is plot?", a: "Sequence of events in a story", topic: "Literature" },
      { q: "Five elements of plot?", a: "Exposition, rising action, climax, falling action, resolution", topic: "Literature" },
      { q: "What is theme?", a: "Central idea/message of a literary work", topic: "Literature" },
      { q: "What is setting?", a: "Time and place of story", topic: "Literature" },
      { q: "What is point of view?", a: "Perspective from which story told", topic: "Literature" },
      { q: "First vs third person?", a: "First: I/we (narrator inside). Third: he/she/they (narrator outside)", topic: "Literature" },
      { q: "What is tone?", a: "Author's attitude toward subject", topic: "Literature" },
      { q: "What is mood?", a: "Emotional atmosphere created in reader", topic: "Literature" },
      { q: "What is characterization?", a: "Methods author uses to develop characters", topic: "Literature" },
      { q: "Dynamic vs static character?", a: "Dynamic: changes during story. Static: remains same", topic: "Literature" },
      { q: "Round vs flat character?", a: "Round: complex/multi-dimensional. Flat: one-dimensional", topic: "Literature" },
      { q: "What is a tragedy?", a: "Drama with serious theme, often hero's downfall", topic: "Drama" },
      { q: "What is comedy?", a: "Drama with humorous, often happy ending", topic: "Drama" },
      { q: "Who wrote Hamlet?", a: "William Shakespeare", topic: "Authors" },
      { q: "Who wrote Pride and Prejudice?", a: "Jane Austen", topic: "Authors" },
      { q: "Who wrote 1984?", a: "George Orwell", topic: "Authors" },
      { q: "Who wrote To Kill a Mockingbird?", a: "Harper Lee", topic: "Authors" },
      { q: "Who wrote The Great Gatsby?", a: "F. Scott Fitzgerald", topic: "Authors" },
      { q: "Who wrote Macbeth?", a: "William Shakespeare", topic: "Authors" },
      { q: "Who wrote War and Peace?", a: "Leo Tolstoy", topic: "Authors" },
      { q: "Who wrote Crime and Punishment?", a: "Fyodor Dostoevsky", topic: "Authors" },
      { q: "Who wrote Oliver Twist?", a: "Charles Dickens", topic: "Authors" },
      { q: "Who wrote The Old Man and the Sea?", a: "Ernest Hemingway", topic: "Authors" },
      { q: "Antonym of 'arduous'?", a: "Easy, effortless", topic: "Vocabulary" },
      { q: "Synonym of 'benevolent'?", a: "Kind, generous", topic: "Vocabulary" },
      { q: "Antonym of 'candid'?", a: "Secretive, evasive", topic: "Vocabulary" },
      { q: "Synonym of 'diligent'?", a: "Industrious, hardworking", topic: "Vocabulary" },
      { q: "Antonym of 'exorbitant'?", a: "Reasonable, modest", topic: "Vocabulary" },
      { q: "Synonym of 'frugal'?", a: "Thrifty, economical", topic: "Vocabulary" },
      { q: "Antonym of 'gregarious'?", a: "Solitary, introverted", topic: "Vocabulary" },
      { q: "Synonym of 'haughty'?", a: "Arrogant, conceited", topic: "Vocabulary" },
      { q: "Antonym of 'indignant'?", a: "Calm, content", topic: "Vocabulary" },
      { q: "Synonym of 'jovial'?", a: "Cheerful, merry", topic: "Vocabulary" },
      { q: "What is a prefix?", a: "Letters added at beginning of word (un-, re-, pre-)", topic: "Word Formation" },
      { q: "What is a suffix?", a: "Letters added at end of word (-ing, -ed, -ly)", topic: "Word Formation" },
      { q: "What is a root word?", a: "Base form to which prefixes/suffixes attach", topic: "Word Formation" },
      { q: "What is paraphrasing?", a: "Restating text in own words", topic: "Writing" },
      { q: "What is a thesis statement?", a: "Main argument/point of an essay", topic: "Writing" },
      { q: "Parts of an essay?", a: "Introduction, body paragraphs, conclusion", topic: "Writing" },
      { q: "What is a topic sentence?", a: "Main idea of a paragraph", topic: "Writing" },
      { q: "Formal vs informal language?", a: "Formal: professional. Informal: casual, contractions", topic: "Writing" },
      { q: "What is a comma splice?", a: "Joining independent clauses with only a comma (error)", topic: "Grammar" },
      { q: "What is a run-on sentence?", a: "Two clauses joined incorrectly", topic: "Grammar" },
      { q: "Use of semicolon?", a: "Join related independent clauses; separate list items with commas", topic: "Punctuation" },
      { q: "Use of colon?", a: "Introduce a list, explanation, or quote", topic: "Punctuation" },
      { q: "Use of dash?", a: "Indicate emphasis or interruption", topic: "Punctuation" },
      { q: "What is the Oxford comma?", a: "Comma before final 'and/or' in a list", topic: "Punctuation" },
      { q: "What is a homophone?", a: "Words with same sound, different meaning (their/there/they're)", topic: "Vocabulary" },
      { q: "What is an idiom?", a: "Expression with figurative meaning (raining cats and dogs)", topic: "Vocabulary" },
      { q: "What is a euphemism?", a: "Mild substitute for harsh word ('passed away' for 'died')", topic: "Vocabulary" },
      { q: "What is allusion?", a: "Reference to historical/literary figure or event", topic: "Literature" },
      { q: "What is oxymoron?", a: "Two contradictory terms together (jumbo shrimp)", topic: "Literature" },
      { q: "What is paradox?", a: "Statement seeming contradictory but containing truth", topic: "Literature" },
      { q: "What is satire?", a: "Use of humor/irony to criticize", topic: "Literature" },
      { q: "What is a motif?", a: "Recurring element in literature with symbolic meaning", topic: "Literature" },
      { q: "What is genre?", a: "Category of literature (fiction, mystery, poetry)", topic: "Literature" },
      { q: "What is fiction?", a: "Imaginative literature, not factual", topic: "Literature" },
      { q: "What is non-fiction?", a: "Factual writing (essays, biographies)", topic: "Literature" },
      { q: "What is biography?", a: "Account of someone's life written by another", topic: "Literature" },
      { q: "What is autobiography?", a: "Account of one's own life", topic: "Literature" },
      { q: "What is a memoir?", a: "Personal account of specific events/period", topic: "Literature" },
      { q: "What is journalism?", a: "Practice of reporting news", topic: "Writing" },
      { q: "Past tense of 'go'?", a: "went", topic: "Grammar" },
      { q: "Past tense of 'eat'?", a: "ate", topic: "Grammar" },
      { q: "Past tense of 'see'?", a: "saw", topic: "Grammar" },
      { q: "Past participle of 'write'?", a: "written", topic: "Grammar" },
      { q: "Past participle of 'speak'?", a: "spoken", topic: "Grammar" },
      { q: "Plural of 'child'?", a: "children", topic: "Grammar" },
      { q: "Plural of 'mouse'?", a: "mice", topic: "Grammar" },
      { q: "Plural of 'foot'?", a: "feet", topic: "Grammar" },
      { q: "Plural of 'criterion'?", a: "criteria", topic: "Grammar" },
    ];
    for (let i = 0; i < 800; i++) out.push(pick(qs));
    return out;
  };
  const engQs = engGen();

  // ── HISTORY ──
  const histGen = () => {
    const out = [];
    const qs = [
      { q: "When did World War I begin?", a: "1914 (ended 1918)", topic: "World War I" },
      { q: "When did World War II begin?", a: "1939 (ended 1945)", topic: "World War II" },
      { q: "Trigger of WWI?", a: "Assassination of Archduke Franz Ferdinand", topic: "World War I" },
      { q: "Treaty ending WWI?", a: "Treaty of Versailles (1919)", topic: "World War I" },
      { q: "Allied Powers in WWII?", a: "USA, UK, USSR, France, China (and others)", topic: "World War II" },
      { q: "Axis Powers in WWII?", a: "Germany, Italy, Japan", topic: "World War II" },
      { q: "D-Day?", a: "June 6, 1944 — Allied invasion of Normandy", topic: "World War II" },
      { q: "Pearl Harbor attack year?", a: "1941 (December 7)", topic: "World War II" },
      { q: "Atomic bombs dropped on which cities?", a: "Hiroshima and Nagasaki (1945)", topic: "World War II" },
      { q: "Hitler's political party?", a: "Nazi Party (NSDAP)", topic: "World War II" },
      { q: "What was the Holocaust?", a: "Systematic genocide of 6 million Jews by Nazis", topic: "World War II" },
      { q: "Cold War period?", a: "Approximately 1947-1991", topic: "Cold War" },
      { q: "Berlin Wall built and fell when?", a: "Built 1961, fell 1989", topic: "Cold War" },
      { q: "Cuban Missile Crisis year?", a: "1962", topic: "Cold War" },
      { q: "USSR dissolved in?", a: "1991", topic: "Cold War" },
      { q: "Vietnam War period?", a: "1955-1975", topic: "20th Century" },
      { q: "Korean War period?", a: "1950-1953", topic: "20th Century" },
      { q: "American Revolution period?", a: "1775-1783", topic: "American History" },
      { q: "Declaration of Independence year?", a: "1776 (July 4)", topic: "American History" },
      { q: "American Civil War period?", a: "1861-1865", topic: "American History" },
      { q: "Who was the first US President?", a: "George Washington", topic: "American History" },
      { q: "Who wrote the Declaration of Independence?", a: "Primarily Thomas Jefferson", topic: "American History" },
      { q: "Who was Abraham Lincoln?", a: "16th US President; led Union in Civil War; abolished slavery", topic: "American History" },
      { q: "Emancipation Proclamation year?", a: "1863", topic: "American History" },
      { q: "13th Amendment did what?", a: "Abolished slavery (1865)", topic: "American History" },
      { q: "19th Amendment did what?", a: "Gave women the right to vote (1920)", topic: "American History" },
      { q: "French Revolution period?", a: "1789-1799", topic: "European History" },
      { q: "Storming of the Bastille year?", a: "1789 (July 14)", topic: "European History" },
      { q: "Who was Napoleon Bonaparte?", a: "French military leader; Emperor 1804-1814", topic: "European History" },
      { q: "Battle of Waterloo year?", a: "1815", topic: "European History" },
      { q: "Renaissance period?", a: "14th-17th century", topic: "European History" },
      { q: "Reformation started by?", a: "Martin Luther (1517)", topic: "European History" },
      { q: "Industrial Revolution started in?", a: "Britain, late 18th century", topic: "Industrial Revolution" },
      { q: "Who invented the steam engine?", a: "James Watt improved it (Newcomen built earlier)", topic: "Industrial Revolution" },
      { q: "Magna Carta year?", a: "1215", topic: "Medieval History" },
      { q: "What was the Magna Carta?", a: "English charter limiting royal power", topic: "Medieval History" },
      { q: "Roman Empire fell in?", a: "476 CE (Western Roman Empire)", topic: "Ancient History" },
      { q: "Who was Julius Caesar?", a: "Roman general and dictator (100-44 BCE)", topic: "Ancient History" },
      { q: "Who was Alexander the Great?", a: "Macedonian king who conquered vast empire (356-323 BCE)", topic: "Ancient History" },
      { q: "Pyramids of Giza built when?", a: "~2500 BCE", topic: "Ancient History" },
      { q: "Who was Cleopatra?", a: "Last pharaoh of Egypt (69-30 BCE)", topic: "Ancient History" },
      { q: "Ancient Greek philosophers?", a: "Socrates, Plato, Aristotle", topic: "Ancient History" },
      { q: "Founder of Buddhism?", a: "Siddhartha Gautama (Buddha)", topic: "Religious History" },
      { q: "Founder of Islam?", a: "Prophet Muhammad", topic: "Religious History" },
      { q: "Year India gained independence?", a: "1947 (August 15)", topic: "Indian History" },
      { q: "Who led India's freedom movement?", a: "Mahatma Gandhi (and others including Nehru, Bose)", topic: "Indian History" },
      { q: "First Prime Minister of India?", a: "Jawaharlal Nehru", topic: "Indian History" },
      { q: "Indian Constitution adopted?", a: "1950 (January 26)", topic: "Indian History" },
      { q: "Father of Indian Constitution?", a: "Dr. B.R. Ambedkar", topic: "Indian History" },
      { q: "Mughal Empire founded by?", a: "Babur (1526)", topic: "Indian History" },
      { q: "Who built the Taj Mahal?", a: "Shah Jahan (built 1632-1653)", topic: "Indian History" },
      { q: "Battle of Plassey year?", a: "1757", topic: "Indian History" },
      { q: "Year of Indian Rebellion (Sepoy Mutiny)?", a: "1857", topic: "Indian History" },
      { q: "Quit India Movement year?", a: "1942", topic: "Indian History" },
      { q: "Salt March year?", a: "1930", topic: "Indian History" },
      { q: "Russian Revolution year?", a: "1917", topic: "20th Century" },
      { q: "Lenin led which revolution?", a: "Russian Bolshevik Revolution", topic: "20th Century" },
      { q: "Chinese Communist Revolution year?", a: "1949", topic: "20th Century" },
      { q: "Mao Zedong founded?", a: "People's Republic of China", topic: "20th Century" },
      { q: "Apartheid ended in South Africa?", a: "1994", topic: "20th Century" },
      { q: "Nelson Mandela became President of SA?", a: "1994", topic: "20th Century" },
      { q: "Civil Rights Act US year?", a: "1964", topic: "American History" },
      { q: "Martin Luther King's famous speech?", a: "'I Have a Dream' (1963)", topic: "American History" },
      { q: "Year man landed on the Moon?", a: "1969 (July 20)", topic: "20th Century" },
      { q: "First man on the Moon?", a: "Neil Armstrong", topic: "20th Century" },
      { q: "Cold War main rivals?", a: "USA vs USSR", topic: "Cold War" },
      { q: "Marshall Plan?", a: "US aid for European reconstruction after WWII", topic: "Cold War" },
      { q: "United Nations founded?", a: "1945", topic: "International" },
      { q: "League of Nations founded?", a: "1920 (after WWI; predecessor to UN)", topic: "International" },
      { q: "NATO founded?", a: "1949", topic: "International" },
      { q: "European Union founded?", a: "1993 (Maastricht Treaty)", topic: "International" },
      { q: "Brexit referendum year?", a: "2016", topic: "21st Century" },
      { q: "9/11 attacks year?", a: "2001", topic: "21st Century" },
      { q: "Renaissance art figures?", a: "Leonardo da Vinci, Michelangelo, Raphael", topic: "European History" },
      { q: "Christopher Columbus voyage year?", a: "1492", topic: "Age of Exploration" },
      { q: "Vasco da Gama reached India?", a: "1498", topic: "Age of Exploration" },
      { q: "Magellan circumnavigated globe?", a: "1519-1522 (he died en route; crew finished)", topic: "Age of Exploration" },
      { q: "Spanish Inquisition started?", a: "1478", topic: "European History" },
      { q: "Black Death (plague) peak?", a: "1347-1351", topic: "Medieval History" },
      { q: "Hundred Years' War?", a: "1337-1453 (England vs France)", topic: "Medieval History" },
      { q: "Mongol Empire founded by?", a: "Genghis Khan (~1206)", topic: "Medieval History" },
      { q: "Byzantine Empire fell?", a: "1453 (Constantinople fell to Ottomans)", topic: "Medieval History" },
      { q: "Ottoman Empire ended?", a: "1922", topic: "Modern History" },
      { q: "Greek civilization peak?", a: "Classical period, 5th-4th centuries BCE", topic: "Ancient History" },
      { q: "Marathon battle year?", a: "490 BCE", topic: "Ancient History" },
      { q: "Tutankhamun's tomb discovered?", a: "1922 (by Howard Carter)", topic: "Archaeology" },
      { q: "Rosetta Stone discovered?", a: "1799 (by Napoleon's forces)", topic: "Archaeology" },
      { q: "Hieroglyphics deciphered by?", a: "Jean-François Champollion (1822)", topic: "Archaeology" },
      { q: "Code of Hammurabi?", a: "Ancient Babylonian law code (~1754 BCE)", topic: "Ancient History" },
      { q: "Great Wall of China primarily built when?", a: "Ming Dynasty (1368-1644)", topic: "Chinese History" },
      { q: "Silk Road?", a: "Ancient trade network connecting East and West", topic: "Economic History" },
      { q: "Crusades period?", a: "1095-1291", topic: "Medieval History" },
      { q: "Joan of Arc?", a: "French heroine of Hundred Years' War; burned 1431", topic: "Medieval History" },
      { q: "Treaty of Tordesillas year?", a: "1494", topic: "Age of Exploration" },
      { q: "Suez Canal opened?", a: "1869", topic: "Modern History" },
      { q: "Panama Canal opened?", a: "1914", topic: "Modern History" },
      { q: "Wright Brothers first flight?", a: "1903", topic: "Modern History" },
      { q: "Titanic sank?", a: "1912", topic: "Modern History" },
      { q: "Spanish Flu pandemic?", a: "1918-1920", topic: "Modern History" },
      { q: "Great Depression started?", a: "1929", topic: "20th Century" },
      { q: "FDR's New Deal?", a: "1930s programs to combat Great Depression", topic: "20th Century" },
      { q: "League of Indian National Congress founded?", a: "1885", topic: "Indian History" },
      { q: "Bhagat Singh executed?", a: "1931", topic: "Indian History" },
      { q: "Jallianwala Bagh massacre?", a: "1919", topic: "Indian History" },
      { q: "Subhash Chandra Bose founded?", a: "Indian National Army (INA)", topic: "Indian History" },
      { q: "Partition of India?", a: "1947 (India and Pakistan)", topic: "Indian History" },
      { q: "First Indo-Pak war?", a: "1947-48 (Kashmir)", topic: "Indian History" },
      { q: "Bangladesh formed?", a: "1971 (from East Pakistan)", topic: "Indian History" },
      { q: "Indian Emergency period?", a: "1975-1977", topic: "Indian History" },
    ];
    for (let i = 0; i < 800; i++) out.push(pick(qs));
    return out;
  };
  const histQs = histGen();

  // ── GEOGRAPHY ──
  const geoGen = () => {
    const out = [];
    const qs = [
      { q: "Largest continent?", a: "Asia", topic: "Continents" },
      { q: "Smallest continent?", a: "Australia", topic: "Continents" },
      { q: "How many continents?", a: "7", topic: "Continents" },
      { q: "Largest ocean?", a: "Pacific Ocean", topic: "Oceans" },
      { q: "Smallest ocean?", a: "Arctic Ocean", topic: "Oceans" },
      { q: "Five oceans?", a: "Pacific, Atlantic, Indian, Southern, Arctic", topic: "Oceans" },
      { q: "Longest river in the world?", a: "Nile (or Amazon, debated)", topic: "Rivers" },
      { q: "Longest river in Asia?", a: "Yangtze (in China)", topic: "Rivers" },
      { q: "Longest river in Africa?", a: "Nile", topic: "Rivers" },
      { q: "Longest river in South America?", a: "Amazon", topic: "Rivers" },
      { q: "Highest mountain?", a: "Mount Everest (8,849 m)", topic: "Mountains" },
      { q: "Mountain range with Everest?", a: "Himalayas", topic: "Mountains" },
      { q: "Highest mountain in Africa?", a: "Mount Kilimanjaro", topic: "Mountains" },
      { q: "Highest mountain in North America?", a: "Denali (Mt. McKinley)", topic: "Mountains" },
      { q: "Largest desert?", a: "Antarctic Desert (cold); Sahara largest hot desert", topic: "Deserts" },
      { q: "Largest hot desert?", a: "Sahara", topic: "Deserts" },
      { q: "Largest country by area?", a: "Russia", topic: "Countries" },
      { q: "Largest country by population?", a: "India (recently overtook China)", topic: "Countries" },
      { q: "Smallest country?", a: "Vatican City", topic: "Countries" },
      { q: "Capital of France?", a: "Paris", topic: "Capitals" },
      { q: "Capital of Japan?", a: "Tokyo", topic: "Capitals" },
      { q: "Capital of Australia?", a: "Canberra", topic: "Capitals" },
      { q: "Capital of Canada?", a: "Ottawa", topic: "Capitals" },
      { q: "Capital of Brazil?", a: "Brasília", topic: "Capitals" },
      { q: "Capital of Russia?", a: "Moscow", topic: "Capitals" },
      { q: "Capital of Egypt?", a: "Cairo", topic: "Capitals" },
      { q: "Capital of South Africa?", a: "Pretoria (administrative), Cape Town (legislative), Bloemfontein (judicial)", topic: "Capitals" },
      { q: "Capital of India?", a: "New Delhi", topic: "Capitals" },
      { q: "Capital of China?", a: "Beijing", topic: "Capitals" },
      { q: "Capital of UK?", a: "London", topic: "Capitals" },
      { q: "Capital of Germany?", a: "Berlin", topic: "Capitals" },
      { q: "Capital of Italy?", a: "Rome", topic: "Capitals" },
      { q: "Capital of Spain?", a: "Madrid", topic: "Capitals" },
      { q: "Capital of Greece?", a: "Athens", topic: "Capitals" },
      { q: "Capital of Argentina?", a: "Buenos Aires", topic: "Capitals" },
      { q: "Capital of Mexico?", a: "Mexico City", topic: "Capitals" },
      { q: "Capital of Turkey?", a: "Ankara", topic: "Capitals" },
      { q: "Capital of Thailand?", a: "Bangkok", topic: "Capitals" },
      { q: "Capital of Vietnam?", a: "Hanoi", topic: "Capitals" },
      { q: "Capital of South Korea?", a: "Seoul", topic: "Capitals" },
      { q: "Capital of North Korea?", a: "Pyongyang", topic: "Capitals" },
      { q: "What is the Equator?", a: "0° latitude; circle dividing Northern and Southern Hemispheres", topic: "Map Basics" },
      { q: "What is the Prime Meridian?", a: "0° longitude; passes through Greenwich, England", topic: "Map Basics" },
      { q: "What is latitude?", a: "Angular distance north/south of equator", topic: "Map Basics" },
      { q: "What is longitude?", a: "Angular distance east/west of Prime Meridian", topic: "Map Basics" },
      { q: "Tropic of Cancer latitude?", a: "23.5°N", topic: "Map Basics" },
      { q: "Tropic of Capricorn latitude?", a: "23.5°S", topic: "Map Basics" },
      { q: "Arctic Circle latitude?", a: "66.5°N", topic: "Map Basics" },
      { q: "Antarctic Circle latitude?", a: "66.5°S", topic: "Map Basics" },
      { q: "What is altitude?", a: "Height above sea level", topic: "Physical Geography" },
      { q: "What is climate?", a: "Long-term average weather pattern", topic: "Climate" },
      { q: "What is weather?", a: "Short-term atmospheric conditions", topic: "Climate" },
      { q: "Layers of Earth's atmosphere?", a: "Troposphere, Stratosphere, Mesosphere, Thermosphere, Exosphere", topic: "Atmosphere" },
      { q: "Where does weather occur?", a: "Troposphere", topic: "Atmosphere" },
      { q: "Where is the ozone layer?", a: "Stratosphere", topic: "Atmosphere" },
      { q: "What is greenhouse effect?", a: "Warming from atmospheric gases trapping heat", topic: "Climate" },
      { q: "Main greenhouse gases?", a: "CO₂, methane, water vapor, nitrous oxide", topic: "Climate" },
      { q: "Layers of Earth?", a: "Crust, mantle, outer core, inner core", topic: "Earth Structure" },
      { q: "What is plate tectonics?", a: "Theory of moving lithospheric plates", topic: "Geology" },
      { q: "What causes earthquakes?", a: "Sudden release of energy at plate boundaries/faults", topic: "Geology" },
      { q: "What is a volcano?", a: "Opening where magma erupts", topic: "Geology" },
      { q: "Ring of Fire?", a: "Pacific Rim with heavy volcanic/seismic activity", topic: "Geology" },
      { q: "What is a tsunami?", a: "Series of ocean waves from underwater disturbance", topic: "Natural Disasters" },
      { q: "What is a hurricane?", a: "Tropical cyclone in Atlantic/E. Pacific", topic: "Natural Disasters" },
      { q: "What is a tornado?", a: "Violent rotating column from thunderstorm to ground", topic: "Natural Disasters" },
      { q: "What is monsoon?", a: "Seasonal wind reversal bringing heavy rain", topic: "Climate" },
      { q: "Tropical rainforest characteristics?", a: "Hot, wet, high biodiversity (e.g., Amazon)", topic: "Biomes" },
      { q: "What is tundra?", a: "Cold, treeless biome with permafrost", topic: "Biomes" },
      { q: "What is savanna?", a: "Tropical grassland with scattered trees", topic: "Biomes" },
      { q: "What is taiga?", a: "Boreal coniferous forest", topic: "Biomes" },
      { q: "Largest lake by area?", a: "Caspian Sea (technically a sea/lake)", topic: "Lakes" },
      { q: "Largest freshwater lake?", a: "Lake Superior (by area); Lake Baikal (by volume)", topic: "Lakes" },
      { q: "Deepest lake?", a: "Lake Baikal (Russia)", topic: "Lakes" },
      { q: "Lowest point on Earth?", a: "Dead Sea (-430 m below sea level)", topic: "Extremes" },
      { q: "Highest waterfall?", a: "Angel Falls (Venezuela)", topic: "Waterfalls" },
      { q: "Most populous city?", a: "Tokyo metro area", topic: "Cities" },
      { q: "What is GDP?", a: "Gross Domestic Product; total value of goods/services produced", topic: "Economic Geography" },
      { q: "What is population density?", a: "People per unit area", topic: "Population" },
      { q: "What is urbanization?", a: "Shift of population from rural to urban areas", topic: "Population" },
      { q: "Difference latitude/longitude (visual)?", a: "Latitude = horizontal lines; longitude = vertical lines", topic: "Map Basics" },
      { q: "GMT?", a: "Greenwich Mean Time", topic: "Time Zones" },
      { q: "IST UTC offset?", a: "UTC+5:30", topic: "Time Zones" },
      { q: "How many time zones?", a: "24", topic: "Time Zones" },
      { q: "Coriolis effect?", a: "Apparent deflection of moving objects due to Earth's rotation", topic: "Physical Geography" },
      { q: "What is erosion?", a: "Wearing away of land by water, wind, ice", topic: "Physical Geography" },
      { q: "What is weathering?", a: "Breaking down of rocks in place", topic: "Physical Geography" },
      { q: "What is a peninsula?", a: "Land surrounded by water on three sides", topic: "Landforms" },
      { q: "What is an isthmus?", a: "Narrow strip of land connecting two larger areas", topic: "Landforms" },
      { q: "What is an archipelago?", a: "Group of islands", topic: "Landforms" },
      { q: "What is a strait?", a: "Narrow waterway connecting two seas", topic: "Landforms" },
      { q: "What is a delta?", a: "Sediment deposit at river mouth", topic: "Landforms" },
      { q: "What is a glacier?", a: "Mass of slowly moving ice", topic: "Landforms" },
      { q: "Largest island?", a: "Greenland", topic: "Islands" },
      { q: "Largest country in South America?", a: "Brazil", topic: "Countries" },
      { q: "Largest country in Africa?", a: "Algeria", topic: "Countries" },
      { q: "Largest country in Europe?", a: "Russia (by area, including European part)", topic: "Countries" },
      { q: "Countries bordering India?", a: "Pakistan, China, Nepal, Bhutan, Bangladesh, Myanmar", topic: "Countries" },
      { q: "What is renewable energy?", a: "Energy from naturally replenished sources", topic: "Resources" },
      { q: "Examples of renewable energy?", a: "Solar, wind, hydro, geothermal, biomass", topic: "Resources" },
      { q: "Fossil fuels?", a: "Coal, oil, natural gas", topic: "Resources" },
      { q: "What is global warming?", a: "Long-term rise in Earth's average temperature", topic: "Climate" },
    ];
    for (let i = 0; i < 800; i++) out.push(pick(qs));
    return out;
  };
  const geoQs = geoGen();

  // ── PSYCHOLOGY ──
  const psyGen = () => {
    const out = [];
    const qs = [
      { q: "What is psychology?", a: "Scientific study of mind and behavior", topic: "Behavior" },
      { q: "Father of psychology?", a: "Wilhelm Wundt (founded first psych lab 1879)", topic: "Behavior" },
      { q: "What is classical conditioning?", a: "Learning by association (Pavlov's dogs)", topic: "Behavior" },
      { q: "What is operant conditioning?", a: "Learning through rewards/punishments (Skinner)", topic: "Behavior" },
      { q: "What is cognitive psychology?", a: "Study of mental processes (memory, thinking, perception)", topic: "Behavior" },
      { q: "What is behaviorism?", a: "School focusing on observable behavior", topic: "Behavior" },
      { q: "Father of psychoanalysis?", a: "Sigmund Freud", topic: "Behavior" },
      { q: "Id, ego, superego?", a: "Freudian: id (instincts), ego (reality), superego (morality)", topic: "Behavior" },
      { q: "Maslow's hierarchy?", a: "Physiological, safety, love, esteem, self-actualization", topic: "Behavior" },
      { q: "What is short-term memory?", a: "Holds limited info ~20-30 seconds", topic: "Behavior" },
      { q: "What is long-term memory?", a: "Stores info indefinitely", topic: "Behavior" },
      { q: "What is IQ?", a: "Intelligence Quotient; measure of cognitive ability", topic: "Behavior" },
      { q: "Average IQ?", a: "100", topic: "Behavior" },
      { q: "What is the brain?", a: "Central nervous system organ controlling body", topic: "Behavior" },
      { q: "What is neuroscience?", a: "Study of the nervous system", topic: "Behavior" },
      { q: "What is depression?", a: "Mood disorder with persistent sadness/loss of interest", topic: "Behavior" },
      { q: "What is anxiety?", a: "Excessive worry/nervousness", topic: "Behavior" },
      { q: "What is PTSD?", a: "Post-Traumatic Stress Disorder; trauma-related condition", topic: "Behavior" },
      { q: "What is therapy?", a: "Treatment for mental health, often through talking", topic: "Behavior" },
      { q: "What is CBT?", a: "Cognitive Behavioral Therapy; addresses thoughts and behaviors", topic: "Behavior" },
      { q: "What is conformity?", a: "Matching attitudes/beliefs to group norms", topic: "Behavior" },
      { q: "What is groupthink?", a: "Group consensus overriding critical thinking", topic: "Behavior" },
      { q: "What is bias?", a: "Systematic deviation from rational judgment", topic: "Behavior" },
      { q: "What is confirmation bias?", a: "Seeking info that confirms existing beliefs", topic: "Behavior" },
      { q: "What is the placebo effect?", a: "Improvement from belief in treatment, not the treatment itself", topic: "Behavior" },
      { q: "Piaget's stages of cognitive development?", a: "Sensorimotor, Preoperational, Concrete Operational, Formal Operational", topic: "Behavior" },
      { q: "What is attachment theory?", a: "Bonds between infants and caregivers shape development (Bowlby)", topic: "Behavior" },
      { q: "What is empathy?", a: "Ability to understand and share others' feelings", topic: "Behavior" },
      { q: "What is emotional intelligence?", a: "Ability to perceive, control, and evaluate emotions", topic: "Behavior" },
      { q: "What is REM sleep?", a: "Rapid Eye Movement; stage of vivid dreaming", topic: "Behavior" },
      { q: "What is schizophrenia?", a: "Disorder with hallucinations, delusions, disorganized thinking", topic: "Behavior" },
      { q: "What is bipolar disorder?", a: "Mood disorder with manic and depressive episodes", topic: "Behavior" },
      { q: "What is OCD?", a: "Obsessive-Compulsive Disorder; intrusive thoughts and rituals", topic: "Behavior" },
    ];
    for (let i = 0; i < 800; i++) out.push(pick(qs));
    return out;
  };
  const psyQs = psyGen();

  // ── ECONOMICS ──
  const econGen = () => {
    const out = [];
    const qs = [
      { q: "What is economics?", a: "Study of resource allocation and choices", topic: "Micro" },
      { q: "Difference micro vs macro economics?", a: "Micro: individuals/firms. Macro: economy as whole", topic: "Micro" },
      { q: "What is supply?", a: "Quantity producers offer at various prices", topic: "Micro" },
      { q: "What is demand?", a: "Quantity consumers want at various prices", topic: "Micro" },
      { q: "Law of demand?", a: "As price rises, quantity demanded falls (other things equal)", topic: "Micro" },
      { q: "Law of supply?", a: "As price rises, quantity supplied rises (other things equal)", topic: "Micro" },
      { q: "Equilibrium price?", a: "Where supply equals demand", topic: "Micro" },
      { q: "What is GDP?", a: "Gross Domestic Product; total value of goods/services produced annually", topic: "Micro" },
      { q: "What is GNP?", a: "Gross National Product; GDP + income from abroad", topic: "Micro" },
      { q: "What is inflation?", a: "General rise in prices over time", topic: "Micro" },
      { q: "What is deflation?", a: "General fall in prices", topic: "Micro" },
      { q: "What is recession?", a: "Significant decline in economic activity", topic: "Micro" },
      { q: "What is unemployment?", a: "Percentage of labor force without jobs but seeking", topic: "Micro" },
      { q: "What is fiscal policy?", a: "Government's use of spending and taxation", topic: "Micro" },
      { q: "What is monetary policy?", a: "Central bank's control of money supply and interest rates", topic: "Micro" },
      { q: "What is opportunity cost?", a: "Value of next best alternative foregone", topic: "Micro" },
      { q: "What is elasticity?", a: "Responsiveness of quantity to price change", topic: "Micro" },
      { q: "What is a monopoly?", a: "Single seller controls market", topic: "Micro" },
      { q: "What is an oligopoly?", a: "Few firms dominate market", topic: "Micro" },
      { q: "Perfect competition characteristics?", a: "Many buyers/sellers, identical products, free entry/exit", topic: "Micro" },
      { q: "What is market failure?", a: "Market doesn't allocate resources efficiently", topic: "Micro" },
      { q: "What is externality?", a: "Cost/benefit affecting third party not in transaction", topic: "Micro" },
      { q: "What is public good?", a: "Non-excludable and non-rivalrous (defense, parks)", topic: "Micro" },
      { q: "What is a tariff?", a: "Tax on imports", topic: "Micro" },
      { q: "What is free trade?", a: "International trade without tariffs/restrictions", topic: "Micro" },
      { q: "Comparative advantage?", a: "Ability to produce at lower opportunity cost (Ricardo)", topic: "Micro" },
      { q: "Adam Smith's contribution?", a: "Wealth of Nations; invisible hand; father of modern economics", topic: "Micro" },
      { q: "Keynesian economics?", a: "Government intervention can stabilize economy (Keynes)", topic: "Micro" },
      { q: "What is the stock market?", a: "Market for buying/selling shares of public companies", topic: "Micro" },
      { q: "Bull vs bear market?", a: "Bull: rising prices. Bear: falling prices", topic: "Micro" },
      { q: "What is a bond?", a: "Debt security; loan to issuer with interest", topic: "Micro" },
      { q: "What is a derivative?", a: "Financial instrument deriving value from underlying asset", topic: "Micro" },
      { q: "What is liquidity?", a: "Ease of converting asset to cash", topic: "Micro" },
      { q: "What is capitalism?", a: "Economic system with private ownership, free markets", topic: "Micro" },
      { q: "What is socialism?", a: "Economic system with collective/state ownership of production", topic: "Micro" },
      { q: "What is communism?", a: "Theoretical classless system with common ownership", topic: "Micro" },
      { q: "What is mixed economy?", a: "Mix of private and public ownership", topic: "Micro" },
    ];
    for (let i = 0; i < 800; i++) out.push(pick(qs));
    return out;
  };
  const econQs = econGen();

  // ── POLITICAL SCIENCE ──
  const polGen = () => {
    const out = [];
    const qs = [
      { q: "What is democracy?", a: "Government by the people, usually via elections", topic: "Government" },
      { q: "What is autocracy?", a: "Government by single ruler with absolute power", topic: "Government" },
      { q: "What is oligarchy?", a: "Rule by small group", topic: "Government" },
      { q: "What is monarchy?", a: "Rule by king/queen (hereditary)", topic: "Government" },
      { q: "What is republic?", a: "Government where power held by elected representatives", topic: "Government" },
      { q: "What is federalism?", a: "Power divided between central and regional governments", topic: "Government" },
      { q: "Three branches of government (US)?", a: "Legislative, Executive, Judicial", topic: "Government" },
      { q: "What is separation of powers?", a: "Distributing government among branches to prevent tyranny", topic: "Government" },
      { q: "What is checks and balances?", a: "Each branch can limit others' powers", topic: "Government" },
      { q: "What is a constitution?", a: "Document outlining principles and structure of government", topic: "Government" },
      { q: "What is rule of law?", a: "All citizens equally subject to law", topic: "Government" },
      { q: "What is sovereignty?", a: "Supreme authority within a territory", topic: "Government" },
      { q: "What is sovereignty (state)?", a: "State's right to govern itself without interference", topic: "Government" },
      { q: "What is diplomacy?", a: "Conduct of international relations through negotiation", topic: "Government" },
      { q: "What is foreign policy?", a: "State's strategy for international relations", topic: "Government" },
      { q: "What is the UN Security Council?", a: "UN body with 5 permanent + 10 rotating members for peace/security", topic: "Government" },
      { q: "Five permanent UNSC members?", a: "USA, UK, France, Russia, China", topic: "Government" },
      { q: "What is human rights?", a: "Fundamental rights inherent to all humans", topic: "Government" },
      { q: "What is the Universal Declaration of Human Rights?", a: "1948 UN document outlining basic rights", topic: "Government" },
      { q: "What is a referendum?", a: "Direct vote by electorate on specific issue", topic: "Government" },
      { q: "What is propaganda?", a: "Biased info to promote viewpoint", topic: "Government" },
      { q: "What is lobbying?", a: "Attempting to influence legislators", topic: "Government" },
      { q: "What is a political party?", a: "Organized group pursuing political goals", topic: "Government" },
      { q: "What is a bill?", a: "Proposed law", topic: "Government" },
      { q: "What is a statute?", a: "Written law passed by legislature", topic: "Government" },
      { q: "What is judicial review?", a: "Court power to invalidate unconstitutional laws", topic: "Government" },
      { q: "What is impeachment?", a: "Process to remove official from office", topic: "Government" },
      { q: "Left vs right wing?", a: "Left: progressive/socialist. Right: conservative/traditional", topic: "Government" },
      { q: "What is liberalism?", a: "Political philosophy emphasizing individual rights, equality", topic: "Government" },
      { q: "What is conservatism?", a: "Political philosophy favoring tradition, gradual change", topic: "Government" },
      { q: "What is totalitarianism?", a: "System with total state control over public/private life", topic: "Government" },
      { q: "What is fascism?", a: "Authoritarian ultranationalism with dictatorial leader", topic: "Government" },
      { q: "India's political system?", a: "Parliamentary federal republic with multi-party democracy", topic: "Government" },
      { q: "Indian Parliament houses?", a: "Lok Sabha (lower) and Rajya Sabha (upper)", topic: "Government" },
      { q: "Indian President role?", a: "Constitutional head of state; ceremonial", topic: "Government" },
      { q: "Indian PM role?", a: "Head of government; executive power", topic: "Government" },
      { q: "What are fundamental rights (India)?", a: "Constitutional rights including equality, freedom, against exploitation, religion, culture, constitutional remedies", topic: "Government" },
    ];
    for (let i = 0; i < 800; i++) out.push(pick(qs));
    return out;
  };
  const polQs = polGen();

  // ── PHILOSOPHY ──
  const phiGen = () => {
    const out = [];
    const qs = [
      { q: "What is philosophy?", a: "Study of fundamental questions about existence, knowledge, ethics", topic: "Ethics" },
      { q: "What is metaphysics?", a: "Branch concerning nature of reality", topic: "Ethics" },
      { q: "What is epistemology?", a: "Study of knowledge and belief", topic: "Ethics" },
      { q: "What is ethics?", a: "Moral philosophy concerning right and wrong", topic: "Ethics" },
      { q: "What is logic?", a: "Study of valid reasoning", topic: "Ethics" },
      { q: "What is aesthetics?", a: "Philosophy of beauty and art", topic: "Ethics" },
      { q: "Who was Socrates?", a: "Greek philosopher (~470-399 BCE); Socratic method", topic: "Ethics" },
      { q: "Socratic method?", a: "Form of inquiry through dialogue and questioning", topic: "Ethics" },
      { q: "Who was Plato?", a: "Student of Socrates; theory of Forms; The Republic", topic: "Ethics" },
      { q: "Who was Aristotle?", a: "Plato's student; logic, ethics, metaphysics, science", topic: "Ethics" },
      { q: "What is utilitarianism?", a: "Greatest good for greatest number (Bentham, Mill)", topic: "Ethics" },
      { q: "What is deontology?", a: "Ethics based on duty/rules (Kant)", topic: "Ethics" },
      { q: "What is virtue ethics?", a: "Ethics based on character and virtues (Aristotle)", topic: "Ethics" },
      { q: "Kant's categorical imperative?", a: "Act only on maxims you'd will to be universal law", topic: "Ethics" },
      { q: "What is existentialism?", a: "Philosophy emphasizing individual existence, freedom, choice", topic: "Ethics" },
      { q: "Key existentialists?", a: "Kierkegaard, Sartre, Camus, Nietzsche", topic: "Ethics" },
      { q: "Cogito ergo sum?", a: "'I think, therefore I am' (Descartes)", topic: "Ethics" },
      { q: "What is rationalism?", a: "Knowledge primarily from reason", topic: "Ethics" },
      { q: "What is empiricism?", a: "Knowledge primarily from experience", topic: "Ethics" },
      { q: "What is the problem of evil?", a: "How can omnipotent benevolent God allow evil?", topic: "Ethics" },
      { q: "What is determinism?", a: "All events predetermined by causes", topic: "Ethics" },
      { q: "What is free will?", a: "Ability to choose freely between alternatives", topic: "Ethics" },
      { q: "What is consciousness?", a: "State of awareness; subjective experience", topic: "Ethics" },
      { q: "Mind-body problem?", a: "How does mind relate to physical body?", topic: "Ethics" },
      { q: "What is dualism?", a: "Mind and body are separate substances (Descartes)", topic: "Ethics" },
      { q: "What is materialism?", a: "Only matter exists; mind is physical", topic: "Ethics" },
      { q: "What is idealism?", a: "Reality is mental/ideal", topic: "Ethics" },
      { q: "What is solipsism?", a: "Only one's own mind is certain to exist", topic: "Ethics" },
      { q: "What is skepticism?", a: "Questioning the possibility of knowledge", topic: "Ethics" },
      { q: "What is nihilism?", a: "Rejection of meaning, values, knowledge", topic: "Ethics" },
      { q: "Nietzsche famous for?", a: "'God is dead'; will to power; eternal recurrence", topic: "Ethics" },
      { q: "What is stoicism?", a: "Ancient philosophy: virtue is sufficient for happiness; accept what you can't change", topic: "Ethics" },
      { q: "What is hedonism?", a: "Pleasure is highest good", topic: "Ethics" },
      { q: "What is moral relativism?", a: "Morality varies by culture/individual", topic: "Ethics" },
      { q: "What is moral absolutism?", a: "Some actions are absolutely right/wrong", topic: "Ethics" },
      { q: "What is solipsism?", a: "View that only self exists or can be known", topic: "Ethics" },
    ];
    for (let i = 0; i < 800; i++) out.push(pick(qs));
    return out;
  };
  const phiQs = phiGen();

  // ── SOCIOLOGY ──
  const socGen = () => {
    const out = [];
    const qs = [
      { q: "What is sociology?", a: "Scientific study of society and human behavior", topic: "Theory" },
      { q: "Father of sociology?", a: "Auguste Comte", topic: "Theory" },
      { q: "Key classical sociologists?", a: "Marx, Weber, Durkheim", topic: "Theory" },
      { q: "What is society?", a: "Group of people sharing culture/territory", topic: "Theory" },
      { q: "What is culture?", a: "Shared beliefs, values, norms, practices", topic: "Theory" },
      { q: "What is socialization?", a: "Process of learning culture/social norms", topic: "Theory" },
      { q: "Primary socialization?", a: "Early learning within family", topic: "Theory" },
      { q: "Secondary socialization?", a: "Learning in school, workplace, etc.", topic: "Theory" },
      { q: "What is a norm?", a: "Expected behavior in society", topic: "Theory" },
      { q: "What is a value?", a: "Cultural standard of what's good/desirable", topic: "Theory" },
      { q: "What is a role?", a: "Expected behavior for a social position", topic: "Theory" },
      { q: "What is status?", a: "Position in social hierarchy", topic: "Theory" },
      { q: "Ascribed vs achieved status?", a: "Ascribed: born with. Achieved: earned", topic: "Theory" },
      { q: "What is social stratification?", a: "Ranking of people in society", topic: "Theory" },
      { q: "What is social class?", a: "Group with similar socioeconomic position", topic: "Theory" },
      { q: "What is caste system?", a: "Rigid stratification based on birth", topic: "Theory" },
      { q: "What is social mobility?", a: "Movement between social classes", topic: "Theory" },
      { q: "What is gender?", a: "Social/cultural distinctions of male/female", topic: "Theory" },
      { q: "What is race?", a: "Social construct based on physical characteristics", topic: "Theory" },
      { q: "What is ethnicity?", a: "Shared cultural heritage", topic: "Theory" },
      { q: "What is religion?", a: "System of beliefs/practices about sacred/divine", topic: "Theory" },
      { q: "What is a family?", a: "Group related by blood, marriage, adoption", topic: "Theory" },
      { q: "Nuclear vs extended family?", a: "Nuclear: parents+children. Extended: includes other relatives", topic: "Theory" },
      { q: "What is marriage?", a: "Socially recognized union, often legal", topic: "Theory" },
      { q: "What is deviance?", a: "Behavior violating social norms", topic: "Theory" },
      { q: "What is crime?", a: "Behavior violating laws", topic: "Theory" },
      { q: "What is social control?", a: "Mechanisms to enforce conformity", topic: "Theory" },
      { q: "What is institution?", a: "Established pattern (family, education, government, religion, economy)", topic: "Theory" },
      { q: "What is bureaucracy?", a: "Formal organization with hierarchy/rules (Weber)", topic: "Theory" },
      { q: "What is urbanization?", a: "Shift from rural to urban living", topic: "Theory" },
      { q: "What is globalization?", a: "Increasing interconnectedness worldwide", topic: "Theory" },
      { q: "What is modernization?", a: "Process of becoming modern industrial society", topic: "Theory" },
      { q: "What is industrialization?", a: "Shift to industrial economy", topic: "Theory" },
      { q: "Functionalism?", a: "Society parts function together (Durkheim, Parsons)", topic: "Theory" },
      { q: "Conflict theory?", a: "Society marked by inequality and conflict (Marx)", topic: "Theory" },
      { q: "Symbolic interactionism?", a: "Society shaped by symbols/interactions (Mead, Cooley)", topic: "Theory" },
      { q: "What is anomie?", a: "State of normlessness (Durkheim)", topic: "Theory" },
      { q: "What is alienation?", a: "Estrangement from work, others, self (Marx)", topic: "Theory" },
    ];
    for (let i = 0; i < 800; i++) out.push(pick(qs));
    return out;
  };
  const socQs = socGen();

  // ── STATISTICS ──
  const statsGen = () => {
    const out = [];
    const qs = [
      { q: "What is statistics?", a: "Science of collecting, analyzing, interpreting data", topic: "Descriptive" },
      { q: "Mean formula?", a: "Sum of values divided by count", topic: "Descriptive" },
      { q: "Median?", a: "Middle value when ordered", topic: "Descriptive" },
      { q: "Mode?", a: "Most frequent value", topic: "Descriptive" },
      { q: "Range?", a: "Difference between max and min", topic: "Descriptive" },
      { q: "Variance?", a: "Average of squared deviations from mean", topic: "Descriptive" },
      { q: "Standard deviation?", a: "Square root of variance; spread measure", topic: "Descriptive" },
      { q: "What is a population?", a: "Entire group being studied", topic: "Descriptive" },
      { q: "What is a sample?", a: "Subset selected from population", topic: "Descriptive" },
      { q: "Random sample?", a: "Sample where every member has equal chance", topic: "Descriptive" },
      { q: "What is bias in sampling?", a: "Systematic error favoring certain outcomes", topic: "Descriptive" },
      { q: "Descriptive vs inferential stats?", a: "Descriptive: summarize data. Inferential: predict from samples", topic: "Descriptive" },
      { q: "What is correlation?", a: "Statistical relationship between two variables", topic: "Descriptive" },
      { q: "Correlation vs causation?", a: "Correlation: variables move together. Causation: one causes the other", topic: "Descriptive" },
      { q: "What is regression?", a: "Modeling relationship between variables to predict", topic: "Descriptive" },
      { q: "What is a hypothesis?", a: "Testable statement about population", topic: "Descriptive" },
      { q: "Null hypothesis?", a: "No effect/difference (default assumption)", topic: "Descriptive" },
      { q: "Alternative hypothesis?", a: "There is an effect/difference", topic: "Descriptive" },
      { q: "What is p-value?", a: "Probability of observed result under null hypothesis", topic: "Descriptive" },
      { q: "Significance level?", a: "Threshold (commonly 0.05) for rejecting null", topic: "Descriptive" },
      { q: "Type I error?", a: "Rejecting true null (false positive)", topic: "Descriptive" },
      { q: "Type II error?", a: "Failing to reject false null (false negative)", topic: "Descriptive" },
      { q: "What is confidence interval?", a: "Range likely containing true parameter", topic: "Descriptive" },
      { q: "What is probability?", a: "Likelihood of an event (0 to 1)", topic: "Descriptive" },
      { q: "Independent events probability?", a: "P(A and B) = P(A) × P(B)", topic: "Descriptive" },
      { q: "Conditional probability?", a: "P(A|B) = P(A and B)/P(B)", topic: "Descriptive" },
      { q: "What is normal distribution?", a: "Bell-shaped, symmetric distribution (Gaussian)", topic: "Descriptive" },
      { q: "68-95-99.7 rule?", a: "Data within 1, 2, 3 SDs in normal distribution", topic: "Descriptive" },
      { q: "What is skewness?", a: "Asymmetry of distribution", topic: "Descriptive" },
      { q: "What is kurtosis?", a: "Tail heaviness of distribution", topic: "Descriptive" },
      { q: "Central limit theorem?", a: "Sample means approach normal distribution as n increases", topic: "Descriptive" },
      { q: "What is a percentile?", a: "Value below which a percent of data falls", topic: "Descriptive" },
      { q: "What is the IQR?", a: "Interquartile Range; Q3 - Q1", topic: "Descriptive" },
      { q: "What is outlier?", a: "Extreme value far from rest of data", topic: "Descriptive" },
      { q: "Probability of fair coin showing heads?", a: "0.5", topic: "Descriptive" },
      { q: "Sum of probabilities of all outcomes?", a: "1", topic: "Descriptive" },
    ];
    for (let i = 0; i < 800; i++) out.push(pick(qs));
    return out;
  };
  const statsQs = statsGen();

  // ── BUSINESS STUDIES ──
  const bizGen = () => {
    const out = [];
    const qs = [
      { q: "What is business?", a: "Organization providing goods/services for profit", topic: "Management" },
      { q: "What is management?", a: "Coordinating people/resources to achieve goals", topic: "Management" },
      { q: "Functions of management?", a: "Planning, organizing, leading, controlling", topic: "Management" },
      { q: "What is marketing?", a: "Creating, communicating, delivering value to customers", topic: "Management" },
      { q: "4 Ps of marketing?", a: "Product, Price, Place, Promotion", topic: "Management" },
      { q: "What is market research?", a: "Gathering info about market, customers, competitors", topic: "Management" },
      { q: "What is branding?", a: "Creating unique identity for product/company", topic: "Management" },
      { q: "What is SWOT analysis?", a: "Strengths, Weaknesses, Opportunities, Threats", topic: "Management" },
      { q: "What is entrepreneurship?", a: "Starting and running business with risk", topic: "Management" },
      { q: "What is a startup?", a: "Newly formed company in early stages", topic: "Management" },
      { q: "What is a corporation?", a: "Legal entity separate from owners", topic: "Management" },
      { q: "What is sole proprietorship?", a: "Business owned by one person", topic: "Management" },
      { q: "What is partnership?", a: "Business owned by 2+ people", topic: "Management" },
      { q: "What is LLC?", a: "Limited Liability Company; protects owners from business debts", topic: "Management" },
      { q: "What is a stock?", a: "Share of company ownership", topic: "Management" },
      { q: "What is IPO?", a: "Initial Public Offering; first sale of stock to public", topic: "Management" },
      { q: "What is profit?", a: "Revenue minus expenses", topic: "Management" },
      { q: "What is revenue?", a: "Total income from sales", topic: "Management" },
      { q: "What is gross profit?", a: "Revenue minus cost of goods sold", topic: "Management" },
      { q: "What is net profit?", a: "Profit after all expenses and taxes", topic: "Management" },
      { q: "What is ROI?", a: "Return on Investment; (gain - cost)/cost", topic: "Management" },
      { q: "What is cash flow?", a: "Money moving in and out of business", topic: "Management" },
      { q: "What is HRM?", a: "Human Resource Management; managing people", topic: "Management" },
      { q: "What is recruitment?", a: "Process of finding/hiring employees", topic: "Management" },
      { q: "What is supply chain?", a: "Network from raw materials to consumer", topic: "Management" },
      { q: "What is logistics?", a: "Management of flow of goods", topic: "Management" },
      { q: "What is inventory?", a: "Stock of goods on hand", topic: "Management" },
      { q: "What is JIT?", a: "Just-In-Time inventory; minimal stock kept", topic: "Management" },
      { q: "What is CRM?", a: "Customer Relationship Management", topic: "Management" },
      { q: "What is B2B?", a: "Business to Business transactions", topic: "Management" },
      { q: "What is B2C?", a: "Business to Consumer transactions", topic: "Management" },
      { q: "What is e-commerce?", a: "Buying/selling online", topic: "Management" },
      { q: "What is franchising?", a: "Selling rights to use brand/business model", topic: "Management" },
      { q: "What is monopoly (biz)?", a: "Market controlled by single company", topic: "Management" },
      { q: "What is competition (biz)?", a: "Rivalry between businesses", topic: "Management" },
      { q: "What is innovation?", a: "Introducing new ideas, methods, or products", topic: "Management" },
      { q: "What is leadership?", a: "Influencing others toward goals", topic: "Management" },
      { q: "Leadership styles?", a: "Autocratic, democratic, laissez-faire, transformational", topic: "Management" },
      { q: "What is motivation?", a: "Internal drive to achieve goals", topic: "Management" },
      { q: "Maslow's hierarchy of needs?", a: "Physiological, safety, social, esteem, self-actualization", topic: "Management" },
      { q: "What is corporate social responsibility?", a: "Business responsibility toward society", topic: "Management" },
      { q: "What is mission statement?", a: "Statement of organization's purpose", topic: "Management" },
      { q: "What is vision statement?", a: "Aspirational description of future state", topic: "Management" },
      { q: "What is strategy?", a: "Plan to achieve long-term goals", topic: "Management" },
      { q: "What is operations management?", a: "Managing processes to produce goods/services", topic: "Management" },
      { q: "What is quality control?", a: "Ensuring products meet standards", topic: "Management" },
      { q: "Total Quality Management?", a: "Continuous improvement focused on customer satisfaction", topic: "Management" },
      { q: "What is benchmarking?", a: "Comparing performance to best practices", topic: "Management" },
      { q: "What is outsourcing?", a: "Hiring external party to perform work", topic: "Management" },
      { q: "What is M&A?", a: "Mergers and Acquisitions", topic: "Management" },
      { q: "What is FDI?", a: "Foreign Direct Investment", topic: "Management" },
    ];
    for (let i = 0; i < 800; i++) out.push(pick(qs));
    return out;
  };
  const bizQs = bizGen();

  // ── ACCOUNTANCY ──
  const acctGen = () => {
    const out = [];
    const qs = [
      { q: "What is accounting?", a: "Recording, classifying, summarizing financial transactions", topic: "Basics" },
      { q: "Accounting equation?", a: "Assets = Liabilities + Equity", topic: "Basics" },
      { q: "What is an asset?", a: "Resource owned with future economic value", topic: "Basics" },
      { q: "What is a liability?", a: "Obligation to pay or provide service", topic: "Basics" },
      { q: "What is equity?", a: "Owner's claim on assets after liabilities", topic: "Basics" },
      { q: "Types of assets?", a: "Current (cash, receivables) and non-current (PP&E)", topic: "Basics" },
      { q: "Types of liabilities?", a: "Current (payables, short debt) and long-term", topic: "Basics" },
      { q: "What is revenue (accounting)?", a: "Income from primary business activities", topic: "Basics" },
      { q: "What is an expense?", a: "Cost incurred to generate revenue", topic: "Basics" },
      { q: "Income statement?", a: "Shows revenues and expenses over period", topic: "Basics" },
      { q: "Balance sheet?", a: "Snapshot of assets, liabilities, equity at point in time", topic: "Basics" },
      { q: "Cash flow statement?", a: "Shows cash inflows and outflows", topic: "Basics" },
      { q: "What is double-entry bookkeeping?", a: "Every transaction has equal debits and credits", topic: "Basics" },
      { q: "Debit vs credit?", a: "Debit: left side; Credit: right side of T-account", topic: "Basics" },
      { q: "What is a journal?", a: "Original record of transactions in chronological order", topic: "Basics" },
      { q: "What is a ledger?", a: "Book of accounts; transactions grouped by account", topic: "Basics" },
      { q: "What is trial balance?", a: "List of accounts to check debits equal credits", topic: "Basics" },
      { q: "What is depreciation?", a: "Allocation of asset's cost over useful life", topic: "Basics" },
      { q: "Straight-line depreciation?", a: "(Cost - Salvage)/Useful Life", topic: "Basics" },
      { q: "What is amortization?", a: "Like depreciation but for intangible assets", topic: "Basics" },
      { q: "What is goodwill?", a: "Intangible asset from acquiring company above book value", topic: "Basics" },
      { q: "What is GAAP?", a: "Generally Accepted Accounting Principles", topic: "Basics" },
      { q: "What is IFRS?", a: "International Financial Reporting Standards", topic: "Basics" },
      { q: "What is accrual basis?", a: "Recording revenues/expenses when earned/incurred", topic: "Basics" },
      { q: "What is cash basis?", a: "Recording when cash exchanges hands", topic: "Basics" },
      { q: "Matching principle?", a: "Match expenses with revenues they generate", topic: "Basics" },
      { q: "What is revenue recognition?", a: "Principle for when to record revenue", topic: "Basics" },
      { q: "What is materiality?", a: "Significance of an item to influence decisions", topic: "Basics" },
      { q: "Going concern?", a: "Assumption business will continue operating", topic: "Basics" },
      { q: "What is conservatism?", a: "When uncertain, choose option understating income/assets", topic: "Basics" },
      { q: "What is an audit?", a: "Independent examination of financial statements", topic: "Basics" },
      { q: "What is an auditor?", a: "Professional who examines financial records", topic: "Basics" },
      { q: "Internal vs external audit?", a: "Internal: company employees. External: independent firm", topic: "Basics" },
      { q: "What is bookkeeping?", a: "Recording financial transactions", topic: "Basics" },
      { q: "What are accounts receivable?", a: "Money owed to company by customers", topic: "Basics" },
      { q: "What are accounts payable?", a: "Money company owes to suppliers", topic: "Basics" },
      { q: "What is inventory (accounting)?", a: "Goods held for sale or production", topic: "Basics" },
      { q: "FIFO vs LIFO?", a: "First In First Out vs Last In First Out inventory methods", topic: "Basics" },
      { q: "What is COGS?", a: "Cost of Goods Sold", topic: "Basics" },
      { q: "What is gross margin?", a: "(Revenue - COGS)/Revenue", topic: "Basics" },
      { q: "What is net margin?", a: "Net income/Revenue", topic: "Basics" },
      { q: "Working capital?", a: "Current Assets - Current Liabilities", topic: "Basics" },
      { q: "Current ratio?", a: "Current Assets/Current Liabilities (liquidity)", topic: "Basics" },
      { q: "Quick ratio?", a: "(Current Assets - Inventory)/Current Liabilities", topic: "Basics" },
      { q: "Debt-to-equity ratio?", a: "Total Debt/Total Equity", topic: "Basics" },
      { q: "Return on Assets (ROA)?", a: "Net Income/Total Assets", topic: "Basics" },
      { q: "Return on Equity (ROE)?", a: "Net Income/Equity", topic: "Basics" },
      { q: "EPS?", a: "Earnings Per Share = Net Income/Shares Outstanding", topic: "Basics" },
      { q: "What is dividend?", a: "Profit distribution to shareholders", topic: "Basics" },
      { q: "What is retained earnings?", a: "Cumulative profits not distributed", topic: "Basics" },
      { q: "What is bank reconciliation?", a: "Matching company records to bank statement", topic: "Basics" },
    ];
    for (let i = 0; i < 800; i++) out.push(pick(qs));
    return out;
  };
  const acctQs = acctGen();

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


// Map level codes to display labels and difficulty bands
const LEVEL_INFO = {
  PreK: { label: 'Pre-Kindergarten', band: 'foundation', count: 8 },
  K:    { label: 'Kindergarten',     band: 'foundation', count: 8 },
  '1':  { label: 'Grade 1',  band: 'foundation', count: 10 },
  '2':  { label: 'Grade 2',  band: 'foundation', count: 10 },
  '3':  { label: 'Grade 3',  band: 'elementary', count: 10 },
  '4':  { label: 'Grade 4',  band: 'elementary', count: 10 },
  '5':  { label: 'Grade 5',  band: 'elementary', count: 10 },
  '6':  { label: 'Grade 6',  band: 'middle', count: 10 },
  '7':  { label: 'Grade 7',  band: 'middle', count: 10 },
  '8':  { label: 'Grade 8',  band: 'middle', count: 10 },
  '9':  { label: 'Grade 9',  band: 'secondary', count: 10 },
  '10': { label: 'Grade 10', band: 'secondary', count: 10 },
  '11': { label: 'Grade 11', band: 'senior', count: 10 },
  '12': { label: 'Grade 12', band: 'senior', count: 10 },
  SAT:     { label: 'SAT Prep', band: 'senior', count: 12 },
  AP:      { label: 'AP Level', band: 'senior', count: 12 },
  College: { label: 'College',  band: 'higher', count: 12 }
};

function levelInfo(level) {
  return LEVEL_INFO[level] || { label: 'Class ' + level, band: 'secondary', count: 10 };
}

// Filter / curate questions based on band
function selectByLevel(bank, level) {
  const info = levelInfo(level);
  if (!bank || !bank.length) return [];

  // Foundation/elementary bands need simpler content — filter out advanced topics
  const advancedTopics = ['Calculus','Logarithms','Trigonometry','Linear Systems','Quadratic Equations','Modern Physics','Electromagnetism','Thermodynamics','Oscillations','Organic','Equilibrium','Electrochemistry','Molecular Biology','Biochemistry','AI','OOP','Algorithms','Compilers','Operating Systems','Cold War','World War I','World War II','Renaissance','Existentialism','Metaphysics','Epistemology','Inferential'];
  const middleTopics = ['Modern Physics','Calculus','Electrochemistry','Equilibrium','Molecular Biology','OOP','Operating Systems','Existentialism'];

  let pool;
  if (info.band === 'foundation' || info.band === 'elementary') {
    pool = bank.filter(q => !advancedTopics.includes(q.topic || ''));
    // For very young classes, even further restrict
    if (info.band === 'foundation') {
      pool = pool.filter(q => {
        const t = (q.topic || '').toLowerCase();
        return !t.includes('advanced') && !t.includes('logarithm') && !t.includes('trig') && !t.includes('calc');
      });
    }
  } else if (info.band === 'middle') {
    pool = bank.filter(q => !middleTopics.includes(q.topic || ''));
  } else if (info.band === 'higher') {
    // College + AP: prefer advanced topics
    const advanced = bank.filter(q => advancedTopics.includes(q.topic || ''));
    pool = advanced.length >= info.count ? advanced : bank;
  } else {
    pool = bank;
  }

  if (!pool.length) pool = bank; // fallback if filter empties it
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, info.count);
}

$('generatePracticeBtn').onclick = async () => {
  const subj = $('practiceSubject').value;
  const level = $('practiceLevel').value;
  if (!subj) { toast('Please select a subject', 'r'); return; }

  const el = $('practiceResults');
  el.innerHTML = `<div class="glass-card"><div style="display:flex;align-items:center;gap:12px;padding:24px;font-size:.88rem;color:var(--t2)"><div style="width:18px;height:18px;border:2px solid var(--accent);border-top-color:transparent;border-radius:50%;animation:spin .8s linear infinite"></div>Generating practice questions...</div></div>`;

  const weakAreas = [];
  st.perfHist.filter(h => h.subject === subj).forEach(h => { if (h.weak) weakAreas.push(...h.weak); });
  const uniqueWeak = [...new Set(weakAreas)];

  setTimeout(() => {
    const bank = QUESTION_BANK[subj];
    const selected = selectByLevel(bank, level);
    if (!selected.length) {
      el.innerHTML = `<div class="glass-card"><div style="padding:24px;font-size:.84rem;color:var(--t3)">No questions available for ${esc(subj)} at ${esc(levelInfo(level).label)} yet.</div></div>`;
      return;
    }
    renderPracticeQuestions(selected, subj, levelInfo(level).label, uniqueWeak);
    toast(`${selected.length} ${levelInfo(level).label} questions generated`, 'g');
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
  // Starfield removed — clean minimal welcome screen
  const cv = document.getElementById('wCanvas');
  if (cv) cv.style.display = 'none';
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
function triggerLaunch() {
  try {
    const nameInput = $('wName');
    const name = (nameInput && nameInput.value && nameInput.value.trim()) || 'Student';
    doLaunch(name);
  } catch (err) {
    console.error('Launch error:', err);
    doLaunch('Student');
  }
}
const _wBtn = $('wBtn');
if (_wBtn) {
  _wBtn.addEventListener('click', triggerLaunch);
  _wBtn.onclick = triggerLaunch;
}
const _wName = $('wName');
if (_wName) {
  _wName.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); triggerLaunch(); } });
}

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

// Welcome info modal
(function () {
  const btn = document.getElementById('welcomeInfoBtn');
  const modal = document.getElementById('welcomeInfoModal');
  if (!btn || !modal) return;
  const open = () => { modal.hidden = false; requestAnimationFrame(() => modal.classList.add('on')); document.body.style.overflow = 'hidden'; };
  const close = () => { modal.classList.remove('on'); document.body.style.overflow = ''; setTimeout(() => { modal.hidden = true; }, 280); };
  btn.addEventListener('click', open);
  modal.addEventListener('click', (e) => {
    if (e.target.matches('[data-info-close]') || e.target.closest('[data-info-close]')) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) close();
  });
})();

// ═══════════════ PREMIUM CURSOR ═══════════════
(function () {
  // Only on hover-capable, fine pointer devices
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (document.getElementById('studyos-cursor')) return;

  const dot = document.createElement('div');
  dot.id = 'studyos-cursor';
  const ring = document.createElement('div');
  ring.id = 'studyos-cursor-ring';
  document.body.appendChild(ring);
  document.body.appendChild(dot);

  let mx = -100, my = -100;
  let rx = -100, ry = -100;
  let visible = false;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    if (!visible) {
      visible = true;
      dot.style.opacity = '1';
      ring.style.opacity = '1';
    }
  }, { passive: true });

  // Smooth follow for ring
  function loop() {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  }
  loop();

  // Hover detection
  const hoverSelectors = 'a, button, [role="button"], input[type="submit"], input[type="button"], .clickable, .nav-item, .ref-card, .note-card, .goal-slot, .task-item, .pq-item, .modal-close, .preset, .pomo-preset-btn, .ref-tab, .mood-btn, .ne-tool, .task-mini-item, .practice-gen-btn, .w-btn, .w-info-btn, .w-info-close, label[for], .tb-icon-btn, .tb-streak, .tb-avatar, .sb-mark, select, .footer-link';
  const textSelectors = 'input[type="text"], input[type="email"], input[type="search"], input[type="number"], input[type="password"], input:not([type]), textarea, [contenteditable="true"]';

  document.addEventListener('mouseover', (e) => {
    const t = e.target;
    if (t.closest && t.closest(textSelectors)) {
      document.body.classList.remove('cur-hover');
      document.body.classList.add('cur-text');
    } else if (t.closest && t.closest(hoverSelectors)) {
      document.body.classList.remove('cur-text');
      document.body.classList.add('cur-hover');
    } else {
      document.body.classList.remove('cur-hover', 'cur-text');
    }
  }, { passive: true });

  document.addEventListener('mousedown', () => document.body.classList.add('cur-press'), { passive: true });
  document.addEventListener('mouseup', () => document.body.classList.remove('cur-press'), { passive: true });
  document.addEventListener('mouseleave', () => {
    visible = false;
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    visible = true;
    dot.style.opacity = '1';
    ring.style.opacity = '1';
  });
})();


// ═══════════════ WELCOME SCREEN PREMIUM EFFECTS ═══════════════
(function welcomeEffects() {
  const screen = document.getElementById('screen-welcome');
  if (!screen) return;

  // 1) Live date/time
  const dtEl = document.getElementById('wTopDateTime');
  if (dtEl) {
    const updateDateTime = () => {
      const d = new Date();
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const hours = d.getHours();
      const mins = d.getMinutes();
      const day = d.getDate();
      const month = months[d.getMonth()];
      const yr = d.getFullYear();
      const h12 = hours % 12 || 12;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      dtEl.textContent = `${month} ${day} · ${h12}:${String(mins).padStart(2,'0')} ${ampm}`;
    };
    updateDateTime();
    setInterval(updateDateTime, 30000);
  }

  // 2) Mouse-follow spotlight + glass card tilt
  const spotlight = screen.querySelector('.w-spotlight');
  const card = screen.querySelector('.w-card');
  let raf = 0;
  let mx = 0.5, my = 0.5;

  screen.addEventListener('mousemove', (e) => {
    const r = screen.getBoundingClientRect();
    mx = (e.clientX - r.left) / r.width;
    my = (e.clientY - r.top) / r.height;
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      if (spotlight) {
        spotlight.style.setProperty('--sx', (mx * 100) + '%');
        spotlight.style.setProperty('--sy', (my * 100) + '%');
      }
      if (card) {
        const cr = card.getBoundingClientRect();
        const ccx = cr.left + cr.width / 2;
        const ccy = cr.top + cr.height / 2;
        const dx = (e.clientX - ccx) / cr.width;
        const dy = (e.clientY - ccy) / cr.height;
        const rotY = Math.max(-4, Math.min(4, dx * 6));
        const rotX = Math.max(-4, Math.min(4, -dy * 6));
        card.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      }
    });
  }, { passive: true });

  screen.addEventListener('mouseleave', () => {
    if (card) card.style.transform = '';
    if (spotlight) {
      spotlight.style.setProperty('--sx', '50%');
      spotlight.style.setProperty('--sy', '50%');
    }
  });

  // 3) Word rotator
  const rotateInner = screen.querySelector('.w-rotate-inner');
  if (rotateInner) {
    const words = ['intention', 'focus', 'purpose', 'clarity', 'mastery', 'depth'];
    let i = 0;
    setInterval(() => {
      i = (i + 1) % words.length;
      rotateInner.style.opacity = '0';
      rotateInner.style.transform = 'translateY(-8px)';
      setTimeout(() => {
        rotateInner.textContent = words[i];
        rotateInner.style.transform = 'translateY(8px)';
        requestAnimationFrame(() => {
          rotateInner.style.opacity = '1';
          rotateInner.style.transform = 'translateY(0)';
        });
      }, 340);
    }, 2800);
  }

  // 4) Click ripple
  const rippleLayer = screen.querySelector('.w-ripple-layer');
  if (rippleLayer) {
    screen.addEventListener('click', (e) => {
      // Don't ripple on input/button to avoid blocking
      if (e.target.closest('.w-input, .w-btn, button, input')) return;
      const ripple = document.createElement('span');
      ripple.className = 'w-ripple';
      ripple.style.left = e.clientX + 'px';
      ripple.style.top = e.clientY + 'px';
      rippleLayer.appendChild(ripple);
      setTimeout(() => ripple.remove(), 900);
    });
  }

  // 5) Magic glow on input focus (handled via CSS, but add typing pulse)
  const input = document.getElementById('wName');
  if (input) {
    input.addEventListener('input', () => {
      input.classList.add('w-input-typing');
      clearTimeout(input._pulseT);
      input._pulseT = setTimeout(() => input.classList.remove('w-input-typing'), 400);
    });
  }

  // 6) SHOOTING STARS canvas
  const ssCanvas = document.getElementById('wShootingStars');
  if (ssCanvas) {
    const ctx = ssCanvas.getContext('2d');
    let W = 0, H = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resizeSS = () => {
      const r = ssCanvas.getBoundingClientRect();
      W = r.width; H = r.height;
      ssCanvas.width = W * dpr; ssCanvas.height = H * dpr;
      ssCanvas.style.width = W + 'px'; ssCanvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resizeSS();
    window.addEventListener('resize', resizeSS, { passive: true });

    const shootingStars = [];
    function spawnStar() {
      const fromLeft = Math.random() < 0.5;
      shootingStars.push({
        x: fromLeft ? -50 : W + 50,
        y: Math.random() * H * 0.65,
        vx: (fromLeft ? 1 : -1) * (5 + Math.random() * 4),
        vy: 1.2 + Math.random() * 1.6,
        life: 0,
        maxLife: 80 + Math.random() * 30,
        tailLen: 14 + Math.random() * 10
      });
    }

    let lastSpawn = 0;
    function ssLoop(now) {
      ctx.clearRect(0, 0, W, H);

      if (now - lastSpawn > (3000 + Math.random() * 3500) && shootingStars.length < 2) {
        spawnStar();
        lastSpawn = now;
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life++;

        const fade = Math.max(0, 1 - (s.life / s.maxLife));
        const tailX = s.x - s.vx * s.tailLen;
        const tailY = s.y - s.vy * s.tailLen;

        // Trail gradient
        const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
        grad.addColorStop(0, 'rgba(120, 180, 255, 0)');
        grad.addColorStop(0.5, 'rgba(180, 220, 255, ' + (fade * 0.45) + ')');
        grad.addColorStop(1, 'rgba(255, 255, 255, ' + (fade * 0.95) + ')');

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();

        // Bright head
        ctx.beginPath();
        ctx.arc(s.x, s.y, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, ' + fade + ')';
        ctx.fill();

        // Glow halo
        const halo = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 10);
        halo.addColorStop(0, 'rgba(180, 220, 255, ' + (fade * 0.55) + ')');
        halo.addColorStop(1, 'rgba(120, 180, 255, 0)');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 10, 0, Math.PI * 2);
        ctx.fill();

        if (s.life > s.maxLife || s.x < -100 || s.x > W + 100) {
          shootingStars.splice(i, 1);
        }
      }
      requestAnimationFrame(ssLoop);
    }
    requestAnimationFrame(ssLoop);
  }

  // 7) STATS COUNTER on load
  const statNums = document.querySelectorAll('.w-stat-num');
  statNums.forEach((el, idx) => {
    const target = parseInt(el.dataset.target, 10);
    const symbol = el.dataset.symbol;
    const startDelay = 1100 + idx * 200;
    setTimeout(() => {
      const duration = 1400;
      const start = performance.now();
      function tick(now) {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        const val = Math.round(target * eased);
        if (symbol && val >= target) {
          el.textContent = symbol;
        } else {
          el.textContent = val.toLocaleString();
        }
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }, startDelay);
  });

})();

(function init() {
  initWCanvas();
  applyTheme(st.theme);
  // initCursorCompanion(); // disabled - using native cursor
  if (st.name) setTimeout(() => doLaunch(st.name), 300);
  setTimeout(initMotionLayer, 400);
})();
