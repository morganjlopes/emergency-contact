/* Emergency Contact — shared state, scoring, QR helpers. Prototype only: everything lives in localStorage. */
window.EC = (function () {
  const KEY = 'ec_v1';

  function blank() {
    return {
      quiz: { answers: {}, points: {}, kidsCount: null, completedAt: null },
      family: {
        familyName: '', address: '', hospital: '',
        p1name: '', p1phone: '', p2name: '', p2phone: '',
        insProvider: '', insId: ''
      },
      contacts: [],
      kids: [],
      care: { firstAid: '', pickup: '', notes: '' },
      demoSeed: false,
      updatedAt: null
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return blank();
      return Object.assign(blank(), JSON.parse(raw));
    } catch (e) { return blank(); }
  }

  function save(state) {
    state.updatedAt = new Date().toISOString();
    localStorage.setItem(KEY, JSON.stringify(state));
    return state;
  }

  function reset() { localStorage.removeItem(KEY); }

  function blankKid() {
    return {
      name: '', born: '', allergies: '', noAllergies: false, reactions: '',
      meds: '', conditions: '', doctor: '', doctorPhone: '', dentist: '',
      blood: '', notes: ''
    };
  }

  /* Scoring: quiz baseline is worth up to 55 points, the Emergency Card fills in the other 45. */
  const SECTION_POINTS = { family: 9, contacts: 9, kids: 18, care: 9 };

  function quizRaw(state) {
    const pts = state.quiz.points || {};
    return Object.values(pts).reduce((a, b) => a + b, 0);
  }

  function baseline(state) {
    if (!state.quiz.completedAt) return 0;
    return Math.round(quizRaw(state) * 0.55);
  }

  function familyDone(state) {
    const f = state.family;
    return !!(f.familyName && f.address && f.p1name && f.p1phone);
  }
  function contactsDone(state) {
    return state.contacts.some(c => c.name && c.phone);
  }
  function kidDone(k) { return !!(k.name && k.born && k.doctor); }
  function kidsEarned(state) {
    const kids = state.kids;
    if (!kids.length) return 0;
    const done = kids.filter(kidDone).length;
    return Math.round(SECTION_POINTS.kids * done / kids.length);
  }
  function careDone(state) {
    const c = state.care;
    return !!(c.firstAid || c.pickup || c.notes);
  }

  function earned(state) {
    let e = 0;
    if (familyDone(state)) e += SECTION_POINTS.family;
    if (contactsDone(state)) e += SECTION_POINTS.contacts;
    e += kidsEarned(state);
    if (careDone(state)) e += SECTION_POINTS.care;
    return e;
  }

  function score(state) {
    return Math.min(100, baseline(state) + earned(state));
  }

  const BANDS = [
    { min: 85, label: 'Fridge-ready', cls: 'give',  color: '#059669' },
    { min: 65, label: 'On the board', cls: 'brand', color: '#188aec' },
    { min: 40, label: 'Getting there', cls: 'amber', color: '#d97706' },
    { min: 0,  label: 'Running on memory', cls: 'rose', color: '#db2777' }
  ];
  function band(n) { return BANDS.find(b => n >= b.min); }

  /* QR: renders a scalable SVG QR into el. Falls back to a placeholder URL under file://.
     Demo-family QRs carry &demo=1 so a scan on a fresh phone self-seeds instead of dead-ending. */
  function childUrl(i) {
    if (location.protocol === 'file:') return 'https://supportnow.com/ec/demo/' + i;
    const demo = load().demoSeed ? '&demo=1' : '';
    return location.origin + location.pathname.replace(/[^/]*$/, '') + 'child.html?i=' + i + demo;
  }
  function qr(el, text) {
    const q = qrcode(0, 'M');
    q.addData(text);
    q.make();
    el.innerHTML = q.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
    const svg = el.querySelector('svg');
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.removeAttribute('width');
    svg.removeAttribute('height');
  }

  function age(born) {
    const y = parseInt(born, 10);
    if (!y) return '';
    const now = new Date().getFullYear();
    const a = now - y;
    return a >= 0 && a < 25 ? a : '';
  }

  function fmtDate(iso) {
    const d = iso ? new Date(iso) : new Date();
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  /* Fictional demo family for walkthroughs and screenshots. */
  function seedDemo() {
    const s = blank();
    s.demoSeed = true;
    s.quiz.kidsCount = 3;
    s.quiz.completedAt = new Date().toISOString();
    s.quiz.points = { q1: 10, q2: 10, q3: 10, q4: 5, q5: 4, q6: 10, q7: 5, q8: 10, q9: 10, q10: 10 };
    s.quiz.answers = { q1: 0, q2: 0, q3: 0, q4: 1, q5: 1, q6: 0, q7: 1, q8: 0, q9: 0, q10: 0 };
    s.family = {
      familyName: 'Rivera', address: '412 Juniper Lane, Decatur, GA 30030',
      hospital: 'Children’s Healthcare of Atlanta, Egleston',
      p1name: 'Jess Rivera', p1phone: '(404) 555-0132',
      p2name: 'Marcus Rivera', p2phone: '(404) 555-0176',
      insProvider: 'Anthem Blue Cross PPO', insId: 'ZGP123456789'
    };
    s.contacts = [
      { name: 'Diane Whitfield', rel: 'Grandma, 5 min away', phone: '(404) 555-0148', aware: true },
      { name: 'Priya Nair', rel: 'Neighbor, has a key', phone: '(404) 555-0163', aware: true }
    ];
    s.kids = [
      Object.assign(blankKid(), {
        name: 'Maya', born: '2017',
        allergies: 'Peanuts, tree nuts', reactions: 'Hives and swelling. EpiPen in the red pouch, top kitchen shelf. Use it, then call 911.',
        meds: 'EpiPen (with her at school), Zyrtec 5ml at bedtime',
        conditions: '', doctor: 'Dr. Alana Chen, Decatur Pediatrics', doctorPhone: '(404) 555-0190',
        dentist: 'Dr. Ross, Smile Decatur', blood: 'A+',
        notes: 'Glasses for reading. Calms down fastest with her sketchbook.'
      }),
      Object.assign(blankKid(), {
        name: 'Leo', born: '2020',
        allergies: '', noAllergies: true, reactions: '',
        meds: 'Albuterol inhaler with spacer, 2 puffs when wheezing',
        conditions: 'Mild asthma, usually triggered by colds',
        doctor: 'Dr. Alana Chen, Decatur Pediatrics', doctorPhone: '(404) 555-0190',
        dentist: '', blood: 'O+',
        notes: 'Sleeps with the hallway light on. Inhaler lives in the kitchen junk drawer.'
      }),
      Object.assign(blankKid(), {
        name: 'Nora', born: '2023',
        allergies: 'Amoxicillin', reactions: 'Full-body rash. Flag it before any antibiotics.',
        meds: '', conditions: '',
        doctor: 'Dr. Alana Chen, Decatur Pediatrics', doctorPhone: '(404) 555-0190',
        dentist: '', blood: '',
        notes: 'Still naps 1 to 3pm. Pacifier is non-negotiable.'
      })
    ];
    s.care = {
      firstAid: 'Hall closet, top shelf. EpiPen and inhaler both live in the kitchen.',
      pickup: 'Jess, Marcus, Grandma Diane. Nobody else without a text from Jess.',
      notes: 'Gate code is 4412. Dog (Biscuit) is friendly but bolts through open doors.'
    };
    return save(s);
  }

  return { load, save, reset, blank, blankKid, seedDemo,
           quizRaw, baseline, earned, score, band, BANDS, SECTION_POINTS,
           familyDone, contactsDone, kidDone, careDone, kidsEarned,
           childUrl, qr, age, fmtDate };
})();
