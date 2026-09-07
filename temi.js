// ============================================
// FILE TEMI GLOBALI - AppCenterStudioPROGOLD
// ============================================

const TEMI_PRESET = {
    'default': {
        nome: 'Default (Verde Salvia)',
        primary: '#82e0aa',
        primary_dark: '#1e8449',
        primary_light: '#e8f8f5',
        primary_gradient: 'linear-gradient(135deg, #a9dfbf 0%, #82e0aa 50%, #1e8449 100%)',
        bg_gradient: 'linear-gradient(135deg, #fdfbfb 0%, #e8f8f5 40%, #ebf5fb 100%)',
        text_main: '#2c3e50',
        text_light: '#7f8c8d',
        border_color: '#e8e8e8'
    },
    'natale': {
        nome: 'Natale (Rosso & Oro)',
        primary: '#e74c3c',
        primary_dark: '#922b21',
        primary_light: '#fadbd8',
        primary_gradient: 'linear-gradient(135deg, #f1948a 0%, #e74c3c 50%, #922b21 100%)',
        bg_gradient: 'linear-gradient(135deg, #fdfbfb 0%, #fadbd8 40%, #fef9e7 100%)',
        text_main: '#2c3e50',
        text_light: '#7f8c8d',
        border_color: '#e8e8e8'
    },
    'carnevale': {
        nome: 'Carnevale (Viola & Fucsia)',
        primary: '#af7ac5',
        primary_dark: '#6c3483',
        primary_light: '#e8daef',
        primary_gradient: 'linear-gradient(135deg, #d2b4de 0%, #af7ac5 50%, #6c3483 100%)',
        bg_gradient: 'linear-gradient(135deg, #fdfbfb 0%, #e8daef 40%, #f4ecf7 100%)',
        text_main: '#2c3e50',
        text_light: '#7f8c8d',
        border_color: '#e8e8e8'
    },
    'inverno': {
        nome: 'Inverno (Nero & Argento)',
        primary: '#5d6d7e',
        primary_dark: '#1c2833',
        primary_light: '#eaeded',
        primary_gradient: 'linear-gradient(135deg, #aab7b8 0%, #5d6d7e 50%, #1c2833 100%)',
        bg_gradient: 'linear-gradient(135deg, #fdfbfb 0%, #eaeded 40%, #f2f3f4 100%)',
        text_main: '#1c2833',
        text_light: '#5d6d7e',
        border_color: '#d5d8dc'
    },
    'pasqua': {
        nome: 'Pasqua (Rosa & Giallo)',
        primary: '#f1948a',
        primary_dark: '#c0392b',
        primary_light: '#fadbd8',
        primary_gradient: 'linear-gradient(135deg, #f9e79f 0%, #f1948a 50%, #c0392b 100%)',
        bg_gradient: 'linear-gradient(135deg, #fdfbfb 0%, #fdebd0 40%, #fadbd8 100%)',
        text_main: '#2c3e50',
        text_light: '#7f8c8d',
        border_color: '#e8e8e8'
    },
    'estate': {
        nome: 'Estate (Azzurro & Giallo)',
        primary: '#5dade2',
        primary_dark: '#1a5276',
        primary_light: '#d6eaf8',
        primary_gradient: 'linear-gradient(135deg, #f9e79f 0%, #5dade2 50%, #1a5276 100%)',
        bg_gradient: 'linear-gradient(135deg, #fdfbfb 0%, #d6eaf8 40%, #fef9e7 100%)',
        text_main: '#2c3e50',
        text_light: '#7f8c8d',
        border_color: '#e8e8e8'
    },
    'halloween': {
        nome: 'Halloween (Arancio & Nero)',
        primary: '#f39c12',
        primary_dark: '#7d6608',
        primary_light: '#fdebd0',
        primary_gradient: 'linear-gradient(135deg, #f39c12 0%, #e67e22 50%, #1c2833 100%)',
        bg_gradient: 'linear-gradient(135deg, #1c2833 0%, #2c3e50 40%, #fdebd0 100%)',
        text_main: '#f4f6f7',
        text_light: '#aab7b8',
        border_color: '#5d6d7e'
    },
    'san_valentino': {
        nome: 'San Valentino (Rosa & Rosso)',
        primary: '#e91e63',
        primary_dark: '#880e4f',
        primary_light: '#fce4ec',
        primary_gradient: 'linear-gradient(135deg, #f48fb1 0%, #e91e63 50%, #880e4f 100%)',
        bg_gradient: 'linear-gradient(135deg, #fdfbfb 0%, #fce4ec 40%, #f8bbd0 100%)',
        text_main: '#2c3e50',
        text_light: '#7f8c8d',
        border_color: '#e8e8e8'
    }
};

function applicaTema(tema) {
    const root = document.documentElement;
    root.style.setProperty('--primary', tema.primary);
    root.style.setProperty('--primary-dark', tema.primary_dark);
    root.style.setProperty('--primary-light', tema.primary_light);
    root.style.setProperty('--primary-gradient', tema.primary_gradient);
    root.style.setProperty('--bg-gradient', tema.bg_gradient);
    root.style.setProperty('--text-main', tema.text_main);
    root.style.setProperty('--text-light', tema.text_light);
    root.style.setProperty('--border-color', tema.border_color);
}

async function caricaTemaCloud(studioId) {
    const WORKER_URL = "https://appcenter-backend.mairaluigi-b2f.workers.dev";
    try {
        const response = await fetch(`${WORKER_URL}/api/studio/tema?studioId=${studioId}`);
        const data = await response.json();
        
        if (data.success && data.tema && data.tema.tema_attivo) {
            const temaNome = data.tema.tema_attivo;
            const tema = TEMI_PRESET[temaNome] || TEMI_PRESET['default'];
            applicaTema(tema);
            return tema;
        }
    } catch (error) {
        console.error('Errore caricamento tema:', error);
    }
    
    applicaTema(TEMI_PRESET['default']);
    return TEMI_PRESET['default'];
}

if (typeof window !== 'undefined') {
    window.TEMI_PRESET = TEMI_PRESET;
    window.applicaTema = applicaTema;
    window.caricaTemaCloud = caricaTemaCloud;
}
