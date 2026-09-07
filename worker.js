export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // TEMI DISPONIBILI
    const TEMI_PRESET = {
      'default': { nome: 'Default (Verde Salvia)', primary: '#82e0aa', primary_dark: '#1e8449', primary_light: '#e8f8f5' },
      'natale': { nome: 'Natale (Rosso & Oro)', primary: '#e74c3c', primary_dark: '#922b21', primary_light: '#fadbd8' },
      'carnevale': { nome: 'Carnevale (Viola & Fucsia)', primary: '#af7ac5', primary_dark: '#6c3483', primary_light: '#e8daef' },
      'inverno': { nome: 'Inverno (Nero & Argento)', primary: '#5d6d7e', primary_dark: '#1c2833', primary_light: '#eaeded' },
      'pasqua': { nome: 'Pasqua (Rosa & Giallo)', primary: '#f1948a', primary_dark: '#c0392b', primary_light: '#fadbd8' },
      'estate': { nome: 'Estate (Azzurro & Giallo)', primary: '#5dade2', primary_dark: '#1a5276', primary_light: '#d6eaf8' },
      'halloween': { nome: 'Halloween (Arancio & Nero)', primary: '#f39c12', primary_dark: '#7d6608', primary_light: '#fdebd0' },
      'san_valentino': { nome: 'San Valentino (Rosa & Rosso)', primary: '#e91e63', primary_dark: '#880e4f', primary_light: '#fce4ec' }
    };

    try {
      // ============================================
      // 1. LOGIN ADMIN
      // ============================================
      if (path === "/api/admin/login" && request.method === "POST") {
        const { userId, password } = await request.json();
        if (userId === "admin" && password === "58879@Stella") {
          return new Response(JSON.stringify({ success: true, role: "SUPREME_ADMIN" }), { headers: corsHeaders });
        }
        return new Response(JSON.stringify({ error: "Credenziali non valide" }), { status: 401, headers: corsHeaders });
      }

      // ============================================
      // 2. LOGIN STUDIO
      // ============================================
      if (path === "/api/studio/login" && request.method === "POST") {
        const { studioId, password } = await request.json();
        const result = await env.DB.prepare("SELECT * FROM studi WHERE id = ? AND password = ?").bind(studioId, password).first();
        if (result) {
          return new Response(JSON.stringify({ success: true, role: "STUDIO", studioId: result.id, nome: result.nome }), { headers: corsHeaders });
        }
        return new Response(JSON.stringify({ error: "Credenziali non valide" }), { status: 401, headers: corsHeaders });
      }

      // ============================================
      // 3. LOGIN CLIENTE
      // ============================================
      if (path === "/api/cliente/login" && request.method === "POST") {
        const { clienteId, password } = await request.json();
        const result = await env.DB.prepare("SELECT * FROM clienti WHERE id = ? AND password = ?").bind(clienteId, password).first();
        if (result) {
          return new Response(JSON.stringify({ success: true, role: "CLIENTE", clienteId: result.id, nomeEvento: result.nome_a + " " + result.cognome_a }), { headers: corsHeaders });
        }
        return new Response(JSON.stringify({ error: "Credenziali non valide" }), { status: 401, headers: corsHeaders });
      }

      // ============================================
      // 4. GESTIONE STUDI
      // ============================================
      if (path === "/api/admin/studi" && request.method === "GET") {
        const result = await env.DB.prepare("SELECT * FROM studi ORDER BY data_registrazione DESC").all();
        return new Response(JSON.stringify({ success: true, studi: result.results }), { headers: corsHeaders });
      }

      if (path === "/api/admin/studio" && request.method === "POST") {
        const d = await request.json();
        await env.DB.prepare(`INSERT INTO studi (id, password, nome, piva, email, telefono, indirizzo, citta, stato, data_registrazione, scadenza, licenza_attiva) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(d.id, d.password, d.nome, d.piva, d.email, d.telefono, d.indirizzo, d.citta, d.stato, d.data_registrazione, d.scadenza, d.licenza_attiva || 0).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      if (path === "/api/admin/studio" && request.method === "PUT") {
        const d = await request.json();
        await env.DB.prepare(`UPDATE studi SET nome=?, piva=?, email=?, telefono=?, indirizzo=?, citta=?, stato=?, scadenza=?, licenza_attiva=? WHERE id=?`).bind(d.nome, d.piva, d.email, d.telefono, d.indirizzo, d.citta, d.stato, d.scadenza, d.licenza_attiva, d.id).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      if (path === "/api/admin/studio" && request.method === "DELETE") {
        const d = await request.json();
        await env.DB.prepare("DELETE FROM studi WHERE id=?").bind(d.id).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // ============================================
      // 5. GESTIONE CLIENTI
      // ============================================
      if (path === "/api/studio/clienti" && request.method === "GET") {
        const studioId = url.searchParams.get("studioId");
        const result = await env.DB.prepare("SELECT * FROM clienti WHERE studio_id=? ORDER BY data_registrazione DESC").bind(studioId).all();
        return new Response(JSON.stringify({ success: true, clienti: result.results }), { headers: corsHeaders });
      }

      if (path === "/api/studio/cliente" && request.method === "POST") {
        const d = await request.json();
        await env.DB.prepare(`INSERT INTO clienti (id, password, studio_id, nome_a, cognome_a, nome_b, cognome_b, email, telefono, tipo_evento, data_evento, data_registrazione) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(d.id, d.password, d.studio_id, d.nome_a, d.cognome_a, d.nome_b, d.cognome_b, d.email, d.telefono, d.tipo_evento, d.data_evento, d.data_registrazione).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      if (path === "/api/studio/cliente" && request.method === "PUT") {
        const d = await request.json();
        await env.DB.prepare(`UPDATE clienti SET nome_a=?, cognome_a=?, nome_b=?, cognome_b=?, email=?, telefono=?, tipo_evento=?, data_evento=? WHERE id=?`).bind(d.nome_a, d.cognome_a, d.nome_b, d.cognome_b, d.email, d.telefono, d.tipo_evento, d.data_evento, d.id).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // ============================================
      // 6. GESTIONE PREVENTIVI
      // ============================================
      if (path === "/api/studio/preventivi" && request.method === "GET") {
        const studioId = url.searchParams.get("studioId");
        const result = await env.DB.prepare("SELECT * FROM preventivi WHERE studio_id=? ORDER BY data_creazione DESC").bind(studioId).all();
        return new Response(JSON.stringify({ success: true, preventivi: result.results }), { headers: corsHeaders });
      }

      if (path === "/api/studio/preventivo" && request.method === "POST") {
        const d = await request.json();
        await env.DB.prepare(`INSERT INTO preventivi (id, studio_id, numero, data_emissione, validita, stato, cliente_a_nome, cliente_a_cognome, cliente_a_email, cliente_a_telefono, cliente_a_indirizzo, cliente_b_nome, cliente_b_cognome, servizio_data, servizio_tipo, luogo_cerimonia, luogo_ricevimento, totale_parziale, totale_finale, acconto, saldo, note, condizioni, data_creazione) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(d.id, d.studio_id, d.numero, d.data_emissione, d.validita, d.stato, d.cliente_a_nome, d.cliente_a_cognome, d.cliente_a_email, d.cliente_a_telefono, d.cliente_a_indirizzo, d.cliente_b_nome, d.cliente_b_cognome, d.servizio_data, d.servizio_tipo, d.luogo_cerimonia, d.luogo_ricevimento, d.totale_parziale, d.totale_finale, d.acconto, d.saldo, d.note, d.condizioni, d.data_creazione).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // ============================================
      // 7. GESTIONE RICEVUTE
      // ============================================
      if (path === "/api/studio/ricevute" && request.method === "GET") {
        const studioId = url.searchParams.get("studioId");
        const result = await env.DB.prepare("SELECT * FROM ricevute WHERE studio_id=? ORDER BY data_creazione DESC").bind(studioId).all();
        return new Response(JSON.stringify({ success: true, ricevute: result.results }), { headers: corsHeaders });
      }

      if (path === "/api/studio/ricevuta" && request.method === "POST") {
        const d = await request.json();
        await env.DB.prepare(`INSERT INTO ricevute (id, studio_id, cliente_nome, servizio, importo, data, tipologia, metodo, note, data_creazione) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(d.id, d.studio_id, d.cliente_nome, d.servizio, d.importo, d.data, d.tipologia, d.metodo, d.note, d.data_creazione).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // ============================================
      // 8. GESTIONE WORKFLOW
      // ============================================
      if (path === "/api/studio/workflow" && request.method === "GET") {
        const studioId = url.searchParams.get("studioId");
        const result = await env.DB.prepare("SELECT * FROM workflow WHERE studio_id=? ORDER BY data_creazione DESC").bind(studioId).all();
        return new Response(JSON.stringify({ success: true, workflow: result.results }), { headers: corsHeaders });
      }

      if (path === "/api/studio/workflow" && request.method === "POST") {
        const d = await request.json();
        await env.DB.prepare(`INSERT INTO workflow (id, studio_id, cliente, data_evento, tipo_servizio, scadenza, stato_foto, stato_video, note, data_creazione, ultimo_aggiornamento) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(d.id, d.studio_id, d.cliente, d.data_evento, d.tipo_servizio, d.scadenza, d.stato_foto, d.stato_video, d.note, d.data_creazione, d.ultimo_aggiornamento).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      if (path === "/api/studio/workflow" && request.method === "PUT") {
        const d = await request.json();
        await env.DB.prepare(`UPDATE workflow SET stato_foto=?, stato_video=?, note=?, ultimo_aggiornamento=? WHERE id=?`).bind(d.stato_foto, d.stato_video, d.note, d.ultimo_aggiornamento, d.id).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // ============================================
      // 9. GESTIONE AGENDA
      // ============================================
      if (path === "/api/studio/agenda" && request.method === "GET") {
        const studioId = url.searchParams.get("studioId");
        const result = await env.DB.prepare("SELECT * FROM agenda WHERE studio_id=? ORDER BY data DESC").bind(studioId).all();
        return new Response(JSON.stringify({ success: true, eventi: result.results }), { headers: corsHeaders });
      }

      if (path === "/api/studio/agenda" && request.method === "POST") {
        const d = await request.json();
        await env.DB.prepare(`INSERT INTO agenda (id, studio_id, titolo, data, tipo, note, creato_il) VALUES (?, ?, ?, ?, ?, ?, ?)`).bind(d.id, d.studio_id, d.titolo, d.data, d.tipo, d.note, d.creato_il).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // ============================================
      // 10. GESTIONE EMAIL ARCHIVIO
      // ============================================
      if (path === "/api/studio/email-archivio" && request.method === "GET") {
        const studioId = url.searchParams.get("studioId");
        const result = await env.DB.prepare("SELECT * FROM email_archivio WHERE studio_id=? ORDER BY data_invio DESC").bind(studioId).all();
        return new Response(JSON.stringify({ success: true, archivio: result.results }), { headers: corsHeaders });
      }

      if (path === "/api/studio/email-archivio" && request.method === "POST") {
        const d = await request.json();
        await env.DB.prepare(`INSERT INTO email_archivio (id, studio_id, destinatario, oggetto, corpo, data_invio) VALUES (?, ?, ?, ?, ?, ?)`).bind(d.id, d.studio_id, d.destinatario, d.oggetto, d.corpo, d.data_invio).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // ============================================
      // 11. GESTIONE NEGOZIO (PRODOTTI E ORDINI)
      // ============================================
      if (path === "/api/studio/negozio/prodotti" && request.method === "GET") {
        const studioId = url.searchParams.get("studioId");
        const result = await env.DB.prepare("SELECT * FROM prodotti_negozio WHERE studio_id=?").bind(studioId).all();
        return new Response(JSON.stringify({ success: true, prodotti: result.results }), { headers: corsHeaders });
      }

      if (path === "/api/studio/negozio/prodotto" && request.method === "POST") {
        const d = await request.json();
        await env.DB.prepare(`INSERT INTO prodotti_negozio (id, studio_id, nome, categoria, prezzo, misura, descrizione, data_creazione) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).bind(d.id, d.studio_id, d.nome, d.categoria, d.prezzo, d.misura, d.descrizione, d.data_creazione).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      if (path === "/api/studio/negozio/ordini" && request.method === "GET") {
        const studioId = url.searchParams.get("studioId");
        const result = await env.DB.prepare("SELECT * FROM ordini WHERE studio_id=? ORDER BY data_ordine DESC").bind(studioId).all();
        return new Response(JSON.stringify({ success: true, ordini: result.results }), { headers: corsHeaders });
      }

      if (path === "/api/studio/negozio/ordine" && request.method === "POST") {
        const d = await request.json();
        await env.DB.prepare(`INSERT INTO ordini (id, studio_id, cliente_nome, cliente_email, prodotto_id, importo, stato, data_ordine) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).bind(d.id, d.studio_id, d.cliente_nome, d.cliente_email, d.prodotto_id, d.importo, d.stato, d.data_ordine).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // ============================================
      // 12. CONFIGURAZIONE NEGOZIO (PayPal, WhatsApp)
      // ============================================
      if (path === "/api/studio/negozio-config" && request.method === "GET") {
        const studioId = url.searchParams.get("studioId");
        const result = await env.DB.prepare("SELECT * FROM negozi_config WHERE studio_id=?").bind(studioId).first();
        return new Response(JSON.stringify({ success: true, config: result }), { headers: corsHeaders });
      }

      if (path === "/api/studio/negozio-config" && request.method === "POST") {
        const d = await request.json();
        const existing = await env.DB.prepare("SELECT id FROM negozi_config WHERE studio_id=?").bind(d.studio_id).first();
        if (existing) {
          await env.DB.prepare(`UPDATE negozi_config SET paypal_email=?, whatsapp_numero=?, studio_indirizzo=? WHERE studio_id=?`).bind(d.paypal_email, d.whatsapp_numero, d.studio_indirizzo, d.studio_id).run();
        } else {
          await env.DB.prepare(`INSERT INTO negozi_config (studio_id, paypal_email, whatsapp_numero, studio_indirizzo) VALUES (?, ?, ?, ?)`).bind(d.studio_id, d.paypal_email, d.whatsapp_numero, d.studio_indirizzo).run();
        }
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // ============================================
      // 13. GESTIONE LISTA REGALI
      // ============================================
      if (path === "/api/studio/lista-regali" && request.method === "GET") {
        const studioId = url.searchParams.get("studioId");
        const result = await env.DB.prepare("SELECT * FROM lista_regali WHERE studio_id=?").bind(studioId).first();
        return new Response(JSON.stringify({ success: true, lista: result }), { headers: corsHeaders });
      }

      if (path === "/api/studio/lista-regali" && request.method === "POST") {
        const d = await request.json();
        await env.DB.prepare(`INSERT INTO lista_regali (id, studio_id, nomi, evento, costo_totale, link_pagamento, whatsapp_clienti, raccolto_attuale, data_creazione) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(d.id, d.studio_id, d.nomi, d.evento, d.costo_totale, d.link_pagamento, d.whatsapp_clienti, d.raccolto_attuale, d.data_creazione).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      if (path === "/api/public/lista-regali" && request.method === "GET") {
        const listaId = url.searchParams.get("id");
        const result = await env.DB.prepare("SELECT * FROM lista_regali WHERE id=?").bind(listaId).first();
        return new Response(JSON.stringify({ success: true, lista: result }), { headers: corsHeaders });
      }

      if (path === "/api/public/lista-regali/messaggio" && request.method === "POST") {
        const d = await request.json();
        await env.DB.prepare(`INSERT INTO messaggi_regali (lista_id, nome_donatore, messaggio, data) VALUES (?, ?, ?, ?)`).bind(d.lista_id, d.nome_donatore, d.messaggio, d.data).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      if (path === "/api/public/lista-regali/messaggi" && request.method === "GET") {
        const listaId = url.searchParams.get("listaId");
        const result = await env.DB.prepare("SELECT * FROM messaggi_regali WHERE lista_id=? ORDER BY data DESC").bind(listaId).all();
        return new Response(JSON.stringify({ success: true, messaggi: result.results }), { headers: corsHeaders });
      }

      // ============================================
      // 14. UPLOAD FOTO (R2 BUCKET)
      // ============================================
      if (path === "/api/studio/upload" && request.method === "POST") {
        const studioId = url.searchParams.get("studioId");
        const clienteId = url.searchParams.get("clienteId");
        const filename = url.searchParams.get("filename") || "foto.jpg";
        const folder = url.searchParams.get("folder") || "galleria";
        const body = await request.arrayBuffer();
        const bucket = env.appcenter_studio_foto;
        if (bucket) {
          await bucket.put(`gallerie/${studioId}/${clienteId}/${folder}/${filename}`, body);
          return new Response(JSON.stringify({ success: true, url: `https://appcenter-studio-foto.r2.dev/gallerie/${studioId}/${clienteId}/${folder}/${filename}` }), { headers: corsHeaders });
        }
        return new Response(JSON.stringify({ error: "Bucket non configurato" }), { status: 500, headers: corsHeaders });
      }

      // ============================================
      // 15. LEADS (RICHIESTE DEMO)
      // ============================================
      if (path === "/api/admin/lead" && request.method === "POST") {
        const d = await request.json();
        await env.DB.prepare(`INSERT INTO leads (nome_studio, email, telefono, citta, data_richiesta, stato) VALUES (?, ?, ?, ?, ?, ?)`).bind(d.nome_studio, d.email, d.telefono, d.citta, d.data_richiesta, d.stato || 'da_contattare').run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      if (path === "/api/admin/leads" && request.method === "GET") {
        const result = await env.DB.prepare("SELECT * FROM leads ORDER BY data_richiesta DESC").all();
        return new Response(JSON.stringify({ success: true, leads: result.results }), { headers: corsHeaders });
      }

      // ============================================
      // 16. GESTIONE TEMI COLORI (NUOVO!)
      // ============================================
      if (path === "/api/studio/tema" && request.method === "GET") {
        const studioId = url.searchParams.get("studioId");
        const result = await env.DB.prepare("SELECT * FROM temi_colori WHERE studio_id=?").bind(studioId).first();
        return new Response(JSON.stringify({ success: true, tema: result }), { headers: corsHeaders });
      }

      if (path === "/api/studio/tema" && request.method === "POST") {
        const d = await request.json();
        const existing = await env.DB.prepare("SELECT id FROM temi_colori WHERE studio_id=?").bind(d.studio_id).first();
        if (existing) {
          await env.DB.prepare(`UPDATE temi_colori SET tema_attivo=? WHERE studio_id=?`).bind(d.tema_attivo, d.studio_id).run();
        } else {
          await env.DB.prepare(`INSERT INTO temi_colori (studio_id, tema_attivo) VALUES (?, ?)`).bind(d.studio_id, d.tema_attivo).run();
        }
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      if (path === "/api/admin/temi-lista" && request.method === "GET") {
        return new Response(JSON.stringify({ 
            success: true, 
            temi: Object.keys(TEMI_PRESET).map(key => ({ id: key, nome: TEMI_PRESET[key].nome }))
        }), { headers: corsHeaders });
      }

      // ============================================
      // ROUTE NON TROVATA
      // ============================================
      return new Response(JSON.stringify({ error: "Endpoint non trovato", path: path }), { status: 404, headers: corsHeaders });

    } catch (error) {
      console.error("Errore Worker:", error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
    }
  }
};
