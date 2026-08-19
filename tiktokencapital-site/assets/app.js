/* Tik Token Capital — shared front-end behaviour */
(function () {
  // sticky nav background
  var topbar = document.getElementById('topbar');
  if (topbar) {
    var onScroll = function () { topbar.classList.toggle('scrolled', window.scrollY > 20); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // reveal on scroll
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  // mobile menu
  var burger = document.getElementById('burger');
  var menu = document.getElementById('mobileMenu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      menu.classList.toggle('open');
      document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { menu.classList.remove('open'); document.body.style.overflow = ''; });
    });
  }

  // ---- Register-interest form ----
  var form = document.getElementById('interestForm');
  if (!form) return;

  // >>> CONFIG: paste your Formspree form ID here (e.g. "xyzabcd" from https://formspree.io/f/xyzabcd)
  var FORMSPREE_ID = form.getAttribute('data-formspree') || '';
  var FALLBACK_EMAIL = 'investors@tiktokencapital.co';

  var msg = document.getElementById('formMsg');
  var submitBtn = form.querySelector('.form-submit');

  function setMsg(type, text) {
    msg.className = 'form-msg ' + type;
    msg.textContent = text;
    msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function validate() {
    var ok = true;
    form.querySelectorAll('[required]').forEach(function (el) {
      var field = el.closest('.field') || el.parentElement;
      var valid = el.type === 'checkbox' ? el.checked : String(el.value).trim() !== '';
      if (valid && el.type === 'email') {
        valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim());
      }
      if (field.classList) field.classList.toggle('invalid', !valid);
      if (!valid) ok = false;
    });
    return ok;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    msg.className = 'form-msg';
    if (!validate()) { setMsg('err', 'Please complete the required fields correctly.'); return; }

    var data = new FormData(form);

    // No backend configured yet -> graceful mailto fallback so the button always "works".
    if (!FORMSPREE_ID || FORMSPREE_ID === 'REPLACE_ME') {
      var lines = [];
      data.forEach(function (v, k) { if (k !== 'ack') lines.push(k + ': ' + v); });
      var subject = 'Wholesale investor enquiry — ' + (data.get('name') || '');
      window.location.href = 'mailto:' + FALLBACK_EMAIL +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(lines.join('\n'));
      setMsg('ok', 'Opening your email app to send the enquiry to ' + FALLBACK_EMAIL + '. (Live form submission activates once a Formspree ID is added.)');
      return;
    }

    submitBtn.textContent = 'Sending…';
    submitBtn.disabled = true;
    fetch('https://formspree.io/f/' + FORMSPREE_ID, {
      method: 'POST', body: data, headers: { Accept: 'application/json' }
    }).then(function (r) {
      if (r.ok) {
        form.reset();
        setMsg('ok', 'Thank you — your enquiry has been received. A member of the team will be in touch.');
      } else {
        setMsg('err', 'Something went wrong. Please email us directly at ' + FALLBACK_EMAIL + '.');
      }
    }).catch(function () {
      setMsg('err', 'Network error. Please email us directly at ' + FALLBACK_EMAIL + '.');
    }).finally(function () {
      submitBtn.textContent = 'Submit enquiry';
      submitBtn.disabled = false;
    });
  });
})();
