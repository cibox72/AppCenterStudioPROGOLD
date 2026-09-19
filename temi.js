// ============================================
// VARIABILE GLOBALE WORKER_URL
// ============================================
var WORKER_URL = "https://appcenter-backend.mairaluigi-b2f.workers.dev";

// ============================================
// SISTEMA TEMI GLOBALI - AppCenterStudioPROGOLD
// ============================================

const TEMAS = {
    'default': { 
        p: '#82e0aa', pd: '#1e8449', pl: '#e8f8f5', 
        pg: 'linear-gradient(135deg, #a9dfbf 0%, #82e0aa 50%, #1e8449 100%)', 
        bg: 'linear-gradient(135deg, #fdfbfb 0%, #e8f8f5 40%, #ebf5fb 100%)', 
        effetto: null 
    },
    'natale': { 
        p: '#e74c3c', pd: '#922b21', pl: '#fadbd8', 
        pg: 'linear-gradient(135deg, #f1948a 0%, #e74c3c 50%, #922b21 100%)', 
        bg: 'linear-gradient(135deg, #fdfbfb 0%, #fadbd8 40%, #fef9e7 100%)', 
        effetto: 'neve' 
    },
    'carnevale': { 
        p: '#af7ac5', pd: '#6c3483', pl: '#e8daef', 
        pg: 'linear-gradient(135deg, #d2b4de 0%, #af7ac5 50%, #6c3483 100%)', 
        bg: 'linear-gradient(135deg, #fdfbfb 0%, #e8daef 40%, #f4ecf7 100%)', 
        effetto: 'coriandoli' 
    },
    'inverno': { 
        p: '#5d6d7e', pd: '#1c2833', pl: '#eaeded', 
        pg: 'linear-gradient(135deg, #aab7b8 0%, #5d6d7e 50%, #1c2833 100%)', 
        bg: 'linear-gradient(135deg, #fdfbfb 0%, #eaeded 40%, #f2f3f4 100%)', 
        effetto: null 
    },
    'pasqua': { 
        p: '#f1948a', pd: '#c0392b', pl: '#fadbd8', 
        pg: 'linear-gradient(135deg, #f9e79f 0%, #f1948a 50%, #c0392b 100%)', 
        bg: 'linear-gradient(135deg, #fdfbfb 0%, #fdebd0 40%, #fadbd8 100%)', 
        effetto: null 
    },
    'estate': { 
        p: '#5dade2', pd: '#1a5276', pl: '#d6eaf8', 
        pg: 'linear-gradient(135deg, #f9e79f 0%, #5dade2 50%, #1a5276 100%)', 
        bg: 'linear-gradient(135deg, #fdfbfb 0%, #d6eaf8 40%, #fef9e7 100%)', 
        effetto: null 
    },
    'halloween': { 
        p: '#f39c12', pd: '#7d6608', pl: '#fdebd0', 
        pg: 'linear-gradient(135deg, #f39c12 0%, #e67e22 50%, #1c2833 100%)', 
        bg: 'linear-gradient(135deg, #1c2833 0%, #2c3e50 40%, #fdebd0 100%)', 
        effetto: null 
    },
    'san_valentino': { 
        p: '#e91e63', pd: '#880e4f', pl: '#fce4ec', 
        pg: 'linear-gradient(135deg, #f48fb1 0%, #e91e63 50%, #880e4f 100%)', 
        bg: 'linear-gradient(135deg, #fdfbfb 0%, #fce4ec 40%, #f8bbd0 100%)', 
        effetto: null 
    },
    'arancio': { 
        p: '#f39c12', pd: '#d35400', pl: '#fdebd0', 
        pg: 'linear-gradient(135deg, #f1c40f 0%, #f39c12 50%, #d35400 100%)', 
        bg: 'linear-gradient(135deg, #fdfbfb 0%, #fdebd0 40%, #fef9e7 100%)', 
        effetto: null 
    },
    'elegante_beige': { 
        p: '#8b7355', pd: '#5d4e37', pl: '#f5f0e8', 
        pg: 'linear-gradient(135deg, #d4c4b0 0%, #b8a898 50%, #8b7355 100%)', 
        bg: 'linear-gradient(135deg, #faf8f5 0%, #f0ebe3 40%, #e8e0d5 100%)', 
        effetto: null 
    },
    'notte_arancio': { 
        p: '#ff6b35', pd: '#c9451a', pl: '#ffe8e0', 
        pg: 'linear-gradient(135deg, #ff8c5a 0%, #ff6b35 50%, #c9451a 100%)', 
        bg: 'linear-gradient(135deg, #0a0a0a 0%, #1a0f0a 40%, #2e1a0f 100%)', 
        effetto: null 
    },
    'caldo_professionale': { 
        p: '#e67e50', pd: '#a04020', pl: '#ffece4', 
        pg: 'linear-gradient(135deg, #f4a47a 0%, #e67e50 50%, #a04020 100%)', 
        bg: 'linear-gradient(135deg, #1c1410 0%, #2a1f1a 40%, #3d2820 100%)', 
        effetto: null 
    },
    'minimal_luxury': { 
        p: '#c9a87c', pd: '#8b7355', pl: '#faf8f4', 
        pg: 'linear-gradient(135deg, #e8d5b7 0%, #d4c4a8 50%, #b8a888 100%)', 
        bg: 'linear-gradient(135deg, #ffffff 0%, #f8f6f2 40%, #f0ebe3 100%)', 
        effetto: null 
    },
    'tramonto_moderno': { 
        p: '#ff512f', pd: '#c93820', pl: '#ffe5e0', 
        pg: 'linear-gradient(135deg, #ff7e5f 0%, #ff512f 50%, #dd2476 100%)', 
        bg: 'linear-gradient(135deg, #0f0c0a 0%, #1a1210 40%, #2e1a15 100%)', 
        effetto: null 
    },
    'oro_nero': { 
        p: '#d4af37', pd: '#996515', pl: '#fff9e6', 
        pg: 'linear-gradient(135deg, #f4d03f 0%, #d4af37 50%, #996515 100%)', 
        bg: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 40%, #2a2a2a 100%)', 
        effetto: null 
    },
    'ardesia_elegante': { 
        p: '#6c7a89', pd: '#34495e', pl: '#e8ecef', 
        pg: 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 50%, #5d6d7e 100%)', 
        bg: 'linear-gradient(135deg, #1a1f2e 0%, #242b3a 40%, #2e3748 100%)', 
        effetto: null 
    },
    'corallo_professional': { 
        p: '#ff6b6b', pd: '#c94545', pl: '#ffe8e8', 
        pg: 'linear-gradient(135deg, #ff8e8e 0%, #ff6b6b 50%, #ee5a5a 100%)', 
        bg: 'linear-gradient(135deg, #fafafa 0%, #f5f0f0 40%, #ebe5e5 100%)', 
        effetto: null 
    },
    'bronzo_scuro': { 
        p: '#cd7f32', pd: '#8b4513', pl: '#f5ebe0', 
        pg: 'linear-gradient(135deg, #e8a86a 0%, #cd7f32 50%, #8b4513 100%)', 
        bg: 'linear-gradient(135deg, #0f0e0d 0%, #1a1614 40%, #2a2218 100%)', 
        effetto: null 
    },
    'platino': { 
        p: '#9e9e9e', pd: '#616161', pl: '#f5f5f5', 
        pg: 'linear-gradient(135deg, #bdbdbd 0%, #9e9e9e 50%, #757575 100%)', 
        bg: 'linear-gradient(135deg, #121212 0%, #1e1e1e 40%, #2a2a2a 100%)', 
        effetto: null 
    },
    'lavanda_professional': { 
        p: '#9b7cb6', pd: '#6c5b7b', pl: '#f0e8f8', 
        pg: 'linear-gradient(135deg, #b8a0d4 0%, #9b7cb6 50%, #7d5f99 100%)', 
        bg: 'linear-gradient(135deg, #f8f6fc 0%, #f0ecf5 40%, #e8e0f0 100%)', 
        effetto: null 
    },
    'rame_caldo': { 
        p: '#b87333', pd: '#8b4513', pl: '#fff0e6', 
        pg: 'linear-gradient(135deg, #d4945a 0%, #b87333 50%, #8b4513 100%)', 
        bg: 'linear-gradient(135deg, #1a1410 0%, #2a1f18 40%, #3d2a1f 100%)', 
        effetto: null 
    }
};

// ============================================
// FUNZIONE PRINCIPALE
// ============================================

async function applicaTemaAutomatico() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (!token) return;
    
    try {
        const response = await fetch(`${WORKER_URL}/api/auth/verifica?token=${encodeURIComponent(token)}`);
        const data = await response.json();
        if (!data.success || !data.user || !data.user.id) return;
        
        const studioId = data.user.id;
        const temaResponse = await fetch(`${WORKER_URL}/api/studio/tema?studioId=${encodeURIComponent(studioId)}&token=${encodeURIComponent(token)}`);
        const temaData = await temaResponse.json();
        
        if (temaData.success && temaData.tema && temaData.tema.tema_attivo) {
            const temaId = temaData.tema.tema_attivo;
            const tema = TEMAS[temaId] || TEMAS['default'];
            
            // 1. Applica variabili CSS
            const root = document.documentElement;
            root.style.setProperty('--primary', tema.p, 'important');
            root.style.setProperty('--primary-dark', tema.pd, 'important');
            root.style.setProperty('--primary-light', tema.pl, 'important');
            root.style.setProperty('--primary-gradient', tema.pg, 'important');
            root.style.setProperty('--bg-gradient', tema.bg, 'important');
            
            // 2. INIETTA CSS con !important per sovrascrivere TUTTO
            iniettaCSSGlobale(tema);
            
            // 3. Aggiorna nomi studio
            aggiornaNomiStudio(data.user.nome || 'Studio');
            
            // 4. Effetti speciali
            if (typeof attivaEffettoSpeciale === 'function') {
                attivaEffettoSpeciale(tema.effetto);
            }
            
            console.log(`[TEMI] Tema "${temaId}" applicato a ${window.location.pathname}`);
        }
    } catch (error) {
        console.error('[TEMI] Errore:', error);
    }
}

// ============================================
// INIEZIONE CSS GLOBALE CON !IMPORTANT
// ============================================

function iniettaCSSGlobale(tema) {
    // Rimuovi CSS precedente se esiste
    const vecchio = document.getElementById('temi-globale-inject');
    if (vecchio) vecchio.remove();
    
    const css = `
        #temi-globale-inject + * { /* placeholder */ }
        
        body {
            background: ${tema.bg} !important;
        }
        
        .top-bar, .branding-header, .page-header::before,
        .card::before, .card-3d::before, .module-card::before,
        .dash-card::before, .section-header {
            background: ${tema.pg} !important;
        }
        
        .page-header {
            background: rgba(255,255,255,0.95) !important;
        }
        
        .page-header h1 {
            background: ${tema.pg} !important;
            -webkit-background-clip: text !important;
            -webkit-text-fill-color: transparent !important;
            background-clip: text !important;
        }
        
        .btn-primary, .btn-success {
            background: ${tema.pg} !important;
            color: white !important;
        }
        
        .btn-outline {
            color: ${tema.pd} !important;
            border-color: ${tema.p} !important;
        }
        
        .card-title, .module-title, .dash-card .card-title,
        .card-3d .card-title, .section-header span {
            color: ${tema.pd} !important;
        }
        
        .card, .module-card, .dash-card, .card-3d,
        .service-item, .gallery-list-item, .order-item,
        .payment-card, .stat-card {
            border-color: ${tema.pl} !important;
        }
        
        .module-card:hover, .dash-card:hover, .card:hover {
            border-color: ${tema.p} !important;
        }
        
        .module-icon, .module-card::before, .dash-card::before,
        .card-3d::before, .card::before {
            background: ${tema.pg} !important;
        }
        
        .studio-name, .studio-id {
            color: ${tema.pd} !important;
        }
        
        .nav-btn {
            color: ${tema.pd} !important;
        }
        
        .sync-dot {
            background: ${tema.p} !important;
        }
        
        .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
            border-color: ${tema.p} !important;
            box-shadow: 0 0 0 3px ${tema.pl} !important;
        }
        
        .badge-alert, .alert-badge {
            background: ${tema.pd} !important;
        }
        
        .footer-branding strong {
            color: ${tema.pd} !important;
        }
        
        .toast {
            border-left-color: ${tema.p} !important;
        }
        
        .spinner {
            border-top-color: ${tema.p} !important;
            border-color: ${tema.pl} ${tema.pl} ${tema.p} ${tema.pl} !important;
        }
        
        .agenda-time {
            border-right-color: ${tema.pl} !important;
        }
        
        .agenda-header {
            border-bottom-color: ${tema.p} !important;
        }
        
        .agenda-container {
            border-color: ${tema.pl} !important;
        }
        
        .event-manuale {
            background: ${tema.pl} !important;
            color: ${tema.pd} !important;
            border-left-color: ${tema.p} !important;
        }
        
        .event-servizio {
            background: ${tema.pl} !important;
            color: ${tema.pd} !important;
            border-left-color: ${tema.p} !important;
        }
        
        .progress-bar {
            background: ${tema.pg} !important;
        }
        
        .progress-bar-container {
            background: ${tema.pl} !important;
        }
        
        .cred-box, .info-box {
            background: ${tema.pl} !important;
            border-color: ${tema.p} !important;
        }
        
        .service-price {
            background: ${tema.pl} !important;
            color: ${tema.pd} !important;
        }
        
        .service-item {
            border-left-color: ${tema.p} !important;
        }
        
        .category-title {
            color: ${tema.pd} !important;
        }
        
        .logo-upload-area {
            background: ${tema.pl} !important;
            border-color: ${tema.pl} !important;
        }
        
        .logo-upload-area:hover {
            border-color: ${tema.p} !important;
        }
        
        .logo-placeholder-icon {
            color: ${tema.p} !important;
        }
        
        .vetrina-header {
            background: ${tema.pg} !important;
        }
        
        .product-card:hover {
            border-color: ${tema.p} !important;
        }
        
        .product-category, .product-price {
            color: ${tema.pd} !important;
        }
        
        .payment-card.active {
            border-color: ${tema.p} !important;
            background: ${tema.pl} !important;
        }
        
        input:checked + .slider {
            background-color: ${tema.p} !important;
        }
        
        .stat-card {
            border-left-color: ${tema.p} !important;
        }
        
        .stat-number {
            color: ${tema.pd} !important;
        }
        
        .tab.active {
            color: ${tema.pd} !important;
            border-bottom-color: ${tema.p} !important;
        }
        
        .search-result-item:hover {
            background: ${tema.pl} !important;
        }
        
        .search-result-item strong {
            color: ${tema.pd} !important;
        }
        
        .modal-title {
            color: ${tema.pd} !important;
        }
        
        .ricevuta-stampa::before {
            background: ${tema.pg} !important;
        }
        
        .ricevuta-stampa {
            border-color: ${tema.p} !important;
        }
        
        .ricevuta-stampa .ricevuta-studio-nome {
            background: ${tema.pg} !important;
            -webkit-background-clip: text !important;
            -webkit-text-fill-color: transparent !important;
        }
        
        .ricevuta-stampa .ricevuta-importo {
            background: ${tema.pg} !important;
        }
        
        .linea-taglio-stampa {
            border-top-color: ${tema.p} !important;
        }
        
        .linea-taglio-stampa::after {
            color: ${tema.p} !important;
        }
        
        .email-item.unread {
            border-left-color: ${tema.p} !important;
            background: ${tema.pl} !important;
        }
        
        .template-card:hover {
            border-color: ${tema.p} !important;
        }
        
        .template-name {
            color: ${tema.pd} !important;
        }
        
        .gallery-status.status-ready {
            background: ${tema.pl} !important;
            color: ${tema.pd} !important;
        }
        
        .gallery-link {
            background: ${tema.pl} !important;
            color: ${tema.pd} !important;
        }
        
        .mega-guide {
            border-color: ${tema.pl} !important;
        }
        
        .mega-guide h4 {
            color: ${tema.pd} !important;
        }
        
        .gallery-list-item:hover {
            border-color: ${tema.p} !important;
        }
        
        .badge-pagato, .badge-ritirato {
            background: ${tema.pl} !important;
            color: ${tema.pd} !important;
        }
        
        .badge-lavorazione {
            background: ${tema.pl} !important;
            color: ${tema.pd} !important;
        }
        
        .badge-pronto {
            background: ${tema.pl} !important;
            color: ${tema.pd} !important;
        }
        
        .order-item {
            border-left-color: ${tema.p} !important;
        }
        
        .order-code, .order-total {
            color: ${tema.pd} !important;
        }
        
        .status-completed {
            background: ${tema.pl} !important;
            color: ${tema.pd} !important;
        }
        
        .status-progress {
            background: ${tema.pl} !important;
            color: ${tema.pd} !important;
        }
        
        .cliente-id {
            color: ${tema.pd} !important;
        }
        
        .servizio-tipo-btn {
            background: ${tema.pg} !important;
        }
        
        .progress-value {
            color: ${tema.pd} !important;
        }
        
        .progress-percent {
            color: ${tema.pd} !important;
        }
        
        .servizio-id {
            color: ${tema.pd} !important;
        }
        
        .gallery-evento {
            color: ${tema.pd} !important;
        }
        
        .cart-float-btn {
            background: ${tema.pg} !important;
        }
        
        .cart-count {
            background: ${tema.pd} !important;
        }
        
        .cart-footer {
            background: ${tema.pl} !important;
        }
        
        .cart-item-price {
            color: ${tema.pd} !important;
        }
        
        .totals-box {
            background: ${tema.pl} !important;
        }
        
        .total-row.final {
            color: ${tema.pd} !important;
            border-top-color: ${tema.pl} !important;
        }
        
        .total-row.saldo {
            background: ${tema.pl} !important;
        }
        
        .badge-accettato {
            background: ${tema.pl} !important;
            color: ${tema.pd} !important;
        }
        
        .btn-whatsapp {
            background: linear-gradient(135deg, #25d366, #128c7e) !important;
        }
        
        .btn-danger {
            background: linear-gradient(135deg, #e74c3c, #c0392b) !important;
        }
        
        .btn-warning {
            background: linear-gradient(135deg, #f39c12, #e67e22) !important;
        }
        
        .btn-info {
            background: linear-gradient(135deg, #3498db, #2980b9) !important;
        }
        
        .alert-box {
            border-left-color: ${tema.pd} !important;
        }
        
        .alert-box div:first-child div:first-child {
            color: ${tema.pd} !important;
        }
        
        .search-box input:focus {
            border-color: ${tema.p} !important;
        }
        
        .modal-content {
            background: white !important;
        }
        
        .modal-header {
            border-bottom-color: ${tema.pl} !important;
        }
        
        .modal-header h2 {
            color: ${tema.pd} !important;
        }
        
        .close-modal {
            color: ${tema.pd} !important;
        }
        
        .tab-content.active {
            display: block !important;
        }
        
        .tabs {
            border-bottom-color: ${tema.pl} !important;
        }
        
        .tab:hover {
            color: ${tema.pd} !important;
        }
        
        .studio-info {
            background: ${tema.pl} !important;
            border-left-color: ${tema.p} !important;
        }
        
        .agenda-totale {
            background: ${tema.pl} !important;
            color: ${tema.pd} !important;
        }
        
        .agenda-data-titolo {
            color: ${tema.pd} !important;
        }
        
        .card-subtitle {
            color: ${tema.pd} !important;
        }
        
        .info-box strong {
            color: ${tema.pd} !important;
        }
        
        .info-box {
            background: ${tema.pl} !important;
            border-left-color: ${tema.p} !important;
        }
        
        .ricevuta-stampa .ricevuta-numero {
            border-color: ${tema.p} !important;
            background: ${tema.pl} !important;
        }
        
        .ricevuta-stampa .ricevuta-numero-valore {
            color: ${tema.pd} !important;
        }
        
        .ricevuta-stampa .ricevuta-importo-label,
        .ricevuta-stampa .ricevuta-importo-valore {
            color: ${tema.pd} !important;
        }
        
        .ricevuta-stampa .ricevuta-data {
            background: ${tema.pl} !important;
        }
        
        .ricevuta-stampa .ricevuta-header {
            border-bottom-color: ${tema.pl} !important;
        }
        
        .ricevuta-stampa .ricevuta-footer {
            border-top-color: ${tema.pl} !important;
        }
        
        .ricevuta-stampa .ricevuta-firma-linea {
            color: ${tema.pd} !important;
        }
        
        .payment-title {
            color: ${tema.pd} !important;
        }
        
        .form-group label {
            color: ${tema.pd} !important;
        }
        
        .form-group label .required {
            color: ${tema.pd} !important;
        }
        
        .card-title {
            border-bottom-color: ${tema.pl} !important;
        }
        
        .category-title {
            border-bottom-color: ${tema.pl} !important;
        }
        
        .modal-header h2 {
            color: ${tema.pd} !important;
        }
        
        .modal-content {
            border-color: ${tema.pl} !important;
        }
        
        .search-result-item {
            border-bottom-color: ${tema.pl} !important;
        }
        
        .task-row {
            border-bottom-color: ${tema.pl} !important;
        }
        
        .section-header {
            background: ${tema.pg} !important;
        }
        
        .section-progress {
            background: rgba(255,255,255,0.3) !important;
        }
        
        .servizio-card::before {
            background: ${tema.pg} !important;
        }
        
        .servizio-card:hover {
            border-color: ${tema.p} !important;
        }
        
        .progress-bar-container {
            background: ${tema.pl} !important;
        }
        
        .progress-bar {
            background: ${tema.pg} !important;
        }
        
        .progress-label {
            color: ${tema.pd} !important;
        }
        
        .task-completed .task-label {
            color: ${tema.pd} !important;
        }
        
        .empty-state, .loading {
            color: ${tema.pd} !important;
        }
        
        .footer-branding {
            color: ${tema.pd} !important;
        }
        
        .toast-container .toast {
            border-left-color: ${tema.p} !important;
        }
        
        .toast.error {
            border-left-color: ${tema.pd} !important;
        }
        
        .btn-danger {
            background: linear-gradient(135deg, #e74c3c, #c0392b) !important;
        }
        
        .btn-warning {
            background: linear-gradient(135deg, #f39c12, #e67e22) !important;
        }
        
        .btn-info {
            background: linear-gradient(135deg, #3498db, #2980b9) !important;
        }
        
        .btn-whatsapp {
            background: linear-gradient(135deg, #25d366, #128c7e) !important;
        }
        
        .alert-box {
            background: ${tema.pl} !important;
            border-left-color: ${tema.pd} !important;
        }
        
        .cred-box {
            background: ${tema.pl} !important;
            border-color: ${tema.p} !important;
        }
        
        .cred-box .value {
            color: ${tema.pd} !important;
        }
        
        .badge-alert {
            background: ${tema.pd} !important;
        }
        
        .order-product {
            border-bottom-color: ${tema.pl} !important;
        }
        
        .payment-card {
            border-color: ${tema.pl} !important;
        }
        
        .payment-card.active {
            border-color: ${tema.p} !important;
            background: ${tema.pl} !important;
        }
        
        .slider {
            background-color: ${tema.pl} !important;
        }
        
        input:checked + .slider {
            background-color: ${tema.p} !important;
        }
        
        .product-image {
            background: ${tema.pl} !important;
        }
        
        .product-card {
            border-color: ${tema.pl} !important;
        }
        
        .product-card:hover {
            border-color: ${tema.p} !important;
            box-shadow: 0 12px 24px ${tema.pl} !important;
        }
        
        .cart-sidebar {
            box-shadow: -4px 0 20px ${tema.pl} !important;
        }
        
        .cart-header {
            border-bottom-color: ${tema.pl} !important;
        }
        
        .cart-footer {
            border-top-color: ${tema.pl} !important;
            background: ${tema.pl} !important;
        }
        
        .cart-item {
            background: ${tema.pl} !important;
        }
        
        .cart-item-name {
            color: ${tema.pd} !important;
        }
        
        .cart-item-price {
            color: ${tema.pd} !important;
        }
        
        .cart-item-remove {
            background: ${tema.pd} !important;
        }
        
        .vetrina-header {
            background: ${tema.pg} !important;
        }
        
        .vetrina-header h2 {
            color: white !important;
        }
        
        .vetrina-header p {
            color: white !important;
        }
        
        .branding-header {
            background: ${tema.pg} !important;
        }
        
        .top-bar {
            background: ${tema.pg} !important;
        }
        
        .page-header {
            background: white !important;
            box-shadow: 0 10px 30px ${tema.pl} !important;
        }
        
        .page-header::before {
            background: ${tema.pg} !important;
        }
        
        .card, .card-3d, .module-card, .dash-card {
            background: white !important;
            box-shadow: 0 10px 30px ${tema.pl} !important;
        }
        
        .card::before, .card-3d::before, .module-card::before, .dash-card::before {
            background: ${tema.pg} !important;
        }
        
        .module-card:hover, .dash-card:hover {
            box-shadow: 0 16px 40px ${tema.pl} !important;
            border-color: ${tema.p} !important;
        }
        
        .module-icon {
            background: ${tema.pg} !important;
        }
        
        .studio-info {
            background: ${tema.pl} !important;
            border-left-color: ${tema.p} !important;
        }
        
        .form-group input, .form-group select, .form-group textarea {
            border-color: ${tema.pl} !important;
        }
        
        .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
            border-color: ${tema.p} !important;
            box-shadow: 0 0 0 3px ${tema.pl} !important;
        }
        
        .btn-primary {
            background: ${tema.pg} !important;
        }
        
        .btn-outline {
            color: ${tema.pd} !important;
            border-color: ${tema.p} !important;
        }
        
        .btn-outline:hover {
            background: ${tema.pl} !important;
        }
        
        .nav-btn {
            color: ${tema.pd} !important;
        }
        
        .sync-status {
            color: white !important;
        }
        
        .sync-dot {
            background: ${tema.p} !important;
        }
        
        .footer-branding strong {
            color: ${tema.pd} !important;
        }
        
        .toast {
            border-left-color: ${tema.p} !important;
        }
        
        .spinner {
            border-color: ${tema.pl} ${tema.pl} ${tema.p} ${tema.pl} !important;
        }
        
        .loading, .empty-state {
            color: ${tema.pd} !important;
        }
        
        .agenda-container {
            border-color: ${tema.pl} !important;
        }
        
        .agenda-header {
            border-bottom-color: ${tema.p} !important;
        }
        
        .agenda-grid {
            border-color: ${tema.pl} !important;
        }
        
        .agenda-row {
            border-bottom-color: ${tema.pl} !important;
        }
        
        .agenda-time {
            background: ${tema.pl} !important;
            border-right-color: ${tema.pl} !important;
            color: ${tema.pd} !important;
        }
        
        .event-manuale {
            background: ${tema.pl} !important;
            color: ${tema.pd} !important;
            border-left-color: ${tema.p} !important;
        }
        
        .event-servizio {
            background: ${tema.pl} !important;
            color: ${tema.pd} !important;
            border-left-color: ${tema.p} !important;
        }
        
        .event-badge {
            background: ${tema.pl} !important;
            color: ${tema.pd} !important;
        }
        
        .btn-delete-event {
            color: ${tema.pd} !important;
        }
        
        .card-3d {
            background: white !important;
            box-shadow: 0 10px 30px ${tema.pl} !important;
        }
        
        .service-item {
            border-left-color: ${tema.p} !important;
            background: white !important;
        }
        
        .service-item:hover {
            box-shadow: 0 8px 24px ${tema.pl} !important;
        }
        
        .service-name {
            color: ${tema.pd} !important;
        }
        
        .service-category {
            color: ${tema.pd} !important;
        }
        
        .service-price {
            background: ${tema.pl} !important;
            color: ${tema.pd} !important;
        }
        
        .category-section {
            border-bottom-color: ${tema.pl} !important;
        }
        
        .category-title {
            color: ${tema.pd} !important;
            border-bottom-color: ${tema.pl} !important;
        }
        
        .modal-overlay {
            background: rgba(0,0,0,0.5) !important;
        }
        
        .modal-content {
            background: white !important;
        }
        
        .modal-header {
            border-bottom-color: ${tema.pl} !important;
        }
        
        .modal-header h2 {
            color: ${tema.pd} !important;
        }
        
        .close-modal {
            color: ${tema.pd} !important;
        }
        
        .search-box input {
            border-color: ${tema.pl} !important;
        }
        
        .search-box input:focus {
            border-color: ${tema.p} !important;
        }
        
        .cred-box {
            background: ${tema.pl} !important;
            border-color: ${tema.p} !important;
        }
        
        .cred-box .label {
            color: ${tema.pd} !important;
        }
        
        .cred-box .value {
            color: ${tema.pd} !important;
        }
        
        .cliente-id {
            color: ${tema.pd} !important;
        }
        
        .table-container table th {
            background: ${tema.pl} !important;
            color: ${tema.pd} !important;
        }
        
        .table-container table tr:hover td {
            background: ${tema.pl} !important;
        }
        
        .ricevuta-stampa {
            border-color: ${tema.p} !important;
        }
        
        .ricevuta-stampa::before {
            background: ${tema.pg} !important;
        }
        
        .ricevuta-stampa .ricevuta-header {
            border-bottom-color: ${tema.pl} !important;
        }
        
        .ricevuta-stampa .ricevuta-studio-nome {
            background: ${tema.pg} !important;
            -webkit-background-clip: text !important;
            -webkit-text-fill-color: transparent !important;
            background-clip: text !important;
        }
        
        .ricevuta-stampa .ricevuta-numero {
            border-color: ${tema.p} !important;
            background: ${tema.pl} !important;
        }
        
        .ricevuta-stampa .ricevuta-numero-valore {
            color: ${tema.pd} !important;
        }
        
        .ricevuta-stampa .ricevuta-data {
            background: ${tema.pl} !important;
        }
        
        .ricevuta-stampa .ricevuta-riga {
            background: white !important;
            border-color: ${tema.pl} !important;
        }
        
        .ricevuta-stampa .ricevuta-importo {
            background: ${tema.pg} !important;
            border-color: ${tema.pd} !important;
        }
        
        .ricevuta-stampa .ricevuta-importo-label,
        .ricevuta-stampa .ricevuta-importo-valore {
            color: white !important;
        }
        
        .ricevuta-stampa .ricevuta-footer {
            border-top-color: ${tema.pl} !important;
        }
        
        .linea-taglio-stampa {
            border-top-color: ${tema.p} !important;
        }
        
        .linea-taglio-stampa::after {
            color: ${tema.p} !important;
            background: white !important;
        }
        
        .email-item {
            border-left-color: ${tema.pl} !important;
            background: white !important;
        }
        
        .email-item.unread {
            border-left-color: ${tema.p} !important;
            background: ${tema.pl} !important;
        }
        
        .email-item:hover {
            box-shadow: 0 8px 24px ${tema.pl} !important;
        }
        
        .email-subject {
            color: ${tema.pd} !important;
        }
        
        .email-to {
            color: ${tema.pd} !important;
        }
        
        .email-body {
            background: ${tema.pl} !important;
        }
        
        .template-card {
            border-color: ${tema.pl} !important;
            background: white !important;
        }
        
        .template-card:hover {
            border-color: ${tema.p} !important;
            box-shadow: 0 8px 20px ${tema.pl} !important;
        }
        
        .template-name {
            color: ${tema.pd} !important;
        }
        
        .gallery-list-item {
            border-color: ${tema.pl} !important;
            background: white !important;
        }
        
        .gallery-list-item:hover {
            border-color: ${tema.p} !important;
            box-shadow: 0 8px 24px ${tema.pl} !important;
        }
        
        .gallery-nomi {
            color: ${tema.pd} !important;
        }
        
        .gallery-evento {
            color: ${tema.pd} !important;
        }
        
        .gallery-status.status-ready {
            background: ${tema.pl} !important;
            color: ${tema.pd} !important;
        }
        
        .gallery-status.status-prep {
            background: ${tema.pl} !important;
            color: ${tema.pd} !important;
        }
        
        .gallery-credentials {
            background: ${tema.pl} !important;
        }
        
        .gallery-link {
            background: ${tema.pl} !important;
            color: ${tema.pd} !important;
        }
        
        .mega-guide {
            background: ${tema.pl} !important;
            border-color: ${tema.pl} !important;
        }
        
        .mega-guide h4 {
            color: ${tema.pd} !important;
        }
        
        .mega-guide ol {
            color: ${tema.pd} !important;
        }
        
        .logo-upload-area {
            background: ${tema.pl} !important;
            border-color: ${tema.pl} !important;
        }
        
        .logo-upload-area:hover {
            border-color: ${tema.p} !important;
            background: white !important;
        }
        
        .logo-placeholder-icon {
            color: ${tema.p} !important;
        }
        
        .info-box {
            background: ${tema.pl} !important;
            border-left-color: ${tema.p} !important;
        }
        
        .info-box strong {
            color: ${tema.pd} !important;
        }
        
        .badge-alert {
            background: ${tema.pd} !important;
        }
        
        .alert-box {
            background: ${tema.pl} !important;
            border-left-color: ${tema.pd} !important;
        }
        
        .stat-card {
            border-left-color: ${tema.p} !important;
            background: white !important;
        }
        
        .stat-number {
            color: ${tema.pd} !important;
        }
        
        .stat-label {
            color: ${tema.pd} !important;
        }
        
        .order-item {
            border-left-color: ${tema.p} !important;
            background: white !important;
        }
        
        .order-code {
            color: ${tema.pd} !important;
        }
        
        .order-total {
            color: ${tema.pd} !important;
        }
        
        .badge-attesa {
            background: ${tema.pl} !important;
            color: ${tema.pd} !important;
        }
        
        .badge-pagato, .badge-lavorazione, .badge-pronto, .badge-ritirato {
            background: ${tema.pl} !important;
            color: ${tema.pd} !important;
        }
        
        .payment-card {
            border-color: ${tema.pl} !important;
            background: white !important;
        }
        
        .payment-card.active {
            border-color: ${tema.p} !important;
            background: ${tema.pl} !important;
        }
        
        .payment-title {
            color: ${tema.pd} !important;
        }
        
        .totals-box {
            background: ${tema.pl} !important;
        }
        
        .total-row.final {
            color: ${tema.pd} !important;
            border-top-color: ${tema.pl} !important;
        }
        
        .total-row.saldo {
            background: ${tema.pl} !important;
            color: ${tema.pd} !important;
        }
        
        .tab.active {
            color: ${tema.pd} !important;
            border-bottom-color: ${tema.p} !important;
        }
        
        .tab:hover {
            color: ${tema.pd} !important;
        }
        
        .tabs {
            border-bottom-color: ${tema.pl} !important;
        }
        
        .search-result-item:hover {
            background: ${tema.pl} !important;
        }
        
        .search-result-item strong {
            color: ${tema.pd} !important;
        }
        
        .servizio-card {
            background: white !important;
            border-color: ${tema.pl} !important;
        }
        
        .servizio-card::before {
            background: ${tema.pg} !important;
        }
        
        .servizio-card:hover {
            border-color: ${tema.p} !important;
            box-shadow: 0 12px 24px ${tema.pl} !important;
        }
        
        .servizio-nome {
            color: ${tema.pd} !important;
        }
        
        .servizio-id {
            color: ${tema.pd} !important;
        }
        
        .servizio-tipo-btn {
            background: ${tema.pg} !important;
        }
        
        .progress-label {
            color: ${tema.pd} !important;
        }
        
        .progress-bar-container {
            background: ${tema.pl} !important;
        }
        
        .progress-bar {
            background: ${tema.pg} !important;
        }
        
        .progress-value {
            color: ${tema.pd} !important;
        }
        
        .progress-percent {
            color: ${tema.pd} !important;
        }
        
        .progress-title {
            color: ${tema.pd} !important;
        }
        
        .section-header {
            background: ${tema.pg} !important;
        }
        
        .section-progress {
            background: rgba(255,255,255,0.3) !important;
        }
        
        .task-row {
            border-bottom-color: ${tema.pl} !important;
        }
        
        .task-label {
            color: ${tema.pd} !important;
        }
        
        .task-completed .task-label {
            color: ${tema.pd} !important;
            text-decoration: line-through !important;
        }
        
        .overall-progress {
            background: white !important;
        }
        
        .workflow-section {
            box-shadow: 0 4px 12px ${tema.pl} !important;
        }
        
        .btn-sm {
            color: ${tema.pd} !important;
        }
        
        .btn-sm.btn-outline {
            border-color: ${tema.p} !important;
            color: ${tema.pd} !important;
        }
        
        .btn-sm.btn-danger {
            background: linear-gradient(135deg, #e74c3c, #c0392b) !important;
            color: white !important;
        }
        
        .btn-sm.btn-warning {
            background: linear-gradient(135deg, #f39c12, #e67e22) !important;
            color: white !important;
        }
        
        .btn-sm.btn-info {
            background: linear-gradient(135deg, #3498db, #2980b9) !important;
            color: white !important;
        }
        
        .btn-sm.btn-success {
            background: linear-gradient(135deg, #27ae60, #229954) !important;
            color: white !important;
        }
        
        .btn-sm.btn-primary {
            background: ${tema.pg} !important;
            color: white !important;
        }
    `;
    
    const style = document.createElement('style');
    style.id = 'temi-globale-inject';
    style.textContent = css;
    document.head.appendChild(style);
}

function aggiornaNomiStudio(nomeStudio) {
    document.querySelectorAll('.studio-nome').forEach(el => {
        el.textContent = nomeStudio;
    });
}

function attivaEffettoSpeciale(tipo) {
    document.querySelectorAll('.effetto-speciale').forEach(el => el.remove());
    if (tipo === 'neve') creaEffettoNeve();
    else if (tipo === 'coriandoli') creaEffettoCoriandoli();
}

function creaEffettoNeve() {
    const container = document.createElement('div');
    container.className = 'effetto-speciale';
    container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:hidden;';
    for (let i = 0; i < 50; i++) {
        const fiocco = document.createElement('div');
        fiocco.style.cssText = `position:absolute;width:${Math.random()*5+2}px;height:${Math.random()*5+2}px;background:rgba(255,255,255,0.8);border-radius:50%;left:${Math.random()*100}%;animation:neve ${Math.random()*5+5}s linear infinite;animation-delay:${Math.random()*5}s;`;
        container.appendChild(fiocco);
    }
    document.body.appendChild(container);
    const style = document.createElement('style');
    style.textContent = `@keyframes neve{0%{transform:translateY(-100vh) rotate(0deg);opacity:1}100%{transform:translateY(100vh) rotate(360deg);opacity:0.3}}`;
    document.head.appendChild(style);
}

function creaEffettoCoriandoli() {
    const container = document.createElement('div');
    container.className = 'effetto-speciale';
    container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:hidden;';
    const colori = ['#f39c12','#e74c3c','#3498db','#2ecc71','#9b59b6','#1abc9c'];
    for (let i = 0; i < 40; i++) {
        const coriandolo = document.createElement('div');
        const colore = colori[Math.floor(Math.random()*colori.length)];
        coriandolo.style.cssText = `position:absolute;width:${Math.random()*8+4}px;height:${Math.random()*8+4}px;background:${colore};left:${Math.random()*100}%;animation:coriandoli ${Math.random()*4+3}s ease-in infinite;animation-delay:${Math.random()*3}s;`;
        container.appendChild(coriandolo);
    }
    document.body.appendChild(container);
    const style = document.createElement('style');
    style.textContent = `@keyframes coriandoli{0%{transform:translateY(-100vh) rotate(0deg);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}`;
    document.head.appendChild(style);
}

// ============================================
// ESECUZIONE AUTOMATICA
// ============================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applicaTemaAutomatico);
} else {
    setTimeout(applcaTemaAutomatico, 100);
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
