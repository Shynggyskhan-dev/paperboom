// ════════════════════════════════════════════════════════════════════════
// PaperBoom — Frontend Logic (Phase 3, complete, no truncation)
// ════════════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════════════
// CONFIG
// ════════════════════════════════════════════════════════════════════════


// ────────────────────────────────────────────────────────────────────────
// CATALOG DATA — hand-curated navigation taxonomy for the Mega-Menu /
// Mobile Accordion. This is intentionally separate from the live
// category/subcategory pairs returned by GET /api/products/categories:
// catalogData encodes the FULL planned taxonomy (including subcategories
// that may not have any products in stock yet), with icons, for navigation.
// Clicking a group filters products by subcategory (the real DB join key).
// Clicking a leaf item additionally narrows by a text search on top of
// that subcategory filter — leaf items are not a DB column, so this is a
// best-effort narrowing, not a guaranteed exact match.
// ────────────────────────────────────────────────────────────────────────
const catalogData = [
  {
    mainCategory: "ОДНОРАЗОВАЯ УПАКОВКА", icon: "fas fa-box",
    groups: [
      { title: "АЛЮМИНИЕВЫЕ КОНТЕЙНЕРЫ", items: ["Универсальные", "Плоские", "Кастрюли", "Секционные"] },
      { title: "БУМАЖНЫЕ КОНТЕЙНЕРЫ", items: ["Контейнеры Pratico", "Коробки для бургеров", "Коробки для фри и хотдогов", "Коробки для пиццы", "Коробки для лапши", "Ланч-боксы", "Салатники", "Супницы и баскеты", "Упаковка для тортов и маффинов", "Упаковка для сэндвичей", "Стаканчики для мороженого"] },
      { title: "ВЕДРА И БУТЫЛКИ", items: ["Бутылки пластиковые", "Ведра и банки", "Бутылки для соуса"] },
      { title: "КОНТЕЙНЕРЫ ИЗ САХАРНОГО ТРОСТНИКА", items: [] },
      { title: "ПЛАСТИКОВЫЕ КОНТЕЙНЕРЫ", items: ["Универсальные", "Контейнеры для суши", "Соусники", "Салатники", "Ланч-боксы", "Супницы", "РК и РКС", "Барьерные контейнеры под запайку"] },
      { title: "УГОЛКИ И ОБЕРТКИ", items: ["Обертки", "Уголки"] }
    ]
  },
  {
    mainCategory: "ОДНОРАЗОВАЯ ПОСУДА", icon: "fas fa-coffee",
    groups: [
      { title: "ОДНОРАЗОВЫЕ СТАКАНЫ", items: ["Бумажные стаканы", "Капхолдеры", "Крышки", "Пластиковые стаканы"] },
      { title: "СТОЛОВЫЕ ПРИБОРЫ", items: ["Ложки", "Вилки", "Ножи", "Наборы", "Конверты для приборов"] },
      { title: "ТАРЕЛКИ", items: ["Глубокие", "Плоские"] },
      { title: "ФУРШЕТНАЯ ПОСУДА", items: ["Креманки", "Стаканы и бокалы", "Фуршетные формы"] }
    ]
  },
  {
    mainCategory: "БУМАЖНАЯ ПРОДУКЦИЯ", icon: "fas fa-scroll",
    groups: [
      { title: "САЛФЕТКИ", items: ["Бумажные", "Влажные", "Для диспенсеров", "Ошибори"] },
      { title: "БУМАЖНЫЕ ПОЛОТЕНЦА", items: [] },
      { title: "ТУАЛЕТНАЯ БУМАГА", items: [] }
    ]
  },
  {
    mainCategory: "БАРНЫЕ АКСЕССУАРЫ", icon: "fas fa-glass-martini-alt",
    groups: [
      { title: "ТРУБОЧКИ", items: [] },
      { title: "ПАЛОЧКИ И ШПАЖКИ", items: ["Палочки для суши", "Палочки для шашлыка", "Шпажки и пики", "Палочки для мороженого"] },
      { title: "РАЗМЕШИВАТЕЛИ И ЗУБОЧИСТКИ", items: ["Зубочистки", "Размешиватели"] },
      { title: "САХАР, СОЛЬ, ПЕРЕЦ", items: [] },
      { title: "ПАКЕТЫ ДЛЯ ЛЬДА", items: [] },
      { title: "СВЕЧИ И ГОРЮЧЕЕ ДЛЯ МАРМИТОВ", items: [] }
    ]
  },
  {
    mainCategory: "ДЛЯ ВЫПЕЧКИ", icon: "fas fa-muffin",
    groups: [
      { title: "АЛЮМИНИЕВЫЕ ФОРМЫ", items: [] },
      { title: "УПАКОВКА ДЛЯ ТОРТА", items: [] },
      { title: "ПОДЛОЖКИ ДЛЯ ТОРТОВ", items: [] },
      { title: "АЖУРНЫЕ САЛФЕТКИ", items: [] },
      { title: "ЛЕНТЫ И ШПАГАТЫ", items: [] },
      { title: "ТАРТАЛЕТКИ И ФОРМЫ ДЛЯ КЕКСОВ", items: [] },
      { title: "КОНДИТЕРСКИЕ МЕШКИ", items: [] },
      { title: "РУКАВА ДЛЯ ЗАПЕКАНИЯ", items: [] },
      { title: "БУМАГА ДЛЯ ВЫПЕЧКИ", items: [] },
      { title: "ФОЛЬГА", items: [] },
      { title: "ПИЩЕВАЯ ПЛЕНКА", items: [] }
    ]
  },
  {
    mainCategory: "ПАКЕТЫ", icon: "fas fa-shopping-bag",
    groups: [
      { title: "БУМАЖНЫЕ ПАКЕТЫ", items: ["Пакеты с ручками", "Пакеты без ручек с прямым дном", "Пакеты с плоским дном", "Пакеты с окном"] },
      { title: "ПАКЕТ-ПЕРЕНОСКА", items: [] },
      { title: "ФАСОВОЧНЫЕ", items: [] },
      { title: "ПАКЕТЫ-МАЕЧКИ", items: [] },
      { title: "МУСОРНЫЕ МЕШКИ", items: [] },
      { title: "ЗИПЛОКИ", items: [] },
      { title: "ДОЙПАКИ", items: [] },
      { title: "ВАКУУМНЫЕ", items: [] },
      { title: "БОПП ПАКЕТЫ С КЛЕЕВЫМ КЛАПАНОМ", items: [] }
    ]
  },
  {
    mainCategory: "ДЛЯ УБОРКИ И ГИГИЕНЫ", icon: "fas fa-broom",
    groups: [
      { title: "ГУБКИ, ТРЯПКИ, ШВАБРЫ", items: ["Губки и мочалки", "Тряпки и ветошь", "Вафельные полотенца", "Швабры и вёдра", "Щетки и совки", "Другое"] },
      { title: "ДИСПЕНСЕРЫ И ДЕРЖАТЕЛИ", items: ["Держатели", "Диспенсеры и дозаторы"] },
      { title: "ПЕРЧАТКИ И САНИТАРНАЯ ОДЕЖДА", items: ["Перчатки", "Медицинские маски", "Шапочки-береты", "Бахилы и нарукавники", "Одноразовые фартуки"] },
      { title: "МОЮЩИЕ СРЕДСТВА", items: ["Для мытья посуды", "Для кухонь", "Для санузлов", "Для поверхностей", "Для стирки", "Для стекол", "Освежитель воздуха", "Другие средства"] },
      { title: "ТОВАРЫ ДЛЯ ГИГИЕНЫ", items: ["Мыло и крем", "Гели для душа", "Лосьоны, наборы для бритья", "Шампуни и бальзамы", "Другое"] }
    ]
  },
  {
    mainCategory: "РАСХОДНИКИ", icon: "fas fa-receipt",
    groups: [
      { title: "ВЕСОВЫЕ ЛЕНТЫ", items: [] },
      { title: "СКОТЧ", items: [] },
      { title: "ЧЕКОВЫЕ ЛЕНТЫ", items: [] },
      { title: "СТРЕЙЧ-ПЛЕНКА", items: [] }
    ]
  }
];

// ════════════════════════════════════════════════════════════════════════
// STATE
// ════════════════════════════════════════════════════════════════════════




// ════════════════════════════════════════════════════════════════════════
// GENERIC HELPERS
// ════════════════════════════════════════════════════════════════════════
function authHeaders() {
    const token = localStorage.getItem('token');
    return token
        ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        : { 'Content-Type': 'application/json' };
}

function showToast(msg, duration = 2800) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.style.opacity = '1';
    setTimeout(() => { el.style.opacity = '0'; }, duration);
}

function showError(elId, msg) {
    const el = document.getElementById(elId);
    if (!el) return;
    el.textContent = msg;
    el.classList.remove('hidden');
}
function clearError(elId) {
    const el = document.getElementById(elId);
    if (el) el.classList.add('hidden');
}

function fmtMoney(n) { return Math.round(n * 10) / 10; }

function escapeAttr(str) {
    return String(str).replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ════════════════════════════════════════════════════════════════════════
// PHONE MASK — strict +7 (XXX) XXX-XX-XX, vanilla JS, no library
// ════════════════════════════════════════════════════════════════════════
function applyPhoneMask(input) {
    if (!input) return;

    input.addEventListener('input', function () {
        let digits = input.value.replace(/\D/g, '');

        if (digits.startsWith('8')) digits = '7' + digits.slice(1);
        if (!digits.startsWith('7')) digits = '7' + digits;
        digits = digits.slice(0, 11); // "7" + 10 digits max

        let formatted = '+7';
        const rest = digits.slice(1);

        if (rest.length > 0) formatted += ' (' + rest.slice(0, 3);
        if (rest.length >= 3) formatted += ')';
        if (rest.length >= 4) formatted += ' ' + rest.slice(3, 6);
        if (rest.length >= 7) formatted += '-' + rest.slice(6, 8);
        if (rest.length >= 9) formatted += '-' + rest.slice(8, 10);

        input.value = formatted;
    });

    input.addEventListener('focus', function () {
        if (!input.value) input.value = '+7 (';
    });

    input.addEventListener('keydown', function (e) {
        if (e.key === 'Backspace' && input.value.length <= 4) {
            input.value = '';
        }
    });
}

function initPhoneMasks() {
    applyPhoneMask(document.getElementById('login-phone'));
    applyPhoneMask(document.getElementById('reg-phone'));
}

// ════════════════════════════════════════════════════════════════════════
// UI TOGGLES — Catalog Drawer / User Drawer / Cart / Modals
// All elements start in a CLOSED state; these functions are the only
// thing that opens/closes them — nothing should be "stuck open" because
// every drawer's open state lives in one class (`.open` or `.hidden`)
// that these functions toggle explicitly, never implicitly.
// ════════════════════════════════════════════════════════════════════════
function closeAllOverlays() {
    // Catalog (mobile)
    const catalogDrawer = document.getElementById('catalog-drawer-mobile');
    if (catalogDrawer) catalogDrawer.classList.remove('open');

    // Catalog (desktop mega-menu)
    const megaMenu = document.getElementById('catalog-megamenu');
    if (megaMenu) megaMenu.classList.add('hidden');

    const catalogOverlay = document.getElementById('catalog-overlay');
    if (catalogOverlay) catalogOverlay.classList.add('hidden');

    // User drawer
    const userDrawer = document.getElementById('user-drawer');
    if (userDrawer) userDrawer.classList.remove('open');

    const userOverlay = document.getElementById('user-overlay');
    if (userOverlay) userOverlay.classList.add('hidden');
}

function openCatalogDrawer() {
    const isDesktop = window.innerWidth >= 1024;

    if (isDesktop) {
        const menu = document.getElementById('catalog-megamenu');
        const wasOpen = menu && !menu.classList.contains('hidden');
        closeAllOverlays();
        if (!wasOpen && menu) {
            menu.classList.remove('hidden');
            document.getElementById('catalog-overlay').classList.remove('hidden');
        }
    } else {
        closeAllOverlays();
        document.getElementById('catalog-overlay').classList.remove('hidden');
        document.getElementById('catalog-drawer-mobile').classList.add('open');
    }
}

function closeCatalogDrawer() {
    const catalogDrawer = document.getElementById('catalog-drawer-mobile');
    if (catalogDrawer) catalogDrawer.classList.remove('open');

    const megaMenu = document.getElementById('catalog-megamenu');
    if (megaMenu) megaMenu.classList.add('hidden');

    const catalogOverlay = document.getElementById('catalog-overlay');
    if (catalogOverlay) catalogOverlay.classList.add('hidden');
}

function openUserDrawer() {
    closeAllOverlays();
    document.getElementById('user-overlay').classList.remove('hidden');
    document.getElementById('user-drawer').classList.add('open');
}

function closeUserDrawer() {
    document.getElementById('user-overlay').classList.add('hidden');
    document.getElementById('user-drawer').classList.remove('open');
}

function toggleCart() {
    closeAllOverlays();
    const drawer  = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    const isOpen  = !drawer.classList.contains('translate-x-full'); // currently visible?

    if (isOpen) {
        drawer.classList.add('translate-x-full');
        overlay.classList.add('hidden');
    } else {
        drawer.classList.remove('translate-x-full');
        overlay.classList.remove('hidden');
        renderCart();
    }
}

function goHome() {
    closeAllOverlays();
    resetAllFilters();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Close any open drawer/megamenu on Escape key — important since these
// are off-canvas panels with no native dismiss gesture on desktop.
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        closeAllOverlays();
        hideOrders();
        hideFavoritesModal();
    }
});

// ════════════════════════════════════════════════════════════════════════
// CATALOG RENDERING — Mega-Menu (desktop) + Accordion (mobile)
// Driven entirely by the catalogData constant above.
// ════════════════════════════════════════════════════════════════════════
function renderCatalogNav() {
    renderMobileAccordion();
    renderDesktopMegaMenu();
}

function renderMobileAccordion() {
    const root = document.getElementById('catalog-accordion');
    if (!root) return;

    root.innerHTML = catalogData.map((cat, catIdx) => `
        <div class="border-b">
            <button onclick="toggleAccordion(${catIdx})" id="acc-toggle-${catIdx}"
                class="accordion-toggle w-full flex items-center justify-between px-5 py-4 text-left font-semibold text-gray-800 hover:bg-gray-50">
                <span class="flex items-center gap-3">
                    <i class="${cat.icon} text-orange-500 w-5 text-center"></i>
                    ${escapeHtml(cat.mainCategory)}
                </span>
                <i class="fa-solid fa-chevron-down text-xs text-gray-400"></i>
            </button>
            <div class="accordion-panel hidden bg-gray-50/60" id="acc-panel-${catIdx}">
                <button onclick="filterByCategory('${escapeAttr(cat.mainCategory)}'); closeCatalogDrawer();"
                    class="w-full text-left px-8 py-3 text-sm font-semibold text-orange-600 border-t border-gray-100">
                    Все в категории →
                </button>
                ${cat.groups.map(group => `
                    <div class="border-t border-gray-100">
                        <button onclick="filterBySubcategory('${escapeAttr(cat.mainCategory)}', '${escapeAttr(group.title)}'); closeCatalogDrawer();"
                            class="w-full text-left px-8 py-3 text-sm font-medium text-gray-700 hover:text-orange-600">
                            ${escapeHtml(group.title)}
                        </button>
                        ${group.items.length ? `
                            <div class="pl-12 pb-2">
                                ${group.items.map(item => `
                                    <button onclick="filterByLeaf('${escapeAttr(cat.mainCategory)}', '${escapeAttr(group.title)}', '${escapeAttr(item)}'); closeCatalogDrawer();"
                                        class="block w-full text-left py-1.5 text-xs text-gray-500 hover:text-orange-500">
                                        ${escapeHtml(item)}
                                    </button>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function toggleAccordion(idx) {
    const toggle = document.getElementById(`acc-toggle-${idx}`);
    const panel  = document.getElementById(`acc-panel-${idx}`);
    if (!toggle || !panel) return;

    const isOpen = toggle.classList.contains('open');

    // Single-open accordion: close all others first
    document.querySelectorAll('.accordion-toggle').forEach(t => t.classList.remove('open'));
    document.querySelectorAll('.accordion-panel').forEach(p => p.classList.add('hidden'));

    if (!isOpen) {
        toggle.classList.add('open');
        panel.classList.remove('hidden');
    }
}

function renderDesktopMegaMenu() {
    const root = document.getElementById('megamenu-grid');
    if (!root) return;

    root.innerHTML = catalogData.map(cat => `
        <div>
            <button onclick="filterByCategory('${escapeAttr(cat.mainCategory)}'); closeCatalogDrawer();"
                class="font-bold text-gray-800 hover:text-orange-600 mb-3 text-left flex items-center gap-2">
                <i class="${cat.icon} text-orange-500"></i>
                ${escapeHtml(cat.mainCategory)}
            </button>
            <div class="space-y-2">
                ${cat.groups.map(group => `
                    <button onclick="filterBySubcategory('${escapeAttr(cat.mainCategory)}', '${escapeAttr(group.title)}'); closeCatalogDrawer();"
                        class="block text-sm text-gray-500 hover:text-orange-600 text-left">
                        ${escapeHtml(group.title)}
                    </button>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// ════════════════════════════════════════════════════════════════════════
// FILTERING — category / subcategory / leaf / volume / search
// ════════════════════════════════════════════════════════════════════════
function filterByCategory(cat) {
    filters.category    = cat || '';
    filters.subcategory = '';
    filters.search       = ''; // leaving catalogData nav clears free-text search
    syncSearchInputs('');
    document.getElementById('categories-section').classList.toggle('hidden', !!cat);
    syncPillStates();
    fetchProducts();
}

function filterBySubcategory(cat, sub) {
    filters.category    = cat;
    filters.subcategory = sub;
    filters.search       = '';
    syncSearchInputs('');
    document.getElementById('categories-section').classList.add('hidden');
    syncPillStates();
    fetchProducts();
}

// Leaf items aren't a DB column — filter by the real subcategory (the
// actual join key) AND layer a text search for the leaf label on top.
// If that combination returns zero rows, fetchProducts()'s normal empty
// state will say so honestly rather than this function pretending success.
function filterByLeaf(cat, sub, leaf) {
    filters.category    = cat;
    filters.subcategory = sub;
    filters.search       = leaf;
    syncSearchInputs(leaf);
    document.getElementById('categories-section').classList.add('hidden');
    syncPillStates();
    fetchProducts();
}

function onVolumePillClick(vol) {
    const already = filters.volume == vol;
    filters.volume = already ? '' : String(vol);
    syncPillStates();
    fetchProducts();
}

function syncPillStates() {
    document.querySelectorAll('#category-pills .pill-btn').forEach(btn => {
        const active = btn.dataset.cat === (filters.category || '');
        btn.classList.toggle('active', active);
    });
    document.querySelectorAll('#volume-pills .pill-btn').forEach(btn => {
        const active = btn.dataset.vol == filters.volume;
        btn.classList.toggle('active', active);
    });
}

function syncSearchInputs(val) {
    const d = document.getElementById('search-input');
    const m = document.getElementById('search-input-mobile');
    if (d) d.value = val;
    if (m) m.value = val;
    const dc = document.getElementById('search-clear');
    const mc = document.getElementById('search-clear-mobile');
    if (dc) dc.classList.toggle('hidden', !val);
    if (mc) mc.classList.toggle('hidden', !val);
}

function updateActiveFilterBar(count) {
    const bar   = document.getElementById('active-filter-bar');
    const label = document.getElementById('active-filter-label');
    const cnt   = document.getElementById('result-count');
    if (!bar || !label || !cnt) return;

    const active = filters.search || filters.category || filters.volume;
    bar.classList.toggle('hidden', !active);
    bar.classList.toggle('flex',   !!active);

    if (filters.search)        label.textContent = `Поиск: "${filters.search}"`;
    else if (filters.subcategory) label.textContent = filters.subcategory;
    else if (filters.category) label.textContent = filters.category;
    else if (filters.volume)   label.textContent = `${filters.volume} мл`;
    else                       label.textContent = '';

    cnt.textContent = `${count} товар${count === 1 ? '' : count < 5 ? 'а' : 'ов'}`;
}

function resetAllFilters() {
    filters.search = filters.category = filters.subcategory = filters.volume = '';
    syncSearchInputs('');
    document.getElementById('categories-section').classList.remove('hidden');
    syncPillStates();
    fetchProducts();
}

// ── Search input wiring (debounced, desktop + mobile kept in sync) ────────
function wireSearchInput(inputId, clearId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    input.addEventListener('input', function () {
        const val = this.value.trim();
        const clearBtn = document.getElementById(clearId);
        if (clearBtn) clearBtn.classList.toggle('hidden', !val);

        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
            filters.search = val;
            document.getElementById('categories-section').classList.toggle('hidden', !!(val || filters.category));
            fetchProducts();

            const otherId = inputId === 'search-input' ? 'search-input-mobile' : 'search-input';
            const otherEl = document.getElementById(otherId);
            if (otherEl && otherEl.value !== val) otherEl.value = val;
        }, 300);
    });
}

function toggleMobileSearch() {
    const row = document.getElementById('mobile-search-row');
    if (!row) return;
    row.classList.toggle('hidden');
    if (!row.classList.contains('hidden')) {
        const input = document.getElementById('search-input-mobile');
        if (input) input.focus();
    }
}

function clearSearch() {
    syncSearchInputs('');
    filters.search = '';
    document.getElementById('categories-section').classList.toggle('hidden', !!filters.category);
    fetchProducts();
}
function clearSearchMobile() { clearSearch(); }

// ════════════════════════════════════════════════════════════════════════
// PRODUCTS — fetch + render + B2B unit selection
// ════════════════════════════════════════════════════════════════════════
async function fetchProducts() {
    const params = new URLSearchParams();
    if (filters.search)      params.set('search',      filters.search);
    if (filters.category)    params.set('category',    filters.category);
    if (filters.subcategory) params.set('subcategory', filters.subcategory);
    if (filters.volume)      params.set('volume',      filters.volume);

    showLoading(true);
    try {
        const res   = await fetch(`${API}/products?${params}`);
        const data  = await res.json();
        allProducts = data;
        renderProducts(data);
        updateActiveFilterBar(data.length);
    } catch (e) {
        console.error('fetchProducts:', e);
        showToast('Ошибка загрузки товаров');
    } finally {
        showLoading(false);
    }
}

function showLoading(show) {
    const loading = document.getElementById('products-loading');
    const grid    = document.getElementById('products-grid');
    if (loading) loading.classList.toggle('hidden', !show);
    if (grid)    grid.classList.toggle('hidden', show);
}

// A unit (piece/pack/box) is only offered if its price is greater than zero.
function getAvailableUnits(p) {
    const units = [];
    if (p.price_piece > 0) units.push({ key: 'piece', label: 'шт',  fullLabel: 'шт.', price: p.price_piece, qtyPerUnit: 1 });
    if (p.price_pack  > 0) units.push({ key: 'pack',  label: 'уп',  fullLabel: 'уп.', price: p.price_pack,  qtyPerUnit: p.qty_pack });
    if (p.price_box   > 0) units.push({ key: 'box',   label: 'кор', fullLabel: 'кор.', price: p.price_box,  qtyPerUnit: p.qty_box });
    return units;
}

function renderProducts(products) {
    const grid  = document.getElementById('products-grid');
    const empty = document.getElementById('products-empty');
    if (!grid || !empty) return;

    if (!products.length) {
        grid.innerHTML = '';
        empty.classList.remove('hidden');
        return;
    }
    empty.classList.add('hidden');

    grid.innerHTML = products.map(p => {
        const units = getAvailableUnits(p);

        // Edge case: no priced unit at all (all-zero pricing rows)
        if (!units.length) {
            return `
            <div class="product-card bg-white rounded-3xl border p-5 relative flex flex-col opacity-60">
                <div class="h-40 bg-gray-50 rounded-2xl mb-4 flex items-center justify-center">
                    <i class="fa-solid fa-box-open text-4xl text-gray-200"></i>
                </div>
                <div class="text-xs text-gray-400">Арт. ${escapeHtml(p.article)}</div>
                <div class="font-medium text-sm mt-1 line-clamp-2 flex-1">${escapeHtml(p.name)}</div>
                <div class="mt-4 text-center text-xs text-gray-400 py-2 bg-gray-50 rounded-xl">Цена уточняется</div>
            </div>`;
        }

        const defaultUnit = units[0];

        return `
        <div class="product-card bg-white rounded-3xl border p-5 relative flex flex-col"
             data-product-id="${p.id}" data-selected-unit="${defaultUnit.key}">

            <button onclick="toggleFavorite(event, ${p.id})"
                class="fav-btn absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 z-10 ${favorites.has(p.id) ? 'active' : ''}"
                data-id="${p.id}" title="${favorites.has(p.id) ? 'Убрать из избранного' : 'В избранное'}">
                <i class="fa-${favorites.has(p.id) ? 'solid' : 'regular'} fa-heart text-lg ${favorites.has(p.id) ? 'text-red-500' : 'text-gray-300'}"></i>
            </button>

            ${p.image_url
                ? `<img src="${p.image_url}" alt="${escapeHtml(p.name)}"
                       class="h-40 w-full object-contain rounded-2xl mb-4 bg-orange-50"
                       onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
                   <div class="h-40 bg-gray-50 rounded-2xl mb-4 items-center justify-center flex-col gap-2 hidden">
                       <i class="fa-regular fa-image text-3xl text-gray-300"></i>
                       <span class="text-xs text-gray-300">Нет фото</span>
                   </div>`
                : `<div class="h-40 bg-orange-50 rounded-2xl mb-4 flex items-center justify-center">
                       <i class="fa-solid fa-box-open text-4xl text-orange-200"></i>
                   </div>`
            }

            <div class="text-xs text-gray-400">Арт. ${escapeHtml(p.article)}</div>
            <div class="font-medium text-sm mt-1 line-clamp-2">${escapeHtml(p.name)}</div>

            ${units.length > 1 ? `
                <div class="unit-selector flex gap-1.5 mt-3 bg-gray-50 rounded-xl p-1">
                    ${units.map((u, i) => `
                        <button onclick="selectUnit(${p.id}, '${u.key}')"
                            class="unit-btn flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${i === 0 ? 'active' : 'text-gray-400'}"
                            data-unit="${u.key}" data-product="${p.id}">
                            ${u.label}
                        </button>
                    `).join('')}
                </div>
            ` : `<div class="mt-3 text-xs text-gray-400">Только поштучно</div>`}

            <div class="mt-3 flex items-end justify-between">
                <div>
                    <span class="unit-price text-xl font-bold text-orange-500" id="price-${p.id}">${defaultUnit.price} ₸</span>
                    <span class="unit-hint text-xs text-gray-400 block" id="hint-${p.id}">
                        за ${defaultUnit.fullLabel}${defaultUnit.qtyPerUnit > 1 ? ` (${defaultUnit.qtyPerUnit} шт.)` : ''}
                    </span>
                </div>
                <button onclick="addToCart(${p.id})"
                    class="add-to-cart-btn bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-2xl text-sm font-medium transition-colors">
                    В корзину
                </button>
            </div>
        </div>`;
    }).join('');
}

function selectUnit(productId, unitKey) {
    const card = document.querySelector(`[data-product-id="${productId}"]`);
    if (!card) return;
    card.dataset.selectedUnit = unitKey;

    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    const units = getAvailableUnits(product);
    const unit  = units.find(u => u.key === unitKey);
    if (!unit) return;

    card.querySelectorAll('.unit-btn').forEach(btn => {
        const active = btn.dataset.unit === unitKey;
        btn.classList.toggle('active', active);
        btn.classList.toggle('text-gray-400', !active);
    });

    const priceEl = document.getElementById(`price-${productId}`);
    const hintEl  = document.getElementById(`hint-${productId}`);
    if (priceEl) priceEl.textContent = `${unit.price} ₸`;
    if (hintEl)  hintEl.textContent  = `за ${unit.fullLabel}${unit.qtyPerUnit > 1 ? ` (${unit.qtyPerUnit} шт.)` : ''}`;
}

// ════════════════════════════════════════════════════════════════════════
// CATEGORIES (hero cards + filter pills) — sourced from the live DB,
// kept separate from catalogData (the static nav taxonomy above)
// ════════════════════════════════════════════════════════════════════════
async function fetchAndRenderCategoryPills() {
    try {
        const res  = await fetch(`${API}/products/categories`);
        const data = await res.json(); // [{ category, subcategories }]

        const catIcons = {
            'ОДНОРАЗОВАЯ ПОСУДА':    '🥤',
            'ОДНОРАЗОВАЯ УПАКОВКА':  '📦',
            'ПАКЕТЫ':                '🛍️',
            'БАРНЫЕ АКСЕССУАРЫ':     '🍸',
            'ДЛЯ ВЫПЕЧКИ':           '🧁',
            'ДЛЯ УБОРКИ И ГИГИЕНЫ':  '🧼',
            'БУМАЖНАЯ ПРОДУКЦИЯ':    '📜',
            'РАСХОДНИКИ':            '🔧',
            'БЕЗ КАТЕГОРИИ':         '❔',
        };

        const categoriesGrid = document.getElementById('categories');
        if (categoriesGrid) {
            categoriesGrid.innerHTML = data.map(c => `
                <div onclick="filterByCategory('${escapeAttr(c.category)}')"
                     class="bg-white p-6 rounded-3xl border hover:border-orange-300 cursor-pointer text-center transition-colors hover:bg-orange-50 group">
                    <div class="text-4xl mb-3">${catIcons[c.category] || '📦'}</div>
                    <div class="font-semibold text-sm group-hover:text-orange-600">${escapeHtml(c.category)}</div>
                    <div class="text-xs text-gray-400 mt-1">${c.subcategories.length} подкат.</div>
                </div>
            `).join('');
        }

        const pillsRoot = document.getElementById('category-pills');
        if (pillsRoot) {
            pillsRoot.innerHTML = `
                <button onclick="filterByCategory(null)" data-cat=""
                    class="pill-btn active shrink-0 px-4 py-2 rounded-full border text-sm font-medium">
                    Все товары
                </button>
                ${data.map(c => `
                    <button onclick="filterByCategory('${escapeAttr(c.category)}')" data-cat="${escapeAttr(c.category)}"
                        class="pill-btn shrink-0 px-4 py-2 rounded-full border text-sm font-medium">
                        ${escapeHtml(c.category)}
                    </button>
                `).join('')}
            `;
        }
    } catch (e) {
        console.error('fetchAndRenderCategoryPills:', e);
    }
}

async function fetchAndRenderVolumePills() {
    try {
        const res  = await fetch(`${API}/products`);
        const data = await res.json();
        const volumes = [...new Set(data.map(p => p.volume).filter(Boolean))].sort((a, b) => a - b);

        const root = document.getElementById('volume-pills');
        if (root) {
            root.innerHTML = volumes.map(v => `
                <button onclick="onVolumePillClick(${v})" data-vol="${v}"
                    class="pill-btn shrink-0 px-4 py-2 rounded-full border text-sm font-medium">
                    ${v} мл
                </button>
            `).join('');
        }
    } catch (e) {
        console.error('fetchAndRenderVolumePills:', e);
    }
}

// ════════════════════════════════════════════════════════════════════════
// B2B CART — unit-aware add/remove/qty, trash icon instant removal
// ════════════════════════════════════════════════════════════════════════
function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    const card    = document.querySelector(`[data-product-id="${productId}"]`);
    const unitKey = card ? card.dataset.selectedUnit : 'piece';
    const units   = getAvailableUnits(product);
    const unit    = units.find(u => u.key === unitKey) || units[0];
    if (!unit) return;

    const cartKey  = `${productId}__${unit.key}`;
    const existing = cart.find(i => i.cartKey === cartKey);

    if (existing) {
        existing.qty++;
    } else {
        cart.push({
            cartKey,
            productId: product.id,
            article:   product.article,
            name:      product.name,
            image_url: product.image_url,
            unit:      unit.key,
            unitLabel: unit.fullLabel,
            unitPrice: unit.price,
            qty: 1,
        });
    }

    updateCartBadges();
    renderCart();
    showToast(`${product.name.split(' ').slice(0, 3).join(' ')} — добавлено`);
}

function changeQty(cartKey, delta) {
    const item = cart.find(i => i.cartKey === cartKey);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) cart = cart.filter(i => i.cartKey !== cartKey);
    updateCartBadges();
    renderCart();
}

// Trash bin icon — instant removal regardless of quantity
function removeFromCart(cartKey) {
    cart = cart.filter(i => i.cartKey !== cartKey);
    updateCartBadges();
    renderCart();
}

function cartTotal() {
    return cart.reduce((a, c) => a + c.unitPrice * c.qty, 0);
}

function updateCartBadges() {
    const count = cart.reduce((a, c) => a + c.qty, 0);

    const cartCount       = document.getElementById('cart-count');
    const cartCountMobile = document.getElementById('cart-count-mobile');
    const totalMobile     = document.getElementById('total-sum-mobile');
    const stickyBar       = document.getElementById('cart-sticky-bar');

    if (cartCount)       cartCount.textContent = count;
    if (cartCountMobile) cartCountMobile.textContent = count;
    if (totalMobile)     totalMobile.textContent = `${fmtMoney(cartTotal())} ₸`;
    if (stickyBar)        stickyBar.classList.toggle('hidden', count === 0);
}

function renderCart() {
    const el    = document.getElementById('cart-items');
    const total = document.getElementById('total-sum');
    if (!el || !total) return;

    if (!cart.length) {
        el.innerHTML = `
            <div class="h-full flex flex-col items-center justify-center text-center text-gray-400 gap-3">
                <i class="fa-solid fa-cart-shopping text-5xl text-gray-200"></i>
                <p class="font-medium">Корзина пуста</p>
                <p class="text-sm">Добавьте товары из каталога</p>
            </div>`;
        total.textContent = '0 ₸';
        return;
    }

    el.innerHTML = cart.map(item => `
        <div class="flex gap-4 items-start py-4 border-b last:border-0">
            <div class="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                ${item.image_url
                    ? `<img src="${item.image_url}" class="w-full h-full object-contain rounded-xl">`
                    : `<i class="fa-solid fa-box-open text-2xl text-orange-200"></i>`}
            </div>
            <div class="flex-1 min-w-0">
                <div class="text-xs text-gray-400">Арт. ${escapeHtml(item.article)} · ${item.unitLabel}</div>
                <div class="text-sm font-medium line-clamp-2">${escapeHtml(item.name)}</div>
                <div class="text-orange-500 font-bold mt-1">${item.unitPrice} ₸</div>
            </div>
            <div class="flex flex-col items-end gap-2 shrink-0">
                <button onclick="removeFromCart('${item.cartKey}')" class="cart-trash-btn" title="Удалить">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
                <div class="flex items-center gap-2">
                    <button onclick="changeQty('${item.cartKey}', -1)" class="w-7 h-7 rounded-full border flex items-center justify-center text-gray-600 hover:bg-gray-50 font-bold text-sm">−</button>
                    <span class="w-6 text-center font-semibold text-sm">${item.qty}</span>
                    <button onclick="changeQty('${item.cartKey}', 1)" class="w-7 h-7 rounded-full border flex items-center justify-center text-gray-600 hover:bg-gray-50 font-bold text-sm">+</button>
                </div>
            </div>
        </div>
    `).join('');

    total.textContent = `${fmtMoney(cartTotal())} ₸`;
}

// ════════════════════════════════════════════════════════════════════════
// SECURE WHATSAPP CHECKOUT
// Step 1: POST /api/orders — server re-derives prices from DB, returns
//         the authoritative total_sum (client cart total is never trusted)
// Step 2: build the exact Russian message, auto-numbered, using the
//         server-confirmed total
// ════════════════════════════════════════════════════════════════════════
async function sendToWhatsApp() {
    if (!cart.length) { showToast('Корзина пуста'); return; }

    const btn     = document.getElementById('whatsapp-btn');
    const btnText = document.getElementById('whatsapp-btn-text');
    let dbTotal   = null;

    if (currentUser) {
        if (btn) btn.disabled = true;
        if (btnText) btnText.textContent = 'Сохраняем заказ...';

        try {
            const res = await fetch(`${API}/orders`, {
                method:  'POST',
                headers: authHeaders(),
                body: JSON.stringify({
                    items: cart.map(i => ({
                        product_id: i.productId,
                        unit_type:  i.unit,
                        quantity:   i.qty,
                    })),
                }),
            });
            const data = await res.json();
            if (res.ok) {
                dbTotal = data.total_sum; // authoritative — never trust client cart math
            } else {
                showToast(data.error || 'Ошибка при сохранении заказа');
            }
        } catch (e) {
            console.error('Order save error:', e);
            showToast('Сервер недоступен — заказ не сохранён');
        } finally {
            if (btn) btn.disabled = false;
            if (btnText) btnText.textContent = 'Отправить в WhatsApp';
        }
    }

    const total = dbTotal !== null ? dbTotal : cartTotal();

    const unitWord = { piece: 'шт', pack: 'уп', box: 'кор' };
    const lines = cart.map((item, i) =>
        `${i + 1}. Арт. ${item.article} - ${item.name} - ${item.qty} ${unitWord[item.unit] || 'шт'}.`
    );

    const message =
        `Доброго времени суток! С сайта PaperBoom\n` +
        `\n` +
        lines.join('\n') +
        `\n\n` +
        `Итого к оплате: ${fmtMoney(total)} ₸`;

    window.open(`https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(message)}`, '_blank');
}

// ════════════════════════════════════════════════════════════════════════
// FAVOURITES
// ════════════════════════════════════════════════════════════════════════
async function fetchFavorites() {
    if (!currentUser) return;
    try {
        const res  = await fetch(`${API}/favorites`, { headers: authHeaders() });
        const data = await res.json();
        favorites  = new Set(data.map(p => p.id));
    } catch (e) {
        console.error('fetchFavorites:', e);
    }
}

async function toggleFavorite(e, productId) {
    e.stopPropagation();
    if (!currentUser) {
        openUserDrawer();
        showToast('Войдите, чтобы сохранять избранное');
        return;
    }
    const isFav = favorites.has(productId);
    try {
        if (isFav) {
            await fetch(`${API}/favorites/${productId}`, { method: 'DELETE', headers: authHeaders() });
            favorites.delete(productId);
        } else {
            await fetch(`${API}/favorites`, {
                method:  'POST',
                headers: authHeaders(),
                body:    JSON.stringify({ product_id: productId }),
            });
            favorites.add(productId);
        }
        const btn = document.querySelector(`.fav-btn[data-id="${productId}"]`);
        if (btn) {
            const nowFav = favorites.has(productId);
            btn.querySelector('i').className = `fa-${nowFav ? 'solid' : 'regular'} fa-heart text-lg ${nowFav ? 'text-red-500' : 'text-gray-300'}`;
            btn.classList.toggle('active', nowFav);
            btn.title = nowFav ? 'Убрать из избранного' : 'В избранное';
        }
    } catch (err) {
        console.error('toggleFavorite:', err);
        showToast('Ошибка. Попробуйте ещё раз.');
    }
}

async function showFavoritesModal() {
    const modal = document.getElementById('favorites-modal');
    if (modal) modal.classList.remove('modal-hidden');
    renderFavorites();
}

async function renderFavorites() {
    const el = document.getElementById('favorites-content');
    if (!el) return;

    if (!currentUser) {
        el.innerHTML = `<div class="text-center py-12 text-gray-400">
            <p class="font-medium">Войдите, чтобы видеть избранное</p>
        </div>`;
        return;
    }

    el.innerHTML = '<p class="text-gray-400 text-sm text-center py-8">Загрузка...</p>';

    try {
        const res  = await fetch(`${API}/favorites`, { headers: authHeaders() });
        const data = await res.json();

        if (!data.length) {
            el.innerHTML = `<div class="text-center py-12 text-gray-400">
                <i class="fa-regular fa-heart text-5xl mb-3 block text-gray-200"></i>
                <p class="font-medium">Избранное пусто</p>
                <p class="text-sm mt-1">Нажмите ♡ на карточке товара</p>
            </div>`;
            return;
        }

        el.innerHTML = data.map(p => {
            const units = getAvailableUnits(p);
            const price = units.length ? units[0].price : null;
            return `
            <div class="flex items-center gap-4 py-4 border-b last:border-0" id="fav-row-${p.id}">
                <div class="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center shrink-0">
                    ${p.image_url
                        ? `<img src="${p.image_url}" class="w-full h-full object-contain rounded-2xl">`
                        : `<i class="fa-solid fa-box-open text-2xl text-orange-200"></i>`}
                </div>
                <div class="flex-1 min-w-0">
                    <div class="text-xs text-gray-400">Арт. ${escapeHtml(p.article)}</div>
                    <div class="text-sm font-medium line-clamp-1">${escapeHtml(p.name)}</div>
                    <div class="text-orange-500 font-bold mt-1">
                        ${price !== null ? price + ' ₸' : 'Цена уточняется'}
                    </div>
                </div>
                <div class="flex flex-col items-end gap-2 shrink-0">
                    <button onclick="removeFromFavorites(${p.id})"
                        class="cart-trash-btn" title="Удалить из избранного">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                    ${price !== null ? `
                        <button onclick="addToCart(${p.id}); hideFavoritesModal();"
                            class="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-xl text-xs font-medium transition-colors">
                            В корзину
                        </button>` : ''}
                </div>
            </div>`;
        }).join('');
    } catch (e) {
        el.innerHTML = '<p class="text-red-400 text-sm text-center py-4">Ошибка загрузки</p>';
    }
}

async function removeFromFavorites(productId) {
    try {
        await fetch(`${API}/favorites/${productId}`, {
            method:  'DELETE',
            headers: authHeaders(),
        });
        favorites.delete(productId);

        // Update heart icon on product card if visible
        const btn = document.querySelector(`.fav-btn[data-id="${productId}"]`);
        if (btn) {
            btn.querySelector('i').className = 'fa-regular fa-heart text-lg text-gray-300';
            btn.classList.remove('active');
            btn.title = 'В избранное';
        }

        // Remove the row from the modal instantly without full reload
        const row = document.getElementById(`fav-row-${productId}`);
        if (row) {
            row.style.transition = 'opacity 0.2s ease';
            row.style.opacity    = '0';
            setTimeout(() => {
                row.remove();
                // If list is now empty, show the empty state
                const el = document.getElementById('favorites-content');
                if (el && !el.querySelector('[id^="fav-row-"]')) {
                    el.innerHTML = `<div class="text-center py-12 text-gray-400">
                        <i class="fa-regular fa-heart text-5xl mb-3 block text-gray-200"></i>
                        <p class="font-medium">Избранное пусто</p>
                        <p class="text-sm mt-1">Нажмите ♡ на карточке товара</p>
                    </div>`;
                }
            }, 200);
        }
    } catch (e) {
        console.error('removeFromFavorites:', e);
        showToast('Ошибка при удалении');
    }
}

function hideFavoritesModal() {
    const modal = document.getElementById('favorites-modal');
    if (modal) modal.classList.add('modal-hidden');
}

// ════════════════════════════════════════════════════════════════════════
// AUTH — login / register / session / header UI swap
// ════════════════════════════════════════════════════════════════════════
function switchAuthTab(tab) {
    const loginBtn  = document.getElementById('tab-login-btn');
    const regBtn    = document.getElementById('tab-register-btn');
    const loginForm = document.getElementById('login-form');
    const regForm   = document.getElementById('register-form');
    if (!loginBtn || !regBtn || !loginForm || !regForm) return;

    if (tab === 'login') {
        loginBtn.className = 'flex-1 py-2.5 rounded-xl text-sm font-semibold bg-white shadow-sm text-gray-900';
        regBtn.className   = 'flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-500';
        loginForm.classList.remove('hidden');
        regForm.classList.add('hidden');
    } else {
        regBtn.className   = 'flex-1 py-2.5 rounded-xl text-sm font-semibold bg-white shadow-sm text-gray-900';
        loginBtn.className = 'flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-500';
        regForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    }
}

async function loginUser() {
    clearError('login-error');
    const phone    = document.getElementById('login-phone').value;
    const password = document.getElementById('login-pass').value;
    try {
        const res  = await fetch(`${API}/login`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ phone, password }),
        });
        const data = await res.json();
        if (!res.ok) return showError('login-error', data.error || 'Ошибка входа');
        setCurrentUser(data.user, data.token);
        closeUserDrawer();
        showToast(`Добро пожаловать, ${data.user.company_name}!`);
        await fetchFavorites();
        fetchProducts();
    } catch (e) {
        showError('login-error', 'Сервер недоступен');
    }
}

async function registerUser() {
    clearError('reg-error');
    const company_name = document.getElementById('reg-name').value;
    const phone         = document.getElementById('reg-phone').value;
    const password      = document.getElementById('reg-pass').value;
    try {
        const res  = await fetch(`${API}/register`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ company_name, phone, password }),
        });
        const data = await res.json();
        if (!res.ok) return showError('reg-error', data.error || 'Ошибка регистрации');
        setCurrentUser(data.user, data.token);
        closeUserDrawer();
        showToast(`Аккаунт создан. Добро пожаловать, ${data.user.company_name}!`);
    } catch (e) {
        showError('reg-error', 'Сервер недоступен');
    }
}

// Swaps the header/drawer auth UI for the dashboard (Favorites, Order
// History, Logout) — this is the "Header auth UI swap" requirement.
function setCurrentUser(user, token) {
    currentUser = user;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    const profileDot      = document.getElementById('profile-dot');
    const authPanel        = document.getElementById('auth-panel');
    const dashboardPanel   = document.getElementById('dashboard-panel');
    const drawerTitle       = document.getElementById('user-drawer-title');
    const dashName          = document.getElementById('dashboard-user-name');
    const dashPhone         = document.getElementById('dashboard-user-phone');

    if (profileDot)    profileDot.classList.remove('hidden');
    if (authPanel)      authPanel.classList.add('hidden');
    if (dashboardPanel) dashboardPanel.classList.remove('hidden');
    if (drawerTitle)    drawerTitle.textContent = 'Личный кабинет';
    if (dashName)        dashName.textContent = user.company_name;
    if (dashPhone)        dashPhone.textContent = user.phone;
}

function logoutUser() {
    currentUser = null;
    favorites   = new Set();
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    const profileDot      = document.getElementById('profile-dot');
    const authPanel        = document.getElementById('auth-panel');
    const dashboardPanel   = document.getElementById('dashboard-panel');
    const drawerTitle       = document.getElementById('user-drawer-title');

    if (profileDot)    profileDot.classList.add('hidden');
    if (authPanel)      authPanel.classList.remove('hidden');
    if (dashboardPanel) dashboardPanel.classList.add('hidden');
    if (drawerTitle)    drawerTitle.textContent = 'Аккаунт';
    switchAuthTab('login');

    fetchProducts();
    showToast('Вы вышли из аккаунта');
}

function restoreSession() {
    const token = localStorage.getItem('token');
    const user  = localStorage.getItem('user');
    if (token && user) {
        try {
            setCurrentUser(JSON.parse(user), token);
        } catch (e) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    }
}

// ════════════════════════════════════════════════════════════════════════
// ORDER HISTORY
// ════════════════════════════════════════════════════════════════════════
async function showOrders() {
    const modal = document.getElementById('orders-modal');
    if (modal) modal.classList.remove('modal-hidden');
    const el = document.getElementById('orders-content');
    if (!el) return;

    if (!currentUser) {
        el.innerHTML = `<div class="text-center py-12 text-gray-400">
            <i class="fa-regular fa-clock text-4xl mb-3 block"></i>
            <p class="font-medium">Войдите, чтобы видеть историю заказов</p>
        </div>`;
        return;
    }

    el.innerHTML = '<p class="text-gray-400 text-sm text-center py-8">Загрузка...</p>';
    try {
        const res    = await fetch(`${API}/orders`, { headers: authHeaders() });
        const orders = await res.json();

        if (!orders.length) {
            el.innerHTML = `<div class="text-center py-12 text-gray-400">
                <i class="fa-solid fa-box-open text-4xl mb-3 block text-gray-200"></i>
                <p class="font-medium">Заказов пока нет</p>
            </div>`;
            return;
        }

        const statusLabel = { new: 'Новый', confirmed: 'Подтверждён', shipped: 'Отправлен', done: 'Выполнен' };
        const statusColor = { new: 'bg-blue-100 text-blue-700', confirmed: 'bg-yellow-100 text-yellow-700', shipped: 'bg-purple-100 text-purple-700', done: 'bg-green-100 text-green-700' };
        const unitWord    = { piece: 'шт', pack: 'уп', box: 'кор' };

        el.innerHTML = orders.map(o => `
            <div class="border rounded-2xl p-5 mb-4">
                <div class="flex justify-between items-center mb-3">
                    <div class="flex items-center gap-3">
                        <span class="font-bold text-gray-800">Заказ №${o.id}</span>
                        <span class="text-xs px-2.5 py-1 rounded-full font-medium ${statusColor[o.status] || 'bg-gray-100 text-gray-600'}">
                            ${statusLabel[o.status] || o.status}
                        </span>
                    </div>
                    <span class="text-sm text-gray-400">${new Date(o.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                ${o.items.map(i => `
                    <div class="flex justify-between text-sm py-2 border-b last:border-0">
                        <div>
                            <span class="text-gray-500 text-xs">Арт. ${escapeHtml(i.article || i.product_id)}</span>
                            <p class="text-gray-700">${escapeHtml(i.name)} × ${i.quantity} ${unitWord[i.unit_type] || 'шт'}.</p>
                        </div>
                        <span class="font-medium shrink-0 ml-2">${fmtMoney(i.price_at_purchase * i.quantity)} ₸</span>
                    </div>
                `).join('')}
                <div class="flex justify-between font-bold mt-3 pt-2 text-base">
                    <span>Итого</span>
                    <span class="text-orange-500">${o.total_sum} ₸</span>
                </div>
            </div>
        `).join('');
    } catch (e) {
        el.innerHTML = '<p class="text-red-400 text-sm text-center py-4">Ошибка загрузки</p>';
    }
}

function hideOrders() {
    const modal = document.getElementById('orders-modal');
    if (modal) modal.classList.add('modal-hidden');
}

// ════════════════════════════════════════════════════════════════════════
// MODAL BACKDROP CLOSE
// ════════════════════════════════════════════════════════════════════════
function wireModalBackdrops() {
    ['orders-modal', 'favorites-modal'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('click', function (e) {
            if (e.target === this) this.classList.add('modal-hidden');
        });
    });
}

// ════════════════════════════════════════════════════════════════════════
// BOOT
// ════════════════════════════════════════════════════════════════════════
async function init() {
    initPhoneMasks();
    wireSearchInput('search-input', 'search-clear');
    wireSearchInput('search-input-mobile', 'search-clear-mobile');
    wireModalBackdrops();
    restoreSession();

    renderCatalogNav();              // from static catalogData
    await fetchAndRenderCategoryPills(); // from live DB
    await fetchAndRenderVolumePills();   // from live DB
    if (currentUser) await fetchFavorites();
    await fetchProducts();
}

document.addEventListener('DOMContentLoaded', init);
// ── Call this inside sendToWhatsApp() right after dbTotal is confirmed,
// ── before building the WhatsApp URL.  Replace the existing saveOrderToHistory
// ── call if you already have one, or add it as shown below.

function saveOrderToHistory(items, total) {
    const order = {
        id:         Date.now(),
        created_at: new Date().toISOString(),
        status:     'new',
        total_sum:  fmtMoney(total),
        items: items.map(i => ({
            article:   i.article,
            name:      i.name,
            quantity:  i.qty,
            unit_type: i.unit,
            unit_label: i.unitLabel,
            price_at_purchase: i.unitPrice,
        })),
    };

    const existing = JSON.parse(localStorage.getItem('orderHistory') || '[]');
    existing.unshift(order); // newest first
    localStorage.setItem('orderHistory', JSON.stringify(existing));
}

function showOrders() {
    const modal = document.getElementById('orders-modal');
    if (modal) modal.classList.remove('modal-hidden');
    renderOrderHistory();
}

function hideOrders() {
    const modal = document.getElementById('orders-modal');
    if (modal) modal.classList.add('modal-hidden');
}

function renderOrderHistory() {
    const el = document.getElementById('orders-content');
    if (!el) return;

    const orders = JSON.parse(localStorage.getItem('orderHistory') || '[]');

    if (!orders.length) {
        el.innerHTML = `<div class="text-center py-12 text-gray-400">
            <i class="fa-solid fa-box-open text-4xl mb-3 block text-gray-200"></i>
            <p class="font-medium">Заказов пока нет</p>
            <p class="text-sm mt-1">После отправки в WhatsApp заказ сохранится здесь</p>
        </div>`;
        return;
    }

    const statusLabel = { new: 'Новый', confirmed: 'Подтверждён', shipped: 'Отправлен', done: 'Выполнен' };
    const statusColor = { new: 'bg-blue-100 text-blue-700', confirmed: 'bg-yellow-100 text-yellow-700', shipped: 'bg-purple-100 text-purple-700', done: 'bg-green-100 text-green-700' };
    const unitWord    = { piece: 'шт', pack: 'уп', box: 'кор' };

    el.innerHTML = orders.map(o => `
        <div class="border rounded-2xl p-5 mb-4">
            <div class="flex justify-between items-center mb-3 flex-wrap gap-2">
                <div class="flex items-center gap-3">
                    <span class="font-bold text-gray-800">Заказ №${o.id.toString().slice(-6)}</span>
                    <span class="text-xs px-2.5 py-1 rounded-full font-medium ${statusColor[o.status] || 'bg-gray-100 text-gray-600'}">
                        ${statusLabel[o.status] || o.status}
                    </span>
                </div>
                <span class="text-sm text-gray-400">
                    ${new Date(o.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
            </div>
            ${o.items.map(i => `
                <div class="flex justify-between text-sm py-2 border-b last:border-0">
                    <div>
                        <span class="text-gray-500 text-xs">Арт. ${escapeHtml(i.article)}</span>
                        <p class="text-gray-700">
                            ${escapeHtml(i.name)} × ${i.quantity} ${unitWord[i.unit_type] || 'шт'}.
                        </p>
                    </div>
                    <span class="font-medium shrink-0 ml-2">
                        ${fmtMoney(i.price_at_purchase * i.quantity)} ₸
                    </span>
                </div>
            `).join('')}
            <div class="flex justify-between font-bold mt-3 pt-2 text-base">
                <span>Итого</span>
                <span class="text-orange-500">${o.total_sum} ₸</span>
            </div>
        </div>
    `).join('');
}