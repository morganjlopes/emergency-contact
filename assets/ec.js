/* ──────────────────────────────────────────────
   Emergency Contact · shared state, scoring, QR
   Prototype only. Everything lives in the browser.
   ────────────────────────────────────────────── */
(function (window) {
  'use strict';

  var KEY = 'ec.sn.v1';
  var memory = null; // used when localStorage is unavailable (Safari on file://)

  /* ── Storage ──────────────────────────────── */
  function read() {
    try {
      var raw = window.localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* fall through to memory */ }
    return memory ? JSON.parse(JSON.stringify(memory)) : null;
  }

  function write(state) {
    state.updatedAt = new Date().toISOString();
    memory = JSON.parse(JSON.stringify(state));
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) { /* memory copy above is the fallback */ }
    return state;
  }

  function reset() {
    memory = null;
    try { window.localStorage.removeItem(KEY); } catch (e) {}
  }

  /* ── Shape ────────────────────────────────── */
  function blank() {
    return {
      family: { lastName: '', address: '', city: '', notes: '' },
      parents: [],
      children: [],
      medical: {
        pediatrician: { name: '', practice: '', phone: '' },
        dentist: { name: '', phone: '' },
        insurance: { carrier: '', memberId: '', group: '' },
        urgentCare: '',
        hospital: '',
        consent: false
      },
      contacts: [],
      quiz: { answers: {}, selfScore: null, takenAt: null },
      updatedAt: null
    };
  }

  function load() {
    var s = read();
    if (!s) return blank();
    var base = blank();
    // shallow merge so older saved shapes keep working
    for (var k in base) if (!(k in s)) s[k] = base[k];
    return s;
  }

  /* ── What a Kids Safety Score measures ──
     Nine questions. `covers` reports whether the saved Emergency Card already
     documents the item, which always beats the self-reported quiz answer, so
     filling the card in can only ever raise the number. `selfOnly` items are
     real-world actions the tool cannot do for you. `na` offers a "does not
     apply to us" answer that earns full credit rather than a penalty. */
  var ITEMS = [
    {
      id: 'next_call',
      question: 'If nobody could reach you today, could someone else answer questions about your kids?',
      label: 'A second person who knows',
      fix: 'Add at least one trusted adult besides you.',
      covers: function (s) { return s.contacts.some(function (c) { return c.emergency && c.name && c.phone; }); }
    },
    {
      id: 'doctor',
      question: 'Could a babysitter find your pediatrician\'s number without calling you?',
      label: 'Pediatrician written down',
      fix: 'Add your pediatrician.',
      covers: function (s) { return !!(s.medical.pediatrician.name && s.medical.pediatrician.phone); }
    },
    {
      id: 'allergies',
      question: 'Are your kids\' allergies and medicines written down where someone else could find them?',
      label: 'Allergies and medicines written down',
      fix: 'Fill in allergies and medicines for each child.',
      na: 'They do not have any',
      covers: function (s) {
        return s.children.length > 0 && s.children.every(function (c) { return !!c.allergiesDone; });
      }
    },
    {
      id: 'address',
      question: 'Could someone watching your kids give 911 your home address?',
      label: 'Home address posted',
      fix: 'Add your street address so it prints on the sheet.',
      covers: function (s) { return !!(s.family.address && s.family.city); }
    },
    {
      id: 'insurance',
      question: 'Could a caregiver quickly find your child\'s insurance card in an emergency?',
      label: 'Insurance card findable',
      fix: 'Add your carrier and member ID.',
      covers: function (s) { return !!(s.medical.insurance.carrier && s.medical.insurance.memberId); }
    },
    {
      id: 'pickup',
      question: 'Is the list of who can pick up your kids current?',
      label: 'Pickup list current',
      fix: 'Mark which trusted adults can pick up your kids.',
      na: 'They are not in school or daycare',
      covers: function (s) { return s.contacts.some(function (c) { return c.pickup && c.name; }); }
    },
    {
      id: 'routine',
      question: 'Would a new sitter know your kids\' bedtime routine without asking?',
      label: 'Routines written down',
      fix: 'Add a routine or comfort item for each child.',
      covers: function (s) {
        return s.children.length > 0 && s.children.every(function (c) { return !!(c.routine || c.comfort); });
      }
    },
    {
      id: 'consent',
      question: 'If your child needed treatment and you were unreachable, could the adult with them say yes?',
      label: 'Medical consent on file',
      fix: 'Note that a signed consent form exists.',
      covers: function (s) { return !!s.medical.consent; }
    },
    {
      id: 'kids_know',
      question: 'Do your kids know a parent\'s phone number by heart?',
      label: 'Kids know a number by heart',
      fix: 'Practice it at dinner this week. This one is not something to type in.',
      selfOnly: true,
      covers: function () { return false; }
    }
  ];

  var MAX_PER_ITEM = 10;

  /* "No" still earns a little, because the information exists, it just lives
     only with you. A parent who has written nothing down is at 20, not 0. */
  var ANSWER_VALUES = { yes: 10, partly: 6, no: 2, na: 10 };

  var ANSWER_LABELS = {
    yes:    { label: 'Yes',     note: 'Written down where someone else could find it' },
    partly: { label: 'Sort of', note: 'Partly, or only if they knew where to look' },
    no:     { label: 'No',      note: 'They would have to reach me' }
  };

  function itemScore(item, s) {
    var self = ANSWER_VALUES[s.quiz.answers[item.id]] || 0;
    var documented = item.covers(s) ? MAX_PER_ITEM : 0;
    return Math.max(self, documented);
  }

  /* Reported out of 100 regardless of how many questions there are */
  function normalize(raw) {
    return Math.round((raw / (ITEMS.length * MAX_PER_ITEM)) * 100);
  }

  function score(s) {
    s = s || load();
    return normalize(ITEMS.reduce(function (sum, item) { return sum + itemScore(item, s); }, 0));
  }

  /* Score before any Emergency Card work, for the "you moved from X to Y" line */
  function selfScore(s) {
    s = s || load();
    return normalize(ITEMS.reduce(function (sum, item) {
      return sum + (ANSWER_VALUES[s.quiz.answers[item.id]] || 0);
    }, 0));
  }

  function gaps(s) {
    s = s || load();
    return ITEMS.filter(function (item) { return itemScore(item, s) < MAX_PER_ITEM; });
  }

  var BANDS = [
    { min: 85, key: 'give',  label: 'Ready for the unexpected', color: '#059669',
      blurb: 'Someone stepping in tomorrow would have what they need.' },
    { min: 65, key: 'brand', label: 'Good coverage, a few gaps', color: '#188aec',
      blurb: 'The basics are handled. A few specifics still live only with you.' },
    { min: 45, key: 'amber', label: 'Some of it is written down', color: '#d97706',
      blurb: 'A caregiver would get partway there, then start texting you.' },
    { min: 0,  key: 'rose',  label: 'Mostly in your head', color: '#e11d48',
      blurb: 'You know all of it. Right now you are also the only one who does.' }
  ];

  function band(n) {
    for (var i = 0; i < BANDS.length; i++) if (n >= BANDS[i].min) return BANDS[i];
    return BANDS[BANDS.length - 1];
  }


  /* ── Child helpers ────────────────────────── */
  function age(dob) {
    if (!dob) return null;
    var d = new Date(dob + 'T00:00:00');
    if (isNaN(d)) return null;
    var now = new Date();
    var a = now.getFullYear() - d.getFullYear();
    var m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a--;
    return a >= 0 ? a : null;
  }

  var CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I, O, 0, 1 to read off paper cleanly
  function makeCode(seed) {
    // Stable per child so the printed QR and the short code always agree.
    // Avalanche between characters, otherwise sibling ids like c1/c2/c3
    // produce codes that differ by a single letter.
    var str = String(seed), h = 2166136261 >>> 0;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    var out = '';
    for (var j = 0; j < 6; j++) {
      h = (h ^ (h >>> 16)) >>> 0; h = Math.imul(h, 2246822507) >>> 0;
      h = (h ^ (h >>> 13)) >>> 0; h = Math.imul(h, 3266489909) >>> 0;
      h = (h ^ (h >>> 16)) >>> 0; // xor yields a signed int, so coerce before indexing
      out += CODE_ALPHABET[h % CODE_ALPHABET.length];
    }
    return out;
  }

  /* The URL a printed QR code opens. Over http(s) this is a real, scannable
     link. Opened from the filesystem there is no shareable host, so the code
     carries the address the live version would use. */
  function childUrl(child) {
    var code = child.code || makeCode(child.id);
    if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
      var path = window.location.pathname.replace(/[^/]*$/, '');
      return window.location.origin + path + 'child.html?c=' + encodeURIComponent(code);
    }
    return 'https://supportnow.org/e/' + code;
  }

  /* ── QR rendering ─────────────────────────── */
  function qr(el, text, size) {
    if (!el) return;
    el.innerHTML = '';
    size = size || 92;
    if (window.QRCode) {
      try {
        new window.QRCode(el, {
          text: text, width: size, height: size,
          colorDark: '#111827', colorLight: '#ffffff',
          correctLevel: window.QRCode.CorrectLevel.M
        });
        return;
      } catch (e) { /* fall through to the placeholder */ }
    }
    el.innerHTML = '<div style="width:' + size + 'px;height:' + size + 'px;border:1.5px dashed #cbd5e1;' +
      'border-radius:8px;display:flex;align-items:center;justify-content:center;text-align:center;' +
      'font-size:10px;font-weight:700;color:#94a3b8;padding:6px;line-height:1.3">QR code<br>offline</div>';
  }

  /* ── Sample family, so every screen has something real in it ── */
  function sample() {
    var s = blank();
    s.family = { lastName: 'Whitaker', address: '412 Kalaheo Ave', city: 'Kailua, HI 96734',
      notes: 'Spare key with the Reyes family next door at 414.' };
    s.parents = [
      { name: 'Jenna Whitaker', relation: 'Mom', phone: '808-555-0134', email: 'jenna@example.com' },
      { name: 'Marcus Whitaker', relation: 'Dad', phone: '808-555-0177', email: 'marcus@example.com' }
    ];
    s.children = [
      {
        id: 'c1', code: makeCode('c1'), name: 'Ellie Whitaker', dob: '2018-03-14',
        school: 'Kainalu Elementary, 3rd grade',
        allergies: ['Peanuts (severe)', 'Bee stings'], allergiesDone: true,
        meds: [{ name: 'EpiPen Jr', dose: '0.15mg', when: 'Immediately for any peanut exposure, then call 911' }],
        conditions: 'Anaphylaxis risk. EpiPen is in the front pocket of her backpack and one is in the kitchen drawer.',
        routine: 'Reads for 20 minutes, lights out by 8:30. Nightlight stays on.',
        comfort: 'Her green blanket'
      },
      {
        id: 'c2', code: makeCode('c2'), name: 'Cole Whitaker', dob: '2020-07-02',
        school: 'Kainalu Elementary, 1st grade',
        allergies: [], allergiesDone: true,
        meds: [{ name: 'Albuterol inhaler', dose: '2 puffs', when: 'Before sports and for any wheezing' }],
        conditions: 'Asthma, mild. Triggered by running outside on windy days.',
        routine: 'Bath then books, lights out by 7:45.',
        comfort: 'Blue dinosaur, sleeps with it every night'
      },
      {
        id: 'c3', code: makeCode('c3'), name: 'Nora Whitaker', dob: '2023-01-19',
        school: 'Little Sprouts Preschool, MWF mornings',
        allergies: [], allergiesDone: true, meds: [],
        conditions: 'Two febrile seizures as a toddler. If she spikes a fever above 102, call Dr. Tanaka.',
        routine: 'Naps at 1:00 for about two hours. Bedtime 7:00.',
        comfort: 'Bunny, and she needs it to fall asleep'
      }
    ];
    s.medical = {
      pediatrician: { name: 'Dr. Amy Tanaka', practice: 'Kailua Pediatrics', phone: '808-555-0110' },
      dentist: { name: 'Windward Kids Dental', phone: '808-555-0192' },
      insurance: { carrier: 'HMSA', memberId: 'XF9924183', group: '7741' },
      urgentCare: 'Village Urgent Care, Kailua',
      hospital: 'Adventist Health Castle, Kailua',
      consent: true
    };
    s.contacts = [
      { name: 'Diane Whitaker', relation: 'Grandma, 10 minutes away', phone: '808-555-0143', emergency: true, pickup: true },
      { name: 'Tia Reyes', relation: 'Neighbor at 414', phone: '808-555-0128', emergency: true, pickup: true },
      { name: 'Ben Whitaker', relation: 'Uncle, Honolulu', phone: '808-555-0165', emergency: true, pickup: false }
    ];
    s.quiz = {
      answers: { next_call: 'yes', doctor: 'partly', allergies: 'no', address: 'yes', insurance: 'no',
        pickup: 'partly', routine: 'no', consent: 'no', kids_know: 'partly' },
      takenAt: new Date().toISOString()
    };
    s.quiz.selfScore = selfScore(s);
    return s;
  }

  function loadSample() { return write(sample()); }

  /* ── Small shared UI bits ─────────────────── */
  function fmtDate(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d)) return '';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function paintScoreChip(el, s) {
    if (!el) return;
    var n = score(s), b = band(n);
    var ring = el.querySelector('.ring');
    var out = el.querySelector('[data-score-value]');
    if (ring) { ring.textContent = n; ring.style.background = b.color; }
    if (out) out.textContent = b.label;
  }

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ── The product and the promotion ────────────
     The Emergency Card is the product. The Kids Safety Score is a campaign that
     runs for a while and then stops. Everything the campaign owns hangs off this
     one object, so ending it is a single edit: set active to false and the header
     falls back to the product call to action and the promo band disappears. */
  var PROMO = {
    active: true,
    badge: 'Back to school',
    headline: 'How much of it is only in your head?',
    blurb: 'Nine questions, two minutes, no account. You get a Kids Safety Score out of 100 and ' +
           'the exact list of what a babysitter could not find without you.',
    cta: { label: 'Get Your Kids Safety Score', href: 'safety-score.html' }
  };

  /* The product's own call to action, used whenever the promotion is not running */
  var PRODUCT_CTA = { label: 'Create My Emergency Card', href: 'questionnaire.html' };

  /* Did this person arrive through the campaign? The score and its climbing
     number belong to the quiz, so they stay hidden from anyone who skipped it. */
  function tookQuiz(s) {
    s = s || load();
    return !!(s.quiz && s.quiz.takenAt);
  }

  /* Whichever call to action the header should lead with right now */
  function headerCta() {
    return PROMO.active ? PROMO.cta : PRODUCT_CTA;
  }

  window.EC = {
    KEY: KEY, ITEMS: ITEMS, BANDS: BANDS, ANSWER_LABELS: ANSWER_LABELS,
    PROMO: PROMO, PRODUCT_CTA: PRODUCT_CTA, headerCta: headerCta, tookQuiz: tookQuiz,
    blank: blank, load: load, save: write, reset: reset,
    score: score, selfScore: selfScore, gaps: gaps, band: band, itemScore: itemScore,
    age: age, makeCode: makeCode, childUrl: childUrl, qr: qr,
    sample: sample, loadSample: loadSample,
    fmtDate: fmtDate, paintScoreChip: paintScoreChip, esc: esc
  };
})(window);
