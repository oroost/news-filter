'use strict';

let rules = [];
let globalEnabled = true;

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function showStatus(msg, isError = false) {
  const el = document.getElementById('status');
  el.textContent = msg;
  el.className = 'status ' + (isError ? 'error' : 'ok');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => { el.textContent = ''; el.className = 'status'; }, 2500);
}

function renderRules() {
  const list = document.getElementById('rulesList');
  const empty = document.getElementById('emptyState');

  Array.from(list.querySelectorAll('.rule-item')).forEach(el => el.remove());

  if (rules.length === 0) {
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  rules.forEach((rule, index) => {
    const item = document.createElement('div');
    item.className = 'rule-item' + (rule.enabled ? '' : ' rule-disabled');

    item.innerHTML = `
      <label class="toggle small" title="Enable this rule">
        <input type="checkbox" class="rule-toggle" data-index="${index}" ${rule.enabled ? 'checked' : ''} />
        <span class="slider"></span>
      </label>
      <div class="rule-pair">
        <span class="rule-find">${escapeHtml(rule.find)}</span>
        <span class="rule-arrow">→</span>
        <span class="rule-replace">${rule.replace !== '' ? escapeHtml(rule.replace) : '<em>delete</em>'}</span>
      </div>
      <div class="rule-badges">
        ${rule.caseSensitive ? '<span class="badge" title="Case-sensitive">Aa</span>' : ''}
        ${rule.wholeWord ? '<span class="badge" title="Whole word">W</span>' : ''}
        ${rule.sites && rule.sites.length ? rule.sites.map(s => `<span class="badge site-badge" title="Site filter">${escapeHtml(s)}</span>`).join('') : ''}
      </div>
      <button class="btn-delete" data-index="${index}" title="Delete rule">✕</button>
    `;
    list.appendChild(item);
  });
}

function saveRules(callback) {
  chrome.storage.sync.set({ rules, enabled: globalEnabled }, () => {
    if (callback) callback();
  });
}

function renderPacks() {
  const list = document.getElementById('packsList');
  list.innerHTML = '';
  RULE_PACKS.forEach(pack => {
    const loadedCount = pack.rules.filter(pr => rules.some(r => r.find === pr.find)).length;
    const allLoaded = loadedCount === pack.rules.length;
    const card = document.createElement('div');
    card.className = 'pack-card';
    card.innerHTML = `
      <div class="pack-header">
        <span class="pack-emoji">${pack.emoji}</span>
        <div class="pack-info">
          <div class="pack-name">${escapeHtml(pack.name)}</div>
          <div class="pack-desc">${escapeHtml(pack.description)}</div>
        </div>
        <button class="btn-load-pack${allLoaded ? ' loaded' : ''}" data-pack-id="${pack.id}">
          ${allLoaded ? '✓ Loaded' : `Load (${pack.rules.length})`}
        </button>
      </div>
      <div class="pack-rules-preview">
        ${pack.rules.slice(0, 4).map(r =>
          `<span class="preview-rule">${escapeHtml(r.find)} → ${escapeHtml(r.replace)}</span>`
        ).join('')}
        ${pack.rules.length > 4 ? `<span class="preview-more">+${pack.rules.length - 4} more</span>` : ''}
      </div>
    `;
    list.appendChild(card);
  });
}

function loadPack(packId) {
  const pack = RULE_PACKS.find(p => p.id === packId);
  if (!pack) return;
  let added = 0;
  pack.rules.forEach(pr => {
    if (!rules.some(r => r.find === pr.find)) {
      rules.push({ ...pr, sites: [], enabled: true });
      added++;
    }
  });
  saveRules(() => {
    showStatus(`${added} rule${added !== 1 ? 's' : ''} added from "${pack.name}"`);
    renderPacks();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get(['rules', 'enabled'], (data) => {
    rules = data.rules || [];
    globalEnabled = data.enabled !== false;
    document.getElementById('globalEnabled').checked = globalEnabled;
    renderRules();
  });

  document.getElementById('globalEnabled').addEventListener('change', (e) => {
    globalEnabled = e.target.checked;
    saveRules(() => showStatus(globalEnabled ? 'Rules enabled' : 'Rules disabled'));
  });

  document.getElementById('rulesList').addEventListener('change', (e) => {
    if (e.target.classList.contains('rule-toggle')) {
      const index = Number(e.target.dataset.index);
      rules[index].enabled = e.target.checked;
      renderRules();
      saveRules();
    }
  });

  document.getElementById('rulesList').addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-delete')) {
      const index = Number(e.target.dataset.index);
      rules.splice(index, 1);
      renderRules();
      saveRules(() => showStatus('Rule deleted'));
    }
  });

  document.getElementById('addBtn').addEventListener('click', () => {
    const findVal = document.getElementById('findInput').value.trim();
    if (!findVal) {
      showStatus('Enter a word to find.', true);
      return;
    }
    const alreadyExists = rules.some(r => r.find === findVal);
    if (alreadyExists) {
      showStatus('A rule for that word already exists.', true);
      return;
    }
    const sitesRaw = document.getElementById('sitesInput').value;
    const sites = sitesRaw ? sitesRaw.split(',').map(s => s.trim()).filter(Boolean) : [];
    rules.push({
      find: findVal,
      replace: document.getElementById('replaceInput').value,
      caseSensitive: document.getElementById('caseSensitive').checked,
      wholeWord: document.getElementById('wholeWord').checked,
      sites,
      enabled: true
    });
    document.getElementById('findInput').value = '';
    document.getElementById('replaceInput').value = '';
    document.getElementById('caseSensitive').checked = false;
    document.getElementById('wholeWord').checked = false;
    document.getElementById('sitesInput').value = '';
    renderRules();
    saveRules(() => showStatus('Rule added'));
  });

  document.getElementById('findInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('addBtn').click();
  });
  document.getElementById('replaceInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('addBtn').click();
  });

  document.getElementById('applyBtn').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) return;
      chrome.tabs.sendMessage(
        tabs[0].id,
        { type: 'APPLY_RULES', rules, enabled: globalEnabled },
        () => {
          if (chrome.runtime.lastError) {
            showStatus('Reload the page and try again.', true);
          } else {
            showStatus('Applied to current tab ✓');
          }
        }
      );
    });
  });

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(t => { t.style.display = 'none'; });
      btn.classList.add('active');
      document.getElementById('tab-' + btn.dataset.tab).style.display = 'block';
      if (btn.dataset.tab === 'packs') renderPacks();
    });
  });

  document.getElementById('packsList').addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-load-pack');
    if (btn && !btn.classList.contains('loaded')) {
      loadPack(btn.dataset.packId);
    }
  });
});
