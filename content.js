(function () {
  'use strict';

  const SKIP_TAGS = new Set([
    'SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'NOSCRIPT',
    'SELECT', 'OPTION', 'OPTGROUP'
  ]);

  let rules = [];
  let globalEnabled = true;
  let processedNodes = new WeakSet();
  let observer = null;
  let debounceTimer = null;

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function applyRulesToTextNode(node) {
    if (processedNodes.has(node)) return;
    const parent = node.parentElement;
    if (!parent || SKIP_TAGS.has(parent.tagName)) return;

    let text = node.textContent;
    let changed = false;

    for (const rule of rules) {
      if (!rule.enabled || !rule.find) continue;
      const flags = rule.caseSensitive ? 'g' : 'gi';
      const escaped = escapeRegex(rule.find);
      const pattern = rule.wholeWord ? `\\b${escaped}\\b` : escaped;
      try {
        const regex = new RegExp(pattern, flags);
        const newText = text.replace(regex, rule.replace != null ? rule.replace : '');
        if (newText !== text) {
          text = newText;
          changed = true;
        }
      } catch (_) {}
    }

    if (changed) {
      node.textContent = text;
    }
    processedNodes.add(node);
  }

  function walkAndReplace(root) {
    if (!root || typeof root.nodeType === 'undefined') return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    const nodes = [];
    let n;
    while ((n = walker.nextNode())) {
      nodes.push(n);
    }
    nodes.forEach(applyRulesToTextNode);
  }

  function applyAll() {
    if (!globalEnabled || !rules.length || !document.body) return;
    walkAndReplace(document.body);
  }

  function setupObserver() {
    if (observer) observer.disconnect();
    observer = new MutationObserver((mutations) => {
      if (!globalEnabled || !rules.length) return;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        for (const mutation of mutations) {
          for (const added of mutation.addedNodes) {
            if (added.nodeType === Node.TEXT_NODE) {
              applyRulesToTextNode(added);
            } else if (added.nodeType === Node.ELEMENT_NODE) {
              walkAndReplace(added);
            }
          }
        }
      }, 80);
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  function init() {
    chrome.storage.sync.get(['rules', 'enabled'], (data) => {
      rules = data.rules || [];
      globalEnabled = data.enabled !== false;
      applyAll();
      setupObserver();
    });
  }

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.rules) rules = changes.rules.newValue || [];
    if (changes.enabled) globalEnabled = changes.enabled.newValue !== false;
  });

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === 'APPLY_RULES') {
      processedNodes = new WeakSet();
      rules = msg.rules || [];
      globalEnabled = msg.enabled !== false;
      applyAll();
      sendResponse({ ok: true });
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
