/**
 * Main ES Module Entry Point
 * Initializes procedural liquid-chrome silk background, data-driven UI rendering,
 * interactive physics/observers, and modal/preview controllers.
 */

import { initLiquidBackground } from './liquid-bg.js';
import { renderAll } from './render.js';
import { initInteractions } from './interactions.js';
import {
  initModals,
  openInspectModal,
  openCvModal,
  copyTextToClipboard,
} from './modals.js';

function bootstrapPortfolio() {
  initLiquidBackground('liquid-bg-canvas');
  renderAll();
  initModals();
  initInteractions({
    onOpenProject: (projectIndex, initialTab) => openInspectModal(projectIndex, initialTab),
    onOpenCv: () => openCvModal(),
    onCopyText: (text, label) => copyTextToClipboard(text, label),
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapPortfolio);
} else {
  bootstrapPortfolio();
}
