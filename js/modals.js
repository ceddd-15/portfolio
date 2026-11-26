/**
 * Modals & Notifications Controller
 * Manages the Project Inspection & Live Preview Modal, Print-Ready CV Modal,
 * one-click clipboard copy, and non-intrusive toast notifications.
 */

import { PROJECTS_DATA } from '../data/projects.js';
import { hasProjectPreview, mountProjectPreview } from './previews.js';
import { downloadCvPdf } from './cv-pdf.js';

let currentInspectProject = null;
let currentInspectTab = 'overview';
let toastTimer = null;
let lastFocusedEl = null;

function getFocusableIn(container) {
  if (!container) return [];
  return Array.from(
    container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter((el) => !el.classList.contains('hidden') && el.offsetParent !== null);
}

function focusModal(modalEl) {
  const focusables = getFocusableIn(modalEl);
  if (focusables.length > 0) {
    focusables[0].focus({ preventScroll: true });
  }
}

function restoreFocus() {
  if (lastFocusedEl && typeof lastFocusedEl.focus === 'function' && lastFocusedEl.isConnected) {
    lastFocusedEl.focus({ preventScroll: true });
  }
  lastFocusedEl = null;
}

export function showToast(message) {
  const toast = document.getElementById('toast-notification');
  const msg = document.getElementById('toast-message');
  if (!toast || !msg) return;

  msg.textContent = message;
  toast.classList.add('is-visible');

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('is-visible');
  }, 2200);
}

export function copyTextToClipboard(text, message = 'Copied to clipboard') {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(text)
      .then(() => showToast(message))
      .catch(() => fallbackCopy(text, message));
    return;
  }
  fallbackCopy(text, message);
}

function fallbackCopy(text, message) {
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast(message);
  } catch {
    showToast('Copy failed');
  }
}

function switchInspectTab(tabName) {
  if (!currentInspectProject) return;

  const previewAvailable = hasProjectPreview(currentInspectProject);
  const resolvedTab = tabName === 'preview' && previewAvailable ? 'preview' : 'overview';
  currentInspectTab = resolvedTab;

  const panel = document.getElementById('inspect-modal-panel');
  const overviewPane = document.getElementById('inspect-overview-pane');
  const previewPane = document.getElementById('inspect-preview-pane');
  const overviewTabBtn = document.getElementById('inspect-tab-overview');
  const previewTabBtn = document.getElementById('inspect-tab-preview');

  if (overviewPane) overviewPane.classList.toggle('hidden', resolvedTab !== 'overview');
  if (previewPane) previewPane.classList.toggle('hidden', resolvedTab !== 'preview');
  if (panel) panel.classList.toggle('is-wide', resolvedTab === 'preview');

  if (overviewTabBtn) {
    overviewTabBtn.classList.toggle('is-active', resolvedTab === 'overview');
    overviewTabBtn.setAttribute('aria-selected', String(resolvedTab === 'overview'));
  }
  if (previewTabBtn) {
    previewTabBtn.classList.toggle('is-active', resolvedTab === 'preview');
    previewTabBtn.setAttribute('aria-selected', String(resolvedTab === 'preview'));
  }

  if (resolvedTab === 'preview' && previewPane && !previewPane.dataset.mountedFor) {
    mountProjectPreview(previewPane, currentInspectProject, { onToast: showToast });
    previewPane.dataset.mountedFor = currentInspectProject.index;
  }
}

export function openInspectModal(projectIndex, initialTab = 'overview') {
  const project = PROJECTS_DATA.find((p) => p.index === projectIndex);
  if (!project) return;

  currentInspectProject = project;
  const previewAvailable = hasProjectPreview(project);

  const indexEl = document.getElementById('inspect-index');
  const categoryEl = document.getElementById('inspect-category');
  const titleEl = document.getElementById('inspect-modal-title');
  const roleEl = document.getElementById('inspect-role');
  const summaryEl = document.getElementById('inspect-summary');
  const repoTextEl = document.getElementById('inspect-repo-text');
  const repoLinkEl = document.getElementById('inspect-repo-link');
  const stackEl = document.getElementById('inspect-stack');
  const tabsGroup = document.getElementById('inspect-modal-tabs');
  const previewPane = document.getElementById('inspect-preview-pane');

  if (indexEl) indexEl.textContent = project.index;
  if (categoryEl) categoryEl.textContent = project.category;
  if (titleEl) titleEl.textContent = project.title;
  if (roleEl) roleEl.textContent = project.role;
  if (summaryEl) summaryEl.textContent = project.summary;
  if (repoTextEl) repoTextEl.textContent = project.repo.replace('https://', '');
  if (repoLinkEl) repoLinkEl.href = project.repo;

  if (stackEl) {
    stackEl.innerHTML = project.stack
      .map((tech) => `<span class="modal-stack-chip">${tech}</span>`)
      .join('');
  }

  // Clear previously mounted preview so each project initializes fresh
  if (previewPane) {
    previewPane.innerHTML = '';
    delete previewPane.dataset.mountedFor;
  }

  if (tabsGroup) {
    tabsGroup.classList.toggle('hidden', !previewAvailable);
  }

  switchInspectTab(previewAvailable && initialTab === 'preview' ? 'preview' : 'overview');

  const modal = document.getElementById('inspect-modal');
  if (modal) {
    lastFocusedEl = document.activeElement;
    modal.classList.remove('hidden');
    document.body.classList.add('modal-open');
    requestAnimationFrame(() => focusModal(modal));
  }
}

export function closeInspectModal() {
  const modal = document.getElementById('inspect-modal');
  if (!modal || modal.classList.contains('hidden')) return;
  modal.classList.add('hidden');
  document.body.classList.remove('modal-open');
  currentInspectProject = null;
  restoreFocus();
}

export function openCvModal() {
  const modal = document.getElementById('cv-modal');
  if (!modal) return;
  lastFocusedEl = document.activeElement;
  modal.classList.remove('hidden');
  document.body.classList.add('modal-open');
  requestAnimationFrame(() => focusModal(modal));
}

export function closeCvModal() {
  const modal = document.getElementById('cv-modal');
  if (!modal || modal.classList.contains('hidden')) return;
  modal.classList.add('hidden');
  document.body.classList.remove('modal-open');
  restoreFocus();
}

export function initModals() {
  const inspectModal = document.getElementById('inspect-modal');
  const cvModal = document.getElementById('cv-modal');
  const closeInspectBtn = document.getElementById('close-inspect-modal');
  const closeCvBtn = document.getElementById('close-cv-modal');
  const copyRepoBtn = document.getElementById('copy-inspect-repo');
  const downloadCvBtn = document.getElementById('download-cv-btn');
  const printCvBtn = document.getElementById('print-cv-btn');
  const overviewTabBtn = document.getElementById('inspect-tab-overview');
  const previewTabBtn = document.getElementById('inspect-tab-preview');

  if (closeInspectBtn) closeInspectBtn.addEventListener('click', closeInspectModal);
  if (closeCvBtn) closeCvBtn.addEventListener('click', closeCvModal);

  if (copyRepoBtn) {
    copyRepoBtn.addEventListener('click', () => {
      if (!currentInspectProject) return;
      copyTextToClipboard(currentInspectProject.repo, 'Repository URL copied');
    });
  }

  if (downloadCvBtn) {
    downloadCvBtn.addEventListener('click', () => {
      try {
        downloadCvPdf();
        showToast('Downloading Josh_Cedrick_Corpuz_CV.pdf');
      } catch {
        window.print();
      }
    });
  }

  if (printCvBtn) {
    printCvBtn.addEventListener('click', () => {
      window.print();
    });
  }

  if (overviewTabBtn) {
    overviewTabBtn.addEventListener('click', () => switchInspectTab('overview'));
  }

  if (previewTabBtn) {
    previewTabBtn.addEventListener('click', () => switchInspectTab('preview'));
  }

  if (inspectModal) {
    inspectModal.addEventListener('click', (e) => {
      if (e.target === inspectModal) closeInspectModal();
    });
  }

  if (cvModal) {
    cvModal.addEventListener('click', (e) => {
      if (e.target === cvModal) closeCvModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeInspectModal();
      closeCvModal();
      return;
    }

    if (e.key === 'Tab') {
      const openModal = [inspectModal, cvModal].find((m) => m && !m.classList.contains('hidden'));
      if (!openModal) return;
      const focusables = getFocusableIn(openModal);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
}
