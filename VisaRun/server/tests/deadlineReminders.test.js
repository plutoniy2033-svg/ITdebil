import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateDeadlineReminder,
  isNotificationTimeReached,
} from '../../src/utils/deadlineReminders.ts';

const baseInput = {
  entryDate: '2026-01-01',
  daysRemaining: 7,
  isOverstay: false,
  overstayDays: 0,
  reminders: { days14: true, days7: true, days3: true, days1: true },
  criticalAlerts: false,
  notificationTime: '10:00',
  lastSentKey: null,
};

test('isNotificationTimeReached returns false before scheduled time', () => {
  const now = new Date('2026-07-12T09:30:00');
  assert.equal(isNotificationTimeReached('10:00', now), false);
});

test('isNotificationTimeReached returns true at scheduled time', () => {
  const now = new Date('2026-07-12T10:00:00');
  assert.equal(isNotificationTimeReached('10:00', now), true);
});

test('evaluateDeadlineReminder respects notification time', () => {
  const result = evaluateDeadlineReminder({
    ...baseInput,
    now: new Date('2026-07-12T09:00:00'),
  });
  assert.equal(result, null);
});

test('evaluateDeadlineReminder triggers enabled threshold', () => {
  const result = evaluateDeadlineReminder({
    ...baseInput,
    now: new Date('2026-07-12T10:15:00'),
  });

  assert.ok(result);
  assert.equal(result.type, 'deadline');
  assert.equal(result.dedupeKey, 'days7:2026-07-12:7');
});

test('evaluateDeadlineReminder deduplicates same day trigger', () => {
  const result = evaluateDeadlineReminder({
    ...baseInput,
    now: new Date('2026-07-12T11:00:00'),
    lastSentKey: 'days7:2026-07-12:7',
  });

  assert.equal(result, null);
});

test('evaluateDeadlineReminder sends critical alert within 48 hours', () => {
  const result = evaluateDeadlineReminder({
    ...baseInput,
    daysRemaining: 2,
    criticalAlerts: true,
    reminders: { days14: false, days7: false, days3: false, days1: false },
    now: new Date('2026-07-12T10:30:00'),
  });

  assert.ok(result);
  assert.equal(result.type, 'critical');
  assert.equal(result.dedupeKey, 'critical:2026-07-12:2');
});

test('evaluateDeadlineReminder sends overstay notification', () => {
  const result = evaluateDeadlineReminder({
    ...baseInput,
    daysRemaining: -3,
    isOverstay: true,
    overstayDays: 3,
    now: new Date('2026-07-12T10:30:00'),
  });

  assert.ok(result);
  assert.equal(result.type, 'overstay');
  assert.equal(result.dedupeKey, 'overstay:2026-07-12');
});
