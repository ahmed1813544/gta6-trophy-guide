// Platinum pace panel: a small live summary that sits under the roadmap and
// answers the one question the checklist itself does not — how fast is this
// run actually moving, and what is left between here and the platinum?
//
// It reads the same localStorage key as the tracker, so every checkbox tick
// is reflected the next time the panel refreshes. It never writes progress;
// the tracker stays the single owner of the saved set.

const KEY = 'leonida-legend-progress-v1';
const GRADES = ['platinum', 'gold', 'silver', 'bronze'];
const STAGE_COUNT = 5;

const panel = document.getElementById('pace-panel');

function readEarned() {
  try {
    const raw = localStorage.getItem(KEY);
    const ids = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(ids) ? ids : []);
  } catch {
    return new Set();
  }
}

function tally(trophies, earned) {
  const perGrade = {};
  for (const grade of GRADES) perGrade[grade] = { have: 0, total: 0 };
  const perStage = Array.from({ length: STAGE_COUNT }, () => ({ have: 0, total: 0 }));
  for (const t of trophies) {
    const got = earned.has(t.id);
    if (perGrade[t.grade]) {
      perGrade[t.grade].total += 1;
      if (got) perGrade[t.grade].have += 1;
    }
    const slot = perStage[t.stage - 1];
    if (slot) {
      slot.total += 1;
      if (got) slot.have += 1;
    }
  }
  return { perGrade, perStage };
}

function verdict(percent, remaining) {
  if (remaining === 0) return 'Platinum pace: done. Vice Got a Price! is yours — screenshot it.';
  if (percent >= 75) return 'Platinum pace: endgame. Only the cleanup stands between you and the platinum.';
  if (percent >= 50) return 'Platinum pace: strong. Past halfway — keep the grinds ticking over between story beats.';
  if (percent >= 25) return 'Platinum pace: building. The roadmap order is doing the heavy lifting now.';
  if (percent > 0) return 'Platinum pace: early days. Story first, missables caught as they pass.';
  return 'Platinum pace: not started. Tick off your first trophy and this panel wakes up.';
}

function render(trophies) {
  if (!panel) return;
  const earned = readEarned();
  const { perGrade, perStage } = tally(trophies, earned);
  const total = trophies.length;
  const have = trophies.filter((t) => earned.has(t.id)).length;
  const remaining = total - have;
  const percent = total ? Math.round((have / total) * 100) : 0;

  const currentStage = perStage.findIndex((s) => s.have < s.total) + 1;
  const stageLine = remaining === 0
    ? 'Every roadmap stage is complete.'
    : `You are on stage ${currentStage} of ${STAGE_COUNT}, with ${perStage[currentStage - 1].total - perStage[currentStage - 1].have} trophies left in it.`;

  const gradeBits = GRADES
    .filter((g) => perGrade[g].total > 0)
    .map((g) => `${g}: ${perGrade[g].have}/${perGrade[g].total}`)
    .join(' · ');

  panel.innerHTML = '';

  const heading = document.createElement('h2');
  heading.textContent = 'Platinum pace';
  panel.append(heading);

  const summary = document.createElement('p');
  summary.className = 'pace-summary';
  summary.textContent = `${have} of ${total} earned (${percent}%), ${remaining} to go. ${stageLine}`;
  panel.append(summary);

  const grades = document.createElement('p');
  grades.className = 'pace-grades';
  grades.textContent = gradeBits;
  panel.append(grades);

  const tip = document.createElement('p');
  tip.className = 'pace-verdict';
  tip.textContent = verdict(percent, remaining);
  panel.append(tip);
}

async function boot() {
  if (!panel) return;
  try {
    const doc = await (await fetch('data/trophies.json')).json();
    const trophies = doc.trophies;
    render(trophies);
    // The tracker saves in this same tab, so no storage event fires here;
    // poll the raw saved value cheaply and repaint only when it changes.
    let lastRaw = localStorage.getItem(KEY);
    setInterval(() => {
      const raw = localStorage.getItem(KEY);
      if (raw !== lastRaw) {
        lastRaw = raw;
        render(trophies);
      }
    }, 1500);
  } catch {
    panel.hidden = true;
  }
}

boot();
