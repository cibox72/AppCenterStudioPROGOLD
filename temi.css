/* ============================================
   TEMI GLOBALI - EFFETTI SPECIALI
   AppCenterStudioPROGOLD
   ============================================ */

/* Container per effetti speciali */
.neve-container,
.coriandoli-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999;
    overflow: hidden;
}

/* Fiocchi di neve */
.flocco-neve {
    position: absolute;
    background: white;
    border-radius: 50%;
    opacity: 0.8;
    animation: caduta-neve linear infinite;
    box-shadow: 0 0 5px rgba(255, 255, 255, 0.8);
}

@keyframes caduta-neve {
    0% {
        transform: translateY(-10vh) translateX(0) rotate(0deg);
        opacity: 1;
    }
    100% {
        transform: translateY(110vh) translateX(20px) rotate(360deg);
        opacity: 0.3;
    }
}

/* Coriandoli */
.coriandoli-container .coriandolo {
    position: absolute;
    width: 10px;
    height: 10px;
    animation: caduta-coriandoli linear infinite;
}

@keyframes caduta-coriandoli {
    0% {
        transform: translateY(-10vh) translateX(0) rotate(0deg);
        opacity: 1;
    }
    100% {
        transform: translateY(110vh) translateX(30px) rotate(720deg);
        opacity: 0;
    }
}

/* Transizioni fluide per cambio tema */
body,
.top-bar,
.page-header,
.card,
.card-3d,
.module-card,
.studio-info,
.btn,
.nav-btn {
    transition: background 0.5s ease, color 0.5s ease, border-color 0.5s ease;
}
