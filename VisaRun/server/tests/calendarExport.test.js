import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildDeadlineIcs,
  calculateDeadlineDate,
} from '../../src/utils/calendarExport.ts';

test('calculateDeadlineDate adds day limit to entry date', () => {
  assert.equal(calculateDeadlineDate('2026-01-01', 45), '2026-02-15');
});

test('calculateDeadlineDate returns null for invalid input', () => {
  assert.equal(calculateDeadlineDate('', 45), null);
  assert.equal(calculateDeadlineDate('2026-01-01', 0), null);
});

test('buildDeadlineIcs returns valid calendar payload', () => {
  const ics = buildDeadlineIcs({
    entryDate: '2026-01-01',
    dayLimit: 45,
    location: 'Vietnam',
    title: 'Visa deadline',
    description: 'Exit before this date',
  });

  assert.ok(ics);
  assert.match(ics, /BEGIN:VCALENDAR/);
  assert.match(ics, /BEGIN:VEVENT/);
  assert.match(ics, /DTSTART;VALUE=DATE:20260215/);
  assert.match(ics, /SUMMARY:Visa deadline/);
});
