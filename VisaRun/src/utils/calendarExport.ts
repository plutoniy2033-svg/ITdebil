export interface CalendarEventInput {
  entryDate: string;
  dayLimit: number;
  location?: string;
  title?: string;
  description?: string;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function formatIcsDate(date: Date): string {
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}`;
}

function formatIcsDateTime(date: Date): string {
  return `${formatIcsDate(date)}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
}

function escapeIcsText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

export function calculateDeadlineDate(entryDate: string, dayLimit: number): string | null {
  if (!entryDate || dayLimit <= 0) return null;
  const [year, month, day] = entryDate.split('-').map(Number);
  if (!year || !month || !day) return null;

  const deadline = new Date(Date.UTC(year, month - 1, day + dayLimit));
  return deadline.toISOString().slice(0, 10);
}

export function buildDeadlineIcs(input: CalendarEventInput): string | null {
  const deadlineDate = calculateDeadlineDate(input.entryDate, input.dayLimit);
  if (!deadlineDate) return null;

  const [year, month, day] = deadlineDate.split('-').map(Number);
  const nextDay = new Date(Date.UTC(year, month - 1, day + 1));

  const title = input.title ?? 'VisaRun — visa deadline';
  const description =
    input.description ??
    `Last legal day in ${input.location ?? 'Vietnam'}. Plan your visa run before this date.`;
  const uid = `visarun-deadline-${input.entryDate}-${input.dayLimit}@visarun.app`;
  const now = new Date();

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//VisaRun//Deadline//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatIcsDateTime(now)}`,
    `DTSTART;VALUE=DATE:${deadlineDate.replace(/-/g, '')}`,
    `DTEND;VALUE=DATE:${nextDay.toISOString().slice(0, 10).replace(/-/g, '')}`,
    `SUMMARY:${escapeIcsText(title)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    'DESCRIPTION:Visa deadline tomorrow',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function downloadIcsFile(content: string, filename = 'visarun-deadline.ics') {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
