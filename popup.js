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
    rules.push({
      find: findVal,
      replace: document.getElementById('replaceInput').value,
      caseSensitive: document.getElementById('caseSensitive').checked,
      wholeWord: document.getElementById('wholeWord').checked,
      enabled: true
    });
    document.getElementById('findInput').value = '';
    document.getElementById('replaceInput').value = '';
    document.getElementById('caseSensitive').checked = false;
    document.getElementById('wholeWord').checked = false;
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
});
