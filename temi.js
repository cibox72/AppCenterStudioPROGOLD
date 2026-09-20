// ============================================
// VARIABILE GLOBALE WORKER_URL
// ============================================
var WORKER_URL = "https://appcenter-backend.mairaluigi-b2f.workers.dev";

// ============================================
// SISTEMA TEMI GLOBALI - AppCenterStudioPROGOLD
// REGOLA FISSA: Testo SEMPRE NERO, Sfondo SEMPRE BIANCO
// ============================================
var TEMAS = {
  'default': {
    p: '#82e0aa', pd: '#1e8449', pl: '#e8f8f5',
    pg: 'linear-gradient(135deg, #a9dfbf 0%, #82e0aa 50%, #1e8449 100%)',
    bg: 'linear-gradient(135deg, #fdfbfb 0%, #e8f8f5 40%, #ebf5fb 100%)',
    textMain: '#000000', cardBg: '#ffffff',
    effetto: null
  },
  'natale': {
    p: '#e74c3c', pd: '#922b21', pl: '#fadbd8',
    pg: 'linear-gradient(135deg, #f1948a 0%, #e74c3c 50%, #922b21 100%)',
    bg: 'linear-gradient(135deg, #fdfbfb 0%, #fadbd8 40%, #fef9e7 100%)',
    textMain: '#000000', cardBg: '#ffffff',
    effetto: 'neve'
  },
  'carnevale': {
    p: '#af7ac5', pd: '#6c3483', pl: '#e8daef',
    pg: 'linear-gradient(135deg, #d2b4de 0%, #af7ac5 50%, #6c3483 100%)',
    bg: 'linear-gradient(135deg, #fdfbfb 0%, #e8daef 40%, #f4ecf7 100%)',
    textMain: '#000000', cardBg: '#ffffff',
    effetto: 'coriandoli'
  },
  'inverno': {
    p: '#5d6d7e', pd: '#1c2833', pl: '#eaeded',
    pg: 'linear-gradient(135deg, #aab7b8 0%, #5d6d7e 50%, #1c2833 100%)',
    bg: 'linear-gradient(135deg, #fdfbfb 0%, #eaeded 40%, #f2f3f4 100%)',
    textMain: '#000000', cardBg: '#ffffff',
    effetto: null
  },
  'pasqua': {
    p: '#f1948a', pd: '#c0392b', pl: '#fadbd8',
    pg: 'linear-gradient(135deg, #f9e79f 0%, #f1948a 50%, #c0392b 100%)',
    bg: 'linear-gradient(135deg, #fdfbfb 0%, #fdebd0 40%, #fadbd8 100%)',
    textMain: '#000000', cardBg: '#ffffff',
    effetto: null
  },
  'estate': {
    p: '#5dade2', pd: '#1a5276', pl: '#d6eaf8',
    pg: 'linear-gradient(135deg, #f9e79f 0%, #5dade2 50%, #1a5276 100%)',
    bg: 'linear-gradient(135deg, #fdfbfb 0%, #d6eaf8 40%, #fef9e7 100%)',
    textMain: '#000000', cardBg: '#ffffff',
    effetto: null
  },
  'halloween': {
    p: '#f39c12', pd: '#7d6608', pl: '#fdebd0',
    pg: 'linear-gradient(135deg, #f39c12 0%, #e67e22 50%, #1c2833 100%)',
    bg: 'linear-gradient(135deg, #fdfbfb 0%, #fdebd0 40%, #fef9e7 100%)',
    textMain: '#000000', cardBg: '#ffffff',
    effetto: null
  },
  'san_valentino': {
    p: '#e91e63', pd: '#880e4f', pl: '#fce4ec',
    pg: 'linear-gradient(135deg, #f48fb1 0%, #e91e63 50%, #880e4f 100%)',
    bg: 'linear-gradient(135deg, #fdfbfb 0%, #fce4ec 40%, #f8bbd0 100%)',
    textMain: '#000000', cardBg: '#ffffff',
    effetto: null
  },
  'arancio': {
    p: '#f39c12', pd: '#d35400', pl: '#fdebd0',
    pg: 'linear-gradient(135deg, #f1c40f 0%, #f39c12 50%, #d35400 100%)',
    bg: 'linear-gradient(135deg, #fdfbfb 0%, #fdebd0 40%, #fef9e7 100%)',
    textMain: '#000000', cardBg: '#ffffff',
    effetto: null
  },
  'elegante_beige': {
    p: '#8b7355', pd: '#5d4e37', pl: '#f5f0e8',
    pg: 'linear-gradient(135deg, #d4c4b0 0%, #b8a898 50%, #8b7355 100%)',
    bg: 'linear-gradient(135deg, #faf8f5 0%, #f0ebe3 40%, #e8e0d5 100%)',
    textMain: '#000000', cardBg: '#ffffff',
    effetto: null
  },
  'notte_arancio': {
    p: '#ff6b35', pd: '#c9451a', pl: '#ffe8e0',
    pg: 'linear-gradient(135deg, #ff8c5a 0%, #ff6b35 50%, #c9451a 100%)',
    bg: 'linear-gradient(135deg, #fdfbfb 0%, #ffe8e0 40%, #fef9e7 100%)',
    textMain: '#000000', cardBg: '#ffffff',
    effetto: null
  },
  'caldo_professionale': {
    p: '#e67e50', pd: '#a04020', pl: '#ffece4',
    pg: 'linear-gradient(135deg, #f4a47a 0%, #e67e50 50%, #a04020 100%)',
    bg: 'linear-gradient(135deg, #fdfbfb 0%, #ffece4 40%, #fef9e7 100%)',
    textMain: '#000000', cardBg: '#ffffff',
    effetto: null
  },
  'minimal_luxury': {
    p: '#c9a87c', pd: '#8b7355', pl: '#faf8f4',
    pg: 'linear-gradient(135deg, #e8d5b7 0%, #d4c4a8 50%, #b8a888 100%)',
    bg: 'linear-gradient(135deg, #ffffff 0%, #f8f6f2 40%, #f0ebe3 100%)',
    textMain: '#000000', cardBg: '#ffffff',
    effetto: null
  },
  'tramonto_moderno': {
    p: '#ff512f', pd: '#c93820', pl: '#ffe5e0',
    pg: 'linear-gradient(135deg, #ff7e5f 0%, #ff512f 50%, #dd2476 100%)',
    bg: 'linear-gradient(135deg, #fdfbfb 0%, #ffe5e0 40%, #fef9e7 100%)',
    textMain: '#000000', cardBg: '#ffffff',
    effetto: null
  },
  'oro_nero': {
    p: '#d4af37', pd: '#996515', pl: '#fff9e6',
    pg: 'linear-gradient(135deg, #f4d03f 0%, #d4af37 50%, #996515 100%)',
    bg: 'linear-gradient(135deg, #fdfbfb 0%, #fff9e6 40%, #fef9e7 100%)',
    textMain: '#000000', cardBg: '#ffffff',
    effetto: null
  },
  'ardesia_elegante': {
    p: '#6c7a89', pd: '#34495e', pl: '#e8ecef',
    pg: 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 50%, #5d6d7e 100%)',
    bg: 'linear-gradient(135deg, #fdfbfb 0%, #e8ecef 40%, #f2f3f4 100%)',
    textMain: '#000000', cardBg: '#ffffff',
    effetto: null
  },
  'corallo_professional': {
    p: '#ff6b6b', pd: '#c94545', pl: '#ffe8e8',
    pg: 'linear-gradient(135deg, #ff8e8e 0%, #ff6b6b 50%, #ee5a5a 100%)',
    bg: 'linear-gradient(135deg, #fdfbfb 0%, #ffe8e8 40%, #fef9e7 100%)',
    textMain: '#000000', cardBg: '#ffffff',
    effetto: null
  },
  'bronzo_scuro': {
    p: '#cd7f32', pd: '#8b4513', pl: '#f5ebe0',
    pg: 'linear-gradient(135deg, #e8a86a 0%, #cd7f32 50%, #8b4513 100%)',
    bg: 'linear-gradient(135deg, #fdfbfb 0%, #f5ebe0 40%, #fef9e7 100%)',
    textMain: '#000000', cardBg: '#ffffff',
    effetto: null
  },
  'platino': {
    p: '#9e9e9e', pd: '#616161', pl: '#f5f5f5',
    pg: 'linear-gradient(135deg, #bdbdbd 0%, #9e9e9e 50%, #757575 100%)',
    bg: 'linear-gradient(135deg, #fdfbfb 0%, #f5f5f5 40%, #fef9e7 100%)',
    textMain: '#000000', cardBg: '#ffffff',
    effetto: null
  },
  'lavanda_professional': {
    p: '#9b7cb6', pd: '#6c5b7b', pl: '#f0e8f8',
    pg: 'linear-gradient(135deg, #b8a0d4 0%, #9b7cb6 50%, #7d5f99 100%)',
    bg: 'linear-gradient(135deg, #fdfbfb 0%, #f0e8f8 40%, #f4ecf7 100%)',
    textMain: '#000000', cardBg: '#ffffff',
    effetto: null
  },
  'rame_caldo': {
    p: '#b87333', pd: '#8b4513', pl: '#fff0e6',
    pg: 'linear-gradient(135deg, #d4945a 0%, #b87333 50%, #8b4513 100%)',
    bg: 'linear-gradient(135deg, #fdfbfb 0%, #fff0e6 40%, #fef9e7 100%)',
    textMain: '#000000', cardBg: '#ffffff',
    effetto: null
  }
};

// ============================================
// FUNZIONE PRINCIPALE
// ============================================
async function applicaTemaAutomatico() {
  var urlParams = new URLSearchParams(window.location.search);
  var token = urlParams.get('token');
  if (!token) return;
  try {
    var response = await fetch(WORKER_URL + '/api/auth/verifica?token=' + encodeURIComponent(token));
    var data = await response.json();
    if (!data.success || !data.user || !data.user.id) return;
    var studioId = data.user.id;
    var temaResponse = await fetch(WORKER_URL + '/api/studio/tema?studioId=' + encodeURIComponent(studioId) + '&token=' + encodeURIComponent(token));
    var temaData = await temaResponse.json();
    if (temaData.success && temaData.tema && temaData.tema.tema_attivo) {
      var temaId = temaData.tema.tema_attivo;
      var tema = TEMAS[temaId] || TEMAS['default'];
      var root = document.documentElement;
      root.style.setProperty('--primary', tema.p, 'important');
      root.style.setProperty('--primary-dark', tema.pd, 'important');
      root.style.setProperty('--primary-light', tema.pl, 'important');
      root.style.setProperty('--primary-gradient', tema.pg, 'important');
      root.style.setProperty('--bg-gradient', tema.bg, 'important');
      root.style.setProperty('--text-main', tema.textMain, 'important');
      root.style.setProperty('--card-bg', tema.cardBg, 'important');
      iniettaCSSGlobale(tema);
      aggiornaNomiStudio(data.user.nome || 'Studio');
      if (typeof attivaEffettoSpeciale === 'function') {
        attivaEffettoSpeciale(tema.effetto);
      }
      console.log('[TEMI] Tema "' + temaId + '" applicato');
    }
  } catch (error) {
    console.error('[TEMI] Errore:', error);
  }
}

// ============================================
// INIEZIONE CSS GLOBALE - Testo NERO, Sfondo BIANCO
// ============================================
function iniettaCSSGlobale(tema) {
  var vecchio = document.getElementById('temi-globale-inject');
  if (vecchio) vecchio.remove();
  var css = '';
  css += 'body { background: ' + tema.bg + ' !important; color: #000000 !important; }';
  css += '.studio-name, .studio-id, .page-header h1, .card-title, .module-title, .dash-card .card-title, .section-header span { color: #000000 !important; }';
  css += '.top-bar, .branding-header, .page-header::before, .card::before, .dash-card::before, .section-header { background: ' + tema.pg + ' !important; }';
  css += '.page-header { background: #ffffff !important; }';
  css += '.btn-primary, .btn-success { background: ' + tema.pg + ' !important; color: #ffffff !important; }';
  css += '.btn-outline { color: ' + tema.pd + ' !important; border-color: ' + tema.p + ' !important; }';
  css += '.card, .module-card, .dash-card, .service-item, .gallery-list-item, .order-item, .payment-card, .stat-card, .email-item, .template-card { background: #ffffff !important; color: #000000 !important; border-color: ' + tema.pl + ' !important; }';
  css += '.module-card:hover, .dash-card:hover, .card:hover { border-color: ' + tema.p + ' !important; }';
  css += '.module-icon, .module-card::before, .dash-card::before, .card::before { background: ' + tema.pg + ' !important; }';
  css += '.nav-btn { color: ' + tema.pd + ' !important; }';
  css += '.sync-dot { background: ' + tema.p + ' !important; }';
  css += '.form-group label, .form-group input, .form-group select, .form-group textarea { color: #000000 !important; }';
  css += '.form-group input, .form-group select, .form-group textarea { background: #ffffff !important; border-color: ' + tema.pl + ' !important; }';
  css += '.form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: ' + tema.p + ' !important; box-shadow: 0 0 0 3px ' + tema.pl + ' !important; }';
  css += '.badge-alert, .alert-badge { background: ' + tema.pd + ' !important; color: #ffffff !important; }';
  css += '.footer-branding strong { color: ' + tema.pd + ' !important; }';
  css += '.toast { border-left-color: ' + tema.p + ' !important; background: #ffffff !important; color: #000000 !important; }';
  css += '.spinner { border-top-color: ' + tema.p + ' !important; border-color: ' + tema.pl + ' ' + tema.pl + ' ' + tema.p + ' ' + tema.pl + ' !important; }';
  css += '.agenda-time { border-right-color: ' + tema.pl + ' !important; background: #f8f9fa !important; color: #000000 !important; }';
  css += '.agenda-header { border-bottom-color: ' + tema.p + ' !important; }';
  css += '.agenda-container { border-color: ' + tema.pl + ' !important; background: #ffffff !important; }';
  css += '.event-manuale, .event-servizio { background: ' + tema.pl + ' !important; color: ' + tema.pd + ' !important; border-left-color: ' + tema.p + ' !important; }';
  css += '.progress-bar { background: ' + tema.pg + ' !important; }';
  css += '.progress-bar-container { background: ' + tema.pl + ' !important; }';
  css += '.cred-box, .info-box { background: ' + tema.pl + ' !important; border-color: ' + tema.p + ' !important; color: #000000 !important; }';
  css += '.service-price { background: ' + tema.pl + ' !important; color: ' + tema.pd + ' !important; }';
  css += '.service-item { border-left-color: ' + tema.p + ' !important; }';
  css += '.category-title { color: ' + tema.pd + ' !important; }';
  css += '.logo-upload-area { background: ' + tema.pl + ' !important; border-color: ' + tema.pl + ' !important; }';
  css += '.logo-upload-area:hover { border-color: ' + tema.p + ' !important; }';
  css += '.logo-placeholder-icon { color: ' + tema.p + ' !important; }';
  css += '.vetrina-header { background: ' + tema.pg + ' !important; color: #ffffff !important; }';
  css += '.vetrina-header h2, .vetrina-header p { color: #ffffff !important; }';
  css += '.product-card:hover { border-color: ' + tema.p + ' !important; }';
  css += '.product-category, .product-price { color: ' + tema.pd + ' !important; }';
  css += '.payment-card.active { border-color: ' + tema.p + ' !important; background: ' + tema.pl + ' !important; }';
  css += 'input:checked + .slider { background-color: ' + tema.p + ' !important; }';
  css += '.stat-card { border-left-color: ' + tema.p + ' !important; }';
  css += '.stat-number { color: ' + tema.pd + ' !important; }';
  css += '.tab.active { color: ' + tema.pd + ' !important; border-bottom-color: ' + tema.p + ' !important; }';
  css += '.search-result-item:hover { background: ' + tema.pl + ' !important; }';
  css += '.search-result-item strong { color: ' + tema.pd + ' !important; }';
  css += '.modal-title { color: ' + tema.pd + ' !important; }';
  css += '.ricevuta-stampa { border-color: ' + tema.p + ' !important; background: #ffffff !important; }';
  css += '.ricevuta-stampa .ricevuta-studio-nome { background: ' + tema.pg + ' !important; -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important; }';
  css += '.ricevuta-stampa .ricevuta-importo { background: ' + tema.pg + ' !important; }';
  css += '.linea-taglio-stampa { border-top-color: ' + tema.p + ' !important; }';
  css += '.linea-taglio-stampa::after { color: ' + tema.p + ' !important; }';
  css += '.email-item.unread { border-left-color: ' + tema.p + ' !important; background: ' + tema.pl + ' !important; }';
  css += '.template-card:hover { border-color: ' + tema.p + ' !important; }';
  css += '.template-name { color: ' + tema.pd + ' !important; }';
  css += '.gallery-status.status-ready { background: ' + tema.pl + ' !important; color: ' + tema.pd + ' !important; }';
  css += '.gallery-link { background: ' + tema.pl + ' !important; color: ' + tema.pd + ' !important; }';
  css += '.mega-guide { border-color: ' + tema.pl + ' !important; background: ' + tema.pl + ' !important; }';
  css += '.mega-guide h4 { color: ' + tema.pd + ' !important; }';
  css += '.gallery-list-item:hover { border-color: ' + tema.p + ' !important; }';
  css += '.badge-pagato, .badge-ritirato, .badge-lavorazione, .badge-pronto { background: ' + tema.pl + ' !important; color: ' + tema.pd + ' !important; }';
  css += '.order-item { border-left-color: ' + tema.p + ' !important; }';
  css += '.order-code, .order-total { color: ' + tema.pd + ' !important; }';
  css += '.status-completed, .status-progress { background: ' + tema.pl + ' !important; color: ' + tema.pd + ' !important; }';
  css += '.cliente-id { color: ' + tema.pd + ' !important; }';
  css += '.servizio-tipo-btn { background: ' + tema.pg + ' !important; color: #ffffff !important; }';
  css += '.progress-value, .progress-percent { color: ' + tema.pd + ' !important; }';
  css += '.servizio-id { color: ' + tema.pd + ' !important; }';
  css += '.gallery-evento { color: ' + tema.pd + ' !important; }';
  css += '.cart-float-btn { background: ' + tema.pg + ' !important; }';
  css += '.cart-count { background: ' + tema.pd + ' !important; }';
  css += '.cart-footer { background: ' + tema.pl + ' !important; }';
  css += '.cart-item-price, .cart-item-name { color: ' + tema.pd + ' !important; }';
  css += '.totals-box { background: ' + tema.pl + ' !important; }';
  css += '.total-row.final { color: ' + tema.pd + ' !important; border-top-color: ' + tema.pl + ' !important; }';
  css += '.total-row.saldo { background: ' + tema.pl + ' !important; }';
  css += '.badge-accettato { background: ' + tema.pl + ' !important; color: ' + tema.pd + ' !important; }';
  css += '.btn-whatsapp, .btn-danger, .btn-warning, .btn-info { color: #ffffff !important; }';
  css += '.alert-box { border-left-color: ' + tema.pd + ' !important; background: ' + tema.pl + ' !important; }';
  css += '.search-box input:focus { border-color: ' + tema.p + ' !important; }';
  css += '.modal-content { background: #ffffff !important; color: #000000 !important; }';
  css += '.modal-header { border-bottom-color: ' + tema.pl + ' !important; }';
  css += '.modal-header h2 { color: ' + tema.pd + ' !important; }';
  css += '.close-modal { color: #000000 !important; }';
  css += '.tab-content.active { display: block !important; }';
  css += '.tabs { border-bottom-color: ' + tema.pl + ' !important; }';
  css += '.tab:hover { color: ' + tema.pd + ' !important; }';
  css += '.studio-info { background: ' + tema.pl + ' !important; border-left-color: ' + tema.p + ' !important; }';
  css += '.agenda-totale { background: ' + tema.pl + ' !important; color: ' + tema.pd + ' !important; }';
  css += '.agenda-data-titolo { color: ' + tema.pd + ' !important; }';
  css += '.card-subtitle { color: #000000 !important; opacity: 0.8 !important; }';
  css += '.info-box strong { color: ' + tema.pd + ' !important; }';
  css += '.ricevuta-stampa .ricevuta-numero { border-color: ' + tema.p + ' !important; background: ' + tema.pl + ' !important; }';
  css += '.ricevuta-stampa .ricevuta-numero-valore, .ricevuta-stampa .ricevuta-importo-label, .ricevuta-stampa .ricevuta-importo-valore { color: ' + tema.pd + ' !important; }';
  css += '.ricevuta-stampa .ricevuta-data, .ricevuta-stampa .ricevuta-riga { background: #ffffff !important; }';
  css += '.ricevuta-stampa .ricevuta-header, .ricevuta-stampa .ricevuta-footer { border-bottom-color: ' + tema.pl + ' !important; border-top-color: ' + tema.pl + ' !important; }';
  css += '.ricevuta-stampa .ricevuta-firma-linea { color: #000000 !important; }';
  css += '.payment-title { color: ' + tema.pd + ' !important; }';
  css += '.form-group label .required { color: #e74c3c !important; }';
  css += '.card-title, .category-title { border-bottom-color: ' + tema.pl + ' !important; }';
  css += '.search-result-item { border-bottom-color: ' + tema.pl + ' !important; }';
  css += '.task-row { border-bottom-color: ' + tema.pl + ' !important; }';
  css += '.section-header { background: ' + tema.pg + ' !important; color: #ffffff !important; }';
  css += '.section-progress { background: rgba(255,255,255,0.3) !important; }';
  css += '.servizio-card::before { background: ' + tema.pg + ' !important; }';
  css += '.servizio-card:hover { border-color: ' + tema.p + ' !important; }';
  css += '.progress-label { color: ' + tema.pd + ' !important; }';
  css += '.task-completed .task-label { color: #000000 !important; opacity: 0.6 !important; }';
  css += '.empty-state, .loading { color: #000000 !important; }';
  css += '.footer-branding { color: #000000 !important; }';
  css += '.toast-container .toast { border-left-color: ' + tema.p + ' !important; }';
  css += '.toast.error { border-left-color: #e74c3c !important; }';
  css += '.order-product { border-bottom-color: ' + tema.pl + ' !important; }';
  css += '.payment-card { border-color: ' + tema.pl + ' !important; background: #ffffff !important; }';
  css += '.payment-card.active { border-color: ' + tema.p + ' !important; background: ' + tema.pl + ' !important; }';
  css += '.slider { background-color: ' + tema.pl + ' !important; }';
  css += 'input:checked + .slider { background-color: ' + tema.p + ' !important; }';
  css += '.product-image { background: ' + tema.pl + ' !important; }';
  css += '.product-card { border-color: ' + tema.pl + ' !important; background: #ffffff !important; }';
  css += '.product-card:hover { border-color: ' + tema.p + ' !important; box-shadow: 0 12px 24px ' + tema.pl + ' !important; }';
  css += '.cart-sidebar { box-shadow: -4px 0 20px ' + tema.pl + ' !important; background: #ffffff !important; }';
  css += '.cart-header { border-bottom-color: ' + tema.pl + ' !important; }';
  css += '.cart-item { background: ' + tema.pl + ' !important; }';
  css += '.cart-item-remove { background: ' + tema.pd + ' !important; }';
  css += '.branding-header { background: ' + tema.pg + ' !important; }';
  css += '.top-bar { background: ' + tema.pg + ' !important; }';
  css += '.page-header { background: #ffffff !important; box-shadow: 0 10px 30px ' + tema.pl + ' !important; }';
  css += '.card, .module-card, .dash-card { background: #ffffff !important; box-shadow: 0 10px 30px ' + tema.pl + ' !important; }';
  css += '.module-card:hover, .dash-card:hover { box-shadow: 0 16px 40px ' + tema.pl + ' !important; border-color: ' + tema.p + ' !important; }';
  css += '.studio-info { background: ' + tema.pl + ' !important; border-left-color: ' + tema.p + ' !important; }';
  css += '.nav-btn { color: ' + tema.pd + ' !important; }';
  css += '.sync-status { color: #ffffff !important; }';
  css += '.agenda-grid { border-color: ' + tema.pl + ' !important; }';
  css += '.agenda-row { border-bottom-color: ' + tema.pl + ' !important; }';
  css += '.event-badge { background: ' + tema.pl + ' !important; color: ' + tema.pd + ' !important; }';
  css += '.btn-delete-event { color: #e74c3c !important; }';
  css += '.service-name, .service-category { color: #000000 !important; }';
  css += '.category-section { border-bottom-color: ' + tema.pl + ' !important; }';
  css += '.modal-overlay { background: rgba(0,0,0,0.6) !important; }';
  css += '.search-box input { border-color: ' + tema.pl + ' !important; background: #ffffff !important; color: #000000 !important; }';
  css += '.cred-box .label, .cred-box .value { color: ' + tema.pd + ' !important; }';
  css += 'table th { background: ' + tema.p + ' !important; color: #ffffff !important; font-weight: 700 !important; text-shadow: 0 1px 2px rgba(0,0,0,0.3) !important; padding: 12px 8px !important; }';
  css += 'table td { color: #000000 !important; padding: 10px 8px !important; border-bottom: 1px solid ' + tema.pl + ' !important; }';
  css += 'table tr { background: #ffffff !important; }';
  css += 'table tr:hover td { background: ' + tema.pl + ' !important; }';
  css += 'table input, table select, table textarea { background: #ffffff !important; color: #000000 !important; border: 1px solid ' + tema.pl + ' !important; padding: 6px 8px !important; border-radius: 4px !important; }';
  css += 'table input::placeholder, table textarea::placeholder { color: #666666 !important; opacity: 0.8 !important; }';
  css += 'table input[type="text"], table input[type="email"], table input[type="tel"], table input[type="password"] { background: #ffffff !important; color: #000000 !important; }';
  css += 'table td input { min-width: 100px !important; }';
  css += 'table tr:nth-child(even) td { background: #f8f9fa !important; }';
  css += 'thead th { background: ' + tema.p + ' !important; color: #ffffff !important; }';
  css += 'tr:first-child td, tr:first-child th { background: ' + tema.p + ' !important; color: #ffffff !important; }';
  css += '.email-item { border-left-color: ' + tema.pl + ' !important; background: #ffffff !important; }';
  css += '.email-subject, .email-to { color: ' + tema.pd + ' !important; }';
  css += '.email-body { background: ' + tema.pl + ' !important; color: #000000 !important; }';
  css += '.template-card { border-color: ' + tema.pl + ' !important; background: #ffffff !important; }';
  css += '.template-desc { color: #000000 !important; opacity: 0.8 !important; }';
  css += '.gallery-nomi { color: #000000 !important; }';
  css += '.gallery-credentials { background: ' + tema.pl + ' !important; color: #000000 !important; }';
  css += '.mega-guide ol { color: #000000 !important; }';
  css += '.stat-label { color: #000000 !important; opacity: 0.8 !important; }';
  css += '.badge-attesa { background: ' + tema.pl + ' !important; color: ' + tema.pd + ' !important; }';
  css += '.task-label { color: #000000 !important; }';
  css += '.overall-progress { background: #ffffff !important; }';
  css += '.workflow-section { box-shadow: 0 4px 12px ' + tema.pl + ' !important; }';
  css += '.btn-sm { color: ' + tema.pd + ' !important; }';
  css += '.btn-sm.btn-outline { border-color: ' + tema.p + ' !important; color: ' + tema.pd + ' !important; }';
  css += '.btn-sm.btn-danger, .btn-sm.btn-warning, .btn-sm.btn-info, .btn-sm.btn-success, .btn-sm.btn-primary { color: #ffffff !important; }';

  var style = document.createElement('style');
  style.id = 'temi-globale-inject';
  style.textContent = css;
  document.head.appendChild(style);
}

function aggiornaNomiStudio(nomeStudio) {
  document.querySelectorAll('.studio-nome').forEach(function(el) {
    el.textContent = nomeStudio;
  });
}

function attivaEffettoSpeciale(tipo) {
  document.querySelectorAll('.effetto-speciale').forEach(function(el) { el.remove(); });
  if (tipo === 'neve') creaEffettoNeve();
  else if (tipo === 'coriandoli') creaEffettoCoriandoli();
}

function creaEffettoNeve() {
  var container = document.createElement('div');
  container.className = 'effetto-speciale';
  container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:hidden;';
  for (var i = 0; i < 50; i++) {
    var fiocco = document.createElement('div');
    fiocco.style.cssText = 'position:absolute;width:' + (Math.random()*5+2) + 'px;height:' + (Math.random()*5+2) + 'px;background:rgba(255,255,255,0.8);border-radius:50%;left:' + (Math.random()*100) + '%;animation:neve ' + (Math.random()*5+5) + 's linear infinite;animation-delay:' + (Math.random()*5) + 's;';
    container.appendChild(fiocco);
  }
  document.body.appendChild(container);
  var style = document.createElement('style');
  style.textContent = '@keyframes neve{0%{transform:translateY(-100vh) rotate(0deg);opacity:1}100%{transform:translateY(100vh) rotate(360deg);opacity:0.3}}';
  document.head.appendChild(style);
}

function creaEffettoCoriandoli() {
  var container = document.createElement('div');
  container.className = 'effetto-speciale';
  container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:hidden;';
  var colori = ['#f39c12','#e74c3c','#3498db','#2ecc71','#9b59b6','#1abc9c'];
  for (var i = 0; i < 40; i++) {
    var coriandolo = document.createElement('div');
    var colore = colori[Math.floor(Math.random()*colori.length)];
    coriandolo.style.cssText = 'position:absolute;width:' + (Math.random()*8+4) + 'px;height:' + (Math.random()*8+4) + 'px;background:' + colore + ';left:' + (Math.random()*100) + '%;animation:coriandoli ' + (Math.random()*4+3) + 's ease-in infinite;animation-delay:' + (Math.random()*3) + 's;';
    container.appendChild(coriandolo);
  }
  document.body.appendChild(container);
  var style = document.createElement('style');
  style.textContent = '@keyframes coriandoli{0%{transform:translateY(-100vh) rotate(0deg);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}';
  document.head.appendChild(style);
}

// ============================================
// ESECUZIONE AUTOMATICA
// ============================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', applicaTemaAutomatico);
} else {
  setTimeout(applicaTemaAutomatico, 100);
}

// ============================================
// ESPORTAZIONI GLOBALI
// ============================================
if (typeof window !== 'undefined') {
  window.TEMAS = TEMAS;
  window.applicaTemaAutomatico = applicaTemaAutomatico;
  window.caricaTemaGlobale = applicaTemaAutomatico;
  window.attivaEffettoSpeciale = attivaEffettoSpeciale;
}
