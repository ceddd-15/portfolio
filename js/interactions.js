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
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

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
  if (!glow || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let targetX = window.innerWidth * 0.5;
  let targetY = window.innerHeight * 0.35;
  let currentX = targetX;
  let currentY = targetY;
  let visible = false;

  window.addEventListener(
    'mousemove',
    (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!visible) {
        visible = true;
        glow.style.opacity = '1';
      }
    },
    { passive: true }
  );

  document.addEventListener('mouseleave', () => {
    visible = false;
    glow.style.opacity = '0';
  });

  function tickGlow() {
    currentX += (targetX - currentX) * 0.11;
    currentY += (targetY - currentY) * 0.11;
    const hw = glow.offsetWidth / 2;
    const hh = glow.offsetHeight / 2;
    glow.style.transform = `translate3d(${(currentX - hw).toFixed(1)}px, ${(currentY - hh).toFixed(1)}px, 0)`;
    requestAnimationFrame(tickGlow);
  }

  tickGlow();
}

function initScrollMechanics() {
  const progressBar = document.getElementById('scroll-progress-bar');
  const navPill = document.getElementById('nav-active-pill');
  const desktopNav = document.getElementById('desktop-nav');
  const navLinks = document.querySelectorAll('.nav-link');
  const sectionIds = ['projects', 'skills', 'notes', 'education'];
  const timelineContainer = document.getElementById('timeline-container');
  const eduRail = document.getElementById('education-scroll-rail');

  function updateScrollUI() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;

    if (progressBar) {
      progressBar.style.width = `${pct.toFixed(2)}%`;
    }

    // Active section detection for floating pill navbar
    let currentSection = null;
    const triggerLine = scrollTop + window.innerHeight * 0.35;
    sectionIds.forEach((id) => {
      const sec = document.getElementById(id);
      if (sec && sec.offsetTop <= triggerLine) {
        currentSection = id;
      }
    });

    if (navPill && desktopNav) {
      if (!currentSection) {
        navPill.style.opacity = '0';
        navLinks.forEach((link) => link.classList.remove('is-active'));
      } else {
        const activeLink = desktopNav.querySelector(`[data-nav-target="${currentSection}"]`);
        if (activeLink) {
          const nRect = desktopNav.getBoundingClientRect();
          const lRect = activeLink.getBoundingClientRect();
          navPill.style.opacity = '1';
          navPill.style.width = `${lRect.width}px`;
          navPill.style.left = `${lRect.left - nRect.left}px`;
          navLinks.forEach((link) => link.classList.toggle('is-active', link === activeLink));
        }
      }
    }

    // Vertical violet-chrome timeline rail progress
    if (timelineContainer && eduRail) {
      const tRect = timelineContainer.getBoundingClientRect();
      const start = window.innerHeight * 0.84;
      const end = window.innerHeight * 0.28;
      const progress = Math.min(
        1,
        Math.max(0, (start - tRect.top) / (start - end + tRect.height * 0.45))
      );
      eduRail.style.height = `${(progress * 100).toFixed(1)}%`;
    }
  }

  window.addEventListener('scroll', updateScrollUI, { passive: true });
  window.addEventListener('resize', () => {
    updateScrollUI();
    const activeFilter = document.querySelector('.filter-tab[aria-selected="true"]');
    if (activeFilter) positionFilterPill(activeFilter);
  });

  updateScrollUI();
}

function initSectionReveals() {
  const sections = document.querySelectorAll('.reveal-section');
  if (!('IntersectionObserver' in window)) {
    sections.forEach((s) => s.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.06 }
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

export function initInteractions({ onOpenProject, onOpenCv, onCopyText }) {
  bindRowSpotlights();
  initMagneticButtons();
  initCursorAmbientGlow();
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

  // Category filter tab switching (event delegation)
  const filterBar = document.getElementById('project-filters');
  if (filterBar) {
    filterBar.addEventListener('click', (e) => {
      const tab = e.target.closest('.filter-tab');
      if (!tab) return;

      const category = tab.getAttribute('data-category');
      filterBar.querySelectorAll('.filter-tab').forEach((t) => {
        t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
      });

      positionFilterPill(tab);
      renderProjects(category);
      bindRowSpotlights();
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
