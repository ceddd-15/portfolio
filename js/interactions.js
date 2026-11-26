/**
 * Interactions Module — Spotlights, Magnetic Physics, Scroll Observers,
 * Active Nav Pill, Filter Tabs, Skills Tracing & Build Notes Accordion
 */

import { renderProjects, renderSkillLinkedProjects } from './render.js';

let activeSkillFilter = null;

/**
 * Cursor-tracking radial hover spotlight on each project index row
 */
export function bindRowSpotlights() {
  const rows = document.querySelectorAll('.project-index-row');
  rows.forEach((row) => {
    row.addEventListener('mousemove', (e) => {
      const rect = row.getBoundingClientRect();
      row.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
      row.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    });
  });
}

/**
 * Position the animated sliding pill behind the active project filter tab
 */
export function positionFilterPill(activeTab) {
  const pill = document.getElementById('filter-active-pill');
  const container = document.getElementById('project-filters');
  if (!pill || !container || !activeTab) return;

  const cRect = container.getBoundingClientRect();
  const tRect = activeTab.getBoundingClientRect();
  pill.style.width = `${tRect.width}px`;
  pill.style.height = `${tRect.height}px`;
  pill.style.left = `${tRect.left - cRect.left}px`;
  pill.style.top = `${tRect.top - cRect.top}px`;
}

function initMagneticButtons() {
  if (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    window.matchMedia('(hover: none)').matches
  ) {
    return;
  }

  const magneticEls = document.querySelectorAll('[data-magnetic]');
  magneticEls.forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      el.style.transform = `translate(${(dx * 0.2).toFixed(1)}px, ${(dy * 0.24).toFixed(1)}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'translate(0px, 0px)';
    });
  });
}

function initCursorAmbientGlow() {
  const glow = document.getElementById('cursor-ambient-glow');
  if (
    !glow ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    window.matchMedia('(hover: none)').matches
  ) {
    return;
  }

  let targetX = window.innerWidth * 0.5;
  let targetY = window.innerHeight * 0.35;
  let currentX = targetX;
  let currentY = targetY;
  let hw = glow.offsetWidth / 2 || 256;
  let hh = glow.offsetHeight / 2 || 256;
  let visible = false;
  let rafId = null;

  function tickGlow() {
    rafId = null;
    const dx = targetX - currentX;
    const dy = targetY - currentY;
    currentX += dx * 0.14;
    currentY += dy * 0.14;
    glow.style.transform = `translate3d(${(currentX - hw).toFixed(1)}px, ${(currentY - hh).toFixed(1)}px, 0)`;
    if (visible && (Math.abs(dx) > 0.3 || Math.abs(dy) > 0.3)) {
      rafId = requestAnimationFrame(tickGlow);
    }
  }

  function startGlowLoop() {
    if (!rafId) rafId = requestAnimationFrame(tickGlow);
  }

  window.addEventListener(
    'resize',
    () => {
      hw = glow.offsetWidth / 2 || 256;
      hh = glow.offsetHeight / 2 || 256;
    },
    { passive: true }
  );

  window.addEventListener(
    'mousemove',
    (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!visible) {
        visible = true;
        glow.style.opacity = '1';
      }
      startGlowLoop();
    },
    { passive: true }
  );

  document.addEventListener('mouseleave', () => {
    visible = false;
    glow.style.opacity = '0';
  });
}

function initScrollMechanics() {
  const progressBar = document.getElementById('scroll-progress-bar');
  const navPill = document.getElementById('nav-active-pill');
  const desktopNav = document.getElementById('desktop-nav');
  const navLinks = document.querySelectorAll('.nav-link');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link[data-nav-target]');
  const navShell = document.querySelector('.obsidian-pill-nav');
  const siteHeader = document.querySelector('.site-header');
  const sectionIds = ['projects', 'skills', 'notes', 'education'];
  const timelineContainer = document.getElementById('timeline-container');
  const eduRail = document.getElementById('education-scroll-rail');
  const sculpture = document.getElementById('chrome-sculpture-container');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const occluderSelector = [
    '.hero-eyebrow',
    '.hero-headline',
    '.hero-summary',
    '.hero-cta-row',
    '.hero-metrics',
    '.eyebrow',
    '.section-title',
    '.section-subtitle',
    '.header-hint',
    '.filter-bar',
    '.index-list-meta',
    '.project-index-row',
    '.skills-grid',
    '.note-item',
    '.timeline-entry'
  ].join(', ');

  let cachedSurfaces = Array.from(document.querySelectorAll('.section-glass-surface'));
  let cachedOccluders = Array.from(document.querySelectorAll(occluderSelector));

  function refreshScrollCaches() {
    cachedSurfaces = Array.from(document.querySelectorAll('.section-glass-surface'));
    cachedOccluders = Array.from(document.querySelectorAll(occluderSelector));
  }

  let activeId = null;
  let locked = false;
  let lockTimer = null;
  let ticking = false;

  function rectsOverlap(a, b, padY = 4) {
    return a.bottom > b.top - padY && a.top < b.bottom + padY && a.right > b.left && a.left < b.right;
  }

  function computeNavContrast(scrollY) {
    if (!navShell) return { overSurface: false, isOccluding: false };
    const nr = navShell.getBoundingClientRect();
    let overSurface = scrollY > 36;
    if (!overSurface) {
      for (const surf of cachedSurfaces) {
        if (rectsOverlap(surf.getBoundingClientRect(), nr, 2)) {
          overSurface = true;
          break;
        }
      }
    }

    let isOccluding = false;
    for (const el of cachedOccluders) {
      const sec = el.closest('.reveal-section');
      if (sec && !sec.classList.contains('is-visible') && !sec.classList.contains('is-exiting')) {
        continue;
      }
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (rectsOverlap(r, nr, 5)) {
        isOccluding = true;
        break;
      }
    }

    return { overSurface, isOccluding };
  }

  // Layout-based offset (ignores reveal transforms so targets stay pixel-precise)
  function absTop(el) {
    let y = 0;
    let n = el;
    while (n) {
      y += n.offsetTop;
      n = n.offsetParent;
    }
    return y;
  }

  function anchorOf(id) {
    const sec = document.getElementById(id);
    return sec ? sec.querySelector('.section-glass-surface') || sec : null;
  }

  function navBottom() {
    return navShell ? navShell.getBoundingClientRect().bottom : 72;
  }

  function scrollTargetY(id) {
    const anchor = anchorOf(id);
    if (!anchor) return null;
    const docMax = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const y = absTop(anchor) - navBottom() - 18;
    return Math.max(0, Math.min(docMax, Math.round(y)));
  }

  function placePill() {
    if (!navPill || !desktopNav) return;
    const link = activeId ? desktopNav.querySelector(`[data-nav-target="${activeId}"]`) : null;
    const nRect = desktopNav.getBoundingClientRect();
    if (!link || nRect.width === 0) {
      navPill.style.opacity = '0';
      return;
    }
    const lRect = link.getBoundingClientRect();
    navPill.style.opacity = '1';
    navPill.style.width = `${lRect.width}px`;
    navPill.style.left = `${lRect.left - nRect.left}px`;
  }

  function setActive(id) {
    activeId = id;
    navLinks.forEach((l) => l.classList.toggle('is-active', l.dataset.navTarget === id));
    mobileLinks.forEach((l) => l.classList.toggle('is-active', l.dataset.navTarget === id));
    placePill();
  }

  function detectSection() {
    const y = window.scrollY || document.documentElement.scrollTop;
    const docMax = document.documentElement.scrollHeight - window.innerHeight;
    if (docMax > 0 && y >= docMax - 6) return sectionIds[sectionIds.length - 1];
    const line = y + navBottom() + window.innerHeight * 0.28;
    let current = null;
    sectionIds.forEach((id) => {
      const a = anchorOf(id);
      if (a && absTop(a) <= line) current = id;
    });
    return current;
  }

  function releaseLock() {
    locked = false;
    clearTimeout(lockTimer);
    lockTimer = null;
    updateScrollUI();
  }

  function lockTo(id) {
    locked = true;
    clearTimeout(lockTimer);
    lockTimer = setTimeout(releaseLock, 900);
    setActive(id);
  }

  function applyNavContrast({ overSurface, isOccluding }) {
    if (!navShell) return;
    navShell.classList.toggle('is-over-surface', overSurface);
    navShell.classList.toggle('is-occluding', isOccluding);
    if (siteHeader) {
      siteHeader.classList.toggle('is-occluding', isOccluding);
    }
  }

  function updateScrollUI() {
    // Batch all DOM reads before any style/class writes to prevent layout thrashing
    const y = window.scrollY || document.documentElement.scrollTop;
    const winH = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight - winH;
    const pct = docHeight > 0 ? Math.min(100, Math.max(0, (y / docHeight) * 100)) : 0;
    const contrast = computeNavContrast(y);
    const foundSection = !locked ? detectSection() : null;
    const tRect = timelineContainer && eduRail ? timelineContainer.getBoundingClientRect() : null;

    if (progressBar) progressBar.style.width = `${pct.toFixed(2)}%`;
    applyNavContrast(contrast);

    if (!locked && foundSection !== activeId) {
      setActive(foundSection);
    }

    if (sculpture && !reduceMotion) {
      sculpture.style.setProperty('--pan-y', `${(-Math.min(y, 700) * 0.06).toFixed(1)}px`);
    }

    if (tRect && eduRail) {
      const start = winH * 0.84;
      const end = winH * 0.28;
      const progress = Math.min(
        1,
        Math.max(0, (start - tRect.top) / (start - end + tRect.height * 0.45))
      );
      eduRail.style.height = `${(progress * 100).toFixed(1)}%`;
    }
  }

  window.addEventListener(
    'scroll',
    () => {
      if (locked) {
        clearTimeout(lockTimer);
        lockTimer = setTimeout(releaseLock, 160);
      }
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          ticking = false;
          updateScrollUI();
        });
      }
    },
    { passive: true }
  );

  // User-driven scrolling always cancels a click-lock immediately
  ['wheel', 'touchstart', 'keydown'].forEach((evt) => {
    window.addEventListener(
      evt,
      () => {
        if (locked) {
          locked = false;
          clearTimeout(lockTimer);
        }
      },
      { passive: true }
    );
  });

  // Precise anchor navigation: section card lands just below the floating navbar
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute('href').slice(1);
    if (id !== 'top' && !sectionIds.includes(id)) return;

    e.preventDefault();
    const y = id === 'top' ? 0 : scrollTargetY(id);
    if (y === null) return;
    lockTo(id === 'top' ? null : id);
    window.scrollTo({ top: y, behavior: reduceMotion ? 'auto' : 'smooth' });
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', id === 'top' ? window.location.pathname + window.location.search : `#${id}`);
    }
  });

  window.addEventListener('resize', () => {
    placePill();
    updateScrollUI();
    const activeFilter = document.querySelector('.filter-tab[aria-selected="true"]');
    if (activeFilter) positionFilterPill(activeFilter);
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      placePill();
      const activeFilter = document.querySelector('.filter-tab[aria-selected="true"]');
      if (activeFilter) positionFilterPill(activeFilter);
    });
  }

  // Deep-link on load (e.g. /#education) lands precisely as well
  const initialHash = window.location.hash.slice(1);
  if (sectionIds.includes(initialHash)) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const y = scrollTargetY(initialHash);
        if (y !== null) window.scrollTo({ top: y, behavior: 'auto' });
      }, 250);
    });
  }

  document.addEventListener('transitionend', (e) => {
    if (e.target.classList && e.target.classList.contains('reveal-section')) {
      applyNavContrast(computeNavContrast(window.scrollY || document.documentElement.scrollTop));
    }
  });

  document.addEventListener('click', (e) => {
    if (e.target.closest('.filter-tab')) {
      requestAnimationFrame(() => {
        refreshScrollCaches();
        applyNavContrast(computeNavContrast(window.scrollY || document.documentElement.scrollTop));
      });
    }
  });

  updateScrollUI();
}

function initSectionReveals() {
  const sections = document.querySelectorAll('.reveal-section');
  if (!('IntersectionObserver' in window)) {
    sections.forEach((s) => s.classList.add('is-visible'));
    return;
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    sections.forEach((s) => s.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const el = entry.target;
        if (entry.isIntersecting) {
          el.classList.remove('is-exiting');
          el.classList.add('is-visible');
        } else {
          const exitDir = entry.boundingClientRect.top < 0 ? 'up' : 'down';
          el.dataset.exit = exitDir;
          el.classList.remove('is-visible');
          el.classList.add('is-exiting');
        }
      });
    },
    {
      threshold: 0.01,
      rootMargin: '-8% 0px -8% 0px'
    }
  );

  sections.forEach((s) => observer.observe(s));
}

function initMobileMenu() {
  const btn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  const openIcon = document.getElementById('menu-open-icon');
  const closeIcon = document.getElementById('menu-close-icon');
  if (!btn || !menu) return;

  function closeMenu() {
    menu.classList.add('hidden');
    btn.setAttribute('aria-expanded', 'false');
    if (openIcon) openIcon.classList.remove('hidden');
    if (closeIcon) closeIcon.classList.add('hidden');
  }

  function toggleMenu() {
    const isHidden = menu.classList.contains('hidden');
    if (isHidden) {
      menu.classList.remove('hidden');
      btn.setAttribute('aria-expanded', 'true');
      if (openIcon) openIcon.classList.add('hidden');
      if (closeIcon) closeIcon.classList.remove('hidden');
    } else {
      closeMenu();
    }
  }

  btn.addEventListener('click', toggleMenu);
  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
}

function selectSkill(skillName) {
  const drawer = document.getElementById('skill-linked-drawer');
  const pills = document.querySelectorAll('.skill-pill');

  if (activeSkillFilter === skillName) {
    clearSelectedSkill();
    return;
  }

  activeSkillFilter = skillName;
  pills.forEach((pill) => {
    pill.classList.toggle('skill-pill-active', pill.getAttribute('data-skill') === skillName);
  });

  renderSkillLinkedProjects(skillName);
  if (drawer) drawer.classList.add('open');
}

function clearSelectedSkill() {
  activeSkillFilter = null;
  const drawer = document.getElementById('skill-linked-drawer');
  document.querySelectorAll('.skill-pill').forEach((pill) => {
    pill.classList.remove('skill-pill-active');
  });
  if (drawer) drawer.classList.remove('open');
}

function toggleNote(idx) {
  const body = document.getElementById(`note-body-${idx}`);
  const chevron = document.getElementById(`note-chevron-${idx}`);
  if (!body || !chevron) return;

  const isOpen = body.classList.contains('open');
  const trigger = body.previousElementSibling;

  body.classList.toggle('open', !isOpen);
  chevron.classList.toggle('is-open', !isOpen);
  if (trigger) {
    trigger.setAttribute('aria-expanded', String(!isOpen));
  }
}

/**
 * Interactive Liquid Purple-Chrome Metaball/Ribbon Sculpture (Hero Canvas)
 * Reacts to pointer position, pointer velocity, and click/tap shockwave ripples.
 */
function initLiquidChromeSculpture() {
  const container = document.getElementById('chrome-sculpture-container');
  const canvas = document.getElementById('chrome-sculpture-canvas');
  if (!container || !canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isCoarse = window.matchMedia('(pointer: coarse)').matches;
  const slices = isCoarse ? 26 : 46;
  const minFrameMs = isCoarse ? 33 : 0;
  let containerWidth = 0;
  let containerHeight = 0;
  let canvasWidth = 0;
  let canvasHeight = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, isCoarse ? 1 : 1.5);
  let inViewport = true;
  let rafId = null;
  let lastDrawTime = 0;

  const pointer = {
    x: 0.3,
    y: -0.3,
    targetX: 0.3,
    targetY: -0.3,
    lastClientX: null,
    lastClientY: null,
    velocity: 0,
  };

  const ripples = [];

  function resizeCanvas() {
    const containerRect = container.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    containerWidth = Math.max(1, containerRect.width);
    containerHeight = Math.max(1, containerRect.height);
    canvasWidth = Math.max(1, canvasRect.width);
    canvasHeight = Math.max(1, canvasRect.height);
    dpr = Math.min(window.devicePixelRatio || 1, isCoarse ? 1 : 1.5);
    canvas.width = Math.floor(canvasWidth * dpr);
    canvas.height = Math.floor(canvasHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function updatePointer(clientX, clientY) {
    const rect = container.getBoundingClientRect();
    const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((clientY - rect.top) / rect.height) * 2 - 1;
    pointer.targetX = Math.max(-1, Math.min(1, nx));
    pointer.targetY = Math.max(-1, Math.min(1, ny));

    if (pointer.lastClientX !== null && pointer.lastClientY !== null) {
      const dx = clientX - pointer.lastClientX;
      const dy = clientY - pointer.lastClientY;
      const speed = Math.min(36, Math.hypot(dx, dy));
      pointer.velocity = Math.min(1.6, pointer.velocity + speed * 0.025);
    }
    pointer.lastClientX = clientX;
    pointer.lastClientY = clientY;
  }

  function spawnShockwave(clientX, clientY) {
    const canvasRect = canvas.getBoundingClientRect();
    ripples.push({
      x: clientX - canvasRect.left,
      y: clientY - canvasRect.top,
      radius: 10,
      maxRadius: Math.min(canvasWidth, canvasHeight) * 0.44,
      alpha: 0.95,
    });
    pointer.velocity = Math.min(1.8, pointer.velocity + 0.95);
  }

  container.addEventListener('mousemove', (e) => updatePointer(e.clientX, e.clientY));
  container.addEventListener('mouseleave', () => {
    pointer.targetX = 0.3;
    pointer.targetY = -0.3;
    pointer.lastClientX = null;
    pointer.lastClientY = null;
  });
  container.addEventListener('click', (e) => spawnShockwave(e.clientX, e.clientY));
  container.addEventListener(
    'touchstart',
    (e) => {
      if (e.touches && e.touches[0]) {
        updatePointer(e.touches[0].clientX, e.touches[0].clientY);
        spawnShockwave(e.touches[0].clientX, e.touches[0].clientY);
      }
    },
    { passive: true }
  );
  container.addEventListener(
    'touchmove',
    (e) => {
      if (e.touches && e.touches[0]) {
        updatePointer(e.touches[0].clientX, e.touches[0].clientY);
      }
    },
    { passive: true }
  );

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  let time = 0;
  function animate(now = performance.now()) {
    rafId = null;
    if (!inViewport || document.hidden || document.body.classList.contains('modal-open')) return;

    if (minFrameMs > 0 && now - lastDrawTime < minFrameMs) {
      rafId = requestAnimationFrame(animate);
      return;
    }
    lastDrawTime = now;

    if (!prefersReducedMotion) {
      time += (isCoarse ? 0.018 : 0.012) + pointer.velocity * 0.012;
    }
    pointer.x += (pointer.targetX - pointer.x) * 0.075;
    pointer.y += (pointer.targetY - pointer.y) * 0.075;
    pointer.velocity *= 0.93;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const cx = canvasWidth * 0.5 + pointer.x * 14;
    const cy = canvasHeight * 0.5 + pointer.y * 14;
    const scale = Math.min(containerWidth, containerHeight) * 0.29;
    const maxBloomR = Math.min(canvasWidth, canvasHeight) * 0.46;

    const bloom = ctx.createRadialGradient(
      cx + pointer.x * 32,
      cy + pointer.y * 32,
      scale * 0.06,
      cx,
      cy,
      Math.min(maxBloomR, scale * (1.42 + pointer.velocity * 0.14))
    );
    bloom.addColorStop(0, `rgba(192, 132, 252, ${0.26 + pointer.velocity * 0.14})`);
    bloom.addColorStop(0.45, 'rgba(126, 34, 206, 0.18)');
    bloom.addColorStop(1, 'rgba(5, 5, 7, 0)');
    ctx.fillStyle = bloom;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    let rippleDeform = 0;
    for (let r = ripples.length - 1; r >= 0; r--) {
      const rip = ripples[r];
      rip.radius += 7.5;
      rip.alpha *= 0.945;
      rippleDeform += rip.alpha * Math.sin(rip.radius * 0.06);
      if (rip.radius >= rip.maxRadius || rip.alpha < 0.02) {
        ripples.splice(r, 1);
      }
    }

    for (let i = 0; i < slices; i++) {
      const u = (i / slices) * Math.PI * 2;
      const phase = u + time * 0.52;
      const velStretch = 1 + pointer.velocity * 0.14 + rippleDeform * 0.08;

      const px =
        cx +
        Math.cos(phase) * scale * 0.78 * velStretch +
        Math.sin(phase * 2.0 - time * 0.7) * scale * 0.26;
      const py =
        cy +
        Math.sin(phase * 1.0) * scale * 0.68 +
        Math.cos(phase * 3.0 + time * 0.5) * scale * 0.17;

      const nextPhase = phase + 0.06;
      const nx =
        cx +
        Math.cos(nextPhase) * scale * 0.78 * velStretch +
        Math.sin(nextPhase * 2.0 - time * 0.7) * scale * 0.26;
      const ny =
        cy +
        Math.sin(nextPhase * 1.0) * scale * 0.68 +
        Math.cos(nextPhase * 3.0 + time * 0.5) * scale * 0.17;

      const angle = Math.atan2(ny - py, nx - px) + Math.sin(phase * 2.0 + time) * 0.56;
      const ribbonWidth =
        scale * (0.44 + 0.18 * Math.sin(phase * 3.0 - time * 0.8) + pointer.velocity * 0.06);
      const ribbonThickness = scale * (0.14 + Math.abs(rippleDeform) * 0.025);

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(angle);

      const lightOffset =
        pointer.x * ribbonWidth * 0.48 + Math.sin(phase * 2 + pointer.y * 2) * ribbonWidth * 0.22;
      const specPos = Math.max(0.18, Math.min(0.82, 0.5 + lightOffset / (ribbonWidth * 2.2)));

      const grad = ctx.createLinearGradient(-ribbonWidth, -ribbonThickness, ribbonWidth, ribbonThickness);
      grad.addColorStop(0, '#07050c');
      grad.addColorStop(Math.max(0.05, specPos - 0.24), '#3b0764');
      grad.addColorStop(Math.max(0.08, specPos - 0.1), '#a855f7');
      grad.addColorStop(Math.max(0.1, specPos - 0.04), '#e879f9');
      grad.addColorStop(specPos, '#ffffff');
      grad.addColorStop(Math.min(0.92, specPos + 0.09), '#c084fc');
      grad.addColorStop(Math.min(0.96, specPos + 0.25), '#581c87');
      grad.addColorStop(1, '#090710');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(0, 0, ribbonWidth, ribbonThickness, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = `rgba(244, 243, 248, ${0.15 + pointer.velocity * 0.12})`;
      ctx.lineWidth = 0.85;
      ctx.stroke();

      ctx.restore();
    }

    ripples.forEach((rip) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(192, 132, 252, ${rip.alpha * 0.65})`;
      ctx.lineWidth = 1.6;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(rip.x, rip.y, Math.max(1, rip.radius * 0.72), 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(244, 243, 248, ${rip.alpha * 0.35})`;
      ctx.lineWidth = 0.9;
      ctx.stroke();
      ctx.restore();
    });

    rafId = null;
    if (!prefersReducedMotion && inViewport && !document.hidden && !document.body.classList.contains('modal-open')) {
      rafId = requestAnimationFrame(animate);
    }
  }

  function startSculpture() {
    if (!rafId && !prefersReducedMotion && inViewport && !document.hidden && !document.body.classList.contains('modal-open')) {
      rafId = requestAnimationFrame(animate);
    }
  }

  if ('IntersectionObserver' in window) {
    const visObserver = new IntersectionObserver(
      (entries) => {
        inViewport = entries[0] ? entries[0].isIntersecting : true;
        if (inViewport) startSculpture();
        else if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      },
      { rootMargin: '120px 0px' }
    );
    visObserver.observe(container);
  }

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) startSculpture();
  });

  if (typeof MutationObserver !== 'undefined') {
    const modalObserver = new MutationObserver(() => {
      if (document.body.classList.contains('modal-open') && rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      } else {
        startSculpture();
      }
    });
    modalObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  animate();
}

export function initInteractions({ onOpenProject, onOpenCv, onCopyText }) {
  bindRowSpotlights();
  initMagneticButtons();
  initCursorAmbientGlow();
  initLiquidChromeSculpture();
  initScrollMechanics();
  initSectionReveals();
  initMobileMenu();

  // Position initial active filter pill after fonts/layout settle
  const initialActiveTab = document.querySelector('.filter-tab[aria-selected="true"]');
  if (initialActiveTab) {
    requestAnimationFrame(() => positionFilterPill(initialActiveTab));
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        const currentTab = document.querySelector('.filter-tab[aria-selected="true"]');
        if (currentTab) positionFilterPill(currentTab);
      });
    }
  }

  // Category filter tab switching (event delegation) + portrait/mobile dropdown sync
  const filterBar = document.getElementById('project-filters');
  if (filterBar) {
    function applyCategoryFilter(category) {
      let activeTab = null;
      filterBar.querySelectorAll('.filter-tab').forEach((t) => {
        const match = t.getAttribute('data-category') === category;
        t.setAttribute('aria-selected', match ? 'true' : 'false');
        if (match) activeTab = t;
      });
      const selectEl = filterBar.querySelector('#project-filter-select');
      if (selectEl && selectEl.value !== category) {
        selectEl.value = category;
      }

      if (activeTab) positionFilterPill(activeTab);
      renderProjects(category);
      bindRowSpotlights();
    }

    filterBar.addEventListener('click', (e) => {
      const tab = e.target.closest('.filter-tab');
      if (!tab) return;
      applyCategoryFilter(tab.getAttribute('data-category'));
    });

    filterBar.addEventListener('change', (e) => {
      const select = e.target.closest('#project-filter-select');
      if (!select) return;
      applyCategoryFilter(select.value);
    });
  }

  // Global delegated click handling for project rows, previews, skills, notes, CV & copy
  document.addEventListener('click', (e) => {
    // 1. Direct "Preview Available" badge or Hero Studio preview button
    const previewTrigger = e.target.closest('[data-open-preview]');
    if (previewTrigger) {
      e.stopPropagation();
      const idx = previewTrigger.getAttribute('data-open-preview');
      if (onOpenProject) onOpenProject(idx, 'preview');
      return;
    }

    // 2. Prevent row open when clicking direct GitHub anchor
    const directAnchor = e.target.closest('[data-stop-row] a');
    if (directAnchor) return;

    // 3. Project index row, Details button, or linked skill row
    const projectTrigger = e.target.closest('[data-open-project]');
    if (projectTrigger) {
      const idx = projectTrigger.getAttribute('data-open-project');
      if (onOpenProject) onOpenProject(idx, 'overview');
      return;
    }

    // 4. Technical Skill pill click
    const skillPill = e.target.closest('[data-skill]');
    if (skillPill) {
      selectSkill(skillPill.getAttribute('data-skill'));
      return;
    }

    // 5. Clear selected skill drawer
    if (e.target.closest('#clear-skill-btn')) {
      clearSelectedSkill();
      return;
    }

    // 6. Build Notes accordion toggle
    const noteBtn = e.target.closest('[data-note-toggle]');
    if (noteBtn) {
      toggleNote(noteBtn.getAttribute('data-note-toggle'));
      return;
    }

    // 7. Open Print-Ready CV modal
    if (e.target.closest('[data-open-cv]')) {
      if (onOpenCv) onOpenCv();
      return;
    }

    // 8. Copy email/text buttons
    const copyBtn = e.target.closest('[data-copy-text]');
    if (copyBtn) {
      const value = copyBtn.getAttribute('data-copy-text');
      const label = copyBtn.getAttribute('data-copy-label') || 'Copied to clipboard';
      if (onCopyText) onCopyText(value, label);
    }
  });

  // Keyboard support for accessible role="button" project rows
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const row = e.target.closest('[role="button"][data-open-project]');
    if (row && e.target === row) {
      e.preventDefault();
      if (onOpenProject) onOpenProject(row.getAttribute('data-open-project'), 'overview');
    }
  });
}
