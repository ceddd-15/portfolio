/**
 * Interactive Project Previews (Rendered inside the Project Inspection Modal)
 *
 * Featured Live Previews:
 * 1. cedddProjects-WEBDEV -> Actual CedCycles Website embedded in a live interactive browser frame
 * 2. comProg_finals       -> Authentic Digital Deluxe C++ Hotel & Restaurant Console Kiosk + customer_records.txt
 * 3. memore-rpg           -> Standalone C++ Turn-Based CLI RPG Port + C++ Struct / Shared Schema Inspector
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
    case 'cedcycles-site':
      mountCedCyclesWebsite(container);
      break;
    case 'comprog-kiosk':
      mountComProgKiosk(container, callbacks);
      break;
    case 'memore-rpg-cli':
      mountMemoreRpgCli(container);
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
   PREVIEW 1: cedddProjects-WEBDEV (Actual CedCycles Website in Live Frame)
   -------------------------------------------------------------------------- */
function mountCedCyclesWebsite(container) {
  container.innerHTML = `
    <div class="preview-stage">
      <div class="preview-chrome-bar web-browser-bar">
        <div class="preview-chrome-left">
          <span class="preview-dots">
            <span class="preview-dot"></span>
            <span class="preview-dot"></span>
            <span class="preview-dot"></span>
          </span>
          <span id="cedcycles-url-pill" class="web-browser-url">cedcycles.app /</span>
        </div>

        <div class="web-browser-controls">
          <button type="button" class="mini-pill is-active" data-cc-route="landing">Home</button>
          <button type="button" class="mini-pill" data-cc-route="shop">Shop</button>
          <button type="button" class="mini-pill" data-cc-route="cart">Cart</button>
          <a
            href="previews/cedcycles.html"
            target="_blank"
            rel="noopener noreferrer"
            class="mini-pill"
            title="Open CedCycles Preview in New Tab"
          >
            Full Tab &#8599;
          </a>
        </div>
      </div>

      <div class="web-preview-frame-wrap">
        <iframe
          id="cedcycles-live-iframe"
          src="previews/cedcycles.html"
          title="CedCycles Live Website Preview"
          class="web-preview-iframe"
        ></iframe>
      </div>
    </div>
  `;

  const iframe = container.querySelector('#cedcycles-live-iframe');
  const urlPill = container.querySelector('#cedcycles-url-pill');
  const routeBtns = container.querySelectorAll('[data-cc-route]');

  routeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const route = btn.getAttribute('data-cc-route');
      routeBtns.forEach((b) => b.classList.toggle('is-active', b === btn));
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({ type: 'cedcycles-navigate', route, category: 'all' }, '*');
      }
    });
  });

  function onMessage(e) {
    if (!container.isConnected) {
      window.removeEventListener('message', onMessage);
      return;
    }
    if (e.data && e.data.type === 'cedcycles-route' && urlPill) {
      urlPill.textContent = `cedcycles.app ${e.data.path}`;
      const activeKey = e.data.path.startsWith('/cart')
        ? 'cart'
        : e.data.path.startsWith('/shop') || e.data.path.startsWith('/product')
          ? 'shop'
          : 'landing';
      routeBtns.forEach((b) => b.classList.toggle('is-active', b.getAttribute('data-cc-route') === activeKey));
    }
  }
  window.addEventListener('message', onMessage);
}

/* --------------------------------------------------------------------------
   PREVIEW 2: comProg_finals (Actual Digital Deluxe C++ Console Kiosk)
   Mirrors main.cpp, customerRecord.h, mealMenu.h, drinkMenu.h, dessertMenu.h,
   sideMenu.h, bundledMenu.h, orders.h & payment.h from ceddd-15/comProg_finals
   -------------------------------------------------------------------------- */
const COMPROG_MENUS = {
  A: {
    title: '- MEAL MENU -',
    items: [
      { key: 'A', name: 'Cheeseburger', price: 150.0 },
      { key: 'B', name: 'Spaghetti', price: 175.0 },
      { key: 'C', name: 'Carbonara', price: 200.0 },
      { key: 'D', name: 'Fried Chicken', price: 250.0 },
      { key: 'E', name: 'Pizza', price: 270.0 },
    ],
  },
  B: {
    title: '- DRINK MENU -',
    items: [
      { key: 'A', name: 'Water', price: 20.0 },
      { key: 'B', name: 'Iced-Tea', price: 60.0 },
      { key: 'C', name: 'Soft-Drinks', price: 50.0 },
      { key: 'D', name: 'Coffee', price: 80.0 },
      { key: 'E', name: 'Alcohol', price: 170.0 },
    ],
  },
  C: {
    title: '- DESSERT MENU -',
    items: [
      { key: 'A', name: 'Cake', price: 150.0 },
      { key: 'B', name: 'Ice-Cream', price: 30.0 },
      { key: 'C', name: 'Leche-Flan', price: 10.0 },
      { key: 'D', name: 'Pastry', price: 10.0 },
      { key: 'E', name: 'Fruit-Salad', price: 10.0 },
    ],
  },
  D: {
    title: '- SIDE DISHES MENU -',
    items: [
      { key: 'A', name: 'French Fries', price: 20.0 },
      { key: 'B', name: 'Mojos', price: 25.0 },
      { key: 'C', name: 'Garlic Bread', price: 30.0 },
      { key: 'D', name: 'Salad', price: 10.0 },
      { key: 'E', name: 'Soup', price: 20.0 },
    ],
  },
  E: {
    title: '- BUNDLED MENU -',
    items: [
      { key: 'A', name: 'Fried Platter', price: 280.0 },
      { key: 'B', name: 'BBQ Platter', price: 275.0 },
      { key: 'C', name: 'Seafood Platter', price: 200.0 },
      { key: 'D', name: 'Pizza Platter', price: 250.0 },
      { key: 'E', name: 'Boodle Fight', price: 370.0 },
    ],
  },
};

function mountComProgKiosk(container, { onToast } = {}) {
  const state = {
    screen: 'main', // main | customer | menu-select | menu-items | qty | billout
    activeMenuKey: null,
    pendingItem: null,
    customerRecordCreated: true,
    records: [
      {
        name: 'Josh Corpuz',
        contact: '950244618',
        date: '11-29-2024',
        time: '18:30',
        guests: 4,
      },
    ],
    orders: [
      { name: 'Fried Chicken', qty: 2, unit: 250.0 },
      { name: 'Iced-Tea', qty: 2, unit: 60.0 },
    ],
    terminalLines: [
      'C:\\comProg_finals\\cmake-build-debug> comprog.exe',
      'Digital Deluxe — Hotel & Restaurant Management System',
      'Loaded customer_records.txt (1 existing record).',
      '',
      'NAVIGATION MENU',
      '[A] Create Customer Record',
      '[B] Create Reservation Record',
      '[C] Bill Out',
      '[X] Exit',
    ],
  };

  function getTotal() {
    return state.orders.reduce((sum, o) => sum + o.qty * o.unit, 0);
  }

  function pushLines(...lines) {
    state.terminalLines.push(...lines);
    if (state.terminalLines.length > 48) {
      state.terminalLines = state.terminalLines.slice(-48);
    }
  }

  function printMainMenu() {
    state.screen = 'main';
    pushLines(
      '',
      'NAVIGATION MENU',
      '[A] Create Customer Record',
      '[B] Create Reservation Record',
      '[C] Bill Out',
      '[X] Exit'
    );
  }

  function printCategoryMenu() {
    state.screen = 'menu-select';
    pushLines(
      '',
      '[A] Meals Menu',
      '[B] Drinks Menu',
      '[C] Desserts Menu',
      '[D] Side Dishes Menu',
      '[E] Bundled Menu',
      '[X] Return to Navigation Menu'
    );
  }

  function handleCommand(raw) {
    const cmd = raw.trim();
    if (!cmd) return;
    const upper = cmd.toUpperCase();
    pushLines(`> ${cmd}`);

    if (state.screen === 'main') {
      if (upper === 'A') {
        state.screen = 'customer';
        pushLines(
          '',
          'CUSTOMER RECORD MODULE',
          '[A] Quick-Save Demo Customer (customer_records.txt)',
          '[C] View Customer Record',
          '[X] Return to Main Menu'
        );
      } else if (upper === 'B') {
        if (!state.customerRecordCreated) {
          pushLines('----- Error: You must create a customer record before making a reservation. -----');
        } else {
          printCategoryMenu();
        }
      } else if (upper === 'C') {
        state.screen = 'billout';
        const total = getTotal();
        pushLines('', '--- YOUR ORDERS ---');
        if (state.orders.length === 0) {
          pushLines('(No items ordered yet)');
        } else {
          state.orders.forEach((o) => {
            pushLines(`${o.name} x${o.qty} = P${(o.qty * o.unit).toFixed(2)}`);
          });
        }
        pushLines(`Total Amount: P${total.toFixed(2)}`, 'Enter Payment Amount (e.g. 1000) or X to return:');
      } else if (upper === 'X') {
        pushLines('Session ended. Click [Reset Console] or enter A/B/C to restart.');
      } else {
        pushLines('Invalid choice, please try again.');
      }
    } else if (state.screen === 'customer') {
      if (upper === 'A') {
        const idx = state.records.length + 1;
        const rec = {
          name: `Guest #${idx}`,
          contact: `91700010${idx}`,
          date: '11-26-2026',
          time: '19:00',
          guests: 2 + (idx % 4),
        };
        state.records.push(rec);
        state.customerRecordCreated = true;
        pushLines(
          `Saved: ${rec.name} | +63${rec.contact} | ${rec.date} ${rec.time} | Guests: ${rec.guests}`,
          'Customer record saved successfully!'
        );
        if (onToast) onToast('Appended record to customer_records.txt');
        printMainMenu();
      } else if (upper === 'C') {
        pushLines('', '--- CUSTOMER RECORDS (customer_records.txt) ---');
        state.records.forEach((r, i) => {
          pushLines(`${i + 1}. ${r.name} | +63${r.contact} | ${r.date} ${r.time} | Guests: ${r.guests}`);
        });
      } else if (upper === 'X') {
        printMainMenu();
      } else {
        pushLines('Invalid choice. Enter A, C, or X.');
      }
    } else if (state.screen === 'menu-select') {
      if (COMPROG_MENUS[upper]) {
        state.activeMenuKey = upper;
        state.screen = 'menu-items';
        const menu = COMPROG_MENUS[upper];
        pushLines('', menu.title);
        menu.items.forEach((it) => {
          pushLines(`[${it.key}] ${it.name.padEnd(16, ' ')} P${it.price.toFixed(2)}`);
        });
        pushLines('[X] Return');
      } else if (upper === 'X') {
        printMainMenu();
      } else {
        pushLines('Invalid choice, please try again.');
      }
    } else if (state.screen === 'menu-items') {
      if (upper === 'X') {
        printCategoryMenu();
      } else {
        const menu = COMPROG_MENUS[state.activeMenuKey];
        const item = menu && menu.items.find((i) => i.key === upper);
        if (!item) {
          pushLines('Invalid choice, please try again.');
        } else {
          state.pendingItem = item;
          state.screen = 'qty';
          pushLines(`Selected ${item.name} (P${item.price.toFixed(2)}). Enter Quantity (1-20):`);
        }
      }
    } else if (state.screen === 'qty') {
      const qty = parseInt(cmd, 10);
      if (Number.isNaN(qty) || qty <= 0) {
        pushLines('Invalid quantity. Please enter a positive integer:');
      } else {
        const item = state.pendingItem;
        const existing = state.orders.find((o) => o.name === item.name);
        if (existing) existing.qty += qty;
        else state.orders.push({ name: item.name, qty, unit: item.price });
        pushLines(`Added ${item.name} x${qty} = P${(item.price * qty).toFixed(2)}`);
        state.pendingItem = null;
        state.screen = 'menu-items';
      }
    } else if (state.screen === 'billout') {
      if (upper === 'X') {
        printMainMenu();
      } else {
        const paid = parseFloat(cmd);
        const total = getTotal();
        if (Number.isNaN(paid) || paid < 0) {
          pushLines('Invalid input. Please enter a positive numeric amount.');
        } else if (paid < total) {
          pushLines(`Insufficient payment (Need P${total.toFixed(2)}). Please try again.`);
        } else {
          const change = paid - total;
          pushLines(
            `Payment Amount: P${paid.toFixed(2)}`,
            `Change: P${change.toFixed(2)}`,
            'Thank you for reserving at Digital Deluxe!',
            'Returning to Navigation Menu....'
          );
          state.orders = [];
          printMainMenu();
        }
      }
    }

    render();
  }

  function getQuickActions() {
    if (state.screen === 'main') {
      return [
        { label: '[A] Customer Record', cmd: 'A' },
        { label: '[B] Order Menu', cmd: 'B' },
        { label: '[C] Bill Out', cmd: 'C' },
      ];
    }
    if (state.screen === 'customer') {
      return [
        { label: '[A] Save New Record', cmd: 'A' },
        { label: '[C] View Records', cmd: 'C' },
        { label: '[X] Main Menu', cmd: 'X' },
      ];
    }
    if (state.screen === 'menu-select') {
      return [
        { label: '[A] Meals', cmd: 'A' },
        { label: '[B] Drinks', cmd: 'B' },
        { label: '[C] Desserts', cmd: 'C' },
        { label: '[D] Sides', cmd: 'D' },
        { label: '[E] Bundles', cmd: 'E' },
        { label: '[X] Back', cmd: 'X' },
      ];
    }
    if (state.screen === 'menu-items') {
      const menu = COMPROG_MENUS[state.activeMenuKey];
      return [
        ...menu.items.map((it) => ({ label: `[${it.key}] ${it.name}`, cmd: it.key })),
        { label: '[X] Back', cmd: 'X' },
      ];
    }
    if (state.screen === 'qty') {
      return [
        { label: 'Qty: 1', cmd: '1' },
        { label: 'Qty: 2', cmd: '2' },
        { label: 'Qty: 3', cmd: '3' },
      ];
    }
    if (state.screen === 'billout') {
      const total = Math.ceil(getTotal() / 100) * 100 || 500;
      return [
        { label: `Pay P${total}`, cmd: String(total) },
        { label: `Pay P${total + 500}`, cmd: String(total + 500) },
        { label: '[X] Main Menu', cmd: 'X' },
      ];
    }
    return [];
  }

  function render() {
    const filePreview = state.records
      .map((r) => `${r.name}\n${r.contact}\n${r.date}\n${r.time}\n${r.guests}`)
      .join('\n---\n');

    container.innerHTML = `
      <div class="preview-stage">
        <div class="preview-chrome-bar">
          <div class="preview-chrome-left">
            <span class="preview-dots"><span class="preview-dot"></span><span class="preview-dot"></span><span class="preview-dot"></span></span>
            <span class="preview-chrome-title">comprog.exe &middot; Digital Deluxe C++ Kiosk</span>
          </div>
          <span class="font-mono" style="font-size:0.68rem;color:var(--violet-lavender);">
            Active Bill: P${getTotal().toFixed(2)}
          </span>
        </div>

        <div class="preview-stage-body">
          <div class="cli-workspace">
            <div class="cli-terminal">
              <pre id="comprog-output" class="cli-output">${state.terminalLines.join('\n')}</pre>

              <div class="cli-keypad">
                ${getQuickActions()
                  .map(
                    (a) => `<button type="button" class="mini-pill" data-cli-cmd="${a.cmd}">${a.label}</button>`
                  )
                  .join('')}
              </div>

              <form id="comprog-form" class="cli-prompt-row">
                <span class="cli-prompt-prefix">cin &gt;&gt;</span>
                <input
                  id="comprog-input"
                  type="text"
                  class="cli-input"
                  placeholder="Type choice (A/B/C/X) or amount..."
                  autocomplete="off"
                />
                <button type="submit" class="store-add-btn">Enter</button>
              </form>
            </div>

            <aside class="cli-inspector">
              <div class="lobby-card">
                <div class="modal-field-label" style="margin-bottom:0.25rem;">customer_records.txt (File I/O)</div>
                <pre class="cli-file-dump">${filePreview}</pre>
              </div>
              <div class="lobby-card">
                <div class="modal-field-label" style="margin-bottom:0.25rem;">Current Kiosk Orders (${state.orders.length})</div>
                <div class="tabletop-log">
                  ${
                    state.orders.length === 0
                      ? '<div>No pending orders.</div>'
                      : state.orders
                          .map((o) => `<div>&rsaquo; ${o.name} x${o.qty} — P${(o.qty * o.unit).toFixed(2)}</div>`)
                          .join('')
                  }
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    `;

    const out = container.querySelector('#comprog-output');
    if (out) out.scrollTop = out.scrollHeight;

    container.querySelectorAll('[data-cli-cmd]').forEach((btn) => {
      btn.addEventListener('click', () => handleCommand(btn.getAttribute('data-cli-cmd')));
    });

    const form = container.querySelector('#comprog-form');
    const input = container.querySelector('#comprog-input');
    if (form && input) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        handleCommand(input.value);
      });
    }
  }

  render();
}

/* --------------------------------------------------------------------------
   PREVIEW 3: memore-rpg (Standalone C++ Turn-Based CLI RPG Port)
   Reflects deterministic C++ combat loop, item lookups & shared schema structs
   -------------------------------------------------------------------------- */
function mountMemoreRpgCli(container) {
  const ENEMIES = [
    { name: 'Echo Wraith', maxHp: 64, hp: 64, atk: 11, xp: 45, dialogue: 'A fragment of forgotten syntax drifts through the hall.' },
    { name: 'Null Sentinel', maxHp: 88, hp: 88, atk: 14, xp: 70, dialogue: 'Pointer bounds shimmer along the obsidian corridor.' },
  ];

  const state = {
    turn: 1,
    enemyIndex: 0,
    defending: false,
    victory: false,
    player: {
      name: 'Traveler',
      level: 3,
      hp: 95,
      maxHp: 100,
      mp: 30,
      maxMp: 30,
      xp: 40,
      potions: 2,
      shards: 1,
    },
    enemy: { ...ENEMIES[0] },
    log: [
      '$ ./memore_rpg --data ./shared_assets/world.json',
      '[C++ Runtime] Loaded 3 entities, 2 items, 4 dialogue nodes (0ms interpreter overhead)',
      '--- ENCOUNTER STARTED: Echo Wraith (HP 64/64) ---',
      'Echo Wraith: "A fragment of forgotten syntax drifts through the hall."',
    ],
  };

  function pushLog(...lines) {
    state.log.push(...lines);
    if (state.log.length > 36) state.log = state.log.slice(-36);
  }

  function enemyTurn() {
    if (state.enemy.hp <= 0) {
      state.player.xp += state.enemy.xp;
      pushLog(`★ Defeated ${state.enemy.name}! Gained +${state.enemy.xp} XP.`);
      if (state.enemyIndex + 1 < ENEMIES.length) {
        state.enemyIndex++;
        state.enemy = { ...ENEMIES[state.enemyIndex] };
        pushLog(`--- NEXT STAGE: ${state.enemy.name} (HP ${state.enemy.hp}/${state.enemy.maxHp}) ---`, `${state.enemy.name}: "${state.enemy.dialogue}"`);
      } else {
        state.victory = true;
        pushLog('=== CHAPTER CLEARED · Dialogue Node #04 Unlocked ===');
      }
      return;
    }

    const baseDmg = state.enemy.atk + ((state.turn * 3) % 5);
    const finalDmg = state.defending ? Math.max(2, Math.floor(baseDmg * 0.4)) : baseDmg;
    state.player.hp = Math.max(0, state.player.hp - finalDmg);
    pushLog(
      `${state.enemy.name} strikes for ${finalDmg} DMG${state.defending ? ' (Guarded!)' : ''}.`
    );
    state.defending = false;
    state.turn++;

    if (state.player.hp <= 0) {
      pushLog('You fell in battle. Restoring checkpoint from shared save schema...');
      state.player.hp = state.player.maxHp;
      state.player.mp = state.player.maxMp;
      state.enemy = { ...ENEMIES[state.enemyIndex] };
    }
  }

  function doAction(action) {
    if (action === 'reset') {
      state.turn = 1;
      state.enemyIndex = 0;
      state.defending = false;
      state.victory = false;
      state.player = { name: 'Traveler', level: 3, hp: 95, maxHp: 100, mp: 30, maxMp: 30, xp: 40, potions: 2, shards: 1 };
      state.enemy = { ...ENEMIES[0] };
      state.log = [
        '$ ./memore_rpg --data ./shared_assets/world.json',
        '[C++ Runtime] Deterministic state reset complete.',
        '--- ENCOUNTER STARTED: Echo Wraith (HP 64/64) ---',
      ];
      render();
      return;
    }

    if (state.victory) return;

    if (action === 'attack') {
      const dmg = 16 + ((state.turn * 5) % 7);
      state.enemy.hp = Math.max(0, state.enemy.hp - dmg);
      pushLog(`> [1] Attack -> Dealt ${dmg} physical DMG to ${state.enemy.name}.`);
      enemyTurn();
    } else if (action === 'skill') {
      if (state.player.mp < 10) {
        pushLog('> [2] Memory Slash -> Not enough MP (requires 10 MP).');
      } else {
        state.player.mp -= 10;
        const dmg = 29;
        state.enemy.hp = Math.max(0, state.enemy.hp - dmg);
        pushLog(`> [2] Memory Slash (-10 MP) -> Dealt ${dmg} arc DMG to ${state.enemy.name}!`);
        enemyTurn();
      }
    } else if (action === 'potion') {
      if (state.player.potions <= 0) {
        pushLog('> [3] Health Potion -> Inventory count is 0.');
      } else {
        state.player.potions--;
        state.player.hp = Math.min(state.player.maxHp, state.player.hp + 35);
        pushLog(`> [3] Used Health Potion -> Restored +35 HP (Now ${state.player.hp}/${state.player.maxHp}).`);
        enemyTurn();
      }
    } else if (action === 'defend') {
      state.defending = true;
      state.player.mp = Math.min(state.player.maxMp, state.player.mp + 6);
      pushLog('> [4] Guard Stance -> Damage reduced 60%, recovered +6 MP.');
      enemyTurn();
    }

    render();
  }

  function render() {
    const structDump = `struct PlayerState {
  int hp = ${state.player.hp}; // /${state.player.maxHp}
  int mp = ${state.player.mp}; // /${state.player.maxMp}
  int xp = ${state.player.xp};
  int potions = ${state.player.potions};
};

struct Encounter {
  const char* enemy = "${state.enemy.name}";
  int enemyHp = ${state.enemy.hp}; // /${state.enemy.maxHp}
  int turn = ${state.turn};
};`;

    container.innerHTML = `
      <div class="preview-stage">
        <div class="preview-chrome-bar">
          <div class="preview-chrome-left">
            <span class="preview-dots"><span class="preview-dot"></span><span class="preview-dot"></span><span class="preview-dot"></span></span>
            <span class="preview-chrome-title">./memore_rpg &middot; C++ Standalone Port</span>
          </div>
          <span class="font-mono" style="font-size:0.68rem;color:var(--violet-lavender);">
            HP ${state.player.hp}/${state.player.maxHp} &middot; MP ${state.player.mp}/${state.player.maxMp}
          </span>
        </div>

        <div class="preview-stage-body">
          <div class="cli-workspace">
            <div class="cli-terminal">
              <pre id="memore-output" class="cli-output">${state.log.join('\n')}</pre>

              <div class="cli-keypad">
                <button type="button" class="mini-pill" data-rpg="attack" ${state.victory ? 'disabled' : ''}>[1] Attack</button>
                <button type="button" class="mini-pill" data-rpg="skill" ${state.victory ? 'disabled' : ''}>[2] Memory Slash (10 MP)</button>
                <button type="button" class="mini-pill" data-rpg="potion" ${state.victory ? 'disabled' : ''}>[3] Potion (${state.player.potions})</button>
                <button type="button" class="mini-pill" data-rpg="defend" ${state.victory ? 'disabled' : ''}>[4] Defend (+6 MP)</button>
                <button type="button" class="mini-pill" data-rpg="reset">Reset Run</button>
              </div>
            </div>

            <aside class="cli-inspector">
              <div class="lobby-card">
                <div class="modal-field-label" style="margin-bottom:0.25rem;">Live C++ State Struct</div>
                <pre class="cli-file-dump">${structDump}</pre>
              </div>
              <div class="lobby-card">
                <div class="modal-field-label" style="margin-bottom:0.25rem;">Shared Asset Schema</div>
                <div class="tabletop-log">
                  <div>&rsaquo; Source: Python RPG &rarr; C++17 Binary</div>
                  <div>&rsaquo; Stage: ${state.enemyIndex + 1}/${ENEMIES.length} (${state.enemy.name})</div>
                  <div>&rsaquo; Status: ${state.victory ? 'Chapter Cleared ★' : 'Active Combat Loop'}</div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    `;

    const out = container.querySelector('#memore-output');
    if (out) out.scrollTop = out.scrollHeight;

    container.querySelectorAll('[data-rpg]').forEach((btn) => {
      btn.addEventListener('click', () => doAction(btn.getAttribute('data-rpg')));
    });
  }

  render();
}
