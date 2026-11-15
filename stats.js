// Pure stats functions. No DOM. Entry: { id, ts, bags, cleaned, restarted, note }
export const DAY = 86400000;

export const refillsOf = (entries) =>
  entries.filter((e) => e.bags > 0).sort((a, b) => a.ts - b.ts);

// bags_i were consumed between refill i and refill i+1
// skipRestarts: drop intervals that ended with a restarted refill (outage = hopper ran empty, rate is biased)
export function intervalsOf(entries, skipRestarts = false) {
  const rs = refillsOf(entries);
  const out = [];
  for (let i = 0; i < rs.length - 1; i++) {
    const dt = (rs[i + 1].ts - rs[i].ts) / DAY;
    const restarted = !!rs[i + 1].restarted;
    if (dt > 0 && !(skipRestarts && restarted)) out.push({ bags: rs[i].bags, start: rs[i].ts, end: rs[i + 1].ts, dt, restarted });
  }
  return out;
}

// Plain average bags/day over the given entries (already filtered to a range)
export function plainRate(entries, skipRestarts = false) {
  const iv = intervalsOf(entries, skipRestarts);
  const bags = iv.reduce((s, x) => s + x.bags, 0);
  const days = iv.reduce((s, x) => s + x.dt, 0);
  return days > 0 ? bags / days : null;
}

// Weighted average: older intervals count linearly less (floor 5%)
export function weightedRate(entries, horizonDays, now = Date.now(), skipRestarts = false) {
  const iv = intervalsOf(entries, skipRestarts);
  let num = 0, den = 0;
  for (const x of iv) {
    const age = (now - (x.start + x.end) / 2) / DAY;
    const w = Math.max(0.05, 1 - Math.max(0, age) / horizonDays);
    num += w * x.bags;
    den += w * x.dt;
  }
  return den > 0 ? num / den : null;
}

// Days and bags since the last cleaning (null if never cleaned)
export function sinceClean(entries, now = Date.now()) {
  const cleans = entries.filter((e) => e.cleaned).sort((a, b) => b.ts - a.ts);
  if (!cleans.length) return null;
  const ts = cleans[0].ts;
  const bags = entries.filter((e) => e.ts >= ts).reduce((s, e) => s + e.bags, 0);
  return { ts, days: (now - ts) / DAY, bags };
}

// Next refill estimate based on all entries
export function predict(entries, rate, { levelAfter } = {}) {
  const rs = refillsOf(entries);
  if (!rate || rs.length < 2) return null;
  const last = rs[rs.length - 1];
  const level = Number(levelAfter) > 0 ? Number(levelAfter) : last.bags;
  const basis = Number(levelAfter) > 0 ? 'level' : 'routine';
  const gaps = intervalsOf(entries).slice(-5).map((x) => x.dt);
  const gap = gaps.reduce((s, x) => s + x, 0) / gaps.length;
  return {
    ts: last.ts + (level / rate) * DAY,
    bags: Math.max(1, Math.round(rate * gap)),
    basis,
  };
}
