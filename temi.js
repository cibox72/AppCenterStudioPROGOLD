/* ============================================
   FIX CONTRASTO TABELLE - UNIVERSALE
   ============================================ */
table {
    border-collapse: collapse;
}
table th {
    background: ${tema.p} !important;
    color: #ffffff !important;
    font-weight: 700 !important;
    text-shadow: 0 1px 2px rgba(0,0,0,0.3) !important;
    padding: 12px 8px !important;
}
table td {
    color: ${tema.textMain} !important;
    padding: 10px 8px !important;
    border-bottom: 1px solid ${tema.pl} !important;
}
table tr {
    background: ${tema.cardBg} !important;
}
table tr:hover td {
    background: ${tema.pl} !important;
}
table input, table select, table textarea {
    background: ${tema.cardBg === '#ffffff' ? '#ffffff' : '#34495e'} !important;
    color: ${tema.textMain} !important;
    border: 1px solid ${tema.pl} !important;
    padding: 6px 8px !important;
    border-radius: 4px !important;
}
table input::placeholder, table textarea::placeholder {
    color: ${tema.textMain} !important;
    opacity: 0.6 !important;
}
table input[type="text"], table input[type="email"], table input[type="tel"], table input[type="password"] {
    background: ${tema.cardBg === '#ffffff' ? '#f8f9fa' : '#2c3e50'} !important;
    color: ${tema.textMain} !important;
}
/* Fix specifico per campi username/password nelle tabelle */
table td input {
    min-width: 100px !important;
}
/* Fix per righe alternate */
table tr:nth-child(even) td {
    background: ${tema.cardBg === '#ffffff' ? '#f8f9fa' : '#242b3a'} !important;
}
/* Fix per intestazioni con sfondo chiaro */
thead th {
    background: ${tema.p} !important;
    color: #ffffff !important;
}
/* Fix per tabelle senza thead */
tr:first-child td, tr:first-child th {
    background: ${tema.p} !important;
    color: #ffffff !important;
}
