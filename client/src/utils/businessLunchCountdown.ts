import { useSyncExternalStore } from 'react';

/** Ресторан в Гомеле — часы бизнес-ланча в часовом поясе Беларуси. */
export const LUNCH_TIMEZONE = 'Europe/Minsk';

/** Пн–Пт, локальное время в LUNCH_TIMEZONE */
export const LUNCH_START_HOUR = 12;
export const LUNCH_START_MINUTE = 0;
export const LUNCH_END_HOUR = 16;
export const LUNCH_END_MINUTE = 0;

const MS_PER_SEC = 1000;
const MS_PER_MIN = 60 * MS_PER_SEC;
const MS_PER_HOUR = 60 * MS_PER_MIN;
const MS_PER_DAY = 24 * MS_PER_HOUR;

/** 0 = вс … 6 = сб */
const RU_DOW: readonly string[] = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function wallClockString(t: number, timeZone: string): string {
  return new Date(t).toLocaleString('sv-SE', { timeZone, hour12: false });
}

/** UTC-момент, когда в `timeZone` наступает указанная стена даты/времени. */
function utcAtWallClock(
  y: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  timeZone: string
): number {
  const want = `${y}-${pad2(month)}-${pad2(day)} ${pad2(hour)}:${pad2(minute)}:${pad2(second)}`;
  let lo = Date.UTC(y, month - 1, day) - 48 * MS_PER_HOUR;
  let hi = Date.UTC(y, month - 1, day) + 48 * MS_PER_HOUR;
  while (lo <= hi) {
    const mid = (lo + hi) >>> 1;
    const w = wallClockString(mid, timeZone);
    if (w < want) lo = mid + 1;
    else if (w > want) hi = mid - 1;
    else return mid;
  }
  return Date.UTC(y, month - 1, day, hour - 3, minute, second);
}

type MinskWall = {
  y: number;
  month: number;
  day: number;
  dow: number;
  hour: number;
  minute: number;
  second: number;
};

function readMinskWall(now: number): MinskWall {
  const f = new Intl.DateTimeFormat('en-US', {
    timeZone: LUNCH_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const o: Record<string, string> = {};
  for (const p of f.formatToParts(new Date(now))) {
    if (p.type !== 'literal') o[p.type] = p.value;
  }
  const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const dow = map[o.weekday ?? ''] ?? 0;
  return {
    y: +o.year,
    month: +o.month,
    day: +o.day,
    dow,
    hour: +o.hour,
    minute: +o.minute,
    second: +o.second,
  };
}

function isWeekday(dow: number): boolean {
  return dow >= 1 && dow <= 5;
}

function lunchStartMsOnDate(w: Pick<MinskWall, 'y' | 'month' | 'day'>): number {
  return utcAtWallClock(w.y, w.month, w.day, LUNCH_START_HOUR, LUNCH_START_MINUTE, 0, LUNCH_TIMEZONE);
}

function lunchEndMsOnDate(w: Pick<MinskWall, 'y' | 'month' | 'day'>): number {
  return utcAtWallClock(w.y, w.month, w.day, LUNCH_END_HOUR, LUNCH_END_MINUTE, 0, LUNCH_TIMEZONE);
}

/** Календарный +n дней по стенке Minsk (якорь полдень). */
function addCalendarDays(w: MinskWall, deltaDays: number): MinskWall {
  const noon = utcAtWallClock(w.y, w.month, w.day, 12, 0, 0, LUNCH_TIMEZONE);
  return readMinskWall(noon + deltaDays * MS_PER_DAY);
}

/** Ближайший старт окна ланча строго после текущего момента (если уже внутри — сегодняшний старт). */
function nextLunchStartUtcMs(t: number): number {
  const w = readMinskWall(t);
  const startToday = lunchStartMsOnDate(w);
  const endToday = lunchEndMsOnDate(w);

  if (!isWeekday(w.dow)) {
    const skip = w.dow === 0 ? 1 : 2;
    return lunchStartMsOnDate(addCalendarDays(w, skip));
  }
  if (t < startToday) return startToday;
  if (t < endToday) return startToday;
  if (w.dow === 5) return lunchStartMsOnDate(addCalendarDays(w, 3));
  return lunchStartMsOnDate(addCalendarDays(w, 1));
}

function formatHms(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / MS_PER_SEC));
  const days = Math.floor(totalSec / 86400);
  const rem = totalSec % 86400;
  const h = Math.floor(rem / 3600);
  const m = Math.floor((rem % 3600) / 60);
  const s = rem % 60;
  const clock = `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
  if (days > 0) return `${days} д. ${clock}`;
  return clock;
}

function formatHmWall(ms: number): string {
  const w = readMinskWall(ms);
  return `${pad2(w.hour)}:${pad2(w.minute)}`;
}

/** Интервал тика: реже, если до смены текста > суток (достаточно минутной точности). */
function tickMsForCountdownRemaining(remainingMs: number): number {
  return remainingMs >= MS_PER_DAY ? MS_PER_MIN * 60 : MS_PER_SEC;
}

function computeBusinessLunchDisplay(now: Date): { line: string; tickMs: number } {
  const t = now.getTime();
  const w = readMinskWall(t);
  const windowLabel = `Пн–Пт ${pad2(LUNCH_START_HOUR)}:${pad2(LUNCH_START_MINUTE)}–${pad2(
    LUNCH_END_HOUR
  )}:${pad2(LUNCH_END_MINUTE)}`;

  if (isWeekday(w.dow)) {
    const start = lunchStartMsOnDate(w);
    const end = lunchEndMsOnDate(w);
    if (t >= start && t < end) {
      const rem = end - t;
      return {
        line: `Бизнес-ланч ${windowLabel} · до ${pad2(LUNCH_END_HOUR)}:${pad2(
          LUNCH_END_MINUTE
        )} осталось ${formatHms(rem)}`,
        tickMs: tickMsForCountdownRemaining(rem),
      };
    }
    if (t < start) {
      const rem = start - t;
      return {
        line: `Бизнес-ланчи ${windowLabel} · до начала ${formatHms(rem)}`,
        tickMs: tickMsForCountdownRemaining(rem),
      };
    }
    const next = nextLunchStartUtcMs(t);
    const nextW = readMinskWall(next);
    const tomorrowWall = addCalendarDays(w, 1);
    const isTomorrow =
      nextW.y === tomorrowWall.y && nextW.month === tomorrowWall.month && nextW.day === tomorrowWall.day;
    const whenRu = isTomorrow ? `завтра в ${formatHmWall(next)}` : `${RU_DOW[nextW.dow]} в ${formatHmWall(next)}`;
    const rem = next - t;
    return {
      line: `Бизнес-ланчи ${windowLabel} · следующий ${whenRu}, через ${formatHms(rem)}`,
      tickMs: tickMsForCountdownRemaining(rem),
    };
  }

  const next = nextLunchStartUtcMs(t);
  const nextW = readMinskWall(next);
  const rem = next - t;
  return {
    line: `Бизнес-ланчи ${windowLabel} · следующий ${RU_DOW[nextW.dow]} в ${formatHmWall(
      next
    )}, через ${formatHms(rem)}`,
    tickMs: tickMsForCountdownRemaining(rem),
  };
}

/** Одна строка для подписи бизнес-ланча (герой / контакты). */
export function formatBusinessLunchLine(now: Date = new Date()): string {
  return computeBusinessLunchDisplay(now).line;
}

let storeLine = computeBusinessLunchDisplay(new Date()).line;
const listeners = new Set<() => void>();
let scheduleTimeoutId: number | null = null;

function runScheduledTick() {
  scheduleTimeoutId = null;
  if (listeners.size === 0) return;
  const { line, tickMs } = computeBusinessLunchDisplay(new Date());
  if (line !== storeLine) {
    storeLine = line;
    listeners.forEach((fn) => fn());
  }
  scheduleTimeoutId = window.setTimeout(runScheduledTick, tickMs);
}

function subscribeCountdown(onChange: () => void) {
  listeners.add(onChange);
  if (listeners.size === 1) {
    runScheduledTick();
  }
  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0 && scheduleTimeoutId != null) {
      window.clearTimeout(scheduleTimeoutId);
      scheduleTimeoutId = null;
    }
  };
}

function getCountdownSnapshot() {
  return storeLine;
}

function getCountdownServerSnapshot() {
  return computeBusinessLunchDisplay(new Date()).line;
}

/** Одна подписка на клиенте; подписчики — только компоненты с этим хуком (не весь App). */
export function useBusinessLunchCountdown(): string {
  return useSyncExternalStore(subscribeCountdown, getCountdownSnapshot, getCountdownServerSnapshot);
}
