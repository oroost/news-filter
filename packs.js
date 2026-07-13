'use strict';

const RULE_PACKS = [
  {
    id: 'positivity',
    name: 'Positivity Mode',
    emoji: '🌈',
    description: 'Softens harsh headlines into gentler language.',
    rules: [
      { find: 'war',          replace: 'peace process',   caseSensitive: false, wholeWord: true  },
      { find: 'crisis',       replace: 'situation',       caseSensitive: false, wholeWord: true  },
      { find: 'disaster',     replace: 'setback',         caseSensitive: false, wholeWord: true  },
      { find: 'catastrophe',  replace: 'challenge',       caseSensitive: false, wholeWord: true  },
      { find: 'devastating',  replace: 'significant',     caseSensitive: false, wholeWord: false },
      { find: 'horrifying',   replace: 'surprising',      caseSensitive: false, wholeWord: false },
      { find: 'grim',         replace: 'uncertain',       caseSensitive: false, wholeWord: true  },
      { find: 'terror',       replace: 'concern',         caseSensitive: false, wholeWord: true  },
      { find: 'chaos',        replace: 'turbulence',      caseSensitive: false, wholeWord: true  },
      { find: 'collapse',     replace: 'restructuring',   caseSensitive: false, wholeWord: true  },
    ]
  },
  {
    id: 'scifi',
    name: 'Sci-Fi Mode',
    emoji: '🚀',
    description: 'Transforms the news into an intergalactic bulletin.',
    rules: [
      { find: 'president',      replace: 'Supreme Commander',  caseSensitive: false, wholeWord: true },
      { find: 'prime minister', replace: 'Grand Chancellor',   caseSensitive: false, wholeWord: true },
      { find: 'parliament',     replace: 'Galactic Senate',    caseSensitive: false, wholeWord: true },
      { find: 'government',     replace: 'Federation',         caseSensitive: false, wholeWord: true },
      { find: 'economy',        replace: 'resource matrix',    caseSensitive: false, wholeWord: true },
      { find: 'election',       replace: 'selection protocol', caseSensitive: false, wholeWord: true },
      { find: 'army',           replace: 'defense fleet',      caseSensitive: false, wholeWord: true },
      { find: 'police',         replace: 'peacekeepers',       caseSensitive: false, wholeWord: true },
      { find: 'country',        replace: 'sector',             caseSensitive: false, wholeWord: true },
      { find: 'minister',       replace: 'commander',          caseSensitive: false, wholeWord: true },
    ]
  },
  {
    id: 'medieval',
    name: 'Medieval Mode',
    emoji: '🏰',
    description: 'Rewrites the news as if from a medieval herald.',
    rules: [
      { find: 'president',      replace: 'king',              caseSensitive: false, wholeWord: true },
      { find: 'prime minister', replace: 'high lord',         caseSensitive: false, wholeWord: true },
      { find: 'government',     replace: 'kingdom',           caseSensitive: false, wholeWord: true },
      { find: 'parliament',     replace: 'great council',     caseSensitive: false, wholeWord: true },
      { find: 'economy',        replace: 'royal treasury',    caseSensitive: false, wholeWord: true },
      { find: 'election',       replace: 'tournament',        caseSensitive: false, wholeWord: true },
      { find: 'technology',     replace: 'sorcery',           caseSensitive: false, wholeWord: true },
      { find: 'smartphone',     replace: 'magic mirror',      caseSensitive: false, wholeWord: true },
      { find: 'internet',       replace: 'the great scroll',  caseSensitive: false, wholeWord: true },
      { find: 'minister',       replace: 'chancellor',        caseSensitive: false, wholeWord: true },
    ]
  },
  {
    id: 'politics',
    name: 'Politics Mode',
    emoji: '🎪',
    description: 'Turns international politics into a circus spectacle.',
    rules: [
      { find: 'sanctions',        replace: 'strongly worded letter',  caseSensitive: false, wholeWord: true },
      { find: 'summit',           replace: 'awkward group photo',     caseSensitive: false, wholeWord: true },
      { find: 'negotiations',     replace: 'loud argument over lunch', caseSensitive: false, wholeWord: true },
      { find: 'diplomat',         replace: 'professional apologiser', caseSensitive: false, wholeWord: true },
      { find: 'diplomacy',        replace: 'polite arguing',          caseSensitive: false, wholeWord: true },
      { find: 'veto',             replace: 'nope',                    caseSensitive: false, wholeWord: true },
      { find: 'alliance',         replace: 'friendship bracelet',     caseSensitive: false, wholeWord: true },
      { find: 'foreign policy',   replace: 'vibes',                   caseSensitive: false, wholeWord: false },
      { find: 'press conference', replace: 'excuse parade',           caseSensitive: false, wholeWord: false },
      { find: 'debate',           replace: 'shouting contest',        caseSensitive: false, wholeWord: true },
      { find: 'budget',           replace: 'money drama',             caseSensitive: false, wholeWord: true },
      { find: 'coalition',        replace: 'uneasy friendship',       caseSensitive: false, wholeWord: true },
    ]
  },
  {
    id: 'cozy',
    name: 'Cozy Mode',
    emoji: '🌿',
    description: 'Makes the news feel like a relaxing adventure game.',
    rules: [
      { find: 'war',         replace: 'disagreement',       caseSensitive: false, wholeWord: true },
      { find: 'conflict',    replace: 'squabble',           caseSensitive: false, wholeWord: true },
      { find: 'attack',      replace: 'visit',              caseSensitive: false, wholeWord: true },
      { find: 'troops',      replace: 'adventurers',        caseSensitive: false, wholeWord: true },
      { find: 'weapons',     replace: 'gear',               caseSensitive: false, wholeWord: true },
      { find: 'bomb',        replace: 'firecracker',        caseSensitive: false, wholeWord: true },
      { find: 'enemies',     replace: 'rivals',             caseSensitive: false, wholeWord: true },
      { find: 'crisis',      replace: 'quest',              caseSensitive: false, wholeWord: true },
      { find: 'disaster',    replace: 'adventure',          caseSensitive: false, wholeWord: true },
      { find: 'catastrophe', replace: 'unexpected journey', caseSensitive: false, wholeWord: true },
    ]
  }
];
