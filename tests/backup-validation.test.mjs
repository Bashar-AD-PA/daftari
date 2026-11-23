import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync('index.html', 'utf8');
const start = html.indexOf('function validateBackup(d) {');
const end = html.indexOf('\nfunction replaceAllData(d)', start);
assert.notEqual(start, -1, 'validateBackup must exist in index.html');
assert.notEqual(end, -1, 'validateBackup boundary must exist in index.html');
const validateBackup = vm.runInNewContext(html.slice(start, end) + '\nvalidateBackup', {});

function validBackup() {
  return {
    app: 'daftari',
    version: 1,
    currencies: [{ id: 1, name: 'محلي', symbol: 'ر.ي' }],
    accounts: [{ id: 1, name: 'عميل تجريبي' }],
    categories: [{ id: 1, name: 'مبيعات' }],
    transactions: [{
      id: 1, account_id: 1, currency_id: 1, category_id: 1,
      amount: 1250, type: 1, date: '2026-11-23', photo: null
    }]
  };
}

test('accepts a valid version 1 local backup', () => {
  assert.doesNotThrow(() => validateBackup(validBackup()));
});

test('rejects impossible calendar dates', () => {
  const data = validBackup();
  data.transactions[0].date = '2026-02-31';
  assert.throws(() => validateBackup(data));
});

test('rejects duplicate transaction identifiers', () => {
  const data = validBackup();
  data.transactions.push({ ...data.transactions[0] });
  assert.throws(() => validateBackup(data));
});

test('rejects transactions linked to missing accounts', () => {
  const data = validBackup();
  data.transactions[0].account_id = 999;
  assert.throws(() => validateBackup(data));
});

test('rejects non-image attachment payloads', () => {
  const data = validBackup();
  data.transactions[0].photo = 'data:text/html;base64,PHNjcmlwdD4=';
  assert.throws(() => validateBackup(data));
});
