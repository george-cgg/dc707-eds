// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    name: 'Bigster',
    description: 'The most spacious and best-equipped SUV in the range, now with a hybrid-G LPG powertrain, automatic gearbox and 4x4 traction.',
    image_url: 'https://cdn.group.renault.com/dac/ro/gpl/Bigster%20GPL.jpg.ximg.large.webp/e6921f98ca.webp',
    price: 'de la 20.490 EUR',
    category: 'SUV',
  },
  {
    name: 'Duster',
    description: 'Rugged compact SUV available with full hybrid and hybrid-G 150 4x4 powertrains for everyday versatility.',
    image_url: 'https://cdn.group.renault.com/dac/ro/gpl/Duster%20GPL.jpg.ximg.large.webp/589927f26b.webp',
    price: 'de la 17.100 EUR',
    category: 'SUV',
  },
  {
    name: 'Noul Logan',
    description: 'Practical and affordable sedan with efficient ECO-G 120 powertrain.',
    image_url: 'https://cdn.group.renault.com/dac/ro/gpl/Logan%20GPL.jpg.ximg.large.webp/7d9c1a07d2.webp',
    price: 'de la 12.650 EUR',
    category: 'Sedan',
  },
  {
    name: 'Noul Sandero Stepway',
    description: 'Crossover-styled compact car available with a new hybrid 155 powertrain, its first electrified engine.',
    image_url: 'https://cdn.group.renault.com/dac/ro/gpl/Stepway%20GPL.jpg.ximg.large.webp/7b6547eeb1.webp',
    price: 'de la 13.650 EUR',
    category: 'Crossover',
  },
  {
    name: 'Noul Jogger',
    description: 'Versatile family vehicle with up to seven seats and full hybrid powertrain options.',
    image_url: 'https://cdn.group.renault.com/dac/ro/gpl/Jogger-GPL.jpg.ximg.large.webp/7292573e4a.webp',
    price: 'de la 16.650 EUR',
    category: 'Family / MPV',
  },
  {
    name: 'Spring',
    description: 'Fully electric city car offering the most affordable entry into electric mobility in the range.',
    image_url: 'https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/dacia-bbg/spring-s2e-ph2-my26/overview/editorial/dacia-spring-s2e-ph2-overview-004-desktop.jpg.ximg.large.webp/996cc8fe4d.webp',
    price: 'de la 13.590 EUR',
    category: 'Electric City Car',
  },
];

// Model options for the test drive selector, from inputSchema.model.enum.
const MODEL_OPTIONS = ['Bigster', 'Duster', 'Noul Logan', 'Noul Sandero Stepway', 'Noul Jogger', 'Spring'];

// Brand palette from the action payload — used to derive the header background.
const PALETTE = ['#646b52'];
function getThemedCardBg(palette) {
  if (!palette || !palette[0]) return null;
  let hex = palette[0].replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length !== 6) return null;
  let [r, g, b] = [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  const lum = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  const relLum = (rr, gg, bb) => 0.2126 * lum(rr) + 0.7152 * lum(gg) + 0.0722 * lum(bb);
  if (relLum(r, g, b) <= 0.12) return { bg: `#${hex}`, fg: '#ffffff' };
  let lo = 0, hi = 1;
  for (let i = 0; i < 20; i++) { const m = (lo + hi) / 2; if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m; }
  const dr = Math.round(r * lo), dg = Math.round(g * lo), db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}
const theme = getThemedCardBg(PALETTE);

const CARD_COLORS = ['#378ef0', '#9256d9', '#0fb5ae', '#e68619', '#d83790', '#2dca72'];

export default async function decorate(block, bridge) {
  let confirmation = null;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (!isPreview) {
      // Production — the tool result carries the booking confirmation (flat object).
      const _result = await bridge.toolResult;
      confirmation = _result?.structuredContent || null;
    }
  }

  block.textContent = '';

  if (confirmation && (confirmation.confirmation_id || confirmation.status || confirmation.message)) {
    renderConfirmation(block, confirmation);
  } else {
    renderForm(block, SAMPLE_DATA, bridge);
  }

  if (bridge) {
    bridge.reportSize(block.offsetWidth, block.offsetHeight);
    let resizeTimer;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => bridge.reportSize(block.offsetWidth, block.offsetHeight), 150);
    });
    ro.observe(block);
  }
}

function renderForm(block, models, bridge) {
  const card = document.createElement('div');
  card.className = 'btd-card';

  // Hero — default to the Jogger (matches the preview intent), fall back gracefully.
  const hero = models.find((m) => m.name === 'Noul Jogger') || models[0];
  const heroWrap = document.createElement('div');
  heroWrap.className = 'btd-hero';
  const fallbackColor = CARD_COLORS[0];
  const colorDiv = () => {
    const d = document.createElement('div');
    d.style.cssText = `width:100%;height:100%;background-color:${fallbackColor};`;
    return d;
  };
  if (hero && hero.image_url) {
    const img = document.createElement('img');
    img.src = hero.image_url;
    img.alt = hero.name || 'Dacia model';
    img.onerror = () => img.parentNode.replaceChild(colorDiv(), img);
    heroWrap.appendChild(img);
  } else {
    heroWrap.appendChild(colorDiv());
  }
  card.appendChild(heroWrap);

  // Header — palette-colored block with title + description.
  const header = document.createElement('div');
  header.className = 'btd-header';
  header.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;
  const title = document.createElement('h3');
  title.className = 'btd-title';
  title.textContent = 'Programează un test drive';
  header.appendChild(title);
  const desc = document.createElement('p');
  desc.className = 'btd-desc';
  desc.textContent = 'Alege modelul Dacia dorit și completează datele de contact pentru a rezerva un test drive la un dealer din apropiere.';
  header.appendChild(desc);
  card.appendChild(header);

  // Form.
  const form = document.createElement('form');
  form.className = 'btd-form';

  const modelSelect = buildSelect('Model', true, MODEL_OPTIONS, hero ? hero.name : MODEL_OPTIONS[0]);
  const nameInput = buildInput('Nume complet', true, 'text', 'Ex: Ana Popescu');
  const emailInput = buildInput('Email', true, 'email', 'nume@exemplu.ro');
  const phoneInput = buildInput('Telefon', true, 'tel', '07xx xxx xxx');
  const cityInput = buildInput('Oraș / dealer', false, 'text', 'Ex: Cluj-Napoca');

  form.append(modelSelect.field, nameInput.field, emailInput.field, phoneInput.field, cityInput.field);

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'btd-submit';
  submit.textContent = 'Programează test drive';
  form.appendChild(submit);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const model = modelSelect.el.value;
    const fullName = nameInput.el.value.trim();
    const email = emailInput.el.value.trim();
    const phone = phoneInput.el.value.trim();
    const city = cityInput.el.value.trim();
    if (!model || !fullName || !email || !phone) return;
    if (bridge) {
      const parts = [
        `Aș dori să programez un test drive pentru Dacia ${model}.`,
        `Nume: ${fullName}`,
        `Email: ${email}`,
        `Telefon: ${phone}`,
      ];
      if (city) parts.push(`Oraș/dealer preferat: ${city}`);
      bridge.sendMessage(parts.join(' '));
    }
  });

  card.appendChild(form);
  block.appendChild(card);
}

function buildInput(labelText, required, type, placeholder) {
  const field = document.createElement('div');
  field.className = 'btd-field';
  const label = document.createElement('label');
  label.className = 'btd-label';
  label.textContent = labelText;
  if (required) {
    const req = document.createElement('span');
    req.className = 'btd-req';
    req.textContent = '*';
    label.appendChild(req);
  }
  const input = document.createElement('input');
  input.className = 'btd-input';
  input.type = type;
  input.placeholder = placeholder;
  if (required) input.required = true;
  const id = `btd-${labelText.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  input.id = id;
  label.htmlFor = id;
  field.append(label, input);
  return { field, el: input };
}

function buildSelect(labelText, required, options, selected) {
  const field = document.createElement('div');
  field.className = 'btd-field';
  const label = document.createElement('label');
  label.className = 'btd-label';
  label.textContent = labelText;
  if (required) {
    const req = document.createElement('span');
    req.className = 'btd-req';
    req.textContent = '*';
    label.appendChild(req);
  }
  const select = document.createElement('select');
  select.className = 'btd-select';
  if (required) select.required = true;
  options.forEach((opt) => {
    const o = document.createElement('option');
    o.value = opt;
    o.textContent = opt;
    if (opt === selected) o.selected = true;
    select.appendChild(o);
  });
  const id = `btd-${labelText.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  select.id = id;
  label.htmlFor = id;
  field.append(label, select);
  return { field, el: select };
}

function renderConfirmation(block, confirmation) {
  const card = document.createElement('div');
  card.className = 'btd-card';

  const header = document.createElement('div');
  header.className = 'btd-header';
  header.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;
  const title = document.createElement('h3');
  title.className = 'btd-title';
  title.textContent = 'Test drive';
  header.appendChild(title);
  card.appendChild(header);

  const confirm = document.createElement('div');
  confirm.className = 'btd-confirm';

  const icon = document.createElement('div');
  icon.className = 'btd-confirm-icon';
  icon.textContent = '✓';
  confirm.appendChild(icon);

  const status = document.createElement('div');
  status.className = 'btd-confirm-status';
  status.textContent = confirmation.status || 'Rezervare confirmată';
  confirm.appendChild(status);

  if (confirmation.message) {
    const msg = document.createElement('div');
    msg.className = 'btd-confirm-msg';
    msg.textContent = confirmation.message;
    confirm.appendChild(msg);
  }

  if (confirmation.confirmation_id) {
    const cid = document.createElement('div');
    cid.className = 'btd-confirm-id';
    cid.textContent = `ID: ${confirmation.confirmation_id}`;
    confirm.appendChild(cid);
  }

  card.appendChild(confirm);
  block.appendChild(card);
}
