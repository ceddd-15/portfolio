/**
 * DOM Rendering Module — Generates Projects, Filter Tabs, Notes, Skills,
 * Education/Experience Timeline, and Verbatim Print-Ready CV from data/*.js
 */

import { PROJECTS_DATA, PROJECT_CATEGORIES } from '../data/projects.js';
import { NOTES_DATA } from '../data/notes.js';
import { CV_DATA } from '../data/cv.js';
import { hasProjectPreview } from './previews.js';

const GITHUB_ICON_SVG = `
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"></path>
  </svg>
`;

const CHEVRON_ICON_SVG = `
  <svg class="note-chevron" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"></path>
  </svg>
`;

/**
 * Sync hero project metric counter with PROJECTS_DATA length
 */
export function renderHeroMetrics() {
  const heroCount = document.getElementById('hero-project-count');
  if (heroCount) {
    heroCount.textContent = String(PROJECTS_DATA.length);
  }
}

/**
 * Dynamic Category Filter Tabs with Computed Counts
 */
export function renderFilterBar(activeCategory = 'All') {
  const filterBar = document.getElementById('project-filters');
  if (!filterBar) return;

  const counts = {};
  PROJECT_CATEGORIES.forEach((cat) => {
    counts[cat] =
      cat === 'All'
        ? PROJECTS_DATA.length
        : PROJECTS_DATA.filter((p) => p.category === cat).length;
  });

  const tabsHtml = PROJECT_CATEGORIES.map((category) => {
    const isActive = category === activeCategory;
    return `
      <button
        type="button"
        role="tab"
        aria-selected="${isActive ? 'true' : 'false'}"
        data-category="${category}"
        class="filter-tab"
      >
        ${category}<span class="filter-count">(${counts[category]})</span>
      </button>
    `;
  }).join('');

  const optionsHtml = PROJECT_CATEGORIES.map((category) => {
    const selected = category === activeCategory ? 'selected' : '';
    return `<option value="${category}" ${selected}>${category} (${counts[category]})</option>`;
  }).join('');

  filterBar.innerHTML = `
    <span id="filter-active-pill" class="filter-active-pill" aria-hidden="true"></span>
    ${tabsHtml}
    <div class="filter-dropdown-wrap">
      <select id="project-filter-select" class="filter-dropdown" aria-label="Filter Projects by Category">
        ${optionsHtml}
      </select>
      <svg class="filter-dropdown-chevron" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"></path>
      </svg>
    </div>
  `;
}

/**
 * Open 1px Hairline-Divided Interactive Project Index List (01–10)
 */
export function renderProjects(category = 'All') {
  const indexList = document.getElementById('projects-index-list');
  const indexLabel = document.getElementById('index-list-label');
  if (!indexList) return;

  const filtered =
    category === 'All'
      ? PROJECTS_DATA
      : PROJECTS_DATA.filter((item) => item.category === category);

  if (indexLabel) {
    indexLabel.textContent =
      category === 'All'
        ? `Repository Index · ${filtered.length} Builds`
        : `${category} · ${filtered.length} Builds`;
  }

  indexList.innerHTML = filtered
    .map((project, idx) => {
      const inlineStack = project.stack.join(' · ');
      const delayMs = Math.min(idx * 35, 320);
      const previewBadge = hasProjectPreview(project)
        ? `
          <button
            type="button"
            class="preview-available-badge"
            data-open-preview="${project.index}"
            title="Open Interactive Live Preview"
          >
            <span class="preview-badge-dot pulse-dot" aria-hidden="true"></span>
            <span>Preview Available</span>
          </button>
        `
        : '';

      return `
        <div
          role="button"
          tabindex="0"
          data-open-project="${project.index}"
          style="animation-delay: ${delayMs}ms"
          class="project-index-row row-enter"
        >
          <div class="project-index-inner">
            <div class="project-col-main">
              <span class="project-num">${project.index}</span>
              <div class="project-title-wrap">
                <div class="project-title-line">
                  <h3 class="project-title">${project.title}</h3>
                  ${previewBadge}
                </div>
                <div class="project-role">
                  ${project.role}<span class="project-role-sep">&middot;</span>${project.category}
                </div>
              </div>
            </div>

            <div class="project-col-summary">
              <p class="project-summary-text">${project.summary}</p>
              <div class="project-stack-inline">${inlineStack}</div>
            </div>

            <div class="project-col-actions" data-stop-row>
              <a
                href="${project.repo}"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub repository for ${project.title}"
                title="Open GitHub Repository"
                class="row-icon-link"
              >
                ${GITHUB_ICON_SVG}
              </a>
              <button
                type="button"
                data-open-project="${project.index}"
                class="row-details-btn"
              >
                Details
              </button>
            </div>
          </div>
        </div>
      `;
    })
    .join('');
}

/**
 * 3-Column Technical Skills Ledger (Exact CV Proficiency Tiers)
 */
export function renderSkillsLedger() {
  const grid = document.getElementById('skills-ledger-grid');
  if (!grid) return;

  grid.innerHTML = CV_DATA.skills
    .map(
      (tier) => `
        <div class="skill-column">
          <div class="skill-column-head">
            <h3 class="skill-column-title">${tier.category}</h3>
            <span class="skill-tier-label ${tier.accentLevel ? 'accent' : ''}">${tier.level}</span>
          </div>
          <div class="skill-pill-group">
            ${tier.items
              .map(
                (skill) => `
                  <button type="button" data-skill="${skill}" class="skill-pill">
                    ${skill}
                  </button>
                `
              )
              .join('')}
          </div>
        </div>
      `
    )
    .join('');
}

/**
 * Linked Projects Drawer for a Selected Skill Pill
 */
export function renderSkillLinkedProjects(skillName) {
  const nameEl = document.getElementById('selected-skill-name');
  const listEl = document.getElementById('skill-linked-projects');
  if (!nameEl || !listEl) return;

  const matches = PROJECTS_DATA.filter(
    (p) =>
      (p.linkedSkills && p.linkedSkills.includes(skillName)) ||
      p.stack.some((s) => s.toLowerCase() === skillName.toLowerCase())
  );

  nameEl.textContent = `${skillName} (${matches.length})`;

  if (matches.length === 0) {
    listEl.innerHTML = `<div class="skill-linked-empty">Used in coursework and foundational projects outside the 10 highlighted builds.</div>`;
    return;
  }

  listEl.innerHTML = matches
    .map(
      (p) => `
        <div
          role="button"
          tabindex="0"
          data-open-project="${p.index}"
          class="skill-linked-row"
        >
          <div class="skill-linked-left">
            <span class="project-num" style="padding-top:0;">${p.index}</span>
            <span class="font-display" style="font-weight:600;font-size:0.9rem;">${p.title}</span>
          </div>
          <div class="skill-linked-right">
            <span>${p.role}</span>
            <span style="color:var(--violet-lavender);">&rarr;</span>
          </div>
        </div>
      `
    )
    .join('');
}

/**
 * Engineering Build Notes Accordion (Verbatim from data/notes.js)
 */
export function renderBuildNotes() {
  const container = document.getElementById('notes-accordion-list');
  if (!container) return;

  container.innerHTML = NOTES_DATA.map(
    (note, idx) => `
      <article class="note-item">
        <button
          type="button"
          data-note-toggle="${idx}"
          aria-expanded="${note.defaultOpen ? 'true' : 'false'}"
          aria-controls="note-body-${idx}"
          class="note-trigger"
        >
          <span class="note-trigger-left">
            <span class="note-num">${note.index} /</span>
            <h3 class="note-title">${note.title}</h3>
          </span>
          <span class="note-chevron-wrap">
            <span id="note-chevron-${idx}" class="note-chevron ${note.defaultOpen ? 'is-open' : ''}">
              ${CHEVRON_ICON_SVG}
            </span>
          </span>
        </button>
        <div id="note-body-${idx}" class="smooth-collapse ${note.defaultOpen ? 'open' : ''}">
          <div class="smooth-collapse-inner">
            <p class="note-body-text">${note.body}</p>
          </div>
        </div>
      </article>
    `
  ).join('');
}

/**
 * On-Page Education & Experience Timeline (Rendered from data/cv.js)
 */
export function renderEducationExperience() {
  const eduList = document.getElementById('education-entries');
  const expList = document.getElementById('experience-entries');

  if (eduList) {
    eduList.innerHTML = CV_DATA.education
      .map(
        (edu) => `
          <div class="timeline-entry">
            <span class="timeline-node ${edu.accent ? 'is-accent' : ''}" aria-hidden="true"></span>
            <div class="timeline-entry-head">
              <h3 class="timeline-entry-title">${edu.institution}</h3>
              <span class="timeline-period ${edu.accent ? 'accent' : ''}">${edu.period}</span>
            </div>
            <p class="timeline-program">${edu.program}</p>
            <p class="timeline-metric">${edu.metric}</p>
          </div>
        `
      )
      .join('');
  }

  if (expList) {
    expList.innerHTML = CV_DATA.experience
      .map(
        (exp) => `
          <div class="timeline-entry">
            <span class="timeline-node is-accent" aria-hidden="true"></span>
            <div class="timeline-entry-head">
              <h3 class="timeline-entry-title">${exp.role} &middot; ${exp.organization}</h3>
              <span class="timeline-period accent">${exp.period}</span>
            </div>
            <ul class="timeline-bullets">
              ${exp.bullets.map((bullet) => `<li>${bullet}</li>`).join('')}
            </ul>
          </div>
        `
      )
      .join('');
  }
}

/**
 * Exact Verbatim Print-Ready CV Sheet inside #cv-printable-sheet
 */
export function renderCvSheet() {
  const sheet = document.getElementById('cv-printable-sheet');
  if (!sheet) return;

  sheet.innerHTML = `
    <div class="cv-sheet-header">
      <div>
        <h2 id="cv-modal-heading" class="cv-name">${CV_DATA.fullName}</h2>
        <p class="cv-program">${CV_DATA.program}</p>
      </div>
      <div class="cv-contact">
        <div>${CV_DATA.contact.email} | ${CV_DATA.contact.phone}</div>
        <div>${CV_DATA.contact.address}</div>
        <div>${CV_DATA.contact.githubUrl}</div>
      </div>
    </div>

    <div class="cv-section">
      <h3 class="cv-section-title">SUMMARY</h3>
      <p class="cv-summary-text">${CV_DATA.summary}</p>
    </div>

    <div class="cv-section">
      <h3 class="cv-section-title">EDUCATION</h3>
      ${CV_DATA.education
        .map(
          (edu) => `
            <div class="cv-entry-row">
              <div>
                <div class="cv-entry-strong">${edu.institution}</div>
                <div class="cv-entry-sub">${edu.program} | ${edu.metric}</div>
              </div>
              <span class="cv-entry-period">${edu.cvPeriod}</span>
            </div>
          `
        )
        .join('')}
    </div>

    <div class="cv-section">
      <h3 class="cv-section-title">EXPERIENCE</h3>
      ${CV_DATA.experience
        .map(
          (exp) => `
            <div style="display:flex;flex-direction:column;gap:0.4rem;">
              <div class="cv-entry-row">
                <div class="cv-entry-strong">${exp.role} | ${exp.organization}</div>
                <span class="cv-entry-period">${exp.period}</span>
              </div>
              <ul class="cv-bullets">
                ${exp.bullets.map((b) => `<li>${b}</li>`).join('')}
              </ul>
            </div>
          `
        )
        .join('')}
    </div>

    <div class="cv-section">
      <h3 class="cv-section-title">TECHNICAL SKILLS</h3>
      <div class="cv-skills-list">
        ${CV_DATA.skills
          .map(
            (tier) => `
              <div class="cv-entry-row">
                <span><strong>${tier.category}:</strong> ${tier.items.join(', ')}</span>
                <span class="cv-entry-period">${tier.level}</span>
              </div>
            `
          )
          .join('')}
      </div>
    </div>
  `;
}

export function renderAll() {
  renderHeroMetrics();
  renderFilterBar('All');
  renderProjects('All');
  renderSkillsLedger();
  renderBuildNotes();
  renderEducationExperience();
  renderCvSheet();
}
