import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';

/** Exercise the actual generated bootstrap, without executing any third-party code. */
export function checkAnalytics(html, site, hostname) {
  const errors = [];
  const code = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(match => match[1]).find(value => value.includes('metrika/tag.js'));
  if (!site.analytics.privacyApproved || !site.analytics.yandexId) return code ? ['Unexpected analytics bootstrap'] : [];
  if (!code) return ['Missing analytics bootstrap'];
  const key = 'agubanovv:analytics-consent';
  const valid = { version: site.legal.consentVersion, accepted: true, at: Date.now() - 1000 };
  function harness(choice, host = hostname, blocked = false) {
    const inserted = [];
    const elements = {};
    const listeners = {};
    const storage = {};
    for (const [method, fn] of Object.entries({
      getItem: name => { if (blocked) throw Error('Storage denied'); return storage[name] ?? null; },
      setItem: (name, value) => { if (blocked) throw Error('Storage denied'); storage[name] = value; },
      removeItem: name => { if (blocked) throw Error('Storage denied'); delete storage[name]; },
    })) Object.defineProperty(storage, method, { value: fn });
    storage.theme = 'dark';
    if (choice !== undefined) storage[key] = typeof choice === 'string' ? choice : JSON.stringify(choice);
    for (const selector of ['[data-cookie-notice]', '[data-cookie-accept]', '[data-cookie-decline]', '[data-cookie-settings]']) {
      elements[selector] = { hidden: true, offsetHeight: 77, events: {}, addEventListener(type, fn) { this.events[type] = fn; }, focus() {} };
    }
    let reloads = 0;
    const measured = {};
    const context = {
      location: { hostname: host, href: 'https://' + host + '/', reload: () => reloads++ },
      localStorage: storage,
      document: {
        documentElement: { style: { setProperty: (name, value) => { measured[name] = value; } } },
        scripts: [], cookie: '', referrer: '', hidden: false,
        querySelector: selector => elements[selector],
        querySelectorAll: selector => elements[selector] ? [elements[selector]] : [],
        createElement: () => ({}),
        getElementsByTagName: () => [{ parentNode: { insertBefore: node => inserted.push(node.src) } }],
        addEventListener: (type, fn) => { listeners[type] = fn; },
      },
      addEventListener: (type, fn) => { listeners[type] = fn; },
    };
    context.window = context;
    runInNewContext(code, context, { timeout: 1000 });
    return { context, storage, inserted, elements, listeners, measured, reloads: () => reloads, click: name => elements[`[data-cookie-${name}]`].events.click() };
  }
  try {
    const first = harness();
    assert.equal(first.inserted.length, 0, 'No tracker before choice');
    assert.equal(first.elements['[data-cookie-notice]'].hidden, false);
    assert.equal(first.measured['--cookie-notice-height'], '77px', 'Actual wrapped band height reaches the root');
    first.click('decline');
    assert.equal(first.inserted.length, 0, 'No tracker after refusal');
    assert.equal(first.measured['--cookie-notice-height'], '0px', 'Hidden band releases its scroll offset');
    assert.equal(JSON.parse(first.storage[key]).accepted, false);
    assert.equal(first.storage.theme, 'dark', 'Theme survives cleanup');
    first.click('settings');
    assert.equal(first.elements['[data-cookie-notice]'].hidden, false);
    first.click('accept');
    assert.equal(first.inserted[0], `https://mc.yandex.ru/metrika/tag.js?id=${site.analytics.yandexId}`);
    assert.equal(first.context.ym.a[0][0], site.analytics.yandexId);
    assert.equal(first.context.ym.a[0][1], 'init');
    assert.equal(first.context.ym.a[0][2].webvisor, true);
    assert.equal(first.context.ym.a[0][2].params.analyticsConsent.version, site.legal.consentVersion);
    first.click('accept');
    assert.equal(first.inserted.length, 1, 'No duplicate tracker');
    first.click('decline');
    assert.equal(first.context.ym.a.at(-1)[1], 'destruct', 'Counter stops on withdrawal');
    assert.equal(first.reloads(), 1, 'Reload unloads third-party handlers');
    assert.equal(JSON.parse(first.storage[key]).accepted, false);
    assert.equal(harness(valid).inserted.length, 1, 'Valid consent survives navigation');
    for (const choice of [
      { ...valid, accepted: false }, { ...valid, version: 'old' },
      { ...valid, at: Date.now() - site.legal.consentDays * 86400000 - 1000 },
      { ...valid, at: Date.now() + 86400000 }, { ...valid, accepted: 'true' },
      { ...valid, at: 'invalid' }, '{broken json',
    ]) assert.equal(harness(choice).inserted.length, 0, 'Invalid/refused/expired consent blocks analytics');
    const local = harness(valid, '127.0.0.1');
    local.click('accept');
    assert.equal(local.inserted.length, 0, 'Localhost never initializes a tracker');
    const blocked = harness(undefined, hostname, true);
    assert.equal(blocked.inserted.length, 0);
    blocked.click('accept');
    assert.equal(blocked.inserted.length, 1, 'Explicit current-page consent works with blocked storage');
    const otherTab = harness(valid);
    otherTab.storage[key] = JSON.stringify({ ...valid, accepted: false });
    otherTab.listeners.storage({ key });
    assert.equal(otherTab.reloads(), 1, 'Withdrawal propagates across tabs');
  } catch (error) { errors.push(`Consent integration failed: ${error.message}`); }
  if (!errors.length) console.log('Analytics consent checks passed: default/refusal, approval, withdrawal, expiry, storage and tabs.');
  return errors;
}
