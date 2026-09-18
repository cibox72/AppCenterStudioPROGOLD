var WORKER_URL = "https://appcenter-backend.mairaluigi-b2f.workers.dev";

var TEMI = {
    'default': { p: '#82e0aa', pd: '#1e8449', pl: '#e8f8f5', pg: 'linear-gradient(135deg, #a9dfbf 0%, #82e0aa 50%, #1e8449 100%)', bg: 'linear-gradient(135deg, #fdfbfb 0%, #e8f8f5 40%, #ebf5fb 100%)', effetto: null },
    'natale': { p: '#e74c3c', pd: '#922b21', pl: '#fadbd8', pg: 'linear-gradient(135deg, #f1948a 0%, #e74c3c 50%, #922b21 100%)', bg: 'linear-gradient(135deg, #fdfbfb 0%, #fadbd8 40%, #fef9e7 100%)', effetto: 'neve' },
    'carnevale': { p: '#af7ac5', pd: '#6c3483', pl: '#e8daef', pg: 'linear-gradient(135deg, #d2b4de 0%, #af7ac5 50%, #6c3483 100%)', bg: 'linear-gradient(135deg, #fdfbfb 0%, #e8daef 40%, #f4ecf7 100%)', effetto: 'coriandoli' },
    'inverno': { p: '#5d6d7e', pd: '#1c2833', pl: '#eaeded', pg: 'linear-gradient(135deg, #aab7b8 0%, #5d6d7e 50%, #1c2833 100%)', bg: 'linear-gradient(135deg, #fdfbfb 0%, #eaeded 40%, #f2f3f4 100%)', effetto: 'neve' },
    'pasqua': { p: '#f1948a', pd: '#c0392b', pl: '#fadbd8', pg: 'linear-gradient(135deg, #f9e79f 0%, #f1948a 50%, #c0392b 100%)', bg: 'linear-gradient(135deg, #fdfbfb 0%, #fdebd0 40%, #fadbd8 100%)', effetto: null },
    'estate': { p: '#5dade2', pd: '#1a5276', pl: '#d6eaf8', pg: 'linear-gradient(135deg, #f9e79f 0%, #5dade2 50%, #1a5276 100%)', bg: 'linear-gradient(135deg, #fdfbfb 0%, #d6eaf8 40%, #fef9e7 100%)', effetto: null },
    'halloween': { p: '#f39c12', pd: '#7d6608', pl: '#fdebd0', pg: 'linear-gradient(135deg, #f39c12 0%, #e67e22 50%, #1c2833 100%)', bg: 'linear-gradient(135deg, #1c2833 0%, #2c3e50 40%, #fdebd0 100%)', effetto: null },
    'san_valentino': { p: '#e91e63', pd: '#880e4f', pl: '#fce4ec', pg: 'linear-gradient(135deg, #f48fb1 0%, #e91e63 50%, #880e4f 100%)', bg: 'linear-gradient(135deg, #fdfbfb 0%, #fce4ec 40%, #f8bbd0 100%)', effetto: null },
    'arancio': { p: '#f39c12', pd: '#d35400', pl: '#fdebd0', pg: 'linear-gradient(135deg, #f1c40f 0%, #f39c12 50%, #d35400 100%)', bg: 'linear-gradient(135deg, #fdfbfb 0%, #fdebd0 40%, #fef9e7 100%)', effetto: null }
};

function attivaEffetti(tipo) {
    document.querySelectorAll('.neve-container, .coriandoli-container').forEach(function(el) { el.remove(); });
    if (tipo === 'neve') {
        var c = document.createElement('div'); c.className = 'neve-container'; document.body.appendChild(c);
        for (var i=0; i<50; i++) {
            var f = document.createElement('div'); f.className = 'flocco-neve';
            f.style.cssText = 'position:absolute;width:'+ (Math.random()*5+3) +'px;height:'+ (Math.random()*5+3) +'px;left:'+ (Math.random()*100) +'%;animation:caduta-neve '+ (Math.random()*5+5) +'s linear infinite';
            c.appendChild(f);
        }
    } else if (tipo === 'coriandoli') {
        var c = document.createElement('div'); c.className = 'coriandoli-container'; document.body.appendChild(c);
        var colori = ['#f39c12','#e74c3c','#9b59b6','#3498db','#2ecc71'];
        for (var i=0; i<60; i++) {
            var f = document.createElement('div'); f.className = 'coriandolo';
            f.style.cssText = 'position:absolute;width:10px;height:10px;background:'+ colori[Math.floor(Math.random()*colori.length)] +';left:'+ (Math.random()*100) +'%;animation:caduta-coriandoli '+ (Math.random()*4+4) +'s linear infinite';
            c.appendChild(f);
        }
    }
}

async function caricaTemaGlobale(studioId, token) {
    if (!studioId || !token) return;
    try {
        var res = await fetch(WORKER_URL + '/api/studio/tema?studioId=' + encodeURIComponent(studioId) + '&token=' + encodeURIComponent(token));
        var data = await res.json();
        if (data.success && data.tema && data.tema.tema_attivo) {
            var t = TEMI[data.tema.tema_attivo] || TEMI['default'];
            var r = document.documentElement;
            r.style.setProperty('--primary', t.p);
            r.style.setProperty('--primary-dark', t.pd);
            r.style.setProperty('--primary-light', t.pl);
            r.style.setProperty('--primary-gradient', t.pg);
            r.style.setProperty('--bg-gradient', t.bg);
            if (t.effetto) attivaEffetti(t.effetto);
            else document.querySelectorAll('.neve-container, .coriandoli-container').forEach(function(el) { el.remove(); });
        }
    } catch(e) { console.error('Errore tema:', e); }
}

function inizializzaTemi() {
    var params = new URLSearchParams(window.location.search);
    var token = params.get('token');
    if (!token) return;
    fetch(WORKER_URL + '/api/auth/verifica?token=' + encodeURIComponent(token))
        .then(function(r) { return r.json(); })
        .then(function(d) {
            if (d.success && d.user && d.user.id) {
                caricaTemaGlobale(d.user.id, token);
                setInterval(function() { caricaTemaGlobale(d.user.id, token); }, 10000);
            }
        });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inizializzaTemi);
else inizializzaTemi();
