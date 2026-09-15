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

    function generaToken() {
      return 'tok-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    async function hashPassword(password) {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async function verificaSessione(token) {
      if (!token) return null;
      return await env.DB.prepare("SELECT * FROM sessioni WHERE token=? AND scadenza>?").bind(token, Date.now()).first();
    }

    async function creaNotifica(tipo, titolo, messaggio, dati) {
      const id = 'not-' + Date.now();
      await env.DB.prepare(
        "INSERT INTO notifiche (id, tipo, titolo, messaggio, dati, letto, data_creazione) VALUES (?, ?, ?, ?, ?, ?, ?)"
      ).bind(id, tipo, titolo, messaggio, JSON.stringify(dati), 0, new Date().toISOString()).run();
    }

    async function generaIdCliente(studioId) {
      const result = await env.DB.prepare(
        "SELECT id FROM anagrafica_clienti WHERE studio_id=? ORDER BY CAST(SUBSTR(id, 5) AS INTEGER) DESC LIMIT 1"
      ).bind(studioId).first();
      let prossimoNumero = 1;
      if (result && result.id) {
        const numeroEsistente = parseInt(result.id.replace('CLI-', ''));
        prossimoNumero = numeroEsistente + 1;
      }
      return 'CLI-' + String(prossimoNumero).padStart(5, '0');
    }

    function generaUsername(nome, cognome) {
      const base = (nome + '.' + cognome).toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '');
      const numero = Math.floor(Math.random() * 9000) + 1000;
      return base + numero;
    }

    function generaPassword() {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
      let password = '';
      for (let i = 0; i < 8; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return password;
    }

    try {
      // ============================================
      // 1. LOGIN
      // ============================================
      if (path === "/api/auth/login" && request.method === "POST") {
        const { tipo, id, password } = await request.json();
        const hashedPassword = await hashPassword(password);
        let user = null;

        if (tipo === 'admin' && id === "admin" && password === "58879@Stella") {
          user = { id: 'admin', nome: 'Super Admin' };
        } else if (tipo === 'studio') {
          user = await env.DB.prepare("SELECT * FROM studi WHERE id=? AND (password=? OR password=?) AND attivo=1").bind(id, 'hash:' + hashedPassword, password).first();
        } else if (tipo === 'cliente') {
          user = await env.DB.prepare("SELECT * FROM clienti WHERE id=? AND (password=? OR password=?)").bind(id, 'hash:' + hashedPassword, password).first();
        }

        if (user) {
          const token = generaToken();
          const scadenza = Date.now() + (8 * 60 * 60 * 1000);
          await env.DB.prepare("INSERT OR REPLACE INTO sessioni (token, user_id, tipo, scadenza) VALUES (?, ?, ?, ?)").bind(token, user.id, tipo, scadenza).run();
          return new Response(JSON.stringify({ success: true, token, nome: user.nome || user.nome_a }), { headers: corsHeaders });
        }
        return new Response(JSON.stringify({ error: "Credenziali non valide o account disattivato" }), { status: 401, headers: corsHeaders });
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
      // 4-16. CRM, NOTIFICHE, CLIENTI FOTO (Admin/Studio)
      // ============================================
      if (path === "/api/admin/crm/studi" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'admin') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const result = await env.DB.prepare("SELECT * FROM studi ORDER BY data_registrazione DESC").all();
        return new Response(JSON.stringify({ success: true, studi: result.results }), { headers: corsHeaders });
      }

      if (path === "/api/admin/crm/studio" && request.method === "PUT") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'admin') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const d = await request.json();
        const updates = []; const params = [];
        if (d.nome !== undefined) { updates.push("nome=?"); params.push(d.nome); }
        if (d.email !== undefined) { updates.push("email=?"); params.push(d.email); }
        if (d.telefono !== undefined) { updates.push("telefono=?"); params.push(d.telefono); }
        if (d.piva !== undefined) { updates.push("piva=?"); params.push(d.piva); }
        if (d.stato_abbonamento !== undefined) { updates.push("stato_abbonamento=?"); params.push(d.stato_abbonamento); }
        if (d.scadenza !== undefined) { updates.push("scadenza=?"); params.push(d.scadenza); }
        if (d.attivo !== undefined) { updates.push("attivo=?"); params.push(d.attivo ? 1 : 0); }
        if (d.password !== undefined && d.password !== '') {
          const hashed = await hashPassword(d.password);
          updates.push("password=?"); params.push('hash:' + hashed);
          updates.push("password_plain=?"); params.push(d.password);
        }
        if (updates.length === 0) return new Response(JSON.stringify({ error: "Nessun campo da aggiornare" }), { status: 400, headers: corsHeaders });
        params.push(d.id);
        await env.DB.prepare(`UPDATE studi SET ${updates.join(', ')} WHERE id=?`).bind(...params).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      if (path === "/api/admin/crm/studio" && request.method === "DELETE") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'admin') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const d = await request.json();
        const studioId = d.id;
        try {
          const bucket = env.appcenter_studio_foto;
          if (bucket) {
            const prefixes = [`loghi/${studioId}/`, `gallerie/${studioId}/`, `selezioni/${studioId}/`];
            for (const prefix of prefixes) {
              let cursor = undefined;
              do {
                const listed = await bucket.list({ prefix, cursor });
                if (listed.objects.length > 0) await bucket.delete(listed.objects.map(obj => obj.key));
                cursor = listed.truncated ? listed.cursor : undefined;
              } while (cursor);
            }
          }
          await env.DB.prepare("DELETE FROM messaggi_regali WHERE lista_id IN (SELECT id FROM lista_regali WHERE studio_id=?)").bind(studioId).run();
          await env.DB.prepare("DELETE FROM sessioni WHERE user_id=? AND tipo='studio'").bind(studioId).run();
          const tablesToClean = ['clienti', 'servizi', 'preventivi', 'contratti', 'workflow', 'ricevute', 'agenda', 'email_archivio', 'prodotti_negozio', 'negozi_config', 'ordini_negozio', 'lista_regali', 'link_utili', 'gallerie', 'temi_colori', 'email_config', 'anagrafica_clienti', 'cartelle_cliente', 'selezioni_album'];
          for (const table of tablesToClean) {
            try { await env.DB.prepare(`DELETE FROM ${table} WHERE studio_id=?`).bind(studioId).run(); } catch(e) {}
            try { await env.DB.prepare(`DELETE FROM ${table} WHERE id LIKE '%-${studioId}-%'`).run(); } catch(e) {}
          }
          await env.DB.prepare("DELETE FROM studi WHERE id=?").bind(studioId).run();
          return new Response(JSON.stringify({ success: true, message: "Studio eliminato con successo" }), { headers: corsHeaders });
        } catch (error) {
          return new Response(JSON.stringify({ error: "Errore interno: " + error.message }), { status: 500, headers: corsHeaders });
        }
      }

      if (path === "/api/admin/crm/studio" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'admin') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const d = await request.json();
        const hashed = await hashPassword(d.password);
        await env.DB.prepare(`INSERT INTO studi (id, password, password_plain, nome, piva, email, telefono, indirizzo, citta, stato, data_registrazione, scadenza, licenza_attiva, attivo, stato_abbonamento, scheda_completata) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(d.id, 'hash:' + hashed, d.password, d.nome, d.piva, d.email, d.telefono, d.indirizzo, d.citta, d.stato, d.data_registrazione || new Date().toISOString().split('T')[0], d.scadenza, 1, 1, 'attivo', 0).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      if (path === "/api/admin/crm/clienti" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'admin') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const result = await env.DB.prepare("SELECT * FROM clienti ORDER BY data_registrazione DESC").all();
        return new Response(JSON.stringify({ success: true, clienti: result.results }), { headers: corsHeaders });
      }

      if (path === "/api/admin/notifiche" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'admin') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const result = await env.DB.prepare("SELECT * FROM notifiche WHERE (archiviata IS NULL OR archiviata=0) ORDER BY data_creazione DESC LIMIT 100").all();
        const nonLette = await env.DB.prepare("SELECT COUNT(*) as count FROM notifiche WHERE letto=0 AND (archiviata IS NULL OR archiviata=0)").first();
        return new Response(JSON.stringify({ success: true, notifiche: result.results, nonLette: nonLette.count }), { headers: corsHeaders });
      }

      if (path === "/api/admin/notifica/letta" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'admin') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const { id } = await request.json();
        await env.DB.prepare("UPDATE notifiche SET letto=1 WHERE id=?").bind(id).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      if (path === "/api/admin/notifiche/lette" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'admin') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        await env.DB.prepare("UPDATE notifiche SET letto=1 WHERE (archiviata IS NULL OR archiviata=0)").run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      if (path.startsWith("/api/admin/notifica/") && request.method === "DELETE") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'admin') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const id = path.split("/api/admin/notifica/")[1];
        await env.DB.prepare("DELETE FROM notifiche WHERE id=?").bind(id).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      if (path === "/api/public/registra-studio" && request.method === "POST") {
        const d = await request.json();
        const hashed = await hashPassword(d.password);
        const studioId = 'studio-' + Date.now();
        await env.DB.prepare(`INSERT INTO studi (id, password, password_plain, nome, piva, email, telefono, indirizzo, citta, stato, data_registrazione, scadenza, licenza_attiva, attivo, stato_abbonamento, scheda_completata) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(studioId, 'hash:' + hashed, d.password, d.nome, d.piva, d.email, d.telefono, d.indirizzo, d.citta, d.stato, new Date().toISOString().split('T')[0], d.scadenza, 0, 1, 'trial', 0).run();
        await creaNotifica('registrazione', 'Nuova Richiesta di Registrazione', `Studio "${d.nome}" ha richiesto la prova. Email: ${d.email}`, { ...d, studioId });
        return new Response(JSON.stringify({ success: true, studioId }), { headers: corsHeaders });
      }

      if (path === "/api/cliente/dashboard" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'cliente') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const result = await env.DB.prepare("SELECT * FROM clienti WHERE id=?").bind(sess.user_id).first();
        return new Response(JSON.stringify({ success: true, cliente: result }), { headers: corsHeaders });
      }

      if (path === "/api/cliente/foto/cartelle" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const clienteId = url.searchParams.get("clienteId");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'cliente' || sess.user_id !== clienteId) return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const cliente = await env.DB.prepare("SELECT studio_id FROM clienti WHERE id=?").bind(clienteId).first();
        const bucket = env.appcenter_studio_foto;
        const prefix = `gallerie/${cliente.studio_id}/${clienteId}/`;
        const objects = await bucket.list({ prefix });
        const cartelleSet = new Set();
        for (const object of objects.objects) {
            const parts = object.key.replace(prefix, '').split('/');
            if (parts.length > 1 && parts[0] !== "") cartelleSet.add(parts[0]);
        }
        return new Response(JSON.stringify({ success: true, cartelle: Array.from(cartelleSet) }), { headers: corsHeaders });
      }

      if (path === "/api/cliente/foto/elenco" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const clienteId = url.searchParams.get("clienteId");
        const cartella = url.searchParams.get("cartella");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'cliente' || sess.user_id !== clienteId) return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const cliente = await env.DB.prepare("SELECT studio_id FROM clienti WHERE id=?").bind(clienteId).first();
        const bucket = env.appcenter_studio_foto;
        const prefix = `gallerie/${cliente.studio_id}/${clienteId}/${cartella}/`;
        const objects = await bucket.list({ prefix });
        const foto = objects.objects.map(obj => ({ name: obj.key.split('/').pop(), url: `https://appcenter-studio-foto.r2.dev/${obj.key}` }));
        return new Response(JSON.stringify({ success: true, foto }), { headers: corsHeaders });
      }

      if (path === "/api/cliente/selezione/invia" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const clienteId = url.searchParams.get("clienteId");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'cliente' || sess.user_id !== clienteId) return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const { selezionate } = await request.json();
        const cliente = await env.DB.prepare("SELECT studio_id, nome_a, cognome_a FROM clienti WHERE id=?").bind(clienteId).first();
        const bucket = env.appcenter_studio_foto;
        const prefix = `gallerie/${cliente.studio_id}/${clienteId}/`;
        const allObjects = await bucket.list({ prefix });
        let fileTestoContenuto = `FOTO SELEZIONATE DAL CLIENTE\nCliente: ${cliente.nome_a} ${cliente.cognome_a}\nData: ${new Date().toLocaleString('it-IT')}\n----------------------------------------\n`;
        for (const obj of allObjects.objects) {
            const filename = obj.key.split('/').pop();
            if (filename.endsWith('.txt')) continue;
            if (selezionate.includes(filename)) fileTestoContenuto += `${filename}\n`;
            else await bucket.delete(obj.key);
        }
        await bucket.put(`${prefix}SELEZIONE_${Date.now()}.txt`, fileTestoContenuto);
        await env.DB.prepare("INSERT INTO notifiche (id, tipo, titolo, messaggio, dati, letto, data_creazione) VALUES (?, ?, ?, ?, ?, ?, ?)").bind('not-' + Date.now(), 'selezione_foto', 'Nuova Selezione Foto Completata', JSON.stringify({ clienteId, studioId: cliente.studio_id }), 0, new Date().toISOString()).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // ============================================
      // SERVIZI, PREVENTIVI, WORKFLOW, RICEVUTE, AGENDA, CLIENTI, EMAIL
      // ============================================
      if (path === "/api/studio/servizi" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const result = await env.DB.prepare("SELECT * FROM servizi WHERE studio_id=? ORDER BY categoria, descrizione").bind(url.searchParams.get("studioId")).all();
        return new Response(JSON.stringify({ success: true, servizi: result.results }), { headers: corsHeaders });
      }
      if (path === "/api/studio/servizio" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const d = await request.json();
        await env.DB.prepare(`INSERT INTO servizi (id, studio_id, categoria, descrizione, prezzo, data_creazione) VALUES (?, ?, ?, ?, ?, ?)`).bind(d.id, d.studio_id, d.categoria, d.descrizione, d.prezzo, d.data_creazione || new Date().toISOString()).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }
      if (path.startsWith("/api/studio/servizio/") && request.method === "PUT") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const id = path.split("/api/studio/servizio/")[1];
        const d = await request.json();
        await env.DB.prepare(`UPDATE servizi SET categoria=?, descrizione=?, prezzo=? WHERE id=?`).bind(d.categoria, d.descrizione, d.prezzo, id).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }
      if (path.startsWith("/api/studio/servizio/") && request.method === "DELETE") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const id = path.split("/api/studio/servizio/")[1];
        await env.DB.prepare("DELETE FROM servizi WHERE id=?").bind(id).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      if (path === "/api/studio/preventivi" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const result = await env.DB.prepare("SELECT * FROM preventivi WHERE studio_id=? ORDER BY data_creazione DESC").bind(url.searchParams.get("studioId")).all();
        return new Response(JSON.stringify({ success: true, preventivi: result.results }), { headers: corsHeaders });
      }
      if (path === "/api/studio/preventivo" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const d = await request.json();
        await env.DB.prepare(`INSERT INTO preventivi (id, studio_id, numero, data_emissione, data_servizio, tipo_servizio, luogo_cerimonia, luogo_ricevimento, cliente_a, cliente_b, servizi, acconti, piano_pagamento, sconto_perc, sconto_fisso, sconto_fisso_nota, accettato, note, totale_finale, stato, data_creazione) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
          d.id, d.studio_id, d.numero, d.data_emissione, d.data_servizio || null, d.tipo_servizio || null, d.luogo_cerimonia || null, d.luogo_ricevimento || null,
          JSON.stringify(d.cliente_a || {}), JSON.stringify(d.cliente_b || {}), JSON.stringify(d.servizi || []), JSON.stringify(d.acconti || []), JSON.stringify(d.piano_pagamento || []),
          d.sconto_perc || 0, d.sconto_fisso || 0, d.sconto_fisso_nota || null, d.accettato ? 1 : 0, d.note || null, d.totale_finale || 0, d.stato || 'bozza', d.data_creazione || new Date().toISOString()
        ).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }
      if (path.startsWith("/api/studio/preventivo/") && request.method === "DELETE") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const id = path.split("/api/studio/preventivo/")[1];
        await env.DB.prepare("DELETE FROM preventivi WHERE id = ? AND studio_id = ?").bind(id, sess.user_id).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      if (path === "/api/studio/notifica-accettazione" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const d = await request.json();
        const studio = await env.DB.prepare("SELECT nome FROM studi WHERE id=?").bind(sess.user_id).first();
        await creaNotifica('preventivo_accettato', 'Preventivo Accettato dal Cliente', `Lo studio "${studio ? studio.nome : sess.user_id}" ha registrato l'accettazione. ${d.messaggio || ''}`, { studio_id: sess.user_id, ...d });
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      if (path === "/api/studio/workflow" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const studioIdQuery = url.searchParams.get("studioId") || sess.user_id;
        const result = await env.DB.prepare("SELECT * FROM workflow WHERE studio_id=? ORDER BY data_creazione DESC").bind(studioIdQuery).all();
        return new Response(JSON.stringify({ success: true, workflow: result.results.map(w => ({ ...w, tasks: JSON.parse(w.note || '{}') })) }), { headers: corsHeaders });
      }
      if (path === "/api/studio/workflow" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const d = await request.json();
        const clienteCompleto = `${d.cliente_id || ''} - ${d.nome_cliente || ''}`.trim();
        await env.DB.prepare(`INSERT INTO workflow (id, studio_id, cliente, data_evento, tipo_servizio, scadenza, stato_foto, stato_video, note, data_creazione, ultimo_aggiornamento) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
          d.id, d.studio_id, clienteCompleto, d.data_servizio || null, d.tipo_servizio || '', null, 'da_fare', 'da_fare', JSON.stringify(d.tasks || {}), d.data_creazione || new Date().toISOString(), new Date().toISOString()
        ).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }
      if (path.startsWith("/api/studio/workflow/") && request.method === "PUT") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const id = path.split("/api/studio/workflow/")[1];
        const d = await request.json();
        await env.DB.prepare(`UPDATE workflow SET note=?, ultimo_aggiornamento=? WHERE id=?`).bind(JSON.stringify(d.tasks || {}), new Date().toISOString(), id).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }
      if (path.startsWith("/api/studio/workflow/") && request.method === "DELETE") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const id = path.split("/api/studio/workflow/")[1];
        await env.DB.prepare("DELETE FROM workflow WHERE id=?").bind(id).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      if (path === "/api/studio/ricevute" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const result = await env.DB.prepare("SELECT * FROM ricevute WHERE studio_id=? ORDER BY data_creazione DESC").bind(url.searchParams.get("studioId")).all();
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

      if (path === "/api/studio/agenda" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const result = await env.DB.prepare("SELECT * FROM agenda WHERE studio_id=? ORDER BY data DESC").bind(url.searchParams.get("studioId")).all();
        return new Response(JSON.stringify({ success: true, eventi: result.results }), { headers: corsHeaders });
      }
      if (path === "/api/studio/agenda" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const d = await request.json();
        await env.DB.prepare(`INSERT INTO agenda (id, studio_id, titolo, data, ora_inizio, ora_fine, descrizione, luogo, tipo_servizio, squadra, cliente, note, creato_il) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(d.id, d.studio_id, d.titolo, d.data, d.ora_inizio || null, d.ora_fine || null, d.descrizione || null, d.luogo || null, d.tipo_servizio || null, d.squadra || 'Squadra 1', d.cliente || null, d.note || null, d.data_creazione || new Date().toISOString()).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }
      if (path.startsWith("/api/studio/agenda/") && request.method === "PUT") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const id = path.split("/api/studio/agenda/")[1];
        const d = await request.json();
        const updates = []; const params = [];
        ['titolo', 'data', 'ora_inizio', 'ora_fine', 'descrizione', 'luogo', 'tipo_servizio', 'squadra', 'cliente', 'note'].forEach(field => {
            if (d[field] !== undefined) { updates.push(`${field}=?`); params.push(d[field]); }
        });
        if (updates.length === 0) return new Response(JSON.stringify({ error: "Nessun campo da aggiornare" }), { status: 400, headers: corsHeaders });
        params.push(id);
        await env.DB.prepare(`UPDATE agenda SET ${updates.join(', ')} WHERE id=?`).bind(...params).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }
      if (path.startsWith("/api/studio/agenda/") && request.method === "DELETE") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const id = path.split("/api/studio/agenda/")[1];
        await env.DB.prepare("DELETE FROM agenda WHERE id=?").bind(id).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      if (path === "/api/studio/clienti" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const result = await env.DB.prepare("SELECT * FROM clienti WHERE studio_id=? ORDER BY data_registrazione DESC").bind(url.searchParams.get("studioId")).all();
        return new Response(JSON.stringify({ success: true, clienti: result.results }), { headers: corsHeaders });
      }
      if (path === "/api/studio/cliente" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const d = await request.json();
        const hashed = await hashPassword(d.password);
        await env.DB.prepare(`INSERT INTO clienti (id, password, password_plain, studio_id, nome_a, cognome_a, nome_b, cognome_b, email, telefono, tipo_evento, data_evento, data_registrazione) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(d.id, 'hash:' + hashed, d.password, d.studio_id, d.nome_a, d.cognome_a, d.nome_b, d.cognome_b, d.email, d.telefono, d.tipo_evento, d.data_evento, d.data_registrazione).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      if (path === "/api/studio/email-archivio" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const result = await env.DB.prepare("SELECT * FROM email_archivio WHERE studio_id=? ORDER BY data_invio DESC").bind(url.searchParams.get("studioId")).all();
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
      // NEGOZIO (COMPLETO E CORRETTO)
      // ============================================
      if (path === "/api/studio/negozio/prodotti" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const result = await env.DB.prepare("SELECT * FROM prodotti_negozio WHERE studio_id=? ORDER BY data_creazione DESC").bind(url.searchParams.get("studioId")).all();
        return new Response(JSON.stringify({ success: true, prodotti: result.results }), { headers: corsHeaders });
      }
      if (path === "/api/studio/negozio/prodotto" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const d = await request.json();
        await env.DB.prepare(`INSERT INTO prodotti_negozio (id, studio_id, nome, categoria, prezzo, misura, descrizione, colori, misure, immagine, data_creazione) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(d.id, d.studio_id, d.nome, d.categoria, d.prezzo, d.misura, d.descrizione, d.colori || '', d.misure || '', d.immagine || '', d.data_creazione).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }
      if (path.startsWith("/api/studio/negozio/prodotto/") && request.method === "DELETE") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const id = path.split("/api/studio/negozio/prodotto/")[1];
        await env.DB.prepare("DELETE FROM prodotti_negozio WHERE id=?").bind(id).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      if (path === "/api/studio/negozio/ordini" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const result = await env.DB.prepare("SELECT * FROM ordini_negozio WHERE studio_id=? ORDER BY data_creazione DESC").bind(url.searchParams.get("studioId")).all();
        return new Response(JSON.stringify({ success: true, ordini: result.results }), { headers: corsHeaders });
      }
      if (path === "/api/studio/negozio/ordine" && request.method === "POST") {
        const d = await request.json();
        const studioId = d.studio_id || url.searchParams.get("studioId");
        if (!studioId) return new Response(JSON.stringify({ error: "Studio ID mancante" }), { status: 400, headers: corsHeaders });
        const orderId = 'ord-' + Date.now();
        await env.DB.prepare(`INSERT INTO ordini_negozio (id, studio_id, codice_ordine, cliente_nome, cliente_telefono, cliente_email, prodotti, totale, stato, metodo_pagamento, file_url, letto, data_creazione) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
          orderId, studioId, d.codice_ordine, d.cliente_nome, d.cliente_telefono, d.cliente_email, d.prodotti, d.totale, d.stato || 'in_attesa', d.metodo_pagamento || 'anticipato', d.file_url || '', 0, d.data_creazione || new Date().toISOString()
        ).run();
        return new Response(JSON.stringify({ success: true, id: orderId }), { headers: corsHeaders });
      }
      if (path.startsWith("/api/studio/negozio/ordine/") && request.method === "PUT") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const id = path.split("/api/studio/negozio/ordine/")[1];
        const d = await request.json();
        await env.DB.prepare(`UPDATE ordini_negozio SET stato=? WHERE id=?`).bind(d.stato, id).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      if (path === "/api/studio/negozio-config" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const result = await env.DB.prepare("SELECT * FROM negozi_config WHERE studio_id=?").bind(url.searchParams.get("studioId")).first();
        return new Response(JSON.stringify({ success: true, config: result }), { headers: corsHeaders });
      }
      if (path === "/api/studio/negozio-config" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const d = await request.json();
        const existing = await env.DB.prepare("SELECT id FROM negozi_config WHERE studio_id=?").bind(d.studio_id).first();
        if (existing) {
          await env.DB.prepare(`UPDATE negozi_config SET paypal_email=?, iban_numero=?, satispay_numero=?, stripe_link=?, whatsapp_numero=?, studio_indirizzo=?, msg_benvenuto=?, msg_ritiro=?, metodi_pagamento=? WHERE studio_id=?`).bind(
            d.paypal_email || '', d.iban_numero || '', d.satispay_numero || '', d.stripe_link || '', d.whatsapp_numero || '', d.studio_indirizzo || '', d.msg_benvenuto || '', d.msg_ritiro || '', d.metodi_pagamento || '', d.studio_id
          ).run();
        } else {
          await env.DB.prepare(`INSERT INTO negozi_config (studio_id, paypal_email, iban_numero, satispay_numero, stripe_link, whatsapp_numero, studio_indirizzo, msg_benvenuto, msg_ritiro, metodi_pagamento) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
            d.studio_id, d.paypal_email || '', d.iban_numero || '', d.satispay_numero || '', d.stripe_link || '', d.whatsapp_numero || '', d.studio_indirizzo || '', d.msg_benvenuto || '', d.msg_ritiro || '', d.metodi_pagamento || ''
          ).run();
        }
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // ============================================
      // LISTA REGALI (CORRETTO E COMPLETO)
      // ============================================
      if (path === "/api/studio/lista-regali" && request.method === "GET") {
          const token = url.searchParams.get("token");
          const sess = await verificaSessione(token);
          if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
          const result = await env.DB.prepare("SELECT * FROM lista_regali WHERE studio_id=? ORDER BY data_creazione DESC").bind(sess.user_id).all();
          return new Response(JSON.stringify({ success: true, lista: result.results }), { headers: corsHeaders });
      }
      if (path === "/api/studio/lista-regali" && request.method === "POST") {
          const token = url.searchParams.get("token");
          const sess = await verificaSessione(token);
          if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
          const d = await request.json();
          await env.DB.prepare(`INSERT INTO lista_regali (id, studio_id, cliente_id, cliente_nome, tipo_evento, importo_servizio, metodo_pagamento, dati_pagamento, messaggio_cortesia, messaggio_ringraziamento, username, password, link_pubblico, raccolto_attuale, stato, data_creazione) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
              d.id, d.studio_id, d.cliente_id, d.cliente_nome, d.tipo_evento, d.importo_servizio, d.metodo_pagamento, d.dati_pagamento, d.messaggio_cortesia, d.messaggio_ringraziamento || '', d.username, d.password, d.link_pubblico, d.raccolto_attuale || 0, d.stato || 'in_corso', d.data_creazione || new Date().toISOString()
          ).run();
          return new Response(JSON.stringify({ success: true, id: d.id }), { headers: corsHeaders });
      }
      if (path.startsWith("/api/studio/lista-regali/") && request.method === "DELETE") {
          const token = url.searchParams.get("token");
          const sess = await verificaSessione(token);
          if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
          const id = path.split("/api/studio/lista-regali/")[1];
          await env.DB.prepare("DELETE FROM lista_regali WHERE id=? AND studio_id=?").bind(id, sess.user_id).run();
          return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }
      if (path.startsWith("/api/public/lista-regali/") && request.method === "GET" && !path.includes("findByCredentials") && !path.includes("donazioni") && !path.includes("messaggi") && !path.includes("messaggio") && !path.includes("aggiorna-totale")) {
          const id = path.split("/api/public/lista-regali/")[1];
          const result = await env.DB.prepare("SELECT * FROM lista_regali WHERE id=?").bind(id).first();
          if (!result) return new Response(JSON.stringify({ error: "Lista non trovata" }), { status: 404, headers: corsHeaders });
          return new Response(JSON.stringify({ success: true, lista: result }), { headers: corsHeaders });
      }
      if (path === "/api/public/lista-regali/findByCredentials" && request.method === "GET") {
          const username = url.searchParams.get("username");
          const password = url.searchParams.get("password");
          if (!username || !password) return new Response(JSON.stringify({ error: "Parametri mancanti" }), { status: 400, headers: corsHeaders });
          const result = await env.DB.prepare("SELECT * FROM lista_regali WHERE username=? AND password=?").bind(username, password).first();
          if (!result) return new Response(JSON.stringify({ error: "Credenziali non valide" }), { status: 401, headers: corsHeaders });
          return new Response(JSON.stringify({ success: true, lista: result }), { headers: corsHeaders });
      }
      if (path === "/api/public/lista-regali/donazione" && request.method === "POST") {
          const d = await request.json();
          const id = 'don-' + Date.now();
          await env.DB.prepare(`INSERT INTO donazioni_lista (id, lista_id, nome_donatore, importo, data_donazione, data_registrazione) VALUES (?, ?, ?, ?, ?, ?)`).bind(
              id, d.lista_id, d.nome_donatore, parseFloat(d.importo), d.data_donazione, new Date().toISOString()
          ).run();
          const totalResult = await env.DB.prepare("SELECT COALESCE(SUM(importo), 0) as totale FROM donazioni_lista WHERE lista_id=?").bind(d.lista_id).first();
          await env.DB.prepare("UPDATE lista_regali SET raccolto_attuale=? WHERE id=?").bind(totalResult.totale, d.lista_id).run();
          return new Response(JSON.stringify({ success: true, id, totale: totalResult.totale }), { headers: corsHeaders });
      }
      if (path === "/api/public/lista-regali/donazioni" && request.method === "GET") {
          const listaId = url.searchParams.get("listaId");
          if (!listaId) return new Response(JSON.stringify({ error: "Parametro mancante" }), { status: 400, headers: corsHeaders });
          const result = await env.DB.prepare("SELECT * FROM donazioni_lista WHERE lista_id=? ORDER BY data_donazione DESC").bind(listaId).all();
          return new Response(JSON.stringify({ success: true, donazioni: result.results }), { headers: corsHeaders });
      }
      if (path.startsWith("/api/public/lista-regali/donazione/") && request.method === "DELETE") {
          const id = path.split("/api/public/lista-regali/donazione/")[1];
          const donazione = await env.DB.prepare("SELECT lista_id FROM donazioni_lista WHERE id=?").bind(id).first();
          if (donazione) {
              await env.DB.prepare("DELETE FROM donazioni_lista WHERE id=?").bind(id).run();
              const totalResult = await env.DB.prepare("SELECT COALESCE(SUM(importo), 0) as totale FROM donazioni_lista WHERE lista_id=?").bind(donazione.lista_id).first();
              await env.DB.prepare("UPDATE lista_regali SET raccolto_attuale=? WHERE id=?").bind(totalResult.totale, donazione.lista_id).run();
          }
          return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }
      if (path === "/api/public/lista-regali/messaggio" && request.method === "POST") {
          const d = await request.json();
          try {
              await env.DB.prepare(`INSERT INTO messaggi_regali (lista_id, nome_donatore, messaggio, importo, data) VALUES (?, ?, ?, ?, ?)`).bind(
                  d.lista_id, d.nome_donatore, d.messaggio, d.importo || 0, new Date().toISOString()
              ).run();
              return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
          } catch (error) {
              console.error('Errore inserimento messaggio:', error);
              return new Response(JSON.stringify({ error: "Errore nel salvataggio del messaggio", details: error.message }), { status: 500, headers: corsHeaders });
          }
      }
      if (path === "/api/public/lista-regali/messaggi" && request.method === "GET") {
          const listaId = url.searchParams.get("listaId");
          try {
              const result = await env.DB.prepare("SELECT * FROM messaggi_regali WHERE lista_id=? ORDER BY data DESC").bind(listaId).all();
              return new Response(JSON.stringify({ success: true, messaggi: result.results }), { headers: corsHeaders });
          } catch (error) {
              console.error('Errore lettura messaggi:', error);
              return new Response(JSON.stringify({ error: "Errore nella lettura dei messaggi" }), { status: 500, headers: corsHeaders });
          }
      }
      if (path === "/api/public/lista-regali/aggiorna-totale" && request.method === "POST") {
          const d = await request.json();
          try {
              const totalResult = await env.DB.prepare("SELECT COALESCE(SUM(importo), 0) as totale FROM messaggi_regali WHERE lista_id=?").bind(d.lista_id).first();
              await env.DB.prepare("UPDATE lista_regali SET raccolto_attuale=? WHERE id=?").bind(totalResult.totale, d.lista_id).run();
              return new Response(JSON.stringify({ success: true, totale: totalResult.totale }), { headers: corsHeaders });
          } catch (error) {
              console.error('Errore aggiornamento totale:', error);
              return new Response(JSON.stringify({ error: "Errore nell'aggiornamento del totale" }), { status: 500, headers: corsHeaders });
          }
      }

      // ============================================
      // UPLOAD, TEMI, PROFILO, LINK UTILI, GALLERIE, CONTRATTI, EMAIL, ANAGRAFICA, SELEZIONE ALBUM
      // ============================================
      if (path === "/api/studio/upload" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const body = await request.arrayBuffer();
        const bucket = env.appcenter_studio_foto;
        if (bucket) {
          const key = `gallerie/${url.searchParams.get("studioId")}/${url.searchParams.get("clienteId")}/${url.searchParams.get("folder") || "galleria"}/${Date.now()}_${url.searchParams.get("filename") || "foto.jpg"}`;
          await bucket.put(key, body);
          return new Response(JSON.stringify({ success: true, url: `https://appcenter-studio-foto.r2.dev/${key}` }), { headers: corsHeaders });
        }
        return new Response(JSON.stringify({ error: "Bucket non configurato" }), { status: 500, headers: corsHeaders });
      }

      if (path === "/api/studio/tema" && request.method === "GET") {
        const result = await env.DB.prepare("SELECT * FROM temi_colori WHERE studio_id=?").bind(url.searchParams.get("studioId")).first();
        return new Response(JSON.stringify({ success: true, tema: result }), { headers: corsHeaders });
      }
      if (path === "/api/studio/tema" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const d = await request.json();
        const existing = await env.DB.prepare("SELECT id FROM temi_colori WHERE studio_id=?").bind(d.studio_id).first();
        if (existing) await env.DB.prepare(`UPDATE temi_colori SET tema_attivo=? WHERE studio_id=?`).bind(d.tema_attivo, d.studio_id).run();
        else await env.DB.prepare(`INSERT INTO temi_colori (studio_id, tema_attivo) VALUES (?, ?)`).bind(d.studio_id, d.tema_attivo).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }
      if (path === "/api/admin/tema" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'admin') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const result = await env.DB.prepare("SELECT tema_attivo FROM temi_colori WHERE studio_id=?").bind('global').first();
        return new Response(JSON.stringify({ success: true, tema: { tema_attivo: result ? result.tema_attivo : 'default' } }), { headers: corsHeaders });
      }
      if (path === "/api/admin/tema" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'admin') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const d = await request.json();
        const existing = await env.DB.prepare("SELECT id FROM temi_colori WHERE studio_id=?").bind('global').first();
        if (existing) await env.DB.prepare(`UPDATE temi_colori SET tema_attivo=?, data_aggiornamento=? WHERE studio_id=?`).bind(d.tema_attivo, new Date().toISOString(), 'global').run();
        else await env.DB.prepare(`INSERT INTO temi_colori (studio_id, tema_attivo, data_aggiornamento) VALUES (?, ?, ?)`).bind('global', d.tema_attivo, new Date().toISOString()).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      if (path === "/api/studio/profilo" && request.method === "PUT") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const d = await request.json();
        const updates = []; const params = [];
        ['nome', 'piva', 'email', 'telefono', 'pec', 'sdi', 'indirizzo', 'cap', 'citta', 'provincia', 'stato', 'legale', 'cf_legale', 'iban', 'iban_intestato', 'msg_benvenuto', 'msg_ringraziamento', 'website', 'link_facebook', 'link_instagram', 'link_portfolio', 'logo_url'].forEach(field => {
            if (d[field] !== undefined) { updates.push(`${field}=?`); params.push(d[field]); }
        });
        if (updates.length > 0) {
          params.push(sess.user_id);
          await env.DB.prepare(`UPDATE studi SET ${updates.join(', ')} WHERE id=?`).bind(...params).run();
          await env.DB.prepare("UPDATE studi SET scheda_completata=1 WHERE id=?").bind(sess.user_id).run();
          await creaNotifica('scheda_studio_aggiornata', 'Scheda Studio Aggiornata', `Lo studio "${d.nome || sess.user_id}" ha aggiornato la sua scheda anagrafica.`, { studio_id: sess.user_id, studio_nome: d.nome || sess.user_id, ...d });
        }
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }
      if (path === "/api/studio/profilo" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const result = await env.DB.prepare("SELECT * FROM studi WHERE id=?").bind(url.searchParams.get("studioId") || sess.user_id).first();
        return new Response(JSON.stringify({ success: true, studio: result }), { headers: corsHeaders });
      }
      if (path === "/api/studio/upload-logo" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const studioId = url.searchParams.get("studioId");
        const body = await request.arrayBuffer();
        const bucket = env.appcenter_studio_foto;
        if (bucket) {
          await bucket.put(`loghi/${studioId}/${url.searchParams.get("filename") || "logo.png"}`, body);
          return new Response(JSON.stringify({ success: true, url: `${url.origin}/api/studio/logo?studioId=${encodeURIComponent(studioId)}&token=${encodeURIComponent(token)}` }), { headers: corsHeaders });
        }
        return new Response(JSON.stringify({ error: "Bucket non configurato" }), { status: 500, headers: corsHeaders });
      }
      if (path === "/api/admin/scheda-studio" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'admin') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const studioId = url.searchParams.get("studioId");
        if (!studioId) return new Response(JSON.stringify({ error: "Studio ID mancante" }), { status: 400, headers: corsHeaders });
        const result = await env.DB.prepare("SELECT * FROM studi WHERE id=?").bind(studioId).first();
        if (!result) return new Response(JSON.stringify({ error: "Studio non trovato" }), { status: 404, headers: corsHeaders });
        return new Response(JSON.stringify({ success: true, studio: result }), { headers: corsHeaders });
      }
      if (path === "/api/studio/logo" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const studioId = url.searchParams.get("studioId");
        if (!token || !studioId) return new Response(JSON.stringify({ error: "Parametri mancanti" }), { status: 400, headers: corsHeaders });
        const sess = await verificaSessione(token);
        if (!sess) return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const bucket = env.appcenter_studio_foto;
        if (!bucket) return new Response(JSON.stringify({ error: "Bucket non configurato" }), { status: 500, headers: corsHeaders });
        try {
          const object = await bucket.get(`loghi/${studioId}/logo.png`);
          if (!object) return new Response(JSON.stringify({ error: "Logo non trovato" }), { status: 404, headers: corsHeaders });
          return new Response(object.body, { headers: { "Content-Type": object.httpMetadata?.contentType || "image/png", "Cache-Control": "public, max-age=86400", "Access-Control-Allow-Origin": "*" } });
        } catch (error) {
          return new Response(JSON.stringify({ error: "Errore interno" }), { status: 500, headers: corsHeaders });
        }
      }

      if (path === "/api/studio/link-utili" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const result = await env.DB.prepare("SELECT * FROM link_utili WHERE studio_id=? ORDER BY data_creazione DESC").bind(sess.user_id).all();
        return new Response(JSON.stringify({ success: true, links: result.results }), { headers: corsHeaders });
      }
      if (path === "/api/studio/link-utili" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const d = await request.json();
        const linkId = 'link-' + Date.now();
        await env.DB.prepare(`INSERT INTO link_utili (id, studio_id, descrizione, url, data_creazione) VALUES (?, ?, ?, ?, ?)`).bind(linkId, sess.user_id, d.descrizione, d.url, new Date().toISOString()).run();
        return new Response(JSON.stringify({ success: true, id: linkId }), { headers: corsHeaders });
      }
      if (path.startsWith("/api/studio/link-utili/") && request.method === "DELETE") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const id = path.split("/api/studio/link-utili/")[1];
        await env.DB.prepare("DELETE FROM link_utili WHERE id=? AND studio_id=?").bind(id, sess.user_id).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      if (path === "/api/studio/gallerie" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const result = await env.DB.prepare("SELECT * FROM gallerie WHERE studio_id=? ORDER BY data_creazione DESC").bind(sess.user_id).all();
        return new Response(JSON.stringify({ success: true, gallerie: result.results }), { headers: corsHeaders });
      }
      if (path === "/api/studio/galleria" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const d = await request.json();
        const id = 'gal-' + Date.now();
        const linkPubblico = `https://cibox72.github.io/AppCenterStudioPROGOLD/galleria-cliente.html?id=${id}`;
        await env.DB.prepare(`INSERT INTO gallerie (id, studio_id, cliente_nome, cliente_email, cliente_telefono, tipo_evento, data_evento, messaggio_benvenuto, mega_email, mega_password, mega_link, stato, link_pubblico, data_creazione) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(id, sess.user_id, d.cliente_nome, d.cliente_email, d.cliente_telefono, d.tipo_evento, d.data_evento, d.messaggio_benvenuto, d.mega_email || '', d.mega_password || '', d.mega_link || '', d.stato || 'preparazione', linkPubblico, new Date().toISOString()).run();
        return new Response(JSON.stringify({ success: true, id: id, link_pubblico: linkPubblico }), { headers: corsHeaders });
      }
      if (path.startsWith("/api/studio/galleria/") && request.method === "PUT") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const id = path.split("/api/studio/galleria/")[1];
        const d = await request.json();
        const updates = []; const params = [];
        ['cliente_nome', 'cliente_email', 'cliente_telefono', 'tipo_evento', 'data_evento', 'messaggio_benvenuto', 'mega_email', 'mega_password', 'mega_link', 'stato', 'data_invio'].forEach(field => {
            if (d[field] !== undefined) { updates.push(`${field}=?`); params.push(d[field]); }
        });
        if (updates.length === 0) return new Response(JSON.stringify({ error: "Nessun campo da aggiornare" }), { status: 400, headers: corsHeaders });
        params.push(id);
        await env.DB.prepare(`UPDATE gallerie SET ${updates.join(', ')} WHERE id=?`).bind(...params).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }
      if (path.startsWith("/api/studio/galleria/") && request.method === "DELETE") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const id = path.split("/api/studio/galleria/")[1];
        await env.DB.prepare("DELETE FROM gallerie WHERE id=? AND studio_id=?").bind(id, sess.user_id).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }
      if (path === "/api/public/galleria" && request.method === "GET") {
        const result = await env.DB.prepare("SELECT * FROM gallerie WHERE id=?").bind(url.searchParams.get("id")).first();
        if (!result) return new Response(JSON.stringify({ error: "Galleria non trovata" }), { status: 404, headers: corsHeaders });
        return new Response(JSON.stringify({ success: true, galleria: result }), { headers: corsHeaders });
      }

      if (path === "/api/studio/contratti" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const result = await env.DB.prepare("SELECT * FROM contratti WHERE studio_id=? ORDER BY data_creazione DESC").bind(url.searchParams.get("studioId")).all();
        return new Response(JSON.stringify({ success: true, contratti: result.results }), { headers: corsHeaders });
      }
      if (path === "/api/studio/contratti" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const d = await request.json();
        await env.DB.prepare(`INSERT INTO contratti (id, studio_id, numero_contratto, numero, data_contratto, data_emissione, tipo_servizio, luogo_cerimonia, luogo_ricevimento, cliente_a, cliente_b, servizi, acconti, piano_pagamento, sconto_perc, sconto_fisso, sconto_fisso_nota, accettato, note, totale_finale, stato, data_creazione) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
          d.id, d.studio_id, d.numero_contratto || d.numero, d.numero, d.data_contratto || new Date().toISOString().split('T')[0], d.data_emissione, d.tipo_servizio || null, d.luogo_cerimonia || null, d.luogo_ricevimento || null,
          JSON.stringify(d.cliente_a || {}), JSON.stringify(d.cliente_b || {}), JSON.stringify(d.servizi || []), JSON.stringify(d.acconti || []), JSON.stringify(d.piano_pagamento || []),
          d.sconto_perc || 0, d.sconto_fisso || 0, d.sconto_fisso_nota || null,
          d.accettato ? 1 : 0, d.note || null, d.totale_finale || 0, d.stato || 'attivo',
          d.data_creazione || new Date().toISOString()
        ).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }
      if (path.startsWith("/api/studio/contratti/") && request.method === "PUT") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const id = path.split("/api/studio/contratti/")[1];
        const d = await request.json();
        if (d.acconti !== undefined) {
          await env.DB.prepare(`UPDATE contratti SET acconti=? WHERE id=?`).bind(JSON.stringify(d.acconti), id).run();
        }
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }
      if (path.startsWith("/api/studio/contratti/") && request.method === "DELETE") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const id = path.split("/api/studio/contratti/")[1];
        await env.DB.prepare("DELETE FROM contratti WHERE id = ? AND studio_id = ?").bind(id, sess.user_id).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      if (path === "/api/studio/email-config" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const result = await env.DB.prepare("SELECT * FROM email_config WHERE studio_id=?").bind(sess.user_id).first();
        return new Response(JSON.stringify({ success: true, config: result }), { headers: corsHeaders });
      }
      if (path === "/api/studio/email-config" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const d = await request.json();
        const existing = await env.DB.prepare("SELECT studio_id FROM email_config WHERE studio_id=?").bind(d.studio_id).first();
        if (existing) {
          await env.DB.prepare(`UPDATE email_config SET email_mittente=?, nome_studio=?, usa_client_esterno=? WHERE studio_id=?`).bind(d.email_mittente, d.nome_studio, d.usa_client_esterno, d.studio_id).run();
        } else {
          await env.DB.prepare(`INSERT INTO email_config (studio_id, email_mittente, nome_studio, usa_client_esterno) VALUES (?, ?, ?, ?)`).bind(d.studio_id, d.email_mittente, d.nome_studio, d.usa_client_esterno).run();
        }
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }
      if (path === "/api/studio/email-inbox" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const result = await env.DB.prepare("SELECT * FROM email_inbox WHERE studio_id=? ORDER BY data_ricezione DESC").bind(sess.user_id).all();
        return new Response(JSON.stringify({ success: true, inbox: result.results }), { headers: corsHeaders });
      }
      if (path === "/api/studio/email-inbox/read" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const d = await request.json();
        await env.DB.prepare("UPDATE email_inbox SET letta=1 WHERE id=? AND studio_id=?").bind(d.id, sess.user_id).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      if (path === "/api/public/galleria-by-email" && request.method === "GET") {
        const email = url.searchParams.get("email");
        if (!email) return new Response(JSON.stringify({ error: "Email mancante" }), { status: 400, headers: corsHeaders });
        const result = await env.DB.prepare("SELECT * FROM gallerie WHERE cliente_email=? ORDER BY data_creazione DESC LIMIT 1").bind(email).first();
        if (!result) return new Response(JSON.stringify({ success: true, galleria: null }), { headers: corsHeaders });
        return new Response(JSON.stringify({ success: true, galleria: result }), { headers: corsHeaders });
      }

      if (path === "/api/admin/archivia-notifica" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'admin') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const d = await request.json();
        await env.DB.prepare("UPDATE notifiche SET letto=1, archiviata=1 WHERE id=?").bind(d.notifica_id).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      if (path === "/api/admin/archivio-studi" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'admin') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const result = await env.DB.prepare("SELECT * FROM studi WHERE scheda_completata=1 ORDER BY data_registrazione DESC").all();
        return new Response(JSON.stringify({ success: true, studi: result.results }), { headers: corsHeaders });
      }

      if (path === "/api/studio/anagrafica-clienti" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const result = await env.DB.prepare("SELECT * FROM anagrafica_clienti WHERE studio_id=? ORDER BY CAST(SUBSTR(id, 5) AS INTEGER) ASC").bind(sess.user_id).all();
        return new Response(JSON.stringify({ success: true, clienti: result.results }), { headers: corsHeaders });
      }
      if (path === "/api/studio/anagrafica-clienti" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const d = await request.json();
        const id = await generaIdCliente(sess.user_id);
        const username = generaUsername(d.nome, d.cognome);
        const password = generaPassword();
        await env.DB.prepare(`INSERT INTO anagrafica_clienti (id, studio_id, nome, cognome, email, telefono, indirizzo, cap, citta, provincia, username, password, data_creazione, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
          id, sess.user_id, d.nome || '', d.cognome || '', d.email || '', d.telefono || '', d.indirizzo || '', d.cap || '', d.citta || '', d.provincia || '', username, password, new Date().toISOString(), d.note || ''
        ).run();
        return new Response(JSON.stringify({ success: true, cliente: { id, username, password } }), { headers: corsHeaders });
      }
      if (path === "/api/studio/anagrafica-clienti/ricerca" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const q = (url.searchParams.get("q") || '').toLowerCase();
        const result = await env.DB.prepare(
          "SELECT id, nome, cognome, email, telefono FROM anagrafica_clienti WHERE studio_id=? AND (LOWER(id) LIKE ? OR LOWER(nome) LIKE ? OR LOWER(cognome) LIKE ? OR LOWER(email) LIKE ?) ORDER BY cognome, nome LIMIT 20"
        ).bind(sess.user_id, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`).all();
        return new Response(JSON.stringify({ success: true, clienti: result.results }), { headers: corsHeaders });
      }
      if (path.startsWith("/api/studio/anagrafica-clienti/") && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const id = path.split("/api/studio/anagrafica-clienti/")[1];
        const result = await env.DB.prepare("SELECT * FROM anagrafica_clienti WHERE id=? AND studio_id=?").bind(id, sess.user_id).first();
        if (!result) return new Response(JSON.stringify({ error: "Cliente non trovato" }), { status: 404, headers: corsHeaders });
        return new Response(JSON.stringify({ success: true, cliente: result }), { headers: corsHeaders });
      }
      if (path.startsWith("/api/studio/anagrafica-clienti/") && request.method === "PUT") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const id = path.split("/api/studio/anagrafica-clienti/")[1];
        const d = await request.json();
        const updates = []; const params = [];
        ['nome', 'cognome', 'email', 'telefono', 'indirizzo', 'cap', 'citta', 'provincia', 'username', 'password', 'note'].forEach(field => {
            if (d[field] !== undefined) { updates.push(`${field}=?`); params.push(d[field]); }
        });
        if (updates.length === 0) return new Response(JSON.stringify({ error: "Nessun campo da aggiornare" }), { status: 400, headers: corsHeaders });
        params.push(id, sess.user_id);
        await env.DB.prepare(`UPDATE anagrafica_clienti SET ${updates.join(', ')} WHERE id=? AND studio_id=?`).bind(...params).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }
      if (path.startsWith("/api/studio/anagrafica-clienti/") && request.method === "DELETE") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const id = path.split("/api/studio/anagrafica-clienti/")[1];
        await env.DB.prepare("DELETE FROM anagrafica_clienti WHERE id=? AND studio_id=?").bind(id, sess.user_id).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      if (path === "/api/studio/selezione-album/elimina-cartella" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const d = await request.json();
        const bucket = env.appcenter_studio_foto;
        if (!bucket) return new Response(JSON.stringify({ error: "Bucket non configurato" }), { status: 500, headers: corsHeaders });
        const prefix = `selezioni/${sess.user_id}/${d.cliente_id}/${d.selezione_id}/${d.nome_cartella}/`;
        const objects = await bucket.list({ prefix });
        if (objects.objects.length > 0) await bucket.delete(objects.objects.map(obj => obj.key));
        return new Response(JSON.stringify({ success: true, eliminated: objects.objects.length }), { headers: corsHeaders });
      }

      if (path === "/api/studio/selezione-album/crea" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const d = await request.json();
        const cliente = await env.DB.prepare("SELECT * FROM anagrafica_clienti WHERE id=? AND studio_id=?").bind(d.cliente_id, sess.user_id).first();
        if (!cliente) return new Response(JSON.stringify({ error: "Cliente non trovato" }), { status: 404, headers: corsHeaders });
        const username = (cliente.nome || 'cl').substring(0, 2).toLowerCase() + Math.floor(10 + Math.random() * 90);
        const password = Math.random().toString(36).substring(2, 4).toUpperCase() + Math.floor(10 + Math.random() * 90);
        const id = 'sel-' + Date.now();
        const dataCreazione = new Date().toISOString();
        const dataScadenza = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        await env.DB.prepare("INSERT INTO selezioni_album (id, studio_id, cliente_id, cliente_nome, username, password, stato, data_creazione, data_scadenza) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(id, sess.user_id, d.cliente_id, d.cliente_nome || '', username, password, 'in_attesa', dataCreazione, dataScadenza).run();
        return new Response(JSON.stringify({ success: true, id, username, password, link: `https://cibox72.github.io/AppCenterStudioPROGOLD/selezione-album-cliente.html?id=${id}&token=${token}`, scadenza: dataScadenza }), { headers: corsHeaders });
      }

      if (path === "/api/studio/selezione-album/upload-cartella" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const formData = await request.formData();
        const bucket = env.appcenter_studio_foto;
        if (!bucket) return new Response(JSON.stringify({ error: "Bucket non configurato" }), { status: 500, headers: corsHeaders });
        const prefix = `selezioni/${sess.user_id}/${formData.get('cliente_id')}/${formData.get('selezione_id')}/${formData.get('nome_cartella')}/`;
        let uploadCount = 0;
        for (const file of formData.getAll('files')) {
          try {
            await bucket.put(prefix + file.name, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });
            uploadCount++;
          } catch (e) { console.error('Errore upload file:', e); }
        }
        return new Response(JSON.stringify({ success: true, uploaded: uploadCount }), { headers: corsHeaders });
      }

      if (path === "/api/studio/selezione-album/upload-file" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const formData = await request.formData();
        const file = formData.get('file');
        if (!file) return new Response(JSON.stringify({ error: "Nessun file ricevuto" }), { status: 400, headers: corsHeaders });
        const bucket = env.appcenter_studio_foto;
        if (!bucket) return new Response(JSON.stringify({ error: "Bucket non configurato" }), { status: 500, headers: corsHeaders });
        const key = `selezioni/${sess.user_id}/${formData.get('cliente_id')}/${formData.get('selezione_id')}/${formData.get('nome_cartella') || 'Singoli_File'}/${file.name}`;
        await bucket.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });
        return new Response(JSON.stringify({ success: true, filename: file.name }), { headers: corsHeaders });
      }

      if (path === "/api/public/selezione-album/cartelle" && request.method === "GET") {
        const selezioneId = url.searchParams.get("id");
        const username = url.searchParams.get("username");
        const password = url.searchParams.get("password");
        if (!selezioneId || !username || !password) return new Response(JSON.stringify({ error: "Parametri mancanti" }), { status: 400, headers: corsHeaders });
        const selezione = await env.DB.prepare("SELECT * FROM selezioni_album WHERE id=? AND username=? AND password=?").bind(selezioneId, username, password).first();
        if (!selezione) return new Response(JSON.stringify({ error: "Credenziali non valide" }), { status: 401, headers: corsHeaders });
        if (new Date(selezione.data_scadenza) < new Date()) return new Response(JSON.stringify({ error: "Link scaduto" }), { status: 410, headers: corsHeaders });
        const bucket = env.appcenter_studio_foto;
        if (!bucket) return new Response(JSON.stringify({ error: "Bucket non configurato" }), { status: 500, headers: corsHeaders });
        const prefix = `selezioni/${selezione.studio_id}/${selezione.cliente_id}/${selezioneId}/`;
        const objects = await bucket.list({ prefix });
        const cartelle = new Set();
        for (const obj of objects.objects || []) {
          const parts = obj.key.replace(prefix, '').split('/');
          if (parts.length >= 2 && parts[0]) cartelle.add(parts[0]);
        }
        return new Response(JSON.stringify({ success: true, cartelle: Array.from(cartelle), cliente_nome: selezione.cliente_nome }), { headers: corsHeaders });
      }

      if (path === "/api/public/selezione-album/foto" && request.method === "GET") {
        const selezioneId = url.searchParams.get("id");
        const username = url.searchParams.get("username");
        const password = url.searchParams.get("password");
        const cartella = url.searchParams.get("cartella");
        if (!selezioneId || !username || !password || !cartella) return new Response(JSON.stringify({ error: "Parametri mancanti" }), { status: 400, headers: corsHeaders });
        const selezione = await env.DB.prepare("SELECT * FROM selezioni_album WHERE id=? AND username=? AND password=?").bind(selezioneId, username, password).first();
        if (!selezione) return new Response(JSON.stringify({ error: "Credenziali non valide" }), { status: 401, headers: corsHeaders });
        if (new Date(selezione.data_scadenza) < new Date()) return new Response(JSON.stringify({ error: "Link scaduto" }), { status: 410, headers: corsHeaders });
        const bucket = env.appcenter_studio_foto;
        if (!bucket) return new Response(JSON.stringify({ error: "Bucket non configurato" }), { status: 500, headers: corsHeaders });
        const prefix = `selezioni/${selezione.studio_id}/${selezione.cliente_id}/${selezioneId}/${cartella}/`;
        const objects = await bucket.list({ prefix });
        const foto = [];
        for (const obj of objects.objects || []) {
          if (obj.key.endsWith('/') || obj.key.endsWith('.txt')) continue;
          foto.push({ name: obj.key.split('/').pop(), url: `https://pub-ad933887e7ef48509bbb7dfcf60b14d6.r2.dev/${obj.key}`, key: obj.key });
        }
        return new Response(JSON.stringify({ success: true, foto: foto }), { headers: corsHeaders });
      }

      if (path === "/api/public/selezione-album/invia" && request.method === "POST") {
        const d = await request.json();
        if (!d.selezione_id || !d.username || !d.password) return new Response(JSON.stringify({ error: "Parametri mancanti" }), { status: 400, headers: corsHeaders });
        const selezione = await env.DB.prepare("SELECT * FROM selezioni_album WHERE id=? AND username=? AND password=?").bind(d.selezione_id, d.username, d.password).first();
        if (!selezione) return new Response(JSON.stringify({ error: "Credenziali non valide" }), { status: 401, headers: corsHeaders });
        const bucket = env.appcenter_studio_foto;
        if (!bucket) return new Response(JSON.stringify({ error: "Bucket non configurato" }), { status: 500, headers: corsHeaders });
        const prefix = `selezioni/${selezione.studio_id}/${selezione.cliente_id}/${d.selezione_id}/`;
        const preferitiKeys = new Set((d.preferiti || []).map(p => p.key));
        const allObjects = await bucket.list({ prefix });
        let fileTestoContenuto = `SELEZIONE FOTO - ${selezione.cliente_nome || 'Cliente'}\nID Cliente: ${selezione.cliente_id}\nData selezione: ${new Date().toLocaleString('it-IT')}\nUsername: ${d.username}\n\nTOTALE FOTO SELEZIONATE: ${d.preferiti ? d.preferiti.length : 0}\n\n----------------------------------------\nELENCO FILE PREFERITI:\n----------------------------------------\n\n`;
        let eliminatedCount = 0, keptCount = 0;
        for (const obj of allObjects.objects) {
          if (obj.key.endsWith('.txt')) continue;
          if (preferitiKeys.has(obj.key)) {
            fileTestoContenuto += `[${obj.key.replace(prefix, '').split('/')[0]}] ${obj.key.split('/').pop()}\n`;
            keptCount++;
          } else {
            await bucket.delete(obj.key);
            eliminatedCount++;
          }
        }
        fileTestoContenuto += `\n----------------------------------------\nRIEPILOGO:\nFoto selezionate: ${keptCount}\nFoto eliminate: ${eliminatedCount}\n----------------------------------------\n`;
        await bucket.put(prefix + `SELEZIONE_${new Date().toISOString().replace(/[:.]/g, '-')}.txt`, fileTestoContenuto, { httpMetadata: { contentType: 'text/plain' } });
        await env.DB.prepare("UPDATE selezioni_album SET stato='selezione_ricevuta', data_selezione=? WHERE id=?").bind(new Date().toISOString(), d.selezione_id).run();
        await creaNotifica('selezione_album', 'Nuova Selezione Album Ricevuta', `Il cliente ${selezione.cliente_nome || selezione.cliente_id} ha completato la selezione. Foto selezionate: ${keptCount}`, { selezione_id: d.selezione_id, studio_id: selezione.studio_id, cliente_id: selezione.cliente_id });
        return new Response(JSON.stringify({ success: true, kept: keptCount, eliminated: eliminatedCount }), { headers: corsHeaders });
      }

      if (path === "/api/studio/selezioni-album" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const result = await env.DB.prepare("SELECT * FROM selezioni_album WHERE studio_id=? ORDER BY data_creazione DESC").bind(sess.user_id).all();
        return new Response(JSON.stringify({ success: true, selezioni: result.results }), { headers: corsHeaders });
      }

      if (path === "/api/studio/selezione-album/cartelle-debug" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const selezioneId = url.searchParams.get("id");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const selezione = await env.DB.prepare("SELECT * FROM selezioni_album WHERE id=? AND studio_id=?").bind(selezioneId, sess.user_id).first();
        if (!selezione) return new Response(JSON.stringify({ error: "Selezione non trovata" }), { status: 404, headers: corsHeaders });
        const bucket = env.appcenter_studio_foto;
        const prefix = `selezioni/${selezione.studio_id}/${selezione.cliente_id}/${selezioneId}/`;
        const objects = await bucket.list({ prefix });
        return new Response(JSON.stringify({ success: true, prefix: prefix, totalObjects: objects.objects.length, objects: objects.objects.map(obj => ({ key: obj.key, size: obj.size })) }), { headers: corsHeaders });
      }

      if (path === "/api/studio/selezione-album/scarica" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const d = await request.json();
        const selezione = await env.DB.prepare("SELECT * FROM selezioni_album WHERE id=? AND studio_id=?").bind(d.selezione_id, sess.user_id).first();
        if (!selezione) return new Response(JSON.stringify({ error: "Selezione non trovata" }), { status: 404, headers: corsHeaders });
        const bucket = env.appcenter_studio_foto;
        if (!bucket) return new Response(JSON.stringify({ error: "Bucket non configurato" }), { status: 500, headers: corsHeaders });
        const prefix = `selezioni/${selezione.studio_id}/${selezione.cliente_id}/${d.selezione_id}/`;
        const objects = await bucket.list({ prefix });
        const files = [];
        for (const obj of objects.objects) {
          if (obj.key.endsWith('.txt')) {
            const content = await bucket.get(obj.key);
            files.push({ name: obj.key.split('/').pop(), type: 'txt', content: await content.text(), url: `https://appcenter-studio-foto.r2.dev/${obj.key}` });
          } else {
            files.push({ name: obj.key.split('/').pop(), type: 'image', url: `https://appcenter-studio-foto.r2.dev/${obj.key}` });
          }
        }
        const dataEliminazione = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        await env.DB.prepare("UPDATE selezioni_album SET stato='scaricata', data_scaricamento=?, data_eliminazione=? WHERE id=?").bind(new Date().toISOString(), dataEliminazione, d.selezione_id).run();
        return new Response(JSON.stringify({ success: true, files, cliente_nome: selezione.cliente_nome }), { headers: corsHeaders });
      }

      if (path === "/api/studio/selezione-album/elimina" && request.method === "DELETE") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const d = await request.json();
        const selezione = await env.DB.prepare("SELECT * FROM selezioni_album WHERE id=? AND studio_id=?").bind(d.selezione_id, sess.user_id).first();
        if (!selezione) return new Response(JSON.stringify({ error: "Selezione non trovata" }), { status: 404, headers: corsHeaders });
        const bucket = env.appcenter_studio_foto;
        if (bucket) {
          const prefix = `selezioni/${selezione.studio_id}/${selezione.cliente_id}/${d.selezione_id}/`;
          const objects = await bucket.list({ prefix });
          if (objects.objects.length > 0) await bucket.delete(objects.objects.map(obj => obj.key));
        }
        await env.DB.prepare("DELETE FROM selezioni_album WHERE id=?").bind(d.selezione_id).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      if (path === "/api/studio/selezioni-album/notifiche" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const result = await env.DB.prepare("SELECT * FROM notifiche WHERE tipo='selezione_album' AND dati LIKE ? AND letto=0 ORDER BY data_creazione DESC").bind(`%"studio_id":"${sess.user_id}"%`).all();
        return new Response(JSON.stringify({ success: true, notifiche: result.results, count: result.results.length }), { headers: corsHeaders });
      }

      if (path === "/api/studio/selezione-album/notifica/letta" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const d = await request.json();
        await env.DB.prepare("UPDATE notifiche SET letto=1 WHERE id=?").bind(d.notifica_id).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      if (path === "/api/admin/selezioni-album/pulizia" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'admin') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const now = new Date().toISOString();
        const bucket = env.appcenter_studio_foto;
        const daEliminare = await env.DB.prepare("SELECT * FROM selezioni_album WHERE stato='scaricata' AND data_eliminazione < ?").bind(now).all();
        let eliminatedCount = 0;
        for (const sel of daEliminare.results || []) {
          if (bucket) {
            const prefix = `selezioni/${sel.studio_id}/${sel.cliente_id}/${sel.id}/`;
            const objects = await bucket.list({ prefix });
            if (objects.objects.length > 0) {
              await bucket.delete(objects.objects.map(obj => obj.key));
              eliminatedCount += objects.objects.length;
            }
          }
          await env.DB.prepare("UPDATE selezioni_album SET stato='eliminata' WHERE id=?").bind(sel.id).run();
        }
        return new Response(JSON.stringify({ success: true, eliminated: eliminatedCount, count: daEliminare.results.length }), { headers: corsHeaders });
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
