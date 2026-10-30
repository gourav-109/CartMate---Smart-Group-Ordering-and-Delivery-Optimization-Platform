import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { toDatetimeLocalValue } from './datetimeLocal.js';

describe('toDatetimeLocalValue', () => {
  it('keeps a future local deadline in the future when parsed as datetime-local', () => {
    const now = Date.now();
    const fiveHoursOut = new Date(now + 5 * 60 * 60 * 1000);

    const localValue = toDatetimeLocalValue(fiveHoursOut);
    const parsedAsDatetimeLocal = new Date(localValue);

    assert.match(localValue, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    assert.ok(parsedAsDatetimeLocal.getTime() > now, 'default deadline must still be in the future');
    assert.equal(parsedAsDatetimeLocal.getFullYear(), fiveHoursOut.getFullYear());
    assert.equal(parsedAsDatetimeLocal.getMonth(), fiveHoursOut.getMonth());
    assert.equal(parsedAsDatetimeLocal.getDate(), fiveHoursOut.getDate());
    assert.equal(parsedAsDatetimeLocal.getHours(), fiveHoursOut.getHours());
    assert.equal(parsedAsDatetimeLocal.getMinutes(), fiveHoursOut.getMinutes());
  });

  it('does not use the UTC toISOString slice that expires IST deadlines', () => {
    const now = Date.now();
    const fiveHoursOut = new Date(now + 5 * 60 * 60 * 1000);
    const offsetMinutes = fiveHoursOut.getTimezoneOffset();

    // Only assert the regression where local time is ahead of UTC (e.g. IST).
    if (offsetMinutes >= 0) return;

    const buggyValue = fiveHoursOut.toISOString().slice(0, 16);
    const buggyParsed = new Date(buggyValue);
    const fixedParsed = new Date(toDatetimeLocalValue(fiveHoursOut));

    assert.ok(
      buggyParsed.getTime() <= now,
      'UTC slice of a +5h deadline is already in the past in IST-like zones'
    );
    assert.ok(fixedParsed.getTime() > now);
  });
});
