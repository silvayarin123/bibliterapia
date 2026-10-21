'use strict';
(() => {
  const config = window.BIBLITERAPIA_CONFIG || {};
  const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const price = Number(config.price);
  if (Number.isFinite(price) && price >= 0) {
    document.querySelectorAll('[data-price], [data-price-inline]').forEach(el => { el.textContent = money.format(price); });
  }
  document.getElementById('year').textContent = new Date().getFullYear();
  function checkoutLink() {
    try {
      const url = new URL(config.checkoutUrl);
      if (url.protocol !== 'https:' || !(url.hostname === 'hotmart.com' || url.hostname.endsWith('.hotmart.com'))) return null;
      const incoming = new URLSearchParams(location.search);
      ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','src','sck','fbclid'].forEach(key => {
        const value = incoming.get(key);
        if (value && !url.searchParams.has(key)) url.searchParams.set(key, value.slice(0, 500));
      });
      return url.href;
    } catch { return null; }
  }
  const checkout = checkoutLink();
  document.querySelectorAll('[data-checkout]').forEach(link => {
    // Os hrefs reais do HTML funcionam mesmo sem JavaScript.
    if (checkout) link.href = checkout;
    link.addEventListener('click', () => {
      // Não disparar Purchase nem InitiateCheckout no simples clique.
      if (marketingAllowed() && pixelLoaded && window.fbq) {
        window.fbq('trackCustom', 'CheckoutClick', { content_name: 'Kit Bibliterapia' });
      }
    });
  });
  const email = String(config.supportEmail || '').trim();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    const link = document.getElementById('support-link');
    link.href = 'mailto:' + email;
    link.hidden = false;
    const contact = document.getElementById('privacy-contact');
    contact.textContent = 'Contato da Bibliterapia: ' + email;
    contact.hidden = false;
  }
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  let observer;
  if (!reduce.matches && 'IntersectionObserver' in window) {
    try {
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.06, rootMargin: '0px 0px -16px 0px' });
      document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
      document.documentElement.classList.add('motion-ready');
    } catch {
      // Se o navegador não suportar o efeito, todos os blocos ficam visíveis.
      document.documentElement.classList.remove('motion-ready');
    }
  }
  document.addEventListener('visibilitychange', () => {
    document.documentElement.classList.toggle('pause-motion', document.hidden);
  });
  document.querySelectorAll('[data-open-dialog]').forEach(button => {
    button.addEventListener('click', () => {
      const dialog = document.getElementById(button.dataset.openDialog);
      if (dialog && typeof dialog.showModal === 'function') dialog.showModal();
    });
  });
  document.querySelectorAll('[data-close-dialog]').forEach(button => {
    button.addEventListener('click', () => button.closest('dialog').close());
  });
  // Pausa as animações decorativas que estiverem fora da tela.
  if (!reduce.matches && 'IntersectionObserver' in window) {
    const sceneryObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.target.classList.toggle('motion-idle', !entry.isIntersecting));
    }, { rootMargin: '80px 0px', threshold: 0 });
    document.querySelectorAll('.section-divider, header .brand, .hero-visual, .closing-art, .product-art, .step-number').forEach(el => sceneryObserver.observe(el));
  }
  // Controle de movimento sem rastreamento e sem armazenamento adicional.
  const motionToggle = document.getElementById('motion-toggle');
  let animationsPaused = false;
  if (motionToggle) {
    if (reduce.matches) motionToggle.hidden = true;
    motionToggle.addEventListener('click', () => {
      animationsPaused = !animationsPaused;
      document.documentElement.classList.toggle('animations-paused', animationsPaused);
      motionToggle.setAttribute('aria-pressed', String(animationsPaused));
      motionToggle.textContent = animationsPaused ? 'Retomar animações' : 'Pausar animações';
    });
  }
  /* PIXEL: inativo sem ID e sem autorização; nenhuma compra é simulada. */
  const CONSENT_KEY = 'bibliterapia_marketing_v1';
  const MAX_AGE = 180 * 24 * 60 * 60 * 1000;
  const rawId = String(config.metaPixelId || '').trim();
  const pixelId = /^\d+$/.test(rawId) ? rawId : '';
  let memoryConsent = null;
  let pixelLoaded = false;
  function readConsent() {
    if (memoryConsent) return memoryConsent;
    try {
      const value = JSON.parse(localStorage.getItem(CONSENT_KEY));
      const age = Date.now() - (value && value.time);
      if (value && typeof value.allowed === 'boolean' && Number.isFinite(age) && age >= 0 && age < MAX_AGE) return value;
    } catch { /* O site funciona mesmo sem acesso ao armazenamento local. */ }
    return null;
  }
  function marketingAllowed() { const saved = readConsent(); return Boolean(saved && saved.allowed); }
  function loadPixel() {
    if (!pixelId || !marketingAllowed()) return;
    if (pixelLoaded) { if (window.fbq) window.fbq('consent', 'grant'); return; }
    if (!window.fbq) {
      const fbq = function() { if (fbq.callMethod) fbq.callMethod.apply(fbq, arguments); else fbq.queue.push(arguments); };
      window.fbq = fbq;
      if (!window._fbq) window._fbq = fbq;
      fbq.push = fbq; fbq.loaded = true; fbq.version = '2.0'; fbq.queue = [];
      const script = document.createElement('script');
      script.async = true; script.src = 'https://connect.facebook.net/en_US/fbevents.js';
      document.head.appendChild(script);
    }
    window.fbq('consent', 'grant');
    window.fbq('init', pixelId);
    window.fbq('track', 'PageView');
    window.fbq('track', 'ViewContent', { content_name: 'Kit Bibliterapia', content_ids: ['kit-bibliterapia'], content_type: 'product', value: price, currency: 'BRL' });
    pixelLoaded = true;
  }
  function saveConsent(allowed) {
    memoryConsent = { allowed, time: Date.now() };
    try { localStorage.setItem(CONSENT_KEY, JSON.stringify(memoryConsent)); } catch { /* Somente nesta visita. */ }
    document.getElementById('cookie-banner').hidden = true;
    if (allowed) loadPixel(); else if (window.fbq) window.fbq('consent', 'revoke');
  }
  document.getElementById('accept-cookies').addEventListener('click', () => saveConsent(true));
  document.getElementById('reject-cookies').addEventListener('click', () => saveConsent(false));
  document.getElementById('cookie-preferences').addEventListener('click', () => {
    if (pixelId) document.getElementById('cookie-banner').hidden = false;
    else document.getElementById('privacy-dialog').showModal();
  });
  if (pixelId) {
    const saved = readConsent();
    if (!saved) document.getElementById('cookie-banner').hidden = false;
    else if (saved.allowed) loadPixel();
  }
})();
