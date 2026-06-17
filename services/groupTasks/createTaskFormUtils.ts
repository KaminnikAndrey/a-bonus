/** Парсинг дд.мм.гг / дд.мм.гггг → ISO `YYYY-MM-DD`. */
export function parseDdMmYyToIso(input: string): string | null {
  const t = input.trim();
  const m = t.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2}|\d{4})$/);
  if (!m) return null;
  const d = parseInt(m[1], 10);
  const mo = parseInt(m[2], 10);
  let y = parseInt(m[3], 10);
  if (y < 100) y += 2000;
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export function todayIsoLocal(): string {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
}

export function buildTaskRewardLine(coins: string, expLead: string): string {
  const c = coins.trim();
  const e = expLead.trim();
  const coinPart = c ? `${c} коинов` : '0 коинов';
  if (e) return `${coinPart} + ${e} EXP первым трем!`;
  return coinPart;
}

export function parseTaskRewardLine(reward: string): { coins: string; expLead: string } {
  const coinsM = reward.match(/(\d+)\s*коинов?/i);
  const expM = reward.match(/(\d+)\s*EXP/i);
  return { coins: coinsM?.[1] ?? '', expLead: expM?.[1] ?? '' };
}

/** ISO `YYYY-MM-DD` → дд.мм.гг для полей формы. */
export function isoToDdMmYy(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return '';
  return `${String(d).padStart(2, '0')}.${String(m).padStart(2, '0')}.${String(y).slice(-2)}`;
}
