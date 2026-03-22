import { useState, useContext, createContext, useReducer, useEffect, useCallback } from "react";

// ─── Context ───────────────────────────────────────────────────────────────
const AppContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case "ADD": {
      const existing = state.find(i => i.id === action.item.id);
      return existing
        ? state.map(i => i.id === action.item.id ? { ...i, qty: i.qty + 1 } : i)
        : [...state, { ...action.item, qty: 1 }];
    }
    case "REMOVE": return state.filter(i => i.id !== action.id);
    case "UPDATE_QTY": return state.map(i => i.id === action.id ? { ...i, qty: Math.max(1, action.qty) } : i);
    case "CLEAR": return [];
    default: return state;
  }
};

// ─── Data ──────────────────────────────────────────────────────────────────
const PRODUCTS = [
  { id: 1, name: "Wireless Noise-Cancelling Headphones", price: 299, category: "Electronics", rating: 4.8, reviews: 2341, badge: "Best Seller", img: "🎧", desc: "Premium 40-hour battery life with adaptive ANC technology." },
  { id: 2, name: "Minimalist Leather Watch", price: 189, category: "Fashion", rating: 4.6, reviews: 892, badge: "New", img: "⌚", desc: "Swiss quartz movement with full-grain Italian leather strap." },
  { id: 3, name: "Smart Fitness Tracker Pro", price: 149, category: "Electronics", rating: 4.7, reviews: 1567, badge: "Hot", img: "⌚", desc: "24/7 health monitoring with GPS and sleep tracking." },
  { id: 4, name: "Ergonomic Office Chair", price: 449, category: "Home", rating: 4.9, reviews: 3201, badge: "Top Rated", img: "🪑", desc: "Lumbar support with 4D armrests and breathable mesh back." },
  { id: 5, name: "Portable Bluetooth Speaker", price: 89, category: "Electronics", rating: 4.5, reviews: 678, badge: "", img: "🔊", desc: "360° surround sound with 20-hour playtime and IPX7 waterproofing." },
  { id: 6, name: "Running Shoes Ultra Boost", price: 129, category: "Fashion", rating: 4.7, reviews: 1123, badge: "Sale", img: "👟", desc: "Responsive boost cushioning with adaptive arch support." },
  { id: 7, name: "Mechanical Gaming Keyboard", price: 159, category: "Electronics", rating: 4.8, reviews: 945, badge: "", img: "⌨️", desc: "Cherry MX switches with per-key RGB and N-key rollover." },
  { id: 8, name: "Scented Candle Set", price: 49, category: "Home", rating: 4.4, reviews: 432, badge: "New", img: "🕯️", desc: "Hand-poured soy wax with essential oils. Set of 4." },
  { id: 9, name: "Premium Yoga Mat", price: 79, category: "Sports", rating: 4.6, reviews: 761, badge: "", img: "🧘", desc: "6mm thick natural rubber with alignment lines and carry strap." },
  { id: 10, name: "Cold Brew Coffee Kit", price: 59, category: "Home", rating: 4.5, reviews: 388, badge: "Hot", img: "☕", desc: "1L glass carafe with fine mesh filter for smooth cold brew." },
  { id: 11, name: "Sunglasses Polarized UV400", price: 95, category: "Fashion", rating: 4.6, reviews: 512, badge: "", img: "🕶️", desc: "Aviation-grade titanium frame with polarized lenses." },
  { id: 12, name: "Smart Water Bottle", price: 45, category: "Sports", rating: 4.3, reviews: 289, badge: "New", img: "💧", desc: "LED temperature display with hydration reminder and 32oz capacity." },
];

const ORDERS = [
  { id: "#ORD-7821", date: "Mar 18, 2025", status: "Delivered", total: 388, items: 3 },
  { id: "#ORD-7654", date: "Mar 10, 2025", status: "In Transit", total: 149, items: 1 },
  { id: "#ORD-7401", date: "Feb 28, 2025", status: "Delivered", total: 537, items: 4 },
];

// ─── Styles ────────────────────────────────────────────────────────────────
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --cream: #faf8f5; --white: #ffffff; --ink: #1a1a2e; --ink2: #2d2d44;
    --accent: #c8a96e; --accent2: #e8c98e; --red: #e05252; --green: #2ecc71;
    --gray1: #f5f3f0; --gray2: #e8e5e0; --gray3: #b8b4ae; --gray4: #7a7670;
    --shadow: 0 4px 24px rgba(26,26,46,0.08); --shadow-lg: 0 12px 48px rgba(26,26,46,0.14);
    --radius: 12px; --radius-sm: 8px;
    --font-display: 'Playfair Display', serif; --font-body: 'DM Sans', sans-serif;
  }
  body { font-family: var(--font-body); background: var(--cream); color: var(--ink); }
  button { cursor: pointer; border: none; background: none; font-family: var(--font-body); }
  input, select { font-family: var(--font-body); }
  * { transition: color .15s, background .15s, transform .15s, box-shadow .15s, opacity .2s; }
  ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: var(--gray1); }
  ::-webkit-scrollbar-thumb { background: var(--gray3); border-radius: 3px; }

  .fade-in { animation: fadeIn .35s ease; }
  @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }
  @keyframes slideIn { from { transform:translateX(100%); } to { transform:translateX(0); } }
  @keyframes pulse { 0%,100%{transform:scale(1);} 50%{transform:scale(1.15);} }

  /* Nav */
  .nav { position:sticky; top:0; z-index:100; background:var(--white); border-bottom:1.5px solid var(--gray2);
    display:flex; align-items:center; justify-content:space-between; padding:0 40px; height:68px; box-shadow:var(--shadow); }
  .nav-logo { font-family:var(--font-display); font-size:22px; font-weight:700; color:var(--ink);
    letter-spacing:-0.5px; cursor:pointer; display:flex; align-items:center; gap:8px; }
  .nav-logo span { color:var(--accent); }
  .nav-links { display:flex; gap:28px; align-items:center; }
  .nav-link { font-size:14px; font-weight:500; color:var(--gray4); padding:6px 0; border-bottom:2px solid transparent;
    background:none; cursor:pointer; }
  .nav-link:hover,.nav-link.active { color:var(--ink); border-bottom-color:var(--accent); }
  .nav-actions { display:flex; gap:12px; align-items:center; }
  .icon-btn { width:42px; height:42px; border-radius:50%; display:flex; align-items:center; justify-content:center;
    font-size:18px; color:var(--ink2); background:var(--gray1); position:relative; }
  .icon-btn:hover { background:var(--gray2); transform:scale(1.05); }
  .badge { position:absolute; top:-2px; right:-2px; background:var(--accent); color:var(--white);
    font-size:10px; font-weight:700; width:18px; height:18px; border-radius:50%; display:flex;
    align-items:center; justify-content:center; border:2px solid var(--white); }

  /* Hero */
  .hero { background:linear-gradient(135deg, var(--ink) 0%, var(--ink2) 100%);
    padding:72px 40px; display:flex; align-items:center; justify-content:space-between; gap:40px; min-height:420px; }
  .hero-text { flex:1; max-width:560px; }
  .hero-eyebrow { font-size:13px; font-weight:600; letter-spacing:3px; color:var(--accent); text-transform:uppercase; margin-bottom:16px; }
  .hero-title { font-family:var(--font-display); font-size:52px; line-height:1.1; color:var(--white); margin-bottom:20px; }
  .hero-title span { color:var(--accent); }
  .hero-sub { font-size:16px; color:var(--gray3); line-height:1.7; margin-bottom:32px; max-width:440px; }
  .hero-btns { display:flex; gap:14px; flex-wrap:wrap; }
  .btn-primary { background:var(--accent); color:var(--white); padding:14px 32px; border-radius:var(--radius);
    font-weight:600; font-size:15px; letter-spacing:0.3px; }
  .btn-primary:hover { background:var(--accent2); transform:translateY(-2px); box-shadow:0 8px 24px rgba(200,169,110,0.4); }
  .btn-outline { border:2px solid rgba(255,255,255,0.25); color:var(--white); padding:14px 32px;
    border-radius:var(--radius); font-weight:600; font-size:15px; }
  .btn-outline:hover { background:rgba(255,255,255,0.08); }
  .hero-visual { flex:1; display:flex; justify-content:center; align-items:center; }
  .hero-cards { display:grid; grid-template-columns:1fr 1fr; gap:16px; max-width:340px; }
  .hero-card { background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.12);
    border-radius:var(--radius); padding:20px; backdrop-filter:blur(10px); text-align:center; }
  .hero-card-emoji { font-size:36px; margin-bottom:8px; }
  .hero-card-name { font-size:12px; color:rgba(255,255,255,0.7); font-weight:500; }
  .hero-card-price { font-size:15px; font-weight:700; color:var(--accent); margin-top:4px; }

  /* Stats bar */
  .stats-bar { background:var(--white); padding:20px 40px; display:flex; justify-content:center;
    gap:60px; border-bottom:1px solid var(--gray2); }
  .stat { text-align:center; }
  .stat-num { font-family:var(--font-display); font-size:24px; font-weight:700; color:var(--ink); }
  .stat-label { font-size:12px; color:var(--gray4); margin-top:2px; }

  /* Filters */
  .shop-header { padding:36px 40px 20px; }
  .shop-title { font-family:var(--font-display); font-size:28px; margin-bottom:20px; }
  .filters-row { display:flex; gap:12px; align-items:center; flex-wrap:wrap; }
  .search-wrap { position:relative; flex:1; max-width:340px; }
  .search-input { width:100%; padding:11px 16px 11px 42px; border:1.5px solid var(--gray2);
    border-radius:var(--radius-sm); font-size:14px; background:var(--white); color:var(--ink);
    outline:none; }
  .search-input:focus { border-color:var(--accent); }
  .search-icon { position:absolute; left:14px; top:50%; transform:translateY(-50%); font-size:16px; opacity:.5; }
  .filter-select { padding:11px 16px; border:1.5px solid var(--gray2); border-radius:var(--radius-sm);
    font-size:14px; background:var(--white); color:var(--ink); outline:none; cursor:pointer; }
  .filter-select:focus { border-color:var(--accent); }
  .cat-pills { display:flex; gap:8px; flex-wrap:wrap; padding:0 40px 20px; }
  .cat-pill { padding:7px 18px; border-radius:100px; font-size:13px; font-weight:500;
    border:1.5px solid var(--gray2); color:var(--gray4); background:var(--white); }
  .cat-pill:hover { border-color:var(--accent); color:var(--accent); }
  .cat-pill.active { background:var(--ink); color:var(--white); border-color:var(--ink); }

  /* Product grid */
  .product-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(260px, 1fr));
    gap:24px; padding:0 40px 40px; }
  .product-card { background:var(--white); border-radius:var(--radius); border:1.5px solid var(--gray2);
    overflow:hidden; position:relative; }
  .product-card:hover { transform:translateY(-4px); box-shadow:var(--shadow-lg); border-color:var(--gray3); }
  .product-img { height:200px; display:flex; align-items:center; justify-content:center;
    font-size:72px; background:var(--gray1); position:relative; }
  .product-badge { position:absolute; top:12px; left:12px; padding:4px 10px; border-radius:100px;
    font-size:11px; font-weight:700; background:var(--accent); color:var(--white); letter-spacing:0.5px; }
  .product-badge.sale { background:var(--red); }
  .product-info { padding:18px; }
  .product-category { font-size:11px; font-weight:600; color:var(--accent); text-transform:uppercase;
    letter-spacing:1px; margin-bottom:6px; }
  .product-name { font-size:15px; font-weight:600; color:var(--ink); line-height:1.4; margin-bottom:8px; }
  .product-desc { font-size:12px; color:var(--gray4); line-height:1.5; margin-bottom:12px; }
  .product-rating { display:flex; align-items:center; gap:6px; margin-bottom:14px; }
  .stars { color:var(--accent); font-size:13px; }
  .rating-num { font-size:13px; font-weight:600; color:var(--ink); }
  .review-count { font-size:12px; color:var(--gray4); }
  .product-footer { display:flex; align-items:center; justify-content:space-between; }
  .product-price { font-family:var(--font-display); font-size:22px; font-weight:700; color:var(--ink); }
  .add-btn { background:var(--ink); color:var(--white); padding:9px 18px; border-radius:var(--radius-sm);
    font-size:13px; font-weight:600; }
  .add-btn:hover { background:var(--accent); transform:scale(1.03); }
  .add-btn.added { background:var(--green); animation:pulse .3s ease; }

  /* Cart sidebar */
  .overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:200; backdrop-filter:blur(4px); }
  .cart-sidebar { position:fixed; right:0; top:0; bottom:0; width:420px; background:var(--white);
    z-index:201; display:flex; flex-direction:column; animation:slideIn .3s ease; box-shadow:var(--shadow-lg); }
  .cart-header { padding:24px; border-bottom:1.5px solid var(--gray2); display:flex;
    align-items:center; justify-content:space-between; }
  .cart-title { font-family:var(--font-display); font-size:22px; }
  .close-btn { width:36px; height:36px; border-radius:50%; background:var(--gray1); display:flex;
    align-items:center; justify-content:center; font-size:18px; }
  .close-btn:hover { background:var(--gray2); }
  .cart-items { flex:1; overflow-y:auto; padding:16px 24px; }
  .cart-empty { text-align:center; padding:60px 20px; color:var(--gray4); }
  .cart-empty-icon { font-size:56px; margin-bottom:16px; }
  .cart-item { display:flex; gap:14px; padding:16px 0; border-bottom:1px solid var(--gray2); align-items:center; }
  .cart-item-img { width:60px; height:60px; background:var(--gray1); border-radius:var(--radius-sm);
    display:flex; align-items:center; justify-content:center; font-size:28px; flex-shrink:0; }
  .cart-item-info { flex:1; }
  .cart-item-name { font-size:14px; font-weight:600; color:var(--ink); margin-bottom:4px; line-height:1.3; }
  .cart-item-price { font-size:15px; font-weight:700; color:var(--accent); }
  .qty-control { display:flex; align-items:center; gap:10px; margin-top:8px; }
  .qty-btn { width:28px; height:28px; border-radius:6px; background:var(--gray1); font-size:16px;
    font-weight:700; display:flex; align-items:center; justify-content:center; }
  .qty-btn:hover { background:var(--gray2); }
  .qty-num { font-size:14px; font-weight:600; min-width:20px; text-align:center; }
  .remove-btn { color:var(--red); font-size:18px; padding:4px; margin-left:4px; }
  .cart-footer { padding:20px 24px; border-top:1.5px solid var(--gray2); }
  .cart-subtotal { display:flex; justify-content:space-between; margin-bottom:6px; font-size:14px; color:var(--gray4); }
  .cart-total { display:flex; justify-content:space-between; font-size:18px; font-weight:700;
    color:var(--ink); margin-bottom:18px; padding-top:12px; border-top:1px solid var(--gray2); }
  .checkout-btn { width:100%; background:var(--ink); color:var(--white); padding:16px;
    border-radius:var(--radius); font-size:16px; font-weight:700; letter-spacing:0.3px; }
  .checkout-btn:hover { background:var(--accent); transform:translateY(-2px); }

  /* Pages */
  .page { padding:40px; max-width:1100px; margin:0 auto; }
  .page-title { font-family:var(--font-display); font-size:32px; margin-bottom:8px; }
  .page-sub { color:var(--gray4); margin-bottom:32px; font-size:15px; }

  /* Auth */
  .auth-wrap { min-height:calc(100vh - 68px); display:flex; align-items:center;
    justify-content:center; padding:40px; background:var(--gray1); }
  .auth-card { background:var(--white); border-radius:var(--radius); padding:48px; width:100%; max-width:440px;
    box-shadow:var(--shadow-lg); border:1.5px solid var(--gray2); }
  .auth-logo { text-align:center; margin-bottom:32px; }
  .auth-logo-text { font-family:var(--font-display); font-size:28px; color:var(--ink); }
  .auth-logo-text span { color:var(--accent); }
  .auth-title { font-size:22px; font-weight:700; text-align:center; margin-bottom:6px; }
  .auth-sub { font-size:14px; color:var(--gray4); text-align:center; margin-bottom:28px; }
  .form-group { margin-bottom:18px; }
  .form-label { font-size:13px; font-weight:600; color:var(--ink2); display:block; margin-bottom:7px; }
  .form-input { width:100%; padding:12px 16px; border:1.5px solid var(--gray2); border-radius:var(--radius-sm);
    font-size:14px; color:var(--ink); outline:none; background:var(--white); }
  .form-input:focus { border-color:var(--accent); box-shadow:0 0 0 3px rgba(200,169,110,0.12); }
  .form-row { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  .submit-btn { width:100%; background:var(--ink); color:var(--white); padding:14px; border-radius:var(--radius);
    font-size:15px; font-weight:700; margin-top:8px; }
  .submit-btn:hover { background:var(--accent); }
  .auth-switch { text-align:center; margin-top:20px; font-size:14px; color:var(--gray4); }
  .auth-switch button { color:var(--accent); font-weight:600; font-size:14px; }
  .auth-switch button:hover { text-decoration:underline; }
  .divider { display:flex; align-items:center; gap:12px; margin:20px 0; color:var(--gray3); font-size:13px; }
  .divider::before,.divider::after { content:''; flex:1; height:1px; background:var(--gray2); }
  .social-btn { width:100%; padding:12px; border:1.5px solid var(--gray2); border-radius:var(--radius-sm);
    font-size:14px; font-weight:500; color:var(--ink); display:flex; align-items:center;
    justify-content:center; gap:10px; margin-bottom:10px; }
  .social-btn:hover { background:var(--gray1); }

  /* Payment */
  .payment-grid { display:grid; grid-template-columns:1fr 380px; gap:32px; align-items:start; }
  .payment-card { background:var(--white); border-radius:var(--radius); padding:28px;
    border:1.5px solid var(--gray2); margin-bottom:20px; }
  .payment-card-title { font-size:16px; font-weight:700; margin-bottom:20px; padding-bottom:14px;
    border-bottom:1px solid var(--gray2); display:flex; align-items:center; gap:10px; }
  .payment-methods { display:flex; gap:12px; margin-bottom:20px; }
  .pay-method { flex:1; padding:14px; border:2px solid var(--gray2); border-radius:var(--radius-sm);
    text-align:center; font-size:13px; font-weight:600; }
  .pay-method.active { border-color:var(--accent); background:rgba(200,169,110,0.06); color:var(--accent); }
  .pay-method:hover { border-color:var(--gray3); }
  .card-visual { background:linear-gradient(135deg, var(--ink) 0%, #3d3d5c 100%);
    border-radius:14px; padding:24px; color:var(--white); margin-bottom:24px; position:relative; overflow:hidden; }
  .card-visual::before { content:''; position:absolute; width:200px; height:200px; border-radius:50%;
    background:rgba(200,169,110,0.15); top:-60px; right:-60px; }
  .card-chip { font-size:28px; margin-bottom:20px; }
  .card-number { font-size:18px; letter-spacing:4px; font-family:monospace; margin-bottom:16px; opacity:.9; }
  .card-bottom { display:flex; justify-content:space-between; font-size:13px; opacity:.7; }
  .order-summary-card { background:var(--white); border-radius:var(--radius); padding:28px;
    border:1.5px solid var(--gray2); position:sticky; top:90px; }
  .order-summary-title { font-size:16px; font-weight:700; margin-bottom:20px; padding-bottom:14px;
    border-bottom:1px solid var(--gray2); }
  .summary-item { display:flex; justify-content:space-between; font-size:14px;
    color:var(--gray4); margin-bottom:10px; }
  .summary-total { display:flex; justify-content:space-between; font-size:18px; font-weight:700;
    color:var(--ink); padding-top:14px; border-top:2px solid var(--gray2); margin-top:10px; }
  .secure-badges { display:flex; gap:8px; margin-top:14px; }
  .secure-badge { flex:1; text-align:center; font-size:11px; color:var(--gray4); padding:8px;
    background:var(--gray1); border-radius:6px; }

  /* Admin */
  .admin-layout { display:grid; grid-template-columns:240px 1fr; min-height:calc(100vh - 68px); }
  .admin-sidebar { background:var(--ink); padding:24px 0; }
  .admin-sidebar-title { font-family:var(--font-display); font-size:16px; color:rgba(255,255,255,0.5);
    padding:0 24px 16px; text-transform:uppercase; letter-spacing:1px; font-size:12px; }
  .admin-nav-item { display:flex; align-items:center; gap:12px; padding:13px 24px; font-size:14px;
    font-weight:500; color:rgba(255,255,255,0.6); cursor:pointer; }
  .admin-nav-item:hover { background:rgba(255,255,255,0.05); color:var(--white); }
  .admin-nav-item.active { background:rgba(200,169,110,0.15); color:var(--accent); border-right:3px solid var(--accent); }
  .admin-content { padding:32px; background:var(--gray1); overflow:auto; }
  .admin-title { font-family:var(--font-display); font-size:26px; margin-bottom:24px; }
  .kpi-grid { display:grid; grid-template-columns:repeat(4, 1fr); gap:18px; margin-bottom:28px; }
  .kpi-card { background:var(--white); border-radius:var(--radius); padding:22px;
    border:1.5px solid var(--gray2); }
  .kpi-label { font-size:12px; font-weight:600; color:var(--gray4); text-transform:uppercase;
    letter-spacing:1px; margin-bottom:8px; }
  .kpi-value { font-family:var(--font-display); font-size:28px; font-weight:700; color:var(--ink); }
  .kpi-change { font-size:12px; margin-top:6px; }
  .kpi-change.up { color:var(--green); } .kpi-change.down { color:var(--red); }
  .admin-table-card { background:var(--white); border-radius:var(--radius); border:1.5px solid var(--gray2); overflow:hidden; }
  .admin-table-header { padding:18px 24px; border-bottom:1.5px solid var(--gray2); display:flex;
    align-items:center; justify-content:space-between; }
  .admin-table-title { font-size:16px; font-weight:700; }
  table { width:100%; border-collapse:collapse; }
  th { background:var(--gray1); padding:12px 16px; text-align:left; font-size:12px; font-weight:700;
    color:var(--gray4); text-transform:uppercase; letter-spacing:0.5px; }
  td { padding:14px 16px; border-bottom:1px solid var(--gray2); font-size:14px; color:var(--ink2); }
  tr:last-child td { border-bottom:none; }
  tr:hover td { background:var(--gray1); }
  .status-pill { display:inline-flex; padding:4px 12px; border-radius:100px; font-size:12px; font-weight:600; }
  .status-pill.delivered { background:#e8f8f1; color:#27ae60; }
  .status-pill.transit { background:#fff3e0; color:#e67e22; }
  .status-pill.processing { background:#e8f0fe; color:#3b5bdb; }

  /* Profile */
  .profile-grid { display:grid; grid-template-columns:280px 1fr; gap:24px; }
  .profile-card { background:var(--white); border-radius:var(--radius); padding:28px;
    border:1.5px solid var(--gray2); }
  .profile-avatar { width:80px; height:80px; border-radius:50%; background:var(--ink);
    display:flex; align-items:center; justify-content:center; font-size:32px; margin:0 auto 16px; }
  .profile-name { font-size:18px; font-weight:700; text-align:center; margin-bottom:4px; }
  .profile-email { font-size:13px; color:var(--gray4); text-align:center; margin-bottom:20px; }
  .profile-stat { display:flex; justify-content:space-between; padding:12px 0;
    border-bottom:1px solid var(--gray2); font-size:14px; }
  .profile-stat:last-child { border-bottom:none; }
  .profile-stat-label { color:var(--gray4); }
  .profile-stat-value { font-weight:600; color:var(--ink); }
  .order-card { background:var(--white); border-radius:var(--radius); padding:20px;
    border:1.5px solid var(--gray2); margin-bottom:14px; display:flex;
    align-items:center; justify-content:space-between; }
  .order-info { }
  .order-id { font-weight:700; font-size:15px; margin-bottom:4px; }
  .order-meta { font-size:13px; color:var(--gray4); }
  .order-right { text-align:right; }
  .order-total { font-size:18px; font-weight:700; color:var(--ink); }

  /* Toast */
  .toast { position:fixed; bottom:28px; right:28px; background:var(--ink); color:var(--white);
    padding:14px 22px; border-radius:var(--radius); font-size:14px; font-weight:500;
    z-index:999; animation:slideIn .3s ease; display:flex; align-items:center; gap:10px;
    box-shadow:var(--shadow-lg); }
  .toast-icon { font-size:18px; }

  /* Responsive tweaks */
  @media (max-width: 900px) {
    .nav { padding:0 20px; }
    .hero { padding:48px 20px; flex-direction:column; }
    .hero-title { font-size:36px; }
    .product-grid { padding:0 20px 20px; }
    .payment-grid { grid-template-columns:1fr; }
    .admin-layout { grid-template-columns:1fr; }
    .kpi-grid { grid-template-columns:1fr 1fr; }
    .profile-grid { grid-template-columns:1fr; }
  }
`;

// ─── Components ────────────────────────────────────────────────────────────
function Stars({ rating }) {
  return <span className="stars">{"★".repeat(Math.floor(rating))}{"☆".repeat(5 - Math.floor(rating))}</span>;
}

function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 2800); return () => clearTimeout(t); }, [onClose]);
  return <div className="toast"><span className="toast-icon">✓</span>{msg}</div>;
}

function Navbar({ page, setPage, cartCount, setCartOpen, user }) {
  return (
    <nav className="nav">
      <div className="nav-logo" onClick={() => setPage("home")}>Luxe<span>Shop</span></div>
      <div className="nav-links">
        {["home","shop","profile"].map(p => (
          <button key={p} className={`nav-link ${page===p?"active":""}`} onClick={() => setPage(p)}>
            {p.charAt(0).toUpperCase()+p.slice(1)}
          </button>
        ))}
        {user?.isAdmin && (
          <button className={`nav-link ${page==="admin"?"active":""}`} onClick={() => setPage("admin")}>Admin</button>
        )}
      </div>
      <div className="nav-actions">
        <button className="icon-btn" onClick={() => setCartOpen(true)}>
          🛒{cartCount > 0 && <span className="badge">{cartCount}</span>}
        </button>
        <button className="icon-btn" onClick={() => setPage(user ? "profile" : "login")}>
          {user ? "👤" : "🔑"}
        </button>
      </div>
    </nav>
  );
}

function CartSidebar({ cart, dispatch, onClose, setPage }) {
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal > 200 ? 0 : 15;
  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="cart-sidebar">
        <div className="cart-header">
          <div className="cart-title">Your Cart ({cart.reduce((s,i)=>s+i.qty,0)})</div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛍️</div>
              <p style={{fontWeight:600,marginBottom:8}}>Your cart is empty</p>
              <p style={{fontSize:13,color:"var(--gray4)"}}>Add some items to get started</p>
            </div>
          ) : cart.map(item => (
            <div className="cart-item fade-in" key={item.id}>
              <div className="cart-item-img">{item.img}</div>
              <div className="cart-item-info">
                <div className="cart-item-name">{item.name}</div>
                <div className="cart-item-price">${(item.price * item.qty).toFixed(2)}</div>
                <div className="qty-control">
                  <button className="qty-btn" onClick={() => dispatch({type:"UPDATE_QTY",id:item.id,qty:item.qty-1})}>−</button>
                  <span className="qty-num">{item.qty}</span>
                  <button className="qty-btn" onClick={() => dispatch({type:"UPDATE_QTY",id:item.id,qty:item.qty+1})}>+</button>
                </div>
              </div>
              <button className="remove-btn" onClick={() => dispatch({type:"REMOVE",id:item.id})}>🗑</button>
            </div>
          ))}
        </div>
        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-subtotal"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="cart-subtotal"><span>Shipping</span><span>{shipping===0?"Free":"$"+shipping}</span></div>
            <div className="cart-total"><span>Total</span><span>${(subtotal+shipping).toFixed(2)}</span></div>
            <button className="checkout-btn" onClick={() => { onClose(); setPage("payment"); }}>
              Proceed to Checkout →
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function HeroSection({ setPage }) {
  return (
    <div className="hero">
      <div className="hero-text">
        <div className="hero-eyebrow">✦ New Collection 2025</div>
        <h1 className="hero-title">Discover <span>Premium</span> Products</h1>
        <p className="hero-sub">Curated selection of world-class electronics, fashion & lifestyle products — delivered to your door.</p>
        <div className="hero-btns">
          <button className="btn-primary" onClick={() => setPage("shop")}>Shop Now</button>
          <button className="btn-outline" onClick={() => setPage("shop")}>View Collection</button>
        </div>
      </div>
      <div className="hero-visual">
        <div className="hero-cards">
          {PRODUCTS.slice(0,4).map(p => (
            <div className="hero-card" key={p.id}>
              <div className="hero-card-emoji">{p.img}</div>
              <div className="hero-card-name">{p.name.split(" ").slice(0,3).join(" ")}</div>
              <div className="hero-card-price">${p.price}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ShopPage({ dispatch, showToast }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");
  const [added, setAdded] = useState({});
  const cats = ["All", ...new Set(PRODUCTS.map(p => p.category))];

  const filtered = PRODUCTS
    .filter(p => (category==="All" || p.category===category) &&
      (p.name.toLowerCase().includes(search.toLowerCase()) || p.desc.toLowerCase().includes(search.toLowerCase())))
    .sort((a,b) => sort==="price-low"?a.price-b.price:sort==="price-high"?b.price-a.price:sort==="rating"?b.rating-a.rating:0);

  const handleAdd = (product) => {
    dispatch({ type: "ADD", item: product });
    setAdded(prev => ({ ...prev, [product.id]: true }));
    showToast(`${product.name.split(" ").slice(0,3).join(" ")} added to cart!`);
    setTimeout(() => setAdded(prev => ({ ...prev, [product.id]: false })), 1200);
  };

  return (
    <div>
      <div className="shop-header">
        <div className="shop-title">All Products <span style={{fontSize:18,color:"var(--gray4)",fontFamily:"var(--font-body)",fontWeight:400}}>({filtered.length} items)</span></div>
        <div className="filters-row">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input className="search-input" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="filter-select" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>
      <div className="cat-pills">
        {cats.map(c => (
          <button key={c} className={`cat-pill ${category===c?"active":""}`} onClick={() => setCategory(c)}>{c}</button>
        ))}
      </div>
      <div className="product-grid">
        {filtered.map(product => (
          <div className="product-card fade-in" key={product.id}>
            <div className="product-img">
              <span style={{fontSize:80}}>{product.img}</span>
              {product.badge && <span className={`product-badge ${product.badge==="Sale"?"sale":""}`}>{product.badge}</span>}
            </div>
            <div className="product-info">
              <div className="product-category">{product.category}</div>
              <div className="product-name">{product.name}</div>
              <div className="product-desc">{product.desc}</div>
              <div className="product-rating">
                <Stars rating={product.rating} />
                <span className="rating-num">{product.rating}</span>
                <span className="review-count">({product.reviews.toLocaleString()})</span>
              </div>
              <div className="product-footer">
                <div className="product-price">${product.price}</div>
                <button className={`add-btn ${added[product.id]?"added":""}`} onClick={() => handleAdd(product)}>
                  {added[product.id] ? "✓ Added" : "+ Cart"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AuthPage({ setUser, setPage }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name:"", email:"", password:"", confirm:"" });
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = () => {
    if (!form.email || !form.password) return;
    setUser({ name: form.name || "Hassan Ali", email: form.email, isAdmin: form.email.includes("admin") });
    setPage("home");
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card fade-in">
        <div className="auth-logo">
          <div className="auth-logo-text">Luxe<span>Shop</span></div>
        </div>
        <h2 className="auth-title">{mode==="login" ? "Welcome back" : "Create account"}</h2>
        <p className="auth-sub">{mode==="login" ? "Sign in to your account" : "Join thousands of shoppers"}</p>
        <button className="social-btn">🌐 Continue with Google</button>
        <div className="divider">or</div>
        {mode==="signup" && (
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input className="form-input" placeholder="Hassan" value={form.name} onChange={set("name")} />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input className="form-input" placeholder="Ali" />
            </div>
          </div>
        )}
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" placeholder="••••••••" value={form.password} onChange={set("password")} />
        </div>
        {mode==="signup" && (
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input className="form-input" type="password" placeholder="••••••••" value={form.confirm} onChange={set("confirm")} />
          </div>
        )}
        <button className="submit-btn" onClick={handleSubmit}>
          {mode==="login" ? "Sign In →" : "Create Account →"}
        </button>
        <p className="auth-switch">
          {mode==="login" ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setMode(mode==="login"?"signup":"login")}>
            {mode==="login" ? "Sign up" : "Sign in"}
          </button>
        </p>
        {mode==="login" && (
          <p style={{textAlign:"center",fontSize:12,color:"var(--gray4)",marginTop:12}}>
            💡 Use any email with "admin" to access admin panel
          </p>
        )}
      </div>
    </div>
  );
}

function PaymentPage({ cart, dispatch, setPage, showToast }) {
  const [payMethod, setPayMethod] = useState("card");
  const [form, setForm] = useState({ name:"Hassan Ali", card:"4242 4242 4242 4242", expiry:"12/27", cvv:"•••" });
  const subtotal = cart.reduce((s,i) => s+i.price*i.qty, 0);
  const shipping = subtotal > 200 ? 0 : 15;
  const tax = subtotal * 0.05;
  const total = subtotal + shipping + tax;

  const handlePay = () => {
    dispatch({ type: "CLEAR" });
    showToast("🎉 Order placed successfully!");
    setPage("profile");
  };

  return (
    <div className="page fade-in">
      <h1 className="page-title">Checkout</h1>
      <p className="page-sub">Complete your purchase securely</p>
      <div className="payment-grid">
        <div>
          <div className="payment-card">
            <div className="payment-card-title">📦 Delivery Information</div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">First Name</label><input className="form-input" defaultValue="Hassan" /></div>
              <div className="form-group"><label className="form-label">Last Name</label><input className="form-input" defaultValue="Ali" /></div>
            </div>
            <div className="form-group"><label className="form-label">Address</label><input className="form-input" defaultValue="Dubai Marina, Tower 3, Apt 1204" /></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">City</label><input className="form-input" defaultValue="Dubai" /></div>
              <div className="form-group"><label className="form-label">ZIP</label><input className="form-input" defaultValue="00000" /></div>
            </div>
          </div>
          <div className="payment-card">
            <div className="payment-card-title">💳 Payment Method</div>
            <div className="payment-methods">
              {["card","apple","paypal"].map(m => (
                <button key={m} className={`pay-method ${payMethod===m?"active":""}`} onClick={() => setPayMethod(m)}>
                  {m==="card"?"💳 Card":m==="apple"?"🍎 Apple Pay":"🅿️ PayPal"}
                </button>
              ))}
            </div>
            <div className="card-visual">
              <div className="card-chip">💳</div>
              <div className="card-number">{form.card}</div>
              <div className="card-bottom">
                <span>{form.name}</span><span>Expires {form.expiry}</span>
              </div>
            </div>
            <div className="form-group"><label className="form-label">Cardholder Name</label>
              <input className="form-input" value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} /></div>
            <div className="form-group"><label className="form-label">Card Number</label>
              <input className="form-input" value={form.card} onChange={e => setForm(p=>({...p,card:e.target.value}))} /></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Expiry</label>
                <input className="form-input" value={form.expiry} onChange={e => setForm(p=>({...p,expiry:e.target.value}))} /></div>
              <div className="form-group"><label className="form-label">CVV</label>
                <input className="form-input" placeholder="•••" type="password" /></div>
            </div>
          </div>
        </div>
        <div>
          <div className="order-summary-card">
            <div className="order-summary-title">Order Summary</div>
            {cart.map(i => (
              <div className="summary-item" key={i.id}>
                <span>{i.img} {i.name.split(" ").slice(0,3).join(" ")} ×{i.qty}</span>
                <span>${(i.price*i.qty).toFixed(2)}</span>
              </div>
            ))}
            <div className="summary-item"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="summary-item"><span>Shipping</span><span>{shipping===0?"Free":"$"+shipping}</span></div>
            <div className="summary-item"><span>Tax (5%)</span><span>${tax.toFixed(2)}</span></div>
            <div className="summary-total"><span>Total</span><span>${total.toFixed(2)}</span></div>
            <button className="checkout-btn" style={{marginTop:18}} onClick={handlePay}>
              🔒 Place Order — ${total.toFixed(2)}
            </button>
            <div className="secure-badges">
              <div className="secure-badge">🔒 SSL Secure</div>
              <div className="secure-badge">✓ PCI DSS</div>
              <div className="secure-badge">🛡️ Protected</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const navItems = [
    {id:"dashboard", icon:"📊", label:"Dashboard"},
    {id:"products",  icon:"📦", label:"Products"},
    {id:"orders",    icon:"🧾", label:"Orders"},
    {id:"customers", icon:"👥", label:"Customers"},
    {id:"analytics", icon:"📈", label:"Analytics"},
  ];
  const kpis = [
    { label:"Total Revenue", value:"$84,231", change:"+12.5%", up:true },
    { label:"Orders Today", value:"148", change:"+8.2%", up:true },
    { label:"Total Customers", value:"3,842", change:"+5.1%", up:true },
    { label:"Avg Order Value", value:"$189", change:"-2.3%", up:false },
  ];
  const recentOrders = [
    { id:"#ORD-7821", customer:"Hassan Ali", product:"Headphones + Watch", date:"Mar 18", total:"$488", status:"Delivered" },
    { id:"#ORD-7820", customer:"Sarah Khan", product:"Fitness Tracker", date:"Mar 18", total:"$149", status:"In Transit" },
    { id:"#ORD-7819", customer:"Omar Sheikh", product:"Office Chair", date:"Mar 17", total:"$449", status:"Processing" },
    { id:"#ORD-7818", customer:"Aisha Malik", product:"Speaker + Shoes", date:"Mar 17", total:"$218", status:"Delivered" },
    { id:"#ORD-7817", customer:"Zaid Ahmed", product:"Gaming Keyboard", date:"Mar 16", total:"$159", status:"Delivered" },
  ];
  const statusMap = { "Delivered":"delivered","In Transit":"transit","Processing":"processing" };

  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <div className="admin-sidebar-title">Admin Panel</div>
        {navItems.map(item => (
          <div key={item.id} className={`admin-nav-item ${activeTab===item.id?"active":""}`}
            onClick={() => setActiveTab(item.id)}>
            <span>{item.icon}</span><span>{item.label}</span>
          </div>
        ))}
        <div style={{borderTop:"1px solid rgba(255,255,255,0.08)",margin:"16px 0"}}/>
        <div className="admin-nav-item" style={{color:"var(--red)"}}>
          <span>🚪</span><span>Logout</span>
        </div>
      </div>
      <div className="admin-content fade-in">
        <div className="admin-title">
          {activeTab==="dashboard"?"Dashboard Overview":
           activeTab==="products"?"Product Management":
           activeTab==="orders"?"Order Management":
           activeTab==="customers"?"Customer Management":"Analytics"}
        </div>
        <div className="kpi-grid">
          {kpis.map(k => (
            <div className="kpi-card" key={k.label}>
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-value">{k.value}</div>
              <div className={`kpi-change ${k.up?"up":"down"}`}>{k.change} vs last month</div>
            </div>
          ))}
        </div>
        <div className="admin-table-card">
          <div className="admin-table-header">
            <div className="admin-table-title">Recent Orders</div>
            <button style={{fontSize:13,color:"var(--accent)",fontWeight:600}}>View All →</button>
          </div>
          <table>
            <thead><tr><th>Order ID</th><th>Customer</th><th>Product</th><th>Date</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>
              {recentOrders.map(o => (
                <tr key={o.id}>
                  <td style={{fontWeight:700,color:"var(--accent)"}}>{o.id}</td>
                  <td>{o.customer}</td>
                  <td style={{color:"var(--gray4)"}}>{o.product}</td>
                  <td style={{color:"var(--gray4)"}}>{o.date}</td>
                  <td style={{fontWeight:700}}>{o.total}</td>
                  <td><span className={`status-pill ${statusMap[o.status]}`}>{o.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ProfilePage({ user, setPage }) {
  if (!user) { setPage("login"); return null; }
  return (
    <div className="page fade-in">
      <h1 className="page-title">My Account</h1>
      <p className="page-sub">Manage your profile and orders</p>
      <div className="profile-grid">
        <div>
          <div className="profile-card">
            <div className="profile-avatar">👤</div>
            <div className="profile-name">{user.name}</div>
            <div className="profile-email">{user.email}</div>
            <div style={{borderTop:"1px solid var(--gray2)",paddingTop:16,marginTop:4}}>
              <div className="profile-stat"><span className="profile-stat-label">Member Since</span><span className="profile-stat-value">Jan 2024</span></div>
              <div className="profile-stat"><span className="profile-stat-label">Total Orders</span><span className="profile-stat-value">12</span></div>
              <div className="profile-stat"><span className="profile-stat-label">Total Spent</span><span className="profile-stat-value">$1,074</span></div>
              <div className="profile-stat"><span className="profile-stat-label">Loyalty Points</span><span className="profile-stat-value" style={{color:"var(--accent)"}}>2,840 pts</span></div>
            </div>
          </div>
        </div>
        <div>
          <h3 style={{fontSize:18,fontWeight:700,marginBottom:16}}>Recent Orders</h3>
          {ORDERS.map(o => (
            <div className="order-card" key={o.id}>
              <div className="order-info">
                <div className="order-id">{o.id}</div>
                <div className="order-meta">{o.date} · {o.items} items</div>
                <span className={`status-pill ${o.status==="Delivered"?"delivered":"transit"}`} style={{marginTop:8,display:"inline-flex"}}>
                  {o.status}
                </span>
              </div>
              <div className="order-right">
                <div className="order-total">${o.total}</div>
                <button style={{fontSize:13,color:"var(--accent)",fontWeight:600,marginTop:8}}>View Details →</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── App ───────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [cart, dispatch] = useReducer(cartReducer, []);
  const [cartOpen, setCartOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg) => setToast(msg), []);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <>
      <style>{globalStyles}</style>
      <Navbar page={page} setPage={setPage} cartCount={cartCount} setCartOpen={setCartOpen} user={user} />

      {page === "home" && (
        <>
          <HeroSection setPage={setPage} />
          <div className="stats-bar">
            <div className="stat"><div className="stat-num">50K+</div><div className="stat-label">Happy Customers</div></div>
            <div className="stat"><div className="stat-num">12K+</div><div className="stat-label">Products</div></div>
            <div className="stat"><div className="stat-num">4.8★</div><div className="stat-label">Average Rating</div></div>
            <div className="stat"><div className="stat-num">99%</div><div className="stat-label">On-Time Delivery</div></div>
          </div>
          <ShopPage dispatch={dispatch} showToast={showToast} />
        </>
      )}
      {page === "shop"    && <ShopPage dispatch={dispatch} showToast={showToast} />}
      {page === "login"   && <AuthPage setUser={setUser} setPage={setPage} />}
      {page === "payment" && <PaymentPage cart={cart} dispatch={dispatch} setPage={setPage} showToast={showToast} />}
      {page === "admin"   && <AdminPage />}
      {page === "profile" && <ProfilePage user={user} setPage={setPage} />}

      {cartOpen && <CartSidebar cart={cart} dispatch={dispatch} onClose={() => setCartOpen(false)} setPage={setPage} />}
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
    </>
  );
}
