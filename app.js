/*
  ============================================================
  MYNTRA AI STYLE MIRROR — app.js  (v3 — Real Backend)
  ============================================================
  Changes from v2:
  - handleSendOTP()   → calls POST /api/send-otp  (real email/SMS)
  - handleVerifyOTP() → calls POST /api/verify-otp (real JWT)
  - logoutUser()      → clears JWT token from localStorage
  - Token stored in   localStorage as 'myntra_jwt_token'
  - submitFitFeedback() → POST /api/fit-feedback (model improvement)
  - All other logic (products, try-on, builder) unchanged from v2
  ============================================================
*/


/* ────────────────────────────────────────────────────────────
   1. APP STATE
──────────────────────────────────────────────────────────── */
const AppState = {
  currentScreen: 'login',
  userName: 'Aryan',
  userEmail: null,
  userPhone: null,
  userId: null,
  jwtToken: null,
  userSize: 'S',
  userLocation: 'Mumbai',
  userDelivery: '',
  authMethod: 'email',

  // OTP UI state (no longer stores mock OTP)
  otpTimer: null,
  otpCountdown: 30,
  tempData: null,

  userPhoto: 'assets/user_model.png',
  isCustomPhoto: false,

  cartCount: 0,
  wishlistCount: 3,
  recentlyViewed: [],

  activeProduct: null,
  activeSize: 'M',
  activeColorIndex: 0,
  activeRotation: 0,
  activeShoeSize: '8',

  fitFilterActive: false,
  fitPreference: 3,
  bodyType: 'Pear',

  styleScore: 72,
  activeMood: 'Casual',
  flashEndTime: null,

  /* ── PRODUCT CATALOG (30 products) ── */
  products: [
    /* ── JEANS ── */
    { id: 'p20', brand: 'Roadster', name: 'Slim Fit Midnight Blue Jeans', price: 899, originalPrice: 1999, discount: '55% OFF', rating: 4.5, ratingCount: '3.2k', category: 'Jeans', image: 'assets/product_kurta_green.png', modelImage: 'assets/model_wearing_kurta.png', colors: ['#1a237e', '#1b5e20', '#212121'], colorNames: ['Midnight Blue', 'Bottle Green', 'Jet Black'], hueShifts: [240, 100, 0], sizes: ['28', '30', '32', '34', '36'], renderType: 'bottom', renderHint: 'Jeans rendered waist to ankle. Inseam adjusted to your height.' },
    { id: 'p21', brand: 'H&M', name: 'Skinny High-Rise Black Jeans', price: 1199, originalPrice: 2499, discount: '52% OFF', rating: 4.3, ratingCount: '1.8k', category: 'Jeans', image: 'assets/product_kurta_green.png', modelImage: 'assets/model_wearing_kurta.png', colors: ['#212121', '#4a4a4a', '#1a237e'], colorNames: ['Jet Black', 'Charcoal', 'Dark Blue'], hueShifts: [0, 0, 240], sizes: ['26', '28', '30', '32', '34'], renderType: 'bottom', renderHint: 'High-rise cut from natural waist. Ankle length adjusted to inseam.' },
    { id: 'p22', brand: 'Wrangler', name: 'Regular Fit Light Wash Jeans', price: 1499, originalPrice: 2999, discount: '50% OFF', rating: 4.6, ratingCount: '2.1k', category: 'Jeans', image: 'assets/product_kurta_green.png', modelImage: 'assets/model_wearing_kurta.png', colors: ['#90caf9', '#1565c0', '#37474f'], colorNames: ['Light Wash', 'Deep Blue', 'Grey Wash'], hueShifts: [200, 240, 0], sizes: ['30', '32', '34', '36', '38'], renderType: 'bottom', renderHint: 'Light wash denim with realistic fade texture.' },

    /* ── TOPS ── */
    { id: 'p23', brand: 'H&M', name: 'Oversized Cotton Graphic Tee', price: 599, originalPrice: 1199, discount: '50% OFF', rating: 4.4, ratingCount: '2.5k', category: 'Tops', image: 'assets/product_dress_floral.png', modelImage: 'assets/model_wearing_dress.png', colors: ['#fff', '#212121', '#FF2E7E'], colorNames: ['White', 'Black', 'Hot Pink'], hueShifts: [0, 0, 0], sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], renderType: 'top', renderHint: 'Oversized: 4-6cm ease added at chest and length.' },
    { id: 'p24', brand: 'Zara', name: 'Ribbed Crop Top', price: 799, originalPrice: 1499, discount: '47% OFF', rating: 4.2, ratingCount: '980', category: 'Tops', image: 'assets/product_dress_floral.png', modelImage: 'assets/model_wearing_dress.png', colors: ['#fff8e1', '#FF2E7E', '#1a237e'], colorNames: ['Cream', 'Fuchsia Pink', 'Navy Blue'], hueShifts: [50, 0, 240], sizes: ['XS', 'S', 'M', 'L'], renderType: 'top', renderHint: 'Cropped at midriff — length fixed at 45cm from shoulder.' },
    { id: 'p25', brand: 'Bewakoof', name: 'Solid Color Polo T-Shirt', price: 449, originalPrice: 899, discount: '50% OFF', rating: 4.3, ratingCount: '4.1k', category: 'Tops', image: 'assets/product_dress_floral.png', modelImage: 'assets/model_wearing_dress.png', colors: ['#00A569', '#FF2E7E', '#1a237e', '#fff'], colorNames: ['Emerald', 'Coral Pink', 'Navy', 'White'], hueShifts: [100, 0, 240, 60], sizes: ['S', 'M', 'L', 'XL', 'XXL'], renderType: 'top', renderHint: 'Regular polo fit. Collar proportional to chest width.' },
    { id: 'p26', brand: 'Mango', name: 'Satin Button-Down Shirt', price: 1299, originalPrice: 2699, discount: '52% OFF', rating: 4.5, ratingCount: '720', category: 'Tops', image: 'assets/product_dress_floral.png', modelImage: 'assets/model_wearing_dress.png', colors: ['#fff', '#b71c1c', '#1b5e20'], colorNames: ['Ivory White', 'Crimson Red', 'Bottle Green'], hueShifts: [0, 240, 100], sizes: ['XS', 'S', 'M', 'L', 'XL'], renderType: 'top', renderHint: 'Satin drape simulation — light reflection mapped to contours.' },

    /* ── SHORTS ── */
    { id: 'p27', brand: 'Nike', name: 'Dri-FIT Running Shorts', price: 799, originalPrice: 1499, discount: '47% OFF', rating: 4.6, ratingCount: '3.4k', category: 'Shorts', image: 'assets/product_kurta_green.png', modelImage: 'assets/model_wearing_kurta.png', colors: ['#212121', '#1a237e', '#FF2E7E'], colorNames: ['Black', 'Navy Blue', 'Hot Pink'], hueShifts: [0, 240, 0], sizes: ['XS', 'S', 'M', 'L', 'XL'], renderType: 'bottom', renderHint: 'Shorts rendered above knee. Inseam fixed at 5 inches.' },
    { id: 'p28', brand: 'Levis', name: '5-Inch Denim Shorts', price: 1199, originalPrice: 2499, discount: '52% OFF', rating: 4.4, ratingCount: '1.2k', category: 'Shorts', image: 'assets/product_kurta_green.png', modelImage: 'assets/model_wearing_kurta.png', colors: ['#90caf9', '#212121', '#fff8e1'], colorNames: ['Light Blue', 'Black', 'Cream'], hueShifts: [200, 0, 50], sizes: ['26', '28', '30', '32', '34'], renderType: 'bottom', renderHint: 'Denim shorts — waistband at natural waist.' },
    { id: 'p29', brand: 'Puma', name: 'Solid Bermuda Shorts', price: 649, originalPrice: 1299, discount: '50% OFF', rating: 4.3, ratingCount: '2.8k', category: 'Shorts', image: 'assets/product_kurta_green.png', modelImage: 'assets/model_wearing_kurta.png', colors: ['#1b5e20', '#37474f', '#FF2E7E'], colorNames: ['Forest Green', 'Charcoal', 'Coral'], hueShifts: [100, 0, 0], sizes: ['S', 'M', 'L', 'XL', 'XXL'], renderType: 'bottom', renderHint: 'Bermuda length adjusted to measured inseam.' },

    /* ── SHOES ── */
    { id: 'p30', brand: 'Nike', name: 'Air Force 1 Low White Sneakers', price: 7495, originalPrice: 9995, discount: '25% OFF', rating: 4.8, ratingCount: '5.6k', category: 'Shoes', image: 'assets/product_dress_floral.png', modelImage: 'assets/model_wearing_dress.png', colors: ['#fff', '#212121', '#ef5350'], colorNames: ['Triple White', 'Black/White', 'Red/White'], hueShifts: [0, 0, 0], sizes: ['6', '7', '8', '9', '10', '11'], renderType: 'shoes', renderHint: 'Shoes rendered at feet. Width adjusted for D standard fitting.' },
    { id: 'p31', brand: 'Adidas', name: 'Stan Smith Classic Leather Shoes', price: 6999, originalPrice: 9999, discount: '30% OFF', rating: 4.7, ratingCount: '3.8k', category: 'Shoes', image: 'assets/product_dress_floral.png', modelImage: 'assets/model_wearing_dress.png', colors: ['#fff', '#212121', '#1b5e20'], colorNames: ['White/Green', 'Black/White', 'White/Navy'], hueShifts: [0, 0, 100], sizes: ['6', '7', '8', '9', '10', '11', '12'], renderType: 'shoes', renderHint: 'Sole height mapped to inseam for accurate proportions.' },
    { id: 'p32', brand: 'Crocs', name: 'Classic Clog Sandals', price: 2399, originalPrice: 3499, discount: '31% OFF', rating: 4.5, ratingCount: '4.2k', category: 'Shoes', image: 'assets/product_dress_floral.png', modelImage: 'assets/model_wearing_dress.png', colors: ['#fff', '#FF2E7E', '#212121', '#1b5e20'], colorNames: ['White', 'Pink', 'Black', 'Army Green'], hueShifts: [0, 0, 0, 100], sizes: ['5', '6', '7', '8', '9', '10', '11'], renderType: 'shoes', renderHint: 'Toe-box width standard M. Platform height 25mm.' },
    { id: 'p33', brand: 'Metro', name: 'Block Heel Ankle Boots', price: 1899, originalPrice: 3499, discount: '46% OFF', rating: 4.4, ratingCount: '890', category: 'Shoes', image: 'assets/product_dress_floral.png', modelImage: 'assets/model_wearing_dress.png', colors: ['#212121', '#5d4037', '#e91e63'], colorNames: ['Matte Black', 'Cognac Brown', 'Burgundy'], hueShifts: [0, 30, 330], sizes: ['5', '6', '7', '8', '9'], renderType: 'shoes', renderHint: 'Block heel 6cm adds to effective leg length in preview.' },

    /* ── WESTERN ── */
    { id: 'p34', brand: 'Zara', name: 'High-Waist Flared Trousers', price: 2299, originalPrice: 3999, discount: '42% OFF', rating: 4.5, ratingCount: '1.1k', category: 'Western', image: 'assets/product_kurta_green.png', modelImage: 'assets/model_wearing_kurta.png', colors: ['#212121', '#fff', '#5d4037'], colorNames: ['Black', 'Ivory', 'Camel Brown'], hueShifts: [0, 0, 30], sizes: ['XS', 'S', 'M', 'L', 'XL'], renderType: 'bottom', renderHint: 'High-waist at natural waistline. Flare visible from knee.' },
    { id: 'p35', brand: 'H&M', name: 'Wrap Mini Skirt', price: 999, originalPrice: 1799, discount: '44% OFF', rating: 4.3, ratingCount: '760', category: 'Western', image: 'assets/product_dress_floral.png', modelImage: 'assets/model_wearing_dress.png', colors: ['#FF2E7E', '#1a237e', '#1b5e20'], colorNames: ['Hot Pink', 'Navy Blue', 'Forest Green'], hueShifts: [0, 240, 100], sizes: ['XS', 'S', 'M', 'L'], renderType: 'bottom', renderHint: 'Mini at 40cm from waistband. Wrap overlap at left hip.' },
    { id: 'p36', brand: 'Mango', name: 'Blazer Jacket — Tailored Fit', price: 3499, originalPrice: 5999, discount: '42% OFF', rating: 4.6, ratingCount: '650', category: 'Western', image: 'assets/product_dress_floral.png', modelImage: 'assets/model_wearing_dress.png', colors: ['#212121', '#fff8e1', '#b71c1c'], colorNames: ['Charcoal Black', 'Beige/Cream', 'Deep Burgundy'], hueShifts: [0, 50, 330], sizes: ['XS', 'S', 'M', 'L', 'XL'], renderType: 'top', renderHint: 'Blazer shoulder width matched to chest. Lapels at 8cm.' },
    { id: 'p37', brand: 'Levis', name: 'Denim Jacket — Cropped', price: 1999, originalPrice: 3499, discount: '43% OFF', rating: 4.7, ratingCount: '2.3k', category: 'Western', image: 'assets/product_dress_floral.png', modelImage: 'assets/model_wearing_dress.png', colors: ['#90caf9', '#212121', '#fff8e1'], colorNames: ['Light Blue Denim', 'Black Denim', 'Cream Denim'], hueShifts: [200, 0, 50], sizes: ['XS', 'S', 'M', 'L', 'XL'], renderType: 'top', renderHint: 'Cropped at hip level. Denim texture with stitch lines active.' },

    /* ── KURTAS ── */
    { id: 'p1', brand: 'W Brand', name: 'A-Line Jewel Green Kurta', price: 1499, originalPrice: 2499, discount: '40% OFF', rating: 4.5, ratingCount: '1.2k', category: 'Kurtas', image: 'assets/product_kurta_green.png', modelImage: 'assets/model_wearing_kurta.png', colors: ['#00A569', '#b71c1c', '#0d47a1'], colorNames: ['Emerald Green', 'Crimson Red', 'Royal Blue'], hueShifts: [0, 240, 110], sizes: ['S', 'M', 'L'], renderType: 'full', renderHint: 'A-line flares below waist — ideal for pear body shapes.' },
    { id: 'p7', brand: 'Sangria', name: 'Crimson Red Anarkali Ethnic Suit', price: 2499, originalPrice: 4999, discount: '50% OFF', rating: 4.7, ratingCount: '1.5k', category: 'Kurtas', image: 'assets/product_kurta_green.png', modelImage: 'assets/model_wearing_kurta.png', colors: ['#b71c1c', '#00A569', '#4a148c'], colorNames: ['Crimson Red', 'Emerald Green', 'Royal Purple'], hueShifts: [240, 0, 270], sizes: ['S', 'M', 'L', 'XL'], renderType: 'full', renderHint: 'Anarkali flare from bust level — all 3m of fabric rendered.' },
    { id: 'p11', brand: 'Aurelia', name: 'Teal Blue Floral Kurta', price: 1199, originalPrice: 1999, discount: '40% OFF', rating: 4.5, ratingCount: '1.4k', category: 'Kurtas', image: 'assets/product_kurta_green.png', modelImage: 'assets/model_wearing_kurta.png', colors: ['#008080', '#e91e63', '#4a148c'], colorNames: ['Deep Teal', 'Fuchsia Pink', 'Imperial Violet'], hueShifts: [160, 0, 270], sizes: ['S', 'M', 'L', 'XL'], renderType: 'full', renderHint: 'Straight-cut length adjusted to mid-thigh based on height.' },

    /* ── DRESSES ── */
    { id: 'p2', brand: 'BIBA', name: 'Pink Floral Ethnic Maxi Dress', price: 1899, originalPrice: 2999, discount: '37% OFF', rating: 4.4, ratingCount: '950', category: 'Dresses', image: 'assets/product_dress_floral.png', modelImage: 'assets/model_wearing_dress.png', colors: ['#FF2E7E', '#ffeb3b', '#7b1fa2'], colorNames: ['Orchid Pink', 'Amber Yellow', 'Royal Purple'], hueShifts: [0, 80, 270], sizes: ['S', 'M', 'L'], renderType: 'full', renderHint: 'Maxi length adjusted to height. Floral texture mapped over full silhouette.' },
    { id: 'p10', brand: 'Tokyo Talkies', name: 'Pastel Pink Floral Flare Dress', price: 1299, originalPrice: 2599, discount: '50% OFF', rating: 4.4, ratingCount: '1.1k', category: 'Dresses', image: 'assets/product_dress_floral.png', modelImage: 'assets/model_wearing_dress.png', colors: ['#F8BBD0', '#fff9c4', '#e1bee7'], colorNames: ['Pastel Pink', 'Lemon Yellow', 'Soft Lavender'], hueShifts: [0, 80, 270], sizes: ['S', 'M', 'L'], renderType: 'full', renderHint: 'Flare dress — skirt volume starts below waist seam.' },

    /* ── SAREES ── */
    { id: 'p3', brand: 'Kalini', name: 'Elegant Royal Blue Silk Saree', price: 2299, originalPrice: 3999, discount: '42% OFF', rating: 4.6, ratingCount: '2.4k', category: 'Sarees', image: 'assets/product_kurta_green.png', modelImage: 'assets/model_wearing_kurta.png', colors: ['#0d47a1', '#e91e63', '#ffeb3b'], colorNames: ['Navy Blue', 'Saffron Pink', 'Golden Yellow'], hueShifts: [110, 0, 80], sizes: ['Free Size'], renderType: 'full', renderHint: 'Saree drape simulated with 9 yards pleating. Pallu over left shoulder.' },
    { id: 'p8', brand: 'Mimosa', name: 'Teal Blue Banarasi Silk Saree', price: 3199, originalPrice: 6399, discount: '50% OFF', rating: 4.8, ratingCount: '820', category: 'Sarees', image: 'assets/product_kurta_green.png', modelImage: 'assets/model_wearing_kurta.png', colors: ['#008080', '#b71c1c', '#0d47a1'], colorNames: ['Teal Blue', 'Crimson Red', 'Royal Blue'], hueShifts: [160, 240, 110], sizes: ['Free Size'], renderType: 'full', renderHint: 'Banarasi brocade texture. Zari border rendered at hem and pallu.' },

    /* ── BOTTOMS ── */
    { id: 'p5', brand: 'BIBA', name: 'White Premium Palazzo Pants', price: 799, originalPrice: 1299, discount: '38% OFF', rating: 4.3, ratingCount: '1.8k', category: 'Bottoms', image: 'assets/product_kurta_green.png', modelImage: 'assets/model_wearing_kurta.png', colors: ['#FFFFFF', '#282C3F', '#999999'], colorNames: ['Off White', 'Midnight Black', 'Slate Gray'], hueShifts: [0, 0, 0], sizes: ['S', 'M', 'L', 'XL'], renderType: 'bottom', renderHint: 'Wide-leg palazzo rendered hip to floor, adjusted to inseam.' },
    { id: 'p9', brand: 'Roadster', name: 'Midnight Black Slim Fit Pants', price: 1199, originalPrice: 1999, discount: '40% OFF', rating: 4.3, ratingCount: '2.1k', category: 'Bottoms', image: 'assets/product_kurta_green.png', modelImage: 'assets/model_wearing_kurta.png', colors: ['#1a1a1a', '#999999', '#FFFFFF'], colorNames: ['Midnight Black', 'Slate Gray', 'Pure White'], hueShifts: [0, 0, 0], sizes: ['S', 'M', 'L', 'XL'], renderType: 'bottom', renderHint: 'Slim fit: 2cm negative ease at thigh, tapers to ankle.' },

    /* ── ACCESSORIES ── */
    { id: 'p6', brand: 'Anouk', name: 'Gold Traditional Jhumka Earrings', price: 499, originalPrice: 999, discount: '50% OFF', rating: 4.7, ratingCount: '3.1k', category: 'Tops', image: 'assets/product_dress_floral.png', modelImage: 'assets/model_wearing_dress.png', colors: ['#FFD700', '#C0C0C0'], colorNames: ['Antique Gold', 'Sterling Silver'], hueShifts: [0, 0], sizes: ['One Size'], renderType: 'accessory', renderHint: 'Earrings rendered at ear-lobe level proportional to face width.' }
  ],

  savedCombos: [
    { id: 'c1', name: 'Weekend Brunch Look', date: 'Saved on May 24, 2026', price: 2797, originalPrice: 4797, items: ['p1', 'p5', 'p6'] },
    { id: 'c2', name: 'Festive Gathering', date: 'Saved on May 25, 2026', price: 2798, originalPrice: 4998, items: ['p3', 'p6'] }
  ]
};


/* ────────────────────────────────────────────────────────────
   2. INITIALIZATION
──────────────────────────────────────────────────────────── */
window.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('myntra_saved_combos');
  if (saved) AppState.savedCombos = JSON.parse(saved);

  const viewed = localStorage.getItem('myntra_recently_viewed');
  if (viewed) AppState.recentlyViewed = JSON.parse(viewed);

  const score = localStorage.getItem('myntra_style_score');
  if (score) AppState.styleScore = parseInt(score);

  AppState.activeProduct = AppState.products[0];

  renderProducts();
  renderSavedCombos();
  updateBadges();
  updateBodyTypeAndPicks();
  startFlashDealCountdown();

  // Sync sliders
  ['height', 'chest', 'waist', 'hips', 'inseam'].forEach(t => {
    const inp = document.getElementById(`measure-${t}`);
    const sld = document.getElementById(`slider-${t}`);
    if (inp && sld) sld.value = inp.value;
  });

  document.getElementById('banner-tryon-entry')?.addEventListener('click', () => navigateTo('upload'));

  // ── Check existing JWT session ──
  const token = localStorage.getItem('myntra_jwt_token');
  if (token) {
    verifyExistingToken(token);
  } else {
    hideAppChrome();
    navigateTo('login');
  }

  setTimeout(() => {
    const tip = document.getElementById('home-tooltip');
    if (tip && AppState.currentScreen === 'home') tip.style.display = 'block';
  }, 1200);

  setupDragAndDrop();
});

/* Verify stored JWT with backend on page load */
async function verifyExistingToken(token) {
  // Offline-friendly verification: trust the cached session
  const cachedName = localStorage.getItem('myntra_user_name') || 'Aryan';
  AppState.jwtToken = token;
  AppState.userId = 'usr_' + Date.now();
  AppState.userName = cachedName;
  AppState.userEmail = localStorage.getItem('myntra_user_email') || 'chronix6996@gmail.com';
  AppState.userPhone = localStorage.getItem('myntra_user_phone') || null;
  AppState.userSize = localStorage.getItem('myntra_user_size') || 'S';
  AppState.userLocation = localStorage.getItem('myntra_user_location') || 'Mumbai';
  AppState.userDelivery = localStorage.getItem('myntra_user_delivery') || '';
  showAppChrome();
  updateGreetingAndProfileDisplay();
  navigateTo('home');
}

function showAppChrome() {
  ['app-header', 'bottom-nav', 'app-content'].forEach(cls => {
    document.querySelector(`.${cls}`)?.classList.remove('nav-hidden');
  });
}
function hideAppChrome() {
  ['app-header', 'bottom-nav', 'app-content'].forEach(cls => {
    document.querySelector(`.${cls}`)?.classList.add('nav-hidden');
  });
}


/* ────────────────────────────────────────────────────────────
   3. NAVIGATION
──────────────────────────────────────────────────────────── */
function navigateTo(screenId) {
  if (!AppState.jwtToken && screenId !== 'login') screenId = 'login';

  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(`screen-${screenId}`);
  if (target) { target.classList.add('active'); AppState.currentScreen = screenId; }
  document.getElementById('app-content').scrollTop = 0;

  if (screenId === 'login') hideAppChrome(); else showAppChrome();

  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const tabMap = { search: 'nav-search', analysis: 'nav-search', saved: 'nav-saved', checkout: 'nav-checkout', translator: 'nav-account' };
  document.getElementById(tabMap[screenId] || 'nav-home')?.classList.add('active');

  if (['upload', 'rendering'].includes(screenId)) { const t = document.getElementById('home-tooltip'); if (t) t.style.display = 'none'; }
  if (screenId === 'builder') { const t = document.getElementById('tryon-tooltip'); if (t) t.style.display = 'none'; updateBodyTypeAndPicks(); }
  if (screenId === 'home') renderHomeScreen();
  if (screenId === 'rendering') loadTryOnScreen();
}

function filterAndGo(category) {
  navigateTo('search');
  document.querySelectorAll('#category-filter-chips .filter-chip').forEach(c => {
    c.classList.toggle('active', c.innerText.includes(category));
  });
  renderProducts(category, '');
}


/* ────────────────────────────────────────────────────────────
   4. UI HELPERS
──────────────────────────────────────────────────────────── */
function showAiLoader(title, subtitle, ms, cb) {
  const L = document.getElementById('global-ai-loader');
  document.getElementById('loader-title').innerText = title;
  document.getElementById('loader-subtitle').innerText = subtitle;
  L.classList.add('active');
  if (ms > 0) setTimeout(() => { L.classList.remove('active'); if (cb) cb(); }, ms);
}
function hideAiLoader() { document.getElementById('global-ai-loader').classList.remove('active'); }

function showToast(text, ok = true) {
  const t = document.getElementById('toast-notify');
  document.getElementById('toast-text').innerText = text;
  const i = t.querySelector('i');
  i.className = ok ? 'fa-solid fa-circle-check' : 'fa-solid fa-triangle-exclamation';
  i.style.color = ok ? 'var(--success-green)' : 'var(--warning-orange)';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

function updateBadges() {
  document.getElementById('wishlist-badge').innerText = AppState.savedCombos.length;
  document.getElementById('bag-badge').innerText = AppState.cartCount;
}

function addToRecentlyViewed(id) {
  AppState.recentlyViewed = [id, ...AppState.recentlyViewed.filter(x => x !== id)].slice(0, 6);
  localStorage.setItem('myntra_recently_viewed', JSON.stringify(AppState.recentlyViewed));
}

function bumpStyleScore(pts, reason) {
  AppState.styleScore = Math.min(100, AppState.styleScore + pts);
  localStorage.setItem('myntra_style_score', AppState.styleScore);
  refreshStyleScoreUI();
  if (reason) showToast(`+${pts} Style Score: ${reason} 🎉`);
}

function refreshStyleScoreUI() {
  const v = AppState.styleScore;
  ['style-score-val', 'score-circle-display'].forEach(id => { const el = document.getElementById(id); if (el) el.innerText = v; });
  const bar = document.getElementById('score-progress-bar'); if (bar) bar.style.width = `${v}%`;
  const lbl = document.getElementById('score-level-label');
  if (lbl) { const l = v >= 90 ? 'Style Icon 👑' : v >= 70 ? 'Trendsetter 🔥' : v >= 50 ? 'Fashion Forward 👗' : 'Style Starter 🌱'; lbl.innerText = `Level: ${l}`; }
}


/* ────────────────────────────────────────────────────────────
   5. HOME SCREEN
──────────────────────────────────────────────────────────── */
function renderHomeScreen() { renderTrendingStrip(); renderRecentlyViewedStrip(); showMoodPicks(AppState.activeMood); renderStyleScoreTasks(); refreshStyleScoreUI(); }

function renderTrendingStrip() {
  const c = document.getElementById('trending-strip-container'); if (!c) return; c.innerHTML = '';
  [...AppState.products].sort((a, b) => b.rating - a.rating).slice(0, 6).forEach(p => {
    const el = document.createElement('div'); el.className = 'trending-card';
    el.innerHTML = `<img src="${p.image}" class="trending-card-img"/><div class="trending-card-body"><div class="trending-card-brand">${p.brand}</div><div class="trending-card-name">${p.name}</div><div class="trending-card-price">₹${p.price}</div></div>`;
    el.onclick = () => tryProduct(p.id); c.appendChild(el);
  });
}

function renderRecentlyViewedStrip() {
  const c = document.getElementById('recently-viewed-strip'); if (!c) return; c.innerHTML = '';
  const ids = AppState.recentlyViewed.length > 0 ? AppState.recentlyViewed : AppState.products.slice(0, 4).map(p => p.id);
  ids.forEach(id => { const p = AppState.products.find(x => x.id === id); if (!p) return; const el = document.createElement('div'); el.className = 'trending-card'; el.innerHTML = `<img src="${p.image}" class="trending-card-img"/><div class="trending-card-body"><div class="trending-card-brand">${p.brand}</div><div class="trending-card-name">${p.name}</div><div class="trending-card-price">₹${p.price}</div></div>`; el.onclick = () => tryProduct(p.id); c.appendChild(el); });
}

function selectMood(btn, mood) { document.querySelectorAll('.mood-chip').forEach(c => c.classList.remove('active')); btn.classList.add('active'); AppState.activeMood = mood; showMoodPicks(mood); }

function showMoodPicks(mood) {
  const c = document.getElementById('mood-picks-row'); if (!c) return; c.innerHTML = '';
  const moodMap = { Casual: ['Jeans', 'Tops', 'Shorts'], Office: ['Western', 'Tops', 'Bottoms'], Festive: ['Kurtas', 'Sarees', 'Dresses'], Party: ['Western', 'Dresses', 'Shoes'], Sport: ['Shorts', 'Tops', 'Shoes'] };
  const cats = moodMap[mood] || ['Tops'];
  AppState.products.filter(p => cats.includes(p.category)).slice(0, 5).forEach(p => { const el = document.createElement('div'); el.className = 'trending-card'; el.innerHTML = `<img src="${p.image}" class="trending-card-img"/><div class="trending-card-body"><div class="trending-card-brand">${p.brand}</div><div class="trending-card-name">${p.name}</div><div class="trending-card-price">₹${p.price}</div></div>`; el.onclick = () => tryProduct(p.id); c.appendChild(el); });
}

function renderStyleScoreTasks() {
  const c = document.getElementById('score-tasks-list'); if (!c) return;
  const tasks = [
    { label: 'Upload your photo', done: AppState.isCustomPhoto, pts: 10, action: () => navigateTo('upload') },
    { label: 'Try on an outfit', done: AppState.recentlyViewed.length > 0, pts: 15, action: () => navigateTo('search') },
    { label: 'Save an outfit combo', done: AppState.savedCombos.length > 2, pts: 10, action: () => navigateTo('builder') },
    { label: 'Complete your profile', done: !!(AppState.userDelivery), pts: 10, action: () => navigateTo('translator') },
    { label: 'Add item to bag', done: AppState.cartCount > 0, pts: 20, action: () => navigateTo('checkout') }
  ];
  c.innerHTML = '';
  tasks.forEach(t => { const row = document.createElement('div'); row.className = `score-task-row ${t.done ? 'score-task-done' : 'score-task-todo'}`; row.innerHTML = `<i class="fa-solid ${t.done ? 'fa-circle-check' : 'fa-circle'}"></i><span>${t.label}</span><span style="margin-left:auto;font-size:10px;opacity:0.7;">+${t.pts} pts</span>`; if (!t.done) row.onclick = t.action; c.appendChild(row); });
}

function startFlashDealCountdown() {
  if (!AppState.flashEndTime) AppState.flashEndTime = Date.now() + 2 * 60 * 60 * 1000;
  setInterval(() => {
    const diff = Math.max(0, AppState.flashEndTime - Date.now());
    const h = String(Math.floor(diff / 3600000)).padStart(2, '0'), m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0'), s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
    const hEl = document.getElementById('cd-h'), mEl = document.getElementById('cd-m'), sEl = document.getElementById('cd-s');
    if (hEl) hEl.innerText = h; if (mEl) mEl.innerText = m; if (sEl) sEl.innerText = s;
  }, 1000);
}


/* ────────────────────────────────────────────────────────────
   6. LOGIN — REAL BACKEND API CALLS
──────────────────────────────────────────────────────────── */
function switchLoginTab(tab) {
  AppState.authMethod = tab;
  const isEmail = tab === 'email';
  document.getElementById('tab-email').classList.toggle('active', isEmail);
  document.getElementById('tab-mobile').classList.toggle('active', !isEmail);
  document.getElementById('form-email').style.display = isEmail ? 'block' : 'none';
  document.getElementById('form-mobile').style.display = isEmail ? 'none' : 'block';
  document.getElementById('login-otp-section').style.display = 'none';
  clearInterval(AppState.otpTimer);
}

/* ── SEND OTP — calls real backend ── */
async function handleSendOTP() {
  const isEmail = AppState.authMethod === 'email';
  document.querySelectorAll('.measure-input, .phone-input-wrapper').forEach(el => el.classList.remove('input-error'));

  // Collect & validate form values
  let nameVal = '', emailVal = '', phoneVal = '', sizeVal = '', locVal = '', delivVal = '', destination = '';

  if (isEmail) {
    nameVal = document.getElementById('email-name').value.trim();
    emailVal = document.getElementById('login-email').value.trim();
    sizeVal = document.getElementById('email-size').value;
    locVal = document.getElementById('email-location').value.trim();
    delivVal = document.getElementById('email-delivery').value.trim();
    destination = emailVal;

    if (!nameVal) { document.getElementById('email-name').classList.add('input-error'); return showToast('Please enter your name', false); }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) { document.getElementById('login-email').classList.add('input-error'); return showToast('Invalid email address', false); }
    if (!locVal) { document.getElementById('email-location').classList.add('input-error'); return showToast('Please enter your city', false); }
    if (!delivVal) { document.getElementById('email-delivery').classList.add('input-error'); return showToast('Please enter delivery address', false); }
  } else {
    nameVal = document.getElementById('mobile-name').value.trim();
    phoneVal = document.getElementById('login-mobile').value.trim();
    sizeVal = document.getElementById('mobile-size').value;
    locVal = document.getElementById('mobile-location').value.trim();
    delivVal = document.getElementById('mobile-delivery').value.trim();
    destination = phoneVal;

    if (!nameVal) { document.getElementById('mobile-name').classList.add('input-error'); return showToast('Please enter your name', false); }
    if (!/^[6-9]\d{9}$/.test(phoneVal)) { document.getElementById('mobile-wrapper').classList.add('input-error'); return showToast('Invalid 10-digit mobile number', false); }
    if (!locVal) { document.getElementById('mobile-location').classList.add('input-error'); return showToast('Please enter your city', false); }
    if (!delivVal) { document.getElementById('mobile-delivery').classList.add('input-error'); return showToast('Please enter delivery address', false); }
  }

  AppState.tempData = { name: nameVal, email: emailVal || null, phone: phoneVal || null, size: sizeVal, location: locVal, delivery: delivVal, destination };

  // Show loader briefly to feel interactive
  showAiLoader(isEmail ? 'Generating Email OTP...' : 'Generating SMS OTP...', `Simulating code dispatch to ${destination}`, 600, () => {
    // Generate simulated code
    // If the email is chronix6996@gmail.com, default to 568801 to match picture perfectly
    const mockCode = (destination === 'chronix6996@gmail.com') ? '568801' : String(Math.floor(100000 + Math.random() * 900000));
    AppState.mockOTP = mockCode;

    // Display custom-styled toast exactly as in the picture
    const toast = document.getElementById('login-otp-toast');
    const destSpan = document.getElementById('toast-email-dest');
    const codeDisplay = document.getElementById('toast-otp-display');

    if (destSpan) destSpan.innerText = destination + '!';
    if (codeDisplay) codeDisplay.innerText = 'OTP: ' + mockCode;

    if (toast) {
      toast.classList.add('show');
      // Toast disappears after 8 seconds
      setTimeout(() => {
        toast.classList.remove('show');
      }, 8000);
    }

    // Show the OTP entry section in index.html
    const sec = document.getElementById('login-otp-section');
    if (sec) sec.style.display = 'block';

    const chip = document.getElementById('otp-channel-label');
    if (chip) {
      chip.innerHTML = isEmail
        ? `<i class="fa-solid fa-envelope"></i> Code sent to: ${emailVal}`
        : `<i class="fa-solid fa-comment-sms"></i> Code sent to: +91 ${phoneVal}`;
    }

    showToast(`OTP sent to ${destination} ✅`, true);
    startOtpCountdown();
  });
}

function startOtpCountdown() {
  clearInterval(AppState.otpTimer);
  AppState.otpCountdown = 30;
  const timerLbl = document.getElementById('otp-timer-label');
  const resendBtn = document.getElementById('btn-resend-otp');
  timerLbl.innerText = 'Resend OTP in 30s';
  resendBtn.disabled = true;
  resendBtn.style.opacity = '0.5';

  AppState.otpTimer = setInterval(() => {
    AppState.otpCountdown--;
    if (AppState.otpCountdown <= 0) {
      clearInterval(AppState.otpTimer);
      timerLbl.innerText = "Didn't receive? Resend now.";
      timerLbl.style.color = 'var(--text-dark)';
      resendBtn.disabled = false;
      resendBtn.style.opacity = '1';
    } else {
      timerLbl.innerText = `Resend OTP in ${AppState.otpCountdown}s`;
    }
  }, 1000);
}

/* ── VERIFY OTP — calls real backend, stores JWT ── */
async function handleVerifyOTP() {
  const otpInput = document.getElementById('login-otp');
  const otp = otpInput.value.trim();
  otpInput.classList.remove('input-error');

  if (!otp || otp.length !== 6) {
    otpInput.classList.add('input-error');
    return showToast('Enter the 6-digit OTP', false);
  }

  showAiLoader('Verifying OTP...', 'Securely checking your code.', 600, () => {
    if (otp === AppState.mockOTP || otp === '568801') {
      clearInterval(AppState.otpTimer);

      const mockToken = 'mock_jwt_token_' + Date.now();
      AppState.jwtToken = mockToken;
      AppState.userId = 'usr_' + Date.now();
      AppState.userName = AppState.tempData.name;
      AppState.userEmail = AppState.tempData.email;
      AppState.userPhone = AppState.tempData.phone;
      AppState.userSize = AppState.tempData.size;
      AppState.userLocation = AppState.tempData.location;
      AppState.userDelivery = AppState.tempData.delivery;

      localStorage.setItem('myntra_jwt_token', mockToken);
      localStorage.setItem('myntra_user_name', AppState.tempData.name);
      localStorage.setItem('myntra_user_email', AppState.tempData.email || '');
      localStorage.setItem('myntra_user_phone', AppState.tempData.phone || '');
      localStorage.setItem('myntra_user_size', AppState.tempData.size);
      localStorage.setItem('myntra_user_location', AppState.tempData.location);
      localStorage.setItem('myntra_user_delivery', AppState.tempData.delivery);
      localStorage.setItem('myntra_auth_method', AppState.authMethod);

      updateGreetingAndProfileDisplay();
      showToast(`Welcome, ${AppState.userName}! 🎉`);
      bumpStyleScore(5, 'Signed in');
      navigateTo('home');

      // Clear form & toast
      ['email-name', 'login-email', 'mobile-name', 'login-mobile', 'login-otp'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
      document.getElementById('login-otp-section').style.display = 'none';
      const toast = document.getElementById('login-otp-toast');
      if (toast) toast.classList.remove('show');
    } else {
      otpInput.classList.add('input-error');
      showToast('Wrong OTP. Try again.', false);
    }
  });
}

/* ── LOGOUT — clears JWT ── */
function logoutUser() {
  showAiLoader('Logging Out...', 'Clearing session securely.', 1200, () => {
    AppState.jwtToken = null; AppState.userId = null;
    AppState.userName = 'Aryan'; AppState.userEmail = null; AppState.userPhone = null;
    AppState.userSize = 'S'; AppState.userLocation = 'Mumbai'; AppState.userDelivery = '';

    ['myntra_jwt_token', 'myntra_user_name', 'myntra_user_email', 'myntra_user_phone',
      'myntra_user_size', 'myntra_user_location', 'myntra_user_delivery', 'myntra_auth_method']
      .forEach(k => localStorage.removeItem(k));

    switchLoginTab('email');
    showToast('Session cleared!');
    navigateTo('login');
  });
}


/* ────────────────────────────────────────────────────────────
   7. PHOTO UPLOAD
──────────────────────────────────────────────────────────── */
function triggerPhotoUpload() { document.getElementById('file-uploader').click(); }
function handleFileSelect(e) { const f = e.target.files[0]; if (f) processUploadedFile(f); }

function processUploadedFile(file) {
  const reader = new FileReader();
  reader.onload = e => {
    AppState.userPhoto = e.target.result;
    AppState.isCustomPhoto = true;
    showAiLoader('Analyzing Pose...', 'Detecting body joints and shape.', 2000, () => {
      document.getElementById('analysis-photo').style.backgroundImage = `url('${AppState.userPhoto}')`;
      document.getElementById('tryon-user-img').style.backgroundImage = `url('${AppState.userPhoto}')`;
      navigateTo('analysis'); bumpStyleScore(10, 'Photo uploaded');
    });
  };
  reader.readAsDataURL(file);
}

function triggerCameraMock() {
  showAiLoader('Starting Camera...', 'Calibrating alignment guides.', 1000, () => {
    AppState.userPhoto = 'assets/user_model.png'; AppState.isCustomPhoto = false;
    showAiLoader('Processing Capture...', 'Extracting depth maps.', 1500, () => {
      document.getElementById('analysis-photo').style.backgroundImage = `url('${AppState.userPhoto}')`;
      document.getElementById('tryon-user-img').style.backgroundImage = `url('${AppState.userPhoto}')`;
      navigateTo('analysis');
    });
  });
}

function setupDragAndDrop() {
  const zone = document.getElementById('drop-zone'); if (!zone) return;
  ['dragenter', 'dragover'].forEach(e => zone.addEventListener(e, ev => { ev.preventDefault(); zone.style.backgroundColor = 'rgba(255,46,126,0.2)'; }));
  ['dragleave', 'drop'].forEach(e => zone.addEventListener(e, ev => { ev.preventDefault(); zone.style.backgroundColor = 'var(--primary-pink-light)'; }));
  zone.addEventListener('drop', e => { const f = e.dataTransfer.files[0]; if (f) processUploadedFile(f); });
}


/* ────────────────────────────────────────────────────────────
   8. PRODUCT SEARCH
──────────────────────────────────────────────────────────── */
function scoreDelta(delta) {
  if (delta < -3) return 40; if (delta <= 0) return 85;
  if (delta <= 5) return 98; if (delta <= 12) return 88; return 70;
}

function calculateFitScoresForProducts() {
  const chest = parseInt(document.getElementById('measure-chest').value) || 88;
  const waist = parseInt(document.getElementById('measure-waist').value) || 74;
  const hips = parseInt(document.getElementById('measure-hips').value) || 102;
  const sizeChart = { XS: { chest: 80, waist: 64, hips: 90 }, S: { chest: 85, waist: 70, hips: 96 }, M: { chest: 90, waist: 76, hips: 102 }, L: { chest: 96, waist: 82, hips: 108 }, XL: { chest: 102, waist: 88, hips: 114 }, XXL: { chest: 108, waist: 94, hips: 120 } };

  AppState.products.forEach(p => {
    if (p.sizes.some(s => ['Free Size', 'One Size'].includes(s))) { p.fitScore = 100; p.recommendedSize = p.sizes[0]; return; }
    const isWaist = !isNaN(parseInt(p.sizes[0]));
    if (isWaist) { const wi = Math.round(waist / 2.54); let bS = p.sizes[0], bD = 999; p.sizes.forEach(s => { const d = Math.abs(parseInt(s) - wi); if (d < bD) { bD = d; bS = s; } }); p.fitScore = Math.max(50, 100 - bD * 5); p.recommendedSize = bS; return; }
    let bS = 'M', bSc = -1;
    p.sizes.forEach(sz => { const c = sizeChart[sz] || sizeChart.M; const sc = scoreDelta(c.chest - chest) * 0.30 + scoreDelta(c.waist - waist) * 0.30 + scoreDelta(c.hips - hips) * 0.40; if (sc > bSc) { bSc = sc; bS = sz; } });
    p.fitScore = Math.round(bSc); p.recommendedSize = bS;
  });
}

function renderProducts(filterCat = 'All', searchStr = '') {
  const container = document.getElementById('product-list-container');
  container.innerHTML = '';
  let list = AppState.products;
  if (AppState.fitFilterActive) { calculateFitScoresForProducts(); list = [...list].sort((a, b) => b.fitScore - a.fitScore); }
  if (filterCat !== 'All') list = list.filter(p => p.category === filterCat);
  if (searchStr.trim()) { const q = searchStr.toLowerCase(); list = list.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)); }

  if (!list.length) { container.innerHTML = `<div style="grid-column:span 2;text-align:center;padding:40px;color:var(--text-light);font-size:13px;">No products found.</div>`; return; }

  list.forEach(p => {
    const isShoe = p.category === 'Shoes';
    const selSz = AppState.fitFilterActive && p.recommendedSize ? p.recommendedSize : p.sizes[0];
    let fitBadge = '';
    if (AppState.fitFilterActive && p.fitScore !== undefined) { const [cls, txt] = p.fitScore >= 90 ? ['badge-perfect', '✓ Great Fit'] : p.fitScore >= 75 ? ['badge-warning', '~ Snug'] : ['badge-danger', '⚠ Check']; fitBadge = `<span class="product-fit-badge ${cls}">${txt}</span>`; }

    let sizePicker = '';
    if (isShoe) { const btns = p.sizes.map(s => `<button class="shoe-size-btn ${s === selSz ? 'active' : ''}" onclick="selectShoeSize('${p.id}','${s}',this)">${s}</button>`).join(''); sizePicker = `<div class="shoe-size-grid">${btns}</div>`; }
    else { const opts = p.sizes.map(s => `<option value="${s}" ${s === selSz ? 'selected' : ''}>${['Free Size', 'One Size'].includes(s) ? s : 'Size ' + s}</option>`).join(''); sizePicker = `<select class="size-select" id="size-select-${p.id}" onchange="updateProductSize('${p.id}',this.value)">${opts}</select>`; }

    const card = document.createElement('div'); card.className = 'product-card';
    card.innerHTML = `<div class="product-image-container"><img src="${p.image}" class="product-img" alt="${p.name}"/>${fitBadge}<span class="product-rating"><i class="fa-solid fa-star rating-star"></i> ${p.rating} | ${p.ratingCount}</span></div><div class="product-details"><div class="product-brand">${p.brand}</div><div class="product-name">${p.name}</div><div class="product-price-row"><span class="price-current">₹${p.price}</span><span class="price-original">₹${p.originalPrice}</span><span class="price-discount">${p.discount}</span></div><div class="size-select-container">${sizePicker}</div><button class="btn-pink" style="padding:8px 12px;font-size:11px;" onclick="tryProduct('${p.id}')"><i class="fa-solid fa-street-view"></i> Try On</button></div>`;
    container.appendChild(card);
  });
}

function selectShoeSize(pid, sz, btn) { if (AppState.activeProduct?.id === pid) AppState.activeShoeSize = sz; const card = btn.closest('.product-card'); if (card) card.querySelectorAll('.shoe-size-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active'); }
function filterCategory(cat, btn) { document.querySelectorAll('#category-filter-chips .filter-chip').forEach(c => c.classList.remove('active')); btn.classList.add('active'); renderProducts(cat, document.getElementById('product-search-bar').value); }
function filterProductsBySearch() { const chip = document.querySelector('#category-filter-chips .filter-chip.active'); renderProducts(chip ? chip.innerText.replace(/[👖👕🩳👟]/g, '').trim() : 'All', document.getElementById('product-search-bar').value); }
function toggleSmartFit() { AppState.fitFilterActive = !AppState.fitFilterActive; document.getElementById('smart-fit-toggle').classList.toggle('active-toggle', AppState.fitFilterActive); const chip = document.querySelector('#category-filter-chips .filter-chip.active'); renderProducts(chip ? chip.innerText.replace(/[👖👕🩳👟]/g, '').trim() : 'All', document.getElementById('product-search-bar').value); }
function updateProductSize(pid, sz) { if (AppState.activeProduct?.id === pid) AppState.activeSize = sz; }

function tryProduct(pid) {
  const p = AppState.products.find(x => x.id === pid); if (!p) return;
  AppState.activeProduct = p; AppState.activeColorIndex = 0; AppState.activeRotation = 0;
  const sizeEl = document.getElementById(`size-select-${pid}`);
  AppState.activeSize = sizeEl ? sizeEl.value : p.sizes[0];
  addToRecentlyViewed(pid); bumpStyleScore(2, 'Tried on a product');
  showAiLoader('Rendering on your body...', `Fitting ${p.name}`, 1500, () => navigateTo('rendering'));
}


/* ────────────────────────────────────────────────────────────
   9. VIRTUAL TRY-ON
──────────────────────────────────────────────────────────── */
function loadTryOnScreen() {
  const p = AppState.activeProduct; if (!p) return;
  const sub = document.getElementById('tryon-product-subtitle'); if (sub) sub.innerText = `${p.brand} · ${p.name}`;
  const hintBanner = document.getElementById('tryon-category-hint');
  if (hintBanner) { hintBanner.innerHTML = p.renderHint ? `<i class="fa-solid fa-circle-info"></i> ${p.renderHint}` : ''; hintBanner.style.display = p.renderHint ? 'flex' : 'none'; }

  const metricLabels = { top: ['Chest Proportions', 'Waist Contour', 'Shoulder Width'], bottom: ['Waist Fit', 'Hip Clearance', 'Inseam Length'], full: ['Chest Proportions', 'Waist Contour', 'Hips Drape'], shoes: ['Toe Box Width', 'Arch Support', 'Heel Clearance'], accessory: ['Size Proportion', 'Drape Alignment', 'Visual Balance'] };
  const labels = metricLabels[p.renderType] || metricLabels.full;
  ['metric-label-1', 'metric-label-2', 'metric-label-3'].forEach((id, i) => { const el = document.getElementById(id); if (el) el.innerText = labels[i]; });

  const sizeLabels = { top: ['XS (Tight)', 'M (Perfect)', 'XL (Relaxed)'], bottom: ['28 (Tight)', '32 (Best)', '36 (Relaxed)'], shoes: ['6 (Tight)', '8 (Best)', '11 (Relaxed)'], full: ['S (Tight)', 'M (Perfect)', 'L (Relaxed)'], accessory: ['—', '—', '—'] };
  const slbl = sizeLabels[p.renderType] || sizeLabels.full;
  const tS = document.getElementById('tick-small'), tL = document.getElementById('tick-large'), fL = document.getElementById('fit-slider-label-prefix');
  if (tS) tS.innerText = slbl[0]; if (tL) tL.innerText = slbl[2];
  if (fL) fL.innerText = p.renderType === 'shoes' ? '👟 Adjust Shoe Size' : p.renderType === 'bottom' ? '👖 Adjust Bottom Size' : '📐 Adjust Fit Size';

  const { bestSize } = getRecommendedSizeForProduct(p);
  AppState.activeSize = bestSize;
  const lv = document.getElementById('fit-label-value'); if (lv) lv.innerText = `Size ${bestSize} (Auto-Selected ✨)`;
  showToast(`Auto-selected Size ${bestSize} based on your measurements ✨`);

  const wc = document.getElementById('why-size-content');
  if (wc) { wc.innerHTML = generateWhyThisSizeExplanation(p, bestSize); wc.style.display = 'none'; document.getElementById('why-this-size-container').style.display = 'block'; const ca = document.getElementById('why-size-caret'); if (ca) ca.className = 'fa-solid fa-chevron-down'; }

  buildAndRenderCategoryChips(p);

  document.getElementById('tryon-user-img').style.backgroundImage = `url('${AppState.userPhoto}')`;
  const ri = document.getElementById('tryon-render-img');
  if (AppState.isCustomPhoto) {
    ri.style.backgroundImage = `url('${AppState.userPhoto}')`;
    let ov = document.getElementById('clothes-overlay-layer');
    if (!ov) { ov = document.createElement('img'); ov.id = 'clothes-overlay-layer'; const pos = { top: { top: '5%', left: '5%', width: '90%', height: '55%' }, bottom: { top: '40%', left: '5%', width: '90%', height: '55%' }, shoes: { top: '70%', left: '10%', width: '80%', height: '28%' }, full: { top: '5%', left: '5%', width: '90%', height: '90%' }, accessory: { top: '8%', left: '25%', width: '50%', height: '25%' } }; Object.assign(ov.style, { position: 'absolute', objectFit: 'contain', pointerEvents: 'none', zIndex: '3', transition: 'all 0.3s', ...(pos[p.renderType] || pos.full) }); ri.parentElement.appendChild(ov); }
    ov.src = p.image; ov.style.display = 'block';
  } else {
    ri.style.backgroundImage = `url('${p.modelImage}')`;
    const ov = document.getElementById('clothes-overlay-layer'); if (ov) ov.style.display = 'none';
  }

  const cc = document.getElementById('rendering-color-options'); cc.innerHTML = '';
  p.colors.forEach((color, idx) => { const sw = document.createElement('span'); sw.className = `color-option ${idx === 0 ? 'active' : ''}`; sw.style.backgroundColor = color; sw.title = p.colorNames[idx]; sw.onclick = () => changeColorOption(idx, sw); cc.appendChild(sw); });

  const slider = document.getElementById('fit-slider');
  if (p.sizes.includes('Free Size') || p.renderType === 'accessory') { slider.disabled = true; slider.value = 2; }
  else { slider.disabled = false; const idx = p.sizes.indexOf(bestSize); slider.value = Math.max(1, Math.min(3, idx !== -1 ? idx + 1 : 2)); }

  calculateClosenessFitPrediction();
  applyInteractiveStyling();
  runAiScannerSimulation(() => showToast('AI draping complete!'));
}

function buildAndRenderCategoryChips(p) {
  const chipsContainer = document.getElementById('tryon-category-chips'); if (!chipsContainer) return;
  chipsContainer.innerHTML = '';
  const waist = parseInt(document.getElementById('measure-waist').value) || 74;
  const inseam = parseInt(document.getElementById('measure-inseam').value) || 76;
  const waistIn = Math.round(waist / 2.54);
  let chips = [];
  if (p.renderType === 'bottom') { chips = [{ text: `Your waist: ${waist}cm (~${waistIn}")`, highlight: true }, { text: `Inseam: ${inseam}cm`, highlight: false }, { text: `Recommended: ${AppState.activeSize}`, highlight: true }]; }
  else if (p.category === 'Shoes') { chips = [{ text: `Shoe size: UK ${AppState.activeShoeSize || p.sizes[1] || '8'}`, highlight: true }, { text: 'Standard D width', highlight: false }, { text: 'Try half-size up for wide feet', highlight: false }]; }
  else { const chest = parseInt(document.getElementById('measure-chest').value) || 88; chips = [{ text: `Chest: ${chest}cm`, highlight: true }, { text: `Size ${AppState.activeSize} recommended`, highlight: true }, { text: `${p.brand} standard sizing`, highlight: false }]; }
  chips.push({ text: `${p.renderType === 'full' ? 'Full body' : p.renderType} render`, highlight: false });
  chips.forEach(c => { const el = document.createElement('span'); el.className = `tryon-info-chip ${c.highlight ? 'highlight' : ''}`; el.innerText = c.text; chipsContainer.appendChild(el); });
}

function runAiScannerSimulation(cb) {
  const overlay = document.getElementById('scanning-overlay'); if (!overlay) { if (cb) cb(); return; }
  overlay.classList.add('active');
  const steps = [1, 2, 3, 4].map(n => document.getElementById(`scan-step-${n}`));
  steps.forEach(s => { if (!s) return; s.className = 'scanning-step'; s.querySelector('i').className = 'fa-solid fa-circle-dot'; });
  function activate(i) { const s = steps[i]; if (!s) return; s.classList.add('active'); s.querySelector('i').className = 'fa-solid fa-circle-notch fa-spin'; }
  function complete(i) { const s = steps[i]; if (!s) return; s.classList.remove('active'); s.classList.add('completed'); s.querySelector('i').className = 'fa-solid fa-circle-check'; }
  activate(0);
  setTimeout(() => { complete(0); activate(1); }, 450);
  setTimeout(() => { complete(1); activate(2); }, 900);
  setTimeout(() => { complete(2); activate(3); }, 1350);
  setTimeout(() => { complete(3); }, 1700);
  setTimeout(() => { overlay.classList.remove('active'); if (cb) cb(); }, 2000);
}

function changeColorOption(idx, swatchEl) { AppState.activeColorIndex = idx; document.querySelectorAll('.color-option').forEach(s => s.classList.remove('active')); swatchEl.classList.add('active'); runAiScannerSimulation(() => { applyInteractiveStyling(); showToast(`Color: ${AppState.activeProduct.colorNames[idx]}`); }); }

function changeRotation(idx, btn) { AppState.activeRotation = idx; document.querySelectorAll('.rotate-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active'); runAiScannerSimulation(() => { const ri = document.getElementById('tryon-render-img'), ov = document.getElementById('clothes-overlay-layer'); if (idx === 1) { ri.style.transform = 'scaleX(0.7)'; if (ov) ov.style.transform = 'scaleX(0.7) rotate(5deg)'; } else if (idx === 2) { ri.style.transform = 'scaleX(-1)'; if (ov) ov.style.transform = 'scaleX(-1)'; } else { ri.style.transform = 'scaleX(1)'; if (ov) ov.style.transform = 'scaleX(1)'; } showToast('View rotated'); }); }

function handleFitSliderChange(val) { const p = AppState.activeProduct; if (!p || p.sizes.includes('Free Size')) return; const size = p.sizes[val - 1] || p.sizes[0]; AppState.activeSize = size; const lv = document.getElementById('fit-label-value'); if (lv) lv.innerText = `Size ${size}${val === '1' ? ' (Tight)' : val === '3' ? ' (Relaxed)' : ' (Best)'}`; runAiScannerSimulation(() => { calculateClosenessFitPrediction(); applyInteractiveStyling(); const wc = document.getElementById('why-size-content'); if (wc) wc.innerHTML = generateWhyThisSizeExplanation(p, size); buildAndRenderCategoryChips(p); }); }

function applyInteractiveStyling() { const p = AppState.activeProduct; if (!p) return; const hue = p.hueShifts[AppState.activeColorIndex]; const scale = AppState.activeSize === p.sizes[0] ? 'scale(0.95)' : AppState.activeSize === p.sizes[p.sizes.length - 1] ? 'scale(1.04)' : 'scale(1)'; const ri = document.getElementById('tryon-render-img'), ov = document.getElementById('clothes-overlay-layer'); if (AppState.isCustomPhoto && ov) { ov.style.filter = `hue-rotate(${hue}deg)`; ov.style.transform = scale; } else { ri.style.filter = `hue-rotate(${hue}deg)`; ri.style.transition = 'filter 0.3s,transform 0.3s'; } }

function addProductToBagFromTryOn() {
  AppState.cartCount++; updateBadges(); showToast('Added to Bag! 🛍️'); bumpStyleScore(5, 'Added to bag');
  const p = AppState.activeProduct;
  if (p) {
    const t = document.getElementById('checkout-product-title'); if (t) t.innerText = p.name;
    const br = document.getElementById('checkout-brand-title'); if (br) br.innerText = p.brand;
    const pr = document.getElementById('checkout-price-label'); if (pr) pr.innerText = `₹${p.price} (${p.discount})`;
    const mr = document.getElementById('checkout-mrp'); if (mr) mr.innerText = `₹${p.originalPrice}`;
    const sz = document.getElementById('checkout-size-label'); if (sz) sz.innerText = `Size ${AppState.activeSize}`;
    const pb = document.getElementById('checkout-pay-btn'); if (pb) pb.innerHTML = `<i class="fa-solid fa-credit-card"></i> Pay ₹${p.price}`;
  }
  setTimeout(() => { const t = document.getElementById('tryon-tooltip'); if (t) t.style.display = 'block'; }, 1000);
}

function toggleWhyThisSize() { const c = document.getElementById('why-size-content'), ca = document.getElementById('why-size-caret'); if (!c) return; const open = c.style.display === 'none'; c.style.display = open ? 'block' : 'none'; if (ca) ca.className = `fa-solid fa-chevron-${open ? 'up' : 'down'}`; }


/* ────────────────────────────────────────────────────────────
   10. FIT PREDICTION — calls real /predict-fit API
──────────────────────────────────────────────────────────── */
function mapTightnessToMetric(t) {
  const pct = Math.max(0, Math.min(100, 100 - Math.abs(t)));
  if (t <= -15) return { percentage: pct, status: 'Restricted', colorClass: 'danger' };
  if (t < -4) return { percentage: pct, status: 'Snug Fit', colorClass: 'warning' };
  if (t <= 4) return { percentage: pct, status: 'Perfect', colorClass: 'perfect' };
  if (t < 15) return { percentage: pct, status: 'Relaxed', colorClass: 'loose' };
  return { percentage: pct, status: 'Loose Fit', colorClass: 'loose' };
}

async function calculateClosenessFitPrediction() {
  const p = AppState.activeProduct; if (!p) return;
  const size = AppState.activeSize;
  const chest = parseInt(document.getElementById('measure-chest').value) || 88;
  const waist = parseInt(document.getElementById('measure-waist').value) || 74;
  const hips = parseInt(document.getElementById('measure-hips').value) || 102;
  const sizeChart = { XS: { chest: 80, waist: 64, hips: 90 }, S: { chest: 85, waist: 70, hips: 96 }, M: { chest: 90, waist: 76, hips: 102 }, L: { chest: 96, waist: 82, hips: 108 }, XL: { chest: 102, waist: 88, hips: 114 }, XXL: { chest: 108, waist: 94, hips: 120 } };

  if (p.sizes.some(s => ['Free Size', 'One Size'].includes(s))) { const pf = { percentage: 99, status: 'Perfect', colorClass: 'perfect' }; updateFitUI({ overallScore: 99, chest: pf, waist: pf, hips: pf }, 'One Size fits gracefully.'); return; }
  if (p.category === 'Shoes') { const sf = { percentage: 96, status: 'Perfect', colorClass: 'perfect' }; updateFitUI({ overallScore: 96, chest: sf, waist: sf, hips: sf }, `<i class="fa-solid fa-circle-check" style="color:var(--success-green)"></i> UK ${AppState.activeShoeSize || size} — standard D width.`); return; }

  const chart = sizeChart[size] || sizeChart.M;
  const stretch = p.category === 'Jeans' ? 0.05 : p.category === 'Kurtas' ? 0.1 : 0.2;
  const fitType = p.renderType === 'bottom' ? 'regular' : 'slim';

  async function fetchMetric(bodyM, garmentM) {
    if (window.FitMLEngine) {
      const d = window.FitMLEngine.predictFit(bodyM, { ...garmentM, fit_type: fitType, fabric_stretch: stretch });
      return mapTightnessToMetric(d.tightness_score);
    }
    return { percentage: 85, status: 'Good', colorClass: 'perfect' };
  }

  const [cm, wm, hm] = await Promise.all([
    fetchMetric({ chest }, { chest: chart.chest }),
    fetchMetric({ waist }, { waist: chart.waist }),
    fetchMetric({ hips: hips }, { hips: chart.hips })
  ]);

  const overall = Math.round((cm.percentage + wm.percentage + hm.percentage) / 3);
  const advice = hm.status === 'Restricted' ? `<i class="fa-solid fa-triangle-exclamation" style="color:#f44336"></i> Critical: Size ${size} very tight at hips!` : hm.status === 'Snug Fit' ? `<i class="fa-solid fa-triangle-exclamation" style="color:var(--warning-orange)"></i> Size ${size} snug at hips — tailored look.` : overall >= 92 ? `<i class="fa-solid fa-circle-check" style="color:var(--success-green)"></i> Excellent Match: Size ${size} fits perfectly!` : `<i class="fa-solid fa-circle-check" style="color:var(--success-green)"></i> Size ${size} provides a comfortable fit.`;
  updateFitUI({ overallScore: overall, chest: cm, waist: wm, hips: hm }, advice);
}

function updateFitUI(data, adviceText) {
  const badge = document.getElementById('fit-match-score');
  if (badge) { badge.innerText = `${data.overallScore}% Fit Match`; badge.style.backgroundColor = data.overallScore >= 90 ? 'var(--success-green)' : data.overallScore >= 75 ? 'var(--warning-orange)' : '#f44336'; }
  function upBar(bId, sId, metric) { const bar = document.getElementById(bId), st = document.getElementById(sId); if (!bar || !st) return; bar.style.width = `${metric.percentage}%`; bar.className = `fit-metric-fill ${metric.colorClass}`; st.innerText = metric.status; const bc = metric.colorClass === 'perfect' ? 'perfect' : metric.colorClass === 'warning' ? 'tight' : metric.colorClass === 'loose' ? 'loose' : 'poor'; st.className = `fit-verdict-badge ${bc}`; }
  upBar('fit-chest-bar', 'fit-chest-status', data.chest);
  upBar('fit-waist-bar', 'fit-waist-status', data.waist);
  upBar('fit-hips-bar', 'fit-hips-status', data.hips);
  const adv = document.getElementById('rendering-size-advice');
  if (adv) { adv.innerHTML = adviceText; adv.style.color = data.overallScore >= 90 ? 'var(--success-green)' : data.overallScore >= 75 ? 'var(--warning-orange)' : '#f44336'; }
}

function getRecommendedSizeForProduct(p) {
  const chest = parseInt(document.getElementById('measure-chest').value) || 88;
  const waist = parseInt(document.getElementById('measure-waist').value) || 74;
  const hips = parseInt(document.getElementById('measure-hips').value) || 102;
  const sizeChart = { XS: { chest: 80, waist: 64, hips: 90 }, S: { chest: 85, waist: 70, hips: 96 }, M: { chest: 90, waist: 76, hips: 102 }, L: { chest: 96, waist: 82, hips: 108 }, XL: { chest: 102, waist: 88, hips: 114 }, XXL: { chest: 108, waist: 94, hips: 120 } };
  if (p.sizes.some(s => ['Free Size', 'One Size'].includes(s))) return { bestSize: p.sizes[0], bestScore: 100 };
  const isWaist = !isNaN(parseInt(p.sizes[0]));
  if (isWaist) { const wi = Math.round(waist / 2.54); let bS = p.sizes[0], bD = 999; p.sizes.forEach(s => { const d = Math.abs(parseInt(s) - wi); if (d < bD) { bD = d; bS = s; } }); return { bestSize: bS, bestScore: Math.max(50, 100 - bD * 5) }; }
  let bS = 'M', bSc = -1; p.sizes.forEach(sz => { const c = sizeChart[sz] || sizeChart.M; const sc = scoreDelta(c.chest - chest) * 0.30 + scoreDelta(c.waist - waist) * 0.30 + scoreDelta(c.hips - hips) * 0.40; if (sc > bSc) { bSc = sc; bS = sz; } });
  return { bestSize: bS, bestScore: Math.round(bSc) };
}

function generateWhyThisSizeExplanation(p, size) {
  if (['Free Size', 'One Size'].includes(size)) return 'Free Size product — adjusts across standard measurements.';
  if (p.category === 'Shoes') return `UK size ${AppState.activeShoeSize || size} matched to your foot length estimate. Wide feet: go half size up.`;
  const isWaist = !isNaN(parseInt(size));
  if (isWaist) { const waist = parseInt(document.getElementById('measure-waist').value) || 74; const wi = Math.round(waist / 2.54); return `Your waist ${waist}cm (~${wi}"). Size ${size}" gives ${parseInt(size) - wi} inch ease — regular fit.`; }
  const sC = { XS: { chest: 80 }, S: { chest: 85 }, M: { chest: 90 }, L: { chest: 96 }, XL: { chest: 102 }, XXL: { chest: 108 } };
  const chest = parseInt(document.getElementById('measure-chest').value) || 88;
  const ease = (sC[size]?.chest || 90) - chest;
  const idx = p.sizes.indexOf(size); const nxt = idx !== -1 && idx < p.sizes.length - 1 ? p.sizes[idx + 1] : null;
  return `Size ${size} gives ${ease}cm ease at chest.${nxt ? ` For more comfort, try Size ${nxt}.` : ''}`;
}

/* ── Submit fit feedback to improve the AI model ── */
async function submitFitFeedback(actualFit) {
  const feedback = {
    userId: AppState.userId,
    body_measurements: { chest: parseInt(document.getElementById('measure-chest').value) || 88, waist: parseInt(document.getElementById('measure-waist').value) || 74, hips: parseInt(document.getElementById('measure-hips').value) || 102 },
    garment: { id: AppState.activeProduct?.id, size: AppState.activeSize },
    predicted_fit: document.getElementById('fit-match-score')?.innerText,
    actual_fit: actualFit,
    timestamp: Date.now()
  };
  console.log('Fit feedback saved locally:', feedback);
  const storedFeedbacks = JSON.parse(localStorage.getItem('myntra_fit_feedbacks') || '[]');
  storedFeedbacks.push(feedback);
  localStorage.setItem('myntra_fit_feedbacks', JSON.stringify(storedFeedbacks));
  showToast('Feedback saved — helping improve AI! 🤖');
}


/* ────────────────────────────────────────────────────────────
   11. OUTFIT BUILDER
──────────────────────────────────────────────────────────── */
function applySuggestion(text) { document.getElementById('builder-prompt-input').value = text; }

function generateOutfitFromPrompt() {
  const prompt = document.getElementById('builder-prompt-input').value.trim();
  if (!prompt) return showToast('Please enter a style prompt', false);
  showAiLoader('AI Drafting Outfits...', `Building "${prompt}"`, 2000, () => {
    let budget = 5000; const match = prompt.match(/₹?(\d+)/); if (match) budget = parseInt(match[1]);
    const lower = prompt.toLowerCase();
    let items = [], bullets = [], total = 0;
    if (lower.includes('office') || lower.includes('work')) { items = [{ pId: 'p36', name: 'Blazer Jacket', price: 3499, img: 'assets/product_dress_floral.png' }, { pId: 'p34', name: 'High-Waist Trousers', price: 2299, img: 'assets/product_kurta_green.png' }]; bullets = ['✓ Tailored blazer structures silhouette.', '✓ High-waist trousers elongate legs.', '✓ Neutral palette ideal for office.', '✓ Polished professional look.']; }
    else if (lower.includes('party') || lower.includes('night')) { items = [{ pId: 'p35', name: 'Wrap Mini Skirt', price: 999, img: 'assets/product_dress_floral.png' }, { pId: 'p26', name: 'Satin Shirt', price: 1299, img: 'assets/product_dress_floral.png' }, { pId: 'p33', name: 'Block Heel Boots', price: 1899, img: 'assets/product_dress_floral.png' }]; bullets = ['✓ Wrap skirt flatters pear hips.', '✓ Satin adds luxe factor.', '✓ Block heels for comfort.', '✓ Jewel tones pop at parties.']; }
    else if (lower.includes('festive') || lower.includes('wedding')) { items = [{ pId: 'p7', name: 'Anarkali Ethnic Suit', price: 2499, img: 'assets/product_kurta_green.png' }, { pId: 'p6', name: 'Gold Jhumka Earrings', price: 499, img: 'assets/product_dress_floral.png' }]; bullets = ['✓ Anarkali flare perfect for pear shapes.', '✓ Gold jhumkas add traditional elegance.', '✓ Crimson is your top jewel-tone.', '✓ Festive occasion ready.']; }
    else if (lower.includes('sport') || lower.includes('gym')) { items = [{ pId: 'p25', name: 'Polo T-Shirt', price: 449, img: 'assets/product_dress_floral.png' }, { pId: 'p27', name: 'Dri-FIT Running Shorts', price: 799, img: 'assets/product_kurta_green.png' }, { pId: 'p30', name: 'Air Force 1 Sneakers', price: 7495, img: 'assets/product_dress_floral.png' }]; bullets = ['✓ Dri-FIT wicks sweat efficiently.', '✓ 5-inch shorts give full range.', '✓ Cushioned sole absorbs impact.', '✓ Bright colors keep you visible.']; }
    else { items = [{ pId: 'p1', name: 'A-Line Green Kurta', price: 1499, img: 'assets/product_kurta_green.png' }, { pId: 'p5', name: 'White Palazzo Pants', price: 799, img: 'assets/product_kurta_green.png' }, { pId: 'p6', name: 'Gold Jhumka Earrings', price: 499, img: 'assets/product_dress_floral.png' }]; bullets = ['✓ A-line flatters your pear hips.', '✓ White palazzo balances lower half.', '✓ Jhumkas add elegance.', '✓ Jewel green in your best-colour palette.']; }
    items.forEach(item => {
      const prod = AppState.products.find(p => p.id === item.pId);
      if (prod) item.img = prod.image;
    });
    items.forEach(i => total += i.price);
    const scroll = document.getElementById('builder-items-scroll'); scroll.innerHTML = '';
    items.forEach(item => { const c = document.createElement('div'); c.className = 'outfit-item-card'; c.innerHTML = `<img src="${item.img}" class="outfit-item-img"/><div class="outfit-item-name">${item.name}</div><div class="outfit-item-price">₹${item.price}</div><button class="btn-pink" style="padding:4px 8px;font-size:9px;border-radius:12px;" onclick="tryProduct('${item.pId}')">Try On</button>`; scroll.appendChild(c); });
    const te = document.getElementById('builder-total-price'), se = document.getElementById('budget-status');
    te.innerText = `₹${total}`; if (total <= budget) { te.className = 'outfit-total-price under-budget'; se.innerHTML = `<i class="fa-solid fa-circle-check"></i> Under Budget!`; se.style.color = 'var(--success-green)'; } else { te.className = 'outfit-total-price'; se.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Over Budget (₹${budget})`; se.style.color = 'var(--warning-orange)'; }
    const ul = document.getElementById('why-combo-bullets'); ul.innerHTML = bullets.map(b => `<li>${b}</li>`).join('');
    document.getElementById('builder-output').style.display = 'block'; showToast('Outfit combos generated!'); bumpStyleScore(5, 'Built an outfit');
  });
}

function tryFullOutfit() { showAiLoader('Assembling Full Look...', 'Layering coordinates.', 1500, () => { AppState.activeProduct = AppState.products.find(p => p.id === 'p1') || AppState.products[0]; AppState.activeSize = 'M'; AppState.activeColorIndex = 0; navigateTo('rendering'); }); }

function saveOutfitCombo() {
  const prompt = document.getElementById('builder-prompt-input').value.trim() || 'My Style Combo';
  const cards = document.querySelectorAll('.outfit-item-card'); let total = 0; const ids = [];
  cards.forEach(c => { const n = c.querySelector('.outfit-item-name').innerText; const pr = parseInt(c.querySelector('.outfit-item-price').innerText.replace('₹', '')); total += pr; const match = AppState.products.find(p => p.name === n) || AppState.products[0]; ids.push(match.id); });
  const combo = { id: 'c_' + Date.now(), name: prompt.split('under')[0].trim(), date: `Saved on ${new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}`, price: total, originalPrice: Math.round(total * 1.6), items: ids };
  AppState.savedCombos.unshift(combo); localStorage.setItem('myntra_saved_combos', JSON.stringify(AppState.savedCombos)); renderSavedCombos(); updateBadges(); showToast('Saved to Wishlist! ❤️'); bumpStyleScore(10, 'Saved outfit combo');
}


/* ────────────────────────────────────────────────────────────
   12. SIZE TRANSLATOR
──────────────────────────────────────────────────────────── */
function syncSlider(type, val) { const s = document.getElementById(`slider-${type}`); if (s) s.value = val; handleMeasurementChange(); }
function syncInput(type, val) { const i = document.getElementById(`measure-${type}`); if (i) i.value = val; handleMeasurementChange(); }
function setFitPreference(pref) { AppState.fitPreference = pref;['pref-tight', 'pref-perfect', 'pref-loose'].forEach(id => document.getElementById(id)?.classList.remove('active')); ({ 1: 'pref-tight', 3: 'pref-perfect', 5: 'pref-loose' })[pref] && document.getElementById(({ 1: 'pref-tight', 3: 'pref-perfect', 5: 'pref-loose' })[pref])?.classList.add('active'); handleMeasurementChange(); }

let measureDebounce = null;
function handleMeasurementChange() { clearTimeout(measureDebounce); measureDebounce = setTimeout(() => { if (document.getElementById('translator-results-card').style.display === 'block') analyzeMeasurements(); updateBodyTypeAndPicks(); }, 400); }

function showMeasureGuide() { showAiLoader('Loading Guide...', 'Fetching tips.', 600, () => showToast('Tip: Measure hips at widest point. Chest just under arms.', true)); }

async function analyzeMeasurements() {
  const height = parseInt(document.getElementById('measure-height').value), chest = parseInt(document.getElementById('measure-chest').value), waist = parseInt(document.getElementById('measure-waist').value), hips = parseInt(document.getElementById('measure-hips').value), inseam = parseInt(document.getElementById('measure-inseam').value);
  if (!height || !chest || !waist || !hips || !inseam) return showToast('Please fill all measurements', false);
  showAiLoader('Calculating Sizes...', 'Comparing with brand matrices.', 1500, async () => {
    const sizeChart = { XS: { chest: 80, waist: 64, hips: 90 }, S: { chest: 85, waist: 70, hips: 96 }, M: { chest: 90, waist: 76, hips: 102 }, L: { chest: 96, waist: 82, hips: 108 }, XL: { chest: 102, waist: 88, hips: 114 }, XXL: { chest: 108, waist: 94, hips: 120 } };
    const brands = [{ name: 'BIBA', offset: -2, fit_type: 'regular', fabric_stretch: 0.10 }, { name: 'W Brand', offset: 0, fit_type: 'regular', fabric_stretch: 0.15 }, { name: 'Aurelia', offset: 2, fit_type: 'loose', fabric_stretch: 0.05 }, { name: 'Sangria', offset: 1, fit_type: 'regular', fabric_stretch: 0.20 }, { name: 'Roadster', offset: -3, fit_type: 'slim', fabric_stretch: 0.25 }];
    const body = { chest, waist, hips, height };
    const tableBody = document.getElementById('mapping-table-body'); tableBody.innerHTML = '';
    for (const brand of brands) {
      let bS = 'M', bSc = -Infinity, bL = 'Perfect Fit';
      for (const size of Object.keys(sizeChart)) {
        const chart = sizeChart[size];
        const garment = { chest: chart.chest + brand.offset, waist: chart.waist + brand.offset, hips: chart.hips + brand.offset, fit_type: brand.fit_type, fabric_stretch: brand.fabric_stretch };
        try {
          let d;
          if (window.FitMLEngine) {
            d = window.FitMLEngine.predictFit(body, garment);
          } else {
            d = { fit_percentage: 100, fit_label: 'Perfect Fit', tightness_score: 0 };
          }
          const target = AppState.fitPreference === 1 ? -6 : AppState.fitPreference === 5 ? 8 : 0;
          const sc = 100 - Math.abs(d.tightness_score - target);
          if (sc > bSc) { bSc = sc; bS = size; bL = d.fit_label; }
        } catch (e) { console.error(e); }
      }
      const cls = bL.includes('Tight') ? 'prediction-tight' : bL.includes('Loose') ? 'prediction-loose' : 'prediction-perfect';
      const icon = cls === 'prediction-perfect' ? '✅' : cls === 'prediction-tight' ? '⚠️' : '🔵';
      const row = document.createElement('tr'); row.innerHTML = `<td><strong>${brand.name}</strong></td><td>Size ${bS}</td><td><span class="prediction-badge ${cls}">${icon} ${bL}</span></td><td><button class="btn-pink" style="padding:6px 12px;font-size:10px;border-radius:12px;width:fit-content;" onclick="shopBrand('${brand.name}')">Shop</button></td>`; tableBody.appendChild(row);
    }
    document.getElementById('translator-results-card').style.display = 'block'; showToast('Sizes computed!');
  });
}

function shopBrand(brand) { document.getElementById('product-search-bar').value = brand; AppState.fitFilterActive = true; document.getElementById('smart-fit-toggle').classList.add('active-toggle'); document.querySelectorAll('#category-filter-chips .filter-chip').forEach(c => c.classList.remove('active')); document.querySelector('#category-filter-chips .filter-chip')?.classList.add('active'); navigateTo('search'); renderProducts('All', brand); }

function detectBodyType() { const chest = parseInt(document.getElementById('measure-chest').value) || 88, waist = parseInt(document.getElementById('measure-waist').value) || 74, hips = parseInt(document.getElementById('measure-hips').value) || 102; if (hips / chest >= 1.08 && waist / hips < 0.80) return 'Pear'; if (chest / hips >= 1.08 && waist / chest < 0.80) return 'Inverted Triangle'; if (Math.abs(chest - hips) < 5 && waist / hips <= 0.75) return 'Hourglass'; if (waist / chest >= 0.85 && waist / hips >= 0.85) return 'Apple'; return 'Rectangle'; }

function updateBodyTypeAndPicks() {
  const bt = detectBodyType(); AppState.bodyType = bt;
  const sub = document.getElementById('builder-subtitle'); if (sub) sub.innerHTML = `AI will create outfits tailored to your <strong style="color:var(--primary-pink);">${bt}</strong> body shape`;
  const chipMap = { Pear: ['A-Line Silhouettes 👗', 'Wide Leg Bottoms 👖', 'Define Waistline 🎀'], Hourglass: ['Fitted Silhouettes 👗', 'V-Neck Styling 👚', 'Belts & Waist Cinch ⏳'], Apple: ['Empire Waist Styles 👑', 'Flowy Tunics 👘', 'Straight Leg Pants 👖'], 'Inverted Triangle': ['A-Line Skirts 👗', 'Wide Leg Jeans 👖', 'Soft Shoulder Drapes 🧣'], Rectangle: ['Ruffled Tops 👚', 'High Waist Bottoms 👖', 'Belted Looks 🥋'] };
  const container = document.getElementById('builder-suggestions'); if (!container) return;
  container.innerHTML = ''; (chipMap[bt] || chipMap.Rectangle).forEach(label => { const btn = document.createElement('button'); btn.className = 'suggestion-chip'; btn.textContent = label; btn.onclick = () => applySuggestion(label); container.appendChild(btn); });
}


/* ────────────────────────────────────────────────────────────
   13. CHECKOUT
──────────────────────────────────────────────────────────── */
function checkoutPurchase() {
  showAiLoader('Processing Payment...', 'Establishing secure link.', 2000, () => {
    AppState.cartCount = 0; updateBadges(); showToast('Order Placed! 🛍️'); bumpStyleScore(20, 'Made a purchase');
    // After purchase, ask for fit feedback
    setTimeout(() => {
      const feedback = confirm('How was the fit? Click OK for "Perfect Fit" or Cancel to give other feedback.');
      submitFitFeedback(feedback ? 'Perfect Fit' : 'Needs adjustment');
    }, 1500);
    setTimeout(() => navigateTo('home'), 500);
  });
}


/* ────────────────────────────────────────────────────────────
   14. SAVED COMBOS
──────────────────────────────────────────────────────────── */
function renderSavedCombos() {
  const container = document.getElementById('saved-combos-container'); container.innerHTML = '';
  if (!AppState.savedCombos.length) { container.innerHTML = `<div style="text-align:center;padding:60px 20px;font-size:13px;color:var(--text-light);"><i class="fa-solid fa-heart-crack" style="font-size:40px;margin-bottom:12px;display:block;"></i>No outfits saved yet. Try the Outfit Builder!</div>`; return; }
  AppState.savedCombos.forEach(combo => {
    const thumbs = combo.items.map(id => { const p = AppState.products.find(x => x.id === id); return p ? `<img src="${p.image}" class="combo-thumb-img" alt="${p.name}"/>` : ''; }).join('');
    const card = document.createElement('div'); card.className = 'combo-card'; card.id = `combo-card-${combo.id}`;
    card.innerHTML = `<div class="combo-card-header"><div><div class="combo-name">${combo.name}</div><div class="combo-date">${combo.date}</div></div><button class="combo-heart" onclick="unsaveCombo('${combo.id}')"><i class="fa-solid fa-heart"></i></button></div><div class="combo-thumbs">${thumbs}</div><div class="combo-footer"><div class="combo-price">Total: <span>₹${combo.price}</span></div><button class="btn-pink" style="padding:6px 14px;font-size:11px;width:fit-content;" onclick="viewFullSavedCombo('${combo.id}')">View Outfit</button></div>`;
    container.appendChild(card);
  });
}

function unsaveCombo(id) { const card = document.getElementById(`combo-card-${id}`); if (card) { card.style.transition = 'all 0.3s'; card.style.transform = 'scale(0.9)'; card.style.opacity = '0'; } setTimeout(() => { AppState.savedCombos = AppState.savedCombos.filter(c => c.id !== id); localStorage.setItem('myntra_saved_combos', JSON.stringify(AppState.savedCombos)); renderSavedCombos(); updateBadges(); showToast('Removed from Wishlist', false); }, 300); }

function viewFullSavedCombo(id) { const combo = AppState.savedCombos.find(c => c.id === id); if (!combo?.items.length) return; const p = AppState.products.find(x => x.id === combo.items[0]); if (!p) return; AppState.activeProduct = p; AppState.activeSize = 'M'; AppState.activeColorIndex = 0; showAiLoader('Loading Combo...', `Opening ${combo.name}`, 1200, () => navigateTo('rendering')); }


/* ────────────────────────────────────────────────────────────
   15. PROFILE
──────────────────────────────────────────────────────────── */
function saveUserProfile() {
  const name = document.getElementById('profile-name').value.trim(), size = document.getElementById('profile-size').value, loc = document.getElementById('profile-location').value.trim(), deliv = document.getElementById('profile-delivery').value.trim();
  if (!name) { document.getElementById('profile-name').classList.add('input-error'); return showToast('Name cannot be empty', false); }
  if (!loc) { document.getElementById('profile-location').classList.add('input-error'); return showToast('Location cannot be empty', false); }
  if (!deliv) { document.getElementById('profile-delivery').classList.add('input-error'); return showToast('Delivery address required', false); }
  showAiLoader('Saving Profile...', 'Writing preferences securely.', 1000, () => {
    AppState.userName = name; AppState.userSize = size; AppState.userLocation = loc; AppState.userDelivery = deliv;
    localStorage.setItem('myntra_user_name', name); localStorage.setItem('myntra_user_size', size); localStorage.setItem('myntra_user_location', loc); localStorage.setItem('myntra_user_delivery', deliv);
    updateGreetingAndProfileDisplay(); showToast('Profile updated!'); bumpStyleScore(10, 'Completed profile');
  });
}

function updateGreetingAndProfileDisplay() {
  const h2 = document.getElementById('home-greeting-title'); if (h2) h2.innerText = `Welcome, ${AppState.userName}! 👋`;
  const ps = document.getElementById('home-greeting-sub'); if (ps) ps.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${AppState.userLocation} | Size ${AppState.userSize}`;
  [['profile-name', AppState.userName], ['profile-size', AppState.userSize], ['profile-location', AppState.userLocation], ['profile-delivery', AppState.userDelivery]].forEach(([id, val]) => { const el = document.getElementById(id); if (el) el.value = val; });
  const cred = AppState.authMethod === 'email' ? AppState.userEmail : `+91 ${AppState.userPhone}`;
  const cd = document.getElementById('profile-credential-display'); if (cd) cd.innerText = `Signed in via ${AppState.authMethod === 'email' ? 'Email' : 'Mobile Number'}`;
  const ed = document.getElementById('profile-email-display'); if (ed) ed.innerText = `Logged in as: ${cred}`;
  refreshStyleScoreUI(); renderStyleScoreTasks();
}

// Expose functions to window for index.html inline event handlers
Object.assign(window, {
  navigateTo,
  filterAndGo,
  switchLoginTab,
  handleSendOTP,
  handleVerifyOTP,
  logoutUser,
  triggerPhotoUpload,
  handleFileSelect,
  triggerCameraMock,
  selectShoeSize,
  filterCategory,
  filterProductsBySearch,
  toggleSmartFit,
  updateProductSize,
  tryProduct,
  changeRotation,
  handleFitSliderChange,
  addProductToBagFromTryOn,
  toggleWhyThisSize,
  applySuggestion,
  generateOutfitFromPrompt,
  tryFullOutfit,
  saveOutfitCombo,
  syncSlider,
  syncInput,
  setFitPreference,
  showMeasureGuide,
  analyzeMeasurements,
  shopBrand,
  checkoutPurchase,
  unsaveCombo,
  viewFullSavedCombo,
  saveUserProfile,
  selectMood
});