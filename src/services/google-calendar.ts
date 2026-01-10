// Google Calendar API連携サービス

interface CalendarEvent {
  id: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  summary?: string;
}

interface BusySlot {
  start: number; // Unix timestamp (ms)
  end: number;   // Unix timestamp (ms)
}

// 予約可能時間の設定
const BUSINESS_HOURS = {
  weekdays: { start: 10, end: 20 },  // 平日 10:00-20:00
  saturday: { start: 10, end: 20 },   // 土曜 10:00-20:00
  // 日曜は予約不可
};

// 予約前後のバッファ時間（分）
const BUFFER_MINUTES = 60;

/**
 * 日本時間の現在日付を取得 (YYYY-MM-DD)
 */
function getTodayJST(): { year: number; month: number; day: number; dateStr: string } {
  const now = new Date();
  // JSTオフセット（+9時間）を加算
  const jstTime = now.getTime() + 9 * 60 * 60 * 1000;
  const jstDate = new Date(jstTime);
  
  const year = jstDate.getUTCFullYear();
  const month = jstDate.getUTCMonth() + 1;
  const day = jstDate.getUTCDate();
  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  
  return { year, month, day, dateStr };
}

/**
 * 日付文字列にN日を加算
 */
function addDaysToDate(dateStr: string, days: number): { year: number; month: number; day: number; dateStr: string } {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  
  const newYear = date.getFullYear();
  const newMonth = date.getMonth() + 1;
  const newDay = date.getDate();
  const newDateStr = `${newYear}-${String(newMonth).padStart(2, '0')}-${String(newDay).padStart(2, '0')}`;
  
  return { year: newYear, month: newMonth, day: newDay, dateStr: newDateStr };
}

/**
 * Googleカレンダーから指定期間の予定を取得
 */
export async function getCalendarEvents(
  apiKey: string,
  calendarId: string,
  timeMin: Date,
  timeMax: Date
): Promise<CalendarEvent[]> {
  const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`);
  url.searchParams.set('key', apiKey);
  url.searchParams.set('timeMin', timeMin.toISOString());
  url.searchParams.set('timeMax', timeMax.toISOString());
  url.searchParams.set('singleEvents', 'true');
  url.searchParams.set('orderBy', 'startTime');
  url.searchParams.set('maxResults', '250');

  const response = await fetch(url.toString());
  
  if (!response.ok) {
    const error = await response.text();
    console.error('Google Calendar API error:', error);
    throw new Error(`カレンダーの取得に失敗しました: ${response.status}`);
  }

  const data = await response.json();
  console.log(`Fetched ${data.items?.length || 0} events from calendar`);
  return data.items || [];
}

/**
 * 予定から忙しい時間帯を抽出（バッファ込み）
 * 全てUTCのUnixタイムスタンプで管理
 */
export function getBusySlots(events: CalendarEvent[]): BusySlot[] {
  const slots = events.map(event => {
    const startStr = event.start.dateTime || event.start.date;
    const endStr = event.end.dateTime || event.end.date;
    
    if (!startStr || !endStr) return null;

    let startMs: number;
    let endMs: number;

    // 終日イベントの場合（dateのみ）
    if (event.start.date && !event.start.dateTime) {
      // 終日イベントは日本時間の00:00-23:59として扱う
      const [year, month, day] = event.start.date.split('-').map(Number);
      // JST 00:00 = UTC 前日15:00
      startMs = Date.UTC(year, month - 1, day, -9, 0, 0);
      
      const [endYear, endMonth, endDay] = event.end.date.split('-').map(Number);
      // 終日イベントのendは翌日なので、前日の23:59 JST = UTC 14:59
      endMs = Date.UTC(endYear, endMonth - 1, endDay, -9, 0, 0) - 1;
    } else {
      // 時刻付きイベント（dateTime形式: 2026-01-13T10:00:00+09:00）
      startMs = new Date(startStr).getTime();
      endMs = new Date(endStr).getTime();
    }

    // バッファを追加（前後1時間）
    const bufferedStart = startMs - BUFFER_MINUTES * 60 * 1000;
    const bufferedEnd = endMs + BUFFER_MINUTES * 60 * 1000;

    console.log(`Event: ${startStr} - ${endStr}`);
    console.log(`  Original: ${new Date(startMs).toISOString()} - ${new Date(endMs).toISOString()}`);
    console.log(`  Buffered: ${new Date(bufferedStart).toISOString()} - ${new Date(bufferedEnd).toISOString()}`);

    return { start: bufferedStart, end: bufferedEnd };
  }).filter((slot): slot is BusySlot => slot !== null);
  
  console.log(`Total busy slots: ${slots.length}`);
  return slots;
}

/**
 * 指定日の予約可能時間枠を取得（日本時間で計算）
 */
export function getAvailableSlots(
  dateStr: string, // YYYY-MM-DD形式（日本時間の日付）
  busySlots: BusySlot[],
  duration: number = 30
): { time: string; available: boolean }[] {
  // 日本時間でパース
  const [year, month, day] = dateStr.split('-').map(Number);
  const dayOfWeek = new Date(year, month - 1, day).getDay();
  const slots: { time: string; available: boolean }[] = [];

  // 日曜日は予約不可
  if (dayOfWeek === 0) {
    return [];
  }

  // 営業時間を取得
  const hours = dayOfWeek === 6 ? BUSINESS_HOURS.saturday : BUSINESS_HOURS.weekdays;

  // 現在時刻（日本時間）
  const today = getTodayJST();
  const isToday = dateStr === today.dateStr;
  
  // 現在の日本時間
  const nowJST = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const currentHourJST = nowJST.getUTCHours();
  const currentMinuteJST = nowJST.getUTCMinutes();

  // 30分刻みでスロットを生成
  for (let hour = hours.start; hour < hours.end; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      // 営業時間の終了時刻を超える場合はスキップ
      const slotEndHour = hour + Math.floor((minute + duration) / 60);
      const slotEndMinute = (minute + duration) % 60;
      if (slotEndHour > hours.end || (slotEndHour === hours.end && slotEndMinute > 0)) {
        continue;
      }

      // 過去の時間はスキップ（今日の場合）
      if (isToday) {
        if (hour < currentHourJST || (hour === currentHourJST && minute <= currentMinuteJST)) {
          continue;
        }
      }

      // スロットの開始・終了時刻をUTCタイムスタンプで計算（JST -> UTC）
      // JST hour:minute を UTC に変換: UTC = JST - 9時間
      const slotStartMs = Date.UTC(year, month - 1, day, hour - 9, minute, 0);
      const slotEndMs = slotStartMs + duration * 60 * 1000;
      
      // 相談前後にもバッファが必要
      // 相談開始前1時間 ～ 相談終了後1時間 が空いている必要がある
      const slotStartWithBuffer = slotStartMs - BUFFER_MINUTES * 60 * 1000;
      const slotEndWithBuffer = slotEndMs + BUFFER_MINUTES * 60 * 1000;

      // 忙しい時間帯と重なっていないかチェック（バッファ込み）
      const isAvailable = !busySlots.some(busy => {
        // 相談スロット（バッファ込み）と予定（バッファ込み）が重なるかチェック
        const overlaps = slotStartWithBuffer < busy.end && slotEndWithBuffer > busy.start;
        return overlaps;
      });

      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push({ time: timeStr, available: isAvailable });
    }
  }

  return slots;
}

/**
 * 指定期間の予約可能日を取得
 */
export async function getAvailableDates(
  apiKey: string,
  calendarId: string,
  startDate: Date,
  days: number = 60,
  duration: number = 30
): Promise<{ date: string; dayOfWeek: number; hasSlots: boolean; slots: { time: string; available: boolean }[] }[]> {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + days);

  // カレンダーイベントを取得
  const events = await getCalendarEvents(apiKey, calendarId, startDate, endDate);
  const busySlots = getBusySlots(events);

  const result: { date: string; dayOfWeek: number; hasSlots: boolean; slots: { time: string; available: boolean }[] }[] = [];

  // 日本時間の今日を取得
  const today = getTodayJST();
  
  for (let i = 0; i < days; i++) {
    const targetDate = addDaysToDate(today.dateStr, i);
    const { year, month, day, dateStr } = targetDate;
    
    const dayOfWeek = new Date(year, month - 1, day).getDay();
    
    // 日曜日はスキップ
    if (dayOfWeek === 0) {
      continue;
    }

    const slots = getAvailableSlots(dateStr, busySlots, duration);
    const availableSlots = slots.filter(s => s.available);

    result.push({
      date: dateStr,
      dayOfWeek,
      hasSlots: availableSlots.length > 0,
      slots
    });
  }

  return result;
}

/**
 * 日本の祝日を取得（簡易版）
 */
export async function getJapaneseHolidays(year: number): Promise<Set<string>> {
  try {
    const response = await fetch(`https://holidays-jp.github.io/api/v1/${year}/date.json`);
    if (!response.ok) return new Set();
    const data = await response.json();
    return new Set(Object.keys(data));
  } catch {
    return new Set();
  }
}

/**
 * 予約料金を計算
 */
export function calculatePrice(duration: number): number {
  if (duration === 30) return 3000;
  if (duration === 60) return 5000;
  return 3000;
}

/**
 * 日付をフォーマット
 */
export function formatDateJa(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  return `${month}月${day}日(${weekdays[date.getDay()]})`;
}
