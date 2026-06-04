/* ============================================
   XENO SHOP — Main Script
   ============================================ */

'use strict';

// ── Config ──────────────────────────────────────────────────────
const CONFIG = {
  ADMIN_PIN: '123456',
  STORAGE_KEY: 'xeno_accounts',
  RANKS_ORDER: ['Radiant','Immortal 3','Immortal 2','Immortal 1','Ascendant 3','Ascendant 2','Ascendant 1','Diamond 3','Diamond 2','Diamond 1','Platinum 3','Platinum 2','Platinum 1','Gold 3','Gold 2','Gold 1','Silver 3','Silver 2','Silver 1','Bronze 3','Bronze 2','Bronze 1','Iron 3','Iron 2','Iron 1'],
};

// ── State ────────────────────────────────────────────────────────
const STATE = {
  accounts: [],
  filtered: [],
  editingId: null,
  adminLoggedIn: false,
  editImageData: null,
};

// ── DOM References ───────────────────────────────────────────────
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

// ================================================================
// DATA LAYER
// ================================================================

async function loadAccounts() {
  // Try localStorage first
  const stored = localStorage.getItem(CONFIG.STORAGE_KEY);
  if (stored) {
    try {
      STATE.accounts = JSON.parse(stored);
      return;
    } catch(e) {}
  }
  // Fall back to accounts.json
  try {
    const res = await fetch('accounts.json');
    STATE.accounts = await res.json();
    saveAccounts();
  } catch(e) {
    STATE.accounts = [];
  }
}

function saveAccounts() {
  localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(STATE.accounts));
}

function generateId() {
  return 'acc_' + Date.now() + '_' + Math.random().toString(36).substr(2,5);
}

// ================================================================
// NAVBAR SCROLL EFFECT
// ================================================================

window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  nav.classList.toggle('scrolled', window.scrollY > 20);
});

// ================================================================
// RANK HELPERS
// ================================================================

function getRankTier(rank) {
  const r = rank.toLowerCase();
  if (r.includes('radiant'))   return 'radiant';
  if (r.includes('immortal'))  return 'immortal';
  if (r.includes('ascendant')) return 'ascendant';
  if (r.includes('diamond'))   return 'diamond';
  if (r.includes('platinum'))  return 'platinum';
  if (r.includes('gold'))      return 'gold';
  if (r.includes('silver'))    return 'silver';
  if (r.includes('bronze'))    return 'bronze';
  return 'iron';
}

function getRankIcon(tier) {
  const icons = {
    radiant: '☀️', immortal: '💜', ascendant: '🌿',
    diamond: '💎', platinum: '🔷', gold: '🥇',
    silver: '🥈', bronze: '🥉', iron: '⚙️'
  };
  return icons[tier] || '🎮';
}

// ================================================================
// RENDER CARDS
// ================================================================

function renderCards(list) {
  const grid = $('cards-grid');
  const count = $('results-count');
  if (!grid) return;

  const available = list.filter(a => a.status === 'available').length;

  if (count) {
    count.innerHTML = `แสดง <strong>${list.length}</strong> รายการ &nbsp;|&nbsp; พร้อมขาย <strong>${available}</strong> รายการ`;
  }

  if (!list.length) {
    grid.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">🎮</div>
        <h3>ไม่พบไอดีที่ค้นหา</h3>
        <p>ลองเปลี่ยนเงื่อนไขการค้นหาใหม่อีกครั้ง</p>
      </div>`;
    return;
  }

  grid.innerHTML = list.map((acc, i) => {
    const tier = acc.rankTier || getRankTier(acc.rank);
    const isSold = acc.status === 'sold';
    return `
    <div class="account-card" style="animation-delay:${i * 0.06}s">
      <div class="card-image-wrap">
        <img src="${escapeHtml(acc.image)}" alt="${escapeHtml(acc.name)}" loading="lazy"
             onerror="this.src='https://placehold.co/400x225/1a1a1a/ff4d00?text=XENO'">
        <div class="card-status ${isSold ? 'status-sold' : 'status-available'}">
          ${isSold ? '❌ ขายแล้ว' : '✅ พร้อมขาย'}
        </div>
        <div class="card-rank-badge">
          <span class="rank-badge rank-${tier}">
            ${getRankIcon(tier)} ${escapeHtml(acc.rank)}
          </span>
        </div>
      </div>
      <div class="card-body">
        <div class="card-name">${escapeHtml(acc.name)}</div>
        <div class="card-desc">${escapeHtml(acc.description || '')}</div>
        <div class="card-meta">
          <div class="meta-item">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span>${acc.skins} สกิน</span>
          </div>
          <div class="meta-item">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span>${isSold ? 'ขายแล้ว' : 'พร้อมขาย'}</span>
          </div>
        </div>
        <div class="card-footer">
          <div class="card-price">
            <sub>฿</sub>${Number(acc.price).toLocaleString()}
          </div>
          ${!isSold ? `<button class="btn btn-primary btn-sm" onclick="handleContact('${acc.id}')">
            <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            สนใจ
          </button>` : `<span style="font-family:var(--font-ui);font-size:12px;color:var(--white-20);font-weight:600;letter-spacing:.08em">SOLD OUT</span>`}
        </div>
      </div>
      ${isSold ? `<div class="card-sold-overlay"><div class="sold-text">SOLD</div></div>` : ''}
    </div>`;
  }).join('');
}

function handleContact(id) {
  const acc = STATE.accounts.find(a => a.id === id);
  if (!acc) return;
  showToast(`💬 กรุณาติดต่อ Admin เพื่อซื้อ "${acc.name}"`, 'info', 4000);
}

// ================================================================
// FILTER & SEARCH
// ================================================================

function applyFilters() {
  const search = ($('search-name')?.value || '').toLowerCase().trim();
  const rank   = ($('filter-rank')?.value || '');
  const minP   = parseFloat($('filter-price-min')?.value) || 0;
  const maxP   = parseFloat($('filter-price-max')?.value) || Infinity;
  const status = ($('filter-status')?.value || '');

  STATE.filtered = STATE.accounts.filter(acc => {
    const matchName   = !search || acc.name.toLowerCase().includes(search) || (acc.description||'').toLowerCase().includes(search);
    const matchRank   = !rank   || acc.rank.toLowerCase().includes(rank.toLowerCase());
    const matchPrice  = acc.price >= minP && acc.price <= maxP;
    const matchStatus = !status || acc.status === status;
    return matchName && matchRank && matchPrice && matchStatus;
  });

  renderCards(STATE.filtered);
}

function clearFilters() {
  ['search-name','filter-rank','filter-price-min','filter-price-max','filter-status'].forEach(id => {
    const el = $(id);
    if (el) el.value = '';
  });
  applyFilters();
}

// ================================================================
// ADMIN LOGIN
// ================================================================

function openLoginModal() {
  const overlay = $('login-modal');
  overlay?.classList.add('active');
  clearPinInputs();
  $('login-error')?.classList.remove('show');
  setTimeout(() => $$('.pin-digit')[0]?.focus(), 100);
}

function closeLoginModal() {
  $('login-modal')?.classList.remove('active');
}

function clearPinInputs() {
  $$('.pin-digit').forEach(d => d.value = '');
}

function getPin() {
  return Array.from($$('.pin-digit')).map(d => d.value).join('');
}

function submitLogin() {
  const pin = getPin();
  if (pin === CONFIG.ADMIN_PIN) {
    STATE.adminLoggedIn = true;
    closeLoginModal();
    openAdminPanel();
  } else {
    const err = $('login-error');
    if (err) { err.classList.add('show'); err.textContent = '❌ รหัสผ่านไม่ถูกต้อง ลองอีกครั้ง'; }
    clearPinInputs();
    $$('.pin-digit')[0]?.focus();
    $$('.pin-digit').forEach(d => {
      d.style.borderColor = '#ff5555';
      setTimeout(() => d.style.borderColor = '', 800);
    });
  }
}

// PIN input auto-advance
function initPinInputs() {
  const digits = Array.from($$('.pin-digit'));
  digits.forEach((d, i) => {
    d.addEventListener('input', e => {
      d.value = d.value.replace(/[^0-9]/g,'').slice(-1);
      if (d.value && i < digits.length - 1) digits[i+1].focus();
      if (i === digits.length - 1 && getPin().length === 6) submitLogin();
    });
    d.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && !d.value && i > 0) digits[i-1].focus();
      if (e.key === 'Enter') submitLogin();
    });
    d.addEventListener('paste', e => {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g,'').slice(0,6);
      text.split('').forEach((ch, j) => { if (digits[j]) digits[j].value = ch; });
      if (text.length === 6) submitLogin();
      else if (digits[text.length]) digits[text.length].focus();
    });
  });
}

// ================================================================
// ADMIN PANEL
// ================================================================

function openAdminPanel() {
  $('admin-panel')?.classList.add('active');
  renderAdminTable();
  updateDashStats();
}

function closeAdminPanel() {
  $('admin-panel')?.classList.remove('active');
  STATE.adminLoggedIn = false;
  renderCards(STATE.filtered);
}

function updateDashStats() {
  const total    = STATE.accounts.length;
  const available= STATE.accounts.filter(a => a.status==='available').length;
  const sold     = STATE.accounts.filter(a => a.status==='sold').length;
  const revenue  = STATE.accounts.filter(a=>a.status==='sold').reduce((s,a)=>s+Number(a.price),0);
  $('stat-total')    && ($('stat-total').textContent    = total);
  $('stat-available')&& ($('stat-available').textContent= available);
  $('stat-sold')     && ($('stat-sold').textContent     = sold);
  $('stat-revenue')  && ($('stat-revenue').textContent  = '฿' + revenue.toLocaleString());
}

function renderAdminTable() {
  const tbody = $('admin-tbody');
  if (!tbody) return;
  if (!STATE.accounts.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--white-20);font-family:var(--font-ui);letter-spacing:.08em">ยังไม่มีไอดีในระบบ</td></tr>`;
    return;
  }
  tbody.innerHTML = STATE.accounts.map(acc => {
    const tier = acc.rankTier || getRankTier(acc.rank);
    return `
    <tr>
      <td><img class="table-img" src="${escapeHtml(acc.image)}" alt="" onerror="this.src='https://placehold.co/80x45/1a1a1a/ff4d00?text=IMG'"></td>
      <td style="font-family:var(--font-display);font-weight:700;font-size:15px">${escapeHtml(acc.name)}</td>
      <td><span class="rank-badge rank-${tier}">${getRankIcon(tier)} ${escapeHtml(acc.rank)}</span></td>
      <td style="font-family:var(--font-ui);font-weight:600">${acc.skins} สกิน</td>
      <td style="font-family:var(--font-display);font-size:18px;font-weight:800;color:var(--orange)">฿${Number(acc.price).toLocaleString()}</td>
      <td>
        <span style="font-family:var(--font-ui);font-size:11px;font-weight:700;letter-spacing:.1em;padding:3px 10px;border-radius:2px;${acc.status==='available'?'background:rgba(68,221,136,.15);color:#44dd88':'background:rgba(255,50,50,.15);color:#ff5555'}">
          ${acc.status === 'available' ? 'พร้อมขาย' : 'ขายแล้ว'}
        </span>
      </td>
      <td>
        <div class="table-actions">
          <button class="btn btn-outline btn-sm" onclick="openEditModal('${acc.id}')">✏️ แก้ไข</button>
          ${acc.status==='available' ? `<button class="btn btn-success btn-sm" onclick="markSold('${acc.id}')">💰 ขายแล้ว</button>` : `<button class="btn btn-outline btn-sm" onclick="markAvailable('${acc.id}')">🔄 คืนสถานะ</button>`}
          <button class="btn btn-danger btn-sm" onclick="deleteAccount('${acc.id}')">🗑️ ลบ</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

// ================================================================
// ADD / EDIT / DELETE
// ================================================================

function handleAddAccount(e) {
  e.preventDefault();
  const name  = $('add-name')?.value.trim();
  const rank  = $('add-rank')?.value.trim();
  const skins = parseInt($('add-skins')?.value) || 0;
  const price = parseFloat($('add-price')?.value) || 0;
  const desc  = $('add-desc')?.value.trim() || '';
  const imgUrl= $('add-image-url')?.value.trim();
  const imgB64= $('add-image-preview')?.dataset.base64;

  if (!name || !rank || !price) {
    showToast('⚠️ กรุณากรอกข้อมูลให้ครบ (ชื่อ, Rank, ราคา)', 'error');
    return;
  }

  const image = imgB64 || imgUrl || `https://placehold.co/400x225/1a1a1a/ff4d00?text=${encodeURIComponent(name)}`;

  const newAcc = {
    id: generateId(),
    name, rank,
    rankTier: getRankTier(rank),
    skins, price, description: desc,
    image,
    status: 'available',
    createdAt: new Date().toISOString().split('T')[0]
  };

  STATE.accounts.unshift(newAcc);
  saveAccounts();
  renderAdminTable();
  updateDashStats();
  applyFilters();

  // Reset form
  $('add-account-form')?.reset();
  const preview = $('add-image-preview');
  if (preview) { preview.style.display='none'; preview.dataset.base64=''; }

  showToast(`✅ เพิ่มไอดี "${name}" สำเร็จ`, 'success');
}

function openEditModal(id) {
  const acc = STATE.accounts.find(a => a.id === id);
  if (!acc) return;
  STATE.editingId = id;
  STATE.editImageData = null;

  $('edit-name').value  = acc.name;
  $('edit-rank').value  = acc.rank;
  $('edit-skins').value = acc.skins;
  $('edit-price').value = acc.price;
  $('edit-desc').value  = acc.description || '';
  $('edit-image-url').value = acc.image && !acc.image.startsWith('data:') ? acc.image : '';
  $('edit-status').value = acc.status;

  const prev = $('edit-image-preview');
  if (prev) { prev.src = acc.image; prev.style.display = 'block'; }

  $('edit-modal')?.classList.add('active');
}

function closeEditModal() {
  $('edit-modal')?.classList.remove('active');
  STATE.editingId = null;
}

function handleEditAccount(e) {
  e.preventDefault();
  if (!STATE.editingId) return;

  const idx = STATE.accounts.findIndex(a => a.id === STATE.editingId);
  if (idx === -1) return;

  const name   = $('edit-name')?.value.trim();
  const rank   = $('edit-rank')?.value.trim();
  const skins  = parseInt($('edit-skins')?.value) || 0;
  const price  = parseFloat($('edit-price')?.value) || 0;
  const desc   = $('edit-desc')?.value.trim() || '';
  const imgUrl = $('edit-image-url')?.value.trim();
  const imgB64 = STATE.editImageData;
  const status = $('edit-status')?.value;

  if (!name || !rank || !price) {
    showToast('⚠️ กรุณากรอกข้อมูลให้ครบ', 'error');
    return;
  }

  const image = imgB64 || imgUrl || STATE.accounts[idx].image;

  STATE.accounts[idx] = {
    ...STATE.accounts[idx],
    name, rank, rankTier: getRankTier(rank),
    skins, price, description: desc,
    image, status
  };

  saveAccounts();
  renderAdminTable();
  updateDashStats();
  applyFilters();
  closeEditModal();
  showToast(`✅ แก้ไขไอดี "${name}" สำเร็จ`, 'success');
}

function deleteAccount(id) {
  const acc = STATE.accounts.find(a => a.id === id);
  if (!acc) return;
  if (!confirm(`ต้องการลบไอดี "${acc.name}" ใช่หรือไม่?`)) return;
  STATE.accounts = STATE.accounts.filter(a => a.id !== id);
  saveAccounts();
  renderAdminTable();
  updateDashStats();
  applyFilters();
  showToast(`🗑️ ลบไอดี "${acc.name}" แล้ว`, 'error');
}

function markSold(id) {
  const acc = STATE.accounts.find(a => a.id === id);
  if (!acc) return;
  acc.status = 'sold';
  saveAccounts();
  renderAdminTable();
  updateDashStats();
  applyFilters();
  showToast(`💰 อัปเดตสถานะ "${acc.name}" เป็น ขายแล้ว`, 'success');
}

function markAvailable(id) {
  const acc = STATE.accounts.find(a => a.id === id);
  if (!acc) return;
  acc.status = 'available';
  saveAccounts();
  renderAdminTable();
  updateDashStats();
  applyFilters();
  showToast(`🔄 คืนสถานะ "${acc.name}" เป็น พร้อมขาย`);
}

// ================================================================
// IMAGE UPLOAD
// ================================================================

function handleImageUpload(inputEl, previewEl, isEdit) {
  const file = inputEl.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    showToast('⚠️ กรุณาเลือกไฟล์รูปภาพเท่านั้น', 'error');
    return;
  }
  const reader = new FileReader();
  reader.onload = e => {
    const data = e.target.result;
    if (previewEl) { previewEl.src = data; previewEl.style.display = 'block'; previewEl.dataset.base64 = data; }
    if (isEdit) STATE.editImageData = data;
  };
  reader.readAsDataURL(file);
}

// ================================================================
// TOAST
// ================================================================

function showToast(msg, type='info', duration=3000) {
  const container = $('toast-container');
  if (!container) return;
  const icons = { success:'✅', error:'❌', info:'🔔' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type]||'🔔'}</span><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toastOut 0.3s ease forwards';
    toast.addEventListener('animationend', () => toast.remove());
  }, duration);
}

// ================================================================
// UTILITY
// ================================================================

function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function scrollToShop() {
  document.getElementById('shop')?.scrollIntoView({ behavior:'smooth' });
}

// ================================================================
// INIT
// ================================================================

async function init() {
  await loadAccounts();
  STATE.filtered = [...STATE.accounts];
  renderCards(STATE.filtered);
  initPinInputs();

  // Update hero stats
  const heroTotal = document.getElementById('hero-stat-total');
  const heroAvail = document.getElementById('hero-stat-available');
  if (heroTotal) heroTotal.textContent = STATE.accounts.length;
  if (heroAvail) heroAvail.textContent = STATE.accounts.filter(a => a.status === 'available').length;

  // Search & Filter events
  ['search-name','filter-rank','filter-price-min','filter-price-max','filter-status'].forEach(id => {
    $(id)?.addEventListener('input', debounce(applyFilters, 300));
    $(id)?.addEventListener('change', applyFilters);
  });

  // Admin login form
  $('btn-login')?.addEventListener('click', submitLogin);

  // Admin close
  $('btn-close-admin')?.addEventListener('click', closeAdminPanel);
  $('btn-logout')?.addEventListener('click', closeAdminPanel);

  // Add account form
  $('add-account-form')?.addEventListener('submit', handleAddAccount);

  // Edit account form
  $('edit-account-form')?.addEventListener('submit', handleEditAccount);

  // Image upload — Add
  $('add-image-input')?.addEventListener('change', e => {
    handleImageUpload(e.target, $('add-image-preview'), false);
  });

  // Image upload — Edit
  $('edit-image-input')?.addEventListener('change', e => {
    handleImageUpload(e.target, $('edit-image-preview'), true);
  });

  // Close modals on overlay click
  $('login-modal')?.addEventListener('click', e => {
    if (e.target === $('login-modal')) closeLoginModal();
  });
  $('edit-modal')?.addEventListener('click', e => {
    if (e.target === $('edit-modal')) closeEditModal();
  });

  // Populate rank options dynamically
  const rankSelects = $$('.rank-select');
  rankSelects.forEach(sel => {
    CONFIG.RANKS_ORDER.forEach(r => {
      const opt = document.createElement('option');
      opt.value = r;
      opt.textContent = r;
      sel.appendChild(opt);
    });
  });
}

function debounce(fn, delay) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
}

document.addEventListener('DOMContentLoaded', init);
