/**
 * Interactive Project Previews (Rendered inside the Project Inspection Modal)
 *
 * Featured Live Previews:
 * 1. cedddProjects-WEBDEV -> Actual CedCycles Website (MongoDB product snapshot + live routing)
 * 2. comProg_finals       -> Authentic Digital Deluxe C++ Hotel & Restaurant Console Kiosk + Exit/Restart
 * 3. memore-rpg           -> Authentic PENDING Terminal Text Adventure (C++ Port + Shared JSON World)
 */

import { MEMORE_WORLD } from '../data/memore-world.js';

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

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
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
          <div class="web-route-group">
            <button type="button" class="mini-pill is-active" data-cc-route="landing">Home</button>
            <button type="button" class="mini-pill" data-cc-route="shop">Shop</button>
            <button type="button" class="mini-pill" data-cc-route="cart">Cart</button>
          </div>
          <div class="web-viewport-switcher" role="group" aria-label="Preview Viewport Size">
            <button type="button" class="mini-pill is-active" data-cc-viewport="desktop" title="Desktop Width">Desktop</button>
            <button type="button" class="mini-pill" data-cc-viewport="tablet" title="Tablet Width (768px)">Tablet</button>
            <button type="button" class="mini-pill" data-cc-viewport="mobile" title="Mobile Width (390px)">Mobile</button>
          </div>
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

      <div id="cedcycles-frame-wrap" class="web-preview-frame-wrap" data-viewport="desktop">
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
  const frameWrap = container.querySelector('#cedcycles-frame-wrap');
  const urlPill = container.querySelector('#cedcycles-url-pill');
  const routeBtns = container.querySelectorAll('[data-cc-route]');
  const viewportBtns = container.querySelectorAll('[data-cc-viewport]');

  viewportBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-cc-viewport') || 'desktop';
      viewportBtns.forEach((b) => b.classList.toggle('is-active', b === btn));
      if (frameWrap) frameWrap.setAttribute('data-viewport', mode);
    });
  });

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
   PREVIEW 2: comProg_finals (Exact C++ Digital Deluxe Console Kiosk)
   Matches main.cpp, customerRecord.h, customerReservationRecord.h,
   orders.h, payment.h, and all 5 menu headers verbatim.
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

const DATE_RE = /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])-(\d{4})$/;
const TIME_RE = /^(([01][0-9]|2[0-3]):([0-5][0-9])|[0-9]:[0-5][0-9])$/;

function createInitialComProgState() {
  return {
    screen: 'main', // main | cust-menu | cust-create-name | cust-create-contact | cust-create-date | cust-create-time | cust-create-guests | cust-update-search | cust-update-contact | cust-update-date | cust-update-time | cust-update-guests | resrv-menu | menu-select | menu-items | qty | view-orders | billout | exited
    activeMenuKey: null,
    pendingItem: null,
    draftRecord: {},
    updateIndex: -1,
    customerRecordCreated: false,
    records: [],
    orders: [],
    terminalLines: [
      'C:\\comProg_finals\\cmake-build-debug> comprog.exe',
      '',
      'NAVIGATION MENU',
      '',
      '[A] Create Customer Record',
      '[B] Create Reservation Record',
      '[C] Bill Out',
      '',
      '[X] Exit',
      'Enter your choice: ',
    ],
  };
}

function mountComProgKiosk(container, { onToast } = {}) {
  let state = createInitialComProgState();

  function getTotal() {
    return state.orders.reduce((sum, o) => sum + o.qty * o.unit, 0);
  }

  function pushLines(...lines) {
    state.terminalLines.push(...lines);
    if (state.terminalLines.length > 72) {
      state.terminalLines = state.terminalLines.slice(-72);
    }
  }

  function showMainMenu() {
    state.screen = 'main';
    pushLines(
      '',
      'NAVIGATION MENU',
      '',
      '[A] Create Customer Record',
      '[B] Create Reservation Record',
      '[C] Bill Out',
      '',
      '[X] Exit',
      'Enter your choice: '
    );
  }

  function showCustomerMenu() {
    state.screen = 'cust-menu';
    pushLines(
      '',
      'CUSTOMER RECORD MODULE',
      '',
      '[A] Create Customer Record',
      '[B] Update Customer Record',
      '[C] View Customer Record',
      '',
      '[X] Return to Main Menu',
      '',
      'Enter your choice: '
    );
  }

  function showReservationModule() {
    state.screen = 'resrv-menu';
    pushLines(
      '',
      'Reservation Record Module',
      '',
      '[A] Create Orders Record',
      '[B] View Orders Record',
      '',
      '[X] Return to Navigation Menu',
      '',
      'Enter your choice: '
    );
  }

  function showCategoryMenu() {
    state.screen = 'menu-select';
    pushLines(
      '',
      '[A] Meals Menu',
      '[B] Drinks Menu',
      '[C] Desserts Menu',
      '[D] Side Dishes Menu',
      '[E] Bundled Menu',
      '',
      '[X] Return to Navigation Menu',
      '',
      'Enter your choice: '
    );
  }

  function restartProgram() {
    state = createInitialComProgState();
    render();
  }

  function autofillSampleRecord() {
    if (state.screen === 'cust-create-name' || state.screen === 'cust-menu') {
      const n = state.records.length + 1;
      const sample = {
        name: n === 1 ? 'Josh Corpuz' : `Guest ${n}`,
        contact: '950244618',
        date: '11-29-2024',
        time: '18:30',
        guests: 4,
      };
      state.records.push(sample);
      state.customerRecordCreated = true;
      pushLines(
        `> [Quick-Fill Sample] ${sample.name} | ${sample.contact} | ${sample.date} ${sample.time} | ${sample.guests} guests`,
        'Customer record saved successfully!'
      );
      if (onToast) onToast('Saved sample record to customer_records.txt');
      showMainMenu();
      render();
    }
  }

  function handleCommand(raw) {
    if (state.screen === 'exited') return;
    const cmd = raw.trim();
    if (!cmd) return;
    const upper = cmd.toUpperCase();
    pushLines(`> ${cmd}`);

    switch (state.screen) {
      case 'main': {
        if (upper === 'A') {
          showCustomerMenu();
        } else if (upper === 'B') {
          if (!state.customerRecordCreated) {
            pushLines(
              '',
              '-----   Error: You must create a customer record before making a reservation.   -----',
              ''
            );
            showMainMenu();
          } else {
            showReservationModule();
          }
        } else if (upper === 'C') {
          if (!state.customerRecordCreated) {
            pushLines(
              '',
              '-----   Error: You must create a customer record before billing out.   -----',
              ''
            );
            showMainMenu();
          } else {
            const latest = state.records[state.records.length - 1];
            const total = getTotal();
            pushLines(
              '',
              `Customer Name: ${latest.name}`,
              `Customer Phone Number: ${latest.contact}`,
              `Date of Reservation: ${latest.date}`,
              `Time of Reservation: ${latest.time}`,
              `Number of Guests: ${latest.guests}`,
              '',
              '--- YOUR ORDERS ---',
              ''
            );
            if (state.orders.length === 0) {
              pushLines('(No orders placed)');
            } else {
              state.orders.forEach((o) => {
                pushLines(`${o.name} x${o.qty} = P${(o.qty * o.unit).toFixed(2)}`);
              });
            }
            pushLines('', `Total Amount: P${total.toFixed(2)}`, 'Payment Amount: ');
            state.screen = 'billout';
          }
        } else if (upper === 'X') {
          pushLines('', 'Goodbye! Thank you for your time!', '[Process finished with exit code 0]');
          state.screen = 'exited';
        } else {
          pushLines('', 'Invalid Choice. Please try again.');
          showMainMenu();
        }
        break;
      }

      case 'cust-menu': {
        if (upper === 'A') {
          state.draftRecord = {};
          state.screen = 'cust-create-name';
          pushLines('', 'FILL UP THE FOLLOWING.', '', 'Enter customer name: ');
        } else if (upper === 'B') {
          if (state.records.length === 0) {
            pushLines('', '-----   No customer records found. Please create a record first.   -----');
            showMainMenu();
          } else {
            state.screen = 'cust-update-search';
            pushLines('', 'Customer Record Update Module', '', 'Enter customer name to update: ');
          }
        } else if (upper === 'C') {
          if (state.records.length === 0) {
            pushLines('', '-----   No customer records found. Please create a record first.   -----');
            showMainMenu();
          } else {
            pushLines('', 'Customer Records:');
            state.records.forEach((r, idx) => {
              pushLines('', `Record ${idx + 1}:`, r.name, r.contact, r.date, r.time, String(r.guests));
            });
            state.customerRecordCreated = true;
            showMainMenu();
          }
        } else if (upper === 'X') {
          pushLines('Returning to main menu...');
          showMainMenu();
        } else {
          pushLines('', 'Invalid choice. Please try again.');
          showCustomerMenu();
        }
        break;
      }

      case 'cust-create-name': {
        state.draftRecord.name = cmd;
        state.screen = 'cust-create-contact';
        pushLines('Enter contact number (+63): ');
        break;
      }

      case 'cust-create-contact': {
        state.draftRecord.contact = cmd;
        state.screen = 'cust-create-date';
        pushLines('Enter date (e.g., MM-DD-YYYY): ');
        break;
      }

      case 'cust-create-date': {
        if (!DATE_RE.test(cmd)) {
          pushLines('', 'Invalid date format.', '', 'Please enter again (MM-DD-YYYY): ');
        } else {
          state.draftRecord.date = cmd;
          state.screen = 'cust-create-time';
          pushLines('Enter time (e.g., HH:MM): ');
        }
        break;
      }

      case 'cust-create-time': {
        if (!TIME_RE.test(cmd)) {
          pushLines('', 'Invalid time format.', '', 'Please enter again (HH:MM): ');
        } else {
          state.draftRecord.time = cmd;
          state.screen = 'cust-create-guests';
          pushLines('Enter number of guests: ');
        }
        break;
      }

      case 'cust-create-guests': {
        const g = parseInt(cmd, 10);
        if (Number.isNaN(g) || g <= 0 || String(g) !== cmd) {
          pushLines('', 'Invalid input for number of guests.', '', 'Please enter the number of guests again: ');
        } else {
          state.draftRecord.guests = g;
          state.records.push({ ...state.draftRecord });
          state.customerRecordCreated = true;
          pushLines('Customer record saved successfully!');
          if (onToast) onToast('Saved record to customer_records.txt');
          showMainMenu();
        }
        break;
      }

      case 'cust-update-search': {
        const idx = state.records.findIndex((r) => r.name === cmd);
        if (idx === -1) {
          pushLines('Customer record not found.');
          showMainMenu();
        } else {
          const cur = state.records[idx];
          state.updateIndex = idx;
          state.draftRecord = { ...cur };
          state.screen = 'cust-update-contact';
          pushLines(
            'Current Record:',
            `Name: ${cur.name}`,
            `Contact: ${cur.contact}`,
            `Date: ${cur.date}`,
            `Time: ${cur.time}`,
            `Guests: ${cur.guests}`,
            '',
            'Enter new contact number (+63): '
          );
        }
        break;
      }

      case 'cust-update-contact': {
        state.draftRecord.contact = cmd;
        state.screen = 'cust-update-date';
        pushLines('Enter new date of reservation: ');
        break;
      }

      case 'cust-update-date': {
        if (!DATE_RE.test(cmd)) {
          pushLines('Invalid date format. Please enter again (MM-DD-YYYY): ');
        } else {
          state.draftRecord.date = cmd;
          state.screen = 'cust-update-time';
          pushLines('Enter new time of reservation : ');
        }
        break;
      }

      case 'cust-update-time': {
        if (!TIME_RE.test(cmd)) {
          pushLines('Invalid time format. Please enter again (HH:MM): ');
        } else {
          state.draftRecord.time = cmd;
          state.screen = 'cust-update-guests';
          pushLines('Enter new number of guests: ');
        }
        break;
      }

      case 'cust-update-guests': {
        const g = parseInt(cmd, 10);
        if (Number.isNaN(g) || g <= 0 || String(g) !== cmd) {
          pushLines('Please enter a valid number of guests: ');
        } else {
          state.draftRecord.guests = g;
          state.records[state.updateIndex] = { ...state.draftRecord };
          pushLines('Record updated successfully!');
          showMainMenu();
        }
        break;
      }

      case 'resrv-menu': {
        if (upper === 'A') {
          showCategoryMenu();
        } else if (upper === 'B') {
          state.screen = 'view-orders';
          const total = getTotal();
          pushLines('', 'Your Orders are:');
          if (state.orders.length === 0) {
            pushLines('(No orders yet)');
          } else {
            state.orders.forEach((o, i) => {
              pushLines(`${i + 1}. ${o.name} x${o.qty} = P${(o.qty * o.unit).toFixed(2)}`);
            });
          }
          pushLines('', `Total Price: P${total.toFixed(2)}`, '', "Enter 'X' to return to Main Menu: ");
        } else if (upper === 'X') {
          showMainMenu();
        } else {
          pushLines('Invalid choice, please try again.');
          showReservationModule();
        }
        break;
      }

      case 'view-orders': {
        if (upper === 'X') {
          pushLines('Returning to Main Menu...');
          showMainMenu();
        } else {
          pushLines("Invalid choice. Please press 'X' to return to the Main Menu.");
        }
        break;
      }

      case 'menu-select': {
        if (COMPROG_MENUS[upper]) {
          state.activeMenuKey = upper;
          state.screen = 'menu-items';
          const menu = COMPROG_MENUS[upper];
          pushLines('', menu.title, '');
          menu.items.forEach((it) => {
            pushLines(`[${it.key}] ${it.name.padEnd(16, ' ')} P${it.price.toFixed(2)}`);
          });
          pushLines('', '[X] Return', '', 'Choose order: ');
        } else if (upper === 'X') {
          pushLines('', 'Returning to Main Menu...');
          showMainMenu();
        } else {
          pushLines('', 'Invalid choice. Please try again.');
          showCategoryMenu();
        }
        break;
      }

      case 'menu-items': {
        if (upper === 'X') {
          showCategoryMenu();
        } else {
          const menu = COMPROG_MENUS[state.activeMenuKey];
          const item = menu && menu.items.find((i) => i.key === upper);
          if (!item) {
            pushLines('Invalid choice, please try again.');
          } else {
            state.pendingItem = item;
            state.screen = 'qty';
            pushLines('Enter Quantity: ');
          }
        }
        break;
      }

      case 'qty': {
        const qty = parseInt(cmd, 10);
        if (Number.isNaN(qty) || qty <= 0 || String(qty) !== cmd) {
          pushLines('Invalid quantity. Please enter a positive integer: ');
        } else {
          const item = state.pendingItem;
          const existing = state.orders.find((o) => o.name === item.name);
          if (existing) existing.qty += qty;
          else state.orders.push({ name: item.name, qty, unit: item.price });
          pushLines(`Added ${item.name} x${qty} = P${(item.price * qty).toFixed(2)}`);
          state.pendingItem = null;
          state.screen = 'menu-items';
          const menu = COMPROG_MENUS[state.activeMenuKey];
          pushLines('', menu.title, '');
          menu.items.forEach((it) => {
            pushLines(`[${it.key}] ${it.name.padEnd(16, ' ')} P${it.price.toFixed(2)}`);
          });
          pushLines('', '[X] Return', '', 'Choose order: ');
        }
        break;
      }

      case 'billout': {
        const paid = parseFloat(cmd);
        const total = getTotal();
        if (Number.isNaN(paid) || !/^-?\d+(\.\d+)?$/.test(cmd)) {
          pushLines('', 'Invalid input. Please enter a numeric value.', 'Payment Amount: ');
        } else if (paid < 0) {
          pushLines('', 'Payment cannot be negative. Please try again.', 'Payment Amount: ');
        } else if (paid < total) {
          pushLines('', 'Insufficient payment. Please try again.', 'Payment Amount: ');
        } else {
          const change = paid - total;
          pushLines(
            `Change: P${change.toFixed(2)}`,
            '',
            'Thank you for reserving at Digital Deluxe!',
            '',
            'Returning to Navigation Menu....'
          );
          state.orders = [];
          showMainMenu();
        }
        break;
      }

      default:
        break;
    }

    render();
  }

  function getQuickActions() {
    switch (state.screen) {
      case 'main':
        return [
          { label: '[A] Create Customer Record', cmd: 'A' },
          { label: '[B] Create Reservation Record', cmd: 'B' },
          { label: '[C] Bill Out', cmd: 'C' },
          { label: '[X] Exit', cmd: 'X' },
        ];
      case 'cust-menu':
        return [
          { label: '[A] Create Record', cmd: 'A' },
          { label: '[B] Update Record', cmd: 'B' },
          { label: '[C] View Records', cmd: 'C' },
          { label: '[X] Return to Main Menu', cmd: 'X' },
        ];
      case 'cust-create-name':
        return [
          { label: 'Sample: "Josh Corpuz"', cmd: 'Josh Corpuz' },
          { label: 'Auto-Fill Complete Record', action: 'autofill' },
        ];
      case 'cust-create-contact':
      case 'cust-update-contact':
        return [{ label: '950244618', cmd: '950244618' }];
      case 'cust-create-date':
      case 'cust-update-date':
        return [{ label: '11-29-2024', cmd: '11-29-2024' }];
      case 'cust-create-time':
      case 'cust-update-time':
        return [{ label: '18:30', cmd: '18:30' }];
      case 'cust-create-guests':
      case 'cust-update-guests':
        return [
          { label: '2', cmd: '2' },
          { label: '4', cmd: '4' },
        ];
      case 'cust-update-search':
        return state.records.map((r) => ({ label: r.name, cmd: r.name }));
      case 'resrv-menu':
        return [
          { label: '[A] Create Orders Record', cmd: 'A' },
          { label: '[B] View Orders Record', cmd: 'B' },
          { label: '[X] Return to Navigation Menu', cmd: 'X' },
        ];
      case 'view-orders':
        return [{ label: '[X] Return to Main Menu', cmd: 'X' }];
      case 'menu-select':
        return [
          { label: '[A] Meals', cmd: 'A' },
          { label: '[B] Drinks', cmd: 'B' },
          { label: '[C] Desserts', cmd: 'C' },
          { label: '[D] Side Dishes', cmd: 'D' },
          { label: '[E] Bundled', cmd: 'E' },
          { label: '[X] Return', cmd: 'X' },
        ];
      case 'menu-items': {
        const menu = COMPROG_MENUS[state.activeMenuKey];
        return [
          ...menu.items.map((it) => ({ label: `[${it.key}] ${it.name}`, cmd: it.key })),
          { label: '[X] Return', cmd: 'X' },
        ];
      }
      case 'qty':
        return [
          { label: '1', cmd: '1' },
          { label: '2', cmd: '2' },
          { label: '3', cmd: '3' },
        ];
      case 'billout': {
        const total = Math.ceil(getTotal() / 100) * 100 || 500;
        return [
          { label: `Pay P${total}`, cmd: String(total) },
          { label: `Pay P${total + 500}`, cmd: String(total + 500) },
        ];
      }
      case 'exited':
      default:
        return [];
    }
  }

  function render() {
    const isExited = state.screen === 'exited';
    const filePreview =
      state.records.length === 0
        ? '(empty — create a customer record with [A])'
        : state.records
            .map((r) => `${r.name}\n${r.contact}\n${r.date}\n${r.time}\n${r.guests}`)
            .join('\n');

    container.innerHTML = `
      <div class="preview-stage">
        <div class="preview-chrome-bar">
          <div class="preview-chrome-left">
            <span class="preview-dots"><span class="preview-dot"></span><span class="preview-dot"></span><span class="preview-dot"></span></span>
            <span class="preview-chrome-title">comprog.exe &middot; Digital Deluxe C++ Kiosk</span>
          </div>
          <div style="display:flex;align-items:center;gap:0.5rem;">
            <span class="font-mono" style="font-size:0.68rem;color:var(--violet-lavender);">
              Bill: P${getTotal().toFixed(2)}
            </span>
            <button type="button" class="mini-pill" id="comprog-restart-top">Restart</button>
          </div>
        </div>

        <div class="preview-stage-body">
          <div class="cli-workspace">
            <div class="cli-terminal">
              <pre id="comprog-output" class="cli-output">${escapeHtml(state.terminalLines.join('\n'))}</pre>

              ${
                isExited
                  ? `
                    <div class="cli-exited-banner">
                      <span>Process exited cleanly (code 0).</span>
                      <button type="button" id="comprog-restart-btn" class="btn-chrome-solid" style="padding:0.38rem 0.9rem;">
                        Restart comprog.exe
                      </button>
                    </div>
                  `
                  : `
                    <div class="cli-keypad">
                      ${getQuickActions()
                        .map((a) =>
                          a.action === 'autofill'
                            ? `<button type="button" class="mini-pill is-active" data-cli-autofill>${a.label}</button>`
                            : `<button type="button" class="mini-pill" data-cli-cmd="${escapeHtml(a.cmd)}">${escapeHtml(a.label)}</button>`
                        )
                        .join('')}
                    </div>

                    <form id="comprog-form" class="cli-prompt-row">
                      <span class="cli-prompt-prefix">cin &gt;&gt;</span>
                      <input
                        id="comprog-input"
                        type="text"
                        class="cli-input"
                        placeholder="Type input and press Enter..."
                        autocomplete="off"
                      />
                      <button type="submit" class="store-add-btn">Enter</button>
                    </form>
                  `
              }
            </div>

            <aside class="cli-inspector">
              <div class="lobby-card">
                <div class="modal-field-label" style="margin-bottom:0.25rem;">customer_records.txt (File I/O)</div>
                <pre class="cli-file-dump">${escapeHtml(filePreview)}</pre>
              </div>
              <div class="lobby-card">
                <div class="modal-field-label" style="margin-bottom:0.25rem;">Order Arrays (${state.orders.length})</div>
                <div class="tabletop-log">
                  ${
                    state.orders.length === 0
                      ? '<div>No pending orders.</div>'
                      : state.orders
                          .map((o) => `<div>&rsaquo; ${escapeHtml(o.name)} x${o.qty} — P${(o.qty * o.unit).toFixed(2)}</div>`)
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

    const topRestart = container.querySelector('#comprog-restart-top');
    const exitedRestart = container.querySelector('#comprog-restart-btn');
    if (topRestart) topRestart.addEventListener('click', restartProgram);
    if (exitedRestart) exitedRestart.addEventListener('click', restartProgram);

    const autofillBtn = container.querySelector('[data-cli-autofill]');
    if (autofillBtn) autofillBtn.addEventListener('click', autofillSampleRecord);

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
   PREVIEW 3: memore-rpg (Exact PENDING Text Adventure — C++ Port Runtime)
   Mirrors C++/src/loop.cpp, game.cpp, parser.cpp & data/*.json verbatim.
   -------------------------------------------------------------------------- */
function mountMemoreRpgCli(container) {
  const W = MEMORE_WORLD;

  function createInitialState() {
    return {
      phase: 'menu', // menu | char-name | char-pronouns | playing | summary | exited
      mode: 'normal', // normal | dialogue
      playerName: '',
      pronounId: 'they',
      hearts: W.meta.hearts,
      maxHearts: W.meta.hearts,
      room: W.meta.start,
      inventory: [],
      taken: new Set(),
      opened: new Set(),
      defeated: new Set(),
      spared: new Set(),
      flags: new Set(),
      approached: null,
      turns: 0,
      outcome: '',
      endingId: '',
      dialogue: null, // { npc, dialogueId, nodeId, options }
      lines: [
        { text: './memore-rpg.exe', style: 'muted' },
        { text: '', style: '' },
        { text: '1. Start', style: 'highlight' },
        { text: '2. Exit', style: 'highlight' },
      ],
    };
  }

  let state = createInitialState();

  function writeLine(text, style = '') {
    state.lines.push({ text, style });
    if (state.lines.length > 90) {
      state.lines = state.lines.slice(-90);
    }
  }

  function writeBlank() {
    state.lines.push({ text: '', style: '' });
  }

  function formatInlineMarkup(raw, defaultStyle = '') {
    const escaped = escapeHtml(raw);
    return escaped.replace(/\[\[(\w+)\]\]([\s\S]*?)\[\[\/\]\]/g, (_, cls, inner) => {
      return `<span class="cli-style-${cls}">${inner}</span>`;
    });
  }

  function fmt(template, extra = {}) {
    const pSet = W.pronouns.sets.find((p) => p.id === state.pronounId) || W.pronouns.sets[0];
    const map = { name: state.playerName, ...pSet, ...extra };
    return String(template).replace(/\{(\w+)\}/g, (m, k) => (k in map ? map[k] : m));
  }

  function msg(key, extra = {}) {
    return fmt(W.strings.errors[key] || key, extra);
  }

  function heartsPrompt() {
    const h = Math.max(0, Math.min(state.hearts, state.maxHearts));
    return `[${'♥'.repeat(h)}${'♡'.repeat(state.maxHearts - h)}] > `;
  }

  function currentRoom() {
    return W.rooms[state.room];
  }

  function visibleItems() {
    return (currentRoom().items || []).filter((id) => !state.taken.has(id));
  }

  function visibleObjects() {
    return (currentRoom().objects || []).filter(
      (o) => !o.hidden_unless_flag || state.flags.has(o.hidden_unless_flag)
    );
  }

  function isGone(cid) {
    return (
      state.defeated.has(cid) ||
      state.spared.has(cid) ||
      state.flags.has(`defeated_${cid}`) ||
      state.flags.has(`spared_${cid}`)
    );
  }

  function presentEnemies() {
    return (currentRoom().enemies || []).filter((eid) => !isGone(eid));
  }

  function presentNpcs() {
    return (currentRoom().npcs || []).filter((nid) => !isGone(nid));
  }

  function waysOut() {
    const out = [];
    for (const ex of currentRoom().exits || []) {
      out.push(ex.label || W.rooms[ex.to].name);
    }
    for (const obj of visibleObjects()) {
      if (obj.use && obj.use.type === 'door' && state.opened.has(obj.id)) {
        out.push(W.rooms[obj.use.goto].name);
      }
    }
    return out;
  }

  function normalize(str) {
    return str.trim().toLowerCase().replace(/\s+/g, ' ');
  }

  function cleanTarget(str) {
    const noise = new Set(W.synonyms.noise);
    return normalize(str)
      .split(' ')
      .filter((w) => w && !noise.has(w))
      .join(' ');
  }

  function matchCandidate(queryRaw, candidates) {
    const query = cleanTarget(queryRaw);
    if (!query) return { match: null, ambiguous: false };
    for (const c of candidates) {
      if (c.id === query) return { match: c, ambiguous: false };
    }
    for (const c of candidates) {
      if (cleanTarget(c.name) === query) return { match: c, ambiguous: false };
    }
    const prefixed = candidates.filter(
      (c) => c.id.startsWith(query) || cleanTarget(c.name).startsWith(query)
    );
    if (prefixed.length === 1) return { match: prefixed[0], ambiguous: false };
    if (prefixed.length > 1) return { match: null, ambiguous: true };
    return { match: null, ambiguous: false };
  }

  function matchesAny(target, options) {
    const query = cleanTarget(target);
    if (!query) return false;
    const norm = options.filter(Boolean).map(cleanTarget).filter(Boolean);
    if (norm.includes(query)) return true;
    const pref = norm.filter((o) => o.startsWith(query));
    return pref.length === 1;
  }

  function parseCommand(raw) {
    const norm = normalize(raw);
    const verbEntries = [];
    for (const [canon, aliases] of Object.entries(W.synonyms.verbs)) {
      for (const alias of aliases) {
        verbEntries.push([alias, canon]);
      }
    }
    verbEntries.sort((a, b) => b[0].length - a[0].length);

    let matchedCanon = null;
    let rest = '';
    for (const [alias, canon] of verbEntries) {
      if (norm === alias) {
        matchedCanon = canon;
        rest = '';
        break;
      }
      if (norm.startsWith(alias + ' ')) {
        matchedCanon = canon;
        rest = norm.slice(alias.length + 1).trim();
        break;
      }
    }
    if (!matchedCanon) return { error: 'unknown_command' };

    const needsTarget = ['go to', 'use', 'check', 'take', 'talk to'];
    if (needsTarget.includes(matchedCanon) && !rest) {
      return { error: 'missing_target', verb: matchedCanon };
    }

    if (matchedCanon === 'use') {
      for (const prep of W.synonyms.prepositions) {
        const token = ` ${prep} `;
        const idx = rest.indexOf(token);
        if (idx !== -1) {
          return {
            verb: 'use',
            obj: rest.slice(0, idx).trim(),
            prep,
            obj2: rest.slice(idx + token.length).trim(),
          };
        }
      }
    }

    return { verb: matchedCanon, obj: rest };
  }

  function showHearts() {
    const h = Math.max(0, Math.min(state.hearts, state.maxHearts));
    writeLine(`Hearts: ${'♥'.repeat(h)}${'♡'.repeat(state.maxHearts - h)}`, h <= 1 ? 'danger' : 'good');
  }

  function buildSummary() {
    const flags = Array.from(state.flags).sort();
    const flagStr = flags.length ? flags.join(', ') : W.strings.errors.no_flags;
    const h = Math.max(0, Math.min(state.hearts, state.maxHearts));
    const endingObj = W.endings.find((e) => e.id === state.endingId);
    const lines = [
      `Title: ${W.meta.title}`,
      `Player: ${state.playerName} (${state.pronounId})`,
      `Outcome: ${state.outcome === 'death' ? 'Death' : 'Ending'}`,
    ];
    if (state.outcome !== 'death') {
      lines.push(`Ending: ${endingObj ? endingObj.name : state.endingId}`);
    }
    lines.push(
      `Turns: ${state.turns}`,
      `Hearts: ${'♥'.repeat(h)}${'♡'.repeat(state.maxHearts - h)} (${h}/${state.maxHearts})`,
      `Flags: ${flagStr}`
    );
    return lines;
  }

  function finishRun() {
    const sorted = [...W.endings].sort((a, b) => a.priority - b.priority);
    const ending =
      sorted.find((cand) => (cand.requires_flags || []).every((f) => state.flags.has(f))) ||
      sorted[sorted.length - 1];

    state.outcome = 'ending';
    state.endingId = ending.id;
    state.phase = 'summary';
    state.mode = 'normal';
    state.dialogue = null;

    writeBlank();
    writeLine(ending.name, 'title');
    writeLine(fmt(ending.text), 'dialogue');
    writeBlank();
    buildSummary().forEach((l) => writeLine(l, 'muted'));
  }

  function triggerDeath() {
    state.outcome = 'death';
    state.phase = 'summary';
    state.mode = 'normal';
    state.dialogue = null;
    writeBlank();
    writeLine(msg('death'), 'danger');
    writeBlank();
    buildSummary().forEach((l) => writeLine(l, 'muted'));
  }

  function moveTo(dest) {
    state.room = dest;
    state.approached = null;
    writeBlank();
    writeLine(msg('entered', { room: W.rooms[dest].name }), 'muted');
    const enemies = presentEnemies();
    if (enemies.length > 0) {
      const names = enemies.map((eid) => W.enemies[eid].name).join(', ');
      writeLine(`The [[danger]]${names}[[/]] blocks your way.`, 'danger');
    }
    if (currentRoom().finish) {
      finishRun();
    }
  }

  function showDialogueNode() {
    const ctx = state.dialogue;
    const dlg = W.dialogues[ctx.dialogueId];
    const node = dlg.nodes[ctx.nodeId];
    const speaker = node.speaker || ctx.npc.name;

    writeBlank();
    writeLine(`${speaker}:`, 'dialogue');
    writeLine(fmt(node.text), 'dialogue');

    if (node.end) {
      (node.set || []).forEach((f) => state.flags.add(f));
      (node.give || []).forEach((iid) => {
        if (!state.inventory.includes(iid)) {
          state.inventory.push(iid);
          state.taken.add(iid);
          writeLine(`You receive the [[item]]${W.items[iid].name}[[/]].`, 'good');
        }
      });
      if (ctx.npc.one_shot) {
        state.flags.add((node.complete ? '_completed_' : '_failed_') + ctx.npc.id);
      }
      state.mode = 'normal';
      state.dialogue = null;
      return;
    }

    const opts = [...(node.options || []), { text: 'Leave.', leave: true }];
    ctx.options = opts;
    writeBlank();
    opts.forEach((opt, i) => {
      writeLine(`${i + 1}. ${fmt(opt.text)}`, '');
    });
  }

  function handleCommand(raw) {
    const trimmed = raw.trim();
    if (!trimmed) return;

    if (state.phase === 'menu') {
      writeLine(`> ${trimmed}`, 'muted');
      if (trimmed === '1' || trimmed.toLowerCase() === 'start') {
        state.phase = 'char-name';
        writeBlank();
        writeLine('Create your character', 'title');
      } else if (trimmed === '2' || trimmed.toLowerCase() === 'exit') {
        state.phase = 'exited';
        writeLine('Exited PENDING. [Process finished with exit code 0]', 'muted');
      } else {
        writeLine('Choose 1 or 2.', 'muted');
      }
      render();
      return;
    }

    if (state.phase === 'char-name') {
      writeLine(`Name: ${trimmed}`, 'muted');
      if (!/^[A-Za-z0-9 ]{1,24}$/.test(trimmed) || !/[A-Za-z]/.test(trimmed)) {
        writeLine('Use 1-24 ASCII letters/digits/spaces (at least one letter).', 'bad');
      } else {
        state.playerName = trimmed;
        state.phase = 'char-pronouns';
        writeBlank();
        writeLine('Pronouns:', 'muted');
        W.pronouns.sets.forEach((p, idx) => writeLine(`  ${idx + 1}. ${p.display}`));
      }
      render();
      return;
    }

    if (state.phase === 'char-pronouns') {
      writeLine(`Choose 1-3: ${trimmed}`, 'muted');
      const idx = parseInt(trimmed, 10);
      let chosen = null;
      if (!Number.isNaN(idx) && idx >= 1 && idx <= W.pronouns.sets.length) {
        chosen = W.pronouns.sets[idx - 1];
      } else {
        chosen = W.pronouns.sets.find((s) => s.id === trimmed.toLowerCase());
      }
      if (!chosen) {
        writeLine('Choose one of the listed numbers.', 'muted');
      } else {
        state.pronounId = chosen.id;
        state.phase = 'playing';
        writeBlank();
        writeLine(fmt(W.meta.intro), 'muted');
        writeBlank();
      }
      render();
      return;
    }

    if (state.phase !== 'playing') return;

    writeLine(`${heartsPrompt()}${trimmed}`, 'muted');

    if (state.mode === 'dialogue') {
      const idx = parseInt(trimmed, 10);
      if (!/^\d+$/.test(trimmed) || idx < 1 || idx > state.dialogue.options.length) {
        writeLine(msg('invalid_choice'), 'muted');
        render();
        return;
      }
      const opt = state.dialogue.options[idx - 1];
      state.turns += 1;
      if (opt.leave) {
        writeLine(msg('leave'), 'muted');
        if (state.dialogue.npc.one_shot) {
          state.flags.add(`_failed_${state.dialogue.npc.id}`);
        }
        state.mode = 'normal';
        state.dialogue = null;
        render();
        return;
      }
      state.dialogue.nodeId = opt.goto;
      showDialogueNode();
      render();
      return;
    }

    const parsed = parseCommand(trimmed);
    if (parsed.error) {
      writeLine(msg(parsed.error, { verb: parsed.verb || '' }), 'muted');
      render();
      return;
    }

    let handled = false;
    const { verb, obj, obj2 } = parsed;

    if (verb === 'help') {
      writeBlank();
      writeLine('Commands', 'title');
      W.strings.help.forEach((h) => {
        writeLine(`• [[highlight]]${h.command}[[/]] — ${h.desc}`);
      });
    } else if (verb === 'look around') {
      const r = currentRoom();
      writeBlank();
      writeLine(r.name, 'room');
      writeLine(fmt(r.desc));
      const items = visibleItems();
      if (items.length) {
        writeBlank();
        writeLine('You notice:', 'muted');
        items.forEach((iid) => writeLine(`• [[highlight]]${W.items[iid].name}[[/]]`));
      }
      const objs = visibleObjects();
      if (objs.length) {
        writeBlank();
        writeLine('You can approach:', 'muted');
        objs.forEach((o) => writeLine(`• [[highlight]]${o.name}[[/]]`));
      }
      const enemies = presentEnemies();
      if (enemies.length) {
        writeBlank();
        enemies.forEach((eid) => writeLine(`A [[danger]]${W.enemies[eid].name}[[/]] is here.`, 'danger'));
      }
      presentNpcs().forEach((nid) => {
        if (!enemies.includes(nid)) {
          writeLine(`The [[dialogue]]${W.npcs[nid].name}[[/]] is here.`);
        }
      });
      const ways = waysOut();
      writeBlank();
      writeLine(ways.length ? `Ways out: ${ways.join(', ')}` : 'No open passages from here.', 'muted');
      handled = true;
    } else if (verb === 'inventory') {
      writeBlank();
      writeLine(msg('inventory_header'), 'room');
      if (state.inventory.length === 0) {
        writeLine(msg('inventory_empty'), 'muted');
      } else {
        state.inventory.forEach((iid) => writeLine(`• [[highlight]]${W.items[iid].name}[[/]]`));
      }
      showHearts();
      handled = true;
    } else if (verb === 'take') {
      const roomCands = visibleItems().map((id) => W.items[id]);
      const res = matchCandidate(obj, roomCands);
      if (res.ambiguous) {
        writeLine(msg('ambiguous'), 'muted');
      } else if (!res.match) {
        const invCands = state.inventory.map((id) => W.items[id]);
        if (matchCandidate(obj, invCands).match) writeLine(msg('already_have'), 'muted');
        else writeLine(msg('not_here'), 'muted');
      } else if (!res.match.takeable) {
        writeLine(msg('not_takeable'), 'muted');
      } else {
        state.taken.add(res.match.id);
        state.inventory.push(res.match.id);
        writeLine(msg('took', { item: res.match.name }), 'good');
        handled = true;
      }
    } else if (verb === 'check') {
      const invRes = matchCandidate(obj, state.inventory.map((id) => W.items[id]));
      const roomRes = matchCandidate(obj, visibleItems().map((id) => W.items[id]));
      const objRes = matchCandidate(obj, visibleObjects());
      const npcRes = matchCandidate(obj, presentNpcs().map((id) => W.npcs[id]));
      const enemyRes = matchCandidate(obj, presentEnemies().map((id) => W.enemies[id]));

      if (invRes.match) {
        writeLine(fmt(invRes.match.desc), 'muted');
        handled = true;
      } else if (roomRes.match) {
        writeLine(fmt(roomRes.match.desc), 'muted');
        handled = true;
      } else if (objRes.match) {
        const targetObj = objRes.match;
        if ((!targetObj.use || targetObj.use.type !== 'door') && state.approached !== targetObj.id) {
          writeLine(msg('need_approach', { target: targetObj.name }), 'muted');
        } else {
          writeLine(fmt(targetObj.check || 'You see nothing special.'), 'muted');
          handled = true;
        }
      } else if (npcRes.match) {
        writeLine(fmt(npcRes.match.desc), 'dialogue');
        handled = true;
      } else if (enemyRes.match) {
        writeLine(fmt(enemyRes.match.desc), 'danger');
        handled = true;
      } else {
        writeLine(msg('not_here'), 'muted');
      }
    } else if (verb === 'go to') {
      let moved = false;
      for (const ex of currentRoom().exits || []) {
        if (matchesAny(obj, [ex.to, W.rooms[ex.to].name, ex.label || ''])) {
          moveTo(ex.to);
          handled = true;
          moved = true;
          break;
        }
      }
      if (!moved) {
        const openDoor = visibleObjects().find(
          (o) =>
            o.use &&
            o.use.type === 'door' &&
            state.opened.has(o.id) &&
            matchesAny(obj, [o.use.goto, W.rooms[o.use.goto].name, o.name])
        );
        if (openDoor) {
          moveTo(openDoor.use.goto);
          handled = true;
          moved = true;
        }
      }
      if (!moved) {
        const closedDoorDest = visibleObjects().find(
          (o) =>
            o.use &&
            o.use.type === 'door' &&
            !state.opened.has(o.id) &&
            matchesAny(obj, [o.use.goto, W.rooms[o.use.goto].name])
        );
        if (closedDoorDest) {
          writeLine(msg('door_closed', { door: closedDoorDest.name }), 'muted');
          moved = true;
        }
      }
      if (!moved) {
        const objRes = matchCandidate(obj, visibleObjects());
        if (objRes.match) {
          const targetObj = objRes.match;
          if (targetObj.use && targetObj.use.type === 'door') {
            if (state.opened.has(targetObj.id)) {
              moveTo(targetObj.use.goto);
              handled = true;
            } else {
              writeLine(msg('door_closed', { door: targetObj.name }), 'muted');
            }
          } else {
            state.approached = targetObj.id;
            writeLine(msg('walked', { target: targetObj.name }), 'muted');
            handled = true;
          }
          moved = true;
        }
      }
      if (!moved) {
        const nonAdj = Object.entries(W.rooms).find(([rid, r]) => matchesAny(obj, [rid, r.name]));
        writeLine(msg(nonAdj ? 'cant_go' : 'not_here'), 'muted');
      }
    } else if (verb === 'use') {
      if (obj2) {
        const source = matchCandidate(obj, state.inventory.map((id) => W.items[id])).match;
        const targetEnemy = matchCandidate(obj2, presentEnemies().map((id) => W.enemies[id])).match;
        const targetObj = matchCandidate(obj2, visibleObjects()).match;

        if (source && targetEnemy && source.id === 'moon_charm' && targetEnemy.id === 'fire_demon') {
          state.defeated.add(targetEnemy.id);
          state.flags.add('banished_demon');
          writeLine('The moon charm flares white. The fire demon bows, unravels, and is gone.', 'good');
          finishRun();
          handled = true;
        } else if (source && source.kind === 'weapon') {
          if (targetEnemy) {
            if (source.type === targetEnemy.weakness) {
              state.defeated.add(targetEnemy.id);
              writeLine(msg('correct_weapon', { weapon: source.name, enemy: targetEnemy.name }), 'good');
              state.flags.add(`defeated_${targetEnemy.id}`);
              if (targetEnemy.id === 'fire_demon') finishRun();
            } else {
              state.hearts -= 1;
              writeLine(msg('wrong_weapon', { weapon: source.name, enemy: targetEnemy.name }), 'bad');
              showHearts();
              if (state.hearts <= 0) triggerDeath();
            }
            handled = true;
          } else if (matchCandidate(obj2, presentNpcs().map((id) => W.npcs[id])).match) {
            writeLine(msg('cant_attack', { target: obj2 }), 'muted');
          } else {
            writeLine(msg('no_enemy', { enemy: obj2 }), 'muted');
          }
        } else if (source && targetObj && targetObj.use && targetObj.use.type === 'door') {
          if (targetObj.use.locked_by !== source.id) {
            writeLine(msg('doesnt_fit'), 'muted');
          } else if (state.opened.has(targetObj.id)) {
            writeLine(msg('already_open', { door: targetObj.name, target: W.rooms[targetObj.use.goto].name }), 'muted');
          } else {
            state.opened.add(targetObj.id);
            writeLine(msg('unlocked', { door: targetObj.name, item: source.name }), 'good');
            handled = true;
          }
        } else {
          writeLine(msg('nothing_happens'), 'muted');
        }
      } else {
        const inv = matchCandidate(obj, state.inventory.map((id) => W.items[id])).match;
        const targetObj = matchCandidate(obj, visibleObjects()).match;
        if (inv) {
          if (inv.kind === 'weapon') {
            writeLine(msg('ready_weapon', { weapon: inv.name }), 'muted');
          } else if (inv.type === 'note') {
            writeLine(msg('read', { item: inv.name }), 'muted');
            writeLine(fmt(inv.text || inv.desc), 'dialogue');
          } else if (inv.type === 'key') {
            writeLine("You'll need to use that on something.", 'muted');
          } else {
            writeLine(fmt(inv.desc), 'muted');
          }
          handled = true;
        } else if (targetObj) {
          const use = targetObj.use || {};
          if (use.type === 'door') {
            if (use.blocked_by_enemy && presentEnemies().includes(use.blocked_by_enemy)) {
              writeLine(msg('door_blocked', { enemy: W.enemies[use.blocked_by_enemy].name }), 'muted');
            } else if (state.opened.has(targetObj.id)) {
              writeLine(msg('already_open', { door: targetObj.name, target: W.rooms[use.goto].name }), 'muted');
            } else if (use.locked_by) {
              if (state.inventory.includes(use.locked_by)) {
                state.opened.add(targetObj.id);
                writeLine(msg('unlocked', { door: targetObj.name, item: W.items[use.locked_by].name }), 'good');
                handled = true;
              } else {
                writeLine(msg('door_locked', { door: targetObj.name }), 'muted');
              }
            } else {
              state.opened.add(targetObj.id);
              writeLine(msg('opened', { door: targetObj.name }), 'good');
              writeLine(`Beyond it you can see the ${W.rooms[use.goto].name}.`, 'muted');
              handled = true;
            }
          } else if (state.approached !== targetObj.id) {
            writeLine(msg('need_approach', { target: targetObj.name }), 'muted');
          } else {
            writeLine(fmt(targetObj.check || 'You see nothing special.'), 'muted');
            handled = true;
          }
        } else {
          writeLine(msg('not_here'), 'muted');
        }
      }
    } else if (verb === 'talk to') {
      const npc = matchCandidate(obj, presentNpcs().map((id) => W.npcs[id])).match;
      if (!npc) {
        writeLine(msg('no_npc'), 'muted');
      } else if (
        npc.one_shot &&
        (state.flags.has(`_completed_${npc.id}`) || state.flags.has(`_failed_${npc.id}`))
      ) {
        writeLine(msg('npc_done', { name: npc.name }), 'muted');
      } else {
        const dlg = W.dialogues[npc.dialogue];
        state.mode = 'dialogue';
        state.dialogue = { npc, dialogueId: npc.dialogue, nodeId: dlg.start, options: [] };
        showDialogueNode();
        handled = true;
      }
    }

    if (handled) state.turns += 1;
    render();
  }

  function getContextualChips() {
    if (state.phase === 'menu') {
      return ['1', '2'];
    }
    if (state.phase === 'char-name') {
      return ['Ceddd', 'Traveler'];
    }
    if (state.phase === 'char-pronouns') {
      return ['1', '2', '3'];
    }
    if (state.phase === 'playing') {
      if (state.mode === 'dialogue') {
        return state.dialogue.options.map((_, i) => String(i + 1));
      }
      const chips = ['LOOK AROUND'];
      visibleItems().forEach((iid) => chips.push(`TAKE ${W.items[iid].name}`));
      visibleObjects()
        .filter((o) => o.use && o.use.type === 'door')
        .forEach((o) => {
          if (state.opened.has(o.id)) chips.push(`GO TO ${W.rooms[o.use.goto].name}`);
          else chips.push(`USE ${o.name}`);
        });
      (currentRoom().exits || []).forEach((ex) => chips.push(`GO TO ${ex.label || W.rooms[ex.to].name}`));
      presentNpcs().forEach((nid) => chips.push(`TALK TO ${W.npcs[nid].name}`));
      presentEnemies().forEach((eid) => {
        const w = state.inventory.find((iid) => W.items[iid].kind === 'weapon');
        if (w) chips.push(`USE ${W.items[w].name} ON ${W.enemies[eid].name}`);
        if (eid === 'fire_demon' && state.inventory.includes('moon_charm')) {
          chips.push('USE moon charm ON fire demon');
        }
      });
      if (state.inventory.includes('letter')) chips.push('USE letter');
      chips.push('INVENTORY', 'HELP');
      return chips.slice(0, 8);
    }
    return [];
  }

  function render() {
    const isMenuOrDone = state.phase === 'exited' || state.phase === 'summary';
    const roomObj = currentRoom();
    const ways = state.phase === 'playing' ? waysOut() : [];
    const h = Math.max(0, Math.min(state.hearts, state.maxHearts));

    container.innerHTML = `
      <div class="preview-stage">
        <div class="preview-chrome-bar">
          <div class="preview-chrome-left">
            <span class="preview-dots"><span class="preview-dot"></span><span class="preview-dot"></span><span class="preview-dot"></span></span>
            <span class="preview-chrome-title">memore-rpg.exe &middot; PENDING (C++17 Port)</span>
          </div>
          <div style="display:flex;align-items:center;gap:0.5rem;">
            <span class="font-mono" style="font-size:0.68rem;color:var(--violet-lavender);">
              ${'♥'.repeat(h)}${'♡'.repeat(state.maxHearts - h)} &middot; ${state.phase === 'playing' ? roomObj.name : state.phase}
            </span>
            <button type="button" class="mini-pill" id="memore-restart-top">Restart</button>
          </div>
        </div>

        <div class="preview-stage-body">
          <div class="cli-workspace">
            <div class="cli-terminal">
              <pre id="memore-output" class="cli-output">${state.lines
                .map((l) => `<span class="cli-line ${l.style ? `cli-style-${l.style}` : ''}">${formatInlineMarkup(l.text)}</span>`)
                .join('\n')}</pre>

              ${
                isMenuOrDone
                  ? `
                    <div class="cli-exited-banner">
                      <span>${state.phase === 'exited' ? 'Exited memore-rpg.exe (code 0).' : 'Run complete — summary logged.'}</span>
                      <button type="button" id="memore-restart-btn" class="btn-chrome-solid" style="padding:0.38rem 0.9rem;">
                        ${state.phase === 'exited' ? 'Restart memore-rpg.exe' : 'Return to Main Menu'}
                      </button>
                    </div>
                  `
                  : `
                    <div class="cli-keypad">
                      ${getContextualChips()
                        .map((c) => `<button type="button" class="mini-pill" data-rpg-cmd="${escapeHtml(c)}">${escapeHtml(c)}</button>`)
                        .join('')}
                    </div>

                    <form id="memore-form" class="cli-prompt-row">
                      <span class="cli-prompt-prefix">${state.phase === 'playing' ? escapeHtml(heartsPrompt()) : '&gt; '}</span>
                      <input
                        id="memore-input"
                        type="text"
                        class="cli-input"
                        placeholder="${
                          state.phase === 'char-name'
                            ? 'Enter character name (e.g. Ceddd)...'
                            : state.phase === 'char-pronouns'
                              ? 'Choose 1, 2, or 3...'
                              : state.mode === 'dialogue'
                                ? 'Choose reply number...'
                                : 'Type command (LOOK AROUND, TAKE, USE, GO TO, TALK TO)...'
                        }"
                        autocomplete="off"
                      />
                      <button type="submit" class="store-add-btn">Send</button>
                    </form>
                  `
              }
            </div>

            <aside class="cli-inspector">
              <div class="lobby-card">
                <div class="modal-field-label" style="margin-bottom:0.25rem;">GameState (C++ Runtime)</div>
                <div class="tabletop-log">
                  <div>&rsaquo; Player: ${escapeHtml(state.playerName || '—')} (${state.pronounId})</div>
                  <div>&rsaquo; Room: ${escapeHtml(roomObj ? roomObj.name : state.room)}</div>
                  <div>&rsaquo; Hearts: ${'♥'.repeat(h)}${'♡'.repeat(state.maxHearts - h)} (${h}/${state.maxHearts})</div>
                  <div>&rsaquo; Turns: ${state.turns}</div>
                  <div>&rsaquo; Ways out: ${ways.length ? escapeHtml(ways.join(', ')) : '—'}</div>
                </div>
              </div>

              <div class="lobby-card">
                <div class="modal-field-label" style="margin-bottom:0.25rem;">Inventory &amp; Flags</div>
                <div class="tabletop-log">
                  <div>&rsaquo; Items: ${state.inventory.length ? state.inventory.map((i) => W.items[i].name).join(', ') : 'none'}</div>
                  <div>&rsaquo; Flags: ${state.flags.size ? Array.from(state.flags).sort().join(', ') : 'none'}</div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    `;

    const out = container.querySelector('#memore-output');
    if (out) out.scrollTop = out.scrollHeight;

    const restartTop = container.querySelector('#memore-restart-top');
    const restartBtn = container.querySelector('#memore-restart-btn');
    const doReset = () => {
      state = createInitialState();
      render();
    };
    if (restartTop) restartTop.addEventListener('click', doReset);
    if (restartBtn) restartBtn.addEventListener('click', doReset);

    container.querySelectorAll('[data-rpg-cmd]').forEach((btn) => {
      btn.addEventListener('click', () => handleCommand(btn.getAttribute('data-rpg-cmd')));
    });

    const form = container.querySelector('#memore-form');
    const input = container.querySelector('#memore-input');
    if (form && input) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        handleCommand(input.value);
      });
    }
  }

  render();
}
