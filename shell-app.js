/* ──────────────────────────────────────────────
   Portfolio shell, live-app build.

   The shell's own shell.js renders the nav from apps.js to drive the
   walkthrough demo on that page. Here the app is fixed, so this renders the
   nav and footer once from the registry entry and mounts them into
   #pfNavMount / #pfFootMount. Pages set window.EC_SHELL before loading this
   to pick the active link and, where it helps, a page specific footer CTA.
   ────────────────────────────────────────────── */
(function () {
  'use strict';

  var APPS = window.PF_APPS || [];
  var CURRENT = 'emergency';
  var app = APPS.filter(function (a) { return a.key === CURRENT; })[0] || {};
  var page = window.EC_SHELL || {};
  var footCta = page.footCta || app.footCta || {};

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function each(sel, fn) { [].forEach.call(document.querySelectorAll(sel), fn); }
  function mount(id, html) { var el = document.getElementById(id); if (el) el.outerHTML = html; }

  var links = app.links || [];

  function switcherPanel(up) {
    return '' +
      '<div class="dropdown-menu pf-mega' + (up ? ' pf-mega-up' : '') + '">' +
        '<div class="pf-mega-grid"><div class="pf-mega-main">' +
          '<a href="#" class="pf-mega-platform">' +
            '<img src="logo.svg" alt="SupportNow" class="pf-platform-mark">' +
            '<span class="pf-plus">Platform</span>' +
            '<span class="cap">See how every piece works together</span>' +
            '<i class="fa-solid fa-arrow-right"></i>' +
          '</a>' +
          '<div class="pf-mega-apps pf-switch-list"></div>' +
          '<div class="pf-mega-compare">' +
            '<span>Compare SupportNow to the competition</span>' +
            '<a href="#" class="pf-mega-btn">Compare Alternatives <i class="fa-solid fa-arrow-right"></i></a>' +
          '</div>' +
        '</div></div>' +
      '</div>';
  }

  function navLinks(cls) {
    return links.map(function (l) {
      return '<a href="' + esc(l.href) + '" class="' + cls +
             (l.label === page.active ? ' is-active' : '') + '">' + esc(l.label) + '</a>';
    }).join('');
  }

  function ctaBtn() {
    var c = app.cta || {};
    return '<a href="' + esc(c.href) + '" class="pf-cta">' + esc(c.label) +
           ' <i class="fa-solid fa-arrow-right"></i></a>';
  }

  function navHtml() {
    return '' +
      '<header class="pf-nav" id="pfNav"><div class="container"><nav class="pf-pill">' +
        '<div class="pf-brand">' +
          '<button class="pf-switch" type="button" data-bs-toggle="dropdown" data-bs-display="static" ' +
                  'aria-expanded="false" aria-label="Switch platform">' +
            '<img src="logo-mark.svg" alt="SupportNow" class="pf-mark">' +
            '<i class="fa-solid fa-chevron-down pf-caret"></i>' +
          '</button>' +
          switcherPanel(false) +
          '<a href="' + esc(app.home) + '" class="pf-app">' + esc(app.name) + '</a>' +
        '</div>' +
        '<div class="pf-links">' + navLinks('pf-link') + ctaBtn() + '</div>' +
        '<button class="pf-burger" type="button" data-bs-toggle="offcanvas" data-bs-target="#pfMenu" ' +
                'aria-label="Open menu"><i class="fa-solid fa-bars"></i></button>' +
      '</nav></div></header>' +

      '<div class="offcanvas offcanvas-end pf-oc" tabindex="-1" id="pfMenu">' +
        '<div class="offcanvas-header">' +
          '<div class="d-flex align-items-center gap-3">' +
            '<img src="logo-mark.svg" alt="SupportNow" style="height:26px">' +
            '<span class="pf-oc-app">' + esc(app.name) + '</span>' +
          '</div>' +
          '<button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>' +
        '</div>' +
        '<div class="offcanvas-body">' +
          '<div>' + navLinks('pf-oc-link d-block') + ctaBtn() + '</div>' +
          '<div class="pf-oc-more"><h6>Switch platform</h6><div id="pfOcApps"></div></div>' +
        '</div>' +
      '</div>';
  }

  function footHtml() {
    return '' +
      '<footer class="pf-foot"><div class="container"><div class="pf-foot-inner">' +

        '<div class="pf-foot-id">' +
          '<div class="pf-applogo">' +
            '<span class="pf-applogo-name">' + esc(app.name) + '</span>' +
            '<span class="pf-applogo-by">by <img src="logo.svg" alt="SupportNow"></span>' +
          '</div>' +
          '<p class="pf-foot-appdesc">' + esc(app.desc) + '</p>' +
          '<div class="pf-foot-switch-wrap">' +
            '<button class="pf-youre-on" type="button" data-bs-toggle="dropdown" ' +
                    'data-bs-display="static" aria-expanded="false">' +
              'You\'re on <b>' + esc(app.name) + '</b><i class="fa-solid fa-chevron-up"></i>' +
            '</button>' +
            switcherPanel(true) +
          '</div>' +
        '</div>' +

        '<div class="pf-foot-act">' +
          '<h4>' + esc(footCta.head) + '</h4>' +
          '<p>' + esc(footCta.desc) + '</p>' +
          '<a href="' + esc(footCta.href) + '" class="pf-cta">' + esc(footCta.label) +
            ' <i class="fa-solid fa-arrow-right"></i></a>' +
        '</div>' +

        '<div class="pf-foot-share">' +
          '<h4>Know a family who needs this?</h4>' +
          '<p>Send them straight to it. One link, nothing to sign up for.</p>' +
          '<div class="pf-share-field">' +
            '<input type="text" id="pfShareUrl" readonly value="' + esc(app.shareUrl) + '" aria-label="Share link">' +
            '<button type="button" id="pfShareCopy">Copy</button>' +
          '</div>' +
        '</div>' +

      '</div></div>' +
      '<div class="pf-foot-bar"><div class="container pf-foot-bar-inner">' +
        '<span>&copy; 2026 SupportNow. The Official Family Support Platform.</span>' +
        '<nav class="pf-socials" id="pfSocials"></nav>' +
      '</div></div></footer>';
  }

  function renderSwitcher() {
    var html = APPS.map(function (a) {
      var here = a.key === CURRENT;
      return '<a href="' + esc(a.home) + '" data-key="' + esc(a.key) +
             '" class="pf-mega-item' + (here ? ' is-current' : '') + '">' +
               '<i class="fa-solid ' + esc(a.icon) + '"></i>' +
               '<span class="pf-mega-name">' + esc(a.name) + '</span>' +
               (here ? '<span class="pf-mega-here">You are here</span>' : '') +
             '</a>';
    }).join('');
    each('.pf-switch-list', function (list) { list.innerHTML = html; });

    var ocApps = document.getElementById('pfOcApps');
    if (ocApps) {
      ocApps.innerHTML = APPS.filter(function (a) { return a.key !== CURRENT; })
        .map(function (a) {
          return '<a href="' + esc(a.home) + '"><i class="fa-solid ' + esc(a.icon) + '"></i>' +
                 esc(a.name) + '</a>';
        }).join('');
    }
  }

  function stick() {
    var nav = document.getElementById('pfNav');
    if (!nav) return;
    function sync() { nav.classList.toggle('is-stuck', window.scrollY > 8); }
    window.addEventListener('scroll', sync, { passive: true });
    sync();
  }

  function renderSocial() {
    var wrap = document.getElementById('pfSocials');
    if (!wrap) return;
    wrap.innerHTML = (window.PF_SOCIAL || []).map(function (s) {
      return '<a href="' + esc(s.href) + '" aria-label="' + esc(s.label) + '">' +
             '<i class="fa-brands ' + esc(s.icon) + '"></i></a>';
    }).join('');
  }

  function bindCopy() {
    var btn = document.getElementById('pfShareCopy'), field = document.getElementById('pfShareUrl');
    if (!btn || !field) return;
    btn.addEventListener('click', function () {
      field.select();
      field.setSelectionRange(0, 99999); /* iOS needs the explicit range */
      var done = function () { btn.textContent = 'Copied'; btn.classList.add('copied'); };
      /* execCommand is the fallback that still works from file:// */
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(field.value).then(done, function () {
          try { document.execCommand('copy'); done(); } catch (e) {}
        });
      } else {
        try { document.execCommand('copy'); done(); } catch (e) {}
      }
    });
  }

  mount('pfNavMount', navHtml());
  mount('pfFootMount', footHtml());
  renderSwitcher();
  stick();
  renderSocial();
  bindCopy();
})();
