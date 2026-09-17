/* ============================================
   TEMI GLOBALI - SISTEMA CENTRALIZZATO
   ============================================ */

const WORKER_URL = "https://appcenter-backend.mairaluigi-b2f.workers.dev";

// Definizione di tutti i temi disponibili
const TEMI_DEFINIZIONI = {
    'default': { 
        p: '#82e0aa', 
        pd: '#1e8449', 
        pl: '#e8f8f5', 
        pg: 'linear-gradient(135deg, #a9dfbf 0%, #82e0aa 50%, #1e8449 100%)', 
        bg: 'linear-gradient(135deg, #fdfbfb 0%, #e8f8f5 40%, #ebf5fb 100%)',
        effetto: null 
    },
    'natale': { 
        p: '#e74c3c', 
        pd: '#922b21', 
        pl: '#fadbd8', 
        pg: 'linear-gradient(135deg, #f1948a 0%, #e74c3c 50%, #922b21 100%)', 
        bg: 'linear-gradient(135deg, #fdfbfb 0%, #fadbd8 40%, #fef9e7 100%)',
        effetto: 'neve' 
    },
    'carnevale': { 
        p: '#af7ac5', 
        pd: '#6c3483', 
        pl: '#e8daef', 
        pg: 'linear-gradient(135deg, #d2b4de 0%, #af7ac5 50%, #6c3483 100%)', 
        bg: 'linear-gradient(135deg, #fdfbfb 0%, #e8daef 40%, #f4ecf7 100%)',
        effetto: 'coriandoli' 
    },
    'inverno': { 
        p: '#5d6d7e', 
        pd: '#1c2833', 
        pl: '#eaeded', 
        pg: 'linear-gradient(135deg, #aab7b8 0%, #5d6d7e 50%, #1c2833 100%)', 
        bg: 'linear-gradient(135deg, #fdfbfb 0%, #eaeded 40%, #f2f3f4 100%)',
        effetto: null 
    },
    'pasqua': { 
        p: '#f1948a', 
        pd: '#c0392b', 
        pl: '#fadbd8', 
        pg: 'linear-gradient(135deg, #f9e79f 0%, #f1948a 50%, #c0392b 100%)', 
        bg: 'linear-gradient(135deg, #fdfbfb 0%, #fdebd0 40%, #fadbd8 100%)',
        effetto: null 
    },
    'estate': { 
        p: '#5dade2', 
        pd: '#1a5276', 
        pl: '#d6eaf8', 
        pg: 'linear-gradient(135deg, #f9e79f 0%, #5dade2 50%, #1a5276 100%)', 
        bg: 'linear-gradient(135deg, #fdfbfb 0%, #d6eaf8 40%, #fef9e7 100%)',
        effetto: null 
    },
    'halloween': { 
        p: '#f39c12', 
        pd: '#7d6608', 
        pl: '#fdebd0', 
        pg: 'linear-gradient(135deg, #f39c12 0%, #e67e22 50%, #1c2833 100%)', 
        bg: 'linear-gradient(135deg, #1c2833 0%, #2c3e50 40%, #fdebd0 100%)',
        effetto: null 
    },
    'san_valentino': { 
        p: '#e91e63', 
        pd: '#880e4f', 
        pl: '#fce4ec', 
        pg: 'linear-gradient(135deg, #f48fb1 0%, #e91e63 50%, #880e4f 100%)', 
        bg: 'linear-gradient(135deg, #fdfbfb 0%, #fce4ec 40%, #f8bbd0 100%)',
        effetto: null 
    },
    'arancio': { 
        p: '#f39c12', 
        pd: '#d35400', 
        pl: '#fdebd0', 
        pg: 'linear-gradient(135deg, #f1c40f 0%, #f39c12 50%, #d35400 100%)', 
        bg: 'linear-gradient(135deg, #fdfbfb 0%, #fdebd0 40%, #fef9e7 100%)',
        effetto: null 
    }
};

// Funzione per attivare effetti speciali
function attivaEffettoSpeciale(tipo) {
    // Rimuovi effetti precedenti
    document.querySelectorAll('.neve-container, .coriandoli-container').forEach(el => el.remove());
    
    if (tipo === 'neve') {
        const container = document.createElement('div');
        container.className = 'neve-container';
        document.body.appendChild(container);
        
        // Crea 50 fiocchi di neve
        for (let i = 0; i < 50; i++) {
            const fiocco = document.createElement('div');
            fiocco.className = 'flocco-neve';
            const size = Math.random() * 5 + 3;
            fiocco.style.width = size + 'px';
            fiocco.style.height = size + 'px';
            fiocco.style.left = Math.random() * 100 + '%';
            fiocco.style.animationDuration = (Math.random() * 5 + 5) + 's';
            fiocco.style.animationDelay = Math.random() * 5 + 's';
            container.appendChild(fiocco);
        }
    } else if (tipo === 'coriandoli') {
        const container = document.createElement('div');
        container.className = 'coriandoli-container';
        document.body.appendChild(container);
        
        const colori = ['#f39c12', '#e74c3c', '#9b59b6', '#3498db', '#2ecc71', '#e91e63', '#f1c40f'];
        
        // Crea 60 coriandoli
        for (let i = 0; i < 60; i++) {
            const coriandolo = document.createElement('div');
            coriandolo.className = 'coriandolo';
            coriandolo.style.backgroundColor = colori[Math.floor(Math.random() * colori.length)];
            coriandolo.style.left = Math.random() * 100 + '%';
            coriandolo.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
            coriandolo.style.animationDuration = (Math.random() * 4 + 4) + 's';
            coriandolo.style.animationDelay = Math.random() * 4 + 's';
            container.appendChild(coriandolo);
        }
    }
}

// Funzione principale per caricare il tema
async function caricaTemaGlobale(studioId, token) {
    if (!studioId || !token) return;
    
    try {
        const response = await fetch(`${WORKER_URL}/api/studio/tema?studioId=${encodeURIComponent(studioId)}&token=${encodeURIComponent(token)}`);
        const data = await response.json();
        
        if (data.success && data.tema && data.tema.tema_attivo) {
            const temaId = data.tema.tema_attivo;
            const t = TEMI_DEFINIZIONI[temaId] || TEMI_DEFINIZIONI['default'];
            
            // Applica le variabili CSS
            const root = document.documentElement;
            root.style.setProperty('--primary', t.p);
            root.style.setProperty('--primary-dark', t.pd);
            root.style.setProperty('--primary-light', t.pl);
            root.style.setProperty('--primary-gradient', t.pg);
            root.style.setProperty('--bg-gradient', t.bg);
            
            // Attiva effetto speciale se presente
            if (t.effetto) {
                attivaEffettoSpeciale(t.effetto);
            } else {
                document.querySelectorAll('.neve-container, .coriandoli-container').forEach(el => el.remove());
            }
            
            console.log('Tema applicato:', temaId);
        }
    } catch (error) {
        console.error('Errore caricamento tema:', error);
    }
}

// Funzione di inizializzazione automatica
function inizializzaTemiGlobali() {
    // Estrai token e studioId dall'URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (!token) return;
    
    // Carica il tema immediatamente
    fetch(`${WORKER_URL}/api/auth/verifica?token=${encodeURIComponent(token)}`)
        .then(res => res.json())
        .then(data => {
            if (data.success && data.user && data.user.id) {
                caricaTemaGlobale(data.user.id, token);
                
                // Polling ogni 10 secondi per aggiornamenti in tempo reale
                setInterval(() => {
                    caricaTemaGlobale(data.user.id, token);
                }, 10000);
            }
        })
        .catch(err => console.error('Errore verifica sessione per temi:', err));
}

// Avvia automaticamente quando il DOM è pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inizializzaTemiGlobali);
} else {
    inizializzaTemiGlobali();
}
