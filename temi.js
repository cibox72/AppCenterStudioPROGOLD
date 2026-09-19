// ============================================
// VARIABILE GLOBALE WORKER_URL
// ============================================
var WORKER_URL = "https://appcenter-backend.mairaluigi-b2f.workers.dev";

// ============================================
// SISTEMA TEMI GLOBALI - AppCenterStudioPROGOLD
// ============================================

const TEMAS = {
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
    },
    
    // ============================================
    // NUOVI TEMI ELEGANTI
    // ============================================
    
    'elegante_beige': { 
        p: '#8b7355', 
        pd: '#5d4e37', 
        pl: '#f5f0e8', 
        pg: 'linear-gradient(135deg, #d4c4b0 0%, #b8a898 50%, #8b7355 100%)', 
        bg: 'linear-gradient(135deg, #faf8f5 0%, #f0ebe3 40%, #e8e0d5 100%)', 
        effetto: null 
    },
    
    'notte_arancio': { 
        p: '#ff6b35', 
        pd: '#c9451a', 
        pl: '#ffe8e0', 
        pg: 'linear-gradient(135deg, #ff8c5a 0%, #ff6b35 50%, #c9451a 100%)', 
        bg: 'linear-gradient(135deg, #0a0a0a 0%, #1a0f0a 40%, #2e1a0f 100%)', 
        effetto: null 
    },
    
    'caldo_professionale': { 
        p: '#e67e50', 
        pd: '#a04020', 
        pl: '#ffece4', 
        pg: 'linear-gradient(135deg, #f4a47a 0%, #e67e50 50%, #a04020 100%)', 
        bg: 'linear-gradient(135deg, #1c1410 0%, #2a1f1a 40%, #3d2820 100%)', 
        effetto: null 
    },
    
    'minimal_luxury': { 
        p: '#c9a87c', 
        pd: '#8b7355', 
        pl: '#faf8f4', 
        pg: 'linear-gradient(135deg, #e8d5b7 0%, #d4c4a8 50%, #b8a888 100%)', 
        bg: 'linear-gradient(135deg, #ffffff 0%, #f8f6f2 40%, #f0ebe3 100%)', 
        effetto: null 
    },
    
    'tramonto_moderno': { 
        p: '#ff512f', 
        pd: '#c93820', 
        pl: '#ffe5e0', 
        pg: 'linear-gradient(135deg, #ff7e5f 0%, #ff512f 50%, #dd2476 100%)', 
        bg: 'linear-gradient(135deg, #0f0c0a 0%, #1a1210 40%, #2e1a15 100%)', 
        effetto: null 
    },
    
    'oro_nero': { 
        p: '#d4af37', 
        pd: '#996515', 
        pl: '#fff9e6', 
        pg: 'linear-gradient(135deg, #f4d03f 0%, #d4af37 50%, #996515 100%)', 
        bg: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 40%, #2a2a2a 100%)', 
        effetto: null 
    },
    
    'ardesia_elegante': { 
        p: '#6c7a89', 
        pd: '#34495e', 
        pl: '#e8ecef', 
        pg: 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 50%, #5d6d7e 100%)', 
        bg: 'linear-gradient(135deg, #1a1f2e 0%, #242b3a 40%, #2e3748 100%)', 
        effetto: null 
    },
    
    'corallo_professional': { 
        p: '#ff6b6b', 
        pd: '#c94545', 
        pl: '#ffe8e8', 
        pg: 'linear-gradient(135deg, #ff8e8e 0%, #ff6b6b 50%, #ee5a5a 100%)', 
        bg: 'linear-gradient(135deg, #fafafa 0%, #f5f0f0 40%, #ebe5e5 100%)', 
        effetto: null 
    },
    
    'bronzo_scuro': { 
        p: '#cd7f32', 
        pd: '#8b4513', 
        pl: '#f5ebe0', 
        pg: 'linear-gradient(135deg, #e8a86a 0%, #cd7f32 50%, #8b4513 100%)', 
        bg: 'linear-gradient(135deg, #0f0e0d 0%, #1a1614 40%, #2a2218 100%)', 
        effetto: null 
    },
    
    'platino': { 
        p: '#9e9e9e', 
        pd: '#616161', 
        pl: '#f5f5f5', 
        pg: 'linear-gradient(135deg, #bdbdbd 0%, #9e9e9e 50%, #757575 100%)', 
        bg: 'linear-gradient(135deg, #121212 0%, #1e1e1e 40%, #2a2a2a 100%)', 
        effetto: null 
    },
    
    'lavanda_professional': { 
        p: '#9b7cb6', 
        pd: '#6c5b7b', 
        pl: '#f0e8f8', 
        pg: 'linear-gradient(135deg, #b8a0d4 0%, #9b7cb6 50%, #7d5f99 100%)', 
        bg: 'linear-gradient(135deg, #f8f6fc 0%, #f0ecf5 40%, #e8e0f0 100%)', 
        effetto: null 
    },
    
    'rame_caldo': { 
        p: '#b87333', 
        pd: '#8b4513', 
        pl: '#fff0e6', 
        pg: 'linear-gradient(135deg, #d4945a 0%, #b87333 50%, #8b4513 100%)', 
        bg: 'linear-gradient(135deg, #1a1410 0%, #2a1f18 40%, #3d2a1f 100%)', 
        effetto: null 
    }
};

// Funzione per applicare il tema globalmente
async function caricaTemaGlobale(studioId = null, token = null) {
    if (!studioId || !token) return;
    
    try {
        const response = await fetch(`${WORKER_URL}/api/studio/tema?studioId=${encodeURIComponent(studioId)}&token=${encodeURIComponent(token)}`);
        const data = await response.json();
        
        if (data.success && data.tema && data.tema.tema_attivo) {
            const temaId = data.tema.tema_attivo;
            const tema = TEMAS[temaId] || TEMAS['default'];
            
            const root = document.documentElement;
            root.style.setProperty('--primary', tema.p);
            root.style.setProperty('--primary-dark', tema.pd);
            root.style.setProperty('--primary-light', tema.pl);
            root.style.setProperty('--primary-gradient', tema.pg);
            root.style.setProperty('--bg-gradient', tema.bg);
            
            // Attiva effetto speciale se esiste
            if (typeof attivaEffettoSpeciale === 'function') {
                attivaEffettoSpeciale(tema.effetto);
            }
        }
    } catch (error) {
        console.error('Errore caricamento tema:', error);
    }
}

// Effetti speciali (neve, coriandoli, ecc.)
function attivaEffettoSpeciale(tipo) {
    // Rimuovi effetti precedenti
    document.querySelectorAll('.effetto-speciale').forEach(el => el.remove());
    
    if (tipo === 'neve') {
        creaEffettoNeve();
    } else if (tipo === 'coriandoli') {
        creaEffettoCoriandoli();
    }
}

function creaEffettoNeve() {
    const container = document.createElement('div');
    container.className = 'effetto-speciale';
    container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:hidden;';
    
    for (let i = 0; i < 50; i++) {
        const fiocco = document.createElement('div');
        fiocco.style.cssText = `
            position:absolute;
            width:${Math.random() * 5 + 2}px;
            height:${Math.random() * 5 + 2}px;
            background:rgba(255,255,255,0.8);
            border-radius:50%;
            left:${Math.random() * 100}%;
            animation:neve ${Math.random() * 5 + 5}s linear infinite;
            animation-delay:${Math.random() * 5}s;
        `;
        container.appendChild(fiocco);
    }
    
    document.body.appendChild(container);
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes neve {
            0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(360deg); opacity: 0.3; }
        }
    `;
    document.head.appendChild(style);
}

function creaEffettoCoriandoli() {
    const container = document.createElement('div');
    container.className = 'effetto-speciale';
    container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:hidden;';
    
    const colori = ['#f39c12', '#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#1abc9c'];
    
    for (let i = 0; i < 40; i++) {
        const coriandolo = document.createElement('div');
        const colore = colori[Math.floor(Math.random() * colori.length)];
        coriandolo.style.cssText = `
            position:absolute;
            width:${Math.random() * 8 + 4}px;
            height:${Math.random() * 8 + 4}px;
            background:${colore};
            left:${Math.random() * 100}%;
            animation:coriandoli ${Math.random() * 4 + 3}s ease-in infinite;
            animation-delay:${Math.random() * 3}s;
        `;
        container.appendChild(coriandolo);
    }
    
    document.body.appendChild(container);
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes coriandoli {
            0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// Esporta per uso globale
if (typeof window !== 'undefined') {
    window.TEMAS = TEMAS;
    window.caricaTemaGlobale = caricaTemaGlobale;
    window.attivaEffettoSpeciale = attivaEffettoSpeciale;
}
