/**
 * Interactive Project Previews (Rendered inside the Project Inspection Modal)
 *
 * Featured Live Previews:
 * 1. cedddProjects-WEBDEV -> Interactive CedCycles cycling gear storefront + cart drawer
 * 2. Hakton_TableTop      -> Multiplayer session lobby + clickable tabletop board
 * 3. Software-Engineering-Finals (KAIN) -> Filipino culinary puzzle stage (Carinderia/Eatery/Restaurant)
 *
 * Also supports rendering `project.previewImage` when real screenshots are added in `assets/`.
 */

export function hasProjectPreview(project) {
  return Boolean(project && (project.preview || project.previewImage));
}

export function mountProjectPreview(container, project, callbacks = {}) {
  if (!container || !project) return;
  container.innerHTML = '';

  if (project.previewImage) {
    renderImagePreview(container, project);
    return;
  }

  if (!project.preview) return;

  switch (project.preview.type) {
    case 'cedcycles-storefront':
      mountCedCyclesStorefront(container, callbacks);
      break;
    case 'hakton-tabletop':
      mountHaktonTableTop(container, callbacks);
      break;
    case 'kain-culinary':
      mountKainCulinary(container);
      break;
    default:
      container.innerHTML = `<p class="modal-summary">Preview configuration not recognized.</p>`;
  }
}

/* --------------------------------------------------------------------------
   Optional Future Screenshot Renderer
   -------------------------------------------------------------------------- */
function renderImagePreview(container, project) {
  container.innerHTML = `
    <div class="preview-stage">
      <div class="preview-chrome-bar">
        <div class="preview-chrome-left">
          <span class="preview-dots"><span class="preview-dot"></span><span class="preview-dot"></span><span class="preview-dot"></span></span>
          <span class="preview-chrome-title">${project.title} &middot; Captured Preview</span>
        </div>
      </div>
      <div class="preview-stage-body">
        <div class="preview-image-frame">
          <img src="${project.previewImage}" alt="${project.title} preview screenshot" loading="lazy" />
        </div>
      </div>
    </div>
  `;
}

/* --------------------------------------------------------------------------
   PREVIEW 1: cedddProjects-WEBDEV (CedCycles Mini Storefront)
   -------------------------------------------------------------------------- */
const CYCLING_CATALOG = [
  {
    id: 'cc-frame-01',
    name: 'Aero Gravel Alloy Frame',
    category: 'Frames',
    spec: '6061-T6 Hydroformed · 1.48 kg',
    price: 14500,
    badge: '700c',
  },
  {
    id: 'cc-drive-01',
    name: '11-Speed Shadow Cassette',
    category: 'Drivetrain',
    spec: '11-42T CNC Steel · Wide Ratio',
    price: 3250,
    badge: '11S',
  },
  {
    id: 'cc-wheel-01',
    name: 'Deep Carbon Wheelset 45mm',
    category: 'Wheelset',
    spec: 'Tubeless Ready · Sealed Hubs',
    price: 19800,
    badge: '45MM',
  },
  {
    id: 'cc-drive-02',
    name: 'Hydraulic Disc Brake Kit',
    category: 'Drivetrain',
    spec: 'Dual-Piston · 160mm Rotors',
    price: 4600,
    badge: 'HYD',
  },
  {
    id: 'cc-acc-01',
    name: 'GPS Telemetry Bike Computer',
    category: 'Accessories',
    spec: 'ANT+ / BLE · 28h Battery',
    price: 2950,
    badge: 'GPS',
  },
  {
    id: 'cc-acc-02',
    name: 'USB-C Aero Tail Light Set',
    category: 'Accessories',
    spec: '250 lm Radar Pulse · IPX6',
    price: 1150,
    badge: 'IPX6',
  },
];

function formatPhp(amount) {
  return `₱${amount.toLocaleString('en-PH')}`;
}

function mountCedCyclesStorefront(container, { onToast } = {}) {
  const state = {
    category: 'All',
    drawerOpen: false,
    checkoutDone: false,
    cart: new Map([['cc-acc-01', 1]]),
  };

  const categories = ['All', 'Frames', 'Drivetrain', 'Wheelset', 'Accessories'];

  function getCartCount() {
    let total = 0;
    state.cart.forEach((qty) => {
      total += qty;
    });
    return total;
  }

  function getCartSubtotal() {
    let sum = 0;
    state.cart.forEach((qty, id) => {
      const item = CYCLING_CATALOG.find((p) => p.id === id);
      if (item) sum += item.price * qty;
    });
    return sum;
  }

  function render() {
    const visibleProducts =
      state.category === 'All'
        ? CYCLING_CATALOG
        : CYCLING_CATALOG.filter((p) => p.category === state.category);

    const cartCount = getCartCount();
    const subtotal = getCartSubtotal();

    const cartRowsHtml =
      cartCount === 0
        ? `<p class="store-item-spec">Your cart is empty. Add cycling gear from the storefront.</p>`
        : Array.from(state.cart.entries())
            .map(([id, qty]) => {
              const item = CYCLING_CATALOG.find((p) => p.id === id);
              if (!item) return '';
              return `
                <div class="cart-line">
                  <div>
                    <div class="store-item-name">${item.name}</div>
                    <div class="store-item-spec">${formatPhp(item.price)} &times; ${qty}</div>
                  </div>
                  <div class="cart-qty-controls">
                    <button type="button" class="qty-btn" data-cart-dec="${item.id}" aria-label="Decrease quantity">&minus;</button>
                    <span>${qty}</span>
                    <button type="button" class="qty-btn" data-cart-inc="${item.id}" aria-label="Increase quantity">+</button>
                  </div>
                </div>
              `;
            })
            .join('');

    container.innerHTML = `
      <div class="preview-stage">
        <div class="preview-chrome-bar">
          <div class="preview-chrome-left">
            <span class="preview-dots"><span class="preview-dot"></span><span class="preview-dot"></span><span class="preview-dot"></span></span>
            <span class="preview-chrome-title">cedcycles.local / storefront</span>
          </div>
          <button type="button" class="store-cart-toggle" data-toggle-cart>
            <span>Cart Drawer</span>
            <span class="cart-badge-count">${cartCount}</span>
          </button>
        </div>

        <div class="preview-stage-body">
          <div class="store-toolbar">
            <div class="store-pills" role="tablist" aria-label="Filter Cycling Gear">
              ${categories
                .map(
                  (cat) => `
                    <button
                      type="button"
                      class="mini-pill ${state.category === cat ? 'is-active' : ''}"
                      data-store-cat="${cat}"
                    >
                      ${cat}
                    </button>
                  `
                )
                .join('')}
            </div>
            <span class="store-item-spec font-mono">${visibleProducts.length} items in stock</span>
          </div>

          <div class="store-layout ${state.drawerOpen ? 'drawer-open' : ''}">
            <div class="store-grid">
              ${visibleProducts
                .map(
                  (item) => `
                    <div class="store-item">
                      <div>
                        <div class="store-item-visual">
                          <span class="store-item-cat">${item.category}</span>
                          <span class="font-mono" style="font-size:0.7rem;opacity:0.85;">${item.badge}</span>
                        </div>
                        <div style="margin-top:0.6rem;">
                          <div class="store-item-name">${item.name}</div>
                          <div class="store-item-spec">${item.spec}</div>
                        </div>
                      </div>
                      <div class="store-item-foot">
                        <span class="store-price">${formatPhp(item.price)}</span>
                        <button type="button" class="store-add-btn" data-add-item="${item.id}">
                          + Add to Cart
                        </button>
                      </div>
                    </div>
                  `
                )
                .join('')}
            </div>

            ${
              state.drawerOpen
                ? `
                  <aside class="store-cart-drawer" aria-label="Cart Summary">
                    <div>
                      <div class="cart-drawer-head">
                        <span>CART SUMMARY (${cartCount})</span>
                        <button type="button" class="skill-clear-btn" data-close-cart>Close &times;</button>
                      </div>
                      <div class="cart-items-list" style="margin-top:0.65rem;">
                        ${cartRowsHtml}
                      </div>
                    </div>
                    <div class="cart-summary-foot">
                      <div class="cart-total-row">
                        <span style="color:var(--ink-secondary);">Subtotal</span>
                        <strong style="color:var(--chrome-white);">${formatPhp(subtotal)}</strong>
                      </div>
                      ${
                        state.checkoutDone
                          ? `<div class="kain-feedback is-success">Order queued in demo DB &middot; Ref #CC-${Math.floor(1000 + subtotal % 9000)}</div>`
                          : ''
                      }
                      <button
                        type="button"
                        class="cart-checkout-btn"
                        data-checkout-cart
                        ${cartCount === 0 ? 'disabled' : ''}
                      >
                        Simulate Checkout
                      </button>
                    </div>
                  </aside>
                `
                : ''
            }
          </div>
        </div>
      </div>
    `;

    bindEvents();
  }

  function bindEvents() {
    container.querySelectorAll('[data-store-cat]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.category = btn.getAttribute('data-store-cat');
        render();
      });
    });

    const toggleCartBtn = container.querySelector('[data-toggle-cart]');
    if (toggleCartBtn) {
      toggleCartBtn.addEventListener('click', () => {
        state.drawerOpen = !state.drawerOpen;
        render();
      });
    }

    const closeCartBtn = container.querySelector('[data-close-cart]');
    if (closeCartBtn) {
      closeCartBtn.addEventListener('click', () => {
        state.drawerOpen = false;
        render();
      });
    }

    container.querySelectorAll('[data-add-item]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-add-item');
        state.cart.set(id, (state.cart.get(id) || 0) + 1);
        state.checkoutDone = false;
        state.drawerOpen = true;
        render();
        if (onToast) onToast('Added item to CedCycles cart');
      });
    });

    container.querySelectorAll('[data-cart-inc]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-cart-inc');
        state.cart.set(id, (state.cart.get(id) || 0) + 1);
        state.checkoutDone = false;
        render();
      });
    });

    container.querySelectorAll('[data-cart-dec]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-cart-dec');
        const next = (state.cart.get(id) || 0) - 1;
        if (next <= 0) state.cart.delete(id);
        else state.cart.set(id, next);
        state.checkoutDone = false;
        render();
      });
    });

    const checkoutBtn = container.querySelector('[data-checkout-cart]');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        state.checkoutDone = true;
        render();
        if (onToast) onToast('Demo order placed');
      });
    }
  }

  render();
}

/* --------------------------------------------------------------------------
   PREVIEW 2: Hakton_TableTop (Multiplayer Session Lobby & Tabletop Board)
   -------------------------------------------------------------------------- */
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 4; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `HKT-${suffix}`;
}

function mountHaktonTableTop(container, { onToast } = {}) {
  const COLS = 6;
  const ROWS = 4;
  const TERRAIN_TILES = new Set(['1,1', '2,2', '4,1', '3,3']);

  const state = {
    roomCode: generateRoomCode(),
    selectedPlayerId: 'p1',
    players: [
      { id: 'p1', tag: 'JC', name: 'ceddd-15 (Host)', color: '#e9d5ff', ping: 18, ready: true, x: 0, y: 1 },
      { id: 'p2', tag: 'DG', name: 'Diggeh', color: '#67e8f9', ping: 26, ready: true, x: 5, y: 2 },
      { id: 'p3', tag: 'AR', name: 'Player 3', color: '#f472b6', ping: 34, ready: true, x: 2, y: 0 },
      { id: 'p4', tag: 'MK', name: 'Player 4', color: '#fbbf24', ping: 41, ready: false, x: 4, y: 3 },
    ],
    logs: [
      'Session host initialized · WebRTC mesh synced',
      'Select any player token, then click a board tile to move',
    ],
  };

  function coordLabel(x, y) {
    return `${String.fromCharCode(65 + x)}${y + 1}`;
  }

  function render() {
    const activePlayer = state.players.find((p) => p.id === state.selectedPlayerId) || state.players[0];
    const readyCount = state.players.filter((p) => p.ready).length;

    const tiles = [];
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const key = `${x},${y}`;
        const occupant = state.players.find((p) => p.x === x && p.y === y);
        const isOrigin = occupant && occupant.id === activePlayer.id;
        const isTerrain = TERRAIN_TILES.has(key);

        tiles.push(`
          <button
            type="button"
            class="board-tile ${isTerrain ? 'is-terrain' : ''} ${isOrigin ? 'is-selected-origin' : ''}"
            data-tile-x="${x}"
            data-tile-y="${y}"
            aria-label="Board tile ${coordLabel(x, y)}${occupant ? ` occupied by ${occupant.name}` : ''}"
          >
            <span class="tile-coord">${coordLabel(x, y)}</span>
            ${
              occupant
                ? `<span class="board-token ${occupant.id === activePlayer.id ? 'is-active-token' : ''}" style="background:${occupant.color};">${occupant.tag}</span>`
                : ''
            }
          </button>
        `);
      }
    }

    container.innerHTML = `
      <div class="preview-stage">
        <div class="preview-chrome-bar">
          <div class="preview-chrome-left">
            <span class="preview-dots"><span class="preview-dot"></span><span class="preview-dot"></span><span class="preview-dot"></span></span>
            <span class="preview-chrome-title">Hakton_TableTop &middot; Multiplayer Session Lobby</span>
          </div>
          <span class="player-status"><span class="ping-dot"></span>${readyCount}/${state.players.length} Ready</span>
        </div>

        <div class="preview-stage-body">
          <div class="tabletop-top-bar">
            <div class="room-code-wrap">
              <span style="color:var(--ink-secondary);">ROOM CODE</span>
              <span class="room-code-badge">${state.roomCode}</span>
            </div>
            <div style="display:flex;gap:0.4rem;flex-wrap:wrap;">
              <button type="button" class="mini-pill" data-copy-room>Copy Code</button>
              <button type="button" class="mini-pill" data-regen-room>New Session</button>
            </div>
          </div>

          <div class="tabletop-grid-layout">
            <div>
              <div class="board-grid" role="grid" aria-label="Interactive Tabletop Grid">
                ${tiles.join('')}
              </div>
              <div style="margin-top:0.55rem;display:flex;justify-content:space-between;font-family:var(--font-mono);font-size:0.66rem;color:var(--ink-muted);">
                <span>Active Token: <strong style="color:var(--chrome-white);">${activePlayer.name} (${coordLabel(activePlayer.x, activePlayer.y)})</strong></span>
                <span>Dashed = Cover Tile</span>
              </div>
            </div>

            <div class="lobby-sidebar">
              <div class="lobby-card">
                <div class="modal-field-label" style="margin-bottom:0.2rem;">Connected Peers</div>
                ${state.players
                  .map(
                    (p) => `
                      <div class="player-row ${p.id === activePlayer.id ? 'is-selected' : ''}" data-select-player="${p.id}">
                        <div class="player-ident">
                          <span class="player-swatch" style="background:${p.color};"></span>
                          <span>${p.name}</span>
                        </div>
                        <div class="player-status">
                          <button type="button" class="mini-pill" style="padding:0.12rem 0.45rem;font-size:0.62rem;" data-toggle-ready="${p.id}">
                            ${p.ready ? 'Ready' : 'Idle'}
                          </button>
                          <span class="ping-dot ${p.ready ? '' : 'is-waiting'}"></span>
                          <span>${p.ping}ms</span>
                        </div>
                      </div>
                    `
                  )
                  .join('')}
              </div>

              <div class="lobby-card">
                <div class="modal-field-label" style="margin-bottom:0.2rem;">Sync Telemetry</div>
                <div class="tabletop-log">
                  ${state.logs.map((entry) => `<div>&rsaquo; ${entry}</div>`).join('')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    bindEvents();
  }

  function bindEvents() {
    const regenBtn = container.querySelector('[data-regen-room]');
    if (regenBtn) {
      regenBtn.addEventListener('click', () => {
        state.roomCode = generateRoomCode();
        state.logs = [
          `Migrated host session to ${state.roomCode}`,
          ...state.logs.slice(0, 2),
        ];
        render();
      });
    }

    const copyBtn = container.querySelector('[data-copy-room]');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(state.roomCode).catch(() => {});
        }
        if (onToast) onToast(`Copied room code ${state.roomCode}`);
      });
    }

    container.querySelectorAll('[data-toggle-ready]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-toggle-ready');
        const target = state.players.find((p) => p.id === id);
        if (target) {
          target.ready = !target.ready;
          state.logs = [
            `${target.name} marked ${target.ready ? 'Ready' : 'Idle'}`,
            ...state.logs.slice(0, 2),
          ];
          render();
        }
      });
    });

    container.querySelectorAll('[data-select-player]').forEach((row) => {
      row.addEventListener('click', () => {
        state.selectedPlayerId = row.getAttribute('data-select-player');
        render();
      });
    });

    container.querySelectorAll('[data-tile-x]').forEach((tile) => {
      tile.addEventListener('click', () => {
        const x = Number(tile.getAttribute('data-tile-x'));
        const y = Number(tile.getAttribute('data-tile-y'));
        const existing = state.players.find((p) => p.x === x && p.y === y);

        if (existing) {
          state.selectedPlayerId = existing.id;
          state.logs = [
            `Selected token ${existing.name} at ${coordLabel(x, y)}`,
            ...state.logs.slice(0, 2),
          ];
          render();
          return;
        }

        const active = state.players.find((p) => p.id === state.selectedPlayerId);
        if (active) {
          const from = coordLabel(active.x, active.y);
          active.x = x;
          active.y = y;
          active.ping = Math.max(14, Math.min(48, active.ping + Math.floor(Math.random() * 7 - 3)));
          state.logs = [
            `Synced ${active.tag}: ${from} → ${coordLabel(x, y)} (${active.ping}ms)`,
            ...state.logs.slice(0, 2),
          ];
          render();
        }
      });
    });
  }

  render();
}

/* --------------------------------------------------------------------------
   PREVIEW 3: Software-Engineering-Finals (KAIN) Culinary Puzzle Stage
   -------------------------------------------------------------------------- */
const KAIN_STAGES = [
  {
    id: 'carinderia',
    name: 'Carinderia',
    dish: 'Classic Chicken Adobo',
    note: 'Stage 01 · Street-side kitchen',
    required: ['Chicken', 'Soy Sauce', 'Vinegar', 'Garlic', 'Bay Leaf'],
    pantry: ['Chicken', 'Soy Sauce', 'Vinegar', 'Garlic', 'Bay Leaf', 'Peanut Sauce', 'Kangkong'],
  },
  {
    id: 'eatery',
    name: 'Eatery',
    dish: 'Pork Sinigang na Baboy',
    note: 'Stage 02 · Busy neighborhood counter',
    required: ['Pork Belly', 'Tamarind', 'Kangkong', 'Radish', 'Tomatoes'],
    pantry: ['Pork Belly', 'Tamarind', 'Kangkong', 'Radish', 'Tomatoes', 'Soy Sauce', 'Bagoong'],
  },
  {
    id: 'restaurant',
    name: 'Restaurant',
    dish: 'Crispy Kare-Kare',
    note: 'Stage 03 · Fine Filipino kitchen',
    required: ['Crispy Pata', 'Peanut Sauce', 'Bagoong', 'Eggplant', 'Bok Choy'],
    pantry: ['Crispy Pata', 'Peanut Sauce', 'Bagoong', 'Eggplant', 'Bok Choy', 'Vinegar', 'Tamarind'],
  },
];

function playSubtleChime(freq = 540, duration = 0.09) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
    setTimeout(() => ctx.close().catch(() => {}), duration * 1000 + 80);
  } catch {
    // Audio playback is optional and fails silently if blocked
  }
}

function mountKainCulinary(container) {
  const state = {
    stageIndex: 0,
    selected: new Set(),
    completedStages: new Set(),
    soundEnabled: true,
    feedback: { text: 'Click required ingredients from the pantry to assemble the order.', tone: '' },
  };

  function render() {
    const stage = KAIN_STAGES[state.stageIndex];
    const progressText = `${state.completedStages.size}/${KAIN_STAGES.length} Stages Cleared`;

    container.innerHTML = `
      <div class="preview-stage">
        <div class="preview-chrome-bar">
          <div class="preview-chrome-left">
            <span class="preview-dots"><span class="preview-dot"></span><span class="preview-dot"></span><span class="preview-dot"></span></span>
            <span class="preview-chrome-title">KAIN &middot; Filipino Culinary Stage Preview</span>
          </div>
          <div style="display:flex;align-items:center;gap:0.5rem;">
            <span class="font-mono" style="font-size:0.68rem;color:var(--violet-lavender);">${progressText}</span>
            <button type="button" class="mini-pill ${state.soundEnabled ? 'is-active' : ''}" data-kain-audio>
              SFX: ${state.soundEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        <div class="preview-stage-body">
          <div class="kain-header-bar">
            <div class="store-pills" role="tablist" aria-label="Select KAIN Stage">
              ${KAIN_STAGES.map(
                (s, idx) => `
                  <button
                    type="button"
                    class="mini-pill ${state.stageIndex === idx ? 'is-active' : ''}"
                    data-kain-stage="${idx}"
                  >
                    ${state.completedStages.has(s.id) ? '★ ' : ''}${s.name}
                  </button>
                `
              ).join('')}
            </div>
            <span class="font-mono" style="font-size:0.68rem;color:var(--ink-muted);">${stage.note}</span>
          </div>

          <div class="kain-layout">
            <div class="kain-ticket">
              <div class="modal-field-label" style="margin-bottom:0;">Active Order Ticket</div>
              <div class="kain-dish-title">${stage.dish}</div>
              <p class="store-item-spec">Assemble all ${stage.required.length} authentic ingredients without extras to serve a perfect plate.</p>

              <div class="kain-recipe-chips">
                ${stage.required
                  .map(
                    (req) => `
                      <span class="recipe-req-chip ${state.selected.has(req) ? 'is-added' : ''}">
                        ${state.selected.has(req) ? '✓ ' : ''}${req}
                      </span>
                    `
                  )
                  .join('')}
              </div>

              <div class="kain-action-row" style="margin-top:auto;">
                <span class="kain-feedback ${state.feedback.tone}">${state.feedback.text}</span>
              </div>
            </div>

            <div class="kain-pantry">
              <div style="display:flex;align-items:center;justify-content:space-between;">
                <span class="modal-field-label" style="margin-bottom:0;">Prep Counter &amp; Pantry</span>
                <span class="font-mono" style="font-size:0.66rem;color:var(--ink-muted);">${state.selected.size} in pot</span>
              </div>

              <div class="ingredient-grid">
                ${stage.pantry
                  .map(
                    (ing) => `
                      <button
                        type="button"
                        class="ingredient-btn ${state.selected.has(ing) ? 'is-selected' : ''}"
                        data-kain-ing="${ing}"
                      >
                        <span>${ing}</span>
                        <span class="font-mono" style="font-size:0.68rem;opacity:0.75;">${state.selected.has(ing) ? '✓' : '+'}</span>
                      </button>
                    `
                  )
                  .join('')}
              </div>

              <div class="kain-action-row">
                <button type="button" class="mini-pill" data-kain-reset>Clear Pot</button>
                <button type="button" class="btn-chrome-solid" data-kain-serve style="padding:0.42rem 1rem;">
                  Serve Order
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    bindEvents();
  }

  function bindEvents() {
    container.querySelectorAll('[data-kain-stage]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.stageIndex = Number(btn.getAttribute('data-kain-stage'));
        state.selected.clear();
        state.feedback = {
          text: `Switched to ${KAIN_STAGES[state.stageIndex].name} stage. Assemble ${KAIN_STAGES[state.stageIndex].dish}.`,
          tone: '',
        };
        if (state.soundEnabled) playSubtleChime(440, 0.08);
        render();
      });
    });

    const audioBtn = container.querySelector('[data-kain-audio]');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        state.soundEnabled = !state.soundEnabled;
        if (state.soundEnabled) playSubtleChime(660, 0.07);
        render();
      });
    }

    container.querySelectorAll('[data-kain-ing]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const ing = btn.getAttribute('data-kain-ing');
        if (state.selected.has(ing)) {
          state.selected.delete(ing);
          if (state.soundEnabled) playSubtleChime(360, 0.06);
        } else {
          state.selected.add(ing);
          if (state.soundEnabled) playSubtleChime(587, 0.07);
        }
        state.feedback = { text: `${state.selected.size} ingredient(s) prepped.`, tone: '' };
        render();
      });
    });

    const resetBtn = container.querySelector('[data-kain-reset]');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        state.selected.clear();
        state.feedback = { text: 'Prep pot cleared. Ready for next order.', tone: '' };
        render();
      });
    }

    const serveBtn = container.querySelector('[data-kain-serve]');
    if (serveBtn) {
      serveBtn.addEventListener('click', () => {
        const stage = KAIN_STAGES[state.stageIndex];
        const missing = stage.required.filter((req) => !state.selected.has(req));
        const extras = Array.from(state.selected).filter((item) => !stage.required.includes(item));

        if (missing.length === 0 && extras.length === 0) {
          state.completedStages.add(stage.id);
          state.feedback = {
            text: `Order served! ${stage.dish} cleared (${stage.name} stage ★).`,
            tone: 'is-success',
          };
          if (state.soundEnabled) {
            playSubtleChime(587, 0.08);
            setTimeout(() => playSubtleChime(880, 0.14), 85);
          }
        } else if (extras.length > 0) {
          state.feedback = {
            text: `Remove off-recipe item(s): ${extras.join(', ')}.`,
            tone: 'is-warn',
          };
          if (state.soundEnabled) playSubtleChime(240, 0.12);
        } else {
          state.feedback = {
            text: `Still missing: ${missing.join(', ')}.`,
            tone: 'is-warn',
          };
          if (state.soundEnabled) playSubtleChime(280, 0.1);
        }
        render();
      });
    }
  }

  render();
}
