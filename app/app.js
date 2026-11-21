// Leonida Legend: GTA VI trophy guide + tracker.
// Progress lives in localStorage; export downloads it as JSON, import reads it back.
// Filters: grade, kind (story / missable / collectibles / activities / online), search,
// plus a spoiler shield that hides unearned story trophies and an option to hide earned ones.
// The grade filter can be preselected with ?grade=silver (used for the entry screenshots).

const KEY = 'leonida-legend-progress-v1';
const cardsEl = document.getElementById('cards');
const gradeEl = document.getElementById('grade');
const kindEl = document.getElementById('kind');
const searchEl = document.getElementById('search');
const spoilersEl = document.getElementById('spoilers');
const hideEarnedEl = document.getElementById('hide-earned');
const emptyEl = document.getElementById('empty');

const STAGES = [
  { n: 1, title: 'Stage 1 — The story, catching the missables',
    text: 'Play the campaign start to finish. All chapter and named-mission trophies are unmissable, but five trophies in this list look missable from their descriptions (the red box below): do those moments as the story hands them to you, and keep a rotating manual save from Chapter 3 onward so a missed moment costs minutes, not a replay.' },
  { n: 2, title: 'Stage 2 — Strangers, strands and a taste of everything',
    text: 'Clear the stranger mission strands (Andy, Kenton, Billy, Randy, Tyrone and the rest) for the eight-strand trophy, and try each type of activity once. This is also when the map is fully open, so exploration trophies start filling in for free.' },
  { n: 3, title: 'Stage 3 — Skill and activity grinds',
    text: 'The repeatable grinds: 250 stunts, shooting-range golds, drone races, 20 race wins, fishing, meditation spots, 50 challenges and the bowling trophies. None of these can be missed; chip at them between other stages to keep them painless.' },
  { n: 4, title: 'Stage 4 — Crime, partners and money',
    text: 'Partner crime (the 4-star escape, the three-shop spree), stealth and vault robberies, the armoured truck, gang operations, then the money trophies: laundering $250,000 of Marked Bills, spending $100,000, buying every garage and registering vehicles. The crime trophies fund the money trophies, so do them in this order.' },
  { n: 5, title: 'Stage 5 — Collectibles, 100% and the platinum',
    text: 'Sweep the collectibles (card sets, 100 WAiNK spots, full map exploration), finish whatever the 100% checklist still wants, catch the hidden night-time encounter, and A Long Road unlocks — which completes the set and pops Vice Got a Price!, the platinum.' },
];

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
let earned = new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]'));

const params = new URLSearchParams(location.search);
if (params.get('grade')) gradeEl.value = params.get('grade');
if (params.get('kind')) kindEl.value = params.get('kind');

function save() {
  localStorage.setItem(KEY, JSON.stringify([...earned]));
}

function gradeCounts() {
  const counts = {};
  for (const t of trophies) {
    counts[t.grade] ??= { have: 0, total: 0 };
    counts[t.grade].total += 1;
    if (earned.has(t.id)) counts[t.grade].have += 1;
  }
  return counts;
}

function renderHeader() {
  document.getElementById('progress-fill').style.width = `${(earned.size / trophies.length) * 100}%`;
  document.getElementById('progress-text').textContent = `${earned.size} of ${trophies.length} earned`;
  const next = trophies.find(t => !earned.has(t.id));
  document.getElementById('next-up').textContent = next
    ? `Next up: ${next.name} — ${next.description}`
    : 'Every trophy earned. Leonida Legend status: confirmed.';
  const chips = document.getElementById('grade-chips');
  chips.replaceChildren();
  for (const [grade, c] of Object.entries(gradeCounts())) {
    const s = document.createElement('span');
    s.className = 'chip';
    s.textContent = `${grade}: ${c.have}/${c.total}`;
    chips.append(s);
  }
}

function renderRoadmap() {
  const wrap = document.getElementById('stages');
  wrap.replaceChildren();
  for (const st of STAGES) {
    const div = document.createElement('div');
    div.className = 'stage';
    const h = document.createElement('h3');
    h.textContent = st.title;
    const p = document.createElement('p');
    p.textContent = st.text;
    const names = document.createElement('p');
    names.className = 'names';
    names.textContent = trophies.filter(t => t.stage === st.n).map(t => t.name).join(' · ');
    div.append(h, p, names);
    wrap.append(div);
  }
  const list = document.getElementById('missable-list');
  list.replaceChildren();
  for (const t of trophies.filter(t => t.missable)) {
    const li = document.createElement('li');
    const b = document.createElement('strong');
    b.textContent = t.name + ' — ';
    li.append(b, document.createTextNode(t.guide.split('. ')[0] + '.'));
    list.append(li);
  }
}

function matches(t) {
  if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
  if (kindEl.value === 'missable' && !t.missable) return false;
  if (kindEl.value !== 'all' && kindEl.value !== 'missable' && t.kind !== kindEl.value) return false;
  if (hideEarnedEl.checked && earned.has(t.id)) return false;
  const q = searchEl.value.trim().toLowerCase();
  if (q && !`${t.name} ${t.description} ${t.guide}`.toLowerCase().includes(q)) return false;
  return true;
}

function render() {
  renderHeader();
  cardsEl.replaceChildren();
  let shown = 0;
  for (const t of trophies) {
    if (!matches(t)) continue;
    shown += 1;
    const isEarned = earned.has(t.id);
    const hiddenBySpoiler = spoilersEl.checked && t.kind === 'story' && !isEarned;
    const card = document.createElement('article');
    card.className = `card ${t.grade}${isEarned ? ' earned' : ''}`;

    const top = document.createElement('div');
    top.className = 'card-top';
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = isEarned;
    box.setAttribute('aria-label', `Mark ${t.name} as earned`);
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.id); else earned.delete(t.id);
      save();
      render();
    });
    const h = document.createElement('h3');
    h.textContent = hiddenBySpoiler ? 'Hidden story trophy' : t.name;
    top.append(box, h);
    card.append(top);

    const badges = document.createElement('div');
    badges.className = 'badges';
    const mk = (cls, text) => {
      const s = document.createElement('span');
      s.className = `badge ${cls}`;
      s.textContent = text;
      return s;
    };
    badges.append(mk(`grade-${t.grade}`, t.grade), mk('', t.kind), mk('stage', `Stage ${t.stage}`));
    if (t.missable) badges.append(mk('missable', 'Missable'));
    card.append(badges);

    if (hiddenBySpoiler) {
      const note = document.createElement('p');
      note.className = 'hidden-note';
      note.textContent = 'Spoiler shield on: this story trophy stays hidden until you earn it. Tick the box when it pops.';
      card.append(note);
    } else {
      const desc = document.createElement('p');
      desc.className = 'desc';
      desc.textContent = `“${t.description}”`;
      const guide = document.createElement('p');
      guide.className = 'guide';
      guide.textContent = t.guide;
      const source = document.createElement('p');
      source.className = 'source';
      source.textContent = `Sources: ${t.source}`;
      card.append(desc, guide, source);
    }
    cardsEl.append(card);
  }
  document.getElementById('shown-count').textContent = `Showing ${shown} of ${trophies.length} trophies`;
  emptyEl.hidden = shown !== 0;
  if (shown === 0) {
    emptyEl.textContent = kindEl.value === 'online'
      ? 'The official PS5 list for GTA VI has no online trophies — every one of the 55 is earned in single player. Pick another kind to keep browsing.'
      : 'No trophies match these filters. Loosen the search or reset a filter to see more.';
  }
}

document.getElementById('export').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify({ earned: [...earned] }, null, 1)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'leonida-legend-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
document.getElementById('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    const ids = Array.isArray(parsed) ? parsed : parsed.earned;
    earned = new Set(ids.filter(id => trophies.some(t => t.id === id)));
    save();
    render();
  } catch {
    emptyEl.hidden = false;
    emptyEl.textContent = 'That file could not be read as a progress export.';
  }
});
document.getElementById('reset').addEventListener('click', () => {
  earned = new Set();
  save();
  render();
});
for (const el of [gradeEl, kindEl, spoilersEl, hideEarnedEl]) el.addEventListener('change', render);
searchEl.addEventListener('input', render);

// Pressing "/" anywhere outside a form field jumps straight to the search box.
document.addEventListener('keydown', (e) => {
  const tag = document.activeElement?.tagName;
  if (e.key === '/' && tag !== 'INPUT' && tag !== 'SELECT' && tag !== 'TEXTAREA') {
    e.preventDefault();
    searchEl.focus();
  }
});

renderRoadmap();
render();
