// ============================================
// VARIABILE GLOBALE WORKER_URL
// ============================================
var WORKER_URL = "https://appcenter-backend.mairaluigi-b2f.workers.dev";

// ============================================
// COLORI FISSI - ORO/NERO/BIANCO
// ============================================
var COLORI = {
    sfondo: '#ffffff',
    testo: '#000000',
    oro: '#d4af37',
    oroScuro: '#996515',
    oroChiaro: '#fff9e6',
    bordo: '#d5d8dc'
};

// ============================================
// APPLICA COLORI FISSI A TUTTA LA PAGINA
// ============================================
function applicaTemaFisso() {
    var root = document.documentElement;
    
    // Imposta variabili CSS
    root.style.setProperty('--bg-sfondo', COLORI.sfondo, 'important');
    root.style.setProperty('--text-principale', COLORI.testo, 'important');
    root.style.setProperty('--accento-oro', COLORI.oro, 'important');
    root.style.setProperty('--oro-scuro', COLORI.oroScuro, 'important');
    root.style.setProperty('--oro-chiaro', COLORI.oroChiaro, 'important');
    root.style.setProperty('--bordo', COLORI.bordo, 'important');
    
    // CSS inline per garantire contrasto
    var css = '';
    css += 'body { background: #ffffff !important; color: #000000 !important; }';
    css += 'h1, h2, h3, h4, h5, h6, p, span, label, td, th, li, a, div, input, select, textarea, button { color: #000000 !important; }';
    css += '.card, .module-card, .dash-card, table, .form-group input, .form-group select, .form-group textarea { background: #ffffff !important; color: #000000 !important; }';
    css += '.btn-primary, .btn-success { background: linear-gradient(135deg, #d4af37, #996515) !important; color: #ffffff !important; }';
    css += '.btn-outline { border: 2px solid #d4af37 !important; color: #996515 !important; }';
    css += 'th { background: #d4af37 !important; color: #ffffff !important; }';
    css += 'td { background: #ffffff !important; color: #000000 !important; }';
    css += 'tr:hover td { background: #fff9e6 !important; }';
    css += '.top-bar { background: linear-gradient(135deg, #d4af37, #996515) !important; }';
    css += '.top-bar h1 { color: #ffffff !important; }';
    css += '.sync-status { color: #ffffff !important; }';
    css += '.nav-btn { background: rgba(255,255,255,0.2) !important; color: #ffffff !important; }';
    css += '.badge { background: #fff9e6 !important; color: #996515 !important; }';
    css += '.section-title { background: #fff9e6 !important; color: #000000 !important; border-left: 4px solid #d4af37 !important; }';
    css += '.form-group input, .form-group select, .form-group textarea { background: #f8f9fa !important; border: 2px solid #d5d8dc !important; color: #000000 !important; }';
    css += '.form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #d4af37 !important; background: #ffffff !important; }';
    css += '.btn-danger { background: linear-gradient(135deg, #f1948a, #e74c3c) !important; color: #ffffff !important; }';
    css += '.btn-warning { background: linear-gradient(135deg, #f9e79f, #f1c40f) !important; color: #000000 !important; }';
    css += '.services-list, .acconti-list, .piano-list { background: #f8f9fa !important; border: 2px solid #d5d8dc !important; }';
    css += '.totals-box { background: #fff9e6 !important; border: 2px solid #d4af37 !important; }';
    css += '.total-row.final { color: #996515 !important; }';
    css += '.total-row.saldo { background: #ffffff !important; color: #e74c3c !important; }';
    css += '.checkbox-group label { color: #000000 !important; }';
    css += '.footer-branding { color: #666666 !important; }';
    css += '.footer-branding strong { color: #996515 !important; }';
    css += '.empty-state { color: #666666 !important; }';
    css += '.loading { color: #666666 !important; }';
    css += '.spinner { border: 4px solid #fff9e6 !important; border-top: 4px solid #d4af37 !important; }';
    css += '.modal-content { background: #ffffff !important; color: #000000 !important; }';
    css += '.modal-header h3 { color: #000000 !important; }';
    css += '.close-modal { color: #666666 !important; }';
    css += '.tab { background: #ffffff !important; color: #000000 !important; border: 2px solid #d5d8dc !important; }';
    css += '.tab.active { background: linear-gradient(135deg, #d4af37, #996515) !important; color: #ffffff !important; }';
    css += '.page-header { background: #ffffff !important; border-left: 5px solid #d4af37 !important; }';
    css += '.page-header h2 { color: #000000 !important; }';
    css += '.page-header p { color: #666666 !important; }';
    css += '.card-title { color: #000000 !important; border-bottom: 2px solid #fff9e6 !important; }';
    css += '.service-item, .acconto-item, .piano-item { color: #000000 !important; border-bottom: 1px solid #d5d8dc !important; }';
    css += '.actions-cell button { color: #ffffff !important; }';
    css += '.btn-maps { background: linear-gradient(135deg, #5dade2, #2e86c1) !important; color: #ffffff !important; }';
    
    // Applica CSS
    var style = document.getElementById('temi-fissi');
    if (!style) {
        style = document.createElement('style');
        style.id = 'temi-fissi';
        document.head.appendChild(style);
    }
    style.textContent = css;
    
    console.log('[TEMI] Tema Oro/Nero/Bianco applicato');
}

// ============================================
// ESECUZIONE AUTOMATICA
// ============================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applicaTemaFisso);
} else {
    setTimeout(applicaTemaFisso, 100);
}

// ============================================
// ESPORTAZIONI GLOBALI
// ============================================
if (typeof window !== 'undefined') {
    window.COLORI = COLORI;
    window.applicaTemaFisso = applicaTemaFisso;
}
