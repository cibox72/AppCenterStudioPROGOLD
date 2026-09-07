export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    const url = new URL(request.url);
    const path = url.pathname;

    // Helper: genera token
    function generaToken() {
      return 'tok-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    // Helper: hash password con SHA-256
    async function hashPassword(password) {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Helper: verifica sessione
    async function verificaSessione(token) {
      if (!token) return null;
      const sess = await env.DB.prepare("SELECT * FROM sessioni WHERE token=? AND scadenza>?").bind(token, Date.now()).first();
      return sess;
    }

    try {
      // ============================================
      // 0. HASH PASSWORD (Utility per convertire password esistenti)
      // ============================================
      if (path === "/api/admin/hash-passwords" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'admin') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        // Hasha tutte le password degli studi
        const studi = await env.DB.prepare("SELECT id, password FROM studi").all();
        for (const s of studi.results) {
          if (!s.password.startsWith('hash:')) {
            const hashed = await hashPassword(s.password);
            await env.DB.prepare("UPDATE studi SET password=? WHERE id=?").bind('hash:' + hashed, s.id).run();
          }
        }

        // Hasha tutte le password dei clienti
        const clienti = await env.DB.prepare("SELECT id, password FROM clienti").all();
        for (const c of clienti.results) {
          if (!c.password.startsWith('hash:')) {
            const hashed = await hashPassword(c.password);
            await env.DB.prepare("UPDATE clienti SET password=? WHERE id=?").bind('hash:' + hashed, c.id).run();
          }
        }

        return new Response(JSON.stringify({ success: true, message: "Password hashate con successo" }), { headers: corsHeaders });
      }

      // ============================================
      // 1. LOGIN (Verifica hash)
      // ============================================
      if (path === "/api/auth/login" && request.method === "POST") {
        const { tipo, id, password } = await request.json();
        const hashedPassword = await hashPassword(password);
        let user = null;

        if (tipo === 'admin' && id === "admin" && password === "58879@Stella") {
          user = { id: 'admin', nome: 'Super Admin' };
        } else if (tipo === 'studio') {
          // Prova sia con hash che senza (per compatibilità)
          user = await env.DB.prepare("SELECT * FROM studi WHERE id=? AND (password=? OR password=?)").bind(id, 'hash:' + hashedPassword, password).first();
        } else if (tipo === 'cliente') {
          user = await env.DB.prepare("SELECT * FROM clienti WHERE id=? AND (password=? OR password=?)").bind(id, 'hash:' + hashedPassword, password).first();
        }

        if (user) {
          const token = generaToken();
          const scadenza = Date.now() + (8 * 60 * 60 * 1000); // 8 ore
          await env.DB.prepare("INSERT OR REPLACE INTO sessioni (token, user_id, tipo, scadenza) VALUES (?, ?, ?, ?)").bind(token, user.id, tipo, scadenza).run();
          return new Response(JSON.stringify({ success: true, token, nome: user.nome || user.nome_a }), { headers: corsHeaders });
        }
        return new Response(JSON.stringify({ error: "Credenziali non valide" }), { status: 401, headers: corsHeaders });
      }

      // ============================================
      // 2. VERIFICA SESSIONE
      // ============================================
      if (path === "/api/auth/verifica" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (sess) {
          let userData = null;
          if (sess.tipo === 'studio') userData = await env.DB.prepare("SELECT * FROM studi WHERE id=?").bind(sess.user_id).first();
          else if (sess.tipo === 'cliente') userData = await env.DB.prepare("SELECT * FROM clienti WHERE id=?").bind(sess.user_id).first();
          return new Response(JSON.stringify({ success: true, tipo: sess.tipo, user: userData }), { headers: corsHeaders });
        }
        return new Response(JSON.stringify({ error: "Sessione scaduta" }), { status: 401, headers: corsHeaders });
      }

      // ============================================
      // 3. LOGOUT
      // ============================================
      if (path === "/api/auth/logout" && request.method === "POST") {
        const { token } = await request.json();
        await env.DB.prepare("DELETE FROM sessioni WHERE token=?").bind(token).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // ============================================
      // 4. ARCHIVIO CREDENZIALI
      // ============================================
      if (path === "/api/admin/credenziali" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'admin') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const studi = await env.DB.prepare("SELECT id, nome, email, password FROM studi").all();
        const clienti = await env.DB.prepare("SELECT id, nome_a, cognome_a, email, password FROM clienti").all();
        return new Response(JSON.stringify({ success: true, studi: studi.results, clienti: clienti.results }), { headers: corsHeaders });
      }

      if (path === "/api/admin/aggiorna-password" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'admin') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const { tipo, id, nuova_password } = await request.json();
        const hashed = await hashPassword(nuova_password);
        if (tipo === 'studio') {
          await env.DB.prepare("UPDATE studi SET password=? WHERE id=?").bind('hash:' + hashed, id).run();
        } else if (tipo === 'cliente') {
          await env.DB.prepare("UPDATE clienti SET password=? WHERE id=?").bind('hash:' + hashed, id).run();
        }
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // ============================================
      // 5. DASHBOARD CLIENTE
      // ============================================
      if (path === "/api/cliente/dashboard" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'cliente') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const result = await env.DB.prepare("SELECT * FROM clienti WHERE id=?").bind(sess.user_id).first();
        return new Response(JSON.stringify({ success: true, cliente: result }), { headers: corsHeaders });
      }

      // ============================================
      // 6. GESTIONE STUDI (con hashing password)
      // ============================================
      if (path === "/api/admin/studi" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'admin') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const result = await env.DB.prepare("SELECT * FROM studi ORDER BY data_registrazione DESC").all();
        return new Response(JSON.stringify({ success: true, studi: result.results }), { headers: corsHeaders });
      }

      if (path === "/api/admin/studio" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'admin') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const d = await request.json();
        const hashed = await hashPassword(d.password);
        await env.DB.prepare(`INSERT INTO studi (id, password, nome, piva, email, telefono, indirizzo, citta, stato, data_registrazione, scadenza, licenza_attiva) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(d.id, 'hash:' + hashed, d.nome, d.piva, d.email, d.telefono, d.indirizzo, d.citta, d.stato, d.data_registrazione, d.scadenza, d.licenza_attiva || 0).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      if (path === "/api/admin/studio" && request.method === "PUT") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'admin') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const d = await request.json();
        await env.DB.prepare(`UPDATE studi SET nome=?, piva=?, email=?, telefono=?, indirizzo=?, citta=?, stato=?, scadenza=?, licenza_attiva=? WHERE id=?`).bind(d.nome, d.piva, d.email, d.telefono, d.indirizzo, d.citta, d.stato, d.scadenza, d.licenza_attiva, d.id).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      if (path === "/api/admin/studio" && request.method === "DELETE") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'admin') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const d = await request.json();
        await env.DB.prepare("DELETE FROM studi WHERE id=?").bind(d.id).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // ============================================
      // 7. GESTIONE CLIENTI (con hashing password)
      // ============================================
      if (path === "/api/studio/clienti" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const studioId = url.searchParams.get("studioId");
        const result = await env.DB.prepare("SELECT * FROM clienti WHERE studio_id=? ORDER BY data_registrazione DESC").bind(studioId).all();
        return new Response(JSON.stringify({ success: true, clienti: result.results }), { headers: corsHeaders });
      }

      if (path === "/api/studio/cliente" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const d = await request.json();
        const hashed = await hashPassword(d.password);
        await env.DB.prepare(`INSERT INTO clienti (id, password, studio_id, nome_a, cognome_a, nome_b, cognome_b, email, telefono, tipo_evento, data_evento, data_registrazione) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(d.id, 'hash:' + hashed, d.studio_id, d.nome_a, d.cognome_a, d.nome_b, d.cognome_b, d.email, d.telefono, d.tipo_evento, d.data_evento, d.data_registrazione).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      if (path === "/api/studio/cliente" && request.method === "PUT") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const d = await request.json();
        await env.DB.prepare(`UPDATE clienti SET nome_a=?, cognome_a=?, nome_b=?, cognome_b=?, email=?, telefono=?, tipo_evento=?, data_evento=? WHERE id=?`).bind(d.nome_a, d.cognome_a, d.nome_b, d.cognome_b, d.email, d.telefono, d.tipo_evento, d.data_evento, d.id).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // ============================================
      // 8. GESTIONE PREVENTIVI
      // ============================================
      if (path === "/api/studio/preventivi" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const studioId = url.searchParams.get("studioId");
        const result = await env.DB.prepare("SELECT * FROM preventivi WHERE studio_id=? ORDER BY data_creazione DESC").bind(studioId).all();
        return new Response(JSON.stringify({ success: true, preventivi: result.results }), { headers: corsHeaders });
      }

      if (path === "/api/studio/preventivo" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const d = await request.json();
        await env.DB.prepare(`INSERT INTO preventivi (id, studio_id, numero, data_emissione, validita, stato, cliente_a_nome, cliente_a_cognome, cliente_a_email, cliente_a_telefono, cliente_a_indirizzo, cliente_b_nome, cliente_b_cognome, servizio_data, servizio_tipo, luogo_cerimonia, luogo_ricevimento, totale_parziale, totale_finale, acconto, saldo, note, condizioni, data_creazione) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(d.id, d.studio_id, d.numero, d.data_emissione, d.validita, d.stato, d.cliente_a_nome, d.cliente_a_cognome, d.cliente_a_email, d.cliente_a_telefono, d.cliente_a_indirizzo, d.cliente_b_nome, d.cliente_b_cognome, d.servizio_data, d.servizio_tipo, d.luogo_cerimonia, d.luogo_ricevimento, d.totale_parziale, d.totale_finale, d.acconto, d.saldo, d.note, d.condizioni, d.data_creazione).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // ============================================
      // 9. GESTIONE RICEVUTE
      // ============================================
      if (path === "/api/studio/ricevute" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const studioId = url.searchParams.get("studioId");
        const result = await env.DB.prepare("SELECT * FROM ricevute WHERE studio_id=? ORDER BY data_creazione DESC").bind(studioId).all();
        return new Response(JSON.stringify({ success: true, ricevute: result.results }), { headers: corsHeaders });
      }

      if (path === "/api/studio/ricevuta" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const d = await request.json();
        await env.DB.prepare(`INSERT INTO ricevute (id, studio_id, cliente_nome, servizio, importo, data, tipologia, metodo, note, data_creazione) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(d.id, d.studio_id, d.cliente_nome, d.servizio, d.importo, d.data, d.tipologia, d.metodo, d.note, d.data_creazione).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // ============================================
      // 10. GESTIONE WORKFLOW
      // ============================================
      if (path === "/api/studio/workflow" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const studioId = url.searchParams.get("studioId");
        const result = await env.DB.prepare("SELECT * FROM workflow WHERE studio_id=? ORDER BY data_creazione DESC").bind(studioId).all();
        return new Response(JSON.stringify({ success: true, workflow: result.results }), { headers: corsHeaders });
      }

      if (path === "/api/studio/workflow" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const d = await request.json();
        await env.DB.prepare(`INSERT INTO workflow (id, studio_id, cliente, data_evento, tipo_servizio, scadenza, stato_foto, stato_video, note, data_creazione, ultimo_aggiornamento) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(d.id, d.studio_id, d.cliente, d.data_evento, d.tipo_servizio, d.scadenza, d.stato_foto, d.stato_video, d.note, d.data_creazione, d.ultimo_aggiornamento).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      if (path === "/api/studio/workflow" && request.method === "PUT") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const d = await request.json();
        await env.DB.prepare(`UPDATE workflow SET stato_foto=?, stato_video=?, note=?, ultimo_aggiornamento=? WHERE id=?`).bind(d.stato_foto, d.stato_video, d.note, d.ultimo_aggiornamento, d.id).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // ============================================
      // 11. GESTIONE AGENDA
      // ============================================
      if (path === "/api/studio/agenda" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const studioId = url.searchParams.get("studioId");
        const result = await env.DB.prepare("SELECT * FROM agenda WHERE studio_id=? ORDER BY data DESC").bind(studioId).all();
        return new Response(JSON.stringify({ success: true, eventi: result.results }), { headers: corsHeaders });
      }

      if (path === "/api/studio/agenda" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const d = await request.json();
        await env.DB.prepare(`INSERT INTO agenda (id, studio_id, titolo, data, tipo, note, creato_il) VALUES (?, ?, ?, ?, ?, ?, ?)`).bind(d.id, d.studio_id, d.titolo, d.data, d.tipo, d.note, d.creato_il).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // ============================================
      // 12. GESTIONE EMAIL ARCHIVIO
      // ============================================
      if (path === "/api/studio/email-archivio" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const studioId = url.searchParams.get("studioId");
        const result = await env.DB.prepare("SELECT * FROM email_archivio WHERE studio_id=? ORDER BY data_invio DESC").bind(studioId).all();
        return new Response(JSON.stringify({ success: true, archivio: result.results }), { headers: corsHeaders });
      }

      if (path === "/api/studio/email-archivio" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const d = await request.json();
        await env.DB.prepare(`INSERT INTO email_archivio (id, studio_id, destinatario, oggetto, corpo, data_invio) VALUES (?, ?, ?, ?, ?, ?)`).bind(d.id, d.studio_id, d.destinatario, d.oggetto, d.corpo, d.data_invio).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // ============================================
      // 13. GESTIONE NEGOZIO
      // ============================================
      if (path === "/api/studio/negozio/prodotti" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const studioId = url.searchParams.get("studioId");
        const result = await env.DB.prepare("SELECT * FROM prodotti_negozio WHERE studio_id=?").bind(studioId).all();
        return new Response(JSON.stringify({ success: true, prodotti: result.results }), { headers: corsHeaders });
      }

      if (path === "/api/studio/negozio/prodotto" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const d = await request.json();
        await env.DB.prepare(`INSERT INTO prodotti_negozio (id, studio_id, nome, categoria, prezzo, misura, descrizione, data_creazione) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).bind(d.id, d.studio_id, d.nome, d.categoria, d.prezzo, d.misura, d.descrizione, d.data_creazione).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      if (path === "/api/studio/negozio-config" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const studioId = url.searchParams.get("studioId");
        const result = await env.DB.prepare("SELECT * FROM negozi_config WHERE studio_id=?").bind(studioId).first();
        return new Response(JSON.stringify({ success: true, config: result }), { headers: corsHeaders });
      }

      if (path === "/api/studio/negozio-config" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

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
      // 14. GESTIONE LISTA REGALI
      // ============================================
      if (path === "/api/studio/lista-regali" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const studioId = url.searchParams.get("studioId");
        const result = await env.DB.prepare("SELECT * FROM lista_regali WHERE studio_id=?").bind(studioId).all();
        return new Response(JSON.stringify({ success: true, lista: result.results }), { headers: corsHeaders });
      }

      if (path === "/api/studio/lista-regali" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

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
        await env.DB.prepare(`INSERT INTO messaggi_regali (lista_id, nome_donatore, messaggio, importo, data) VALUES (?, ?, ?, ?, ?)`).bind(d.lista_id, d.nome_donatore, d.messaggio, d.importo || 0, d.data).run();
        
        // Aggiorna il raccolto
        const lista = await env.DB.prepare("SELECT * FROM lista_regali WHERE id=?").bind(d.lista_id).first();
        if (lista) {
          const nuovoRaccolto = (parseFloat(lista.raccolto_attuale || 0) + parseFloat(d.importo || 0));
          await env.DB.prepare("UPDATE lista_regali SET raccolto_attuale=? WHERE id=?").bind(nuovoRaccolto, d.lista_id).run();
        }
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      if (path === "/api/public/lista-regali/messaggi" && request.method === "GET") {
        const listaId = url.searchParams.get("listaId");
        const result = await env.DB.prepare("SELECT * FROM messaggi_regali WHERE lista_id=? ORDER BY data DESC").bind(listaId).all();
        return new Response(JSON.stringify({ success: true, messaggi: result.results }), { headers: corsHeaders });
      }

      // ============================================
      // 15. UPLOAD FOTO (R2 BUCKET)
      // ============================================
      if (path === "/api/studio/upload" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const studioId = url.searchParams.get("studioId");
        const clienteId = url.searchParams.get("clienteId");
        const filename = url.searchParams.get("filename") || "foto.jpg";
        const folder = url.searchParams.get("folder") || "galleria";
        const body = await request.arrayBuffer();
        const bucket = env.appcenter_studio_foto;
        if (bucket) {
          await bucket.put(`gallerie/${studioId}/${clienteId}/${folder}/${Date.now()}_${filename}`, body);
          return new Response(JSON.stringify({ success: true, url: `https://appcenter-studio-foto.r2.dev/gallerie/${studioId}/${clienteId}/${folder}/${filename}` }), { headers: corsHeaders });
        }
        return new Response(JSON.stringify({ error: "Bucket non configurato" }), { status: 500, headers: corsHeaders });
      }

      // ============================================
      // 16. LEADS
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
      // 17. GESTIONE TEMI COLORI
      // ============================================
      if (path === "/api/studio/tema" && request.method === "GET") {
        const studioId = url.searchParams.get("studioId");
        const result = await env.DB.prepare("SELECT * FROM temi_colori WHERE studio_id=?").bind(studioId).first();
        return new Response(JSON.stringify({ success: true, tema: result }), { headers: corsHeaders });
      }

      if (path === "/api/studio/tema" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const d = await request.json();
        const existing = await env.DB.prepare("SELECT id FROM temi_colori WHERE studio_id=?").bind(d.studio_id).first();
        if (existing) {
          await env.DB.prepare(`UPDATE temi_colori SET tema_attivo=? WHERE studio_id=?`).bind(d.tema_attivo, d.studio_id).run();
        } else {
          await env.DB.prepare(`INSERT INTO temi_colori (studio_id, tema_attivo) VALUES (?, ?)`).bind(d.studio_id, d.tema_attivo).run();
        }
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
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
